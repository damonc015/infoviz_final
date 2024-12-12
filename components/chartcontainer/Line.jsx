import React, { useEffect, useRef } from 'react'
import { Box, Spinner, Center } from '@chakra-ui/react'
import * as d3 from 'd3'

const LineChart = ({ data, delayType, rangeValues }) => {
  const svgRef = useRef()
  const containerRef = useRef()

  useEffect(() => {
    if (!data) return

    const renderChart = () => {
      const container = containerRef.current
      const width = container.clientWidth
      const height = container.clientHeight

      // Clear previous chart and tooltip
      d3.select(container).selectAll('.tooltip').remove()
      const svg = d3.select(svgRef.current).html(null).attr('width', width).attr('height', height)

      const margin = { top: 40, right: 30, bottom: 50, left: 60 }
      const innerWidth = width - margin.left - margin.right
      const innerHeight = height - margin.top - margin.bottom

      const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`)

      try {
        // Process monthly data
        const monthlyData = []
        Object.entries(data)
          .filter(([year]) => year >= rangeValues[0] && year <= rangeValues[1])
          .forEach(([year, months]) => {
            Object.entries(months).forEach(([month, monthData]) => {
              // Sum all carrier_ct values for this month
              const totalDelay = Object.values(monthData).reduce(
                (sum, airline) => sum + (airline[`${delayType}_ct`] || 0),
                0
              )

              monthlyData.push({
                year: +year,
                month: +month,
                label: `${month}'${year.slice(-2)}`,
                value: totalDelay
              })
            })
          })

        if (monthlyData.length === 0) {
          console.error('No monthly data points available')
          return
        }

        // Sort data chronologically
        monthlyData.sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year
          return a.month - b.month
        })

        // Create sequential x-axis positions
        const xScale = d3
          .scalePoint()
          .domain(monthlyData.map((d) => d.label))
          .range([0, innerWidth])
          .padding(0.5)

        const yScale = d3
          .scaleLinear()
          .domain([0, d3.max(monthlyData, (d) => d.value)])
          .range([innerHeight, 0])
          .nice()

        // Line generator
        const line = d3
          .line()
          .x((d) => xScale(d.label))
          .y((d) => yScale(d.value))

        // Modified x-axis with yearly labels
        g.append('g')
          .attr('transform', `translate(0,${innerHeight})`)
          .call(
            d3.axisBottom(xScale).tickFormat((d, i) => {
              // Only show year for January (month 1)
              const [month, year] = d.split("'")
              return month === '1' ? '20' + year : ''
            })
          )
          .selectAll('text')
          .style('text-anchor', 'middle')
          .attr('dx', '0')
          .attr('dy', '.75em')

        g.append('g').call(d3.axisLeft(yScale).ticks(height > 150 ? 5 : 3))

        // Create tooltip div inside the container
        const tooltip = d3.select(container)
          .append('div')
          .attr('class', 'tooltip')
          .style('position', 'absolute')
          .style('background-color', 'white')
          .style('padding', '5px')
          .style('border', '1px solid #ccc')
          .style('border-radius', '5px')
          .style('visibility', 'hidden')
          .style('z-index', '10')
          .style('font-size', '12px')
          .style('pointer-events', 'none') // Prevent tooltip from interfering with hover

        // Get color from schemeSet2 based on delayType
        const colorMap = {
          carrier: d3.schemeSet2[0],
          weather: d3.schemeSet2[1],
          nas: d3.schemeSet2[2],
          security: d3.schemeSet2[3],
          late_aircraft: d3.schemeSet2[4]
        }
        const lineColor = colorMap[delayType] || 'rgb(75, 192, 192)'

        // Add line with updated color
        g.append('path')
          .datum(monthlyData)
          .attr('fill', 'none')
          .attr('stroke', lineColor)
          .attr('stroke-width', 2)
          .attr('d', line)

        // Modify dots with larger sizes, matching colors, and cursor pointer
        g.selectAll('.dot')
          .data(monthlyData)
          .join('circle')
          .attr('class', 'dot')
          .attr('cx', (d) => xScale(d.label))
          .attr('cy', (d) => yScale(d.value))
          .attr('r', 4)
          .attr('fill', lineColor)
          .style('cursor', 'pointer')
          .on('mouseover', function (event, d) {
            d3.select(this).attr('r', 7).attr('fill', d3.color(lineColor).darker(0.2))

            // Get container's position relative to viewport
            const containerRect = container.getBoundingClientRect()
            const mouseX = event.clientX - containerRect.left
            const mouseY = event.clientY - containerRect.top

            tooltip
              .style('visibility', 'visible')
              .html(`${d.month}/${d.year}<br>${Math.round(d.value)} delays`)
              .style('left', `${mouseX + 10}px`)
              .style('top', `${mouseY - 10}px`)
          })
          .on('mouseout', function () {
            d3.select(this).attr('r', 4).attr('fill', lineColor)
            tooltip.style('visibility', 'hidden')
          })

        // Add bold title with title case and "Incidents"
        g.append('text')
          .attr('x', innerWidth / 2)
          .attr('y', -margin.top / 2)
          .attr('text-anchor', 'middle')
          .style('font-size', '14px')
          .style('font-weight', 'bold')
          .text(
            `${delayType
              .split('_')
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')} Delay Incidents Over Time`
          )

        // Return cleanup function
        return () => {
          tooltip.remove()
        }
      } catch (error) {
        console.error('Error in chart rendering:', error)
        console.error('Error stack:', error.stack)
      }
    }

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
  }, [data, delayType, rangeValues])

  if (!data) {
    return (
      <Box
        w="100%"
        h="200px"
        bg="#e4edf6"
        borderRadius="10px"
        p={4}
        boxShadow="sm"
      >
        <Center h="100%">
          <Spinner
            thickness='4px'
            speed='0.65s'
            emptyColor='gray.200'
            color='blue.500'
            size='xl'
          />
        </Center>
      </Box>
    )
  }

  return (
    <Box
      ref={containerRef}
      w="100%"
      h="200px"
      bg="#e4edf6"
      borderRadius="10px"
      p={4}
      boxShadow="sm"
      position="relative">
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }} />
    </Box>
  )
}

export default LineChart
