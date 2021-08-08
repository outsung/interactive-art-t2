import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import Camera from "./Camera";

import Main from "./Main";
import reportWebVitals from "./reportWebVitals";

import { Router, Switch, Route } from "react-router-dom";

import Socket from "./utils/socket";
import history from "./utils/browserHistory";

Socket.init();

ReactDOM.render(
  <Router history={history}>
    <Switch>
      <Route exact path="/" component={App} />
      <Route exact path="/main" component={Main} />
      <Route exact path="/camera" component={Camera} />
    </Switch>
  </Router>,
  // <Main />,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
