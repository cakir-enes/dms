import React, { useState } from 'react'
import Diagram from "./pages/Diagram";
import { BrowserRouter, Switch, Route, useRouteMatch, Link, Redirect } from "react-router-dom";
import { Alignment, Button, ButtonGroup, Card, Icon, Navbar, NavbarDivider } from '@blueprintjs/core';
import Contracts, { CheckStatus, IContractProps } from "./pages/Contracts"
import Dashboard from './pages/Dashboard';

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

const Menubar = (props: { page: string }) => {

  return <Navbar fixedToTop>
    <Navbar.Group align={Alignment.LEFT}>
      <Navbar.Heading className="w-3 font-bold text-xl">{props.page}</Navbar.Heading>
      <Navbar.Divider />
      <ButtonGroup minimal className="ml-20">


        <Link className="text-gray-400" to="/contracts">
          <Button>Contracts</Button>
        </Link>

        <Link className="text-gray-400" to="/dashboard">
          <Button>
            Dashboard
          </Button>

        </Link>
      </ButtonGroup>
    </Navbar.Group>
    <Navbar.Group align={Alignment.RIGHT}>
      <span className="font-semibold">Serbulent Basgaaan</span>
      <Button icon="log-out" minimal />
    </Navbar.Group>
  </Navbar>
}

const App = () => {
  let [page, setPage] = useState("Contracts")
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
          <Route exact path='/contracts'>
            <Menubar page={"Contracts"} />
            <Contracts data={data} checkStatus={checkStatus} />
          </Route>

          <Route exact path='/dashboard'>
            <Menubar page={"Dashboard"} />
            <Dashboard />
          </Route>

          <Route exact path="/">
            <Redirect to="/contracts" />
          </Route>
        </Switch>
      </BrowserRouter>
    </div>
  );
};

export default App;
