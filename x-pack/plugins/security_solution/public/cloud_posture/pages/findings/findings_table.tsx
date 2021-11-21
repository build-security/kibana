/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useState } from 'react';
import {
  Criteria,
  EuiLink,
  EuiSpacer,
  EuiButton,
  EuiFlyout,
  EuiFlyoutHeader,
  EuiTitle,
  EuiFlyoutBody,
  EuiTableFieldDataColumnType,
  EuiBadge,
  EuiBasicTable,
} from '@elastic/eui';
import { sortBy, orderBy } from 'lodash';
import moment from 'moment';
import { CSPFinding } from './types';

// TODO:
// - fix sorting, broken for some primitive types

const getEvaluationBadge = (v: string) => (
  <EuiBadge color={v === 'passed' ? 'success' : v === 'failed' ? 'danger' : 'default'}>
    {v.toUpperCase()}
  </EuiBadge>
);

const getTagsBadges = (v: string[]) => (
  <>
    {v.map((x) => (
      <EuiBadge color="default">{x}</EuiBadge>
    ))}
  </>
);

const RuleName = (v: string) => <EuiLink href="#aa">{v}</EuiLink>;

const columns: Array<EuiTableFieldDataColumnType<CSPFinding>> = [
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
    render: getEvaluationBadge,
  },
  // {
  //   field: 'severity',
  //   name: 'Severity',
  // },
  {
    field: 'rule.tags',
    name: 'Tags',
    truncateText: true,
    render: getTagsBadges,
  },
  // {
  //   field: '@timestamp',
  //   name: 'timestamp',
  //   render: (v) => moment(v).format('MMMM Do, YYYY h:mm:ss A'),
  // },
];

interface FindingsTableProps {
  data: CSPFinding[];
  isLoading: boolean;
}

const RuleInfo = ({ onClose, findings }: { onClose(): void; findings: CSPFinding }) => {
  return (
    <EuiFlyout onClose={onClose}>
      <EuiFlyoutHeader hasBorder aria-labelledby={'foo'}>
        <EuiTitle>
          <h2>{findings.rule.name}</h2>
        </EuiTitle>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>{findings.rule.description}</EuiFlyoutBody>
    </EuiFlyout>
  );
};

export const FindingsTable = ({ data, isLoading }: FindingsTableProps) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [sortField, setSortField] = useState<keyof CSPFinding>('resource');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentRule, setCurrentRule] = useState<any>();

  const getCellProps = (item, column) => {
    const { field } = column;
    if (field === 'rule.name') {
      return {
        onClick: () => setCurrentRule(item),
      };
    }
    return {};
  };

  const onTableChange = ({ page, sort }: Criteria<any>) => {
    if (!page || !sort) return;
    const { index, size } = page;
    const { field, direction } = sort;

    setPageIndex(index);
    setPageSize(size);
    setSortField(field as keyof CSPFinding);
    setSortDirection(direction);
  };

  const pagination = {
    pageIndex,
    pageSize,
    totalItemCount: data.length,
    pageSizeOptions: [5, 10, 25],
    hidePerPageOptions: false,
  };

  const sorting = {
    sort: {
      field: sortField,
      direction: sortDirection,
    },
    enableAllColumns: true,
  };

  const sortedData = orderBy(data, [sortField], [sortDirection]);
  const page = sortedData.slice(pageIndex * pageSize, pageSize * pageIndex + pageSize);

  return (
    <>
      <EuiBasicTable
        loading={isLoading}
        items={page}
        columns={columns}
        tableLayout={'auto'}
        pagination={pagination}
        sorting={sorting}
        onChange={onTableChange}
        cellProps={getCellProps}
      />
      {currentRule && <RuleInfo findings={currentRule} onClose={() => setCurrentRule(false)} />}
    </>
  );
};
