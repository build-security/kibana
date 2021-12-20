/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import React, { useMemo, useState } from 'react';
import {
  Criteria,
  EuiLink,
  EuiTableFieldDataColumnType,
  EuiBadge,
  EuiBasicTable,
  PropsOf,
  EuiBasicTableProps,
} from '@elastic/eui';
import { orderBy } from 'lodash';
import { FINDINGS_TABLE_TESTID } from './constants';
import type { CSPFinding, FindingsFetchState } from './types';
import { CSPEvaluationBadge } from '../../components/csp_evaluation_badge';

interface BaseFindingsTableProps {
  selectItem(v: CSPFinding | undefined): void;
}

type FindingsTableProps = FindingsFetchState & BaseFindingsTableProps;

/**
 * Temporary findings table
 */
export const FindingsTable = ({ data, status, error, selectItem }: FindingsTableProps) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const columns = useMemo(getColumns, []);

  const getCellProps = (item: CSPFinding, column: EuiTableFieldDataColumnType<CSPFinding>) => ({
    onClick: column.field === 'rule.name' ? () => selectItem(item) : undefined,
  });

  const onTableChange = ({ page }: Criteria<CSPFinding>) => {
    if (!page) return;
    const { index, size } = page;

    setPageIndex(index);
    setPageSize(size);
  };

  // TODO: add empty/error/loading views
  if (!data) return null;

  // TODO: async pagination
  const pagination: EuiBasicTableProps<CSPFinding>['pagination'] = {
    pageIndex,
    pageSize,
    totalItemCount: data.length,
    pageSizeOptions: [5, 10, 25],
    hidePerPageOptions: false,
  };

  const sortedData = orderBy(data, ['@timestamp'], ['desc']);
  const page = sortedData.slice(pageIndex * pageSize, pageSize * pageIndex + pageSize);

  return (
    <EuiBasicTable
      data-test-subj={FINDINGS_TABLE_TESTID}
      loading={status === 'loading'}
      error={error ? error : undefined}
      items={page}
      columns={columns}
      tableLayout={'auto'}
      pagination={pagination}
      onChange={onTableChange}
      cellProps={getCellProps}
    />
  );
};

const RuleName = (v: string) => <EuiLink href="#">{v}</EuiLink>;
const RuleTags = (v: string[]) => v.map((x) => <EuiBadge color="default">{x}</EuiBadge>);
const ResultEvaluation = (v: PropsOf<typeof CSPEvaluationBadge>['type']) => (
  <CSPEvaluationBadge type={v} />
);

const getColumns = (): Array<EuiTableFieldDataColumnType<CSPFinding>> => [
  {
    field: 'resource.filename',
    name: 'Resource',
    truncateText: true,
  },
  {
    field: 'rule.name',
    name: 'Rule Name',
    width: '50%',
    truncateText: true,
    render: RuleName,
  },
  {
    field: 'result.evaluation',
    name: 'Evaluation',
    width: '80px',
    render: ResultEvaluation,
  },
  {
    field: 'rule.tags',
    name: 'Tags',
    width: '300px',
    truncateText: true,
    // TODO: tags need to be truncated (as they are components, not texts)
    // and on hover they should show the full tags
    // currently causes the table to overflow its parent
    render: RuleTags,
  },
  {
    field: '@timestamp',
    name: 'Timestamp',
    truncateText: true,
  },
];
