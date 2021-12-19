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
  EuiBasicTableProps,
  // EuiToolTip,
} from '@elastic/eui';
import { orderBy } from 'lodash';
import { FetchState } from './types';
import { CSPRule } from '../../../common/types';

// import { getToolTipContent } from '../../../../security_solution/public/common/utils/privileges';
// import { RuleSwitch } from '../../../../security_solution/public/detections/components/rules/rule_switch';

type RulesTableProps = FetchState<CSPRule[]>;

/**
 * Temporary rules table
 */
export const RulesTable = ({ data, loading, error }: RulesTableProps) => {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(25);
  const [sortField, setSortField] = useState<keyof CSPRule>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [_, setSelectedRule] = useState<CSPRule | undefined>();
  const columns = useMemo(getColumns, []);

  const getCellProps = (item: CSPRule, column: EuiTableFieldDataColumnType<CSPRule>) => ({
    onClick: column.field === 'rule.name' ? () => setSelectedRule(item) : undefined,
  });

  const onTableChange = ({ page, sort }: Criteria<CSPRule>) => {
    if (!page || !sort) return;
    const { index, size } = page;
    const { field, direction } = sort;

    setPageIndex(index);
    setPageSize(size);
    setSortField(field as keyof CSPRule);
    setSortDirection(direction);
  };

  // TODO: add empty/error/loading views
  if (!data) return null;

  // TODO: async pagination?
  const pagination: EuiBasicTableProps<CSPRule>['pagination'] = {
    pageIndex,
    pageSize,
    totalItemCount: data.length,
    pageSizeOptions: [5, 10, 25],
    hidePerPageOptions: false,
  };

  // TODO: async sorting?
  const sorting: EuiBasicTableProps<CSPRule>['sorting'] = {
    sort: {
      field: sortField,
      direction: sortDirection,
    },
    enableAllColumns: true,
  };

  const sortedData = orderBy(data, ['@timestamp'], ['desc']);
  const page = sortedData.slice(pageIndex * pageSize, pageSize * pageIndex + pageSize);

  return (
    <>
      <EuiBasicTable
        loading={loading}
        error={error ? error : undefined}
        items={page}
        columns={columns}
        tableLayout={'auto'}
        pagination={pagination}
        sorting={sorting}
        onChange={onTableChange}
        cellProps={getCellProps}
      />
    </>
  );
};

const RuleName = (v: string) => <EuiLink href="#">{v}</EuiLink>;
const RuleTags = (v: string[]) => v.map((x) => <EuiBadge color="default">{x}</EuiBadge>);

const getColumns = (): Array<EuiTableFieldDataColumnType<CSPRule>> => [
  {
    field: 'rule.name',
    name: 'Rule Name',
    width: '50%',
    truncateText: true,
    render: RuleName,
  },
  {
    field: 'rule.benchmark',
    name: 'Benchmark',
    truncateText: true,
  },
  {
    field: 'rule.tags',
    name: 'Tags',
    truncateText: true,
    // TODO: tags need to be truncated (as they are components, not texts)
    // and on hover they should show the full tags
    // currently causes the table to overflow its parent
    render: RuleTags,
  },
  // {
  //   field: 'rule.enabled',
  //   name: 'Activated',
  //   render: (_, rule: CSPRule) => (
  //     <EuiToolTip position="top" content={getToolTipContent(rule, false, true)}>
  //       <RuleSwitch
  //         data-test-subj="enabled"
  //         // dispatch={dispatch}
  //         id={rule.id}
  //         enabled={true}
  //         isDisabled={!rule.enabled}
  //         // isLoading={loadingRuleIds.includes(rule.id)} // todo: idk
  //       />
  //     </EuiToolTip>
  //   ),
  // },
];
