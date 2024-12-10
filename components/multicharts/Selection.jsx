import React from 'react'
import { BsFillPlusCircleFill } from 'react-icons/bs'
import { Button, Flex } from '@chakra-ui/react'

const Selection = ({ airportData }) => {
  return (
    <div className="selectionContainer" style={{
      position: 'sticky',
      top: '50%',
      transform: 'translateY(-50%)',
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
        <Button
          variant="outline"
          size="lg"
          bgColor="#5686c2"
          color="white"
          gap={2}
          sx={{
            _hover: {
              bgColor: "#466a9e",
              color: "white",
            },
          }}
        >
          <p>Add Airline</p>
          <BsFillPlusCircleFill />
        </Button>
    </div>
  )
}

export default Selection
