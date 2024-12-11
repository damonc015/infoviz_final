'use client'
import React, { memo } from 'react'
import Map from './mapcontainer/Map'

const Mapcontainer = memo(({ data }) => {
  return (
    <div style={{ width: '100%', height: '80vh' }}>
      <Map />
    </div>
  )
})

Mapcontainer.displayName = 'Mapcontainer'

export default Mapcontainer
