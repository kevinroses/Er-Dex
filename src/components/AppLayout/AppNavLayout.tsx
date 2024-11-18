import { useDisclosure } from '@/hooks/useDelayDisclosure'
import Image from 'next/image'
import RaydiumLogo from '@/icons/RaydiumLogo'
import AuraLogo from '@/icons/LogoVariation.png'
import RaydiumLogoOutline from '@/icons/RaydiumLogoOutline'
import ChevronDownIcon from '@/icons/misc/ChevronDownIcon'
import Gear from '@/icons/misc/Gear'
import { useAppStore } from '@/store'
import { colors } from '@/theme/cssVariables'
import { appLayoutPaddingX } from '@/theme/detailConfig'
import {
  Box,
  Flex,
  HStack,
  Menu,
  MenuButton,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text
} from '@chakra-ui/react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { ReactNode, useRef } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import MobileDesktop, { Desktop, Mobile } from '../MobileDesktop'
import SolWallet from '../SolWallet'
import { MobileBottomNavbar } from './MobileBottomNavbar'
import { ColorThemeSettingField } from './components/ColorThemeSettingField'
import { DefaultExplorerSettingField } from './components/DefaultExplorerSettingField'
import { LanguageSettingField } from './components/LanguageSettingField'
import { NavMoreButtonMenuPanel } from './components/NavMoreButtonMenuPanel'
import { RPCConnectionSettingField } from './components/RPCConnectionSettingField'
import { Divider } from './components/SettingFieldDivider'
import { SlippageToleranceSettingField } from './components/SlippageToleranceSettingField'
import { VersionedTransactionSettingField } from './components/VersionedTransactionSettingField'
// import { TransactionFeeSetting } from './components/TransactionFeeSetting'
import { PriorityButton } from './components/PriorityButton'
import DisclaimerModal from './components/DisclaimerModal'
import { keyframes } from '@emotion/react'
import AppVersion from './AppVersion'
import {SideMenu} from './components/SideMenu'

export interface NavSettings {
  // colorTheme: 'dark' | 'light'
}

function AppNavLayout({
  children,
  overflowHidden
}: {
  children: ReactNode
  /** use screen height */
  overflowHidden?: boolean
}) {
  const { t } = useTranslation()
  const { pathname } = useRouter()

  const betaTooltipRef = useRef<HTMLDivElement>(null)
  const { isOpen, onClose } = useDisclosure({ defaultIsOpen: true })
  const closeBetaTooltip = () => {
    if (betaTooltipRef.current) {
      betaTooltipRef.current.style.animation = `${fadeOut} 0.5s forwards`
      setTimeout(() => onClose(), 500)
    }
  }

  const fadeIn = keyframes`
  from { transform: translateY(-100%); }
  to { transform: translateY(0); }
`

  const fadeOut = keyframes`
  from { transform: translateY(0); }
  to { transform: translateY(-100%); }
`

  return (
    <Flex
      direction="column"
      id="app-layout"
      height="full"
      overflow={overflowHidden ? 'hidden' : 'auto'}
      bg="var(--Neutrals-Neutral-900)"
      position="relative" // To ensure proper layering of the content
      backgroundImage="url('/images/bg/aura-bg.png')" // Set the background image
      backgroundRepeat="no-repeat"
      backgroundPosition="center -330px" // Move the image further towards the top
      backgroundSize="1798px 1010px" // Explicitly set the background image size to 1920x1080
    >
      <HStack
        className="navbar"
        flex="none"
        height={['64px', '80px']}
        px={['20px', '38px']}
        gap={['4px', 'max(64px, 6.1vw)']}
        alignItems="center"
        justifyContent="space-between"
        bg="var(--modal-80)"
      >
        {/* logo */}
          <Box flex={'none'} cursor={'pointer'}>
            {/* <Link href="/swap">
              <RaydiumLogo />
            </Link> */}
            <SideMenu />
          </Box>

        {/* nav routes */}
        <Desktop>
          <HStack flexGrow={1} justify="center" overflow={['auto', 'visible']} gap={5} marginLeft={'10rem'}>
            <RouteLink href="/swap" isActive={pathname === '/swap'}>
              {t('swap.title')}
            </RouteLink>
            <RouteLink href="/liquidity-pools" isActive={pathname.includes('/liquidity')}>
              {t('liquidity.title')}
            </RouteLink>
            <Box flex={'none'}>
              <Link href="/swap">
                <Image src={AuraLogo} alt="Logo" width={50} height={50} style={{ marginTop: '20px' }} />
              </Link>
            </Box>
            <RouteLink href="/limit-order" isActive={pathname === '/limit-order'}>
              {t('limit_order.title')}
            </RouteLink>
            <RouteLink href="/portfolio" isActive={pathname === '/portfolio'}>
              {t('portfolio.title')}
            </RouteLink>
            <Menu size="lg">
              {/* <MenuButton fontSize={'lg'} px={4} py={2}>
                <Flex
                  align="center"
                  gap={0.5}
                  color={pathname === '/staking' || pathname === '/bridge' ? colors.textSecondary : colors.textTertiary}
                >
                  {pathname === '/staking' ? t('staking.title') : pathname === '/bridge' ? t('bridge.title') : t('common.more')}
                  <ChevronDownIcon width={16} height={16} />
                </Flex>
              </MenuButton> */}
              <NavMoreButtonMenuPanel />
            </Menu>
          </HStack>
        </Desktop>

        {/* wallet button */}
        <Flex gap={[0.5, 2]} align="center">
          {/* <PriorityButton /> */}
          <SettingsMenu />
          {/* <EVMWallet />  don't need currently yet*/}
          <SolWallet />
        </Flex>
      </HStack>

      <Box
        px={appLayoutPaddingX}
        pt={[0, 4]}
        flex={1}
        overflow={overflowHidden ? 'hidden' : 'auto'}
        display="flex"
        flexDirection="column"
        justifyItems={'flex-start'}
        sx={{
          scrollbarGutter: 'stable',
          contain: 'size',
          '& > *': {
            // for flex-col container
            flex: 'none'
          }
        }}
      >
        {children}
      </Box>
      <DisclaimerModal />
{/*
      <Mobile>
        <Box className="mobile_bottom_navbar" flex="none">
          <MobileBottomNavbar />
        </Box>
      </Mobile>
*/}
    </Flex>
  )
}

function RouteLink(props: { isActive?: boolean; children: ReactNode; href: string }) {
  return (
    <MobileDesktop
      pc={
        <Link href={props.href}>
          <Text
            as="span"
            textTransform="uppercase"
            textColor={props.isActive ? 'var(--Primary-Solana-Blue)' : 'white'}
            fontSize="lg"
            px={4}
            py={2}
            _hover={{
              bg: 'transparent',
              color: 'var(--Primary-Solana-Blue)'
            }}
          >
            {props.children}
          </Text>
        </Link>
      }
      mobile={
        props.isActive ? (
          <Link href={props.href}>
            <Text as="span" fontSize="xl" fontWeight={500} textColor={colors.textSecondary}>
              {props.children}
            </Text>
          </Link>
        ) : null
      }
    />
  )
}

function SettingsMenu() {
  const { isOpen, onClose, onOpen } = useDisclosure()
  const triggerRef = useRef<HTMLDivElement>(null)
  return (
    <>
      <Box
        w={10}
        h={10}
        p="0"
        onClick={() => onOpen()}
        _hover={{ bg: 'transparent' }}
        rounded="full"
        display="grid"
        placeContent="center"
        cursor="pointer"
        ref={triggerRef}
      >
        <Gear color="white" />
      </Box>
      <SettingsMenuModalContent isOpen={isOpen} onClose={onClose} triggerRef={triggerRef} />
    </>
  )
}

function SettingsMenuModalContent(props: { isOpen: boolean; triggerRef: React.RefObject<HTMLDivElement>; onClose: () => void }) {
  const contentRef = useRef<HTMLDivElement>(null)
  const { t } = useTranslation()
  const triggerPanelGap = 8
  const isMobile = useAppStore((s) => s.isMobile)
  const getTriggerRect = () => props.triggerRef.current?.getBoundingClientRect()

  return (
    <Modal size={'lg'} isOpen={props.isOpen} onClose={props.onClose}>
      <ModalOverlay />
      <ModalContent
        css={{
          transform: (() => {
            const triggerRect = getTriggerRect()
            return (
              triggerRect
                ? `translate(${isMobile ? 0 : -(window.innerWidth - triggerRect.right)}px, ${
                    triggerRect.bottom + triggerPanelGap
                  }px) !important`
                : undefined
            ) as string | undefined
          })()
        }}
        ref={contentRef}
        marginTop={0}
        marginRight={['auto', 0]}
      >
        <ModalHeader>{t('setting_board.panel_title')}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <SlippageToleranceSettingField />
          <Divider />
          <SlippageToleranceSettingField variant="liquidity" />
          <Divider />
          <VersionedTransactionSettingField />
          <Divider />
          <DefaultExplorerSettingField />
          {/* <Divider />
          <TransactionFeeSetting /> */}
          <Divider />
          <LanguageSettingField />
          <Divider />
          <ColorThemeSettingField />
          <Divider />
          <RPCConnectionSettingField />
          <Divider />
          <AppVersion />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default AppNavLayout
