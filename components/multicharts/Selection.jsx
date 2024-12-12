import React from 'react'
import { BsFillPlusCircleFill } from 'react-icons/bs'
import { Button, Flex } from '@chakra-ui/react'

const Selection = ({ type, drawerControls }) => {
  const handleAddAirport = () => {
    drawerControls.setSelectedAction({ type: 'add', index: null })
    drawerControls.onOpen()
  }

  return (
    <div
      className="selectionContainer"
      style={{
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
        onClick={() => handleAddAirport()}
        sx={{
          _hover: {
            bgColor: '#466a9e',
            color: 'white'
          }
        }}>
        <p>Add {type === 'airports' ? 'Airport' : 'Airline'}</p>
        <BsFillPlusCircleFill />
      </Button>
    </div>
  )
}

export default Selection
