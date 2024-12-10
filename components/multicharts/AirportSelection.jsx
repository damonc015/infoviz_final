import React from 'react'
import { Button } from '@chakra-ui/react'
import {
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
} from '@chakra-ui/react'

const AirportSelection = ({ airportData }) => {
  return (
    <>
      <Button variant="outline" size="lg" bgColor="#5686c2" color="white" w="90%">Change Airport</Button>
      <p>{airportData.name}</p>
    </>
  )
}

export default AirportSelection
