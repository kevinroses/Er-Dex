import { ReactNode, useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Box, Grid, GridItem, HStack, Text, TooltipProps, VStack } from '@chakra-ui/react'
import { ApiV3PoolInfoStandardItem, ApiV3Token, TokenInfo, CREATE_CPMM_POOL_PROGRAM } from '@/raydium-io/raydium-sdk-v2'
import Decimal from 'decimal.js'

import Tabs, { TabItem } from '@/components/Tabs'
import useFetchPoolById from '@/hooks/pool/useFetchPoolById'
import useFarmPositions from '@/hooks/portfolio/farm/useFarmPositions'
import { useEvent } from '@/hooks/useEvent'
import ChevronLeftIcon from '@/icons/misc/ChevronLeftIcon'
import { useTokenAccountStore } from '@/store/useTokenAccountStore'
import { panelCard } from '@/theme/cssBlocks'
import { colors } from '@/theme/cssVariables'
import { routeBack, setUrlQuery, useRouteQuery } from '@/utils/routeTools'
import { wsolToSolToken } from '@/utils/token'
import useFetchRpcPoolData from '@/hooks/pool/amm/useFetchRpcPoolData'
import useFetchCpmmRpcPoolData from '@/hooks/pool/amm/useFetchCpmmRpcPoolData'
import { LiquidityActionModeType, LiquidityTabOptionType, tabValueModeMapping } from '../utils'
import AddLiquidity from './Add'
import Stake from './Stake'
import PoolInfo from './components/PoolInfo'
import PositionBalance from './components/PositionBalance'
import StakeableHint from './components/StakeableHint'
import useFetchFarmByLpMint from '@/hooks/farm/useFetchFarmByLpMint'

export type IncreaseLiquidityPageQuery = {
  pool_id?: string
  action?: string
  mode?: LiquidityActionModeType
}

export type IncreaseTabOptionType = {
  value: 'Add Liquidity' | 'Stake Liquidity'
  label: ReactNode
  disabled?: boolean
  tooltipProps?: Omit<TooltipProps, 'children'>
}

export default function Increase() {
  const { pool_id: urlPoolId, mode: urlMode } = useRouteQuery<IncreaseLiquidityPageQuery>()
  const { t } = useTranslation()

  const increaseTabOptions: IncreaseTabOptionType[] = [
    { value: 'Add Liquidity', label: t('liquidity.add_liquidity') },
    { value: 'Stake Liquidity', label: t('liquidity.stake_liquidity') }
  ]
  const getTokenBalanceUiAmount = useTokenAccountStore((s) => s.getTokenBalanceUiAmount)
  const fetchTokenAccountAct = useTokenAccountStore((s) => s.fetchTokenAccountAct)
  const { lpBasedData } = useFarmPositions({})

  const [tokenPair, setTokenPair] = useState<{ base?: ApiV3Token; quote?: ApiV3Token }>({})

  const { formattedData, isLoading, mutate } = useFetchPoolById<ApiV3PoolInfoStandardItem>({
    shouldFetch: Boolean(urlPoolId),
    idList: [urlPoolId]
  })
  const pool = formattedData?.[0]

  const isCpmm = pool && pool.programId === CREATE_CPMM_POOL_PROGRAM.toBase58()
  const { data: rpcAmmData, mutate: mutateAmm } = useFetchRpcPoolData({
    shouldFetch: !isCpmm,
    poolId: pool?.id
  })

  const { data: rpcCpmmData, mutate: mutateCpmm } = useFetchCpmmRpcPoolData({
    shouldFetch: isCpmm,
    poolId: pool?.id
  })

  const rpcData = isCpmm ? rpcCpmmData : rpcAmmData
  const mutateRpc = isCpmm ? mutateCpmm : mutateAmm

  const { formattedData: farms } = useFetchFarmByLpMint({
    shouldFetch: !!pool && pool.farmOngoingCount === 0,
    poolLp: pool?.lpMint.address
  })
  const isPoolNotFound = !!tokenPair.base && !!tokenPair.quote && !isLoading && !pool

  const lpBalance = getTokenBalanceUiAmount({
    mint: pool?.lpMint.address || '',
    decimals: pool?.lpMint.decimals
  })

  const stakedData = new Decimal(pool ? lpBasedData.get(pool.lpMint.address)?.totalLpAmount || '0' : '0')
    .div(10 ** (pool?.lpMint.decimals ?? 0))
    .toString()
  const hasFarmInfo = pool ? pool.farmOngoingCount > 0 || !!farms.find((f) => f.isOngoing) : false

  increaseTabOptions[1].disabled = !hasFarmInfo
  increaseTabOptions[1].tooltipProps = !hasFarmInfo ? { label: t('liquidity.no_active_farm'), hasArrow: false } : undefined

  const [tabOptions, setTabOptions] = useState<TabItem[]>([])
  const [tabValue, setTabValue] = useState<LiquidityTabOptionType | undefined>(undefined)

  const [mode, setMode] = useState<LiquidityActionModeType>('add')

  const handleRefresh = useEvent(() => {
    mutate()
    fetchTokenAccountAct({})
  })

  const handleSelectToken = useCallback((token: TokenInfo | ApiV3Token, side: 'base' | 'quote') => {
    setTokenPair((pair) => {
      const anotherSide = side === 'base' ? 'quote' : 'base'

      return {
        [anotherSide]: pair[anotherSide]?.address === token.address ? undefined : pair[anotherSide],
        [side]: token.address
      }
    })
  }, [])

  useEffect(() => {
    if (!urlMode) {
      setUrlQuery({ mode: 'add' })
      return
    }
    setTabValue(urlMode === 'stake' ? 'Stake Liquidity' : 'Add Liquidity')
    if (urlMode != mode) {
      setMode(urlMode)
    }
  }, [urlMode])

  useEffect(() => {
    setTabOptions(increaseTabOptions)
  }, [hasFarmInfo])

  /** set default token pair onMount */
  useEffect(() => {
    if (!pool) return
    setTokenPair({
      base: wsolToSolToken(pool.mintA),
      quote: wsolToSolToken(pool.mintB)
    })
  }, [pool])

  useEffect(() => {
    if (!urlPoolId) setUrlQuery({ pool_id: 'AVs9TA4nWDzfPJE9gGVNJMVhcQy3V9PGazuz33BfG2RA' })
  }, [urlPoolId])

  const handleTabChange = useEvent((value: LiquidityTabOptionType) => {
    setTabValue(value)
    setUrlQuery({ mode: tabValueModeMapping[value] })
  })

  return (
    <>
      <Grid 
        gridTemplate={[
        `
         "back" auto
         "main" auto 
         "right" auto/ 1fr
       `,
        `
         "back back" auto 
         "main right" auto/ 2fr 1fr
       `,
       `
         "back back" auto 
         "main right" auto/ 2fr 1fr
       `,
        ]}
        rowGap={[4, 20]}
        columnGap={[20]}
        mt={[2, 15]}
      >
        {/* left */}
        <GridItem area={"back"}>
          <HStack
            onClick={() => {
              routeBack()
            }}
            cursor="pointer"
            color={"white"}
            _hover={{ color: colors.textSecondary }}
          >
            <ChevronLeftIcon />
            <Text fontWeight="500" fontSize={['md', 'xl']}>
              {t('common.back')}
            </Text>
          </HStack>
        </GridItem>
        {/* main */}
        <GridItem area={"main"} >
          <VStack spacing={4}>
            {!increaseTabOptions[1].disabled && !lpBalance.isZero ? <StakeableHint /> : undefined}
            <Box {...panelCard} bg={colors.backgroundTransparentNew} borderRadius="20px" overflow="hidden" w="full" border={"1px solid"} borderColor={colors.borderColorNew}>
              <AddLiquidity
                pool={pool}
                isLoading={isLoading}
                poolNotFound={isPoolNotFound}
                rpcData={rpcData}
                mutate={mutateRpc}
                onSelectToken={handleSelectToken}
                onRefresh={handleRefresh}
                tokenPair={{
                  base: tokenPair.base,
                  quote: tokenPair.quote
                }}
              />
            </Box>
          </VStack>
        </GridItem>
        {/* right */}
        <GridItem area={"right"}>
          <VStack maxW={['revert', '400px']} justify="flex-start" align="stretch" spacing={4} bg={colors.backgroundTransparentNew}>
            <PoolInfo
              pool={
                pool && rpcData
                  ? {
                      ...pool,
                      mintAmountA: new Decimal(rpcData.baseReserve.toString()).div(10 ** pool.mintA.decimals).toNumber(),
                      mintAmountB: new Decimal(rpcData.quoteReserve.toString()).div(10 ** pool.mintB.decimals).toNumber()
                    }
                  : pool
              }
            />
            <PositionBalance
              myPosition={Number(lpBalance.amount.mul(pool?.lpPrice ?? 0).toFixed(pool?.lpMint.decimals ?? 6))}
              staked={stakedData}
              unstaked={lpBalance.isZero ? '--' : lpBalance.text}
            />
          </VStack>
        </GridItem>
      </Grid>
    </>
  )
}
