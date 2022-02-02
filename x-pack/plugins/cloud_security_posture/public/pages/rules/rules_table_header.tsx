/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import React, { useState } from 'react';
import {
  EuiContextMenuPanel,
  EuiContextMenuItem,
  EuiContextMenuItemProps,
  EuiPopover,
  EuiSpacer,
  EuiFieldSearch,
  useGeneratedHtmlId,
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
} from '@elastic/eui';
import { FormattedMessage } from '@kbn/i18n-react';
import * as TEST_SUBJECTS from './test_subjects';
import * as TEXT from './translations';

interface RulesBulkActionsMenuProps {
  items: ReadonlyArray<EuiContextMenuItemProps & { text: string }>;
}

interface RulesTableToolbarProps {
  search(value: string): void;
  refresh(): void;
  bulkEnable(): void;
  bulkDisable(): void;
  totalRulesCount: number;
  selectedRulesCount: number;
  searchValue: string;
  isSearching: boolean;
}

export const RulesTableHeader = ({
  search,
  refresh,
  bulkEnable,
  bulkDisable,
  totalRulesCount,
  selectedRulesCount,
  searchValue,
  isSearching,
}: RulesTableToolbarProps) => (
  <div>
    <EuiFlexGroup alignItems="center" justifyContent="spaceBetween">
      <EuiFlexItem
        grow={false}
        style={{ flexDirection: 'row', fontVariantNumeric: 'tabular-nums' }}
      >
        <FormattedMessage
          id="xpack.csp.rules.total_rules_count"
          defaultMessage="Showing {totalRulesCount} rules"
          values={{
            totalRulesCount: <b>&nbsp;{totalRulesCount}&nbsp;</b>,
          }}
        />
        <span>&nbsp;&nbsp;|&nbsp;&nbsp;</span>
        <FormattedMessage
          id="xpack.csp.rules.selected_rules_count"
          defaultMessage="Selected {selectedRulesCount} rules"
          values={{
            selectedRulesCount: <b>&nbsp;{selectedRulesCount}&nbsp;</b>,
          }}
        />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <RulesBulkActionsMenu
          items={[
            {
              icon: 'copy', // TODO: icon
              text: TEXT.ENABLE,
              'data-test-subj': TEST_SUBJECTS.CSP_RULES_TABLE_BULK_ENABLE_BUTTON,
              onClick: bulkEnable,
            },
            {
              icon: 'copy', // TODO: icon
              text: TEXT.DISABLE,
              'data-test-subj': TEST_SUBJECTS.CSP_RULES_TABLE_BULK_DISABLE_BUTTON,
              onClick: bulkDisable,
            },
          ]}
        />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiButtonEmpty
          onClick={refresh}
          iconType={'refresh'}
          data-test-subj={TEST_SUBJECTS.CSP_RULES_TABLE_REFRESH_BUTTON}
        >
          {TEXT.REFRESH}
        </EuiButtonEmpty>
      </EuiFlexItem>
      <EuiFlexItem grow={true} style={{ alignItems: 'flex-end' }}>
        <EuiFieldSearch
          isLoading={isSearching}
          placeholder={TEXT.SEARCH}
          value={searchValue}
          onChange={(e) => search(e.target.value)}
        />
      </EuiFlexItem>
    </EuiFlexGroup>
    <EuiSpacer />
  </div>
);

const RulesBulkActionsMenu = ({ items }: RulesBulkActionsMenuProps) => {
  const [isPopoverOpen, setPopover] = useState(false);
  const smallContextMenuPopoverId = useGeneratedHtmlId({
    prefix: 'smallContextMenuPopover',
  });

  const onButtonClick = () => setPopover(!isPopoverOpen);

  const closePopover = () => setPopover(false);

  const data = items.map((item) => (
    <EuiContextMenuItem
      {...item}
      key={item.text}
      children={item.text}
      onClick={(e) => {
        closePopover();
        item.onClick?.(e);
      }}
    />
  ));

  const button = (
    <EuiButtonEmpty
      iconType={'arrowDown'}
      onClick={onButtonClick}
      data-test-subj={TEST_SUBJECTS.CSP_RULES_TABLE_BULK_MENU_BUTTON}
    >
      {TEXT.BULK_ACTIONS}
    </EuiButtonEmpty>
  );

  return (
    <EuiPopover
      id={smallContextMenuPopoverId}
      button={button}
      isOpen={isPopoverOpen}
      closePopover={closePopover}
      panelPaddingSize="none"
      anchorPosition="downLeft"
    >
      <EuiContextMenuPanel size="s" items={data} />
    </EuiPopover>
  );
};
