import { colors } from '@/theme/cssVariables'
import { Flex } from '@chakra-ui/react'
import { AprData } from '@/features/Clmm/utils/calApr'

export const aprColors = [colors.chart03 /* fee color */, colors.chart02, colors.chart04, colors.chart05, colors.chart06, colors.chart07]
export const emptyAprColor = aprColors[0]

export function PoolListItemAprLine({ aprData }: { aprData: AprData }) {
  const haveApr = aprData.fee.apr > 0 || aprData.rewards.some((apr) => apr.percentInTotal !== 0)

  return (
    <Flex gap={0.5} maxWidth={['100px', 'unset']}>
    {haveApr ? (
      [aprData.fee, ...aprData.rewards].map(({ percentInTotal: percent }, idx) => {
        console.log('Percent:', percent); // Log percent to see values
        return (
          <div
            key={idx}
            style={{
              width: percent + '%',
              height: '15px',
              borderRadius: '999px',
              backgroundColor: idx === 0 ? 'var(--Primary-Solana-Blue-Link)' : 'var(--Primary-Solana-Blue)', 
            }}
          />
        );
      })
    ) : (
      <div
        style={{
          width: '100%',
          height: '15px',
          borderRadius: '999px',
          opacity: 0.3,
          backgroundColor: 'var(--Primary-Solana-Purple)',
          filter: 'contrast(.8)',
        }}
      ></div>
    )}
  </Flex>
  
  )
}
