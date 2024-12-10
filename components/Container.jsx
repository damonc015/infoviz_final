'use client'
import React, { useState, useEffect } from 'react'
import { csv } from 'd3'
import Mapcontainer from './Mapcontainer'
import Chartcontainer from './Chartcontainer'
import Multichart from './Multichart'
import { Flex, Box, Button } from '@chakra-ui/react'

const Container = () => {
  const [showMap, setShowMap] = useState(true)
  const [showChart, setShowChart] = useState("single")
  const [data, setData] = useState(null)

  useEffect(() => {
    csv('/Airline_Delay_Cause.csv').then(csvData => {
      setData(csvData)
      console.log(csvData)
    }).catch(error => {
      console.error('Error loading CSV:', error)
    })
  }, [])

  return (
    <Flex direction="column" h="100vh">
    <Box as="nav" bg="blue.500" color="white" p={4}>
      <Box as="ul" display="flex" listStyleType="none" p={0} m={0}>
        <Box as="li" m={1}>
          <Button as="a" colorScheme="whiteAlpha" variant="outline">Airports</Button>
        </Box>
        <Box as="li" m={1}>
          <Button as="a" colorScheme="whiteAlpha" variant="outline">Compare Airports</Button>
        </Box>
        <Box as="li" m={1}>
          <Button as="a" colorScheme="whiteAlpha" variant="outline">Compare Airlines</Button>
        </Box>
      </Box>
    </Box>
      {showMap && <Mapcontainer data={data} />}
      {showChart && <Chartcontainer data={data} />}
      <Multichart data={data} />
    </Flex>
  )
}

export default Container
