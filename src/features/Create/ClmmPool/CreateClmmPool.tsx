import { Box, Flex, Grid, GridItem, HStack, Link, Text, useDisclosure } from '@chakra-ui/react'
import { ApiClmmConfigInfo, ApiV3Token, solToWSol } from '@/raydium-io/raydium-sdk-v2'
import { useCallback, useRef, useState, useEffect } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import shallow from 'zustand/shallow'

import PanelCard from '@/components/PanelCard'
import SubPageNote from '@/components/SubPageNote'
import PreviewDepositModal from '@/features/Clmm/components/PreviewDepositModal'
import ChevronLeftIcon from '@/icons/misc/ChevronLeftIcon'
import { CreatePoolBuildData, useAppStore, useClmmStore } from '@/store'
import { colors } from '@/theme/cssVariables/colors'
import { genCSS2GridTemplateColumns, genCSS3GridTemplateColumns } from '@/theme/detailConfig'
import { debounce, exhaustCall } from '@/utils/functionMethods'
import { routeBack } from '@/utils/routeTools'
import { solToWSolToken } from '@/utils/token'
import BN from 'bn.js'
import Decimal from 'decimal.js'
import SelectPoolToken from './components/SelectPoolTokenAndFee'
import SetPriceAndRange from './components/SetPriceAndRange'
import TokenAmountPairInputs from './components/TokenAmountInput'
import CreateSuccessModal from './components/CreateSuccessModal'
import CreateSuccessWithLockModal from './components/CreateSuccessWithLockModal'
import { useEvent } from '@/hooks/useEvent'
import useBirdeyeTokenPrice from '@/hooks/token/useBirdeyeTokenPrice'
import ChevronDownIcon from '@/icons/misc/ChevronDownIcon'
import ChevronUpIcon from '@/icons/misc/ChevronUpIcon'
import { Divider } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { StepsRef } from '@/components/Steps'

const MotionBox = motion(Box)

const ExpandCollapseIcon = ({ isExpanded }: any) =>
  isExpanded ? <ChevronUpIcon w={6} h={6} color="white" /> : <ChevronDownIcon w={6} h={6} color="white" />

export default function CreateClmmPool() {
  const isMobile = useAppStore((s) => s.isMobile)
  const { t } = useTranslation()
  const [createClmmPool, openPositionAct] = useClmmStore((s) => [s.createClmmPool, s.openPositionAct], shallow)
  const { isOpen, onOpen, onClose, onToggle } = useDisclosure()
  const { isOpen: isLoading, onOpen: onLoading, onClose: offLoading } = useDisclosure()
  const { isOpen: isSuccessModalOpen, onOpen: onOpenSuccessModal, onClose: onCloseSuccessModal } = useDisclosure()
  const [step, setStep] = useState(0)
  const [baseIn, setBaseIn] = useState(true)
  const [createPoolData, setCreatePoolData] = useState<CreatePoolBuildData | undefined>()
  const [isTxSending, setIsTxSending] = useState(false)
  const debounceSetBuildData = debounce((data: CreatePoolBuildData) => setCreatePoolData(data), 150)
  const [isExpanded, setIsExpanded] = useState(true)
  const contentRef = useRef<HTMLDivElement>(null)
  const [measuredHeight, setMeasuredHeight] = useState('0px')

  const contentRef1 = useRef<HTMLDivElement | null>(null)
  const contentRef2 = useRef<HTMLDivElement | null>(null)
  const contentRef3 = useRef<HTMLDivElement | null>(null)

  const [isExpandedPanel1, setIsExpandedPanel1] = useState(true)
  const [isExpandedPanel2, setIsExpandedPanel2] = useState(false)
  const [isExpandedPanel3, setIsExpandedPanel3] = useState(false)

  const toggleExpand = () => setIsExpanded(!isExpanded)
  const toggleExpandPanel1 = () => setIsExpandedPanel1((prev) => !prev)
  const toggleExpandPanel2 = () => setIsExpandedPanel2((prev) => !prev)
  const toggleExpandPanel3 = () => setIsExpandedPanel3((prev) => !prev)

  const [measuredHeight1, setMeasuredHeight1] = useState('0px')
  const [measuredHeight2, setMeasuredHeight2] = useState('0px')
  const [measuredHeight3, setMeasuredHeight3] = useState('0px')

  useEffect(() => {
    if (contentRef1.current) setMeasuredHeight1(isExpandedPanel1 ? `${contentRef1.current.scrollHeight}px` : '0px')
    if (contentRef2.current) setMeasuredHeight2(isExpandedPanel2 ? `${contentRef2.current.scrollHeight}px` : '0px')
    if (contentRef3.current) setMeasuredHeight3(isExpandedPanel3 ? `${contentRef3.current.scrollHeight}px` : '0px')
  }, [isExpandedPanel1, isExpandedPanel2, isExpandedPanel3])

  const { data: tokenPrices, isLoading: isPriceLoading } = useBirdeyeTokenPrice({
    mintList: [createPoolData?.extInfo.mockPoolInfo.mintA.address, createPoolData?.extInfo.mockPoolInfo.mintB.address]
  })

  const currentCreateInfo = useRef<{
    token1?: ApiV3Token
    token2?: ApiV3Token
    config?: ApiClmmConfigInfo
    startTime?: number
    price: string
    tickLower?: number
    tickUpper?: number
    priceLower?: string
    priceUpper?: string
    amount1?: string
    amount2?: string
    liquidity?: BN
    inputA: boolean
    isFullRange?: boolean
  }>({
    inputA: true,
    price: ''
  })

  const stepsRef = useRef<StepsRef>(null)

  const handleEdit = useCallback((step: number) => {
    setStep(step)
  }, [])

  const handleStep1Confirm = useCallback(
    ({ token1, token2, ammConfig }: { token1: ApiV3Token; token2: ApiV3Token; ammConfig: ApiClmmConfigInfo }) => {
      onLoading()
      currentCreateInfo.current.token1 = solToWSolToken(token1)
      currentCreateInfo.current.token2 = solToWSolToken(token2)
      currentCreateInfo.current.config = ammConfig
      console.log(currentCreateInfo)
      createClmmPool({
        config: ammConfig,
        token1: solToWSolToken(token1),
        token2: solToWSolToken(token2),
        price: '1',
        forerunCreate: true
      })
        .then(({ buildData }) => {
          if (!buildData) return
          console.log(buildData)
          setBaseIn(solToWSol(token1.address).equals(solToWSol(buildData?.extInfo.mockPoolInfo?.mintA.address || '')))
          setCreatePoolData(buildData)
          stepsRef.current?.goToNext()
        })
        .finally(offLoading)

      setStep(1)
      toggleExpandPanel1()
      toggleExpandPanel2()
      //comment end
    },
    [createClmmPool]
  )

  const handlePriceChange = useCallback(
    ({ price }: { price: string }) => {
      const { token1, token2, config } = currentCreateInfo.current
      if (!token1 || !token2 || !config) return
      createClmmPool({ config, token1, token2, price: price && new Decimal(price).gt(0) ? price : '1', forerunCreate: true }).then(
        ({ buildData }) => {
          debounceSetBuildData(buildData)
        }
      )
    },
    [createClmmPool, debounceSetBuildData]
  )

  const handleStep2Confirm = useEvent(
    (props: {
      price: string
      tickLower: number
      tickUpper: number
      priceLower: string
      priceUpper: string
      startTime?: number
      isFullRange?: boolean
    }) => {
      setStep(2)
      toggleExpandPanel2()
      toggleExpandPanel3()
      currentCreateInfo.current = {
        ...currentCreateInfo.current,
        ...props
      }
      console.log(currentCreateInfo.current)
    }
  )

  const handleStep3Confirm = useCallback(
    ({ inputA, liquidity, amount1, amount2 }: { inputA: boolean; liquidity: BN | undefined; amount1: string; amount2: string }) => {
      currentCreateInfo.current.inputA = inputA
      currentCreateInfo.current.liquidity = liquidity
      currentCreateInfo.current.amount1 = amount1
      currentCreateInfo.current.amount2 = amount2
      onOpen()
    },
    []
  )

  const handleSwitchBase = useCallback(
    (baseIn: boolean) => {
      const [token1, token2] = [currentCreateInfo.current.token1, currentCreateInfo.current.token2]
      currentCreateInfo.current.token1 = token2
      currentCreateInfo.current.token2 = token1
      setBaseIn(baseIn)
    },
    [setBaseIn]
  )

  const handleChangeStep = useCallback((newStep: number) => {
    setStep(newStep)
  }, [])

  const handleCreateAndOpen = useEvent(
    exhaustCall(async () => {
      setIsTxSending(true)
      const { token1, token2, config, price, startTime } = currentCreateInfo.current
      const { buildData } = await createClmmPool({
        config: config!,
        token1: token1!,
        token2: token2!,
        price,
        startTime,
        forerunCreate: true
      })
      if (!buildData) return

      const [mintAAmount, mintBAmount] = [
        new Decimal(currentCreateInfo.current.amount1!).mul(10 ** buildData.extInfo.mockPoolInfo.mintA.decimals).toFixed(0),
        new Decimal(currentCreateInfo.current.amount2!).mul(10 ** buildData.extInfo.mockPoolInfo.mintB.decimals).toFixed(0)
      ]

      openPositionAct({
        poolInfo: buildData.extInfo.mockPoolInfo,
        poolKeys: buildData.extInfo.address,
        tickLower: Math.min(currentCreateInfo.current.tickLower!, currentCreateInfo.current.tickUpper!),
        tickUpper: Math.max(currentCreateInfo.current.tickLower!, currentCreateInfo.current.tickUpper!),
        base: currentCreateInfo.current.inputA ? 'MintA' : 'MintB',
        baseAmount: currentCreateInfo.current.inputA ? mintAAmount : mintBAmount,
        otherAmountMax: currentCreateInfo.current.inputA ? mintBAmount : mintAAmount,
        createPoolBuildData: buildData,
        onConfirmed: () => {
          onOpenSuccessModal()
        },
        onFinally: () => setIsTxSending(false)
      })
    })
  )
  const friendlySentence = [
    t('create_pool.clmm_create_pool_note_step1'),
    t('create_pool.clmm_create_pool_note_step2'),
    t('create_pool.clmm_create_pool_note_step3')
  ][step]

  const needToShowSelectPoolToken = isMobile ? step === 0 : step >= 0
  const needToShowSetPriceAndRange = isMobile ? step === 1 : step >= 1
  const needToShowTokenAmountInput = isMobile ? step === 2 : step >= 2

  return (
    <>
      <Grid
        gridTemplate={[
          `
         "back" auto
         "note" auto
         "panel" auto
         "panel-2" auto
         "panel-3" auto / minmax(0,1fr)
       `,
          `
         "back" auto
         "note" auto
         "panel" auto
         "panel-2" auto
         "panel-3" auto
       `,
          `
         "back" auto
         "note" auto
         "panel" auto
         "panel-2" auto
         "panel-3" auto
       `
        ]}
        rowGap={[4, '2vh']}
        mt={[2, 8]}
      >
        {/* Back Button */}
        <GridItem area={'back'}>
          <Flex>
            <HStack cursor="pointer" onClick={() => routeBack()} color={colors.textTertiary} fontWeight="500" fontSize={['md', 'xl']}>
              <ChevronLeftIcon color="white" />
              <Text color="white">{t('common.back')}</Text>
            </HStack>
          </Flex>
        </GridItem>
        {/* Notes Section - Full Width */}
        <GridItem>
          <Box w="100%">
            <SubPageNote
              title={
                <Text fontSize="md" color="var(--System-Info)">
                  {t('create_pool.clmm_please_note')}
                </Text>
              }
              description={
                <Text fontSize="sm" color="var(--Neutrals-Neutral-200)">
                  <Trans i18nKey="create_pool.clmm_please_note_des">
                    <Link
                      href="https://docs.raydium.io/raydium/pool-creation/creating-a-clmm-pool-and-farm"
                      isExternal
                      color="var(--System-Info)"
                    >
                      CLMM
                    </Link>
                    <Link
                      href="https://docs.raydium.io/raydium/pool-creation/creating-a-standard-amm-pool"
                      isExternal
                      color="var(--System-Info)"
                    >
                      Standard
                    </Link>
                  </Trans>
                </Text>
              }
            />
          </Box>
        </GridItem>

        {/* Panel Section - Full Width */}
        <GridItem
          area="panel"
          bg="var(--Glass-Card)"
          p={4}
          borderRadius="md"
          border="1px solid var(--Neutrals-Neutral-500)"
          backdropFilter="blur(12px)"
        >
          <Flex flexDirection="column" gap={3} p={4}>
            {/* Header with Toggle Button */}
            <Flex justify="space-between" align="center">
              <Text fontSize="lg" fontWeight="bold" color="white">
                1. Select Token & Fee Tier
              </Text>
              <Box
                as="button"
                onClick={toggleExpandPanel1}
                cursor="pointer"
                aria-label="Toggle Select Token"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <ExpandCollapseIcon isExpanded={isExpandedPanel1} />
              </Box>
            </Flex>

            <Divider borderColor="var(--Neutrals-Neutral-500)" />

            <MotionBox
              ref={contentRef1}
              initial={false}
              animate={{ height: measuredHeight1 }}
              transition={{ duration: 0.3 }}
              overflow="hidden"
            >
              <Box p={4}>
                <SelectPoolToken
                  isLoading={isLoading}
                  show={needToShowSelectPoolToken}
                  initState={currentCreateInfo.current}
                  completed={step > 0}
                  onConfirm={handleStep1Confirm}
                  onEdit={handleEdit}
                />
              </Box>
            </MotionBox>
          </Flex>
        </GridItem>

        <GridItem
          area="panel-2"
          bg="var(--Glass-Card)"
          p={4}
          borderRadius="md"
          border="1px solid var(--Neutrals-Neutral-500)"
          backdropFilter="blur(12px)"
        >
          <Flex flexDirection="column" gap={3} p={4}>
            {/* Header with Toggle Button */}
            <Flex justify="space-between" align="center">
              <Text fontSize="lg" fontWeight="bold" color="white">
                2. Set Initial Price & Range
              </Text>
              <Box
                as="button"
                onClick={toggleExpandPanel2}
                cursor="pointer"
                aria-label="Toggle Select Token"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <ExpandCollapseIcon isExpanded={isExpandedPanel2} />
              </Box>
            </Flex>

            <Divider borderColor="var(--Neutrals-Neutral-500)" />

            {/* Collapsible Content */}
            <MotionBox
              ref={contentRef2}
              initial={false}
              animate={{ height: measuredHeight2 }}
              transition={{ duration: 0.3 }}
              overflow="hidden"
            >
              <Box p={4}>
                {/* Replace with your actual content component */}
                {step >= 1 && (
                  <SetPriceAndRange
                    initState={{
                      currentPrice: createPoolData?.extInfo.mockPoolInfo.price.toString() || currentCreateInfo.current.price,
                      priceRange: [currentCreateInfo.current.priceLower || '', currentCreateInfo.current.priceUpper || ''],
                      startTime: createPoolData
                        ? Number(createPoolData.extInfo.mockPoolInfo.openTime) * 1000
                        : currentCreateInfo.current.startTime
                    }}
                    completed={step > 1}
                    token1={currentCreateInfo.current.token1!}
                    token2={currentCreateInfo.current.token2!}
                    tokenPrices={tokenPrices || {}}
                    isPriceLoading={isPriceLoading}
                    tempCreatedPool={createPoolData?.extInfo.mockPoolInfo}
                    baseIn={baseIn}
                    onPriceChange={handlePriceChange}
                    onSwitchBase={handleSwitchBase}
                    onConfirm={handleStep2Confirm}
                    onEdit={handleEdit}
                  />
                )}
              </Box>
            </MotionBox>
          </Flex>
        </GridItem>

        <GridItem
          area="panel-3"
          bg="var(--Glass-Card)"
          p={4}
          borderRadius="md"
          border="1px solid var(--Neutrals-Neutral-500)"
          backdropFilter="blur(12px)"
        >
          <Flex flexDirection="column" gap={3} p={4}>
            {/* Header with Toggle Button */}
            <Flex justify="space-between" align="center">
              <Text fontSize="lg" fontWeight="bold" color="white">
                3. Select Token & Fee Tier
              </Text>
              <Box
                as="button"
                onClick={toggleExpandPanel3}
                cursor="pointer"
                aria-label="Toggle Select Token"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <ExpandCollapseIcon isExpanded={isExpandedPanel3} />
              </Box>
            </Flex>

            <Divider borderColor="var(--Neutrals-Neutral-500)" />

            {/* Collapsible Content */}
            <MotionBox
              ref={contentRef3}
              initial={false}
              animate={{ height: measuredHeight3 }}
              transition={{ duration: 0.3 }}
              overflow="hidden"
            >
              <Box p={4}>
                {/* Replace with your actual content component */}
                {step >= 2 && (
                  <Box px={[0, 0]} py={[0, 0]} fontSize="sm" fontWeight="500" color={colors.textSecondary}>
                    <TokenAmountPairInputs
                      baseIn={baseIn}
                      tempCreatedPool={createPoolData!.extInfo.mockPoolInfo}
                      // tempCreatedPool={undefined}
                      priceLower={currentCreateInfo.current.priceLower!}
                      priceUpper={currentCreateInfo.current.priceUpper!}
                      tickLower={currentCreateInfo.current.tickLower!}
                      tickUpper={currentCreateInfo.current.tickUpper!}
                      onConfirm={handleStep3Confirm}
                    />
                  </Box>
                )}
              </Box>
            </MotionBox>
          </Flex>
        </GridItem>
      </Grid>

      {createPoolData && isOpen ? (
        // {isOpen ? (
        <PreviewDepositModal
          tokenPrices={tokenPrices || {}}
          isOpen={isOpen}
          isSending={isTxSending}
          isCreatePool
          pool={createPoolData.extInfo.mockPoolInfo}
          baseIn={baseIn}
          onConfirm={handleCreateAndOpen}
          onClose={onClose}
          tokenAmount={[currentCreateInfo.current.amount1 || '0', currentCreateInfo.current.amount2 || '1']}
          priceRange={[currentCreateInfo.current.priceLower || '2', currentCreateInfo.current.priceUpper || '3']}
        />
      ) : null}
      {currentCreateInfo.current.isFullRange ? (
        <CreateSuccessWithLockModal isOpen={isSuccessModalOpen} onClose={onCloseSuccessModal} />
      ) : (
        <CreateSuccessModal isOpen={isSuccessModalOpen} onClose={onCloseSuccessModal} />
      )}
    </>
  )
}
