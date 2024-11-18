import { useState } from 'react'
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Grid,
  GridItem,
  HStack,
  Text,
  Box
} from '@chakra-ui/react'
import { ApiV3Token } from '@/raydium-io/raydium-sdk-v2'

import Tabs from '@/components/Tabs'
import TokenAvatarPair from '@/components/TokenAvatarPair'
import { colors } from '@/theme/cssVariables'
import { TimeType } from '@/hooks/pool/useFetchPoolKLine'
import CandleChart from './CandleChart'
import toPercentString from '@/utils/numberish/toPercentString'
import { formatCurrency, formatToRawLocaleStr } from '@/utils/numberish/formatter'
import dayjs from 'dayjs'

import SwapMobileIcon from '@/icons/misc/SwapMobileIcon'

function SwapKlinePanelMobileDrawerContent({
  baseToken,
  quoteToken,
  timeType,
  untilDate,
  onDirectionToggle,
  onTimeTypeChange
}: {
  baseToken: ApiV3Token | undefined
  quoteToken: ApiV3Token | undefined
  timeType: TimeType
  untilDate: number
  onDirectionToggle?(): void
  onTimeTypeChange?(timeType: TimeType): void
}) {
  const [price, setPrice] = useState<{ current: number; change: number } | undefined>()
  return (
    <>
      <Grid
        gridTemplateColumns="1fr auto"
        gridTemplateRows="auto auto 1fr"
        gridTemplateAreas={`
          "name date"
          "tabs tabs"
          "chartwrap chartwrap"
        `}
        alignItems="center"
        borderRadius="12px"
        p={5}
        height="70vh"
      >
        {/* Token names on the left and date/time on the right */}
        <GridItem area="name" pl={2}>
          <HStack spacing={1}>
            <TokenAvatarPair token1={baseToken} token2={quoteToken} size="xs" />
            <Text fontSize="md" fontWeight="700" color="white">
              {baseToken?.symbol}/{quoteToken?.symbol}
            </Text>
            <Box
              cursor="pointer"
              onClick={() => {
                onDirectionToggle?.()
              }}
            >
              <SwapMobileIcon />
            </Box>
          </HStack>
        </GridItem>

        <GridItem area="date" justifySelf="end" pr={2}>
          <Box textAlign="right">
            <Text fontSize="13px" fontWeight="700" color="white">
              {dayjs().utc().format('YY/MM/DD')}
            </Text>
            <Text fontSize="13px" fontWeight="500" color="var(--Neutrals-Neutral-200)" textAlign="start">
              {dayjs().utc().format('HH:mm')}
            </Text>
          </Box>
        </GridItem>

        {/* Tabs below the token names and date/time */}
        <GridItem area="tabs" width="100%" mt={3} mb={3} pl={2} pr={2}>
          <Tabs
            items={['15m', '1H', '4H', '1D', '1W', '1Y']}
            variant="squarePanel"
            border="1px solid var(--Neutrals-Neutral-500)"
            onChange={(t: TimeType) => {
              onTimeTypeChange?.(t)
            }}
            tabItemSX={{
              minWidth: '3em',
              fontSize: 'xs',
              flex: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              position: 'relative',
              textAlign: 'center',

              _hover: {
                backgroundColor: 'var(--Neutrals-Neutral-500)', // Hover background color
                color: 'white', // Text color on hover
                cursor: 'pointer'
              },
              _selected: {
                backgroundColor: 'var(--Neutrals-Neutral-500)', // Active background color
                color: 'white' // Text color for the active tab
              }
            }}
            width="100%"
          />
        </GridItem>

        {/* Chart section */}
        <GridItem area="chartwrap" height="100%" padding="2">
          <Grid
            gridTemplate={`"price price" auto "chart chart" 1fr / 1fr auto`}
            alignItems="center"
            cursor="pointer"
            height="100%"
            bg="var(--Neutrals-Neutral-800)"
            borderTopRadius="md"
          >
            <GridItem gridArea="price" pt={4} pl={3}>
              <HStack spacing={2} alignItems="baseline">
                <Text fontSize="xl" fontWeight={700} color={colors.textPrimary}>
                  {price ? formatCurrency(price.current, { maximumDecimalTrailingZeroes: 5 }) : price}
                </Text>
                <Text
                  fontSize="xs"
                  fontWeight={400}
                  color={
                    price && price.change > 0
                      ? colors.priceFloatingUp
                      : price && price.change < 0
                      ? colors.priceFloatingDown
                      : colors.priceFloatingFlat
                  }
                >
                  {price ? formatToRawLocaleStr(toPercentString(price.change, { alwaysSigned: true })) : ''}
                </Text>
              </HStack>
            </GridItem>
            <CandleChart untilDate={untilDate} onPriceChange={setPrice} baseMint={baseToken} quoteMint={quoteToken} timeType={timeType} />
          </Grid>
        </GridItem>
      </Grid>
    </>
  )
}

export function SwapKlinePanelMobileDrawer({
  isOpen,
  onClose,
  untilDate,
  baseToken,
  quoteToken,
  timeType,
  onDirectionToggle,
  onTimeTypeChange
}: {
  isOpen: boolean
  onClose(): void
  untilDate: number
  baseToken: ApiV3Token | undefined
  quoteToken: ApiV3Token | undefined
  timeType: TimeType
  onDirectionToggle?(): void
  onTimeTypeChange?(timeType: TimeType): void
}) {
  return (
    <Drawer isOpen={isOpen} variant="popFromBottom" placement="bottom" onClose={onClose}>
      <DrawerOverlay />
      <DrawerContent borderTopRadius="3xl" bg="var(--modal-80)" border="1px solid var(--Neutrals-Neutral-500)" borderBottom="none">
        {/* <DrawerCloseButton top={6} /> */}
        <DrawerHeader />
        <DrawerBody pl={2} pr={2}>
          <SwapKlinePanelMobileDrawerContent
            untilDate={untilDate}
            baseToken={baseToken}
            quoteToken={quoteToken}
            timeType={timeType}
            onDirectionToggle={onDirectionToggle}
            onTimeTypeChange={onTimeTypeChange}
          />
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
