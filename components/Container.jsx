'use client'
import React, { useState, useEffect } from 'react'
import { csv } from 'd3'
import Mapcontainer from './Mapcontainer'
import Chartcontainer from './Chartcontainer'
import Multichart from './Multichart'

const Container = () => {
  const [showMap, setShowMap] = useState(true)
  const [showChart, setShowChart] = useState(false)
  const [data, setData] = useState(null)

  // useEffect(() => {
  //   csv('/Airline_Delay_Cause.csv').then(csvData => {
  //     setData(csvData)
  //     console.log(csvData)
  //   }).catch(error => {
  //     console.error('Error loading CSV:', error)
  //   })
  // }, [])

  return (
    <div>
      {showMap && <Mapcontainer data={data} />}
      {showChart && <Chartcontainer data={data} />}
      <Multichart data={data} />
    </div>
  )
}

export default Container
