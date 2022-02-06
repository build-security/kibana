/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import React, { useState, useMemo } from 'react';
import { EuiSpacer } from '@elastic/eui';
import { FindingsTable } from './findings_table';
import { FindingsRuleFlyout } from './findings_flyout';
import { FindingsSearchBar } from './findings_search_bar';
import * as TEST_SUBJECTS from './test_subjects';
import type { CspFinding } from './types';
import type { DataView, EsQuerySortValue } from '../../../../../../src/plugins/data/common';
import { SortDirection } from '../../../../../../src/plugins/data/common';
import { useUrlQuery } from '../../common/hooks/use_url_query';
import { useFindings, type CspFindingsRequest } from './use_findings';

// TODO: define this as a schema with default values
// need to get Query and DateRange schema
export const getDefaultQuery = (): CspFindingsRequest => ({
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
  const findingsQuery: CspFindingsRequest = useMemo(
    () => ({ ...urlQuery, sort: mapEsQuerySortKey(urlQuery.sort) }),
    [urlQuery]
  );

  const findingsResult = useFindings(dataView, findingsQuery, urlKey);

  return (
    <div data-test-subj={TEST_SUBJECTS.FINDINGS_CONTAINER}>
      <FindingsSearchBar
        dataView={dataView}
        setQuery={setUrlQuery}
        {...findingsQuery}
        {...findingsResult}
      />
      <EuiSpacer />
      <FindingsTable
        setQuery={setUrlQuery}
        selectItem={setSelectedFinding}
        {...findingsQuery}
        {...findingsResult}
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
