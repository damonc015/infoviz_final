import React, { useState } from 'react'
import Selection from './multicharts/Selection'

const Multichart = () => {
  const [airports, setAirports] = useState([
    { id: 1, name: 'JFK' },
    { id: 2, name: 'LAX' },
    { id: 3, name: 'ORD' }
  ])
  return (
    <div>
      {airports.map((airport) => (
        <Selection key={airport.id} airportData={airport} />
      ))}
    </div>
  )
}

export default Multichart
