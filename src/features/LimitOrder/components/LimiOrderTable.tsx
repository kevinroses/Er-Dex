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
  InputGroup
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
        
        <ComponentExampleGroup>
            <InputGroup>
                <InputLeftElement pointerEvents="none">
                    <SearchIcon />
                </InputLeftElement>
                <Input placeholder="Search all" />
            </InputGroup>
        </ComponentExampleGroup>
    </>
);

// Fixed component export and syntax
const LimitOrderTable = () => {
    return (
        <OrderTable />
    );
};

export default LimitOrderTable;