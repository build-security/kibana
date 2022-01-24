/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useState, useEffect } from 'react';
import { EuiSpacer } from '@elastic/eui';
import { isEmpty } from 'lodash';
import { FindingsTable } from './findings_table';
import { FindingsRuleFlyout } from './findings_flyout';
import { FindingsSearchBar } from './findings_search_bar';
import * as TEST_SUBJECTS from './test_subjects';
import { useKibana } from '../../../../../../src/plugins/kibana_react/public';
import { extractErrorMessage } from './utils';
import type { CspFinding, FindingsFetchState } from './types';
import type { DataView } from '../../../../../../src/plugins/data/common';
import { SortDirection } from '../../../../../../src/plugins/data/common';
import { INVALID_RESPONE, SEARCH_FAILED } from './translations';
import { useUrlQuery } from '../../common/navigation/query_utils';
import {
  useSearchSource,
  type CspSearchSource,
  type CspSearchSourceResponse,
} from '../../common/hooks/use_search_source';
import { isNonNullable } from '../../common/utils/is_non_nullable';

// Findings table supports pagination and sorting, so all CspSearchSource fields are required
export type FindingsUrlQuery = Required<CspSearchSource>;

const getDefaultQuery = (): Omit<FindingsUrlQuery, 'dataView'> => ({
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

// TODO: move
const getError = (e: unknown) => (e instanceof Error ? e : new Error());

// TODO(TS 4.6): destructure {status, error, data} to make this more concise without losing types
// see with https://github.com/microsoft/TypeScript/pull/46266
export const getFetchState = (v: CspSearchSourceResponse<CspFinding>): FindingsFetchState => {
  switch (v.status) {
    case 'error':
      return { ...v, error: extractErrorMessage(v.error) };
    case 'success':
      if (isEmpty(v.data)) return { status: 'error', error: INVALID_RESPONE, data: undefined };

      return {
        ...v,
        total: v.data.rawResponse.hits.total as number,
        // TODO: we may want to specify fields and not include '_source' to reduce size
        data: v.data.rawResponse.hits.hits.map((h) => h._source).filter(isNonNullable),
      };
    default:
      return v;
  }
};

/**
 * This component syncs the <FindingsTable/> with <FindingsSearchBar/>
 */
export const FindingsTableContainer = ({ dataView }: { dataView: DataView }) => {
  const { notifications } = useKibana().services;
  const [selectedFinding, setSelectedFinding] = useState<CspFinding | undefined>();
  const { urlQuery, setUrlQuery } = useUrlQuery(getDefaultQuery);
  const searchRequest = useSearchSource<CspFinding>({
    dataView,
    ...urlQuery,
  });

  const fetchState = getFetchState(searchRequest);
  const { mutate: runSearch } = searchRequest;

  // This sends a new search request to ES
  // it's called whenever we have a new query from the URL
  useEffect(() => {
    runSearch(undefined, {
      onError: (e) => {
        notifications?.toasts.addError(getError(e), {
          title: SEARCH_FAILED,
        });
      },
    });
  }, [urlQuery, runSearch, notifications?.toasts]);

  return (
    <div data-test-subj={TEST_SUBJECTS.FINDINGS_CONTAINER}>
      <FindingsSearchBar dataView={dataView} setQuery={setUrlQuery} {...urlQuery} {...fetchState} />
      <EuiSpacer />
      <FindingsTable
        dataView={dataView}
        setQuery={setUrlQuery}
        selectItem={setSelectedFinding}
        totalItemCount={fetchState.status === 'success' ? fetchState.total : 0}
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
