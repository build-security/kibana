/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { I18nProvider } from '@kbn/i18n-react';
import { Router, Switch, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
<<<<<<< HEAD
import { KibanaContextProvider } from '../../../../../src/plugins/kibana_react/public';
import type { CspAppDeps } from './app';

const queryClient = new QueryClient();

=======

import { KibanaContextProvider } from '../../../../../src/plugins/kibana_react/public';

import type { AppMountParameters, CoreStart } from '../../../../../src/core/public';
import type { CspStart } from '../types';

const queryClient = new QueryClient();

interface CspAppDeps {
  core: CoreStart;
  deps: CspStart;
  params: AppMountParameters;
}

>>>>>>> 95855fa7343125d097f00abedc1b9b6ed4cf1164
export const TestProvider: React.FC<CspAppDeps> = ({ core, deps, params, children }) => {
  return (
    <KibanaContextProvider services={{ ...deps, ...core }}>
      <QueryClientProvider client={queryClient}>
        <Router history={params.history}>
          <I18nProvider>
            <Switch>
              <Route path="*" render={() => <>{children}</>} />
            </Switch>
          </I18nProvider>
        </Router>
      </QueryClientProvider>
    </KibanaContextProvider>
  );
};
