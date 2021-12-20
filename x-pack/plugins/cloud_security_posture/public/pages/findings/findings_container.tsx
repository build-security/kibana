/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useState, useEffect } from 'react';
// TODO: switch css to @emotion
// eslint-disable-next-line @kbn/eslint/module_migration
import styled from 'styled-components';
import { EuiSpacer } from '@elastic/eui';
import type { SearchResponse } from '@elastic/elasticsearch/lib/api/types';
import type { UseMutationResult } from 'react-query';
import type { Filter } from '@kbn/es-query';
import { FindingsTable } from './findings_table';
import { FindingsRuleFlyout } from './findings_flyout';
import { FindingsSearchBar } from './findings_search_bar';
import { FINDINGS_CONTAINER_TESTID } from './constants';
import {
  extractErrorMessage,
  useSourceQueryParam,
  useEsClientMutation,
  isNonNullable,
} from './utils';
import type { CSPFinding, FindingsFetchState } from './types';
import type { DataView, IKibanaSearchResponse } from '../../../../../../src/plugins/data/common';
import type { SearchBarProps } from '../../../../../../src/plugins/data/public';

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
// this would be more concise and won't leak props
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
  const [selectedFindingsItem, selectItem] = useState<CSPFinding | undefined>();
  const { source: searchState, setSource: setSearchSource } = useSourceQueryParam(getDefaultQuery);
  const mutation = useEsClientMutation<CSPFinding>({
    ...searchState,
    dataView,
  });
  const fetchState = getFetchState(mutation);

  // This sends a new search request to ES
  // it's called whenever we have a new searchState from the URL
  useEffect(() => {
    mutation.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchState, mutation.mutate]);

  return (
    <Wrapper data-test-subj={FINDINGS_CONTAINER_TESTID}>
      <FindingsSearchBar
        {...searchState}
        {...fetchState}
        dataView={dataView}
        setSource={setSearchSource}
      />
      <EuiSpacer />
      <FindingsTable {...fetchState} selectItem={selectItem} />
      {selectedFindingsItem && (
        <FindingsRuleFlyout findings={selectedFindingsItem} onClose={() => selectItem(undefined)} />
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
`;
