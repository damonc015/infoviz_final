import React, { useState, useEffect, useMemo } from 'react'
import {
  Button,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  Text,
  Box,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  VStack
} from '@chakra-ui/react'
import Pie from '../chartcontainer/Pie'

const AirlineSelection = ({ data, airlineData, onRemove, availableAirlines, onUpdate }) => {
  // Filter data for the selected airline
  const filteredData = useMemo(() => {
    if (!data || !airlineData?.name) {
      console.log('Missing required data:', { data, airlineDataName: airlineData?.name });
      return null;
    }

    // Directly access the airline data using the name as the key
    const airlineEntry = data[airlineData.name];

    if (!airlineEntry) {
      console.log('No matching airline found for:', airlineData.name);
      return null;
    }

    return airlineEntry || null;
  }, [data, airlineData]);

  // Calculate min and max years using filteredData
  const [minYear, maxYear] = useMemo(() => {
    if (!filteredData) {
      console.log('No filtered data available, using default years [2013, 2013]');
      return [2013, 2013];
    }

    const years = Object.keys(filteredData)
      .filter(key => !isNaN(key))
      .map(Number);

    console.log('Available years:', years);
    console.log('Min year:', Math.min(...years));
    console.log('Max year:', Math.max(...years));

    return [Math.min(...years), Math.max(...years)];
  }, [filteredData]);

  // Initialize range values with the full range
  const [rangeValues, setRangeValues] = useState([2013, 2013])

  // Update range values when min/max years change
  useEffect(() => {
    setRangeValues([minYear, maxYear])
  }, [minYear, maxYear])

  return (
    <>
      <Box position="relative" w="100%">
        <Menu>
          <MenuButton
            as={Button}
            variant="solid"
            size="md"
            bgColor="#5686c2"
            color="white"
            w="100%"
            borderRadius="none"
            sx={{
              _hover: {
                bgColor: '#466a9e',
                color: 'white'
              }
            }}>
            Change Airline
          </MenuButton>
          <MenuList maxH="50vh" overflowY="auto">
            {availableAirlines.map((airline) => (
              <MenuItem key={airline.id} onClick={() => onUpdate(airlineData.id, airline)}>
                {airline.name}
              </MenuItem>
            ))}
          </MenuList>
        </Menu>
        <Button
          variant="solid"
          size="md"
          bgColor="#6b97cf"
          color="white"
          borderRadius="none"
          position="absolute"
          right="0"
          top="0"
          onClick={() => onRemove(airlineData?.id)}
          sx={{
            _hover: {
              bgColor: '#466a9e',
              color: 'white'
            }
          }}>
          ✕
        </Button>
      </Box>
      <Text my={2} fontWeight="bold">
        {airlineData.name}
      </Text>
      {filteredData?.fullData && (
        <Pie data={filteredData.fullData} />
      )}
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
        aria-label={['min', 'max']}
        value={rangeValues}
        min={minYear}
        max={maxYear}
        step={1}
        size="lg"
        colorScheme="blue"
        onChange={(val) => setRangeValues(val)}
        w="90%"
        isReadOnly={false}
      >
        <RangeSliderTrack bg="#8fc0f1">
          <RangeSliderFilledTrack />
        </RangeSliderTrack>
        <RangeSliderThumb index={0} />
        <RangeSliderThumb index={1} />
      </RangeSlider>
    </>
  )
}

export default AirlineSelection
