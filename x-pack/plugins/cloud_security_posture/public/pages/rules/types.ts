/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

export type FetchState<T> =
  | { loading: false; error: false; data: undefined } // idle
  | { loading: false; error: false; data: T } // data
  | { loading: false; error: string; data: undefined } // error
  | { loading: true; error: false; data: undefined }; // loading

export interface Benchmark {
  name: string;
  version: string;
}
