import React from 'react';
import * as d3 from 'd3';

class App extends React.Component {

  constructor(props) {
    super(props);
    this.myRef = React.createRef();
    this.dataset = [100, 200, 300, 400, 500];
 }
 
 componentDidMount() {
  // set the dimensions and margins of the graph
  var width = 460
  var height = 460

  // make a hello world message
  d3.select(this.myRef.current)
  .append("p")
  .text("Hello World from D3");
 }

 render() {
  return (
    <div ref={this.myRef}>
    </div>
  );
 }
}

export default App;
