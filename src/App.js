import React from 'react';
import * as d3 from 'd3';

class App extends React.Component {

  constructor(props) {
    super(props);

    // Draw area
    this.drawDiv = React.createRef();

    // Global clock data
    this.categories = [
      { name : "work", time : 0, color: 1},
      { name : "sleep", time : 0, color: 2},
      { name : "play", time : 20, color: 3}
    ];

    // Global clock status
    this.running = false;
    this.selectedCategory = null;
    this.simulation = null;

    // Bind exposed functions
    this.bubbleSize = this.bubbleSize.bind(this);
    this.updateSizes = this.updateSizes.bind(this);
    this.resetSimulation = this.resetSimulation.bind(this);
    this.handleClick = this.handleClick.bind(this);
 }

  // Calculate relative bubble size
  bubbleSize(bubble) {
    var allTimes = this.categories.map(entry => entry.time);
    var min = Math.min(...allTimes);
    var max = Math.max(...allTimes);

    var scale = d3.scaleLinear()
      .domain([min, max])
      .range([10, 50]);

    return scale(bubble.time);
  }

  // Update the sizes of bubbles
  updateSizes() {
    d3.selectAll("circle")
    .transition()
    .attr("r", d => this.bubbleSize(d));
  }

  // Reset the simulation
  resetSimulation() {

    // Update the radius of the individual circles
    this.simulation
    .force("collide", d3.forceCollide().strength(.5).radius((d) => {
      var radius = this.bubbleSize(d) + 3;
      console.log(radius);
      return radius;
    }).iterations(1));

    // Restart the simulation
    this.simulation.alpha(0.3).restart();
  }

  // Handle clicks
  handleClick() {

    // Set a random bubble to a random size
    var index = Math.floor(Math.random() * 3);
    var value = Math.floor(Math.random() * 1001);
    this.categories[index].time = value;

    // Reset the simulation
    this.updateSizes();
    this.resetSimulation();
  }

 componentDidMount() {

  var baseDiv = this.drawDiv.current;
  var categories = this.categories;

  // SETUP: Create SVG for clock visualization
  var width = window.innerWidth;
  var height = window.innerHeight;
  var svg = d3.select(baseDiv)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // A color scale
  var color = d3.scaleOrdinal()
    .domain([1, 2, 3])
    .range([ "#F8766D", "#00BA38", "#619CFF"])

  // SETUP: Draw some test bubbles
  var bubbleGroups = svg.append("g")
    .selectAll("circle")
    .data(categories)
    .enter()
    .append("g");

  var bubbles = bubbleGroups
      .append("circle")
      .attr("class", "node")
      .attr("r", d => this.bubbleSize(d, categories))
      .attr("cx", width / 2)
      .attr("cy", height / 2)
      .style("fill", d => color(d.color))
      .style("fill-opacity", 0.8)
      .attr("stroke", "white")
      .style("stroke-width", 3);

  // Features of the forces applied to the nodes:
  this.simulation = d3.forceSimulation()
    .force("x", d3.forceX().x(width/2).strength(.1))
    .force("y", d3.forceY().y(height/2).strength(.1))
    .force("charge", d3.forceManyBody().strength(.1)) // Nodes are attracted one each other of value is > 0
    .force("collide", d3.forceCollide().strength(.5).radius((d) => {
      var radius = this.bubbleSize(d, categories) + 3;
      return radius;
    }).iterations(1)); // Force that avoids circle overlapping

  // Run the force simulation
  this.simulation
    .nodes(categories)
    .on("tick", function(d){
      bubbles
        .attr("cx", function(d){ return d.x; })
        .attr("cy", function(d){ return d.y; })
  });
}

 render() {
  return [
    <div onClick={this.handleClick} ref={this.drawDiv}></div>
  ];
 }
}

export default App;
