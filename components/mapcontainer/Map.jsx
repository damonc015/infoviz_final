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

const Map = memo(
  ({
    data,
    selectedYear,
    selectedRegion,
    showAllAirports,
    metricType,
    onAirportSelect
  }) => {
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

    // calculate delay data
    useEffect(() => {
      if (!data || !selectedYear) return

      const airportDelays = {}

      // get arr_delay and arr_flights for each airport to calculate avg delay per late flight
      Object.entries(data).forEach(([airportCode, airportData]) => {
        const yearData = airportData[selectedYear]
        if (!yearData) return

        if (!airportDelays[airportCode]) {
          airportDelays[airportCode] = { totalDelay: 0, totalFlights: 0 }
        }

        Object.values(yearData).forEach((monthData) => {
          Object.values(monthData).forEach((airlineStats) => {
            airportDelays[airportCode].totalDelay += airlineStats.arr_delay || 0
            airportDelays[airportCode].totalFlights += airlineStats.arr_flights || 0
          })
        })

        if (airportDelays[airportCode].totalFlights > 0) {
          airportDelays[airportCode].avgDelay =
            airportDelays[airportCode].totalDelay / airportDelays[airportCode].totalFlights
        }
      })

      setAirportDelayData(airportDelays)
    }, [data, selectedYear])

    // get metric value
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

    // label for legend
    const getMetricLabel = (value) => {
      if (value === null) return ''
      switch (metricType) {
        case 'avgDelay':
          return `${value.toFixed(2)} minutes/late-flight`
        case 'totalFlights':
          return `${value.toLocaleString()} flights`
        case 'totalDelay':
          return `${(value / 60).toFixed(0)} minutes`
        default:
          return `${value.toFixed(2)} minutes`
      }
    }

    // initialize map
    useEffect(() => {
      if (!isLoading && geoData && svgRef.current) {
        const container = svgRef.current.parentElement
        const width = container.clientWidth
        const height = container.clientHeight

        // sort delays
        const currentYearDelays = Object.values(airportDelayData)
          .map(d => getMetricValue(d))
          .filter(value => value !== null && value !== undefined && !isNaN(value))
          .sort((a, b) => a - b)

        if (currentYearDelays.length === 0) {
          console.log('No valid delays found for current year');
          return;
        }

        // create quartiles to avoid outliers
        const q1Index = Math.floor(currentYearDelays.length * 0.25)
        const q3Index = Math.floor(currentYearDelays.length * 0.75)
        const q1 = currentYearDelays[q1Index] || 0
        const q3 = currentYearDelays[q3Index] || 0
        const interquartileRange = q3 - q1

        // min and max values for legend
        const minValue = Math.max(q1 - 1.5 * interquartileRange, currentYearDelays[0])
        const maxValue = Math.min(q3 + 1.5 * interquartileRange, currentYearDelays[currentYearDelays.length - 1])


        const colorScale = scaleLinear()
          .domain([minValue, maxValue])
          .range(['#00ff00', '#ff0000'])
          .clamp(true)

        const svg = d3
          .select(svgRef.current)
          .attr('width', '100%')
          .attr('height', '100%')
          .attr('viewBox', `0 0 ${width} ${height}`)
          .attr('preserveAspectRatio', 'xMidYMid meet')

        const projection = d3.geoAlbersUsa().fitSize([width, height], geoData)

        const path = d3.geoPath().projection(projection)

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

        // Add airport points
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
            return showAllAirports || metricValue !== null ? 0.7 : 0
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
              .style('font-weight', 'bold')
              .style('font-size', '14px')
          })
          .on('mouseout', function () {
            d3.select(this).transition().duration(200).attr('r', 6)

            g.selectAll('.tooltip').remove()
          })
          .on('click', function (event, d) {
            // Find the full airport name from the data object
            const airportKey = Object.keys(data).find((key) => key.includes(d.name))
            if (airportKey && onAirportSelect) {
              onAirportSelect(airportKey)
            }
          })

        //   responsive event handler
        const handleResize = () => {
          const newWidth = container.clientWidth
          const newHeight = container.clientHeight

          // remove and remake map
          svg.selectAll('*').remove()

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

          // create color scale
          const currentMetricValues = Object.values(airportDelayData)
            .map((d) => getMetricValue(d))
            .filter((value) => value !== null)

          const minValue = Math.min(...currentMetricValues)
          const maxValue = Math.max(...currentMetricValues)

          const colorScale = scaleLinear()
            .domain([minValue, maxValue])
            .range(['#00ff00', '#ff0000'])
            .clamp(true)

          // Add airport points
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
              return showAllAirports || metricValue !== null ? 0.7 : 0
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
                .style('font-weight', 'bold')
                .style('font-size', '14px')
            })
            .on('mouseout', function () {
              d3.select(this).transition().duration(200).attr('r', 6)

              g.selectAll('.tooltip').remove()
            })
            .on('click', function (event, d) {
              // Find the full airport name from the data object
              const airportKey = Object.keys(data).find((key) => key.includes(d.name))
              if (airportKey && onAirportSelect) {
                onAirportSelect(airportKey)
              }
            })
        }

        window.addEventListener('resize', handleResize)

        return () => {
          window.removeEventListener('resize', handleResize)
        }
      }
    }, [isLoading, geoData, validAirportPoints, airportDelayData, showAllAirports, metricType])


    // in case map is loading
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
            {(() => {
              const values = Object.values(airportDelayData)
                .map(d => getMetricValue(d))
                .filter(v => v !== null && v !== undefined && !isNaN(v))
                .sort((a, b) => a - b);

              if (values.length === 0) {
                console.log('No valid values found');
                return null;
              }
              // Calculate bounds
              const q1Index = Math.floor(values.length * 0.25);
              const q3Index = Math.floor(values.length * 0.75);
              const q1 = values[q1Index] || 0;
              const q3 = values[q3Index] || 0;
              const interquartileRange = q3 - q1;

              const minVal = Math.max(q1 - 1.5 * interquartileRange, values[0]);
              const maxVal = Math.min(q3 + 1.5 * interquartileRange, values[values.length - 1]);

              if (isNaN(minVal) || isNaN(maxVal)) {
                console.log('NaN detected in final bounds');
                return null;
              }

              return (
                <>
                  <text
                    x={-5}
                    y={35}
                    textAnchor="start"
                    fontSize="12px"
                  >
                    {getMetricLabel(minVal)}
                  </text>
                  <text
                    x={window.innerWidth * 0.3 + 5}
                    y={35}
                    textAnchor="end"
                    fontSize="12px"
                  >
                    {getMetricLabel(maxVal)}
                  </text>
                </>
              );
            })()}
          </g>
        </svg>
      </div>
    )
  }
)

Map.displayName = 'Map'

export default Map
