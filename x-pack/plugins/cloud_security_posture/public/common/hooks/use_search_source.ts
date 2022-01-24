/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import type { Filter } from '@kbn/es-query';
import { useMutation, UseMutationResult } from 'react-query';
import type { SearchResponse } from '@elastic/elasticsearch/lib/api/types';
import type {
  DataView,
  IKibanaSearchResponse,
  SerializedSearchSourceFields,
  TimeRange,
} from '../../../../../../src/plugins/data/common';
import type { CspClientPluginStartDeps } from '../../types';
import { useKibana } from '../../../../../../src/plugins/kibana_react/public';
import { isNonNullable } from '../utils/is_non_nullable';

export type CspSearchSource = Pick<
  SerializedSearchSourceFields,
  'sort' | 'size' | 'from' | 'query'
> & {
  dataView: DataView;
  filters: Filter[];
  dateRange: TimeRange;
};

/**
 * @description a react-query#mutation wrapper on the data plugin searchSource
 * @todo use 'searchAfter'. currently limited to 10k docs. see https://github.com/elastic/kibana/issues/116776
 */
export const useSearchSource = <TData = unknown>({
  dataView,
  dateRange,
  query,
  filters = [],
  from,
  size,
  sort,
}: CspSearchSource): CspSearchSourceResponse<TData> => {
  const { data: dataService } = useKibana<CspClientPluginStartDeps>().services;
  const { query: queryService, search: searchService } = dataService;
  return useMutation(async () => {
    if (query) queryService.queryString.setQuery(query);

    const timefilter = queryService.timefilter.timefilter.createFilter(dataView, dateRange);

    queryService.filterManager.setFilters([...filters, timefilter].filter(isNonNullable));

    const source = await searchService.searchSource.create({
      filter: queryService.filterManager.getFilters(),
      query: queryService.queryString.getQuery(),
      index: dataView.id,
      size,
      from,
      sort,
    });

    const response = await source
      .fetch$()
      .toPromise<IKibanaSearchResponse<SearchResponse<TData>>>();
    return response;
  });
};

export type CspSearchSourceResponse<TData = unknown> = UseMutationResult<
  IKibanaSearchResponse<SearchResponse<TData>>
>;
