/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import React, { useEffect } from 'react';
import { useKibana } from '../../../../../../src/plugins/kibana_react/public';
import * as TEST_SUBJECTS from './test_subjects';
import type { FindingsFetchState } from './types';
import type { FindingsUrlQuery } from './findings_container';
import type { CspClientPluginStartDeps } from '../../types';
import { PLUGIN_NAME } from '../../../common';

type SearchBarProps = Pick<FindingsUrlQuery, 'query' | 'filters' | 'dateRange' | 'dataView'>;

interface BaseFindingsSearchBarProps extends SearchBarProps {
  setQuery(v: Omit<SearchBarProps, 'dataView'>): void;
}

type FindingsSearchBarProps = FindingsFetchState & BaseFindingsSearchBarProps;

export const FindingsSearchBar = ({
  dataView,
  dateRange,
  query,
  filters,
  status,
  setQuery,
}: FindingsSearchBarProps) => {
  const {
    data: {
      query: queryService,
      ui: { SearchBar },
    },
  } = useKibana<CspClientPluginStartDeps>().services;

  useEffect(() => {
    const subscription = queryService.filterManager.getUpdates$().subscribe(() =>
      // TODO: add a condition to check if component is mounted
      setQuery({
        filters: queryService.filterManager.getFilters(),
        query,
        dateRange,
      })
    );

    return () => subscription.unsubscribe();
  }, [dateRange, query, queryService.filterManager, setQuery]);

  return (
    <SearchBar
      appName={PLUGIN_NAME}
      dataTestSubj={TEST_SUBJECTS.FINDINGS_SEARCH_BAR}
      showFilterBar={true}
      showDatePicker={true}
      showQueryBar={true}
      showQueryInput={true}
      showSaveQuery={false}
      isLoading={status === 'loading'}
      indexPatterns={[dataView]}
      dateRangeFrom={dateRange?.from}
      dateRangeTo={dateRange?.to}
      query={query}
      filters={filters}
      onRefresh={(v) =>
        setQuery({
          query,
          filters,
          ...v,
        })
      }
      onQuerySubmit={(v) =>
        setQuery({
          query,
          filters,
          ...v,
        })
      }
    />
  );
};
