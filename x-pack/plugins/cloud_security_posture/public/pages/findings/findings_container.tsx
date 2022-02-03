/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useState, useMemo } from 'react';
import { EuiSpacer } from '@elastic/eui';
import isEmpty from 'lodash/isEmpty';
import { FindingsTable } from './findings_table';
import { FindingsRuleFlyout } from './findings_flyout';
import { FindingsSearchBar } from './findings_search_bar';
import * as TEST_SUBJECTS from './test_subjects';
import type { CspFinding } from './types';
import type { DataView, EsQuerySortValue } from '../../../../../../src/plugins/data/common';
import { SortDirection } from '../../../../../../src/plugins/data/common';
import { INVALID_RESPONE } from './translations';
import { useUrlQuery } from '../../common/hooks/use_url_query';
import { isNonNullable, extractErrorMessage } from '../../../common/utils/helpers';
import {
  useFindings,
  type CspFindingsSearchSource,
  type CspFindingsSearchSourceResponse,
} from './use_findings';

// Findings table supports pagination and sorting, so all CspSearchSource fields are required
export type FindingsUrlQuery = Required<CspFindingsSearchSource>;

type FetchProps = 'status' | 'data' | 'error';
type FindingsResponse<T extends CspFindingsSearchSourceResponse['status']> = Pick<
  Extract<CspFindingsSearchSourceResponse, { status: T }>,
  FetchProps
>;

export type FindingsFetchState = Readonly<
  | FindingsResponse<'idle'>
  | FindingsResponse<'loading'>
  | (FindingsResponse<'error'> & { error: string; data: undefined })
  | (Omit<FindingsResponse<'success'>, 'data'> & {
      // TODO: add id to schema
      data: CspFinding[];
      total: number;
    })
>;

// TODO: define this as a schema with default values
// need to get Query and DateRange schema
export const getDefaultQuery = (): FindingsUrlQuery => ({
  query: { language: 'kuery', query: '' },
  filters: [],
  dateRange: {
    from: 'now-15m',
    to: 'now',
  },
  sort: [{ ['@timestamp']: SortDirection.desc }],
  from: 0,
  size: 10,
});

const createErrorState = (response: FindingsResponse<'error'>) => ({
  ...response,
  error: extractErrorMessage(response.error),
  data: undefined,
});

const createSuccessState = (response: FindingsResponse<'success'>) => ({
  ...response,
  total: (response.data?.rawResponse.hits.total || 0) as number,
  // TODO: we may want to specify fields and not include '_source' to reduce size
  data: response.data?.rawResponse.hits.hits.map((h) => h._source).filter(isNonNullable) || [],
});

// TODO(TS 4.6): destructure {status, error, data} to make this more concise without losing types
// see with https://github.com/microsoft/TypeScript/pull/46266
export const getFetchState = (response: CspFindingsSearchSourceResponse): FindingsFetchState => {
  switch (response.status) {
    case 'error':
      return createErrorState(response);
    case 'success':
      if (isEmpty(response.data))
        return createErrorState({
          ...response,
          status: 'error',
          error: INVALID_RESPONE,
        });

      return createSuccessState(response);
    default:
      return response;
  }
};

// TODO: this depends on our schema and needs to be consumed here somehow
// or just do without it?
const FIELDS_WITHOUT_KEYWORD_MAPPING = new Set(['@timestamp']);

// .keyword comes from the mapping we defined for the Findings index
const getSortKey = (key: string): string =>
  FIELDS_WITHOUT_KEYWORD_MAPPING.has(key) ? key : `${key}.keyword`;

/**
 * @description utility to transform a column header key to its field mapping for sorting
 * @example Adds '.keyword' to every property we sort on except values of `FIELDS_WITHOUT_KEYWORD_MAPPING`
 * @todo find alternative
 * @note we choose the keyword 'keyword' in the field mapping
 */
const mapEsQuerySortKey = (sort: readonly EsQuerySortValue[]): EsQuerySortValue[] =>
  sort.slice().reduce<EsQuerySortValue[]>((acc, cur) => {
    const entry = Object.entries(cur)[0];
    if (!entry) return acc;

    const [k, v] = entry;
    acc.push({ [getSortKey(k)]: v });

    return acc;
  }, []);

/**
 * This component syncs the FindingsTable with FindingsSearchBar
 */
export const FindingsTableContainer = ({ dataView }: { dataView: DataView }) => {
  const [selectedFinding, setSelectedFinding] = useState<CspFinding | undefined>();
  const { key: urlKey, urlQuery, setUrlQuery } = useUrlQuery(getDefaultQuery);
  const findingsQuery = useMemo(
    () => ({ ...urlQuery, sort: mapEsQuerySortKey(urlQuery.sort) }),
    [urlQuery]
  );

  const searchRequest = useFindings(dataView, findingsQuery, urlKey);

  const fetchState = useMemo(() => getFetchState(searchRequest), [searchRequest]);

  return (
    <div data-test-subj={TEST_SUBJECTS.FINDINGS_CONTAINER}>
      <FindingsSearchBar dataView={dataView} setQuery={setUrlQuery} {...urlQuery} {...fetchState} />
      <EuiSpacer />
      <FindingsTable
        setQuery={setUrlQuery}
        selectItem={setSelectedFinding}
        {...urlQuery}
        {...fetchState}
      />
      {selectedFinding && (
        <FindingsRuleFlyout
          findings={selectedFinding}
          onClose={() => setSelectedFinding(undefined)}
        />
      )}
    </div>
  );
};
