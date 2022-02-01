/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import type { UseQueryResult } from 'react-query/types/react/types';

interface CreateReactQueryResponseInput {
  status?: UseQueryResult['status'];
  data?: any;
  error?: Error;
}

export const createReactQueryResponse = ({
  status = 'loading',
  error = new Error(),
  data = undefined,
}: CreateReactQueryResponseInput = {}): UseQueryResult => {
  if (status === 'success') {
    return { status, data } as UseQueryResult;
  }

  if (status === 'error') {
    return { status, error } as UseQueryResult;
  }

  return { status } as UseQueryResult;
};
