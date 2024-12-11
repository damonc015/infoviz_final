'use client'
import React, { memo, Suspense, lazy, useState } from 'react'
import { Select, HStack, FormControl, FormLabel } from '@chakra-ui/react'

// Lazy load the Map component
const Map = lazy(() => import('./mapcontainer/Map'))

const Mapcontainer = memo(({ data }) => {
  const [selectedYear, setSelectedYear] = useState('2013')
  const [selectedRegion, setSelectedRegion] = useState('1')

  const years = Object.keys(data['Boston, MA: Logan International'])
  const regions = [
    { value: '1', label: 'New England' },
    { value: '2', label: 'Mid-Atlantic' },
    { value: '3', label: 'South' },
    { value: '4', label: 'Midwest' },
    { value: '5', label: 'Southwest' },
    { value: '6', label: 'West' }
  ]

  return (
    <>
      <HStack spacing={4} p={4}>
        <FormControl>
          <FormLabel>Year</FormLabel>
          <Select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            width="120px">
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </Select>
        </FormControl>
        <FormControl>
          <FormLabel>Region</FormLabel>
          <Select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            width="160px">
            {regions.map((region) => (
              <option key={region.value} value={region.value}>
                {region.label}
              </option>
            ))}
          </Select>
        </FormControl>
      </HStack>
      <div style={{ width: '100%', height: 'calc(80vh - 100px)' }}>
        <Suspense fallback={<div>Loading map...</div>}>
          <Map data={data} selectedYear={selectedYear} selectedRegion={selectedRegion} />
        </Suspense>
      </div>
    </>
  )
})

Mapcontainer.displayName = 'Mapcontainer'

export default Mapcontainer
