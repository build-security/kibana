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
import { createFindingsIndexTemplate } from './index_template/create_index_template';
<<<<<<< HEAD
import type {
  CspServerPluginSetup,
  CspServerPluginStart,
  CspServerPluginSetupDeps,
  CspServerPluginStartDeps,
} from './types';
=======
import { ruleAssetType } from './saved_objects';
import type { CspSetup, CspStart, CspPluginSetup, CspPluginStart } from './types';
>>>>>>> b350c816a15 (csp-rule asset type works)
import { defineRoutes } from './routes';

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

  public setup(
    core: CoreSetup<CspServerPluginSetup>,
    plugins: CspServerPluginSetupDeps
  ): CspServerPluginSetup {
    this.logger.debug('csp: Setup');
    core.savedObjects.registerType(ruleAssetType);

    const router = core.http.createRouter();

    defineRoutes(router);

    return {};
  }

  public start(core: CoreStart, plugins: CspServerPluginStartDeps): CspServerPluginStart {
    this.logger.debug('csp: Started');
    createFindingsIndexTemplate(core.elasticsearch.client.asInternalUser).catch(this.logger.error);
    return {};
  }
  public stop() {}
}
