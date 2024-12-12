import React, { useEffect, useRef } from 'react'
import { Box, Spinner, Center } from '@chakra-ui/react'
import * as d3 from 'd3'

const SidewaysBar = ({ data, rangeValues }) => {
  const svgRef = useRef()
  const containerRef = useRef()

  useEffect(() => {
    if (!data) return

    const renderChart = () => {
      // Clear previous chart
      d3.select(svgRef.current).selectAll('*').remove()

      // Get container dimensions
      const container = containerRef.current
      const width = container.clientWidth
      const height = container.clientHeight

      // Setup dimensions
      const margin = { top: 40, right: 120, bottom: 60, left: 220 }
      const innerWidth = width - margin.left - margin.right
      const innerHeight = height - margin.top - margin.bottom

      // Process data
      const delayCategories = [
        'Carrier Delay',
        'Weather Delay',
        'NAS Delay',
        'Security Delay',
        'Late Aircraft Delay'
      ]

      // Color scale matching Bar component
      const color = d3.scaleOrdinal()
        .domain(delayCategories)
        .range(d3.schemeSet2)

      // Calculate totals for each airline
      const airlineTotals = {}
      Object.entries(data)
        .filter(([year]) => year >= rangeValues[0] && year <= rangeValues[1])
        .forEach(([_, months]) => {
          Object.values(months).forEach((monthData) => {
            Object.entries(monthData).forEach(([airline, metrics]) => {
              if (!airlineTotals[airline]) {
                airlineTotals[airline] = {
                  airline,
                  'Carrier Delay': 0,
                  'Weather Delay': 0,
                  'NAS Delay': 0,
                  'Security Delay': 0,
                  'Late Aircraft Delay': 0,
                  'Arrival Flights': 0,
                  'Total Delays': 0
                }
              }
              airlineTotals[airline]['Carrier Delay'] += metrics.carrier_ct || 0
              airlineTotals[airline]['Weather Delay'] += metrics.weather_ct || 0
              airlineTotals[airline]['NAS Delay'] += metrics.nas_ct || 0
              airlineTotals[airline]['Security Delay'] += metrics.security_ct || 0
              airlineTotals[airline]['Late Aircraft Delay'] += metrics.late_aircraft_ct || 0
              airlineTotals[airline]['Arrival Flights'] += metrics.arr_flights || 0
              airlineTotals[airline]['Total Delays'] +=
                (metrics.carrier_ct || 0) +
                (metrics.weather_ct || 0) +
                (metrics.nas_ct || 0) +
                (metrics.security_ct || 0) +
                (metrics.late_aircraft_ct || 0)
            })
          })
        })

      const chartData = Object.values(airlineTotals)

      // Stack the delay data
      const stack = d3.stack().keys(delayCategories)
      const stackedData = stack(chartData)

      // Create scales
      const yScale = d3
        .scaleBand()
        .domain(chartData.map((d) => d.airline))
        .range([0, innerHeight])
        .padding(0.2)

      // Create inner scale for grouped bars
      const yInnerScale = d3
        .scaleBand()
        .domain(['flights', 'delays'])
        .range([0, yScale.bandwidth()])
        .padding(0.1)

      // Find max value for x scale
      const maxValue = Math.max(
        d3.max(chartData, d => d['Arrival Flights']),
        d3.max(chartData, d => d['Total Delays'])
      )

      const xScale = d3
        .scaleLinear()
        .domain([0, maxValue])
        .range([0, innerWidth])
        .nice()

      // Create SVG
      const svg = d3
        .select(svgRef.current)
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`)

      // Add tooltip
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

      // Add arrival flights bars
      svg
        .selectAll('.flight-bars')
        .data(chartData)
        .join('rect')
        .attr('class', 'flight-bars')
        .attr('y', d => yScale(d.airline) + yInnerScale('flights'))
        .attr('x', 0)
        .attr('height', yInnerScale.bandwidth())
        .attr('width', d => xScale(d['Arrival Flights']))
        .attr('fill', '#3c6091')
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d) {
          tooltip
            .style('visibility', 'visible')
            .html(`${d.airline}<br>Flights: ${d['Arrival Flights'].toLocaleString()}`)
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 10}px`)
        })
        .on('mouseout', () => {
          tooltip.style('visibility', 'hidden')
        })

      // Add stacked delay bars
      svg.selectAll('g.delay-type')
        .data(stackedData)
        .join('g')
        .attr('class', 'delay-type')
        .attr('fill', d => color(d.key))
        .selectAll('rect')
        .data(d => d)
        .join('rect')
        .attr('y', d => yScale(d.data.airline) + yInnerScale('delays'))
        .attr('x', d => xScale(d[0]))
        .attr('height', yInnerScale.bandwidth())
        .attr('width', d => xScale(d[1]) - xScale(d[0]))
        .style('cursor', 'pointer')
        .on('mouseover', function(event, d) {
          const breakdownHtml = delayCategories
            .map(category => `${category}: ${Math.round(d.data[category]).toLocaleString()}`)
            .join('<br>')

          tooltip
            .style('visibility', 'visible')
            .html(`${d.data.airline}<br>Total Delays: ${Math.round(
              delayCategories.reduce((sum, cat) => sum + d.data[cat], 0)
            ).toLocaleString()}<br><br>${breakdownHtml}`)
            .style('left', `${event.pageX + 10}px`)
            .style('top', `${event.pageY - 10}px`)
        })
        .on('mouseout', () => {
          tooltip.style('visibility', 'hidden')
        })

      // Add axes
      svg
        .append('g')
        .attr('transform', `translate(0,${innerHeight})`)
        .call(
          d3.axisBottom(xScale)
            .tickFormat(d3.format(','))
            .tickValues([
              xScale.domain()[1] / 2,
              xScale.domain()[1]
            ])
        )
        .selectAll('text')
        .style('font-size', '12px')

      svg
        .append('g')
        .call(d3.axisLeft(yScale))
        .selectAll('text')
        .style('font-size', '12px')

      // Update legend to include all delay types
      const legendData = ['Arrival Flights', ...delayCategories]
      const legendColors = ['#3c6091', ...d3.schemeSet2]

      const legend = svg
        .append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${innerWidth + 10}, 0)`)

      const legendItems = legend
        .selectAll('g')
        .data(legendData)
        .join('g')
        .attr('transform', (d, i) => `translate(0, ${i * 20})`)

      legendItems
        .append('rect')
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', (d, i) => legendColors[i])

      legendItems
        .append('text')
        .attr('x', 20)
        .attr('y', 12)
        .text(d => d)
        .style('font-size', '12px')
    }

    // Initial render
    renderChart()

    // Add resize listener
    const handleResize = () => {
      renderChart()
    }
    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [data, rangeValues])

  if (!data) {
    return (
      <Box
        w="100%"
        h="600px"
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
      h="600px"
      bg="#e4edf6"
      borderRadius="10px"
      p={4}
      boxShadow="sm"
      position="relative">
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
    </Box>
  )
}

export default SidewaysBar
