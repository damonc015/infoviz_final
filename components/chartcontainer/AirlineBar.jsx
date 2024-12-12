import React, { useEffect, useRef } from 'react'
import { Box, Spinner, Center } from '@chakra-ui/react'
import * as d3 from 'd3'

const AirlineBar = ({ data, rangeValues }) => {
  const svgRef = useRef()
  const containerRef = useRef()

  const renderChart = () => {
    if (!data || !rangeValues) return

    const container = containerRef.current
    const width = container.clientWidth
    const height = container.clientHeight

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove()

    // Process data to get totals within range
    let totalFlights = 0
    let totalDelays = 0
    let totalDelayMinutes = 0

    // Sum up values for selected years
    Object.entries(data)
      .filter(([year]) => year >= rangeValues[0] && year <= rangeValues[1])
      .forEach(([_, months]) => {
        Object.values(months).forEach((monthData) => {
          Object.values(monthData).forEach((airportData) => {
            totalFlights += airportData.arr_flights || 0
            totalDelays += airportData.arr_del15 || 0
            totalDelayMinutes += airportData.arr_delay || 0
          })
        })
      })

    // Calculate average delay per flight
    const avgDelayPerFlight = totalDelayMinutes / totalFlights || 0

    const chartData = [
      { name: 'Avg Delay (mins)', value: avgDelayPerFlight, color: '#2ca02c' }
    ]

    // Setup dimensions
    const margin = { top: 60, right: 30, bottom: 60, left: 80 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    // Create SVG
    const svg = d3
      .select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`)

    // Create scales
    const xScale = d3
      .scaleBand()
      .domain(chartData.map(d => d.name))
      .range([0, innerWidth])
      .padding(0.3)

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(chartData, d => d.value)])
      .range([innerHeight, 0])
      .nice()

    try {
      // Create tooltip
      const tooltip = d3
        .select(containerRef.current)
        .append('div')
        .style('position', 'absolute')
        .style('background-color', 'white')
        .style('padding', '5px')
        .style('border', '1px solid #ccc')
        .style('border-radius', '5px')
        .style('visibility', 'hidden')
        .style('z-index', '10')
        .style('font-size', '12px')
        .style('pointer-events', 'none')

      // Add bars
      svg
        .selectAll('.bar')
        .data(chartData)
        .join('rect')
        .attr('class', 'bar')
        .attr('x', d => xScale(d.name))
        .attr('y', d => yScale(d.value))
        .attr('width', xScale.bandwidth())
        .attr('height', d => innerHeight - yScale(d.value))
        .attr('fill', d => d.color)
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d) {
          const rect = containerRef.current.getBoundingClientRect()
          const x = event.clientX - rect.left
          const y = event.clientY - rect.top

          tooltip
            .style('visibility', 'visible')
            .html(
              `<strong>${d.name}</strong><br>` +
              `Value: ${d.name === 'Avg Delay (mins)'
                ? Math.round(d.value * 10) / 10
                : Math.round(d.value).toLocaleString()
              }${d.name === 'Avg Delay (mins)' ? ' minutes' : ''}`
            )
            .style('left', `${x + 10}px`)
            .style('top', `${y - 10}px`)
        })
        .on('mouseout', () => {
          tooltip.style('visibility', 'hidden')
        })

      // Add axes
      svg
        .append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(d3.axisBottom(xScale))
        .selectAll('text')
        .style('text-anchor', 'middle')
        .style('font-size', '12px')

      svg
        .append('g')
        .call(d3.axisLeft(yScale))
        .selectAll('text')
        .style('font-size', '12px')

      // Add title
      svg
        .append('text')
        .attr('x', innerWidth / 2)
        .attr('y', -margin.top / 2)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .text('Avg Delay Time in Minutes')

      return () => {
        tooltip.remove()
      }
    } catch (error) {
      console.error('Error in chart rendering:', error)
    }
  }

  // Add ResizeObserver
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const resizeObserver = new ResizeObserver(() => {
      if (data && rangeValues) {
        renderChart()
      }
    })

    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
    }
  }, []) // Empty dependency array since we only want to set up the observer once

  // Keep existing useEffect for chart rendering
  useEffect(() => {
    if (!data || !rangeValues) return

    renderChart()

    const handleResize = () => {
      renderChart()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [data, rangeValues])

  if (!data || !rangeValues) {
    return (
      <Box
        w="100%"
        h="400px"
        bg="#e4edf6"
        borderRadius="10px"
        p={4}
        boxShadow="sm"
        position="relative">
        <Center h="100%">
          <Spinner thickness="4px" speed="0.65s" emptyColor="gray.200" color="blue.500" size="xl" />
        </Center>
      </Box>
    )
  }

  return (
    <Box
      ref={containerRef}
      w="100%"
      h="400px"
      bg="#e4edf6"
      borderRadius="10px"
      p={4}
      boxShadow="sm"
      position="relative">
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
    </Box>
  )
}

export default AirlineBar
