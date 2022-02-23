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
  EuiSwitch,
  EuiTableFieldDataColumnType,
  EuiBasicTable,
  EuiBasicTableProps,
} from '@elastic/eui';
// import moment from 'moment';
import type { RulesState } from './rules_container';
import * as TEST_SUBJECTS from './test_subjects';
import * as TEXT from './translations';
import type { RuleSavedObject } from './use_csp_rules';

type RulesTableProps = RulesState & {
  toggleRule(rule: RuleSavedObject): void;
  setSelectedRules(rules: RuleSavedObject[]): void;
  setPagination(pagination: Pick<RulesState, 'perPage' | 'page'>): void;
  // ForwardRef makes this ref not available in parent callbacks
  tableRef: React.RefObject<EuiBasicTable<any>>;
};

export const RulesTable = ({
  toggleRule,
  setSelectedRules,
  setPagination,
  perPage: pageSize,
  page,
  tableRef,
  ...props
}: RulesTableProps) => {
  const columns = useMemo(() => getColumns({ toggleRule }), [toggleRule]);

  const items = useMemo(() => props.rules_page || [], [props.rules_page]);

  const euiPagination: EuiBasicTableProps<RuleSavedObject>['pagination'] = {
    pageIndex: page,
    pageSize,
    totalItemCount: props.total,
    pageSizeOptions: [1, 5, 10, 25],
    hidePerPageOptions: false,
  };

  const selection: EuiBasicTableProps<RuleSavedObject>['selection'] = {
    selectable: () => true,
    onSelectionChange: setSelectedRules,
  };

  const onTableChange = ({ page: _page }: Criteria<RuleSavedObject>) => {
    if (!_page) return;
    setPagination({ page: _page.index, perPage: _page.size });
  };

  return (
    <EuiBasicTable
      ref={tableRef}
      data-test-subj={TEST_SUBJECTS.CSP_RULES_TABLE}
      loading={props.loading}
      error={props.error}
      items={items}
      columns={columns}
      pagination={euiPagination}
      onChange={onTableChange}
      isSelectable={true}
      selection={selection}
      itemId={(v) => v.id}
    />
  );
};

const ruleNameRenderer = (name: string) => (
  <EuiLink className="eui-textTruncate" title={name}>
    {name}
  </EuiLink>
);

// const timestampRenderer = (timestamp: string) =>
//   moment.duration(moment().diff(timestamp)).humanize();

interface GetColumnProps {
  toggleRule: (rule: RuleSavedObject) => void;
}

const createRuleEnabledSwitchRenderer =
  ({ toggleRule }: GetColumnProps) =>
  (value: any, rule: RuleSavedObject) =>
    (
      <EuiSwitch
        label=""
        checked={value}
        onChange={() => toggleRule(rule)}
        data-test-subj={TEST_SUBJECTS.getCspRulesTableItemSwitchTestId(rule.attributes.id)}
      />
    );

const getColumns = ({
  toggleRule,
}: GetColumnProps): Array<EuiTableFieldDataColumnType<RuleSavedObject>> => [
  {
    field: 'attributes.name',
    name: TEXT.RULE_NAME,
    width: '60%',
    truncateText: true,
    render: ruleNameRenderer,
  },
  {
    field: 'section', // TODO: what field is this?
    name: TEXT.SECTION,
    width: '15%',
  },
  {
    // TODO: get timestamp value
    // add SavedObject["updated_at"] to SimpleSavedObject?
    field: 'updated_at',
    name: TEXT.UPDATED_AT,
    width: '15%',
    // render: timestampRenderer,
  },
  {
    field: 'attributes.enabled',
    name: TEXT.ENABLED,
    render: createRuleEnabledSwitchRenderer({ toggleRule }),
    width: '10%',
  },
];
