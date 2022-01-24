/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import { useEffect, useCallback, useMemo } from 'react';
import { encode, decode, type RisonObject } from 'rison-node';
import type { LocationDescriptorObject } from 'history';
import { useHistory, useLocation } from 'react-router-dom';

const encodeRison = (v: RisonObject): string | undefined => {
  try {
    return encode(v);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }
};

// TODO: rison throws on EMPTY_QUERY,
// maybe dont use that
const decodeRison = <T extends unknown>(query: string): T | undefined => {
  try {
    return decode(query) as T;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(e);
  }
};

const QUERY_PARAM_KEY = 'query';
const EMPTY_QUERY = '';

export const encodeQuery = (query: RisonObject): LocationDescriptorObject['search'] =>
  `${QUERY_PARAM_KEY}=${encodeRison(query) || EMPTY_QUERY}`;

export const decodeQuery = <T extends unknown>(search?: string): Partial<T> | undefined =>
  decodeRison<T>(new URLSearchParams(search).get(QUERY_PARAM_KEY) || EMPTY_QUERY);

/**
 * @description uses 'rison' to encode/decode a url query
 */
export const useUrlQuery = <T extends object>(getDefaultQuery: () => T) => {
  const { push } = useHistory();
  const loc = useLocation();

  const urlQuery = useMemo(
    () => ({ ...getDefaultQuery(), ...decodeQuery<T>(loc.search) }),
    [getDefaultQuery, loc.search]
  );

  const setUrlQuery = useCallback(
    (query: Partial<ReturnType<typeof getDefaultQuery>>) =>
      push({
        search: encodeQuery({ ...getDefaultQuery(), ...query }),
      }),
    [getDefaultQuery, push]
  );

  useEffect(() => {
    if (loc.search) return;
    setUrlQuery(getDefaultQuery());
  }, [getDefaultQuery, loc.search, setUrlQuery]);

  return {
    urlQuery,
    setUrlQuery,
  };
};
