import React from 'react'
// import { Button } from '@chakra-ui/react'

const AirportSelection = ({ airportData }) => {
  return (
    <div className="selectionItemContainer">
      {/* <Button>Change Airport</Button> */}
      <p>{airportData.name}</p>
    </div>
  )
}

export default AirportSelection
