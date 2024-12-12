'use client'
import React, { useState, useMemo } from 'react'
import Pie from './chartcontainer/Pie'
import {
  Button,
  Box,
  Text,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  Grid,
  GridItem,
  Flex
} from '@chakra-ui/react'

const Chartcontainer = ({ data, mainAirport, drawerControls }) => {
  const years =
    data && mainAirport && data[mainAirport]
      ? Object.keys(data[mainAirport])
          .filter((key) => !isNaN(key))
          .map(Number)
      : [2013]
  const minYear = years.length > 0 ? Math.min(...years) : 2013
  const maxYear = years.length > 0 ? Math.max(...years) : 2013

  const [rangeValues, setRangeValues] = useState([minYear, minYear])

  const filteredData = useMemo(() => {
    if (!data || !mainAirport || !data[mainAirport]) return null

    let totalDelays = {
      'Carrier Delay': 0,
      'Weather Delay': 0,
      'NAS Delay': 0,
      'Security Delay': 0,
      'Late Aircraft Delay': 0
    }

    // Loop through selected years
    for (let year = rangeValues[0]; year <= rangeValues[1]; year++) {
      if (data[mainAirport][year]) {
        // Loop through all months
        Object.values(data[mainAirport][year]).forEach((monthData) => {
          // Sum up delays from all carriers in each month
          Object.values(monthData).forEach((carrierData) => {
            totalDelays['Carrier Delay'] += carrierData.carrier_delay || 0
            totalDelays['Weather Delay'] += carrierData.weather_delay || 0
            totalDelays['NAS Delay'] += carrierData.nas_delay || 0
            totalDelays['Security Delay'] += carrierData.security_delay || 0
            totalDelays['Late Aircraft Delay'] += carrierData.late_aircraft_delay || 0
          })
        })
      }
    }

    // Convert to array format for D3
    return Object.entries(totalDelays)
      .map(([name, value]) => ({ name, value }))
      .filter((item) => item.value > 0) // Only include delays > 0
  }, [data, mainAirport, rangeValues])

  return (
    <Grid
      templateColumns="40% 60%"
      templateRows="auto auto"
      gap={4}
      w="100%"
      p={4}
      bgColor="#b0d4f8"
      h="auto"
    >
      <GridItem colSpan={1}>
        <Flex direction="column" gap={4} justifyContent="flex-start" alignItems="center">
          <Box position="relative" w="100%" maxW="300px">
            <Button
              variant="solid"
              size="md"
              bgColor="#5686c2"
              color="white"
              w="100%"
              borderRadius="none"
              onClick={drawerControls.onOpen}
              sx={{
                _hover: {
                  bgColor: '#466a9e',
                  color: 'white'
                }
              }}>
              Change Airport
            </Button>
          </Box>

          <Text fontWeight="bold" textAlign="center">
            {mainAirport}
          </Text>

          {rangeValues[0] === rangeValues[1] ? (
            <Flex justify="center" w="90%" mb={2}>
              <Box textAlign="center">
                <Text fontSize="sm" fontWeight="bold">
                  Year
                </Text>
                <Text fontSize="md">{rangeValues[0]}</Text>
              </Box>
            </Flex>
          ) : (
            <Flex justify="space-between" w="50%" mb={2}>
              <Box textAlign="center">
                <Text fontSize="sm" fontWeight="bold">
                  From
                </Text>
                <Text fontSize="md">{rangeValues[0]}</Text>
              </Box>
              <Box textAlign="center">
                <Text fontSize="sm" fontWeight="bold">
                  To
                </Text>
                <Text fontSize="md">{rangeValues[1]}</Text>
              </Box>
            </Flex>
          )}

          <RangeSlider
            defaultValue={[minYear, minYear]}
            min={minYear}
            max={maxYear}
            step={1}
            size="lg"
            colorScheme="blue"
            onChange={(val) => setRangeValues(val)}
            w="90%">
            <RangeSliderTrack bg="#8fc0f1">
              <RangeSliderFilledTrack />
            </RangeSliderTrack>
            <RangeSliderThumb index={0} />
            <RangeSliderThumb index={1} />
          </RangeSlider>

          <Text fontSize="xl" fontWeight="bold" mt={4}>
            Delay Types
          </Text>
          <Box w="100%" flex={1} minH="200px">
            <Pie data={filteredData} />
          </Box>
        </Flex>
      </GridItem>

      <GridItem colSpan={1}>{/* Right side content */}</GridItem>

      <GridItem colSpan={2}>{/* Bottom content */}</GridItem>
    </Grid>
  )
}

export default Chartcontainer
