/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import type { Filter } from '@kbn/es-query';
import { type UseQueryResult, useQuery } from 'react-query';
import type { AggregationsAggregate, SearchResponse } from '@elastic/elasticsearch/lib/api/types';
import { number } from 'io-ts';
import { extractErrorMessage, isNonNullable } from '../../../common/utils/helpers';
import type {
  DataView,
  IKibanaSearchResponse,
  SerializedSearchSourceFields,
  TimeRange,
} from '../../../../../../src/plugins/data/common';
import type { CspClientPluginStartDeps } from '../../types';
import { useKibana } from '../../../../../../src/plugins/kibana_react/public';
import * as TEXT from './translations';
import type { CoreStart } from '../../../../../../src/core/public';
import type { CspFinding } from './types';

interface CspFindings {
  data: CspFinding[];
  total: number;
}

export interface CspFindingsRequest
  extends Required<Pick<SerializedSearchSourceFields, 'sort' | 'size' | 'from' | 'query'>> {
  filters: Filter[];
  dateRange: TimeRange;
}

type ResponseProps = 'data' | 'error' | 'status';
type Result = UseQueryResult<CspFindings, unknown>;

// TODO: use distributive Pick
export type CspFindingsResponse =
  | Pick<Extract<Result, { status: 'success' }>, ResponseProps>
  | Pick<Extract<Result, { status: 'error' }>, ResponseProps>
  | Pick<Extract<Result, { status: 'idle' }>, ResponseProps>
  | Pick<Extract<Result, { status: 'loading' }>, ResponseProps>;

const showResponseErrorToast =
  ({ toasts: { addDanger } }: CoreStart['notifications']) =>
  (error: unknown): void => {
    addDanger(extractErrorMessage(error, TEXT.SEARCH_FAILED));
  };

const extractFindings = ({
  rawResponse: { hits },
}: IKibanaSearchResponse<
  SearchResponse<CspFinding, Record<string, AggregationsAggregate>>
>): CspFindings => ({
  // TODO: use 'fields' instead of '_source' ?
  data: hits.hits.map((hit) => hit._source!),
  total: number.is(hits.total) ? hits.total : 0,
});

const createFindingsSearchSource = (
  {
    query,
    dateRange,
    dataView,
    filters,
    ...rest
  }: Omit<CspFindingsRequest, 'queryKey'> & {
    dataView: DataView;
  },
  queryService: CspClientPluginStartDeps['data']['query']
): SerializedSearchSourceFields => {
  if (query) queryService.queryString.setQuery(query);
  const timeFilter = queryService.timefilter.timefilter.createFilter(dataView, dateRange);
  queryService.filterManager.setFilters([...filters, timeFilter].filter(isNonNullable));

  return {
    filter: queryService.filterManager.getFilters(),
    query: queryService.queryString.getQuery(),
    index: dataView.id, // TODO: constant
    ...rest,
  };
};

/**
 * @description a react-query#mutation wrapper on the data plugin searchSource
 * @todo use 'searchAfter'. currently limited to 10k docs. see https://github.com/elastic/kibana/issues/116776
 */
export const useFindings = (
  dataView: DataView,
  searchProps: CspFindingsRequest,
  urlKey?: string // Needed when URL query (searchProps) didn't change (now-15) but require a refetch
): CspFindingsResponse => {
  const { notifications, data: dataService } = useKibana<CspClientPluginStartDeps>().services;
  const { query: queryService, search: searchService } = dataService;

  return useQuery(
    ['csp_findings', { searchProps, urlKey }],
    async () => {
      const source = await searchService.searchSource.create(
        createFindingsSearchSource({ ...searchProps, dataView }, queryService)
      );

      const response = await source.fetch$().toPromise();

      return response;
    },
    {
      cacheTime: 0,
      onError: showResponseErrorToast(notifications!),
      select: extractFindings,
    }
  );
};
