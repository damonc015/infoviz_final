'use client'
import React, { useState, useEffect } from 'react'
import { csv } from 'd3'
import Mapcontainer from './Mapcontainer'
import Chartcontainer from './Chartcontainer'
import Multichart from './Multichart'
import {
  Flex,
  Box,
  Button,
  Tabs,
  TabList,
  Tab,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure
} from '@chakra-ui/react'

const Container = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [showChart, setShowChart] = useState('single')
  const [data, setData] = useState(null)
  const [isMapMounted, setIsMapMounted] = useState(false)

  const drawerControls = { onOpen, onClose }

  useEffect(() => {
    if (isOpen && !isMapMounted) {
      setIsMapMounted(true)
    }
  }, [isOpen])

  useEffect(() => {
    csv('/Airline_Delay_Cause.csv')
      .then((csvData) => {
        setData(csvData)
        console.log(csvData)
      })
      .catch((error) => {
        console.error('Error loading CSV:', error)
      })
  }, [])

  return (
    <Flex direction="column" h="100vh">
      <Box as="nav" bg="blue.500" color="white" p={4}>
        <Tabs
          variant="enclosed"
          colorScheme="blue"
          onChange={(index) => {
            if (index === 0) setShowChart('single')
            else if (index === 1) setShowChart('compareAirports')
            else if (index === 2) setShowChart('compareAirlines')
          }}>
          <TabList>
            <Tab
              _selected={{
                bg: '#466a9e',
                color: 'white',
                border: '1px solid white'
              }}
              _hover={{
                bg: '#5686c2',
                border: '1px solid white'
              }}
              mx={1}>
              Airport
            </Tab>
            <Tab
              _selected={{
                bg: '#466a9e',
                color: 'white',
                border: '1px solid white'
              }}
              _hover={{
                bg: '#5686c2',
                border: '1px solid white'
              }}
              mx={1}>
              Compare Airports
            </Tab>
            <Tab
              _selected={{
                bg: '#466a9e',
                color: 'white',
                border: '1px solid white'
              }}
              _hover={{
                bg: '#5686c2',
                border: '1px solid white'
              }}
              mx={1}>
              Compare Airlines
            </Tab>
          </TabList>
        </Tabs>
      </Box>

      <Drawer isOpen={isOpen} placement="top" onClose={onClose} size="full">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton size="lg" p={6} fontSize="20px" />
          <DrawerHeader>Select Airport</DrawerHeader>
          <DrawerBody>
            <div style={{ display: isMapMounted ? 'block' : 'none' }}>
              <Mapcontainer data={data} />
            </div>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {showChart === 'single' && <Chartcontainer data={data} />}
      {showChart === 'compareAirports' && (
        <Multichart
          type="airports"
          data={data}
          drawerControls={drawerControls}
        />
      )}
      {showChart === 'compareAirlines' && (
        <Multichart
          type="airlines"
          data={data}
          drawerControls={drawerControls}
        />
      )}
    </Flex>
  )
}

export default Container
