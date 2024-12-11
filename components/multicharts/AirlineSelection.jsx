import React, { useState } from 'react'
import {
  Button,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  Text,
  Box,
  Flex
} from '@chakra-ui/react'

const AirlineSelection = ({ airlineData, drawerControls }) => {
  const [rangeValues, setRangeValues] = useState([2013, 2013])

  return (
    <>
      <Button
        variant="solid"
        size="md"
        bgColor="#5686c2"
        color="white"
        w="100%"
        borderRadius="none"
        mt={2}
        onClick={drawerControls.onOpen}
        sx={{
          _hover: {
            bgColor: "#466a9e",
            color: "white",
          },
        }}
      >
        Change Airline
      </Button>
      <p>{airlineData.name}</p>
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
    </>
  )
}

export default AirlineSelection
