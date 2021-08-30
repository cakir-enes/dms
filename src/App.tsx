import React, { useState } from 'react'
import { BrowserRouter, Link, Redirect, Route, Switch } from "react-router-dom";
import { Alignment, Button, ButtonGroup, Navbar } from '@blueprintjs/core';
import Contracts, { CheckStatus } from "./pages/Contracts"
import Dashboard from './pages/Dashboard';

let genData = () => {
  let data = Array.from({ length: 50 }).map((_, i) => {
    i += 1
    return ({
      line: "LINE" + i,
      contractID: "CONTRACT-" + i,
      fullName: "FULL NAME-" + i,
      company: "CORPORATE-" + i,
      region: "KIEV",
      dealer: "DEALER " + i,
      store: "STORE-" + i,
      type: "corp-prepaid",
      date: new Date().toLocaleString(),
      status: "NEW",
      checks: [{ code: "SC", name: "Subscriber Card", status: CheckStatus.NOTSET }, { code: "NP", name: "Contract", status: CheckStatus.NOTSET }]
    })
  })
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
      <span className="font-semibold">Vitaliia Kindra</span>
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
      if (d[i].checks.some(c => c.status === CheckStatus.ERROR)) {
        d[i].status = "WITH_ERR"
      }
      if (d[i].checks.filter(c => c.status === CheckStatus.CHECKED).length === d[i].checks.length) {
        d[i].status = "NO_ERR"
      } else {
        d[i].status = "IN_PROGRESS"
      }
      return [...d]
    })
  }

  let registerDocs = (docs: number[]) => {
    setData(data => {
      docs.forEach(i => {
        data[i].status = "IN_PROGRESS"
      })
      return [...data]
    })
  }

  let setByTemplate = (template: any, docs: number[]) => {
    setData(data => {
      docs.forEach(i => {
        for (let x = 0; x < data[i].checks.length; x++) {
          data[i].checks[x].status = template.original.checks[x].status
        }
        data[i].status = template.original.status
      })
      return [...data]
    })
  }

  return (
    <div className="bp4-dark">

      <BrowserRouter>
        <Switch>
          <Route exact path='/contracts'>
            <Menubar page={"Contracts"} />
            <Contracts data={data} checkStatus={checkStatus} registerDocs={registerDocs} setByTemplate={setByTemplate} />
          </Route>

          <Route exact path='/dashboard'>
            <Menubar page={"Dashboard"} />
            <Dashboard data={data} />
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
