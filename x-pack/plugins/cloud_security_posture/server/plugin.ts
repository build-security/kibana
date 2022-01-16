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
=======
import type { CspSetup, CspStart, CspPluginSetup, CspPluginStart } from './types';
import { defineRoutes } from './routes';

export class CspPlugin implements Plugin<CspSetup, CspStart, CspPluginSetup, CspPluginStart> {
>>>>>>> 95855fa7343125d097f00abedc1b9b6ed4cf1164
  private readonly logger: Logger;
  constructor(initializerContext: PluginInitializerContext) {
    this.logger = initializerContext.logger.get();
  }

<<<<<<< HEAD
  public setup(
    core: CoreSetup<CspServerPluginSetup>,
    plugins: CspServerPluginSetupDeps
  ): CspServerPluginSetup {
    this.logger.debug('csp: Setup');
    const router = core.http.createRouter();

=======
  public setup(core: CoreSetup<CspPluginStart>) {
    this.logger.debug('csp: Setup');
    const router = core.http.createRouter();
    // Register server side APIs
>>>>>>> 95855fa7343125d097f00abedc1b9b6ed4cf1164
    defineRoutes(router);

    return {};
  }

<<<<<<< HEAD
  public start(core: CoreStart, plugins: CspServerPluginStartDeps): CspServerPluginStart {
=======
  public start(core: CoreStart) {
>>>>>>> 95855fa7343125d097f00abedc1b9b6ed4cf1164
    this.logger.debug('csp: Started');
    createFindingsIndexTemplate(core.elasticsearch.client.asInternalUser).catch(this.logger.error);
    return {};
  }
  public stop() {}
}
