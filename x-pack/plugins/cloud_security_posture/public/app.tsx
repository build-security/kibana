/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { AppMountParameters } from 'kibana/public';
import { Redirect, Router, Route } from 'react-router-dom';

type Props = any;

const Dashboard = () => <div>CSP Dashboard</div>;

const App = ({ history }: Props) => (
  <Router history={history}>
    <Route path="/dashboard" component={Dashboard} />
    <Route exact path="" component={() => <Redirect to={'/dashboard'} />} />
  </Router>
);

export const renderApp = (props: AppMountParameters) => {
  ReactDOM.render(<App {...props} />, props.element);

  return () => ReactDOM.unmountComponentAtNode(props.element);
};
