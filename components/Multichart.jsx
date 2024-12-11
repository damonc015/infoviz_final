import React, { useState, useMemo } from 'react'
import AirportSelection from './multicharts/AirportSelection'
import AirlineSelection from './multicharts/AirlineSelection'
import Selection from './multicharts/Selection'
import { Grid, GridItem, Flex, Button, Menu, MenuButton, MenuList, MenuItem } from '@chakra-ui/react'
import { v4 as uuidv4 } from 'uuid';

const Multichart = ({ type, data, drawerControls }) => {
  const [airports, setAirports] = useState([
    { id: uuidv4(), name: 'JFK' },
    { id: uuidv4(), name: 'LAX' },
    { id: uuidv4(), name: 'ORD' },
    { id: uuidv4(), name: 'ATL' }
  ])

  const [airlines, setAirlines] = useState(() => {
    const initialAirlines = Object.keys(data || {})
      .slice(0, 2)
      .map(airlineName => ({
        id: uuidv4(),
        name: airlineName,
        years: data[airlineName] || {}
      }));
    return initialAirlines;
  });

  const allAirlines = useMemo(() => {
    return Object.keys(data || {})
      .filter(airlineName => !airlines.some(airline => airline.name === airlineName))
      .map(airlineName => ({
        id: uuidv4(),
        name: airlineName,
        years: data[airlineName] || {}
      }));
  }, [data, airlines]);

  const handleRemoveAirport = (id) => {
    setAirports(prevAirports => prevAirports.filter(airport => airport.id !== id));
  };

  const handleRemoveAirline = (id) => {
    setAirlines(prevAirlines => prevAirlines.filter(airline => airline.id !== id));
  };

  const handleUpdateAirline = (currentId, newAirline) => {
    setAirlines(prevAirlines =>
      prevAirlines.map(airline =>
        airline.id === currentId ? newAirline : airline
      )
    );
  };

  return (
    <Flex flex="1" overflowY="auto">
      <Grid
        templateColumns={`repeat(${type === 'airports' ?
          (airports.length < 5 ? airports.length + 1 : 5) :
          (airlines.length < 5 ? airlines.length + 1 : 5)}, 1fr)`}
        gap={0.5}
        w="100%">
        {(type === 'airports' ? airports : airlines).slice(0, 5).map((item) => (
          <GridItem
            key={item.id}
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
        {(type === 'airports' ? airports.length : airlines.length) < 5 && (
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
                      bgColor: "#466a9e",
                      color: "white",
                    },
                  }}
                >
                  Add Airline +
                </MenuButton>
                <MenuList
                  maxH="50vh"
                  overflowY="auto"
                  placement="right-start"
                >
                  {allAirlines.map((airline) => (
                    <MenuItem
                      key={airline.id}
                      onClick={() => setAirlines(prev => [...prev, airline])}
                    >
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
