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
import { CspAppService } from './lib/csp_app_services';
import type {
  CspServerPluginSetup,
  CspServerPluginStart,
  CspServerPluginSetupDeps,
  CspServerPluginStartDeps,
} from './types';
import { defineRoutes } from './routes';
import { initUiSettings } from './ui_settings';
import { cspRuleAssetType } from './saved_objects/cis_1_4_1/csp_rule_type';
import { initializeCspRules } from './saved_objects/cis_1_4_1/initialize_rules';
import { initializeCspLatestFindingsIndex } from './create_latest_index';

export interface CspAppContext {
  logger: Logger;
  service: CspAppService;
}

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
  private readonly CspAppService = new CspAppService();

  public setup(
    core: CoreSetup<CspServerPluginStartDeps, CspServerPluginStart>,
    plugins: CspServerPluginSetupDeps
  ): CspServerPluginSetup {
    this.logger.debug('csp: Setup');

    const cspAppContext: CspAppContext = {
      logger: this.logger,
      service: this.CspAppService,
    };

    core.savedObjects.registerType(cspRuleAssetType);

    const router = core.http.createRouter();

    // Register server side APIs
    defineRoutes(router, cspAppContext);

    initUiSettings(core.uiSettings);

    return {};
  }

  public async start(
    core: CoreStart,
    plugins: CspServerPluginStartDeps
  ): Promise<CspServerPluginStart> {
    this.logger.debug('csp: Started');
    this.CspAppService.start({
      ...plugins.fleet,
    });
    initializeCspRules(core.savedObjects.createInternalRepository());
    initializeCspLatestFindingsIndex(core.elasticsearch.client.asInternalUser, this.logger);

    const indexExists = await core.elasticsearch.client.asInternalUser.indices.exists({
      index: 'csp-latest-findings',
    });
    if (!indexExists) {
      core.elasticsearch.client.asInternalUser.index({
        id: 'csp-latest-findings',
        index: '.csp-findings-latest',
        op_type: 'create',
        body: {},
      });
    }

    return {};
  }
  public stop() {}
}
