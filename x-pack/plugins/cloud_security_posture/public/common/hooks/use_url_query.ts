/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import { useEffect, useCallback, useMemo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { decodeQuery, encodeQuery } from '../navigation/query_utils';

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
        search: encodeQuery({ ...getDefaultQuery(), ...urlQuery, ...query }),
      }),
    [getDefaultQuery, urlQuery, push]
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
