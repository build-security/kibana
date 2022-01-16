/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

<<<<<<< HEAD
import React, { useState, useMemo, useEffect } from 'react';
=======
import React, { useState, useEffect } from 'react';
>>>>>>> 95855fa7343125d097f00abedc1b9b6ed4cf1164
import { css } from '@emotion/react';
import { EuiSpacer } from '@elastic/eui';
import type { SearchResponse } from '@elastic/elasticsearch/lib/api/types';
import type { UseMutationResult } from 'react-query';
import type { Filter, Query } from '@kbn/es-query';
<<<<<<< HEAD
import type { RisonObject } from 'rison-node';
import { useHistory, useLocation } from 'react-router-dom';
=======
>>>>>>> 95855fa7343125d097f00abedc1b9b6ed4cf1164
import { FindingsTable } from './findings_table';
import { FindingsRuleFlyout } from './findings_flyout';
import { FindingsSearchBar } from './findings_search_bar';
import * as TEST_SUBJECTS from './test_subjects';
import { useKibana } from '../../../../../../src/plugins/kibana_react/public';
<<<<<<< HEAD
import { extractErrorMessage, useEsClientMutation, isNonNullable } from './utils';
=======
import {
  extractErrorMessage,
  useSourceQueryParam,
  useEsClientMutation,
  isNonNullable,
} from './utils';
>>>>>>> 95855fa7343125d097f00abedc1b9b6ed4cf1164
import type { CspFinding, FindingsFetchState } from './types';
import type {
  DataView,
  IKibanaSearchResponse,
  TimeRange,
} from '../../../../../../src/plugins/data/common';
import { SEARCH_FAILED } from './translations';
<<<<<<< HEAD
import { encodeQuery, decodeQuery } from '../../common/navigation/query_utils';
=======
>>>>>>> 95855fa7343125d097f00abedc1b9b6ed4cf1164

type FindingsEsSearchMutation = UseMutationResult<
  IKibanaSearchResponse<SearchResponse<CspFinding>>,
  unknown,
  void
>;

<<<<<<< HEAD
export interface FindingsUrlQuery extends RisonObject {
  dateRange: TimeRange;
  query: Query;
  filters: Filter[];
}

const getError = (e: unknown) => (e instanceof Error ? e : new Error());

const getDefaultQuery = (): FindingsUrlQuery => ({
=======
export interface URLState {
  dateRange: TimeRange;
  query?: Query;
  filters: Filter[];
}

const getDefaultQuery = (): Required<URLState> => ({
>>>>>>> 95855fa7343125d097f00abedc1b9b6ed4cf1164
  query: { language: 'kuery', query: '' },
  filters: [],
  dateRange: {
    from: 'now-15m',
    to: 'now',
  },
});

// TODO(TS 4.6): destructure {status, error, data} to make this more concise without losing types
// see with https://github.com/microsoft/TypeScript/pull/46266
export const getFetchState = <T extends FindingsEsSearchMutation>(v: T): FindingsFetchState => {
  switch (v.status) {
    case 'error':
      return { ...v, error: extractErrorMessage(v.error) };
    case 'success':
      return {
        ...v,
        data: v.data?.rawResponse?.hits?.hits?.map((h) => h._source).filter(isNonNullable),
      };
    default:
      return v;
  }
};

/**
 * This component syncs the FindingsTable with FindingsSearchBar
 */
export const FindingsTableContainer = ({ dataView }: { dataView: DataView }) => {
  const { notifications } = useKibana().services;
  const [selectedFinding, setSelectedFinding] = useState<CspFinding | undefined>();
<<<<<<< HEAD
  const history = useHistory();
  const loc = useLocation();
  const urlQuery = useMemo(() => decodeQuery<FindingsUrlQuery>(loc.search), [loc.search]);
  const query = useMemo(() => ({ ...getDefaultQuery(), ...urlQuery }), [urlQuery]);
  const mutation = useEsClientMutation<CspFinding>({
    ...query,
=======
  const { source: searchState, setSource: setSearchSource } = useSourceQueryParam(getDefaultQuery);
  const mutation = useEsClientMutation<CspFinding>({
    ...searchState,
>>>>>>> 95855fa7343125d097f00abedc1b9b6ed4cf1164
    dataView,
  });
  const fetchState = getFetchState(mutation);

  // This sends a new search request to ES
<<<<<<< HEAD
  // it's called whenever we have a new query from the URL
  useEffect(() => {
    mutation.mutate(undefined, {
      onError: (e) => {
        notifications?.toasts.addError(getError(e), {
=======
  // it's called whenever we have a new searchState from the URL
  useEffect(() => {
    mutation.mutate(undefined, {
      onError: (e) => {
        notifications?.toasts.addError(e instanceof Error ? e : new Error(), {
>>>>>>> 95855fa7343125d097f00abedc1b9b6ed4cf1164
          title: SEARCH_FAILED,
        });
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
<<<<<<< HEAD
  }, [query, mutation.mutate]);
=======
  }, [searchState, mutation.mutate]);
>>>>>>> 95855fa7343125d097f00abedc1b9b6ed4cf1164

  return (
    <div
      data-test-subj={TEST_SUBJECTS.FINDINGS_CONTAINER}
      css={css`
        width: 100%;
        height: 100%;
      `}
    >
      <FindingsSearchBar
<<<<<<< HEAD
        {...query}
        {...fetchState}
        dataView={dataView}
        setQuery={(nextQuery) =>
          history.push({
            search: encodeQuery(nextQuery),
          })
        }
=======
        {...searchState}
        {...fetchState}
        dataView={dataView}
        setSource={setSearchSource}
>>>>>>> 95855fa7343125d097f00abedc1b9b6ed4cf1164
      />
      <EuiSpacer />
      <FindingsTable {...fetchState} selectItem={setSelectedFinding} />
      {selectedFinding && (
        <FindingsRuleFlyout
          findings={selectedFinding}
          onClose={() => setSelectedFinding(undefined)}
        />
      )}
    </div>
  );
};
