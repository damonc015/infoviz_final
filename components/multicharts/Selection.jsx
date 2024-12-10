import React from 'react'
import { BsFillPlusCircleFill } from 'react-icons/bs'
import { Button } from '@chakra-ui/react'

const Selection = ({ airportData }) => {
  return (
    <div className="selectionContainer">
      <div className="selectionItem">
        <Button variant="outline" size="lg" bgColor="#5686c2" color="white">
          <p>Add Airline</p>
          <BsFillPlusCircleFill />
        </Button>
      </div>
    </div>
  )
}

export default Selection
