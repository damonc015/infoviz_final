import React, { useState, useMemo } from 'react'
import {
  Button,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  Text,
  Box,
  Flex,
  VStack
} from '@chakra-ui/react'
import Pie from '../chartcontainer/Pie'
import Line from '../chartcontainer/Line'
import Polar from '../chartcontainer/Polar'
import SidewaysBar from '../chartcontainer/SidewaysBar'

const AirportSelection = ({ data, airportData, drawerControls, onRemove, index }) => {
  // Get the full airport data for other charts
  const airportFullData = useMemo(() => {
    if (!data || !airportData || !data[airportData]) return null
    return Object.fromEntries(Object.entries(data[airportData]).slice(0, -2))
  }, [data, airportData])

  // Get min and max years
  const [minYear, maxYear] = useMemo(() => {
    if (!airportFullData) return [2013, 2013]
    const years = Object.keys(airportFullData).map(Number)
    return [Math.min(...years), Math.max(...years)]
  }, [airportFullData])

  // Initialize range values with min year
  const [rangeValues, setRangeValues] = useState([minYear, minYear])

  // Filter data for the selected airport
  const filteredData = useMemo(() => {
    if (!data || !airportData || !data[airportData]) return null

    // initial count
    let totalDelays = {
      'Carrier Delay': 0,
      'Weather Delay': 0,
      'NAS Delay': 0,
      'Security Delay': 0,
      'Late Aircraft Delay': 0
    }

    const airportYearData = Object.fromEntries(Object.entries(data[airportData]).slice(0, -2))

    // Loop through selected years
    for (let year = rangeValues[0]; year <= rangeValues[1]; year++) {
      if (airportYearData[year]) {
        // Loop through all months
        Object.values(airportYearData[year]).forEach((monthData) => {
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
  }, [data, airportData, rangeValues])

  // Charts - Delay Types
  const delayTypes = ['carrier', 'weather', 'nas', 'security', 'late_aircraft']

  const handleAirportChange = () => {
    drawerControls.setSelectedAction({ type: 'change', index })
    drawerControls.onOpen()
  }

  return (
    <>
      <Box position="relative" w="100%">
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
        <Button
          variant="solid"
          size="md"
          bgColor="#6b97cf"
          color="white"
          borderRadius="none"
          position="absolute"
          right="0"
          top="0"
          onClick={() => onRemove(airportData, index)}
          sx={{
            _hover: {
              bgColor: '#466a9e',
              color: 'white'
            }
          }}>
          ✕
        </Button>
      </Box>
      <Flex px={2} direction="column" align="center">
        {/* Airport name */}
        <p style={{ marginTop: '.8rem', marginBottom: '.8rem', textAlign: 'center', fontWeight: 'bold' }}>{airportData}</p>

        {/* Year range */}
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

        {/* Year slider */}
        <RangeSlider
          defaultValue={[2013, 2013]}
          min={2013}
          max={2023}
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

        {/* Charts */}
        <VStack spacing={4} w="100%" mt={4}>
          {/* Pie Chart */}
          <Box w="100%" h="auto">
            <Pie data={filteredData} />
          </Box>

          {/* Line Charts */}
          {delayTypes.map((delayType) => (
            <Box key={delayType} w="100%" h="200px">
              <Line
                data={airportFullData}
                delayType={delayType}
                rangeValues={rangeValues}
              />
            </Box>
          ))}

          {/* Polar Charts */}
          <Box w="100%">
            <VStack spacing={4}>
              {delayTypes.map((delayType) => (
                <Box key={delayType} w="100%" h="300px">
                  <Polar
                    data={airportFullData}
                    delayType={delayType}
                    rangeValues={rangeValues}
                  />
                </Box>
              ))}
            </VStack>
          </Box>

          {/* Sideways Bar Chart */}
          <Box w="100%" h="600px">
            <SidewaysBar
              data={airportFullData}
              rangeValues={rangeValues}
            />
          </Box>
        </VStack>
      </Flex>
    </>
  )
}

export default AirportSelection
