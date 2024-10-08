import React, { useEffect, useState } from 'react';
import './App.css';
import * as d3 from 'd3';

function App() {
  const [error, setError] = useState(null);
  const [data, setData] = useState(null); // Change the initial state to null

  // Fetch data
  useEffect(() =>{
    const fetchData = async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const fetchedData = await response.json();
        setData(fetchedData);
      } catch (error) {
        console.error('Error fetching data', error);
        setError('Failed to fetch data');
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (data && data.monthlyVariance) {
      const dataset = data.monthlyVariance;
      const w = 1500;
      const h = 700;
      const padding = 100;
  
      const months = ["January", "February", "March", "April", "May", "June", 
                      "July", "August", "September", "October", "November", "December"];
  

      const xScale = d3.scaleLinear()
        .domain([d3.min(dataset, d => d.year), d3.max(dataset, d => d.year)]) 
        .range([padding, w - padding]);
  
      const yScale = d3.scalePoint()
        .domain(months)
        .range([h - padding, padding]);
  
      const colorScale = d3.scaleQuantize()
        .domain([d3.min(dataset, d => d.variance), d3.max(dataset, d => d.variance)])
        .range(d3.schemeRdYlBu[9]);
  
      d3.select("#chart").selectAll("*").remove();
  
      const svg = d3.select("#chart")
        .append("svg")
        .attr("width", w)
        .attr("height", h);
  
      const tooltip = d3.select("body")
        .append("div")
        .attr("id", "tooltip")
        .style("position", "absolute")
        .style("display", "none");
  
      svg.selectAll("rect")
        .data(dataset)
        .enter()
        .append("rect")
        .attr("x", d => xScale(d.year))  
        .attr("y", d => yScale(months[d.month - 1]) - 45)
        .attr("width", (w - 2 * padding) / (d3.max(dataset, d => d.year) - d3.min(dataset, d => d.year)))  // Adjust cell width
        .attr("height", (h - 2 * padding) / 12)
        .attr("class", "cell")
        .style("fill", d => colorScale(d.variance))
        .attr("data-month", d => d.month - 1)
        .attr("data-year", d => d.year)
        .attr("data-temp", d => data.baseTemperature + d.variance)
        .on("mouseover", function (event, d) {
          tooltip
            .style("display", "block")
            .attr("data-year", d.year)
            .html(`${d.year} - ${months[d.month - 1]}<br>${(data.baseTemperature - d.variance).toFixed(2)}℃<br>${d.variance < 0 ? -d.variance.toFixed(2) : d.variance.toFixed(2) }℃`);
        })
        .on("mousemove", function (event) {
          tooltip
            .style("top", `${event.pageY - 50}px`)
            .style("left", `${event.pageX + 10}px`);
        })
        .on("mouseout", function () {
          tooltip.style("display", "none");
        });
  
      const xAxis = d3.axisBottom(xScale)
        .tickFormat(d3.format("d"))  
        .ticks(20);  
  
      const yAxis = d3.axisLeft(yScale);
  
      svg.append("g")
        .attr("transform", `translate(0, ${h - padding})`)
        .attr("id", "x-axis")
        .call(xAxis);
  
      svg.append("g")
        .attr("transform", `translate(${padding}, 0)`)
        .attr("id", "y-axis")
        .call(yAxis);
  
      svg.append("text")
        .attr("x", w / 2)
        .attr("y", h - 50)
        .attr("text-anchor", "middle")
        .attr("class", "axis-label")
        .text("Year");
  
      svg.append("text")
        .attr("x", -h / 2)
        .attr("y", 50)
        .attr("text-anchor", "middle")
        .attr("transform", "rotate(-90)")
        .attr("class", "axis-label")
        .text("Months");
  
      // Legend setup
      let legend = svg.append("g")
        .attr("id", "legend")
        .attr("transform", `translate(${padding}, ${h - 8})`);
  
      legend.selectAll("rect")
        .data(colorScale.range().reverse())
        .enter()
        .append("rect")
        .attr("x", (d, i) => i * 40)
        .attr("y", -50)
        .attr("width", 35)
        .attr("height", 35)
        .attr("fill", d => d);
  
      const colorLabels = ["4", "5", "6", "7", "8", "9", "10", "11", "12"];
      legend.selectAll("g")
        .data(colorLabels)
        .enter()
        .append("g")
        .append("text")
        .text(d => d)
        .attr("x", (d, i) => i * 40 + 15)
        .attr("y", 5)
        .style("fill", "black")
        .attr("text-anchor", "middle");
    }
  }, [data]);
  

  return (
    <div id='main'>
      <h1 id='title'>Monthly Global Land-Surface Temperature</h1>
      <p id='description'>
        {data ? `1753 - 2015: base temperature ${data.baseTemperature.toFixed(2)}℃` : 'Loading...'}
      </p>
      {error ? 
        (<p style={{ color: 'red' }}>{error}</p>) 
        : (
          <div id='chart'></div>
        )}
    </div>
  );
}

export default App; 