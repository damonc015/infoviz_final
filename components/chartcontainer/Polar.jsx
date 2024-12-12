import React, { useEffect, useRef } from 'react'
import { Box, Spinner, Center } from '@chakra-ui/react'
import * as d3 from 'd3'

const PolarChart = ({ data, delayType, rangeValues }) => {
  const svgRef = useRef()
  const containerRef = useRef()

  useEffect(() => {
    if (!data || !rangeValues || !Array.isArray(rangeValues)) return

    const renderChart = () => {
      const container = containerRef.current
      const width = container.clientWidth
      const height = container.clientHeight

      d3.select(svgRef.current).selectAll('*').remove()

      // season tally
      const seasonalTotals = {
        Winter: 0,
        Spring: 0,
        Summer: 0,
        Fall: 0
      }

      // data for year range
      Object.entries(data)
        .filter(([year]) => year >= rangeValues[0] && year <= rangeValues[1])
        .forEach(([year, months]) => {
          Object.entries(months).forEach(([month, monthData]) => {
            const monthNum = parseInt(month)
            // Sum all carrier_ct values for this month
            const totalDelay = Object.values(monthData).reduce(
              (sum, airline) => sum + (airline[`${delayType}_ct`] || 0),
              0
            )

            if ([12, 1, 2].includes(monthNum)) seasonalTotals.Winter += totalDelay
            else if ([3, 4, 5].includes(monthNum)) seasonalTotals.Spring += totalDelay
            else if ([6, 7, 8].includes(monthNum)) seasonalTotals.Summer += totalDelay
            else if ([9, 10, 11].includes(monthNum)) seasonalTotals.Fall += totalDelay
          })
        })

      const chartData = Object.entries(seasonalTotals).map(([key, value]) => ({
        season: key,
        value: value
      }))

      const radius = Math.min(width, height) / 2 - 40

      const horizontalOffset = width * 0.05
      const verticalOffset = height * 0.015

      const svg = d3
        .select(svgRef.current)
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${width / 2 - horizontalOffset},${height / 2 + verticalOffset})`)

      // Season color scale
      const color = d3
        .scaleOrdinal()
        .domain(['Winter', 'Spring', 'Summer', 'Fall'])
        .range([
          'rgba(54, 162, 235, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(255, 99, 132, 0.5)',
          'rgba(255, 159, 64, 0.5)'
        ])

      // radius
      const rScale = d3
        .scaleLinear()
        .domain([0, d3.max(chartData, (d) => d.value)])
        .range([0, radius])

      // set 5 rings per char
      const numberOfRings = 5
      const maxValue = d3.max(chartData, (d) => d.value)
      const ticks = Array.from({ length: numberOfRings }, (_, i) =>
        (maxValue * (i + 1)) / numberOfRings
      )

      // set seasons on clock directions
      const angleScale = d3
        .scaleOrdinal()
        .domain(['Winter', 'Spring', 'Summer', 'Fall'])
        .range([0, Math.PI/2, Math.PI, 3*Math.PI/2])  // 0° = North, 90° = East, 180° = South, 270° = West

      // background circles
      svg
        .selectAll('.scale-circle')
        .data(ticks)
        .join('circle')
        .attr('class', 'scale-circle')
        .attr('r', (d) => rScale(d))
        .attr('fill', 'none')
        .attr('stroke', '#666')
        .attr('opacity', 0.7)

      // title
      const title = `${delayType
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')} Delay`

      svg
        .append('text')
        .attr('x', 0)
        .attr('y', -height / 2 + 10)
        .attr('text-anchor', 'middle')
        .style('font-size', '14px')
        .style('font-weight', 'bold')
        .text(title)

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

        // draw circles and lines
        chartData.forEach((d) => {
          const angle = angleScale(d.season)
          const r = rScale(d.value)

          // season lines
          svg
            .append('line')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', r * Math.cos(angle - Math.PI / 2))
            .attr('y2', r * Math.sin(angle - Math.PI / 2))
            .attr('stroke', 'gray')
            .attr('stroke-width', 1)

          // circle
          svg
            .append('circle')
            .attr('cx', r * Math.cos(angle - Math.PI / 2))
            .attr('cy', r * Math.sin(angle - Math.PI / 2))
            .attr('r', 5)
            .attr('fill', color(d.season))
            .style('cursor', 'pointer')
            .on('mouseover', function (event) {
              d3.select(this)
                .attr('r', 7)
                .attr('fill', d3.color(color(d.season)).darker(0.2))

              const rect = containerRef.current.getBoundingClientRect()
              const x = event.clientX - rect.left
              const y = event.clientY - rect.top

              tooltip
                .style('visibility', 'visible')
                .html(`${d.season}: ${d.value.toLocaleString()} delays`)
                .style('left', `${x + 10}px`)
                .style('top', `${y - 10}px`)
            })
            .on('mouseout', function () {
              d3.select(this).attr('r', 5).attr('fill', color(d.season))

              tooltip.style('visibility', 'hidden')
            })
        })

        return () => {
          tooltip.remove()
        }
      } catch (error) {
        console.error('Error in chart rendering:', error)
        console.error('Error stack:', error.stack)
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
  }, [data, delayType, rangeValues])

  if (!data || !rangeValues || !Array.isArray(rangeValues)) {
    return (
      <Box
        w="100%"
        h="300px"
        bg="#e4edf6"
        borderRadius="10px"
        p={4}
        boxShadow="sm"
        position="relative"
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
      h="300px"
      bg="#e4edf6"
      borderRadius="10px"
      p={4}
      boxShadow="sm"
      display="flex"
      justifyContent="center"
      alignItems="center"
      mr="2.5rem"
      position="relative">
      <svg
        ref={svgRef}
        style={{ width: '100%', height: '100%', maxWidth: '500px', maxHeight: '300px' }}
      />
    </Box>
  )
}

export default PolarChart
