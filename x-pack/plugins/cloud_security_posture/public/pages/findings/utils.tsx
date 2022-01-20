/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import type { Filter, Query } from '@kbn/es-query';
import { useMutation, useQuery } from 'react-query';
import type { SearchResponse } from '@elastic/elasticsearch/lib/api/types';
import type {
  DataView,
  IKibanaSearchResponse,
  TimeRange,
} from '../../../../../../src/plugins/data/common';
import type { CspClientPluginStartDeps } from '../../types';
import { CSP_FINDINGS_INDEX_PATTERN } from '../../../common/constants';
import { useKibana } from '../../../../../../src/plugins/kibana_react/public';

export const extractErrorMessage = (e: unknown): string =>
  typeof e === 'string' ? e : (e as Error)?.message || 'Unknown Error';

export const isNonNullable = <T extends unknown>(v: T): v is NonNullable<T> =>
  v !== null && v !== undefined;

/**
 *  registers a kibana data view for kubebeat* index and fetches it
 *  TODO: use perfected kibana data views
 */

export const useKubebeatDataView = () => {
  const {
    data: { dataViews },
  } = useKibana<CspClientPluginStartDeps>().services;

  // TODO: check if index exists
  // if not, no point in creating a data view
  // const check = () => http?.get(`/kubebeat`);

  // TODO: use `dataViews.get(ID)`
  const findDataView = async () => (await dataViews.find(CSP_FINDINGS_INDEX_PATTERN))?.[0];

  return useQuery(['kubebeat_dataview'], findDataView);
};

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
  const { data: dataService } = useKibana<CspClientPluginStartDeps>().services;
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
