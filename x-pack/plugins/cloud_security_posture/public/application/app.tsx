/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import React from 'react';
import { I18nProvider } from '@kbn/i18n-react';
import { Router, Redirect, Switch, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
<<<<<<< HEAD
import { allNavigationItems } from '../common/navigation/constants';
=======
import { CSP_DASHBOARD_PATH } from '../common/navigation/constants';
>>>>>>> 95855fa7343125d097f00abedc1b9b6ed4cf1164
import { routes } from './routes';
import { UnknownRoute } from '../components/unknown_route';
import { KibanaContextProvider } from '../../../../../src/plugins/kibana_react/public';
import type { AppMountParameters, CoreStart } from '../../../../../src/core/public';
<<<<<<< HEAD
import type { CspClientPluginStartDeps } from '../types';

const queryClient = new QueryClient();

export interface CspAppDeps {
  core: CoreStart;
  deps: CspClientPluginStartDeps;
=======
import type { CspStart } from '../types';

const queryClient = new QueryClient();

interface CspAppDeps {
  core: CoreStart;
  deps: CspStart;
>>>>>>> 95855fa7343125d097f00abedc1b9b6ed4cf1164
  params: AppMountParameters;
}

export const CspApp = ({ core, deps, params }: CspAppDeps) => (
  <KibanaContextProvider services={{ ...deps, ...core }}>
    <QueryClientProvider client={queryClient}>
      <Router history={params.history}>
        <I18nProvider>
          <Switch>
            {routes.map((route) => (
              <Route key={route.path as string} {...route} />
            ))}
            <Route exact path="/" component={RedirectToDashboard} />
            <Route path="*" component={UnknownRoute} />
          </Switch>
        </I18nProvider>
      </Router>
    </QueryClientProvider>
  </KibanaContextProvider>
);

<<<<<<< HEAD
const RedirectToDashboard = () => <Redirect to={allNavigationItems.dashboard.path} />;
=======
const RedirectToDashboard = () => <Redirect to={CSP_DASHBOARD_PATH} />;
>>>>>>> 95855fa7343125d097f00abedc1b9b6ed4cf1164
