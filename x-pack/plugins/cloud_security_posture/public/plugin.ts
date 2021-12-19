/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { AppMountParameters, CoreSetup, CoreStart, Plugin } from '../../../../src/core/public';
import type { CspSetup, CspStart, CspPluginSetup, CspPluginStart } from './types';
import { AppNavLinkStatus, AppStatus } from '../../../../src/core/public';
import { PLUGIN_NAME } from '../common';

export class CspPlugin implements Plugin<CspSetup, CspStart, CspPluginSetup, CspPluginStart> {
  public setup(core: CoreSetup, plugins: CspPluginSetup): CspSetup {
    // Register an application into the side navigation menu
    core.application.register({
      id: 'csp_root',
      title: PLUGIN_NAME,
      status: AppStatus.accessible,
      navLinkStatus: AppNavLinkStatus.hidden,
      async mount(params: AppMountParameters) {
        // Load application bundle
        const { renderApp } = await import('./application/index');
        // Get start services as specified in kibana.json
        const [coreStart, depsStart] = await core.getStartServices();
        // Render the application
        return renderApp(coreStart, depsStart as CspStart, params);
      },
    });

    // TODO:
    // - call from FE/BE ?
    // - use upsert instead of override ?
    // - error handling
    initKubebeatDataView(core.http);

    // Return methods that should be available to other plugins
    return {};
  }
  public start(core: CoreStart, plugins: CspPluginStart): CspStart {
    return {};
  }

  public stop() {}
}

const initKubebeatDataView = async (http: CoreSetup['http']) =>
  http.post('/api/index_patterns/index_pattern', {
    body: JSON.stringify({
      override: true,
      index_pattern: {
        title: 'kubebeat*',
        allowNoIndex: true,
      },
    }),
  });
