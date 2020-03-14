// src/App.js

import React, { Component } from "react";
import ReactTable from "react-table";
import "react-table/react-table.css";
import { getInitialFlightData } from "./DataProvider";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: getInitialFlightData()
    };

    this.eventSource = new EventSource("http://localhost:5000/events");

    this.columns = [
      {
        Header: "Origin",
        accessor: "origin"
      },
      {
        Header: "Flight",
        accessor: "flight"
      },
      {
        Header: "Arrival",
        accessor: "arrival"
      },
      {
        Header: "State",
        accessor: "state"
      }
    ];
  }

  componentDidMount() {
    this.eventSource.addEventListener("flightStateUpdate", e =>
      this.updateFlightState(e)
    );
    this.eventSource.addEventListener("flightRemoval", e =>
      this.removeFlight(e)
    );
    this.eventSource.addEventListener("closedConnection", e =>
      this.stopUpdates()
    );
  }

  updateFlightState(e) {
    const flightState = JSON.parse(e.data);

    let newData = this.state.data.map(item => {
      if (item.flight === flightState.flight) {
        item.state = flightState.state;
      }
      return item;
    });

    this.setState(Object.assign({}, { data: newData }));
  }

  removeFlight(e) {
    const flightInfo = JSON.parse(e.data);

    const newData = this.state.data.filter(
      item => item.flight !== flightInfo.flight
    );

    this.setState(Object.assign({}, { data: newData }));
  }

  stopUpdates() {
    this.eventSource.close();
    alert("closed");
  }

  render() {
    return (
      <div className="App">
        <button onClick={() => this.stopUpdates()}>Stop updates</button>
        <ReactTable data={this.state.data} columns={this.columns} />
      </div>
    );
  }
}

export default App;
