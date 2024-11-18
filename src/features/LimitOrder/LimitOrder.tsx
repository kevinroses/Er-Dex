import { Grid, GridItem, VStack } from '@chakra-ui/react'
import { RAYMint } from '@/raydium-io/raydium-sdk-v2'
import { PublicKey } from '@solana/web3.js'
import { useEffect, useMemo, useRef, useState } from 'react'

import PanelCard from '@/components/PanelCard'
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect'
import { useAppStore, useTokenStore } from '@/store'
import { getVHExpression } from '../../theme/cssValue/getViewportExpression'
import { getSwapPairCache, setSwapPairCache } from './util'
import { SwapKlinePanel } from '../Swap/components/SwapKlinePanel'
import { SwapKlinePanelMobileDrawer } from '../Swap/components/SwapKlinePanelMobileDrawer'
import { SwapKlinePanelMobileThumbnail } from '../Swap/components/SwapKlinePanelMobileThumbnail'
import { LimitOrderPanel } from './components/LimitOrderPanel'
import  LimitOrderTable  from './components/LimiOrderTable'
import { TimeType } from '@/hooks/pool/useFetchPoolKLine'
import { getMintPriority } from '@/utils/token'
import useResponsive from '@/hooks/useResponsive'

export default function LimitOrder() {
  // const { inputMint: cacheInput, outputMint: cacheOutput } = getSwapPairCache()
  const [inputMint, setInputMint] = useState<string>(PublicKey.default.toBase58())
  const [outputMint, setOutputMint] = useState<string>(RAYMint.toBase58())
  const [isPCChartShown, setIsPCChartShown] = useState<boolean>(true)
  const [isMobileChartShown, setIsMobileChartShown] = useState<boolean>(false)
  const [isChartLeft, setIsChartLeft] = useState<boolean>(true)
  const { isMobile } = useResponsive()
  const publicKey = useAppStore((s) => s.publicKey)
  const connected = useAppStore((s) => s.connected)
  const [directionReverse, setDirectionReverse] = useState<boolean>(false)
  const [selectedTimeType, setSelectedTimeType] = useState<TimeType>('15m')
  const [cacheLoaded, setCacheLoaded] = useState(false)
  const untilDate = useRef(Math.floor(Date.now() / 1000))
  const swapPanelRef = useRef<HTMLDivElement>(null)
  const klineRef = useRef<HTMLDivElement>(null)

  const baseMint = directionReverse ? outputMint : inputMint
  const quoteMint = directionReverse ? inputMint : outputMint
  const tokenMap = useTokenStore((s) => s.tokenMap)
  const baseToken = useMemo(() => tokenMap.get(baseMint), [tokenMap, baseMint])
  const quoteToken = useMemo(() => tokenMap.get(quoteMint), [tokenMap, quoteMint])
  const [isDirectionNeedReverse, setIsDirectionNeedReverse] = useState<boolean>(false)

  useEffect(() => {
    const { inputMint: cacheInput, outputMint: cacheOutput } = getSwapPairCache()
    if (cacheInput) setInputMint(cacheInput)
    if (cacheOutput && cacheOutput !== cacheInput) setOutputMint(cacheOutput)
    setCacheLoaded(true)
  }, [])
  useEffect(() => {
    // preserve swap chart default direction on page refresh by mint priority
    if (cacheLoaded) {
      if (getMintPriority(baseMint) > getMintPriority(quoteMint)) {
        setDirectionReverse(true)
      }
    }
  }, [cacheLoaded])
  // reset directionReverse when inputMint or outputMint changed
  useIsomorphicLayoutEffect(() => {
    if (!cacheLoaded) return
    if (isDirectionNeedReverse) {
      setDirectionReverse(true)
      setIsDirectionNeedReverse(false)
    } else {
      setDirectionReverse(false)
    }

    setSwapPairCache({
      inputMint,
      outputMint
    })
  }, [inputMint, outputMint, cacheLoaded])

  useIsomorphicLayoutEffect(() => {
    if (klineRef.current) {
      const swapPanelHeight = swapPanelRef.current?.getBoundingClientRect().height
      const height = Number(swapPanelHeight) > 500 ? `${swapPanelHeight}px` : '522px'
      klineRef.current.style.height = height
    }
  }, [])

  return (
    <VStack
      mx={['unset', 'auto']}
      mt={[0, getVHExpression([0, 800], [32, 1300])]}
      width={!isMobile && isPCChartShown ? 'min(100%, 1300px)' : undefined}
    >
      <Grid
        width="full"
        gridTemplate={[
          `
          "panel" auto
          "kline" auto / auto
        `,
          isPCChartShown ? (isChartLeft ? `"kline panel" auto / 65% 35%` : `"panel kline" auto / 35% 65%`) : `"panel" auto / auto`
        ]}
        gap={[3, isPCChartShown ? 4 : 0]}
      >
        <GridItem ref={swapPanelRef} gridArea="panel" minWidth={['auto', '380px']}>
          <PanelCard
            p={[3, 6]}
            flexGrow={['1', 'unset']}
            bg="var(--modal-80)"
            boxShadow="none"
            border="1px solid var(--Neutrals-Neutral-500)"
          >
            <LimitOrderPanel
              onInputMintChange={setInputMint}
              onOutputMintChange={setOutputMint}
              onDirectionNeedReverse={() => setIsDirectionNeedReverse((b) => !b)}
            />
          </PanelCard>
        </GridItem>

        <GridItem gridArea="kline" {...(isMobile ? { mb: 3 } : {})}>
          <PanelCard
            ref={klineRef}
            p={[3, 3]}
            gap={4}
            height="100%"
            {...(isMobile || !isPCChartShown ? { display: 'none' } : {})}
            bg="var(--modal-80)"
            boxShadow="none"
            border="1px solid var(--Neutrals-Neutral-500)"
          >
            <SwapKlinePanel
              untilDate={untilDate.current}
              baseToken={baseToken}
              quoteToken={quoteToken}
              timeType={selectedTimeType}
              onDirectionToggle={() => setDirectionReverse((b) => !b)}
              onTimeTypeChange={setSelectedTimeType}
            />
          </PanelCard>
          {isMobile && (
            <PanelCard
              p={[3, 6]}
              gap={0}
              onClick={() => {
                setIsMobileChartShown(true)
              }}
              height="100%"
            >
              <SwapKlinePanelMobileThumbnail untilDate={untilDate.current} baseToken={baseToken} quoteToken={quoteToken} />
              <SwapKlinePanelMobileDrawer
                untilDate={untilDate.current}
                isOpen={isMobileChartShown}
                onClose={() => setIsMobileChartShown(false)}
                baseToken={baseToken}
                quoteToken={quoteToken}
                timeType={selectedTimeType}
                onDirectionToggle={() => setDirectionReverse((b) => !b)}
                onTimeTypeChange={setSelectedTimeType}
              />
            </PanelCard>
          )}
        </GridItem>

      </Grid>
      <LimitOrderTable/>

    </VStack>
  )
}
