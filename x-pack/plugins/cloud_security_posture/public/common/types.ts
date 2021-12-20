/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { UseMutationResult } from 'react-query';
import type { DistributivePick } from '../../common/types';

export type MutationFetchState<
  TData = unknown,
  TError = unknown,
  TVariables = unknown,
  TContext = unknown
> = DistributivePick<
  UseMutationResult<TData, TError, TVariables, TContext>,
  'data' | 'error' | 'status'
>;
