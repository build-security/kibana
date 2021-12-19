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
} from 'kibana/server';

import type { CspSetup, CspStart, CspPluginSetup, CspPluginStart } from './types';
import { defineRoutes } from './routes';
import { cspRule } from './saved_objects';

export class CspPlugin implements Plugin<CspSetup, CspStart, CspPluginSetup, CspPluginStart> {
  private readonly logger: Logger;

  constructor(initializerContext: PluginInitializerContext) {
    this.logger = initializerContext.logger.get();
  }

  public setup(core: CoreSetup<CspPluginStart>) {
    this.logger.debug('csp: Setup');

    // Register csp rule saved object
    core.savedObjects.registerType(cspRule);

    // Register server side APIs
    const router = core.http.createRouter();
    defineRoutes(router);

    return {};
  }

  public start(core: CoreStart) {
    this.logger.debug('csp: Started');
    return {};
  }

  public stop() {}
}
