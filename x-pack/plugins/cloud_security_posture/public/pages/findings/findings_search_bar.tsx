/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import React, { useEffect } from 'react';
import type { Query } from '@kbn/es-query';
import type { Filter } from '@kbn/es-query';
import { useKibana } from '../../../../../../src/plugins/kibana_react/public';
import * as TEST_SUBJECTS from './test_subjects';
import type { DataView, TimeRange } from '../../../../../../src/plugins/data/common';
import type { FindingsFetchState } from './types';
<<<<<<< HEAD
import type { FindingsUrlQuery } from './findings_container';
import type { CspClientPluginStartDeps } from '../../types';
=======
import type { CspPluginSetup } from '../../types';
import type { URLState } from './findings_container';
>>>>>>> 95855fa7343125d097f00abedc1b9b6ed4cf1164
import { PLUGIN_NAME } from '../../../common';

interface BaseFindingsSearchBarProps {
  dataView: DataView;
  dateRange: TimeRange;
  query: Query;
  filters: Filter[];
<<<<<<< HEAD
  setQuery(v: FindingsUrlQuery): void;
=======
  setSource(v: URLState): void;
>>>>>>> 95855fa7343125d097f00abedc1b9b6ed4cf1164
}

type FindingsSearchBarProps = FindingsFetchState & BaseFindingsSearchBarProps;

export const FindingsSearchBar = ({
  dataView,
  dateRange,
  query,
  filters,
  status,
<<<<<<< HEAD
  setQuery,
=======
  setSource,
>>>>>>> 95855fa7343125d097f00abedc1b9b6ed4cf1164
}: FindingsSearchBarProps) => {
  const {
    data: {
      query: queryService,
      ui: { SearchBar },
    },
<<<<<<< HEAD
  } = useKibana<CspClientPluginStartDeps>().services;
=======
  } = useKibana<CspPluginSetup>().services;
>>>>>>> 95855fa7343125d097f00abedc1b9b6ed4cf1164

  useEffect(() => {
    const subscription = queryService.filterManager.getUpdates$().subscribe(() =>
      // TODO: add a condition to check if component is mounted
<<<<<<< HEAD
      setQuery({
=======
      setSource({
>>>>>>> 95855fa7343125d097f00abedc1b9b6ed4cf1164
        filters: queryService.filterManager.getFilters(),
        query,
        dateRange,
      })
    );

    return () => subscription.unsubscribe();
<<<<<<< HEAD
  }, [dateRange, query, queryService.filterManager, setQuery]);
=======
  }, [dateRange, query, queryService.filterManager, setSource]);
>>>>>>> 95855fa7343125d097f00abedc1b9b6ed4cf1164

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
<<<<<<< HEAD
        setQuery({
=======
        setSource({
>>>>>>> 95855fa7343125d097f00abedc1b9b6ed4cf1164
          query,
          filters,
          ...v,
        })
      }
      onQuerySubmit={(v) =>
<<<<<<< HEAD
        setQuery({
          query,
          filters,
          ...v,
=======
        setSource({
          ...v,
          filters,
>>>>>>> 95855fa7343125d097f00abedc1b9b6ed4cf1164
        })
      }
    />
  );
};
