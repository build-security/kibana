/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import type { PluginInitializerContext } from '../../../../src/core/server';
import { CspPlugin } from './plugin';
<<<<<<< HEAD
<<<<<<< HEAD

export { CspServerPluginSetup, CspServerPluginStart } from './types';
=======
export { CspPluginSetup, CspPluginStart } from './types';
>>>>>>> 95855fa7343... finishing
=======
export { CspPluginSetup, CspPluginStart } from './types';
>>>>>>> 95855fa7343125d097f00abedc1b9b6ed4cf1164

export const plugin = (initializerContext: PluginInitializerContext) =>
  new CspPlugin(initializerContext);
