import React, { useMemo } from 'react'
import AirportSelection from './multicharts/AirportSelection'
import AirlineSelection from './multicharts/AirlineSelection'
import Selection from './multicharts/Selection'
import {
  Grid,
  GridItem,
  Flex,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem
} from '@chakra-ui/react'

const Multichart = ({
  type,
  data,
  drawerControls,
  airports,
  setAirports,
  airlines,
  setAirlines
}) => {
  const allAirlines = useMemo(() => {
    return Object.keys(data || {})
      .filter((airlineName) => !airlines?.some((airline) => airline.name === airlineName))
      .map((airlineName) => ({
        id: airlineName,
        name: airlineName,
        years: data[airlineName] || {}
      }))
  }, [data, airlines])

  // Remove airport from airports array or airline from airlines array
  const handleRemoveAirport = (airport, indexToRemove) => {
    setAirports((prevAirports) => prevAirports.filter((_, index) => index !== indexToRemove))
  }

  const handleRemoveAirline = (id) => {
    setAirlines((prevAirlines) => prevAirlines.filter((airline) => airline.id !== id))
  }

  // Update airline in airlines array
  const handleUpdateAirline = (currentId, newAirline) => {
    setAirlines((prevAirlines) =>
      prevAirlines.map((airline) => (airline.id === currentId ? newAirline : airline))
    )
  }

  return (
    <Flex flex="1" overflowY="auto">
      <Grid
        templateColumns={`repeat(${
          type === 'airports'
            ? airports.length < 4
              ? airports.length + 1
              : 4
            : airlines.length < 4
            ? airlines.length + 1
            : 4
        }, 1fr)`}
        gap={0.5}
        w="100%">

        {/* GRID ITEMS - AIRPORTS OR AIRLINES */}
        {(type === 'airports' ? airports : airlines).slice(0, 4).map((item, index) => (
          <GridItem
            key={`${item}-${index}`}
            h="100%"
            display="flex"
            flexDir="column"
            justifyContent="flex-start"
            alignItems="center"
            bg="#b0d4f8">
            {type === 'airports' ? (
              <AirportSelection
                airportData={item}
                drawerControls={drawerControls}
                onRemove={handleRemoveAirport}
                index={index}
              />
            ) : (
              <AirlineSelection
                airlineData={item}
                onUpdate={handleUpdateAirline}
                availableAirlines={allAirlines}
                onRemove={handleRemoveAirline}
              />
            )}
          </GridItem>
        ))}
        {(type === 'airports' ? airports.length : airlines.length) < 4 && (
          <GridItem
            h="100%"
            display="flex"
            flexDir="column"
            justifyContent="flex-start"
            alignItems="center"
            bg="#b0d4f8">
            {type === 'airports' ? (
              <Selection type={type} drawerControls={drawerControls} />
            ) : (
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
                  Add Airline +
                </MenuButton>
                <MenuList maxH="50vh" overflowY="auto">
                  {allAirlines.map((airline) => (
                    <MenuItem
                      key={airline.id}
                      onClick={() => setAirlines((prev) => [...prev, airline])}>
                      {airline.name}
                    </MenuItem>
                  ))}
                </MenuList>
              </Menu>
            )}
          </GridItem>
        )}
      </Grid>
    </Flex>
  )
}

export default Multichart
