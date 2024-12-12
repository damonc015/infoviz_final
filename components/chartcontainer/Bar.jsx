import React, { useEffect, useRef } from 'react'
import { Box, Spinner, Center } from '@chakra-ui/react'
import * as d3 from 'd3'

const BarChart = ({ data, rangeValues }) => {
  const svgRef = useRef()
  const containerRef = useRef()

  useEffect(() => {
    if (!data || !rangeValues || !Array.isArray(rangeValues)) return

    const renderChart = () => {
      const container = containerRef.current
      const width = container.clientWidth
      const height = container.clientHeight

      d3.select(svgRef.current).selectAll('*').remove()

      const airlineTotals = {}

      //   data for years in range
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
                  'Arrival Flights': 0
                }
              }
              airlineTotals[airline]['Carrier Delay'] += metrics.carrier_ct || 0
              airlineTotals[airline]['Weather Delay'] += metrics.weather_ct || 0
              airlineTotals[airline]['NAS Delay'] += metrics.nas_ct || 0
              airlineTotals[airline]['Security Delay'] += metrics.security_ct || 0
              airlineTotals[airline]['Late Aircraft Delay'] += metrics.late_aircraft_ct || 0
              airlineTotals[airline]['Arrival Flights'] += metrics.arr_flights || 0
            })
          })
        })

      const chartData = Object.values(airlineTotals)

      // chart dimensions
      const margin = { top: 40, right: 30, bottom: 180, left: 120 }
      const innerWidth = width - margin.left - margin.right
      const innerHeight = height - margin.top - margin.bottom

      // bar sections
      const delayCategories = [
        'Carrier Delay',
        'Weather Delay',
        'NAS Delay',
        'Security Delay',
        'Late Aircraft Delay'
      ]
      const stack = d3.stack().keys(delayCategories)
      const stackedData = stack(chartData)

      // scales with grouped bars
      const xScale = d3
        .scaleBand()
        .domain(chartData.map((d) => d.airline))
        .range([40, innerWidth])
        .padding(0.4)
        .paddingOuter(0.2)

      // inner scale for grouped bars
      const xInnerScale = d3
        .scaleBand()
        .domain(['flights', 'delays'])
        .range([0, xScale.bandwidth()])
        .padding(0.2)

      // max value between delays and flights
      const maxDelays = d3.max(stackedData[stackedData.length - 1], (d) => d[1])
      const maxFlights = d3.max(chartData, (d) => d['Arrival Flights'])
      const maxValue = Math.max(maxDelays, maxFlights)

      // more scales but for y axis
      const yScaleDelays = d3.scaleLinear().domain([0, maxValue]).range([innerHeight, 0]).nice()

      const yScaleFlights = d3.scaleLinear().domain([0, maxValue]).range([innerHeight, 0]).nice()

      const svg = d3
        .select(svgRef.current)
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`)

      // pie chart colors
      const color = d3.scaleOrdinal().domain(delayCategories).range(d3.schemeSet2)

      // tooltip
      try {
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

        // arrival flights bars
        svg
          .selectAll('.flight-bars')
          .data(chartData)
          .join('rect')
          .attr('class', 'flight-bars')
          .attr('x', (d) => xScale(d.airline) + xInnerScale('flights'))
          .attr('y', (d) => yScaleFlights(d['Arrival Flights']))
          .attr('width', xInnerScale.bandwidth())
          .attr('height', (d) => innerHeight - yScaleFlights(d['Arrival Flights']))
          .attr('fill', '#3c6091')
          .style('cursor', 'pointer')
          .on('mouseover', function (event, d) {
            const rect = containerRef.current.getBoundingClientRect()
            const x = event.clientX - rect.left
            const y = event.clientY - rect.top

            tooltip
              .style('visibility', 'visible')
              .html(
                `<strong>${d.airline}</strong><br>` +
                  `Arrival Flights: ${Math.round(d['Arrival Flights']).toLocaleString()}`
              )
              .style('left', `${x + 10}px`)
              .style('top', `${y - 10}px`)
          })
          .on('mouseout', () => {
            tooltip.style('visibility', 'hidden')
          })

        // delay bars position
        svg
          .selectAll('g.delay-type')
          .data(stackedData)
          .join('g')
          .attr('class', 'delay-type')
          .attr('fill', (d) => color(d.key))
          .selectAll('rect')
          .data((d) => d)
          .join('rect')
          .attr('x', (d) => xScale(d.data.airline) + xInnerScale('delays'))
          .attr('y', (d) => yScaleDelays(d[1]))
          .attr('height', (d) => yScaleDelays(d[0]) - yScaleDelays(d[1]))
          .attr('width', xInnerScale.bandwidth())
          .style('cursor', 'pointer')
          .on('mouseover', function (event, d) {
            const rect = containerRef.current.getBoundingClientRect()
            const x = event.clientX - rect.left
            const y = event.clientY - rect.top

            const breakdownHtml = delayCategories
              .map((category) => {
                const value = d.data[category]
                return `${category}: ${Math.round(value).toLocaleString()} incidents`
              })
              .join('<br>')

            tooltip
              .style('visibility', 'visible')
              .html(
                `<strong>${d.data.airline}</strong><br>` +
                  `Total Delays: ${Math.round(
                    delayCategories.reduce((sum, cat) => sum + d.data[cat], 0)
                  ).toLocaleString()} incidents<br>` +
                  `<br>${breakdownHtml}`
              )
              .style('left', `${x + 10}px`)
              .style('top', `${y - 10}px`)
          })
          .on('mouseout', () => {
            tooltip.style('visibility', 'hidden')
          })

        // axes
        svg
          .append('g')
          .attr('transform', `translate(0,${innerHeight})`)
          .call(d3.axisBottom(xScale))
          .selectAll('text')
          .style('text-anchor', 'end')
          .style('font-size', '12px')
          .attr('dx', '-.8em')
          .attr('dy', '.15em')
          .attr('transform', 'rotate(-45)')

        svg.append('g').call(d3.axisLeft(yScaleDelays)).selectAll('text').style('font-size', '12px')

        svg
          .append('g')
          .attr('transform', `translate(${innerWidth}, 0)`)
          .call(d3.axisRight(yScaleFlights))
          .selectAll('text')
          .style('font-size', '12px')

        // y-axis labels
        svg
          .append('text')
          .attr('transform', 'rotate(-90)')
          .attr('y', -80)
          .attr('x', -innerHeight / 2)
          .attr('text-anchor', 'middle')
          .style('font-size', '12px')
          .text('Number of Flights:Incidents')

        svg
          .append('text')
          .attr('transform', 'rotate(-90)')
          .attr('y', innerWidth + 40)
          .attr('x', -innerHeight / 2)
          .attr('text-anchor', 'middle')
          .style('font-size', '12px')
          .text('Number of Arrivals')

        // legend
        const legendData = ['Arrival Flights', ...delayCategories]
        const legendColors = ['#3c6091', ...d3.schemeSet2]

        const legend = svg
          .append('g')
          .attr('class', 'legend')
          .attr('transform', `translate(${innerWidth - 200}, -30)`)

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
          .style('font-size', '12px')
          .text((d) => d)

        // title
        svg
          .append('text')
          .attr('x', innerWidth / 2)
          .attr('y', -margin.top / 2)
          .attr('text-anchor', 'middle')
          .style('font-size', '14px')
          .style('font-weight', 'bold')
          .text('Airline Arrivals vs Number of Delays')

        return () => {
          tooltip.remove()
        }
      } catch (error) {
        console.error('Error in chart rendering:', error)
      }
    }

    renderChart()

    const handleResize = () => {
      renderChart()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [data, rangeValues])

    //   loader
  if (!data || !rangeValues || !Array.isArray(rangeValues)) {
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

export default BarChart
