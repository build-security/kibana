/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { cspRuleAssetSavedObjectType, type CspRuleSchema } from '../../../common/schemas/csp_rule';
import type { SavedObject, SavedObjectsFindOptions } from '../../../../../../src/core/public';
import { useKibana } from '../../common/hooks/use_kibana';

export type RuleSavedObject = SavedObject<CspRuleSchema>; // SimpleSavedObject
export type RulesQuery = Required<Pick<SavedObjectsFindOptions, 'search' | 'page' | 'perPage'>>;
export type RulesQueryResult = ReturnType<typeof useFindCspRules>;

export const useFindCspRules = ({ search, page, perPage }: RulesQuery) => {
  const { savedObjects } = useKibana().services;
  return useQuery(
    [cspRuleAssetSavedObjectType, { search, page, perPage }],
    () =>
      savedObjects.client.find<CspRuleSchema>({
        type: cspRuleAssetSavedObjectType,
        search,
        searchFields: ['name'],
        page: 1,
        // NOTE: 'name.raw' is a field mapping we defined on 'name' so it'd also be sortable
        // TODO: this needs to be shared or removed
        sortField: 'name.raw',
        perPage,
      }),
    { refetchOnWindowFocus: false }
  );
};

export const useBulkUpdateCspRules = () => {
  const { savedObjects, notifications } = useKibana().services;
  const queryClient = useQueryClient();

  return useMutation(
    (rules: CspRuleSchema[]) =>
      savedObjects.client.bulkUpdate<CspRuleSchema>(
        rules.map((rule) => ({
          type: cspRuleAssetSavedObjectType,
          id: rule.id,
          attributes: rule,
        }))
      ),
    {
      onError: (err) => {
        if (err instanceof Error) notifications.toasts.addError(err, { title: 'Update Failed' });
        else notifications.toasts.addDanger('Update Failed');
      },
      onSettled: () =>
        // Invalidate all queries for simplicity
        queryClient.invalidateQueries({
          queryKey: cspRuleAssetSavedObjectType,
          exact: false,
        }),
    }
  );
};
