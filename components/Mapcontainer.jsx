'use client'
import React, { memo, Suspense, lazy, useState } from 'react'
import { Select, Flex, FormControl, FormLabel, Spinner, Center, Switch } from '@chakra-ui/react'

// Lazy load the Map component
const Map = lazy(() => import('./mapcontainer/Map'))

const Mapcontainer = memo(({ data, onAirportSelect }) => {
  const [selectedYear, setSelectedYear] = useState('2013')
  const [selectedRegion, setSelectedRegion] = useState('All Regions')
  const [showAllAirports, setShowAllAirports] = useState(false)
  const [metricType, setMetricType] = useState('avgDelay')

  const mapKey = `${selectedYear}-${selectedRegion}-${showAllAirports}-${metricType}`

  const years = Object.keys(data['Boston, MA: Logan International']).slice(0, -2)
  const metrics = [
    { value: 'avgDelay', label: 'Avg Delay Per Delayed Flight' },
    { value: 'totalFlights', label: 'Total Flights Delayed' },
    { value: 'totalDelay', label: 'Total Time Delayed' }
  ]

  const regions = [
    { value: 'all', label: 'All Regions' },
    { value: '1', label: 'New England' },
    { value: '2', label: 'Mid-Atlantic' },
    { value: '3', label: 'South' },
    { value: '4', label: 'Midwest' },
    { value: '5', label: 'Southwest' },
    { value: '6', label: 'West' }
  ]

  return (
    <>
      <Flex gap={4} p={4} justifyContent="space-between" flexWrap="nowrap">
        <FormControl flex={1}>
          <FormLabel>Region</FormLabel>
          <Select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value)}
            width="100%">
            {regions.map((region) => (
              <option key={region.value} value={region.value}>
                {region.label}
              </option>
            ))}
          </Select>
        </FormControl>
        <FormControl flex={1.25}>
          <FormLabel>Metric</FormLabel>
          <Select
            value={metricType}
            onChange={(e) => setMetricType(e.target.value)}
            width="100%">
            {metrics.map((metric) => (
              <option key={metric.value} value={metric.value}>
                {metric.label}
              </option>
            ))}
          </Select>
        </FormControl>
        <FormControl flex={0.75}>
          <FormLabel>Year</FormLabel>
          <Select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            width="100%">
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </Select>
        </FormControl>
        <FormControl flex={1}>
          <FormLabel>Show All Airports</FormLabel>
          <Switch
            isChecked={showAllAirports}
            onChange={(e) => setShowAllAirports(e.target.checked)}
            pt={2}
            sx={{
              '--switch-track-width': '2.25rem',
            }}
          />
        </FormControl>
      </Flex>
      <div style={{ width: '100%', height: 'calc(80vh - 100px)' }}>
        <Suspense fallback={
          <Center h="100%">
            <Spinner
              thickness='4px'
              speed='0.65s'
              emptyColor='gray.200'
              color='blue.500'
              size='xl'
            />
          </Center>
        }>
          <Map
            key={mapKey}
            data={data}
            selectedYear={selectedYear}
            selectedRegion={selectedRegion}
            showAllAirports={showAllAirports}
            metricType={metricType}
            metrics={metrics}
            onAirportSelect={onAirportSelect}
          />
        </Suspense>
      </div>
    </>
  )
})

Mapcontainer.displayName = 'Mapcontainer'

export default Mapcontainer
