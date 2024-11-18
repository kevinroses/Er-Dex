import { PublicKey, VersionedTransaction, Transaction } from '@solana/web3.js'
import {
  TxVersion,
  txToBase64,
  SOL_INFO,
  CurveCalculator,
  ApiV3PoolInfoStandardItemCpmm,
  CpmmKeys,
  CpmmRpcData
} from '@/raydium-io/raydium-sdk-v2'
import { createStore, useAppStore, useTokenStore } from '@/store'
import { toastSubject } from '@/hooks/toast/useGlobalToast'
import { txStatusSubject, TOAST_DURATION } from '@/hooks/toast/useTxStatus'
import { ApiSwapV1OutSuccess } from './type'
import { isSolWSol } from '@/utils/token'
import axios from '@/api/axios'
import { getTxMeta } from './swapMeta'
import { formatLocaleStr } from '@/utils/numberish/formatter'
import { getMintSymbol } from '@/utils/token'
import Decimal from 'decimal.js'
import { TxCallbackProps } from '@/types/tx'
import i18n from '@/i18n'
import { fetchComputePrice } from '@/utils/tx/computeBudget'
import { trimTailingZero } from '@/utils/numberish/formatter'
import { getDefaultToastData, handleMultiTxToast } from '@/hooks/toast/multiToastUtil'
import { handleMultiTxRetry } from '@/hooks/toast/retryTx'
import { isSwapSlippageError } from '@/utils/tx/swapError'
import { TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { CREATE_CPMM_POOL_PROGRAM, DEV_CREATE_CPMM_POOL_PROGRAM } from '@/raydium-io/raydium-sdk-v2'
import { BN } from 'bn.js'

const getSwapComputePrice = async () => {
  const transactionFee = useAppStore.getState().getPriorityFee()
  if (isNaN(parseFloat(String(transactionFee) || ''))) {
    const json = await fetchComputePrice()
    const { avg } = json?.[15] ?? {}
    if (!avg) return undefined
    return {
      units: 600000,
      microLamports: avg
    }
  }
  return {
    units: 600000,
    microLamports: new Decimal(transactionFee as string)
      .mul(10 ** SOL_INFO.decimals)
      .toDecimalPlaces(0)
      .toNumber()
  }
}

interface SwapStore {
  slippage: number
  swapTokenAct: (
    props: { swapResponse: ApiSwapV1OutSuccess; wrapSol?: boolean; unwrapSol?: boolean; onCloseToast?: () => void } & TxCallbackProps
  ) => Promise<string | string[] | undefined>
  unWrapSolAct: (props: { amount: string; onClose?: () => void; onSent?: () => void; onError?: () => void }) => Promise<string | undefined>
  wrapSolAct: (amount: string) => Promise<string | undefined>
}

export interface ComputeParams {
  inputMint: string
  outputMint: string
  amount: string
}

export const SWAP_SLIPPAGE_KEY = '_r_swap_slippage_'
const initSwapState = {
  slippage: 0.005
}

export const useSwapStore = createStore<SwapStore>(
  () => ({
    ...initSwapState,

    swapTokenAct: async ({ swapResponse, wrapSol, unwrapSol = false, onCloseToast, ...txProps }) => {
      console.log(swapResponse)
      const { publicKey, raydium, txVersion, connection, signAllTransactions, urlConfigs } = useAppStore.getState()
      if (!raydium || !connection) {
        console.error('no connection')
        return
      }
      if (!publicKey || !signAllTransactions) {
        console.error('no wallet')
        return
      }
      const isV0Tx = txVersion === TxVersion.V0

      console.log(`isV0Tx: ${isV0Tx}`)
      const VALID_PROGRAM_ID = new Set([CREATE_CPMM_POOL_PROGRAM.toBase58(), DEV_CREATE_CPMM_POOL_PROGRAM.toBase58()])
      console.log(VALID_PROGRAM_ID)

      const isValidCpmm = (id: string) => VALID_PROGRAM_ID.has(id)

      try {
        const tokenMap = useTokenStore.getState().tokenMap
        const [inputToken, outputToken] = [tokenMap.get(swapResponse.data.inputMint)!, tokenMap.get(swapResponse.data.outputMint)!]
        const [isInputSol, isOutputSol] = [isSolWSol(swapResponse.data.inputMint), isSolWSol(swapResponse.data.outputMint)]

        const inputTokenAcc = await raydium.account.getCreatedTokenAccount({
          programId: new PublicKey(inputToken.programId ?? TOKEN_PROGRAM_ID),
          mint: new PublicKey(inputToken.address),
          associatedOnly: false
        })

        if (!inputTokenAcc && !isInputSol) {
          console.error('no input token acc')
          return
        }

        const outputTokenAcc = await raydium.account.getCreatedTokenAccount({
          programId: new PublicKey(outputToken.programId ?? TOKEN_PROGRAM_ID),
          mint: new PublicKey(outputToken.address)
        })

        // const poolId = 'HwVzy98cA7rubRERPronMdgpQUsVNsZUFxGVX6QkD8xj'
        // const inputAmount = new BN(1000000)
        // const inputMint = NATIVE_MINT.toBase58()
        const data = swapResponse.data
        const { inputAmount: amount, routePlan } = data
        if (routePlan.length > 0) {
          const { inputMint, outputMint, poolId } = routePlan[0]
          const inputAmount = new BN(amount)
          let poolInfo: ApiV3PoolInfoStandardItemCpmm
          let poolKeys: CpmmKeys | undefined
          let rpcData: CpmmRpcData

          if (raydium.cluster === 'mainnet') {
            // note: api doesn't support get devnet pool info, so in devnet else we go rpc method
            // if you wish to get pool info from rpc, also can modify logic to go rpc method directly
            const data = await raydium.api.fetchPoolById({ ids: poolId })
            poolInfo = data[0] as ApiV3PoolInfoStandardItemCpmm
            if (!isValidCpmm(poolInfo.programId)) throw new Error('target pool is not CPMM pool')
            rpcData = await raydium.cpmm.getRpcPoolInfo(poolInfo.id, true)
          } else {
            const data = await raydium.cpmm.getPoolInfoFromRpc(poolId)
            poolInfo = data.poolInfo
            poolKeys = data.poolKeys
            rpcData = data.rpcData
          }

          if (inputMint !== poolInfo.mintA.address && inputMint !== poolInfo.mintB.address)
            throw new Error('input mint does not match pool')

          const baseIn = inputMint === poolInfo.mintA.address

          // swap pool mintA for mintB
          const swapResult = CurveCalculator.swap(
            inputAmount,
            baseIn ? rpcData.baseReserve : rpcData.quoteReserve,
            baseIn ? rpcData.quoteReserve : rpcData.baseReserve,
            rpcData.configInfo!.tradeFeeRate
          )

          /**
           * swapResult.sourceAmountSwapped -> input amount
           * swapResult.destinationAmountSwapped -> output amount
           * swapResult.tradeFee -> this swap fee, charge input mint
           */

          const { execute, transaction } = await raydium.cpmm.swap({
            poolInfo,
            poolKeys,
            inputAmount,
            swapResult,
            slippage: 0.05, // range: 1 ~ 0.0001, means 100% ~ 0.01%
            baseIn,
            txVersion
            // optional: set up priority fee here
            // computeBudgetConfig: {
            //   units: 600000,
            //   microLamports: 10000000,
            // },
          })
          const recentBlockhash = await connection.getLatestBlockhash('confirmed')

          // don't want to wait confirm, set sendAndConfirm to false or don't pass any params to execute
          // const { txId } = await execute({ sendAndConfirm: true })

          // const swapTransactions = data || []
          // const allTxBuf = swapTransactions.map((tx) => Buffer.from(tx.transaction, 'base64'))
          // const allTx = allTxBuf.map((txBuf) => (isV0Tx ? VersionedTransaction.deserialize(txBuf) : Transaction.from(txBuf)))

          const signedTxs = await signAllTransactions([transaction])

          console.log('simulate tx string:', signedTxs.map(txToBase64))

          const txLength = signedTxs.length
          const { toastId, handler } = getDefaultToastData({
            txLength,
            ...txProps
          })

          const swapMeta = getTxMeta({
            action: 'swap',
            values: {
              amountA: formatLocaleStr(
                new Decimal(swapResponse.data.inputAmount).div(10 ** (inputToken.decimals || 0)).toString(),
                inputToken.decimals
              )!,
              symbolA: getMintSymbol({ mint: inputToken, transformSol: wrapSol }),
              amountB: formatLocaleStr(
                new Decimal(swapResponse.data.outputAmount).div(10 ** (outputToken.decimals || 0)).toString(),
                outputToken.decimals
              )!,
              symbolB: getMintSymbol({ mint: outputToken, transformSol: unwrapSol })
            }
          })

          const processedId: {
            txId: string
            status: 'success' | 'error' | 'sent'
            signedTx: Transaction | VersionedTransaction
          }[] = []

          const getSubTxTitle = (idx: number) => {
            return idx === 0
              ? 'transaction_history.set_up'
              : idx === processedId.length - 1 && processedId.length > 2
              ? 'transaction_history.clean_up'
              : 'transaction_history.name_swap'
          }

          let i = 0
          const checkSendTx = async (): Promise<void> => {
            if (!signedTxs[i]) return
            const tx = signedTxs[i]
            const txId = !isV0Tx
              ? await connection.sendRawTransaction(tx.serialize(), { skipPreflight: true, maxRetries: 0 })
              : await connection.sendTransaction(tx as VersionedTransaction, { skipPreflight: true, maxRetries: 0 })
            processedId.push({ txId, signedTx: tx, status: 'sent' })

            if (signedTxs.length === 1) {
              txStatusSubject.next({
                txId,
                ...swapMeta,
                signedTx: tx,
                onClose: onCloseToast,
                isSwap: true,
                mintInfo: [inputToken, outputToken],
                ...txProps
              })
              return
            }
            let timeout = 0
            const subId = connection.onSignature(
              txId,
              (signatureResult) => {
                timeout && window.clearTimeout(timeout)
                const targetTxIdx = processedId.findIndex((tx) => tx.txId === txId)
                if (targetTxIdx > -1) processedId[targetTxIdx].status = signatureResult.err ? 'error' : 'success'
                handleMultiTxRetry(processedId)
                const isSlippageError = isSwapSlippageError(signatureResult)
                handleMultiTxToast({
                  toastId,
                  processedId: processedId.map((p) => ({ ...p, status: p.status === 'sent' ? 'info' : p.status })),
                  txLength,
                  meta: {
                    ...swapMeta,
                    title: isSlippageError ? i18n.t('error.error.swap_slippage_error_title')! : swapMeta.title,
                    description: isSlippageError ? i18n.t('error.error.swap_slippage_error_desc')! : swapMeta.description
                  },
                  isSwap: true,
                  handler,
                  getSubTxTitle,
                  onCloseToast
                })
                if (!signatureResult.err) checkSendTx()
              },
              'processed'
            )
            connection.getSignatureStatuses([txId])
            handleMultiTxRetry(processedId)
            handleMultiTxToast({
              toastId,
              processedId: processedId.map((p) => ({ ...p, status: p.status === 'sent' ? 'info' : p.status })),
              txLength,
              meta: swapMeta,
              isSwap: true,
              handler,
              getSubTxTitle,
              onCloseToast
            })

            timeout = window.setTimeout(() => {
              connection.removeSignatureListener(subId)
            }, TOAST_DURATION)

            i++
          }
          checkSendTx()
        }
      } catch (e: any) {
        txProps.onError?.()
        if (e.message !== 'tx failed') toastSubject.next({ txError: e })
      } finally {
        txProps.onFinally?.()
      }
      return ''
    },

    unWrapSolAct: async ({ amount, onSent, onError, ...txProps }): Promise<string | undefined> => {
      const raydium = useAppStore.getState().raydium
      if (!raydium) return
      const { execute } = await raydium.tradeV2.unWrapWSol({
        amount
        // computeBudgetConfig: await getComputeBudgetConfig()
      })

      const values = { amount: trimTailingZero(new Decimal(amount).div(10 ** SOL_INFO.decimals).toFixed(SOL_INFO.decimals)) }
      const meta = {
        title: i18n.t('swap.unwrap_all_wsol', values),
        description: i18n.t('swap.unwrap_all_wsol_desc', values),
        txHistoryTitle: 'swap.unwrap_all_wsol',
        txHistoryDesc: 'swap.unwrap_all_wsol_desc',
        txValues: values
      }

      return execute()
        .then(({ txId, signedTx }) => {
          onSent?.()
          txStatusSubject.next({ txId, signedTx, ...meta, ...txProps })
          return txId
        })
        .catch((e) => {
          onError?.()
          toastSubject.next({ txError: e, ...meta })
          return ''
        })
    },

    wrapSolAct: async (amount: string): Promise<string | undefined> => {
      const raydium = useAppStore.getState().raydium
      if (!raydium) return
      const { execute } = await raydium.tradeV2.wrapWSol(new Decimal(amount).mul(10 ** SOL_INFO.decimals).toFixed(0))
      return execute()
        .then(({ txId, signedTx }) => {
          txStatusSubject.next({ txId, signedTx })
          return txId
        })
        .catch((e) => {
          toastSubject.next({ txError: e })
          return ''
        })
    }
  }),
  'useSwapStore'
)
