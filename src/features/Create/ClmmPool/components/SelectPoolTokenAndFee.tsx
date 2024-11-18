import PanelCard from '@/components/PanelCard'
import TokenAvatar from '@/components/TokenAvatar'
import TokenAvatarPair from '@/components/TokenAvatarPair'
import TokenSelectDialog from '@/components/TokenSelectDialog'
import useFetchPoolByMint from '@/hooks/pool/useFetchPoolByMint'
import SubtractIcon from '@/icons/misc/SubtractIcon'
import EditIcon from '@/icons/misc/EditIcon'
import CheckCircleIcon from '@/icons/misc/CircleCheckFill'
import { useClmmStore } from '@/store/useClmmStore'
import { colors } from '@/theme/cssVariables/colors'
import ConnectedButton from '@/components/ConnectedButton'
import { Select } from '@/components/Select'
import useTokenPrice from '@/hooks/token/useTokenPrice'
import { useTokenStore } from '@/store'
import { Box, Flex, HStack, VStack, Tag, Text, useDisclosure, SystemStyleObject, Grid } from '@chakra-ui/react'
import { ApiClmmConfigInfo, ApiV3Token, PoolFetchType, TokenInfo, solToWSol } from '@/raydium-io/raydium-sdk-v2'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ChevronDown, ChevronUp } from 'react-feather'
import { useTranslation } from 'react-i18next'
import { percentFormatter } from '@/utils/numberish/formatter'

type Side = 'token1' | 'token2'

interface Props {
  completed: boolean
  isLoading: boolean
  show: boolean
  initState?: {
    token1?: ApiV3Token
    token2?: ApiV3Token
    config?: ApiClmmConfigInfo
  }
  onConfirm: (props: { token1: ApiV3Token; token2: ApiV3Token; ammConfig: ApiClmmConfigInfo }) => void
  onEdit: (step: number) => void
}

const SelectBoxSx: SystemStyleObject = {
  minW: '120px',
  cursor: 'pointer',
  py: '2',
  px: '4'
}

// Custom Fee Tier Card Component
// Custom Fee Tier Card Component
function FeeTierCard({ value, description, isSelected, onClick }: any) {
  const barHeights: { '0.01': number[]; '0.05': number[]; '0.25': number[]; '1': number[] } = {
    '0.01': [80, 80, 80, 80, 80, 80, 80],
    '0.05': [80, 60, 80, 60, 80, 60, 80],
    '0.25': [80, 65, 80, 65, 80, 65, 80],
    '1': [80, 65, 75, 35, 65, 45, 80]
  }

  return (
    <Box
      as="button"
      flex="1"
      p={4}
      bg="var(--Neutrals-Neutral-800)"
      borderWidth="1px"
      borderColor={isSelected ? 'var(--Primary-Solana-Purple)' : 'var(--Neutrals-Neutral-500)'}
      borderRadius="lg"
      cursor="pointer"
      textAlign="center"
      onClick={onClick}
      position="relative"
      transition="all 0.3s"
      _hover={{ borderColor: 'var(--Primary-Solana-Purple)' }}
      _active={{
        borderColor: 'var(--Primary-Solana-Purple)',
        transform: 'scale(0.98)', // Slight scale to simulate press
        transition: 'transform 0.1s'
      }}
    >
      <VStack>
        <Text fontSize="lg" fontWeight="bold" color="white">
          {value}%
        </Text>
        <Text fontSize="sm" color={colors.textSecondary}>
          {description}
        </Text>
        {/* Custom CSS-based bar chart */}
        <Box display="flex" justifyContent="center" flexDirection="row" mt={3} height="50px" width="100%">
          {barHeights[value as '0.01' | '0.05' | '0.25' | '1']?.map((height: number, idx: number) => (
            <Box
              key={idx}
              display="flex"
              flexDirection="column-reverse" // This makes the bars grow/shrink from the bottom
              width={['5px', '25px']}
              height="50px"
              margin="0 2px"
            >
              <Box
                width="100%"
                height={`${height}%`} // Set the height based on the percentage
                background="linear-gradient(180deg, #AF1CC1 0%, #F0B7F8 100%)"
                borderRadius="8px 8px 0px 0px" // Rounded top corners only
              />
            </Box>
          ))}
        </Box>
        {isSelected && (
          // You can customize this with a larger or more visible icon
          <Box
            position="absolute"
            top="10px"
            right="10px"
            background="var(--Primary-Solana-Purple)"
            borderRadius="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
            p={1}
            width="25px"
            height="25px"
          >
            <CheckCircleIcon style={{ color: 'white', width: '16px', height: '16px' }} />
          </Box>
        )}
      </VStack>
    </Box>
  )
}

export default function SelectPoolTokenAndFee({ completed, initState, show, isLoading, onConfirm, onEdit }: Props) {
  const { t } = useTranslation()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const clmmFeeConfigs = useClmmStore((s) => s.clmmFeeConfigs)
  const clmmFeeOptions = Object.values(clmmFeeConfigs)
  const [tokens, setTokens] = useState<{
    token1?: ApiV3Token
    token2?: ApiV3Token
  }>({ token1: initState?.token1, token2: initState?.token2 })
  const { token1, token2 } = tokens
  const [currentConfig, setCurrentConfig] = useState<ApiClmmConfigInfo | undefined>(initState?.config)
  const poolKey = `${token1?.address}-${token2?.address}`
  const selectRef = useRef<Side>('token1')

  useTokenPrice({
    mintList: token1 && token2 ? [token1.address, token2.address] : [],
    timeout: 100
  })
  const whiteListMap = useTokenStore((s) => s.whiteListMap)

  const { data, isLoading: isExistingLoading } = useFetchPoolByMint({
    shouldFetch: !!token1 && !!token2,
    mint1: token1 ? solToWSol(token1.address).toString() : '',
    mint2: token2 ? solToWSol(token2.address || '').toString() : '',
    type: PoolFetchType.Concentrated
  })

  const existingPools: Map<string, string> = useMemo(
    () =>
      (data || [])
        .filter((pool) => {
          const [token1Mint, token2Mint] = [
            token1 ? solToWSol(token1.address).toString() : '',
            token2 ? solToWSol(token2.address || '').toString() : ''
          ]
          return (
            (pool.mintA?.address === token1Mint && pool.mintB?.address === token2Mint) ||
            (pool.mintA?.address === token2Mint && pool.mintB?.address === token1Mint)
          )
        })
        .reduce((acc, cur) => acc.set(cur.id, cur.config.id), new Map()),
    [token1?.address, token2?.address, data]
  )

  const isSelectedExisted = !!currentConfig && new Set(existingPools.values()).has(currentConfig.id)
  useEffect(() => () => setCurrentConfig(undefined), [poolKey, isSelectedExisted])

  useEffect(() => {
    if (isExistingLoading) return
    const defaultConfig = Object.values(clmmFeeConfigs || {}).find((c) => c.tradeFeeRate === 2500)
    if (!new Set(existingPools.values()).has(defaultConfig?.id || '')) {
      if (defaultConfig) setCurrentConfig((preConfig) => preConfig || defaultConfig)
      return
    }
  }, [poolKey, existingPools, clmmFeeConfigs, isExistingLoading])

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      selectRef.current = e.currentTarget.dataset['side'] as Side
      onOpen()
    },
    [onOpen]
  )

  const handleSelect = useCallback((val: ApiV3Token) => {
    if (val?.tags.includes('hasFreeze') && !whiteListMap.has(val.address)) {
      return
    }
    onClose()
    setTokens((preVal) => {
      const anotherSide = selectRef.current === 'token1' ? 'token2' : 'token1'
      const isDuplicated = val.address === preVal[anotherSide]?.address
      return { [anotherSide]: isDuplicated ? undefined : preVal[anotherSide], [selectRef.current]: val }
    })
  }, [])

  const handleConfirm = () => {
    onConfirm({
      token1: tokens.token1!,
      token2: tokens.token2!,
      ammConfig: currentConfig!
    })
  }

  let error = tokens.token1 ? (tokens.token2 ? undefined : 'common.quote_token') : 'common.base_token'
  error = error || (currentConfig ? undefined : 'field.fee_tier')

  if (!show) return null

  const feeTierOptions = [
    { value: '0.01', description: 'Best for very stable pairs' },
    { value: '0.05', description: 'Best for tighter ranges' },
    { value: '0.25', description: 'Best for most pairs' },
    { value: '1', description: 'Best for exotic pairs' }
  ]

  if (completed) {
    return (
      <PanelCard px={[3, 6]} py="3">
        <Flex justifyContent="space-between" alignItems="center">
          <Flex gap="2" alignItems="center">
            <TokenAvatarPair {...tokens} />
            <Text fontSize="lg" fontWeight="500" color={colors.textPrimary}>
              {tokens.token1?.symbol} / {tokens.token2?.symbol}
            </Text>
            <Tag size="sm" variant="rounded">
              {t('field.fee')} {percentFormatter.format((currentConfig?.tradeFeeRate || 0) / 1000000)}
            </Tag>
          </Flex>
          <EditIcon cursor="pointer" onClick={() => onEdit(0)} />
        </Flex>
      </PanelCard>
    )
  }

  return (
    <PanelCard p={[1, 6]} bg="transparent" shadow="none">
      <Text variant="title" mb="4">
        {t('common.tokens')}
      </Text>

      {/* Tokens Selection Section */}
      <Flex gap="2" alignItems="center" mb="6" flexDirection="row" width="100%">
        <Box
          data-side="token1"
          flex="1"
          bg="var(--Neutrals-Neutral-800)"
          border="1px solid var(--Neutrals-Neutral-500)"
          rounded="xl"
          onClick={handleClick}
          sx={SelectBoxSx}
          width="100%"
          mb="0"
        >
          <Text variant="label" mb="2">
            {t('common.base_token')}
          </Text>
          <Flex gap="2" alignItems="center" justifyContent="space-between">
            {tokens.token1 ? (
              <Flex gap="2" alignItems="center">
                <TokenAvatar token={tokens.token1} />
                <Text variant="title" color={colors.textPrimary}>
                  {tokens.token1.symbol}
                </Text>
              </Flex>
            ) : (
              <Text variant="title" fontSize="lg" opacity="0.5">
                {t('common.select')}
              </Text>
            )}
            <ChevronDown color={colors.textSecondary} opacity="0.5" />
          </Flex>
        </Box>

        <Box
          data-side="token2"
          flex="1"
          bg="var(--Neutrals-Neutral-800)"
          border="1px solid var(--Neutrals-Neutral-500)"
          rounded="xl"
          onClick={handleClick}
          sx={SelectBoxSx}
          width="100%"
          mb="0"
        >
          <Text variant="label" mb="2">
            {t('common.quote_token')}
          </Text>
          <Flex gap="2" alignItems="center" justifyContent="space-between">
            {tokens.token2 ? (
              <Flex gap="2" alignItems="center">
                <TokenAvatar token={tokens.token2} />
                <Text variant="title" color={colors.textPrimary}>
                  {tokens.token2.symbol}
                </Text>
              </Flex>
            ) : (
              <Text variant="title" fontSize="lg" opacity="0.5">
                {t('common.select')}
              </Text>
            )}
            <ChevronDown color={colors.textSecondary} opacity="0.5" />
          </Flex>
        </Box>
      </Flex>

      <TokenSelectDialog
        onClose={onClose}
        isOpen={isOpen}
        filterFn={(t: TokenInfo) => t.address !== tokens[selectRef.current]?.address}
        onSelectValue={handleSelect}
      />

      {/* Fee Tier Selection Section */}
      <Text variant="title" mb="4">
        {t('field.fee_tier')}
      </Text>
      <Grid templateColumns={['1fr 1fr', '1fr 1fr 1fr 1fr']} gap={4} mb={6} width="100%">
        {feeTierOptions.map((option) => (
          <FeeTierCard
            key={option.value}
            value={option.value}
            description={option.description}
            isSelected={currentConfig?.tradeFeeRate === Number(option.value) * 10000}
            onClick={() => {
              //----------- should be updated when syncing with backend @han

              const feeTier = Number(option.value) * 10000
              console.log(clmmFeeOptions)
              const config = clmmFeeOptions.find((feeOption) => feeOption.tradeFeeRate === feeTier)
              console.log(config)
              if (config) {
                console.log(`existingPools`, existingPools)
                const existed = new Set(existingPools.values()).has(config.id)
                console.log(`pool existed: ${existed}`)
                const selected = currentConfig?.id === config.id
                !existed && !selected && setCurrentConfig(config)
                setCurrentConfig(config)
              }

              // mockup data for FE @han
              // setCurrentConfig({
              //   id: '11',
              //   index: 12,
              //   protocolFeeRate: 0.5,
              //   tickSpacing: 12,
              //   fundFeeRate: 12,
              //   defaultRange: 12,
              //   defaultRangePoint: [],
              //   tradeFeeRate: Number(option.value) * 1000000
              // })
              //end
            }}
          />
        ))}
      </Grid>

      <ConnectedButton
        mt="8"
        isDisabled={!!error || !currentConfig}
        isLoading={isLoading || isExistingLoading}
        onClick={handleConfirm}
        width="100%"
      >
        {error ? `${t('common.select')} ${t(error)}` : t('button.continue')}
      </ConnectedButton>
    </PanelCard>
  )
}
