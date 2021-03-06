import React from 'react';
import * as d3 from 'd3';

class App extends React.Component {

  constructor(props) {
    super(props);

    // Draw area
    this.rootDiv = React.createRef();

    // Global clock data
    this.categories = [
      { name : "staring at this screen", runs : [{ start : Date.now() }]},
      { name : "doing thing one", runs : []},
      { name : "doing thing three", runs : []},
      { name : "doing thing four", runs : []},
      { name : "doing thing five", runs : []},
      { name : "doing thing six", runs : []},
      { name : "meetings", runs : []}
    ];

    this.getTotalTime = this.getTotalTime.bind(this);
    this.bubbleSize = this.bubbleSize.bind(this);
    this.updateSizes = this.updateSizes.bind(this);
    this.updateLinks = this.updateLinks.bind(this);
    this.updateLinksRed = this.updateLinksRed.bind(this);
    this.updateXs = this.updateXs.bind(this);
    this.handleXHover = this.handleXHover.bind(this);
    this.handleAddHover = this.handleAddHover.bind(this);
    this.handleBubbleHover = this.handleBubbleHover.bind(this);
    this.handleTimerHover = this.handleTimerHover.bind(this);
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

// Recalculate links
updateLinks(e, d) {
  d3.selectAll("#lineGroup")
  .selectAll("line")
  .attr("stroke", d2 => e.type == "mouseover" && d == d2 ? "white" : "none")
}

// Recalculate links but red
updateLinksRed(e, d) {
  d3.selectAll("#lineGroup")
  .selectAll("line")
  .attr("stroke", d2 => e.type == "mouseover" && d == d2 ? "red" : "none")
}

// Recalculate links
updateXs(e, d) {
  d3.selectAll("#xGroup")
  .selectAll("g")
  .attr("stroke", d2 => e.type == "mouseover" && d == d2 ? "white" : "none")
}

// Handle hover on timer or corresponding bubble
handleTimerHover(e, d) {
    this.updateXs(e, d)
    this.updateLinks(e, d);
};

// Handle click on timer or corresponding bubble
handleTimerClick(_e, d) { 
  var length = d.runs.length;
  // at least one entry and no end date on most recent
  var isRunning = length != 0 && !d.runs[length-1].end;
  if (isRunning) {
    d.runs[length-1].end = Date.now();
  } else {
    d.runs.push({start: Date.now()});
  }
}

// Handle hover on the X button
handleXHover(e, d) {
  this.updateLinksRed(e, d)
  d3.selectAll("#xGroup")
  .selectAll("g")
  .attr("stroke", d2 => e.type == "mouseover" && d == d2 ? "red" : "none")
}

// Handle add button hover
handleAddHover(e) {
  d3.selectAll("#addButton")
    .attr("stroke", () => e.type == "mouseover" ? "lightgreen" : "white")
}

// Handle bubble hover
handleBubbleHover(e, d) {
  this.updateXs(e, d)
  this.updateLinks(e, d);
}

updateDisplay() {
  var viewWidth = window.innerWidth;
  var viewHeight = window.innerHeight;
  var GAP_SIZE = 20;
  var INNER_GAP_SIZE = 10;
  var NAV_WIDTH = 300;
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
    .style("fill", d => d3.interpolateRainbow(1 - (categories.indexOf(d) % MAX_COLORS) / MAX_COLORS))
    .attr("stroke", "white")
    .style("stroke-width", STROKE_WIDTH)
    .on("click", this.handleTimerClick)
    .on("mouseover", this.handleBubbleHover)
    .on("mouseout", this.handleBubbleHover)

  bubbles.join()
    .style("fill", d => d3.interpolateRainbow(1 - (categories.indexOf(d) % MAX_COLORS) / MAX_COLORS))

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
    .on("mouseover", this.handleTimerHover)
    .on("mouseout", this.handleTimerHover)
    .on("click", this.handleTimerClick);

  timers.exit().remove();

  var timerIcons = d3
    .selectAll("#timerGroupIcons")
    .selectAll("circle")
    .data(this.categories);

  timerIcons.enter()  
    .append("circle")
    .attr("r", TIMER_HEIGHT / 4)
    .attr("cx", GAP_SIZE + TIMER_HEIGHT / 2)
    .attr("cy", d => {
      var index = categories.indexOf(d);
      return GAP_SIZE + TIMER_HEIGHT / 2 + index * TIMER_HEIGHT;
    })
    .style("fill", d => d3.interpolateRainbow(1 - (categories.indexOf(d) % MAX_COLORS) / MAX_COLORS))
    .attr("stroke", "white")
    .style("stroke-width", STROKE_WIDTH)
    .on("click", this.handleTimerClick)
  
  timerIcons.join()
    .style("fill", d => d3.interpolateRainbow(1 - (categories.indexOf(d) % MAX_COLORS) / MAX_COLORS));

  timerIcons.exit().remove();

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
    .style("stroke-width", STROKE_WIDTH)

  lines.exit().remove();

  var labels = d3
    .selectAll("#labelGroup")
    .selectAll("text")
    .data(categories)

  labels.enter()
    .append("text")
    .attr("x", GAP_SIZE + TIMER_HEIGHT)
    .attr("y", d => {
      var index = categories.indexOf(d);
      return GAP_SIZE + TIMER_HEIGHT * index + TIMER_HEIGHT / 2 - 5;
    })
    .text(d => d.name)
    .attr("fill", "white");

  labels.join()
    .text(d => d.name);

  labels.exit().remove();

  var clocks = d3
    .selectAll("#clockGroup")
    .selectAll("text")
    .data(categories)

  clocks.enter()
    .append("text")
    .attr("x", GAP_SIZE + TIMER_HEIGHT)
    .attr("y", d => {
      var index = categories.indexOf(d);
      return GAP_SIZE + TIMER_HEIGHT * index + TIMER_HEIGHT / 2 + 15;
    })
    .text(d => d.name)
    .attr("fill", "white")

  clocks.exit().remove();

  var xGroups = d3
    .selectAll("#xGroup")
    .selectAll("g")
    .data(categories)

  var enterGroup = xGroups.enter()
    .append("g")
    .style("stroke-width", STROKE_WIDTH)
    .on("click", (e, d) => {
      e.stopPropagation() // don't propagate to timer button
      categories.splice(categories.indexOf(d), 1);
      this.updateDisplay()
    })
    .on("mouseover", this.handleXHover)
    .on("mouseout", this.handleXHover)

  enterGroup.append("rect")
    .attr("x", NAV_WIDTH - INNER_GAP_SIZE)
    .attr("y", d => {
      var index = categories.indexOf(d);
      return GAP_SIZE + INNER_GAP_SIZE + TIMER_HEIGHT * index;
    })
    .attr("width", GAP_SIZE)
    .attr("height", GAP_SIZE)

  enterGroup.append("line")
    .attr("x1", () => NAV_WIDTH - INNER_GAP_SIZE)
    .attr("y1", d => GAP_SIZE + INNER_GAP_SIZE + TIMER_HEIGHT * categories.indexOf(d))
    .attr("x2", () => NAV_WIDTH + INNER_GAP_SIZE)
    .attr("y2", d => GAP_SIZE * 2 + INNER_GAP_SIZE + TIMER_HEIGHT * categories.indexOf(d))

  enterGroup.append("line")
    .attr("x1", () => NAV_WIDTH - INNER_GAP_SIZE)
    .attr("y2", d => GAP_SIZE + INNER_GAP_SIZE + TIMER_HEIGHT * categories.indexOf(d))
    .attr("x2", () => NAV_WIDTH + INNER_GAP_SIZE)
    .attr("y1", d => GAP_SIZE * 2 + INNER_GAP_SIZE + TIMER_HEIGHT * categories.indexOf(d))

  xGroups.exit().remove();

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
  var INNER_GAP_SIZE = 10;
  var NAV_WIDTH = 300;
  var STROKE_WIDTH = 3;
  var TIMER_HEIGHT = 50;
  var SIMULATION_CENTER_X = (viewWidth + GAP_SIZE + NAV_WIDTH) / 2;
  var SIMULATION_CENTER_Y = viewHeight / 2;

  // Create root svg element for drawing
  var svg = d3.select(rootDiv)
    .append("svg")
    .attr("width", viewWidth)
    .attr("height", viewHeight - 4)
    .style("font-family", "monospace")
    .style("font-size", "15px");

  // Create visual bounding box for bubbles
  var simBox = svg
    .append("rect")
    .attr("x", 2 * GAP_SIZE + NAV_WIDTH) //
    .attr("y", GAP_SIZE)
    .attr("width", viewWidth - NAV_WIDTH - 3 * GAP_SIZE)
    .attr("height", viewHeight - 2 * GAP_SIZE)
    .attr("stroke", "white")
    .style("stroke-width", STROKE_WIDTH);

  // Create all graphics groups
  var graphicGroups = ["bubbleGroup", "timerGroup", "timerGroupIcons", "lineGroup", "labelGroup", "clockGroup", "xGroup"]
  graphicGroups.forEach( group => svg.append("g").attr("id", group));

  // Create add button
  var updateDisplay = this.updateDisplay;
  var addGroup = svg
    .append("g")
    .attr("id", "addButton")
    .attr("stroke", "white")
    .on("mouseover", this.handleAddHover)
    .on("mouseout", this.handleAddHover)
    .on("click", () => {
      var newCat = prompt("Name of new timer:");
      if (newCat) {
        categories.push({name : newCat, runs : []})
        updateDisplay()
      }
    });

  addGroup
    .append("rect")
    .attr("x", NAV_WIDTH / 2 + GAP_SIZE - TIMER_HEIGHT / 2)
    .attr("y", viewHeight - GAP_SIZE - TIMER_HEIGHT)
    .attr("height", TIMER_HEIGHT)
    .attr("width", TIMER_HEIGHT)
    .style("stroke-width", STROKE_WIDTH)

  addGroup
    .append("line")
    .attr("x1", NAV_WIDTH / 2 + GAP_SIZE - TIMER_HEIGHT / 2 + INNER_GAP_SIZE)
    .attr("x2", NAV_WIDTH / 2 + GAP_SIZE + TIMER_HEIGHT / 2 - INNER_GAP_SIZE)
    .attr("y1", viewHeight - GAP_SIZE - TIMER_HEIGHT / 2)
    .attr("y2", viewHeight - GAP_SIZE - TIMER_HEIGHT / 2)
    .style("stroke-width", 6)

    addGroup
    .append("line")
    .attr("x1", NAV_WIDTH / 2 + GAP_SIZE)
    .attr("x2", NAV_WIDTH / 2 + GAP_SIZE)
    .attr("y1", viewHeight - GAP_SIZE - TIMER_HEIGHT + INNER_GAP_SIZE)
    .attr("y2", viewHeight - GAP_SIZE - INNER_GAP_SIZE)
    .style("stroke-width", 6)

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
    d3.selectAll("#clockGroup")
    .selectAll("text")
    .text(d => {
      var time = totalTime(d.runs);
      var ms = parseInt((time % 1000) / 10).toString().padStart(2, '0')
      var seconds = parseInt((time / 1000) % 60).toString().padStart(2, '0')
      var minutes = parseInt((time / 60000) % 60).toString().padStart(2, '0')
      var hours = parseInt(time / 3600000);
      return `${hours}:${minutes}:${seconds}:${ms}`
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
