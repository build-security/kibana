/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { EuiPanel, EuiFlexGroup, EuiFlexItem, EuiButtonEmpty } from '@elastic/eui';
import { SavedObject } from 'src/core/public';
import { extractErrorMessage } from '../../../common/utils/helpers';
import { RulesTable } from './rules_table';
import { RulesBottomBar } from './rules_bottom_bar';
import { RulesTableHeader } from './rules_table_header';
import type { CspRuleSchema } from '../../../common/schemas/csp_rule';
import { useFindCspRules, useBulkUpdateCspRules, type UseCspRulesOptions } from './use_csp_rules';
import * as TEST_SUBJECTS from './test_subjects';
import { pagePathGetters } from '../../../../fleet/public';

export type RuleSavedObject = SavedObject<CspRuleSchema>; // SimpleSavedObject

type RulesQuery = Required<Omit<UseCspRulesOptions, 'searchFields'>>;
type RulesQueryResult = ReturnType<typeof useFindCspRules>;
type SimpleRulesQueryResult = DistributivePick<RulesQueryResult, 'data' | 'error' | 'status'>;

/** Rules with local changes */
type LocalRulesResult =
  | Exclude<SimpleRulesQueryResult, { status: 'success' | 'error' }>
  | {
      status: 'error';
      error: string;
      data: undefined;
    }
  | {
      status: 'success';
      error: null;
      data: readonly RuleSavedObject[];
      total: number;
    };

export type RulesState = LocalRulesResult & RulesQuery;

const getSimpleQueryString = (searchValue?: string): string =>
  searchValue ? `${searchValue}*` : '';

const getChangedRules = (
  baseRules: ReadonlyMap<string, RuleSavedObject>,
  currentChangedRules: ReadonlyMap<string, RuleSavedObject>,
  rulesToChange: readonly RuleSavedObject[]
): Map<string, RuleSavedObject> => {
  const changedRules = new Map(currentChangedRules);

  rulesToChange.forEach((ruleToChange) => {
    const baseRule = baseRules.get(ruleToChange.id);
    const changedRule = changedRules.get(ruleToChange.id);

    if (!baseRule) throw new Error('expected base rule to exists');

    const baseRuleChanged = baseRule.attributes.enabled !== ruleToChange.attributes.enabled;

    if (!changedRule && baseRuleChanged) changedRules.set(ruleToChange.id, ruleToChange);

    if (changedRule && !baseRuleChanged) changedRules.delete(ruleToChange.id);
  });

  return changedRules;
};

const getLocalRulesResult = (
  result: SimpleRulesQueryResult,
  localData: readonly RuleSavedObject[]
): LocalRulesResult => {
  switch (result.status) {
    case 'success':
      return {
        ...result,
        data: localData,
        total: result.data.total,
      };
    case 'error':
      return {
        ...result,
        data: undefined,
        error: extractErrorMessage(result.error),
      };
    default:
      return result;
  }
};

export const RulesContainer = () => {
  const [changedRules, setChangedRules] = useState<Map<string, RuleSavedObject>>(new Map());
  const [selectedRules, setSelectedRules] = useState<RuleSavedObject[]>([]);
  const [rulesQuery, setRulesQuery] = useState<RulesQuery>({ page: 1, perPage: 5, search: '' });

  const { data, status, error, refetch } = useFindCspRules({
    ...rulesQuery,
    search: getSimpleQueryString(rulesQuery.search),
    searchFields: ['name'],
  });

  const { mutate: bulkUpdate, isLoading: isUpdating } = useBulkUpdateCspRules();

  const baseData: { rules: RuleSavedObject[]; rulesMap: Map<string, RuleSavedObject> } =
    useMemo(() => {
      const rules = data?.savedObjects || [];
      return { rules, rulesMap: new Map(rules.map((rule) => [rule.id, rule])) };
    }, [data]);

  /**
   * TODO(TS@4.6): remove casting
   * @see https://github.com/microsoft/TypeScript/pull/46266
   */
  const localRulesResult = useMemo(
    () =>
      getLocalRulesResult(
        { data, error, status } as SimpleRulesQueryResult,
        baseData.rules.map((rule) => changedRules.get(rule.attributes.id) || rule)
      ),
    [baseData, changedRules, status, data, error]
  );

  const hasChanges = !!changedRules.size;

  const toggleRules = (rules: RuleSavedObject[], enabled: boolean) =>
    setChangedRules(
      getChangedRules(
        baseData.rulesMap,
        changedRules,
        rules.map((rule) => ({
          ...rule,
          attributes: { ...rule.attributes, enabled },
        }))
      )
    );

  const bulkToggleRules = (enabled: boolean) =>
    toggleRules(
      selectedRules.map((rule) => baseData.rulesMap.get(rule.id)!),
      enabled
    );

  const toggleRule = (rule: RuleSavedObject) => toggleRules([rule], !rule.attributes.enabled);

  const bulkUpdateRules = () => bulkUpdate([...changedRules].map(([, rule]) => rule.attributes));

  const discardChanges = useCallback(() => setChangedRules(new Map()), []);

  useEffect(discardChanges, [baseData, discardChanges]);

  return (
    <div style={{ height: '100%' }} data-test-subj={TEST_SUBJECTS.CSP_RULES_CONTAINER}>
      <EuiFlexGroup direction="column">
        <EuiFlexItem>
          <EuiButtonEmpty
            href={pagePathGetters.edit_integration({ policyId: '1', packagePolicyId: '2' })[1]}
            style={{ marginLeft: 'auto' }}
          >
            Manage Integration
          </EuiButtonEmpty>
        </EuiFlexItem>
        <EuiPanel hasBorder hasShadow={false}>
          <RulesTableHeader
            search={(value) =>
              setRulesQuery((currentQuery) => ({ ...currentQuery, search: value }))
            }
            refresh={refetch}
            bulkEnable={() => bulkToggleRules(true)}
            bulkDisable={() => bulkToggleRules(false)}
            selectedRulesCount={selectedRules.length}
            searchValue={rulesQuery.search}
            totalRulesCount={localRulesResult.status === 'success' ? localRulesResult.total : 0}
            isSearching={localRulesResult.status === 'loading'}
          />
          <RulesTable
            {...localRulesResult}
            {...rulesQuery}
            toggleRule={toggleRule}
            setSelectedRules={setSelectedRules}
            setPagination={(paginationQuery) =>
              setRulesQuery((currentQuery) => ({ ...currentQuery, ...paginationQuery }))
            }
          />
        </EuiPanel>
      </EuiFlexGroup>
      {!!hasChanges && (
        <RulesBottomBar onSave={bulkUpdateRules} onCancel={discardChanges} isLoading={isUpdating} />
      )}
    </div>
  );
};

type DistributivePick<T, K extends keyof T> = T extends unknown ? Pick<T, K> : never;
