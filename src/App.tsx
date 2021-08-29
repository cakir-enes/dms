import React, { useState } from 'react'
import Diagram from "./pages/Diagram";
import { BrowserRouter, Switch, Route } from "react-router-dom";
import { Card } from '@blueprintjs/core';
import Contracts, { CheckStatus, IContractProps } from "./pages/Contracts"

let genData = () => {
  let data = Array.from({ length: 50 }).map((_, i) => ({
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
    checks: [{ code: "SC", name: "Signature is valid", status: CheckStatus.NOTSET }, { code: "NP", name: "Photo exists", status: CheckStatus.NOTSET }]
  }))
  return data
}
const App = () => {

  let [data, setData] = useState(genData())
  let checkStatus = (contract: string, code: string, status: CheckStatus) => {
    setData(d => {

      let i = d.findIndex(dat => dat.contractID == contract)
      let c = d[i].checks.find(c => c.code == code)
      if (c) {
        c.status = status
      }
      return [...d]
    })
  }

  return (
    <div className="bp4-dark">

      <BrowserRouter>
        <Switch>
          <Route exact path='/'>
            <Contracts data={data} checkStatus={checkStatus} />
          </Route>
        </Switch>
      </BrowserRouter>
    </div>
  );
};

export default App;
