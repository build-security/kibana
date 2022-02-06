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
import type {
  CspServerPluginSetup,
  CspServerPluginStart,
  CspServerPluginSetupDeps,
  CspServerPluginStartDeps,
} from './types';
import { defineRoutes } from './routes';
import { initUiSettings } from './uiSettings';
import {
  cspRuleAssetType,
  cspConfigurationAssetType,
} from './saved_objects/benchmark_rules/csp_rule_type';
import { initializeCspRules } from './saved_objects/benchmark_rules/initialize_rules';

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
    core: CoreSetup<CspServerPluginStartDeps, CspServerPluginStart>,
    plugins: CspServerPluginSetupDeps
  ): CspServerPluginSetup {
    this.logger.debug('csp: Setup');

    core.savedObjects.registerType(cspRuleAssetType);
    core.savedObjects.registerType(cspConfigurationAssetType);

    const router = core.http.createRouter();

    // Register server side APIs
    defineRoutes(router, this.logger);
    initUiSettings(core.uiSettings);

    return {};
  }

  public start(core: CoreStart, plugins: CspServerPluginStartDeps): CspServerPluginStart {
    this.logger.debug('csp: Started');
    createFindingsIndexTemplate(core.elasticsearch.client.asInternalUser, this.logger).catch(
      this.logger.error
    );

    initializeCspRules(core.savedObjects.createInternalRepository());

    return {};
  }
  public stop() {}
}
