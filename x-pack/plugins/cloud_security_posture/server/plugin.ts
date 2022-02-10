/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type {
  PluginInitializerContext,
  CoreSetup,
  CoreStart,
  Plugin,
  Logger,
} from '../../../../src/core/server';
<<<<<<< HEAD
import { CspAppService } from './lib/csp_app_services';
=======
>>>>>>> main
import { createFindingsIndexTemplate } from './index_template/create_index_template';
import type {
  CspServerPluginSetup,
  CspServerPluginStart,
  CspServerPluginSetupDeps,
  CspServerPluginStartDeps,
} from './types';
import { defineRoutes } from './routes';
<<<<<<< HEAD
import { initUiSettings } from './uiSettings';

export interface CspAppContext {
  logger: Logger;
  service: CspAppService;
}
=======
import { initUiSettings } from './ui_settings';
>>>>>>> main

export class CspPlugin
  implements
    Plugin<
      CspServerPluginSetup,
      CspServerPluginStart,
      CspServerPluginSetupDeps,
      CspServerPluginStartDeps
    >
{
  private readonly logger: Logger;
  constructor(initializerContext: PluginInitializerContext) {
    this.logger = initializerContext.logger.get();
  }
<<<<<<< HEAD
  private readonly CspAppService = new CspAppService();
=======
>>>>>>> main

  public setup(
    core: CoreSetup<CspServerPluginStartDeps, CspServerPluginStart>,
    plugins: CspServerPluginSetupDeps
  ): CspServerPluginSetup {
    this.logger.debug('csp: Setup');
<<<<<<< HEAD

    const cspAppContext: CspAppContext = {
      logger: this.logger,
      service: this.CspAppService,
    };

    const router = core.http.createRouter();

    // Register server side APIs
    defineRoutes(router, cspAppContext);

=======
    const router = core.http.createRouter();

    // Register server side APIs
    defineRoutes(router, this.logger);
>>>>>>> main
    initUiSettings(core.uiSettings);

    return {};
  }

  public start(core: CoreStart, plugins: CspServerPluginStartDeps): CspServerPluginStart {
    this.logger.debug('csp: Started');
<<<<<<< HEAD
    this.CspAppService.start({
      ...plugins.fleet,
    });

=======
>>>>>>> main
    createFindingsIndexTemplate(core.elasticsearch.client.asInternalUser, this.logger).catch(
      this.logger.error
    );
    return {};
  }
  public stop() {}
}
