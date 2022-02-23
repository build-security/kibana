/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import React from 'react';
import { EuiSpacer, EuiFieldSearch, EuiButtonEmpty, EuiFlexGroup, EuiFlexItem } from '@elastic/eui';
import { FormattedMessage } from '@kbn/i18n-react';
import * as TEST_SUBJECTS from './test_subjects';
import * as TEXT from './translations';
import { RulesBulkActionsMenu } from './rules_bulk_actions_menu';

interface RulesTableToolbarProps {
  search(value: string): void;
  refresh(): void;
  bulkEnable(): void;
  bulkDisable(): void;
  selectAll(): void;
  clearSelection(): void;
  totalRulesCount: number;
  selectedRulesCount: number;
  searchValue: string;
  isSearching: boolean;
}

interface CounterProps {
  count: number;
}

interface ButtonProps {
  onClick(): void;
}

export const RulesTableHeader = ({
  search,
  refresh,
  bulkEnable,
  bulkDisable,
  selectAll,
  clearSelection,
  totalRulesCount,
  selectedRulesCount,
  searchValue,
  isSearching,
}: RulesTableToolbarProps) => (
  <div>
    <EuiFlexGroup alignItems="center" justifyContent="spaceBetween" responsive={false} wrap>
      <Counters total={totalRulesCount} selected={selectedRulesCount} />
      <SelectAllToggle
        isSelectAll={selectedRulesCount === totalRulesCount}
        clear={clearSelection}
        select={selectAll}
      />
      <BulkMenu
        bulkEnable={bulkEnable}
        bulkDisable={bulkDisable}
        selectedRulesCount={selectedRulesCount}
      />
      <RefreshButton onClick={refresh} />
      <SearchField isSearching={isSearching} searchValue={searchValue} search={search} />
    </EuiFlexGroup>
    <EuiSpacer />
  </div>
);

const Counters = ({ total, selected }: { total: number; selected: number }) => (
  <EuiFlexItem grow={false} style={{ flexDirection: 'row', fontVariantNumeric: 'tabular-nums' }}>
    <TotalRulesCount count={total} />
    {Spacer}
    <SelectedRulesCount count={selected} />
  </EuiFlexItem>
);

const SelectAllToggle = ({
  isSelectAll,
  select,
  clear,
}: {
  select(): void;
  clear(): void;
  isSelectAll: boolean;
}) => (
  <EuiFlexItem grow={false}>
    {isSelectAll ? <ClearSelectionButton onClick={clear} /> : <SelectAllButton onClick={select} />}
  </EuiFlexItem>
);

const BulkMenu = ({
  bulkEnable,
  bulkDisable,
  selectedRulesCount,
}: Pick<RulesTableToolbarProps, 'bulkDisable' | 'bulkEnable' | 'selectedRulesCount'>) => (
  <EuiFlexItem grow={false}>
    <RulesBulkActionsMenu
      items={[
        {
          icon: 'copy', // TODO: icon
          disabled: !selectedRulesCount,
          text: <ActivateRulesMenuItemText count={selectedRulesCount} />,
          'data-test-subj': TEST_SUBJECTS.CSP_RULES_TABLE_BULK_ENABLE_BUTTON,
          onClick: bulkEnable,
        },
        {
          icon: 'copy', // TODO: icon
          disabled: !selectedRulesCount,
          text: <DeactivateRulesMenuItemText count={selectedRulesCount} />,
          'data-test-subj': TEST_SUBJECTS.CSP_RULES_TABLE_BULK_DISABLE_BUTTON,
          onClick: bulkDisable,
        },
      ]}
    />
  </EuiFlexItem>
);

const SearchField = ({
  search,
  isSearching,
  searchValue,
}: Pick<RulesTableToolbarProps, 'isSearching' | 'searchValue' | 'search'>) => (
  <EuiFlexItem grow={true} style={{ alignItems: 'flex-end' }}>
    <EuiFieldSearch
      isLoading={isSearching}
      placeholder={TEXT.SEARCH}
      value={searchValue}
      onChange={(e) => search(e.target.value)}
      style={{ minWidth: 150 }}
    />
  </EuiFlexItem>
);

const TotalRulesCount = ({ count }: CounterProps) => (
  <FormattedMessage
    id="xpack.csp.rules.header.totalRulesCount"
    defaultMessage="Showing {rules}"
    values={{ rules: <RulesCount count={count} /> }}
  />
);

const SelectedRulesCount = ({ count }: CounterProps) => (
  <FormattedMessage
    id="xpack.csp.rules.header.selectedRulesCount"
    defaultMessage="Selected {rules}"
    values={{ rules: <RulesCount count={count} /> }}
  />
);

const ActivateRulesMenuItemText = ({ count }: CounterProps) => (
  <FormattedMessage
    id="xpack.csp.rules.activate_all"
    defaultMessage="Activate {rules}"
    values={{ rules: <RulesCount count={count} /> }}
  />
);

const DeactivateRulesMenuItemText = ({ count }: CounterProps) => (
  <FormattedMessage
    id="xpack.csp.rules.deactivate_all"
    defaultMessage="Deactivate {rules}"
    values={{ rules: <RulesCount count={count} /> }}
  />
);

const RulesCount = ({ count }: CounterProps) => (
  <FormattedMessage
    id="xpack.csp.rules.header.rules_count"
    defaultMessage="{count, plural, one {# rule} other {# rules}}"
    values={{ count }}
  />
);

const ClearSelectionButton = ({ onClick }: ButtonProps) => (
  <EuiButtonEmpty
    onClick={onClick}
    iconType={'cross'}
    data-test-subj={TEST_SUBJECTS.CSP_RULES_TABLE_CLEAR_SELECTION_BUTTON}
  >
    <FormattedMessage id="xpack.csp.rules.clear_selection" defaultMessage="Clear Selection" />
  </EuiButtonEmpty>
);

const SelectAllButton = ({ onClick }: ButtonProps) => (
  <EuiButtonEmpty
    onClick={onClick}
    iconType={'pagesSelect'}
    data-test-subj={TEST_SUBJECTS.CSP_RULES_TABLE_SELECT_ALL_BUTTON}
  >
    <FormattedMessage id="xpack.csp.rules.select_all" defaultMessage="Select All" />
  </EuiButtonEmpty>
);

const RefreshButton = ({ onClick }: ButtonProps) => (
  <EuiFlexItem grow={false}>
    <EuiButtonEmpty
      onClick={onClick}
      iconType={'refresh'}
      data-test-subj={TEST_SUBJECTS.CSP_RULES_TABLE_REFRESH_BUTTON}
    >
      {TEXT.REFRESH}
    </EuiButtonEmpty>
  </EuiFlexItem>
);

const Spacer = <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>;
