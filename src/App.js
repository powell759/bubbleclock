import React from 'react';
import * as d3 from 'd3';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.myRef = React.createRef();
    this.dataset = [100, 200, 300, 400, 500];
 }
 
 componentDidMount() {

  var baseDiv = this.myRef.current;

  // Create SVG for clock visualization
  var width = 460
  var height = 460
  var svg = d3.select(baseDiv)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // Mock up some time data
  var times = [
    { name : "work", time : 1200},
    { name : "sleep", time : 500},
    { name : "play", time : 800},
  ]

// draw some test bubbles
var bubbles = svg.append("g")
  .selectAll("circle")
  .data(times)
  .enter()
  .append("circle")
  .attr("class", "node")
  .attr("r", 50)
  .attr("cx", width / 2)
  .attr("cy", height / 2)
  .style("fill", "lightblue")
  .style("fill-opacity", 0.8)
  .attr("stroke", "black")
  .style("stroke-width", 1);


// Features of the forces applied to the nodes:
var simulation = d3.forceSimulation()
    .force("center", d3.forceCenter().x(width / 2).y(height / 2)) // Attraction to the center of the svg area
    .force("charge", d3.forceManyBody().strength(.1)) // Nodes are attracted one each other of value is > 0
    .force("collide", d3.forceCollide().strength(.2).radius(53).iterations(1)) // Force that avoids circle overlapping


simulation
.nodes(times)
.on("tick", function(d){
  bubbles
      .attr("cx", function(d){ return d.x; })
      .attr("cy", function(d){ return d.y; })
});

}

 render() {
  return (
    <div ref={this.myRef}>
    </div>
  );
 }
}

export default App;
