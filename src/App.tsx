import React from 'react'
import Diagram from "./pages/Diagram";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { Card } from '@blueprintjs/core';
import Contracts from "./pages/Contracts"

let genData = () => {
  return Array.from({ length: 50 }).map((_, i) => ({
    line: "LINE" + i,
    contractID: "CONTRACT-" + i,
    fullName: "FULL NAME",
    company: "REDDLYNE INC",
    region: "KIEV",
    dealer: "TURKCELL IBO",
    store: "MKEMAL STORE",
    type: "corp-prepaid",
    date: new Date().toISOString(),
    status: "NEW",
  }))
}
const App = () => {
  return (
    <div className="bp4-dark">

      <BrowserRouter>
        <Switch>
          <Route exact path='/'>
            <Contracts data={genData()} />
          </Route>
        </Switch>
      </BrowserRouter>
    </div>
  );
};

export default App;
