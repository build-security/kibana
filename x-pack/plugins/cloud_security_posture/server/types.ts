/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

<<<<<<< HEAD
import type {
  PluginSetup as DataPluginSetup,
  PluginStart as DataPluginStart,
} from '../../../../src/plugins/data/server';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CspServerPluginSetup {}
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface CspServerPluginStart {}

export interface CspServerPluginSetupDeps {
  // required
  data: DataPluginSetup;

  // optional
}

export interface CspServerPluginStartDeps {
  // required
  data: DataPluginStart;

  // optional
}
=======
/* eslint-disable @typescript-eslint/no-empty-interface */

export interface CspSetup {}
export interface CspStart {}
export interface CspPluginSetup {}
export interface CspPluginStart {}
/* eslint-enable @typescript-eslint/no-empty-interface */
>>>>>>> 95855fa7343125d097f00abedc1b9b6ed4cf1164
