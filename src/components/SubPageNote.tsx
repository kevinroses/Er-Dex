import ExclaimationOctagon from '@/icons/misc/ExclaimationOctagon'
import { useAppStore } from '@/store'
import { panelCard } from '@/theme/cssBlocks'
import { colors } from '@/theme/cssVariables'
import { Box, BoxProps, Flex, HStack, Text } from '@chakra-ui/react'

type SubPageNoteProps = {
  title: React.ReactNode
  description: React.ReactNode
}

/** This board is often for a subPage link create-pool edit-farm, to describe how to use this section */
export default function SubPageNote({ title, description, ...boxProps }: SubPageNoteProps & Omit<BoxProps, keyof SubPageNoteProps>) {
  const isMobile = useAppStore((s) => s.isMobile)

  return (
    <>
      {isMobile ? (
        <Box
          {...panelCard}
          borderRadius={'20px'}
          px={4}
          py={5}
          mt={2}
          mb={6}
          {...boxProps}
          bg={"#48F4FF14"}
          border={`1px solid #48F4FF`}
        >
          <HStack align={'flex-start'} spacing={3}>
            <Flex flexGrow={1} direction="row">
              <Box pr={2}>
                <ExclaimationOctagon color={colors.textSecondary} />
              </Box>
              <Flex direction="column">
                {/* Render title and description separately to avoid hydration issues */}
                <Text color={colors.textSecondary} fontSize="sm" fontWeight={500}>
                  {title}
                </Text>
                <Text color={colors.textSecondary} fontSize="sm">
                  {description}
                </Text>
              </Flex>
            </Flex>
          </HStack>
        </Box>
      ) : (
        <Box
          {...panelCard}
          borderRadius={'20px'}
          border="2px solid var(--System-Info)"
          px={6}
          py={6}
          {...boxProps}
          bg="var(--Glass-Card)"
          sx={{
           backdropFilter:"blur(12px)"
          }}
        >
          <HStack align={'flex-start'} spacing={3}>
            <Flex flexGrow={1} direction="column">
              <HStack justify={'space-between'}>
                <HStack>
                  <Flex align="center">
                    <ExclaimationOctagon color="var(--System-Info)" />
                  </Flex>
                  <Text color={colors.textSecondary} fontWeight={500} fontSize="md">
                    {title}
                  </Text>
                </HStack>
              </HStack>
              <Text pt={3} as="div" color={colors.textSecondary} fontSize="sm">
                {description}
              </Text>
            </Flex>
          </HStack>
        </Box>
      )}
    </>
  )
}
