import {
  Box,
  Drawer,
  DrawerBody,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  Text,
  HStack,
  useDisclosure
} from '@chakra-ui/react';
import { useTranslation } from 'react-i18next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import MenuIcon from '@/icons/MenuIcon';
import SwapIcon from '@/icons/SwapIcon';
import LimitOrderIcon from '@/icons/LimitOrderIcon';
import LiquidityIcon from '@/icons/LiquidityIcon';
import PerpsIcon from '@/icons/PerpsIcon';
import BlogIcon from '@/icons/BlogIcon';
import DocsIcon from '@/icons/DocsIcon';
import GuideIcon from '@/icons/GuideIcon';
import FAQIcon from '@/icons/FAQIcon';
import GlossaryIcon from '@/icons/GlossaryIcon';
import PartnersIcon from '@/icons/PartnersIcon';
import XcomIcon from '@/icons/XcomIcon';
import TelegramIcon from '@/icons/TelegramIcon';
import YoutubeIcon from '@/icons/YoutubeIcon';
import InstagramIcon from '@/icons/InstagramIcon';

const MenuItem = ({ path, icon: Icon, label }: { path: string; icon: any; label: string }) => {
  const router = useRouter(); // Get current pathname
  const isActive = router.pathname === path; // Determine if the menu item is active based on the pathname

  return (
    <Link href={path} passHref style={{width:'100%'}}>
      <HStack
        as="a"
        _hover={{ bg: 'var(--sol-hover)' }}
        _active={{ bg: 'var(--sol-hover)' }}
        bg={isActive ? 'var(--sol-hover)' : 'transparent'} // Set background for active item
        width="100%"
        px={4}
        py={2}
        borderRadius="md"
        transition="background-color 0.2s ease"
      >
        <Icon />
        <Text color="white">{label}</Text>
      </HStack>
    </Link>
  );
};

export function SideMenu() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { t } = useTranslation();
  const router = useRouter();

  const menuItems = [
    { path: '/swap', icon: SwapIcon, label: t('swap.title') },
    { path: '/limit-order', icon: LimitOrderIcon, label: t('limitOrder.title') },
    { path: '/liquidity-pools', icon: LiquidityIcon, label: t('liquidity.title') },
    // { path: '/perps', icon: PerpsIcon, label: t('perps.title') },
    { path: '/blog', icon: BlogIcon, label: t('blog.title') },
    { path: '/docs', icon: DocsIcon, label: t('docs.title') },
    { path: '/guide', icon: GuideIcon, label: t('guide.title') },
    { path: '/faq', icon: FAQIcon, label: t('faq.title') },
    { path: '/glossary', icon: GlossaryIcon, label: t('glossary.title') },
    { path: '/partners', icon: PartnersIcon, label: t('partners.title') },
    { path: 'https://x.com', icon: XcomIcon, label: 'X.com' },
    { path: 'https://t.me', icon: TelegramIcon, label: 'Telegram' },
    { path: 'https://youtube.com', icon: YoutubeIcon, label: 'YouTube' },
    { path: 'https://instagram.com', icon: InstagramIcon, label: 'Instagram' },
  ];

  return (
    <>
      <MenuIcon onClick={onOpen} />

      {/* Side menu */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg="var(--modal-80)">
          <DrawerCloseButton color="white" />
          <DrawerBody>
            <VStack align="start" spacing={4} mt={10} width="100%">
              {menuItems.map((item, idx) => (
                <MenuItem key={idx} path={item.path} icon={item.icon} label={item.label} />
              ))}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}
