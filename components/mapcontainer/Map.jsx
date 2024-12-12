// components/mapcontainer/Map.jsx
import React, { useEffect, useRef, useState, memo, useMemo } from 'react'
import * as d3 from 'd3'
import * as turf from '@turf/turf'
import { Center, Spinner } from '@chakra-ui/react'
import { scaleLinear } from 'd3'

// Define states for each region
const regionStates = {
  newEngland: ['Maine', 'New Hampshire', 'Vermont', 'Massachusetts', 'Rhode Island', 'Connecticut'],
  midAtlantic: [
    'New York',
    'New Jersey',
    'Pennsylvania',
    'Delaware',
    'Maryland',
    'District of Columbia'
  ],
  south: [
    'Virginia',
    'West Virginia',
    'North Carolina',
    'South Carolina',
    'Georgia',
    'Florida',
    'Kentucky',
    'Tennessee',
    'Alabama',
    'Mississippi',
    'Arkansas',
    'Louisiana'
  ],
  midwest: [
    'Ohio',
    'Michigan',
    'Indiana',
    'Illinois',
    'Wisconsin',
    'Minnesota',
    'Iowa',
    'Missouri',
    'North Dakota',
    'South Dakota',
    'Nebraska',
    'Kansas'
  ],
  southwest: ['Texas', 'Oklahoma', 'New Mexico', 'Arizona'],
  west: [
    'Alaska',
    'California',
    'Colorado',
    'Hawaii',
    'Idaho',
    'Montana',
    'Nevada',
    'Oregon',
    'Utah',
    'Washington',
    'Wyoming'
  ]
}

// Get region for selection
const getRegionForSelection = (selection) => {
  switch (selection) {
    case 'all':
      return ['newEngland', 'midAtlantic', 'south', 'midwest', 'southwest', 'west']
    case '1':
      return ['newEngland']
    case '2':
      return ['midAtlantic']
    case '3':
      return ['south']
    case '4':
      return ['midwest']
    case '5':
      return ['southwest']
    case '6':
      return ['west']
    default:
      return ['newEngland', 'midAtlantic', 'south', 'midwest', 'southwest', 'west']
  }
}

const Map = memo(({ data, selectedYear, selectedRegion, showAllAirports, metricType, metrics, onAirportSelect }) => {
  const svgRef = useRef(null)
  const [isLoading, setIsLoading] = useState(true)
  const [geoData, setGeoData] = useState(null)
  const [airportDelayData, setAirportDelayData] = useState({})

  const validAirportPoints = useMemo(() => {
    if (!data || !geoData) return []

    return Object.entries(data)
      .map(([airportName, coords]) => {
        const point = turf.point([coords.longitude, coords.latitude])
        const isInRegion = geoData.features.some((feature) =>
          turf.booleanPointInPolygon(point, feature)
        )
        return isInRegion
          ? {
              name: airportName,
              lat: coords.latitude,
              lon: coords.longitude
            }
          : null
      })
      .filter((airport) => airport !== null)
  }, [data, geoData])

  useEffect(() => {
    const loadGeoData = async () => {
      try {
        const data = await d3.json('/gz_2010_us_040_00_5m.json')

        // get states of active region
        const activeRegions = getRegionForSelection(selectedRegion)
        const activeStates = activeRegions.flatMap((region) => regionStates[region])

        // match states to geojson states
        const filteredFeatures = turf.featureCollection(
          data.features.filter((feature) => activeStates.includes(feature.properties.NAME))
        )
        setGeoData(filteredFeatures)
        setIsLoading(false)
      } catch (error) {
        console.error('Error loading map data:', error)
      }
    }

    loadGeoData()
  }, [selectedRegion])

  // Add new useEffect to process delay data
  useEffect(() => {
    if (!data || !selectedYear) return

    const airportDelays = {}

    // Process each airport's data
    Object.entries(data).forEach(([airportCode, airportData]) => {
      const yearData = airportData[selectedYear]
      if (!yearData) return

      // Initialize this airport in our results
      if (!airportDelays[airportCode]) {
        airportDelays[airportCode] = { totalDelay: 0, totalFlights: 0 }
      }

      // Sum up all delays for this airport across all months and airlines
      Object.values(yearData).forEach((monthData) => {
        Object.values(monthData).forEach((airlineStats) => {
          airportDelays[airportCode].totalDelay += airlineStats.arr_delay || 0
          airportDelays[airportCode].totalFlights += airlineStats.arr_flights || 0
        })
      })

      // Calculate average delay for this airport
      if (airportDelays[airportCode].totalFlights > 0) {
        airportDelays[airportCode].avgDelay =
          airportDelays[airportCode].totalDelay / airportDelays[airportCode].totalFlights
      }
    })

    console.log('Final airport delays:', airportDelays)

    setAirportDelayData(airportDelays)
  }, [data, selectedYear])

  const getMetricValue = (airportData) => {
    if (!airportData) return null
    switch (metricType) {
      case 'avgDelay':
        return airportData.avgDelay
      case 'totalFlights':
        return airportData.totalFlights
      case 'totalDelay':
        return airportData.totalDelay
      default:
        return airportData.avgDelay
    }
  }

  const getMetricLabel = (value) => {
    if (value === null) return ''
    switch (metricType) {
      case 'avgDelay':
        return `${value.toFixed(2)} minutes/late-flight`
      case 'totalFlights':
        return `${value.toLocaleString()} flights`
      case 'totalDelay':
        return `${(value/60).toFixed(0)} minutes`
      default:
        return `${value.toFixed(2)} minutes`
    }
  }

  // Initialize map only after data is loaded
  useEffect(() => {
    if (!isLoading && geoData && svgRef.current) {
      const container = svgRef.current.parentElement
      const width = container.clientWidth
      const height = container.clientHeight

      // Get min and max delays for the current year only
      const currentYearDelays = Object.values(airportDelayData)
        .map(d => getMetricValue(d))
        .filter(value => value !== null)

      console.log(currentYearDelays)
      const minValue = Math.min(...currentYearDelays)
      const maxValue = Math.max(...currentYearDelays)

      console.log(`Year ${selectedYear} delay range:`, { minValue, maxValue })

      const colorScale = scaleLinear()
        .domain([minValue, maxValue])
        .range(['#00ff00', '#ff0000']) // green to red
        .clamp(true)

      const svg = d3
        .select(svgRef.current)
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')

      const projection = d3.geoAlbersUsa().fitSize([width, height], geoData)

      const path = d3.geoPath().projection(projection)

      // Create a group for all map elements
      const g = svg.append('g')

      // Draw states
      g.selectAll('path')
        .data(geoData.features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('class', 'state')
        .style('fill', '#ddd')
        .style('stroke', '#fff')
        .style('stroke-width', '1px')

      // Add airports
      g.selectAll('circle')
        .data(validAirportPoints)
        .enter()
        .append('circle')
        .attr('cx', (d) => {
          const coords = projection([d.lon, d.lat])
          return coords ? coords[0] : null
        })
        .attr('cy', (d) => {
          const coords = projection([d.lon, d.lat])
          return coords ? coords[1] : null
        })
        .attr('r', 6)
        .style('fill', (d) => {
          const delayData = airportDelayData[d.name]
          const metricValue = getMetricValue(delayData)
          return metricValue !== null ? colorScale(metricValue) : '#gray'
        })
        .style('opacity', (d) => {
          const coords = projection([d.lon, d.lat])
          if (!coords) return 0
          const delayData = airportDelayData[d.name]
          const metricValue = getMetricValue(delayData)
          return (showAllAirports || metricValue !== null) ? 0.7 : 0
        })
        .style('cursor', 'pointer')
        .on('mouseover', function (event, d) {
          const coords = projection([d.lon, d.lat])
          if (!coords) return

          d3.select(this).transition().duration(200).attr('r', 9)

          g.append('text')
            .attr('class', 'tooltip')
            .attr('x', coords[0] + 10)
            .attr('y', coords[1])
            .text(d.name)
            .style('fill', 'black')
            .style('font-size', '12px')
        })
        .on('mouseout', function () {
          d3.select(this).transition().duration(200).attr('r', 6)

          g.selectAll('.tooltip').remove()
        })
        .on('click', function(event, d) {
          // Find the full airport name from the data object
          const airportKey = Object.keys(data).find(key => key.includes(d.name));
          if (airportKey && onAirportSelect) {
            onAirportSelect(airportKey);
          }
        })

      const handleResize = () => {
        const newWidth = container.clientWidth
        const newHeight = container.clientHeight

        // Clear the entire SVG
        svg.selectAll('*').remove()

        // Create a new group after clearing
        const g = svg.append('g')

        svg
          .attr('width', '100%')
          .attr('height', '100%')
          .attr('viewBox', `0 0 ${newWidth} ${newHeight}`)

        projection.fitSize([newWidth, newHeight], geoData)

        // Draw states
        g.selectAll('path')
          .data(geoData.features)
          .enter()
          .append('path')
          .attr('d', path)
          .attr('class', 'state')
          .style('fill', '#ddd')
          .style('stroke', '#fff')
          .style('stroke-width', '1px')

        // Create color scale
        const currentMetricValues = Object.values(airportDelayData)
          .map(d => getMetricValue(d))
          .filter(value => value !== null)

        const minValue = Math.min(...currentMetricValues)
        const maxValue = Math.max(...currentMetricValues)

        const colorScale = scaleLinear()
          .domain([minValue, maxValue])
          .range(['#00ff00', '#ff0000'])
          .clamp(true)

        // Add airports
        g.selectAll('circle')
          .data(validAirportPoints)
          .enter()
          .append('circle')
          .attr('cx', (d) => {
            const coords = projection([d.lon, d.lat])
            return coords ? coords[0] : null
          })
          .attr('cy', (d) => {
            const coords = projection([d.lon, d.lat])
            return coords ? coords[1] : null
          })
          .attr('r', 6)
          .style('fill', (d) => {
            const delayData = airportDelayData[d.name]
            const metricValue = getMetricValue(delayData)
            return metricValue !== null ? colorScale(metricValue) : '#gray'
          })
          .style('opacity', (d) => {
            const coords = projection([d.lon, d.lat])
            if (!coords) return 0
            const delayData = airportDelayData[d.name]
            const metricValue = getMetricValue(delayData)
            return (showAllAirports || metricValue !== null) ? 0.7 : 0
          })
          .style('cursor', 'pointer')
          .on('mouseover', function (event, d) {
            const coords = projection([d.lon, d.lat])
            if (!coords) return

            d3.select(this).transition().duration(200).attr('r', 9)

            g.append('text')
              .attr('class', 'tooltip')
              .attr('x', coords[0] + 10)
              .attr('y', coords[1])
              .text(d.name)
              .style('fill', 'black')
              .style('font-size', '12px')
          })
          .on('mouseout', function () {
            d3.select(this).transition().duration(200).attr('r', 6)

            g.selectAll('.tooltip').remove()
          })
          .on('click', function(event, d) {
            // Find the full airport name from the data object
            const airportKey = Object.keys(data).find(key => key.includes(d.name));
            if (airportKey && onAirportSelect) {
              onAirportSelect(airportKey);
            }
          })
      }

      window.addEventListener('resize', handleResize)

      return () => {
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [isLoading, geoData, validAirportPoints, airportDelayData, showAllAirports, metricType])

  if (isLoading) {
    return (
      <Center h="100%">
        <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" />
      </Center>
    )
  }

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <svg ref={svgRef} style={{ flex: 1 }}></svg>
      <svg
        height={50}
        width="100%"
        style={{
          marginTop: '10px',
          minHeight: '50px'
        }}>
        <defs>
          <linearGradient id="colorGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00ff00" />
            <stop offset="100%" stopColor="#ff0000" />
          </linearGradient>
        </defs>
        <g transform={`translate(${window.innerWidth * 0.35}, 10)`}>
          <rect
            width={window.innerWidth * 0.3}
            height={20}
            fill="url(#colorGradient)"
            stroke="#ccc"
            strokeWidth="0.5"
          />
          <text
            x={-5}
            y={35}
            textAnchor="start"
            fontSize="12px"
          >
            {getMetricLabel(Math.min(...Object.values(airportDelayData)
              .map(d => getMetricValue(d))
              .filter(v => v !== null)))}
          </text>
          <text
            x={window.innerWidth * 0.3 + 5}
            y={35}
            textAnchor="end"
            fontSize="12px"
          >
            {getMetricLabel(Math.max(...Object.values(airportDelayData)
              .map(d => getMetricValue(d))
              .filter(v => v !== null)))}
          </text>
        </g>
      </svg>
    </div>
  )
})

Map.displayName = 'Map'

export default Map
