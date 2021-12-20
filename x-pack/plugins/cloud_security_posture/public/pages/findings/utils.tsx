/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import { useState, useEffect } from 'react';
import type { Filter, Query } from '@kbn/es-query';
import { useMutation, useQuery } from 'react-query';
import type { SearchResponse } from '@elastic/elasticsearch/lib/api/types';
import { encode, decode, RisonValue } from 'rison-node';
import { useHistory } from 'react-router-dom';
import type {
  DataView,
  IKibanaSearchResponse,
  TimeRange,
} from '../../../../../../src/plugins/data/common';
import type { CspPluginSetup } from '../../types';
import { CSP_KUBEBEAT_INDEX_PATTERN } from '../../../common/constants';
import { useKibana } from '../../../../../../src/plugins/kibana_react/public';
import type { MutationFetchState } from '../../common/types';

// TODO: find similar/existing function
export const extractErrorMessage = (e: unknown) =>
  typeof e === 'string' ? e : (e as Error)?.message || 'Unknown Error';

// TODO: find kibanas' equivalent fn
export const isNonNullable = <T extends unknown>(v: T): v is NonNullable<T> =>
  v !== null && v !== undefined;

/**
 *  Temp DataView Utility
 *  TODO: use perfected kibana data views
 */
export const useKubebeatDataView = () => {
  const {
    data: { dataViews },
    http,
  } = useKibana<CspPluginSetup>().services; // TODO: is this the right generic?

  const createDataView = () =>
    http!.post('/api/index_patterns/index_pattern', {
      body: JSON.stringify({
        override: true,
        index_pattern: {
          title: CSP_KUBEBEAT_INDEX_PATTERN,
          allowNoIndex: true,
        },
      }),
    });

  const getDataView = (r: unknown) =>
    // TODO: find index_pattern type
    dataViews.get((r as { index_pattern: { id: string } }).index_pattern.id);

  return useQuery(['kubebeat_dataview'], () => createDataView().then(getDataView));
};

/**
 * Temp URL state utility
 * TODO: use x-pack/plugins/security_solution/public/common/components/url_state/index.tsx ?
 */
export const useSourceQueryParam = <T extends object>(getDefaultQuery: () => T) => {
  const history = useHistory();
  const [state, set] = useState<T>(getDefaultQuery());

  const setSource = (v: RisonValue) => {
    try {
      const next = `source=${encode(v)}`;
      const current = history.location.search.slice(1);

      // React-Router won't trigger a new component render if the query is the same
      // so we trigger it manually
      // use case is re-fetching same query
      if (next === current) {
        set(() => ({ ...state }));
      } else {
        history.push({ search: next });
      }
    } catch (e) {
      // TODO: use real logger
      // eslint-disable-next-line no-console
      console.error('Unable to encode source');
    }
  };

  useEffect(() => {
    const params = new URLSearchParams(history.location.search);
    const source = params.get('source');
    if (!source) return;

    try {
      set(decode(source) as T);
    } catch (e) {
      set(getDefaultQuery());

      // TODO: use real logger
      // eslint-disable-next-line no-console
      console.error('Unable to decode URL');
    }
  }, [history.location.search, getDefaultQuery]);

  return {
    source: state,
    setSource,
  };
};

/**
 * Temp elastic search query hook
 * TODO: find known alternative
 */
export const useEsClientMutation = <T extends unknown>({
  dataView,
  dateRange,
  query,
  filters = [],
}: {
  dataView: DataView;
  query: Query;
  dateRange: TimeRange;
  filters: Filter[];
}) => {
  const { data: dataService } = useKibana<CspPluginSetup>().services;
  const { query: queryService, search: searchService } = dataService;
  return useMutation(async () => {
    queryService.queryString.setQuery(query);

    const timefilter = queryService.timefilter.timefilter.createFilter(dataView, dateRange);

    queryService.filterManager.setFilters([...filters, timefilter].filter(isNonNullable));

    const source = await searchService.searchSource.create({
      filter: queryService.filterManager.getFilters(),
      query: queryService.queryString.getQuery(),
      index: dataView.id,
      size: 1000,
    });

    const response = await source.fetch$().toPromise<IKibanaSearchResponse<SearchResponse<T>>>();

    return response;
  });
};
