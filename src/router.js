import React from "react";
import { HashRouter as Router, Route, Switch } from "react-router-dom";
import Index from 'routes/index';
import Test from 'routes/test';

const AppRouter = () => (
  <Router>
    <Switch>
        <Route path={process.env.PUBLIC_URL + "/"} exact component={Index} />
        <Route path={process.env.PUBLIC_URL + "/test"} exact component={Test} />
    </Switch>
  </Router>
);

export default AppRouter;