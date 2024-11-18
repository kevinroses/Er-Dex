import { HStack, Text, useDisclosure } from '@chakra-ui/react'
import { useTranslation } from 'react-i18next'

import Button from '@/components/Button'
import { Desktop, Mobile } from '@/components/MobileDesktop'
import { CreatePoolEntryDialog } from '@/features/Create/components/CreatePoolEntryDialog'
import PlusCircleIcon from '@/icons/misc/PlusCircleIcon'

export type PoolType = 'standard' | 'concentrated'

export default function CreatePoolButton() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { t } = useTranslation()

  return (
    <>
      <Mobile>
        <Button
          onClick={onOpen}
          bg="var(--button-primary)"
          _hover={{ bg: 'var(--button-primary)' }} 
          color="white"
        >
          {t('liquidity.create_pool')}
        </Button>
      </Mobile>
      <Desktop>
        <Button
          onClick={onOpen}
          bg="var(--button-primary)"
          _hover={{ bg: 'var(--button-primary)' }} 
          color="white"
        >
          {t('liquidity.create_pool')}
        </Button>
      </Desktop>
      <CreatePoolEntryDialog isOpen={isOpen} onClose={onClose} />
    </>
  )
}
