import React, { useState } from 'react'
import AirportSelection from './multicharts/AirportSelection'
import Selection from './multicharts/Selection'
import { Grid, GridItem } from '@chakra-ui/react'

const Multichart = () => {
  const [airports, setAirports] = useState([
    { id: 1, name: 'JFK' },
    { id: 2, name: 'LAX' },
    { id: 3, name: 'ORD' },
    { id: 4, name: 'ATL' },
  ])
  return (
    <Grid templateColumns={`repeat(${airports.length < 5 ? airports.length + 1 : 5}, 1fr)`} gap={1} h="100vh">
      {airports.slice(0, 5).map((airport) => (
        <GridItem key={airport.id} h="100%" display="flex" flexDir="column" justifyContent="flex-start" alignItems="center" bg="#b0d4f8">
          <AirportSelection airportData={airport} />
        </GridItem>
      ))}
      {airports.length < 5 && (
        <GridItem h="100%" display="flex" flexDir="column" justifyContent="center" alignItems="center" bg="#b0d4f8">
          <Selection />
        </GridItem>
      )}
    </Grid>
  )
}

export default Multichart
