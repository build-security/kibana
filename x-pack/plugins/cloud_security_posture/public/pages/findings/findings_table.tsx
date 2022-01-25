/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import React, { useMemo } from 'react';
import {
  Criteria,
  EuiLink,
  EuiTableFieldDataColumnType,
  EuiEmptyPrompt,
  EuiBasicTable,
  PropsOf,
  EuiBasicTableProps,
} from '@elastic/eui';
import moment from 'moment';
import * as TEST_SUBJECTS from './test_subjects';
import * as TEXT from './translations';
import type { CspFinding, FindingsFetchState } from './types';
import { CspEvaluationBadge } from '../../components/csp_evaluation_badge';
import type { FindingsUrlQuery } from './findings_container';
import { SortDirection } from '../../../../../../src/plugins/data/common';

type TableQueryProps = Pick<FindingsUrlQuery, 'sort' | 'from' | 'size' | 'dataView'>;

interface BaseFindingsTableProps extends TableQueryProps {
  setQuery(q: Omit<TableQueryProps, 'dataView'>): void;
  selectItem(v: CspFinding | undefined): void;
  totalItemCount: number;
}

type FindingsTableProps = FindingsFetchState & BaseFindingsTableProps;

const FindingsTableComponent = ({
  from,
  size,
  sort = [],
  totalItemCount,
  data = [],
  status,
  error,
  setQuery,
  selectItem,
}: FindingsTableProps) => {
  const pagination = useMemo(
    () => getEuiPaginationFromEsSearchSource({ from, size, totalItemCount }),
    [from, size, totalItemCount]
  );

  const sorting = useMemo(() => getEuiSortFromEsSearchSource(sort), [sort]);

  const getCellProps = (item: CspFinding, column: EuiTableFieldDataColumnType<CspFinding>) => ({
    onClick: column.field === 'rule.name' ? () => selectItem(item) : undefined,
  });

  const onTableChange = ({ page, sort: _sort }: Criteria<CspFinding>) => {
    if (!page || !_sort) return;

    setQuery({
      from: page.index * page.size,
      size: page.size,
      sort: [{ [_sort.field]: SortDirection[_sort.direction] }],
    });
  };

  // Show "zero state"
  if (!data.length && status === 'success')
    // TODO: use our own logo
    return <EuiEmptyPrompt iconType="logoKibana" title={<h2>{TEXT.NO_FINDINGS}</h2>} />;

  return (
    <EuiBasicTable
      data-test-subj={TEST_SUBJECTS.FINDINGS_TABLE}
      loading={status === 'loading'}
      error={error ? error : undefined}
      items={data}
      columns={columns}
      pagination={pagination}
      sorting={sorting}
      onChange={onTableChange}
      cellProps={getCellProps}
    />
  );
};

const getEuiPaginationFromEsSearchSource = ({
  from: pageIndex,
  size: pageSize,
  totalItemCount,
}: Pick<
  FindingsTableProps,
  'from' | 'size' | 'totalItemCount'
>): EuiBasicTableProps<CspFinding>['pagination'] => ({
  pageSize,
  pageIndex: Math.ceil(pageIndex / pageSize),
  totalItemCount,
  pageSizeOptions: [10, 25, 100],
  hidePerPageOptions: false,
});

const getEuiSortFromEsSearchSource = (
  sort: TableQueryProps['sort']
): EuiBasicTableProps<CspFinding>['sorting'] => {
  if (!sort.length) return;

  const [field, direction] = Object.entries(sort[0])[0];
  return { sort: { field: field as keyof CspFinding, direction: direction as SortDirection } };
};

const timestampRenderer = (timestamp: string) =>
  moment.duration(moment().diff(timestamp)).humanize();

const ruleNameRenderer = (name: string) => <EuiLink>{name}</EuiLink>;

const resultEvaluationRenderer = (type: PropsOf<typeof CspEvaluationBadge>['type']) => (
  <CspEvaluationBadge type={type} />
);

const columns: Array<EuiTableFieldDataColumnType<CspFinding>> = [
  {
    field: 'resource.filename',
    name: TEXT.RESOURCE,
    truncateText: true,
    width: '15%',
    sortable: true,
  },
  {
    field: 'rule.name',
    name: TEXT.RULE_NAME,
    width: '45%',
    truncateText: true,
    render: ruleNameRenderer,
    sortable: true,
  },
  {
    field: 'result.evaluation',
    name: TEXT.EVALUATION,
    width: '100px',
    render: resultEvaluationRenderer,
    sortable: true,
  },
  {
    field: '@timestamp',
    name: TEXT.TIMESTAMP,
    truncateText: true,
    render: timestampRenderer,
    sortable: true,
  },
];

export const FindingsTable = React.memo(FindingsTableComponent);
