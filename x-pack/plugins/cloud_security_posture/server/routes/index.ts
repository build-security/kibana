/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { IRouter } from 'kibana/server';
import { defineGetScoreRoute } from './stats/stats';
import { findRulesRoute } from './rules/find_rules_route';
import { loadRulesRoute } from './rules/load_rules_route';

export function defineRoutes(router: IRouter) {
  defineGetScoreRoute(router);
  findRulesRoute(router);
  loadRulesRoute(router);
}
