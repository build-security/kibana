/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import * as TEXT from './translations';
import type { CspNavigationItem } from './types';
import { INTERNAL_FEATURE_FLAGS } from '../../../common/constants';

// This makes sure our routes are constrained by CspNavigationItem
// By doing this we get to do a type-check on `v` but keep the readonly properties
const createRoutes = <T extends readonly CspNavigationItem[]>(routes: T) =>
  Object.fromEntries(routes.map((v) => [v.id, v])) as {
    [Page in T[number] as Page['id']]: CspNavigationItem;
  };

// This is the source-of-truth of the routes. links/types are derived
export const getAllNavigationItems = () =>
  createRoutes([
    { name: TEXT.DASHBOARD, path: '/dashboard', id: 'dashboard' },
    { name: TEXT.FINDINGS, path: '/findings', id: 'findings' },
    {
      name: TEXT.BENCHMARKS,
      path: '/benchmarks',
      id: 'benchmarks',
      disabled: !INTERNAL_FEATURE_FLAGS.benchmarks,
    },
  ] as const);
