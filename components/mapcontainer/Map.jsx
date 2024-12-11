// components/mapcontainer/Map.jsx
import React, { useEffect, useRef, useState, memo } from 'react'
import * as d3 from 'd3'

const Map = memo(() => {
  const svgRef = useRef(null)
  const [mapInitialized, setMapInitialized] = useState(false)

  useEffect(() => {
    // Only initialize the map once
    if (!mapInitialized && svgRef.current) {
      const loadMap = async () => {
        try {
          const geoData = await d3.json('/gz_2010_us_040_00_5m.json')

          // Get parent container width for responsive sizing
          const container = svgRef.current.parentElement
          const width = container.clientWidth
          const height = width * 0.6 // Maintain aspect ratio

          const svg = d3.select(svgRef.current)
            .attr('width', width)
            .attr('height', height)
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

          const airports = [
            { name: "JFK", lat: 40.6413, lon: -73.7781 },
            { name: "LAX", lat: 33.9416, lon: -118.4085 },
            { name: "ORD", lat: 41.9742, lon: -87.9073 },
          ]

          // Add airports
          g.selectAll('circle')
            .data(airports)
            .enter()
            .append('circle')
            .attr('cx', d => projection([d.lon, d.lat])[0])
            .attr('cy', d => projection([d.lon, d.lat])[1])
            .attr('r', 5)
            .style('fill', 'red')
            .style('opacity', 0.7)
            .on('mouseover', function(event, d) {
              d3.select(this)
                .transition()
                .duration(200)
                .attr('r', 8)

              g.append('text')
                .attr('class', 'tooltip')
                .attr('x', projection([d.lon, d.lat])[0] + 10)
                .attr('y', projection([d.lon, d.lat])[1])
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
            const newHeight = newWidth * 0.6

            svg
              .attr('width', newWidth)
              .attr('height', newHeight)
              .attr('viewBox', `0 0 ${newWidth} ${newHeight}`)

            projection.fitSize([newWidth, newHeight], geoData)

            // Update paths and circles
            g.selectAll('path').attr('d', path)
            g.selectAll('circle')
              .attr('cx', d => projection([d.lon, d.lat])[0])
              .attr('cy', d => projection([d.lon, d.lat])[1])
          }

          window.addEventListener('resize', handleResize)
          setMapInitialized(true)

          // Cleanup
          return () => {
            window.removeEventListener('resize', handleResize)
          }
        } catch (error) {
          console.error('Error loading map data:', error)
        }
      }

      loadMap()
    }
  }, [mapInitialized])

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <svg ref={svgRef}></svg>
    </div>
  )
})

Map.displayName = 'Map'

export default Map