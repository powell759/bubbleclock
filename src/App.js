import React from 'react';
import * as d3 from 'd3';
import { scaleDivergingPow } from 'd3';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.myRef = React.createRef();
    this.dataset = [100, 200, 300, 400, 500];
 }
 
 componentDidMount() {

  var baseDiv = this.myRef.current;

  // Create SVG for clock visualization
  var width = window.innerWidth;
  var height = window.innerHeight;
  var svg = d3.select(baseDiv)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Mock up some time data
  var times = [
    { name : "work", time : 0},
    { name : "sleep", time : 50},
    { name : "play", time : 100},
  ]

  // bubble size function
var bubbleSize = function(bubble) {
  var allTimes = times.map(entry => entry.time);
  var min = Math.min(...allTimes);
  var max = Math.max(...allTimes);

  var scale = d3.scaleLinear()
    .domain([min, max])
    .range([10, 50])

  return scale(bubble.time);
}

// draw some test bubbles
var bubbles = svg.append("g")
  .selectAll("circle")
  .data(times)
  .enter()
  .append("circle")
    .attr("class", "node")
    .attr("r", d => bubbleSize(d))
    .attr("cx", width / 2)
    .attr("cy", height / 2)
    .style("fill", "lightyellow")
    .style("fill-opacity", 0.8)
    .attr("stroke", "white")
    .style("stroke-width", 1);

// Features of the forces applied to the nodes:
var simulation = d3.forceSimulation()
    .force("center", d3.forceCenter().x(width / 2).y(height / 2)) // Attraction to the center of the svg area
    .force("charge", d3.forceManyBody().strength(.1)) // Nodes are attracted one each other of value is > 0
    .force("collide", d3.forceCollide().strength(.2).radius(53).iterations(1)) // Force that avoids circle overlapping


var updateDisplay = function() {

  // Update sizes of the bubble clocks
  d3.selectAll("circle")
  .attr("r", d => bubbleSize(d));

  // Re-run the force simulation
  simulation
    .nodes(times)
    .on("tick", function(d){
      bubbles
          .attr("cx", function(d){ return d.x; })
          .attr("cy", function(d){ return d.y; })
    });
}

var timerLoop = async function() {
  while (true) {
    var radius = Math.floor(Math.random() * 101)
    var index = Math.floor(Math.random() * 3)

    updateDisplay();
    times[index].time = radius;
    await new Promise(r => setTimeout(r, 1000));
  }
}

timerLoop();

}

 render() {
  return ([
    <div ref={this.myRef}>
    </div>
    ]
  );
 }
}

export default App;
