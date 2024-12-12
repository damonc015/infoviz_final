'use client'
import React, { useState, useEffect, useMemo } from 'react'
import Pie from './chartcontainer/Pie'
import LineChart from './chartcontainer/Line'
import PolarChart from './chartcontainer/Polar'
import BarChart from './chartcontainer/Bar'
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
  // Get full airport data
  const airportFullData = useMemo(() => {
    if (!data || !mainAirport || !data[mainAirport]) return null
    const allData = data[mainAirport]
    const result = Object.fromEntries(Object.entries(allData).slice(0, -2))
    // console.log('Airport Filtered Data:', result)
    return result
  }, [data, mainAirport])

  // Get min and max years from airportFullData
  const [minYear, maxYear] = useMemo(() => {
    if (!airportFullData) return [2013, 2013]
    const years = Object.keys(airportFullData).map(Number)
    return [Math.min(...years), Math.max(...years)]
  }, [airportFullData])

  const [rangeValues, setRangeValues] = useState([minYear, minYear])

  const filteredData = useMemo(() => {
    if (!airportFullData) return null

    // initial count
    let totalDelays = {
      'Carrier Delay': 0,
      'Weather Delay': 0,
      'NAS Delay': 0,
      'Security Delay': 0,
      'Late Aircraft Delay': 0
    }

    // Loop through selected years
    for (let year = rangeValues[0]; year <= rangeValues[1]; year++) {
      if (airportFullData[year]) {
        // Loop through all months
        Object.values(airportFullData[year]).forEach((monthData) => {
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
      .filter((item) => item.value > 0)
  }, [airportFullData, rangeValues])

  const handleAirportChange = () => {
    drawerControls.setSelectedAction({ type: 'changeMain', index: 0 })
    drawerControls.onOpen()
  }

  return (
    <Grid
      templateColumns="40% 58%"
      templateRows="auto auto auto"
      gap={4}
      w="100%"
      h="auto"
      p={4}
      bgColor="#b0d4f8"
      flex={1}>
      <GridItem rowSpan={1}>
        <Flex direction="column" gap={4} justifyContent="flex-start" alignItems="center">
          <Box position="relative" w="100%" maxW="300px">
            <Button
              variant="solid"
              size="md"
              bgColor="#5686c2"
              color="white"
              w="100%"
              borderRadius="none"
              onClick={handleAirportChange}
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
            <Flex justify="space-between" w="60%" mb={2}>
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
            Delay Types (Total Min.)
          </Text>
          <Box w="100%" flex={1} minH="200px">
            <Pie data={filteredData} />
          </Box>
        </Flex>
      </GridItem>

      <GridItem>
        <Grid templateColumns="1fr" gap={4}>
          {['carrier', 'weather', 'nas', 'security', 'late_aircraft'].map((delayType) => (
            <Box key={delayType}>
              <LineChart data={airportFullData} delayType={delayType} rangeValues={rangeValues} />
            </Box>
          ))}
        </Grid>
      </GridItem>

      <GridItem colSpan={2}>
        <Text fontSize="xl" fontWeight="bold" mb={2} textAlign="center" color="#000">
          Delay Incidents by Season
        </Text>

        <Flex justify="center" mb={4}>
          {['Winter', 'Spring', 'Summer', 'Fall'].map((season) => (
            <Flex key={season} align="center" mx={4}>
              <Box
                w="12px"
                h="12px"
                borderRadius="50%"
                mr={2}
                bg={
                  season === 'Winter'
                    ? 'rgba(54, 162, 235, 0.5)'
                    : season === 'Spring'
                    ? 'rgba(75, 192, 192, 0.5)'
                    : season === 'Summer'
                    ? 'rgba(255, 99, 132, 0.5)'
                    : 'rgba(255, 159, 64, 0.5)'
                }
              />
              <Text fontSize="sm">{season}</Text>
            </Flex>
          ))}
        </Flex>

        <Grid templateColumns="repeat(5, 1fr)" gap={2} h="250px">
          {['carrier', 'weather', 'nas', 'security', 'late_aircraft'].map((delayType) => (
            <Box key={delayType} h="100%">
              <PolarChart data={airportFullData} delayType={delayType} rangeValues={rangeValues} />
            </Box>
          ))}
        </Grid>
      </GridItem>

      <GridItem colSpan={2} mt={12}>
        <Box h="auto">
          <BarChart data={airportFullData} rangeValues={rangeValues} />
        </Box>
      </GridItem>
    </Grid>
  )
}

export default Chartcontainer
