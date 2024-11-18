import { useEffect, useState } from 'react'
import Tabs from '@/components/Tabs'
import TokenAvatarPair from '@/components/TokenAvatarPair'
import { TimeType } from '@/hooks/pool/useFetchPoolKLine'
import { colors } from '@/theme/cssVariables'
import toPercentString from '@/utils/numberish/toPercentString'
import { Grid, GridItem, Text, Box, Divider, HStack } from '@chakra-ui/react'
import { ApiV3Token } from '@/raydium-io/raydium-sdk-v2'
import CandleChart from './CandleChart'
import dayjs from 'dayjs'
import SwapIcon from '@/icons/misc/SwapIcon'
import { formatCurrency, formatToRawLocaleStr } from '@/utils/numberish/formatter'

export function SwapKlinePanel({
  baseToken,
  quoteToken,
  timeType,
  untilDate,
  onDirectionToggle,
  onTimeTypeChange
}: {
  untilDate: number
  baseToken: ApiV3Token | undefined
  quoteToken: ApiV3Token | undefined
  timeType: TimeType
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
    // Set the date and time when the component is mounted on the client side
    setClientTime(dayjs().format('YY/MM/DD HH:mm'))
  }, [])

  return (
    <>
      <Grid
        gridTemplate={`
        "name   tabs " auto
        "chartwrap chartwrap" 1fr / 1fr auto
      `}
        alignItems="center"
        height={'100%'}
        borderRadius="12px"
        p={5}
      >
        <GridItem gridArea="name" display="flex" justifyContent="space-between" alignItems="center" mb="4px" p="4px">
          {/* Left Section: Token Pair Information */}
          <HStack spacing={5}>
            {/* Token Avatar Pair with Custom Styles */}
            <Box
              display="flex"
              width="50px"
              height="50px"
              padding="4.571px 8.857px"
              justifyContent="center"
              alignItems="center"
              margin-start="5px"
            >
              <TokenAvatarPair token1={baseToken} token2={quoteToken} />
            </Box>

            <HStack spacing={3}>
              <Text fontSize="20px" fontWeight="700" color="white">
                {baseToken?.symbol} / {quoteToken?.symbol}
              </Text>
              <Box
                cursor="pointer"
                onClick={() => {
                  onDirectionToggle?.()
                }}
              >
                <SwapIcon />
              </Box>
            </HStack>
          </HStack>

          {/* Center Section: Date and Time */}
          <Box display="flex" flexDirection="column" alignItems="start" mx="auto">
            <Text fontSize="13px" color="white">
              {clientTime.split(' ')[0]}
            </Text>
            <Text fontSize="13px" color="var(--Neutrals-Neutral-200)">
              {clientTime.split(' ')[1]}
            </Text>
          </Box>

          {/* Right Section: Tabs */}
          <Tabs
            items={['15m', '1H', '4H', '1D', '1W', '1Y']}
            variant="squarePanel"
            border="1px solid var(--Neutrals-Neutral-500)"
            borderRadius="8px"
            onChange={(t: TimeType) => {
              onTimeTypeChange?.(t)
            }}
            tabItemSX={{
              minWidth: '4em',
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

        <GridItem area={'chartwrap'} height="100%">
          <Grid
            gridTemplate={`
            "price  price" auto
            "chart  chart" 1fr / 1fr auto
            `}
            alignItems="center"
            cursor="pointer"
            paddingLeft="16px"
            height="100%"
            bg="var(--Neutrals-Neutral-800)"
            borderRadius="8px"
          >
            <GridItem gridArea="price" paddingTop="8px">
              <HStack spacing={2} alignItems="baseline">
                {/* Display the current price */}
                <Text fontSize="28px" fontWeight={700} color={colors.textPrimary}>
                  {price ? formatCurrency(price.current, { maximumDecimalTrailingZeroes: 5 }) : price}
                </Text>

                {/* Display the token pair symbol between the price and the price change */}
                <Text fontSize="20px" fontWeight="700" color="var(--Neutrals-Neutral-300)">
                  {baseToken?.symbol} / {quoteToken?.symbol}
                </Text>

                {/* Display the price change if available */}
                {price?.change && (
                  <Text
                    fontSize="sm"
                    color={
                      price?.change > 0 ? colors.priceFloatingUp : price?.change < 0 ? colors.priceFloatingDown : colors.priceFloatingFlat
                    }
                  >
                    {formatToRawLocaleStr(toPercentString(price?.change, { alwaysSigned: true }))}
                  </Text>
                )}
              </HStack>
            </GridItem>

            <CandleChart onPriceChange={setPrice} baseMint={baseToken} quoteMint={quoteToken} timeType={timeType} untilDate={untilDate} />
          </Grid>
        </GridItem>
      </Grid>
    </>
  )
}
