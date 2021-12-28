/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useState, useEffect } from 'react';
import { css } from '@emotion/react';
import { EuiSpacer } from '@elastic/eui';
import type { SearchResponse } from '@elastic/elasticsearch/lib/api/types';
import type { UseMutationResult } from 'react-query';
import type { Filter } from '@kbn/es-query';
import { FindingsTable } from './findings_table';
import { FindingsRuleFlyout } from './findings_flyout';
import { FindingsSearchBar } from './findings_search_bar';
import { TEST_SUBJECTS } from './constants';
import {
  extractErrorMessage,
  useSourceQueryParam,
  useEsClientMutation,
  isNonNullable,
} from './utils';
import type { CSPFinding, FindingsFetchState } from './types';
import type { DataView, IKibanaSearchResponse } from '../../../../../../src/plugins/data/common';
import type { SearchBarProps } from '../../../../../../src/plugins/data/public';
import { useKibana } from '../../../../../../src/plugins/kibana_react/public';

type FindingsEsSearchMutation = UseMutationResult<
  IKibanaSearchResponse<SearchResponse<CSPFinding>>,
  unknown,
  void
>;

export type URLState = Parameters<NonNullable<SearchBarProps['onQuerySubmit']>>[0] & {
  filters: Filter[];
};

const getDefaultQuery = (): Required<URLState> => ({
  query: { language: 'kuery', query: '' },
  filters: [],
  dateRange: {
    from: 'now-15m',
    to: 'now',
  },
});

// with https://github.com/microsoft/TypeScript/pull/46266
// destructuring would make this more concise and won't leak props
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
  const [selectedFinding, setSelectedFinding] = useState<CSPFinding | undefined>();
  const { source: searchState, setSource: setSearchSource } = useSourceQueryParam(getDefaultQuery);
  const mutation = useEsClientMutation<CSPFinding>({
    ...searchState,
    dataView,
  });
  const fetchState = getFetchState(mutation);

  // This sends a new search request to ES
  // it's called whenever we have a new searchState from the URL
  useEffect(() => {
    mutation.mutate(undefined, {
      onError: (e) => {
        notifications?.toasts.addError(e instanceof Error ? e : new Error(), {
          title: 'Search failed',
        });
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchState, mutation.mutate]);

  return (
    <div
      data-test-subj={TEST_SUBJECTS.FINDINGS_CONTAINER}
      css={css`
        width: 100%;
        height: 100%;
      `}
    >
      <FindingsSearchBar
        {...searchState}
        {...fetchState}
        dataView={dataView}
        setSource={setSearchSource}
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
