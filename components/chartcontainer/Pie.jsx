'use client'
import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { Spinner, Center } from '@chakra-ui/react'

const Pie = ({ data }) => {
  const containerRef = useRef(null)
  const svgRef = useRef(null)

  useEffect(() => {
    // Clear any existing SVG content
    d3.select(svgRef.current).selectAll("*").remove()

    if (!data || data.length === 0) return

    const handleResize = () => {
      d3.select(svgRef.current).selectAll("*").remove()
      renderChart()
    }

    const renderChart = () => {
      const container = containerRef.current
      const containerWidth = container.clientWidth
      const containerHeight = Math.min(containerWidth * 0.8, 500)

      // pie dimensions
      const margin = { top: 20, right: 20, bottom: 100, left: 20 }
      const width = containerWidth - margin.left - margin.right
      const height = containerHeight - margin.top - margin.bottom
      const radius = Math.min(width, height) / 2

      const svg = d3.select(svgRef.current)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom + (data.length * 25))
        .append('g')
        .attr('transform', `translate(${width/2 + margin.left},${height/2 + margin.top})`)

      // color scale
      const color = d3
        .scaleOrdinal()
        .domain(data.map((d) => d.name))
        .range(d3.schemeSet2)

      // make pie chart
      const pie = d3
        .pie()
        .value((d) => d.value)
        .sort(null)

      const arc = d3
        .arc()
        .innerRadius(0)
        .outerRadius(radius * 0.8)

      // Add tooltips
      const tooltip = d3
        .select('body')
        .append('div')
        .style('position', 'absolute')
        .style('background-color', 'white')
        .style('padding', '5px')
        .style('border', '1px solid #ccc')
        .style('border-radius', '5px')
        .style('visibility', 'hidden')
        .style('z-index', '10')

      // pie chart pieces
      const paths = svg
        .selectAll('path')
        .data(pie(data))
        .enter()
        .append('path')
        .attr('d', arc)
        .attr('fill', (d) => color(d.data.name))
        .attr('stroke', 'white')
        .style('stroke-width', '2px')
        .on('mouseover', function (event, d) {
          tooltip
            .style('visibility', 'visible')
            .html(`${d.data.name}: ${d.data.value.toLocaleString()} minutes`)
            .style('left', event.pageX + 10 + 'px')
            .style('top', event.pageY - 10 + 'px')
          d3.select(this).style('opacity', 0.8)
        })
        .on('mouseout', function () {
          tooltip.style('visibility', 'hidden')
          d3.select(this).style('opacity', 1)
        })

      // percentage labels
      const labelArc = d3
        .arc()
        .innerRadius(radius * 0.5)
        .outerRadius(radius * 0.5)

      svg
        .selectAll('text.percentage')
        .data(pie(data))
        .enter()
        .append('text')
        .attr('class', 'percentage')
        .attr('transform', (d) => `translate(${labelArc.centroid(d)})`)
        .attr('text-anchor', 'middle')
        .text((d) => {
          const percentage = ((d.data.value / d3.sum(data, (d) => d.value)) * 100).toFixed(1)
          return percentage > 5 ? `${percentage}%` : ''
        })
        .style('font-size', '12px')
        .style('fill', 'white')

      // legend
      const legendGroup = svg.append('g')
        .attr('transform', `translate(${-width/2 + 20},${height/2 + 50})`)

      // background color
      const legendBackground = legendGroup.append('rect')
        .attr('x', -10)
        .attr('y', -35)
        .attr('width', width * 0.9)
        .attr('height', (data.length * 25) + 40)
        .attr('fill', '#e4edf6')
        .attr('rx', 10)
        .attr('ry', 10)

      // title
      const totalDelays = d3.sum(data, d => d.value)
      legendGroup.append('text')
        .attr('x', 10)
        .attr('y', -10)
        .text(`Total Delays: ${totalDelays.toLocaleString()} minutes`)
        .style('font-size', '14px')
        .style('font-weight', 'bold')

      const legendSpacing = 25;
      const legend = legendGroup.selectAll('.legend')
        .data(data)
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', (d, i) => `translate(10, ${i * legendSpacing})`)

      legend.append('rect')
        .attr('width', 15)
        .attr('height', 15)
        .style('fill', d => color(d.name))

      legend.append('text')
        .attr('x', 20)
        .attr('y', 12)
        .text(d => `${d.name} - ${d.value.toLocaleString()}`)
        .style('font-size', '12px')
        .style('font-weight', 'bold')
    }

    renderChart()

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      d3.select('body').selectAll('.tooltip').remove()
      d3.select(svgRef.current).selectAll("*").remove() // Clear on unmount
    }
  }, [data])

  if (!data || data.length === 0) {
    return (
      <Center h="100%" minH="400px">
        <Spinner
          thickness='4px'
          speed='0.65s'
          emptyColor='gray.200'
          color='blue.500'
          size='xl'
        />
      </Center>
    )
  }

  return (
    <div ref={containerRef} style={{
      width: '100%',
      height: '100%',
      minHeight: '400px',
      maxHeight: '650px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 'clamp(10px, 3vw, 30px)'
    }}>
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>
    </div>
  )
}

export default Pie
