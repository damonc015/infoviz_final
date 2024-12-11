'use client'
import React from 'react'

const Chartcontainer = ({ data, mainAirport }) => {
  return (
    <div>
      {/* <Chart /> */}
      {mainAirport && <div>Selected Airport: {mainAirport}</div>}
    </div>
  )
}

export default Chartcontainer
