// src/App.js

import React, { useState, useEffect } from "react";
import ReactTable from "react-table";
import "react-table/react-table.css";
import { getInitialFlightData } from "./DataProvider";

const columns = [
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

const App = () => {
  const [data, setData] = useState(getInitialFlightData());

  useEffect(() => {
    const eventSource = new EventSource("http://localhost:5000/events");

    eventSource.addEventListener("flightStateUpdate", e => {
      const { state, flight } = JSON.parse(e.data);

      setData(prev =>
        prev.map(x => ({
          ...x,
          state: x.flight === flight ? state : x.state
        }))
      );
    });

    eventSource.addEventListener("flightRemoval", e => {
      const { flight } = JSON.parse(e.data);

      setData(prev => prev.filter(x => x.flight !== flight));
    });

    eventSource.addEventListener("closedConnection", () => {
      eventSource.close();
      alert("Connection Closed");
    });
  }, []);

  return <ReactTable data={data} columns={columns} />;
};

export default App;
