import React, { useState } from 'react'
import AirportSelection from './multicharts/AirportSelection'
import AirlineSelection from './multicharts/AirlineSelection'
import Selection from './multicharts/Selection'
import { Grid, GridItem, Flex } from '@chakra-ui/react'

const Multichart = ({ type, data, drawerControls }) => {
  const [airports, setAirports] = useState([
    { id: 1, name: 'JFK' },
    { id: 2, name: 'LAX' },
    { id: 3, name: 'ORD' },
    { id: 4, name: 'ATL' }
  ])

  const [airlines, setAirlines] = useState([
    { id: 1, name: 'Delta' },
    { id: 2, name: 'United' },
    { id: 3, name: 'American' },

  ])

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
              <AirportSelection airportData={airports} drawerControls={drawerControls} />
            ) : (
              <AirlineSelection airlineData={airlines} drawerControls={drawerControls} />
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
            <Selection type={type} drawerControls={drawerControls} />
          </GridItem>
        )}
      </Grid>
    </Flex>
  )
}

export default Multichart
