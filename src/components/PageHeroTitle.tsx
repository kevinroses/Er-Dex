import { useAppStore } from '@/store'
import { heroGridientColorCSSBlock } from '@/theme/cssBlocks'
import { Text, VStack } from '@chakra-ui/react'

export default function PageHeroTitle({ title, description }: { title: string; description?: string }) {
  const isMobile = useAppStore((s) => s.isMobile)

  // Function to render the highlighted "Li" in any text
  const renderWithHighlight = (text: string) => {
    // Split by "Li" or "li" (case-insensitive)
    // const parts = text.split(/(Li)/i);
    const parts = [text];

    return parts.map((part, index) => 
      part.toLowerCase() === 'li' ? (
        <Text
          as="span"
          key={index}
          bg="#ffe81a"
          color="black"
          fontWeight="bold"
          px={1}
          borderRadius="sm" 
          display="inline" 
        >
          {part}
        </Text>
      ) : (
        <Text as="span" key={index} display="inline">
          {part}
        </Text> 
      )
    );
  };

  return (
    <VStack align="flex-start" px="25px" py="20px">
      <Text {...heroGridientColorCSSBlock} color="white" fontSize="2xl" fontWeight="bold">
        {renderWithHighlight(title)}
      </Text>
      {description && (
        <Text fontSize={['sm', 'md']} color="blue.200">
          {renderWithHighlight(description)}
        </Text>
      )}
    </VStack>
  )
}
