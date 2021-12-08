/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import {
  CoreStart,
  Plugin,
  CoreSetup,
  AppMountParameters,
  AppNavLinkStatus,
} from '../../../../src/core/public';

interface SetupDeps {}

export class CSPPlugin implements Plugin<{}, {}, SetupDeps, {}> {
  public setup(core: CoreSetup, {}: SetupDeps) {
    core.application.register({
      id: 'csp_root',
      title: 'CSP root',
      navLinkStatus: AppNavLinkStatus.visible,
      async mount(params: AppMountParameters) {
        const [coreStart] = await core.getStartServices();
        const { renderApp } = await import('./app');
        return renderApp(params);
      },
    });

    return {};
  }

  public start(core: CoreStart) {
    return {};
  }

  public stop() {}
}
