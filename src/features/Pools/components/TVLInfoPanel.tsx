import { Box, HStack, VStack, Image, Text } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

import { colors } from '@/theme/cssVariables'
import { appLayoutPaddingX } from '@/theme/detailConfig'
import { formatCurrency } from '@/utils/numberish/formatter'

export default function TVLInfoPanel({ tvl, volume }: { tvl: string | number; volume: string | number }) {
  const { t } = useTranslation()
  return (
    <HStack>
      <TVLInfoItem name={t('common.tvl')} value={tvl} decoratorImageSrc="/images/tvl-lock.svg" />
      <TVLInfoItem name={t('common.24h_volume')} value={volume} decoratorImageSrc="/images/volume-total.svg" />
    </HStack>
  )
}

function TVLInfoItem({ name, value, decoratorImageSrc }: { name: string; value: string | number; decoratorImageSrc?: string }) {
  return (
    <Box
      bg="var(--Neutrals-Neutral-800)"
      border="1px solid"
      borderColor="var(--Neutrals-Neutral-500)"
      rounded="15px"
      width="full"
      mx="auto"
      p={{ base: 2, md: 3 }} // Responsive padding
    >
      <Box pl={{ base: 2, md: 3 }} pr={{ base: 1, md: 0 }} py={2}>
        <Text fontSize={{ base: '16px', md: '20px' }} fontWeight={700} letterSpacing="2px" color="var(--Neutrals-Neutral-300)" mb={{ base: '15px', md: '25px' }}>
          {name}
        </Text>
        <Text fontSize={{ base: '20px', md: '26px' }} fontWeight={700} letterSpacing="2.6px" color="white">
          {formatCurrency(value, { symbol: '$', decimalPlaces: 2 })}
        </Text>
      </Box>
    </Box>
  )
}

export function TVLInfoPanelMobile({ tvl, volume }: { tvl: string | number; volume: string | number }) {
  const { t } = useTranslation()
  return (
    <VStack
      justifyContent="space-between"
      py={2}
      color={colors.textSecondary}
      px={appLayoutPaddingX}
      lineHeight={1}
    >
        {/* <Text fontSize="sm" fontWeight={400}>
          {t('common.tvl')}
        </Text>
        <Text fontSize="md" fontWeight={500}>
          {formatCurrency(tvl, { symbol: '$', abbreviated: true, decimalPlaces: 2 })}
        </Text> */}
        <TVLInfoItem name={t('common.tvl')} value={tvl} decoratorImageSrc="/images/tvl-lock.svg" />
        {/* <Text fontSize="sm" fontWeight={400}>
          {t('common.volume')}
        </Text>
        <Text fontSize="md" fontWeight={500}>
          {formatCurrency(volume, { symbol: '$', abbreviated: true, decimalPlaces: 2 })}
        </Text> */}
        <TVLInfoItem name={t('common.24h_volume')} value={volume} decoratorImageSrc="/images/volume-total.svg" />
    </VStack>
  )
}
