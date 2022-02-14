/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { IRouter } from '../../../../../src/core/server';
import { defineGetStatsRoute } from './stats/stats';
import { defineGetBenchmarksRoute } from './benchmarks/benchmarks';
import { defineFindingsIndexRoute as defineGetFindingsIndexRoute } from './findings/findings';
import { defineSaveDataYamlRoute } from './configuration/save_data_yaml';
import { CspAppContext } from '../plugin';

export function defineRoutes(router: IRouter, cspContext: CspAppContext) {
  defineGetStatsRoute(router, cspContext);
  defineGetFindingsIndexRoute(router, cspContext);
  defineGetBenchmarksRoute(router, cspContext);
  defineSaveDataYamlRoute(router, cspContext);
}
