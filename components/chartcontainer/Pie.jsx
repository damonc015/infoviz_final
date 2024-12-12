'use client'
import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'

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
      // Set a maximum height for the chart
      const containerHeight = Math.min(containerWidth * 0.8, 500) // Limit maximum height

      // Set up dimensions
      const margin = { top: 20, right: 20, bottom: 100, left: 20 }
      const width = containerWidth - margin.left - margin.right
      const height = containerHeight - margin.top - margin.bottom
      const radius = Math.min(width, height) / 2

      // Create SVG
      const svg = d3.select(svgRef.current)
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom + (data.length * 25))
        .append('g')
        .attr('transform', `translate(${width/2 + margin.left},${height/2 + margin.top})`)

      // Set up colors
      const color = d3
        .scaleOrdinal()
        .domain(data.map((d) => d.name))
        .range(d3.schemeSet2)

      // Create pie chart
      const pie = d3
        .pie()
        .value((d) => d.value)
        .sort(null)

      const arc = d3
        .arc()
        .innerRadius(0)
        .outerRadius(radius * 0.8) // Slightly smaller to make room for legend

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

      // Create pie chart segments
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

      // Add percentage labels
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

      // Add legend with white background
      const legendGroup = svg.append('g')
        .attr('transform', `translate(${-width/3},${height/2 + 10})`)

      // Add background for legend with darker shade and more rounded corners
      const legendBackground = legendGroup.append('rect')
        .attr('x', -10)
        .attr('y', -10)
        .attr('width', width * 0.8)
        .attr('height', (data.length * 25) + 20)
        .attr('fill', '#f5f5f5') // Light gray background
        .attr('rx', 10) // More rounded corners
        .attr('ry', 10)

      const legendSpacing = 25;
      const legend = legendGroup.selectAll('.legend')
        .data(data)
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', (d, i) => `translate(${(width * 0.8) / 4}, ${i * legendSpacing})`) // Center items horizontally

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

    // Initial render
    renderChart()

    // Add resize listener
    window.addEventListener('resize', handleResize)

    // Cleanup function
    return () => {
      window.removeEventListener('resize', handleResize)
      d3.select('body').selectAll('.tooltip').remove()
      d3.select(svgRef.current).selectAll("*").remove() // Clear on unmount
    }
  }, [data])

  return (
    <div ref={containerRef} style={{
      width: '100%',
      height: '100%',
      minHeight: '400px',
      maxHeight: '500px',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <svg ref={svgRef} style={{ width: '100%', height: '100%' }}></svg>
    </div>
  )
}

export default Pie
