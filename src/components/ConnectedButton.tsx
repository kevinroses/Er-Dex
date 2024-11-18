import { useAppStore } from '@/store'
import { Button, ButtonProps } from '@chakra-ui/react'
import { useWalletModal } from '@solana/wallet-adapter-react-ui'
import { LegacyRef, PropsWithChildren, forwardRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'

type Props = PropsWithChildren<ButtonProps>

export default forwardRef(function ConnectedButton({isLoading, children, onClick, isDisabled, ...props }: Props, ref: LegacyRef<HTMLButtonElement>) {
  const { t } = useTranslation()
  const connected = useAppStore((s) => s.connected)
  const { setVisible } = useWalletModal()
  const handleClick = useCallback(() => setVisible(true), [setVisible])

  return (
    <Button
      ref={connected ? ref : undefined}
      {...props}
      isDisabled={connected ? isDisabled : false}
      onClick={connected ? onClick : handleClick}
      bg={isLoading ? 'var(--button-primary)' : 'var(--button-primary)'}
      textColor={'white'}
      textTransform={'uppercase'}
      _hover={{ bg: 'var(--button-primary)' }}
    >
      {connected ? children : t('button.connect_wallet')}
    </Button>
  )
})
