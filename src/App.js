import React from 'react';
import * as d3 from 'd3';

class App extends React.Component {

  constructor(props) {
    super(props);

    // Draw area
    this.drawDiv = React.createRef();

    // Global clock data
    this.categories = [
      { name : "work", runs : []},
      { name : "sleep", runs : []},
      { name : "play", runs : []}
    ];

    window.addCategory = (category) => {
      this.categories.push({name: category, runs: [], color: 2});
      this.updateDisplay();
    }

    this.getTotalTime = this.getTotalTime.bind(this);
    this.bubbleSize = this.bubbleSize.bind(this);
    this.updateSizes = this.updateSizes.bind(this);
    this.updateDisplay = this.updateDisplay.bind(this);
    this.loop = this.loop.bind(this);
 }

sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

getTotalTime(runs) {
  var totalTime = 0;
  runs.forEach(run => {
    totalTime += ( run.end || Date.now() ) - run.start;
  });
  return totalTime;
}

// Calculate relative bubble size
bubbleSize(bubble) {
  var allTimes = this.categories.map(entry => this.getTotalTime(entry.runs));
  var min = Math.min(...allTimes);
  var max = Math.max(...allTimes);

  var scale = d3.scaleLinear()
    .domain([min, max])
    .range([30, 100]);

  var radius = scale(this.getTotalTime(bubble.runs));
  bubble.radius = radius;
  return radius;
}

// Update the sizes of bubbles
updateSizes() {
  d3.selectAll("circle")
  .attr("r", d => this.bubbleSize(d));

  this.simulation
    .nodes(this.categories)
    .alpha(0.3)
    .restart();
}

updateDisplay() {

  // SETUP: Draw some test bubbles
  var bubbles = this.svg
    .selectAll("g")
    .data(this.categories);

  // ENTER:
  var bubbleGroup = bubbles.enter()
    .append("g");

  bubbleGroup
    .append("circle")
    .attr("r", d => this.bubbleSize(d))
    .style("fill", d => d3.interpolateTurbo(Math.random()))
    .attr("stroke", "white")
    .style("stroke-width", 2)
    .on("click", (e, d) => { 
      e.stopPropagation();
      var length = d.runs.length;
      // at least one entry and no end date on most recent
      var isRunning = length != 0 && !d.runs[length-1].end;
      if (isRunning) {
        d.runs[length-1].end = Date.now();
      } else {
        d.runs.push({start: Date.now()});
      }
    })

  bubbleGroup
    .append("text")
    .text("0")
    .attr("stroke", "white")
    .attr("fill", "white")
    .attr("lengthAdjust", "spacingAndGlyphs")
    .attr("text-anchor", "middle")
    .attr("alignment-baseline", "central")
    .on("click", (e, d) => { 
      e.stopPropagation();
      var length = d.runs.length;
      // at least one entry and no end date on most recent
      var isRunning = length != 0 && !d.runs[length-1].end;
      if (isRunning) {
        d.runs[length-1].end = Date.now();
      } else {
        d.runs.push({start: Date.now()});
      }
    })

  // REMOVE: When a category is removed
  bubbles.exit().remove();

  // RESTART SIMULATION

  this.simulation
    .nodes(this.categories)
    .alpha(0.3)
    .restart();
}

  // Set up timer loop
  async loop() {
    while (true) {
      this.updateSizes();
      await this.sleep(10);
    }
  }

 async componentDidMount() {

  var baseDiv = this.drawDiv.current;
  var categories = this.categories;

  // SETUP: Create SVG for clock visualization
  var width = window.innerWidth;
  var height = window.innerHeight;
  this.svg = d3.select(baseDiv)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

    // Features of the forces applied to the nodes:
    this.simulation = d3.forceSimulation()
      .force("x", d3.forceX().x(width/2).strength(.1))
      .force("y", d3.forceY().y(height/2).strength(.1))
      .force("charge", d3.forceManyBody().strength(.1)) // Nodes are attracted one each other of value is > 0
      .force("collide", d3.forceCollide().strength(.5).radius((d) => {
        return this.bubbleSize(d) + 3;
      }).iterations(1)); // Force that avoids circle overlapping

    // Run the force simulation
    var svg = this.svg;
    this.simulation
    .nodes(categories)
    .on("tick", function(d){
      svg.selectAll("circle")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)

      svg.selectAll("text")
        .attr("x", d => d.x)
        .attr("y", d => d.y)
        .text(d => {
          var totalTime = 0;
          d.runs.forEach(run => {
            totalTime += ( run.end || Date.now() ) - run.start;
          });
          return totalTime;
        })
  });

  // Add new category
  svg.on("click", () => {
    categories.push({name: "test", runs: []});
    this.updateDisplay();
  });

  this.updateDisplay();
  this.loop();
}

 render() {
  return [
    <div ref={this.drawDiv}></div>
  ];
 }
}

export default App;
