/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-console */

import React, { useEffect, useState, useCallback } from 'react';
import { EuiSpacer, EuiFlyout, EuiFlyoutHeader, EuiTitle, EuiFlyoutBody } from '@elastic/eui';
import { Filter, Query } from '@kbn/es-query';
import { decode, encode } from 'rison-node';
import { SearchResponse } from '@elastic/elasticsearch/lib/api/types';
import { useLocation, useHistory } from 'react-router-dom';
import {
  DataView,
  TimeRange,
  SearchSourceFields,
  IKibanaSearchResponse,
} from '../../../../../../../src/plugins/data/common';
import { SecuritySolutionPageWrapper } from '../../../common/components/page_wrapper';
import { HeaderPage } from '../../../common/components/header_page';
import { FindingsTable } from './findings_table';
import { SpyRoute } from '../../../common/utils/route/spy_routes';
import { CloudPosturePage } from '../../../app/types';
import { useKibana } from '../../../common/lib/kibana';
import { CSPFinding } from './types';
import { makeMapStateToProps } from '../../../common/components/url_state/helpers';
import { useDeepEqualSelector } from '../../../common/hooks/use_selector';
// import { SearchBar } from '../../../../../../../src/plugins/data/public';

const KUBEBEAT_INDEX = 'kubebeat';

export const Findings = () => (
  <SecuritySolutionPageWrapper noPadding={false} data-test-subj="csp_rules">
    <HeaderPage border title={'Findings'} />
    <FindingsTableContainer />
    <SpyRoute pageName={CloudPosturePage.findings} />
  </SecuritySolutionPageWrapper>
);

interface URLState {
  query: any;
  // dateRange: any;
}

// Temp URL state utility
const useSearchState = () => {
  const loc = useLocation();
  const [state, set] = useState<URLState>(DEFAULT_QUERY);

  useEffect(() => {
    const params = new URLSearchParams(loc.search);
    const query = params.get('query');

    try {
      console.log('READ NEXT STATE', query);
      set({
        query: query ? decode(query!) : DEFAULT_QUERY.query,
        // dateRange: dateRange && decode(dateRange!),
      });
    } catch (e) {
      console.log('Unable to decoded URL ');

      set({} as URLState);
    }
  }, [loc.search]);

  return state;
};

const DEFAULT_QUERY = {
  query: { language: 'kuery', query: '' },
};

const FindingsTableContainer = () => {
  const urlMapState = makeMapStateToProps();
  const { urlState } = useDeepEqualSelector(urlMapState);
  console.log({ urlState });
  const { data: dataService } = useKibana().services;
  const [filters] = useState<Filter[]>([]);
  const [kubebeatDataView, setKubebeatDataView] = useState<DataView>();
  const [findings, setFindings] = useState<CSPFinding[]>();
  const [isLoading, setLoading] = useState<boolean>();
  const [isError, setError] = useState<any>();

  const searchState = useSearchState();
  const history = useHistory();
  const {
    ui: { SearchBar },
    dataViews,
    query,
    search,
  } = dataService;

  useEffect(() => {
    if (!dataViews) return;
    (async () => setKubebeatDataView((await dataViews.find(KUBEBEAT_INDEX))?.[0]))();
  }, [dataViews]);

  const runSearch = useCallback(async () => {
    if (!kubebeatDataView) return;

    setError(false);
    setLoading(true);

    query.queryString.setQuery(searchState.query || DEFAULT_QUERY.query);

    console.log({ a: searchState.query, b: query.queryString.getQuery() });
    // const nextFilters = filters.slice();

    // const timefilter =
    //   nextQuery?.dateRange &&
    //   query.timefilter.timefilter.createFilter(kubebeatDataView, nextQuery.dateRange);
    // if (timefilter) {
    //   nextFilters.push(timefilter);
    // }

    // query.filterManager.setFilters(nextFilters);

    try {
      const findingsSearch = await search.searchSource.create({
        // filter: query.filterManager.getFilters(),
        query: query.queryString.getQuery(),
        index: kubebeatDataView,
        size: 1000,
      });

      const findingsResponse: IKibanaSearchResponse<SearchResponse<CSPFinding>> =
        await findingsSearch.fetch$().toPromise();

      const findingsResult = findingsResponse.rawResponse.hits.hits.map((v) => ({
        ...v,
        ...v._source!,
      }));

      console.log({ findingsResult, h: findingsResponse.rawResponse.hits.hits });
      setFindings(findingsResult);
    } catch (e) {
      if (!!e && e instanceof Error) setError(e.message);
      console.log('[CSP} failed to get data');
    }

    setLoading(false);
  }, [kubebeatDataView, query.queryString, search.searchSource, searchState.query]);

  useEffect(() => {
    console.log('RUN NEXT STATE', searchState.query);
    runSearch();
  }, [runSearch, searchState.query]);

  useEffect(() => {
    console.log('MOUNTED');
  }, []);

  if (!kubebeatDataView || !findings) return null;

  console.log({ searchState });
  return (
    <div style={{ height: '100%', width: '100%' }}>
      <SearchBar
        isLoading={isLoading}
        appName="foo"
        // dateRangeFrom={searchState?.timerange?.timeline?.timerange?.fromStr}
        // dateRangeTo={searchState?.timerange?.timeline?.timerange?.toStr}
        indexPatterns={[kubebeatDataView]}
        // onFiltersUpdated={setFilters}
        query={searchState.query}
        onQuerySubmit={(v) => {
          const next = {
            search: new URLSearchParams([
              ['query', encode(v.query)],
              // ['dateRange', encode(v.dateRange)],
            ]).toString(),
          };
          console.log('PUSH NEXT STATE', { query: v, encoded: next });
          history.push(next);
        }}
        showFilterBar={false}
        showDatePicker={true}
        showQueryBar={true}
        showQueryInput={true}
        showSaveQuery={true}
      />
      <EuiSpacer />
      <FindingsTable data={findings} isLoading={!!isLoading} />
    </div>
  );
};
