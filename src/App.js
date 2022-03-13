import React from 'react';
import * as d3 from 'd3';

class App extends React.Component {

  constructor(props) {
    super(props);

    // Draw area
    this.rootDiv = React.createRef();

    // Global clock data
    this.categories = [
      { name : "coding", runs : []},
      { name : "review", runs : []},
      { name : "meetings", runs : []},
      { name : "email", runs : []},
      { name : "pipeline", runs : []},
      { name : "project", runs : []},
      { name : "off task", runs : []},
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
  var MIN_RADIUS = 10;
  var MAX_RADIUS = 150;
  var MIN_TRANSITION_TIME = 10000;
  var min = Math.min(...allTimes);
  var max = Math.max(Math.max(...allTimes), MIN_TRANSITION_TIME);

  var scale = d3.scaleLinear()
    .domain([min, max])
    .range([MIN_RADIUS, MAX_RADIUS]);

  var radius = scale(this.getTotalTime(bubble.runs));
  bubble.radius = radius;
  return radius;
}

// Update the sizes of bubbles
updateSizes() {
  d3
  .selectAll("#bubbleGroup")
  .selectAll("circle")
  .attr("r", d => this.bubbleSize(d));

  this.simulation
    .nodes(this.categories)
    .alpha(0.3)
    .restart();
}

updateDisplay() {
  var viewWidth = window.innerWidth;
  var viewHeight = window.innerHeight;
  var GAP_SIZE = 20;
  var NAV_WIDTH = 200;
  var STROKE_WIDTH = 3;
  var TIMER_HEIGHT = 50;
  var SIMULATION_CENTER_X = (viewWidth + GAP_SIZE + NAV_WIDTH) / 2;
  var SIMULATION_CENTER_Y = viewHeight / 2;
  var MAX_COLORS = 10;
  var categories = this.categories;

  var bubbles = d3
    .selectAll("#bubbleGroup")
    .selectAll("circle")
    .data(this.categories);

  bubbles.enter()
    .append("circle")
    .attr("r", d => this.bubbleSize(d))
    .attr("cx", SIMULATION_CENTER_X)
    .attr("cy", SIMULATION_CENTER_Y)
    .style("fill", d => d3.interpolateTurbo(1 - (categories.indexOf(d) % MAX_COLORS) / MAX_COLORS))
    .attr("stroke", "white")
    .style("stroke-width", STROKE_WIDTH)
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
    }).on("mouseover", (_event, d) => {
      d3.selectAll("#lineGroup")
        .selectAll("line")
        .attr("stroke", d2 => {
          return d == d2 ? "white" : "none"
        });
    });

  bubbles.exit().remove();

  var timers = d3
    .selectAll("#timerGroup")
    .selectAll("rect")
    .data(this.categories)

  timers.enter()
    .append("rect")
    .attr("x", GAP_SIZE)
    .attr("y", d => {
      var index = categories.indexOf(d);
      return GAP_SIZE + index * TIMER_HEIGHT;
    })
    .attr("width", NAV_WIDTH)
    .attr("height", TIMER_HEIGHT)
    .attr("stroke", "white")
    .style("stroke-width", STROKE_WIDTH)
    .on("mouseover", (_event, d) => {
      d3.selectAll("#lineGroup")
        .selectAll("line")
        .attr("stroke", d2 => {
          return d == d2 ? "white" : "none"
        });
    }).on("click", (e, d) => { 
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

  timers.enter()
    .append("circle")
    .attr("r", TIMER_HEIGHT / 4)
    .attr("cx", GAP_SIZE + TIMER_HEIGHT / 2)
    .attr("cy", d => {
      var index = categories.indexOf(d);
      return GAP_SIZE + TIMER_HEIGHT / 2 + index * TIMER_HEIGHT;
    })
    .style("fill", d => d3.interpolateTurbo(1 - (categories.indexOf(d) % MAX_COLORS) / MAX_COLORS))
    .attr("stroke", "white")
    .style("stroke-width", STROKE_WIDTH)
    .on("mouseover", (_event, d) => {
      d3.selectAll("#lineGroup")
        .selectAll("line")
        .attr("stroke", d2 => {
          return d == d2 ? "white" : "none"
        });
    }).on("click", (e, d) => { 
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

  timers.exit().remove();

  var lines = d3
    .selectAll("#lineGroup")
    .selectAll("line")
    .data(categories);

  lines.enter()
    .append("line")
    .attr("x1", GAP_SIZE + NAV_WIDTH)
    .attr("y1", d => {
      var index = categories.indexOf(d);
      return GAP_SIZE + TIMER_HEIGHT * index + TIMER_HEIGHT / 2;
    })
    .attr("x2", window.innerWidth / 2)
    .attr("y2", window.innerHeight / 2)
    .attr("stroke", "none")
    .style("stroke-width", STROKE_WIDTH)

  lines.exit().remove();

  var totalTime = this.getTotalTime;
  var labels = d3
    .selectAll("#labelGroup")
    .selectAll("text")
    .data(categories)

  labels.enter()
    .append("text")
    .attr("x", GAP_SIZE + TIMER_HEIGHT)
    .attr("y", d => {
      var index = categories.indexOf(d);
      return GAP_SIZE + TIMER_HEIGHT * index + TIMER_HEIGHT / 2;
    })
    .text(d => {
      var time = totalTime(d.runs);
      var name = d.name;
      var ms = parseInt((time % 1000) / 10)
      var seconds = 0;
    var minutes = 0;
      var hours = 0;
      return `${name}: ${hours}:${minutes}:${seconds}:${ms}`
    })
    .attr("fill", "white")

  this.simulation
    .nodes(this.categories)
    .alpha(0.9)
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

  var rootDiv = this.rootDiv.current;
  var categories = this.categories;
  var viewWidth = window.innerWidth;
  var viewHeight = window.innerHeight;
  var GAP_SIZE = 20;
  var NAV_WIDTH = 200;
  var STROKE_WIDTH = 3;
  var SIMULATION_CENTER_X = (viewWidth + GAP_SIZE + NAV_WIDTH) / 2;
  var SIMULATION_CENTER_Y = viewHeight / 2;

  // Create root svg element for drawing
  var svg = d3.select(rootDiv)
    .append("svg")
    .attr("width", viewWidth)
    .attr("height", viewHeight)

  // Create visual bounding box for bubbles
  var simBox = svg
    .append("rect")
    .attr("x", 2 * GAP_SIZE + NAV_WIDTH) //
    .attr("y", GAP_SIZE)
    .attr("width", viewWidth - NAV_WIDTH - 3 * GAP_SIZE)
    .attr("height", viewHeight - 2 * GAP_SIZE)
    .attr("stroke", "white")
    .style("stroke-width", STROKE_WIDTH);

  // Create group for bubble vis
  svg.append("g")
    .attr("id", "bubbleGroup");

  // Create group for box timers
  svg.append("g")
    .attr("id", "timerGroup");

  // Create group for connecting lines
  svg.append("g")
    .attr("id", "lineGroup");

    // Create group for labels
    svg.append("g")
    .attr("id", "labelGroup");

  // Features of the forces applied to the nodes:
  this.simulation = d3.forceSimulation()
    .force("x", d3.forceX().x(SIMULATION_CENTER_X).strength(.1)) // X component of gravity
    .force("y", d3.forceY().y(SIMULATION_CENTER_Y).strength(.2)) // Y component of gravity
    .force("charge", d3.forceManyBody().strength(.1)) // Nodes are attracted one each other of value is > 0
    .force("collide", d3.forceCollide().strength(1).radius((d) => {
      return this.bubbleSize(d) + 3;
    }).iterations(100)); // Force that avoids circle overlapping

  // Run the force simulation
  this.simulation
  .nodes(categories)
  .on("tick", () => {

    d3.selectAll("#bubbleGroup")
      .selectAll("circle")
      .attr("cx", d => Math.max(270 + d.radius, d.x))
      .attr("cy", d => Math.max(20 + d.radius, d.y))

    d3.selectAll("#lineGroup")
      .selectAll("line")
      .attr("x2", d => Math.max(270 + d.radius, d.x))
      .attr("y2", d => Math.max(20 + d.radius, d.y))

    var totalTime = this.getTotalTime;
    d3.selectAll("#labelGroup")
    .selectAll("text")
    .text(d => {
      var time = totalTime(d.runs);
      var name = d.name;
      var ms = parseInt((time % 1000) / 10)
      ms = ms < 10 ? "0" + ms : ms;
      var seconds = parseInt((time / 1000) % 60);
      seconds = seconds < 10 ? "0" + seconds : seconds;
      var minutes = parseInt((time / 6000) % 60);
      minutes = minutes < 10 ? "0" + minutes : minutes;
      var hours = parseInt(time / 360000);
      return `${name}: ${hours}:${minutes}:${seconds}:${ms}`
    })
  });

  this.updateDisplay();
  this.loop();
}

 render() {
  return [
    <div ref={this.rootDiv}></div>
  ];
 }
}

export default App;
