/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import React, { useCallback, useMemo } from 'react';
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
import type { CspFinding } from './types';
import { CspEvaluationBadge } from '../../components/csp_evaluation_badge';
import type { FindingsUrlQuery, FindingsFetchState } from './findings_container';
import { SortDirection } from '../../../../../../src/plugins/data/common';

type TableQueryProps = Pick<FindingsUrlQuery, 'sort' | 'from' | 'size'>;

interface BaseFindingsTableProps extends TableQueryProps {
  setQuery(query: Partial<TableQueryProps>): void;
  selectItem(item: CspFinding | undefined): void;
}

type FindingsTableProps = FindingsFetchState & BaseFindingsTableProps;

const FindingsTableComponent = ({
  setQuery,
  selectItem,
  from,
  size,
  sort = [],
  data = [],
  error,
  ...props
}: FindingsTableProps) => {
  const pagination = useMemo(
    () =>
      getEuiPaginationFromEsSearchSource({
        from,
        size,
        total: props.status === 'success' ? props.total : 0,
      }),
    [from, size, props]
  );

  const sorting = useMemo(() => getEuiSortFromEsSearchSource(sort), [sort]);

  const getCellProps = useCallback(
    (item: CspFinding, column: EuiTableFieldDataColumnType<CspFinding>) => ({
      onClick: column.field === 'rule.name' ? () => selectItem(item) : undefined,
    }),
    [selectItem]
  );

  const onTableChange = useCallback(
    (params: Criteria<CspFinding>) => {
      setQuery(getEsSearchQueryFromEuiTableParams(params));
    },
    [setQuery]
  );

  // Show "zero state"
  if (!data.length && props.status === 'success')
    // TODO: use our own logo
    return (
      <EuiEmptyPrompt
        iconType="logoKibana"
        title={<h2>{TEXT.NO_FINDINGS}</h2>}
        data-test-subj={TEST_SUBJECTS.FINDINGS_TABLE_ZERO_STATE}
      />
    );

  return (
    <EuiBasicTable
      data-test-subj={TEST_SUBJECTS.FINDINGS_TABLE}
      loading={props.status === 'loading'}
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
  total,
}: Pick<FindingsTableProps, 'from' | 'size'> & {
  total: number;
}): EuiBasicTableProps<CspFinding>['pagination'] => ({
  pageSize,
  pageIndex: Math.ceil(pageIndex / pageSize),
  totalItemCount: total,
  pageSizeOptions: [10, 25, 100],
  hidePerPageOptions: false,
});

const getEuiSortFromEsSearchSource = (
  sort: TableQueryProps['sort']
): EuiBasicTableProps<CspFinding>['sorting'] => {
  if (!sort.length) return;

  const entry = Object.entries(sort[0])?.[0];
  if (!entry) return;

  const [field, direction] = entry;
  return { sort: { field: field as keyof CspFinding, direction: direction as SortDirection } };
};

const getEsSearchQueryFromEuiTableParams = ({
  page,
  sort,
}: Criteria<CspFinding>): Partial<TableQueryProps> => ({
  ...(!!page && { from: page.index * page.size, size: page.size }),
  sort: sort ? [{ [sort.field]: SortDirection[sort.direction] }] : undefined,
});

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
