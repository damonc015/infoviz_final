// components/mapcontainer/Map.jsx
import React, { useEffect, useRef, useState, memo } from 'react'
import * as d3 from 'd3'
import * as turf from '@turf/turf'

const airportCoordinates = {
  "JFK": { lat: 40.6413, lon: -73.7781 },
  "LAX": { lat: 33.9416, lon: -118.4085 },
  "ORD": { lat: 41.9742, lon: -87.9073 },
}

const regionStates = {
  newEngland: ['ME', 'NH', 'VT', 'MA', 'RI', 'CT'],
  midAtlantic: ['NY', 'NJ', 'PA', 'DE', 'MD', 'DC'],
  south: ['VA', 'WV', 'NC', 'SC', 'GA', 'FL', 'KY', 'TN', 'AL', 'MS', 'AR', 'LA'],
  midwest: ['OH', 'MI', 'IN', 'IL', 'WI', 'MN', 'IA', 'MO', 'ND', 'SD', 'NE', 'KS'],
  southwest: ['TX', 'OK', 'NM', 'AZ'],
  west: ['AK', 'CA', 'CO', 'HI', 'ID', 'MT', 'NV', 'OR', 'UT', 'WA', 'WY']
}

const getRegionForSelection = (selection) => {
  switch (selection) {
    case 1:
      return ['newEngland']
    case 2:
      return ['midAtlantic']
    case 3:
      return ['south']
    case 4:
      return ['midwest']
    case 5:
      return ['southwest']
    case 6:
      return ['west']
    default:
      return ['newEngland', 'midAtlantic', 'south', 'midwest', 'southwest', 'west']
  }
}

const Map = memo(({ data, selectedYear, selectedRegion }) => {
  const svgRef = useRef(null)
  const [mapInitialized, setMapInitialized] = useState(false)
  const [geoData, setGeoData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [airports, setAirports] = useState([])

  // Load GeoJSON data separately
  useEffect(() => {
    const loadGeoData = async () => {
      try {
        const data = await d3.json('/gz_2010_us_040_00_5m.json')

        // Define the regions using Turf.js
        const activeRegions = getRegionForSelection(selectedRegion);
        const activeStates = activeRegions.flatMap(region => regionStates[region]);

        // Use Turf.js to filter features based on the selected quarter's regions
        const filteredFeatures = turf.featureCollection(
          data.features.filter(feature =>
            activeStates.includes(feature.properties.STATE)
          )
        );

        setGeoData(filteredFeatures)
        setIsLoading(false)
      } catch (error) {
        console.error('Error loading map data:', error)
      }
    }

    loadGeoData()
  }, [selectedRegion])

  // Filter airports based on selected year and quarter
  useEffect(() => {
    if (data && geoData) {
      const activeRegions = getRegionForSelection(selectedRegion);
      const activeStates = activeRegions.flatMap(region => regionStates[region]);

      const dataArray = Object.values(data);

      const filteredData = dataArray.filter(d => {
        if (typeof d.longitude !== 'number' || typeof d.latitude !== 'number') {
          return false;
        }

        // Create a point for the airport's location
        const point = turf.point([d.longitude, d.latitude]);

        // Check if the point is within any of the selected region's features
        const isInRegion = geoData.features.some(feature =>
          turf.booleanPointInPolygon(point, feature)
        );

        return d.year === selectedYear && isInRegion;
      });

      // Get unique airports from filtered data
      const airports = [...new Set(filteredData.map(d => d.airport))]
        .map(airport => {
          const airportData = airportCoordinates[airport] || {}
          return {
            name: airport,
            lat: airportData.latitude,
            lon: airportData.longitude
          }
        })
        .filter(airport => airport.lat && airport.lon)
      console.log(airports)
      setAirports(airports)
    }
  }, [data, selectedYear, selectedRegion, geoData])

  // Initialize map only after data is loaded
  useEffect(() => {
    if (!mapInitialized && !isLoading && geoData && svgRef.current) {
      const container = svgRef.current.parentElement
      const width = container.clientWidth
      const height = container.clientHeight

      const svg = d3.select(svgRef.current)
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')

      const projection = d3.geoAlbersUsa()
        .fitSize([width, height], geoData)

      const path = d3.geoPath()
        .projection(projection)

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
        .data(airports)
        .enter()
        .append('circle')
        .attr('cx', d => {
          const coords = projection([d.lon, d.lat]);
          return coords ? coords[0] : null;
        })
        .attr('cy', d => {
          const coords = projection([d.lon, d.lat]);
          return coords ? coords[1] : null;
        })
        .attr('r', 5)
        .style('fill', 'red')
        .style('opacity', d => {
          const coords = projection([d.lon, d.lat]);
          return coords ? 0.7 : 0;  // Hide airports that couldn't be projected
        })
        .on('mouseover', function(event, d) {
          const coords = projection([d.lon, d.lat]);
          if (!coords) return;  // Skip if coordinates couldn't be projected

          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 8)

          g.append('text')
            .attr('class', 'tooltip')
            .attr('x', coords[0] + 10)
            .attr('y', coords[1])
            .text(d.name)
            .style('fill', 'black')
            .style('font-size', '12px')
        })
        .on('mouseout', function() {
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', 5)

          g.selectAll('.tooltip').remove()
        })

      // Handle window resize
      const handleResize = () => {
        const newWidth = container.clientWidth
        const newHeight = container.clientHeight

        svg
          .attr('width', '100%')
          .attr('height', '100%')
          .attr('viewBox', `0 0 ${newWidth} ${newHeight}`)

        projection.fitSize([newWidth, newHeight], geoData)

        // Update paths and circles
        g.selectAll('path').attr('d', path)
        g.selectAll('circle')
          .attr('cx', d => {
            const coords = projection([d.lon, d.lat]);
            return coords ? coords[0] : null;
          })
          .attr('cy', d => {
            const coords = projection([d.lon, d.lat]);
            return coords ? coords[1] : null;
          })
      }

      window.addEventListener('resize', handleResize)
      setMapInitialized(true)

      // Cleanup
      return () => {
        window.removeEventListener('resize', handleResize)
      }
    }
  }, [mapInitialized, isLoading, geoData, airports])

  if (isLoading) {
    return <div>Loading map data...</div>
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <svg ref={svgRef}></svg>
    </div>
  )
})

Map.displayName = 'Map'

export default Map