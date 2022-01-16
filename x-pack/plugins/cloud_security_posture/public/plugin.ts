/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { AppMountParameters, CoreSetup, CoreStart, Plugin } from '../../../../src/core/public';
import { AppNavLinkStatus, AppStatus, DEFAULT_APP_CATEGORIES } from '../../../../src/core/public';
import type { CspPluginSetup, CspPluginStart, CspSetup, CspStart } from './types';
import { PLUGIN_ID, PLUGIN_NAME } from '../common';

export class CspPlugin implements Plugin<CspSetup, CspStart, CspPluginSetup, CspPluginStart> {
  public setup(core: CoreSetup<CspPluginStart, CspStart>, plugins: CspPluginSetup): CspSetup {
    // Register an application into the side navigation menu
    const featureFlagValue: boolean = core.uiSettings.get(
      'securitySolution:enableCloudSecurityPosture'
    );

    core.application.register({
      id: PLUGIN_ID,
      title: PLUGIN_NAME,
      status: featureFlagValue ? AppStatus.accessible : AppStatus.inaccessible,
      navLinkStatus: featureFlagValue ? AppNavLinkStatus.visible : AppNavLinkStatus.hidden,
      category: DEFAULT_APP_CATEGORIES.security,
      async mount(params: AppMountParameters) {
        // Load application bundle
        const { renderApp } = await import('./application/index');
        // Get start services as specified in kibana.json
        const [coreStart, depsStart] = await core.getStartServices();
        // Render the application
        return renderApp(coreStart, depsStart as CspStart, params);
      },
    });

    // Return methods that should be available to other plugins
    return {};
  }
  public start(core: CoreStart, plugins: CspPluginStart): CspStart {
    return {};
  }

  public stop() {}
}
