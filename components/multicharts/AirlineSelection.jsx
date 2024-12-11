import React, { useState } from 'react'
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
  MenuItem
} from '@chakra-ui/react'

const AirlineSelection = ({ airlineData, onRemove, availableAirlines, onUpdate }) => {
  const years = Object.keys(airlineData.years)
    .filter(key => !isNaN(key))
    .map(Number)
  const minYear = Math.min(...years)
  const maxYear = Math.max(...years)

  const [rangeValues, setRangeValues] = useState([minYear, maxYear])

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
                bgColor: "#466a9e",
                color: "white",
              },
            }}
          >
            Change Airline
          </MenuButton>
          <MenuList
            maxH="50vh"
            overflowY="auto"
          >
            {availableAirlines.map((airline) => (
              <MenuItem
                key={airline.id}
                onClick={() => onUpdate(airlineData.id, airline)}
              >
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
              bgColor: "#466a9e",
              color: "white",
            },
          }}
        >
          ✕
        </Button>
      </Box>
      <Text my={2} fontWeight="bold">{airlineData.name}</Text>
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
        defaultValue={[minYear, maxYear]}
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
    </>
  )
}

export default AirlineSelection
