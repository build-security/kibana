/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import * as t from 'io-ts';

/**
 * @example
 * declare const foo: Array<string | undefined | null>
 * foo.filter(isNonNullable) // foo is Array<string>
 */
export const isNonNullable = <T extends unknown>(v: T): v is NonNullable<T> =>
  v !== null && v !== undefined;

export const getErrorOrUnknown = (e: unknown) =>
  e instanceof Error ? e : new Error('Unknown Error');

export const extractErrorMessage = (e: unknown): string => {
  if (e instanceof Error) return e.message;
  if (t.record(t.literal('message'), t.string).is(e)) return e.message;

  return 'Unknown Error'; // TODO: i18n
};
