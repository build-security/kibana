/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import type { UseQueryResult, UseMutationResult } from 'react-query';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { cspRuleAssetSavedObjectType, type CspRuleSchema } from '../../../common/schemas/csp_rule';
import type {
  SavedObjectsFindResponsePublic,
  SavedObjectsBatchResponse,
  SavedObjectsFindOptions,
} from '../../../../../../src/core/public';
import { useKibana } from '../../common/hooks/use_kibana';

export type UseCspRulesOptions = Pick<
  SavedObjectsFindOptions,
  'search' | 'searchFields' | 'page' | 'perPage'
>;

export interface UseCspRulesResult {
  bulkUpdateRulesResult: UseUpdateBulkResult;
  rulesResult: UseFindSavedObjectResult;
}

type UseFindSavedObjectResult = UseQueryResult<
  SavedObjectsFindResponsePublic<CspRuleSchema, unknown>,
  string // TODO: what is error type?
>;

type UseUpdateBulkResult = UseMutationResult<
  SavedObjectsBatchResponse<CspRuleSchema>,
  string, // TODO: what is error type?
  CspRuleSchema[],
  unknown
>;

/**
 * @description API for searching CSP rules or updating them in bulk
 */
export const useCspRules = ({
  search,
  searchFields,
  page = 1,
  perPage = 10,
}: UseCspRulesOptions): UseCspRulesResult => {
  const { savedObjects } = useKibana().services;
  const queryClient = useQueryClient();
  const queryKey = [cspRuleAssetSavedObjectType, { search, searchFields, page, perPage }] as const;

  const rulesResult = useQuery<SavedObjectsFindResponsePublic<Readonly<CspRuleSchema>>, string>(
    queryKey,
    () =>
      savedObjects.client.find<CspRuleSchema>({
        type: cspRuleAssetSavedObjectType,
        search,
        searchFields,
        page,
        // NOTE: 'name.raw' is a field maping we defined on 'name' so it'd also be sortable
        // TODO: this needs to be shared or removed
        sortField: 'name.raw',
        perPage,
      }),
    { refetchOnWindowFocus: false }
  );

  const bulkUpdateRulesResult = useMutation<
    SavedObjectsBatchResponse<CspRuleSchema>,
    string,
    CspRuleSchema[]
  >(
    (rules) =>
      savedObjects.client.bulkUpdate<CspRuleSchema>(
        rules.map((rule) => ({
          type: cspRuleAssetSavedObjectType,
          id: rule.id,
          attributes: rule,
        }))
        // TODO: fix bulkUpdate types in core
      ) as Promise<SavedObjectsBatchResponse<CspRuleSchema>>,
    {
      onSuccess: async (data) => {
        const map = Object.fromEntries(data.savedObjects.map((v) => [v.id, v]));
        await queryClient.setQueryData<SavedObjectsBatchResponse<CspRuleSchema>>(
          queryKey,
          (old) => ({
            ...old,
            savedObjects: old?.savedObjects.map((v) => map[v.id] || v) || [],
          })
        );
      },
    }
  );

  return {
    bulkUpdateRulesResult,
    rulesResult,
  };
};
