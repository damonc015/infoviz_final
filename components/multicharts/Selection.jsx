import React from 'react'
import { BsFillPlusCircleFill } from 'react-icons/bs'

const Selection = ({ airportData }) => {
  return (
    <div className="selectionContainer">
      <div className="selectionItem">
        <BsFillPlusCircleFill />
        <p>Airline Delay Causes</p>
      </div>
    </div>
  )
}

export default Selection
