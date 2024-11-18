import Tabs from '@/components/Tabs'
import useFetchPoolChartData from '@/hooks/pool/useFetchPoolChartData'
import { useAppStore } from '@/store'
import { colors } from '@/theme/cssVariables'
import { shrinkToValue } from '@/utils/shrinkToValue'
import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay } from '@chakra-ui/react'
import { ReactNode, useMemo, useState, useRef, useEffect } from 'react'
import { Grid, GridItem, Text, Box, Divider, HStack } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'
import Chart from './Chart'
import { TimeType, availableTimeType } from './const'
import { SwapKlinePanel } from '@/features/Swap/components/SwapKlinePanel'
import { AprKey, FormattedPoolInfoItem } from '@/hooks/pool/type'
import { ApiV3Token } from '@/raydium-io/raydium-sdk-v2'
import dayjs from 'dayjs'
import CandleChart from '@/features/Swap/components/CandleChart'

export default function PoolChartModal<T extends string>({
  chartPoolInfo,
  isOpen,
  onClose,
  renderModalHeader,
  categories
}: {
  chartPoolInfo: FormattedPoolInfoItem | undefined
  isOpen: boolean

  /** it base on provided chartData */
  categories: { label: string; value: T }[]
  renderModalHeader?: ((utils: { isOpen?: boolean }) => ReactNode) | ReactNode
  onClose?: () => void
}) {
  const { t } = useTranslation()
  const untilDate = useRef(Math.floor(Date.now() / 1000))
  const [selectedTimeType, setSelectedTimeType] = useState<TimeType>('15m')
  return (
    <Modal size="xl" isOpen={isOpen} onClose={onClose ?? (() => {})}>
      <ModalOverlay />
      <ModalContent bg={'#0C0B0B'} border={'1px solid'} borderColor={'#3E5DB0'}>
        <ModalHeader>{shrinkToValue(renderModalHeader, [{ isOpen }])}</ModalHeader>
        <ModalCloseButton />

        <ModalBody>
          <ChartWindow
            untilDate={untilDate.current}
            baseToken={chartPoolInfo?.mintA}
            quoteToken={chartPoolInfo?.mintB}
            timeType={selectedTimeType}
            onDirectionToggle={() => {}}
            onTimeTypeChange={setSelectedTimeType}
            categories={categories}
            poolAddress={chartPoolInfo?.id}
          />
        </ModalBody>
        <ModalFooter justifyContent="center">
          <Button minW="132px" mt={2} onClick={onClose} width={'100%'}>
            {t('button.close')}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

/** used in mobile  */
export function ChartWindow<T extends string>({
  baseToken,
  quoteToken,
  timeType,
  untilDate,
  categories,
  poolAddress,
  onTimeTypeChange
}: {
  untilDate: number
  baseToken: ApiV3Token | undefined
  quoteToken: ApiV3Token | undefined
  timeType: TimeType
  categories: { label: string; value: T }[]
  poolAddress: string | undefined
  onDirectionToggle?(): void
  onTimeTypeChange?(timeType: TimeType): void
}) {
  const [price, setPrice] = useState<
    | {
        current: number
        change: number
      }
    | undefined
  >()

  const [clientTime, setClientTime] = useState('')

  useEffect(() => {
    setClientTime(dayjs().format('YY/MM/DD HH:mm'))
  }, [])
  const isMobile = useAppStore((s) => s.isMobile)
  const [currentCategory, setCurrentCategory] = useState<T>(categories[0].value)
  const currentCategoryLabel = useMemo(() => categories.find((c) => c.value === currentCategory)?.label ?? '', [currentCategory])
  const [currentTimeType, setCurrentTimeType] = useState<TimeType>(availableTimeType[0])
  const { data, isLoading, isEmptyResult } = useFetchPoolChartData({
    category: 'volume',
    poolAddress: poolAddress,
    baseMint: baseToken?.address,
    timeType: currentTimeType
  })
  return (
    <>
      <Tabs
        size={['sm', 'md']}
        variant={isMobile ? 'square' : 'squarePanel'}
        items={categories}
        defaultValue={currentCategory}
        onChange={(value) => {
          setCurrentCategory(value)
        }}
        my={2}
        sx={{ bg: isMobile ? 'transparent' : colors.backgroundDark }}
      />
      {currentCategory === 'volume' ? (
        <Grid
          gridTemplateRows="80% 20%" // 80% for chartwrap, 20% for tabs
          gridTemplateAreas={`"chartwrap" "tabs"`}
          alignItems="center"
          height={'100%'}
          borderRadius="12px"
          minHeight={'400px'}
          p={5}
        >
          <GridItem area={'chartwrap'} height="100%" maxWidth={['330px']}>
            <Grid
              gridTemplate={`
            "price  price" auto
            "chart  chart" 1fr / 1fr auto
            `}
              alignItems="center"
              cursor="pointer"
              paddingLeft="16px"
              height="100%"
              bg="#0C0B0B"
              borderRadius="8px"
            >
              <CandleChart onPriceChange={setPrice} baseMint={baseToken} quoteMint={quoteToken} timeType={timeType} untilDate={untilDate} />
            </Grid>
          </GridItem>
          <GridItem gridArea="tabs" display="flex" justifyContent="space-around" alignItems="center" mb="4px" p="4px" maxWidth={['330px']}>
            <Tabs
              items={['15m', '1H', '4H', '1D', '1W', '1Y']}
              variant="squarePanel"
              border="1px solid var(--Neutrals-Neutral-500)"
              borderRadius="8px"
              onChange={(t: TimeType) => {
                onTimeTypeChange?.(t)
              }}
              tabItemSX={{
                minWidth: ['1em', '4em'],
                padding: '8px 12px',
                borderRadius: '8px',
                position: 'relative',

                _hover: {
                  backgroundColor: 'var(--Neutrals-Neutral-500)', // Hover background color
                  color: 'white', // Text color on hover
                  cursor: 'pointer'
                },
                _selected: {
                  backgroundColor: 'var(--Neutrals-Neutral-500)', // Active background color
                  color: 'white' // Text color for the active tab
                },
                '&:not(:last-of-type)': {
                  borderRight: '1px solid var(--Neutrals-Neutral-500)' // Divider between tab items
                }
              }}
              style={{ marginLeft: '10px' }}
            />
          </GridItem>
        </Grid>
      ) : (
        <Chart<typeof data[0]>
          isEmpty={isEmptyResult}
          isActionRunning={isLoading}
          data={data}
          currentCategoryLabel={currentCategoryLabel}
          xKey="time"
          yKey="v"
          renderTimeTypeTabs={
            <Tabs
              visibility={currentCategory === 'volume' ? 'visible' : 'hidden'}
              pointerEvents={currentCategory === 'volume' ? 'auto' : 'none'}
              size={['sm', 'sm']}
              variant="square"
              items={availableTimeType}
              defaultValue={currentTimeType}
              onChange={(value) => {
                setCurrentTimeType(value)
              }}
              ml="auto"
            />
          }
        />
      )}
    </>
  )
}
