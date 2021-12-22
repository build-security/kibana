/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { defineGetStatsRoute } from './stats/stats';
import { defineFindingsIndexRoute } from './findings/findings';
import type { IRouter } from '../../../../../src/core/server';

export function defineRoutes(router: IRouter) {
  defineGetStatsRoute(router);
  defineFindingsIndexRoute(router);
}
