import React from 'react';
import {
  Box,
  Button,
  Collapse,
  Flex,
  HStack,
  SimpleGrid,
  Text,
  useDisclosure,
  CircularProgress,
  GridItem,
  Grid,
  NumberInput as ChakraNumberInput,
  NumberInputField, Link,
  VStack,
  InputLeftElement,
  Input,
  InputGroup,
  InputRightElement,
  Icon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td
} from '@chakra-ui/react'
import { ComponentExampleGroup } from '../../../features/ComponentSpecification/components/ComponentExamplePanel'
import SearchIcon from '@/icons/misc/SearchIcon'



// Order Table Component
const OrderTable = () => (
    <>
        <VStack spacing={4} w="full">
            <Flex w="full" py={4} justify="space-between" align="center">
                <HStack spacing={6}>
                    <Button
                        px={4}
                        py={2}
                        bg="#131517"
                        rounded="lg"
                        color="white"
                        fontSize="sm"
                        fontWeight="medium"
                        border="1px"
                        borderColor="white"
                    >
                        OPEN ORDERS
                    </Button>
                    <Button
                        px={4}
                        py={2}
                        color="gray.400"
                        fontSize="sm"
                        fontWeight="medium"
                        _hover={{ color: "white" }}
                        variant="ghost"
                    >
                        ORDER HISTORY
                    </Button>
                </HStack>

                <Flex gap={4}>
                    <Button
                        px={4}
                        py={2}
                        bg="#131517"
                        rounded="lg"
                        color="white"
                        fontSize="sm"
                        fontWeight="medium"
                        border="1px"
                        borderColor="white"
                        display="flex"
                        alignItems="center"
                        gap={2}
                    >

                        REFETCH DATA
                    </Button>
                    <Button
                        px={4}
                        py={2}
                        bg="#131517"
                        rounded="lg"
                        color="gray.400"
                        fontSize="sm"
                        fontWeight="medium"
                        border="1px"
                        borderColor="white"
                        display="flex"
                        alignItems="center"
                        gap={2}
                        _hover={{ color: "white" }}
                    >

                        CANCEL ALL
                    </Button>
                </Flex>
            </Flex>
        </VStack>
    </>
);

const SearchBar = () => {
  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" w="full">
      <InputGroup maxW="440px" bg="transparent" borderRadius="lg"
       sx={{
        border: '1px solid var(--Neutrals-Neutral-500)',
        bg: 'var(--Neutrals-Neutral-800)',
        borderRadius: '10px',
        padding: '10px'
      }}
      >
        <Input
          type="text"
          placeholder="Search by order name, expiry, price, etc."
          borderRadius="lg"
          h="44px"
          pl="16px"
          w="100%"
          color="white"
          fontSize="14px"
          border="none"
          bg="transparent"
          _hover={{ background: "transparent" }}
          _focus={{ 
            boxShadow: "none",
            background: "transparent"
          }}
        />
        <InputRightElement h="100%" pr="3">
          <Icon as={SearchIcon} color="white" boxSize="20px" />
        </InputRightElement>
      </InputGroup>

      <Button
        ml="16px"
        w="56px"
        h="56px"
        bg="var(--Neutrals-Neutral-500)"
        border="1px"
        minW="56px"
        borderRadius="lg"
        _hover={{ bg: "#1A1B1E" }}
        _active={{ bg: "#1A1B1E" }}
      >
        <Icon
          viewBox="0 0 32 32"
          boxSize="20px"
          color="#6366F1"
        >
        
<path d="M26.6663 7.46659C26.6663 6.71992 26.6663 6.34659 26.5197 6.06125C26.3923 5.81047 26.1888 5.60649 25.9383 5.47859C25.653 5.33325 25.2797 5.33325 24.533 5.33325H7.46634C6.71967 5.33325 6.34634 5.33325 6.06101 5.47859C5.81014 5.60641 5.60617 5.81038 5.47834 6.06125C5.33301 6.34659 5.33301 6.71992 5.33301 7.46659V8.44925C5.33301 8.77592 5.33301 8.93859 5.37034 9.09192C5.40299 9.22843 5.45699 9.35892 5.53034 9.47859C5.61167 9.61192 5.72767 9.72792 5.95701 9.95859L12.7077 16.7079C12.9383 16.9386 13.0543 17.0546 13.1357 17.1879C13.209 17.3079 13.2637 17.4386 13.2957 17.5746C13.333 17.7266 13.333 17.8879 13.333 18.2066V24.5479C13.333 25.6906 13.333 26.2626 13.573 26.6066C13.6771 26.7554 13.8106 26.8813 13.9651 26.9767C14.1196 27.0721 14.292 27.1349 14.4717 27.1613C14.8863 27.2226 15.3983 26.9679 16.4197 26.4559L17.4863 25.9226C17.9157 25.7093 18.129 25.6026 18.285 25.4426C18.4234 25.3013 18.5286 25.1309 18.593 24.9439C18.6663 24.7333 18.6663 24.4933 18.6663 24.0146V18.2173C18.6663 17.8906 18.6663 17.7279 18.7037 17.5746C18.7363 17.4381 18.7903 17.3076 18.8637 17.1879C18.9437 17.0546 19.0597 16.9399 19.2863 16.7133L19.2917 16.7079L26.0423 9.95859C26.2717 9.72792 26.3863 9.61192 26.469 9.47859C26.5425 9.35898 26.5965 9.22847 26.629 9.09192C26.6663 8.94125 26.6663 8.77859 26.6663 8.45992V7.46659Z" stroke="white" stroke-width="2.66667" stroke-linecap="round" stroke-linejoin="round"/>


        </Icon>
      </Button>
    </Box>
  );
};

const OrderListTable = () => {
  return (
    <Box
      border="1px"
      borderColor="purple.700"
      borderRadius="lg"
      bg="blackAlpha.900"
      w="100%"
      p="32px"
    >
      <Table variant="simple">
        {/* Table Header */}
        <Thead bg="primary.100" borderRadius="lg" >
          <Tr>
            <Th color="white" fontSize="sm">
              <Flex align="center">
                Order Info
              </Flex>
            </Th>
            <Th color="white" fontSize="sm">
              <Flex align="center">
                Price
              </Flex>
            </Th>
            <Th color="white" fontSize="sm">
              Expiry
            </Th>
            <Th color="white" fontSize="sm">
              <Flex align="center">
                Filled Size
              </Flex>
            </Th>
            <Th color="white" fontSize="sm">
              Action
            </Th>
          </Tr>
        </Thead>

        {/* Table Body */}
        <Tbody>
          <Tr bg="purple.900" _hover={{ bg: "purple.800" }}>
            {/* Order Info */}
            <Td color="white" fontSize="sm">
              <Flex align="center">
                <Icon viewBox="0 0 24 24" boxSize="5" mr={2}>
                  {/* Sample SVG */}
                  <circle cx="12" cy="12" r="10" fill="#6264F3" />
                </Icon>
                <Text>23 ETH → 40 SOL</Text>
              </Flex>
            </Td>

            {/* Price */}
            <Td color="white" fontSize="sm">
              170.9 SOL per $ETH
            </Td>

            {/* Expiry */}
            <Td color="white" fontSize="sm">
              Never
            </Td>

            {/* Filled Size */}
            <Td color="white" fontSize="sm">
              0 / 0.1 SOL (0.00%)
            </Td>

            {/* Action */}
            <Td>
              <Button
                size="sm"
                colorScheme="gray"
                variant="outline"
                color="white"
                _hover={{ bg: "whiteAlpha.200" }}
              >
                Close
              </Button>
            </Td>
          </Tr>
        </Tbody>
      </Table>
    </Box>
  );
};



const LimitOrderTable = () => {
    return (
        <>
            <OrderTable />
            <SearchBar/>
            <OrderListTable/>
        </>
    );
};

export default LimitOrderTable;