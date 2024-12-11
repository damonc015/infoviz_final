'use client'
import React, { useState } from 'react'
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
  // Get available years for the selected airport
  const years = data && mainAirport && data[mainAirport] ? Object.keys(data[mainAirport])
    .filter(key => !isNaN(key))
    .map(Number) : [2013]  // Default to 2013 if no data
  const minYear = years.length > 0 ? Math.min(...years) : 2013
  const maxYear = years.length > 0 ? Math.max(...years) : 2013

  const [rangeValues, setRangeValues] = useState([minYear, minYear])

  return (
    <Grid
      templateColumns="40% 60%"
      templateRows="auto auto"
      gap={4}
      w="100%"
      p={4}
      bgColor="#b0d4f8"
      flex={1}
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

          <Text fontWeight="bold" textAlign="center">{mainAirport}</Text>

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
        </Flex>
      </GridItem>

      <GridItem colSpan={1}>
        {/* Right side content (60% width) */}
      </GridItem>

      <GridItem colSpan={2}>
        {/* Bottom content (100% width) */}
      </GridItem>
    </Grid>
  )
}

export default Chartcontainer
