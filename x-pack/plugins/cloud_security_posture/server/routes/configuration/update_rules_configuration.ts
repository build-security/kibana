/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import type {
  ElasticsearchClient,
  IRouter,
  SavedObjectsClientContract,
  SavedObjectsFindResponse,
} from 'src/core/server';
import { transformError } from '@kbn/securitysolution-es-utils';

import { produce } from 'immer';
import { unset } from 'lodash';
import yaml from 'js-yaml';

import { PackagePolicy, PackagePolicyConfigRecord } from '../../../../fleet/common';
import { CspAppContext } from '../../plugin';
import { CspRulesConfigSchema } from '../../../common/schemas/csp_configuration';
import { CspRuleSchema, cspRuleAssetSavedObjectType } from '../../../common/schemas/csp_rule';
import { getPackagePolicies } from '../benchmarks/benchmarks';
import { UPDATE_RULES_CONFIG_ROUTE_PATH } from '../../../common/constants';
import { CIS_KUBERNETES_PACKAGE_NAME } from '../../../common/constants';
import { PackagePolicyServiceInterface } from '../../../../fleet/server';

export const getCspRules = async (soClient: SavedObjectsClientContract) => {
  const cspRules = await soClient.find<CspRuleSchema>({
    type: cspRuleAssetSavedObjectType,
    search: '',
    searchFields: ['name'],
    // TODO: research how to get all rules
    perPage: 10000,
  });
  return cspRules;
};

export const createRulesConfig = (
  cspRules: SavedObjectsFindResponse<CspRuleSchema>
): CspRulesConfigSchema => {
  const activatedRules = cspRules.saved_objects.filter((cspRule) => cspRule.attributes.enabled);

  const config = {
    activated_rules: {
      cis_k8s: activatedRules.map((activatedRule) => activatedRule.id),
    },
  };
  return config;
};

export const convertRulesConfigToYaml = (config: CspRulesConfigSchema): string => {
  return yaml.safeDump(config);
};

export const setVarToPackagePolicy = (
  packagePolicy: PackagePolicy,
  dataYaml: string
): PackagePolicy => {
  const configFile: PackagePolicyConfigRecord = {
    dataYaml: { type: 'config', value: dataYaml },
  };
  const updatedPackagePolicy = produce(packagePolicy, (draft) => {
    unset(draft, 'id');
    draft.vars = configFile;
    // TODO: disable comments after adding base config to integration
    // draft.inputs[0].vars = configFile;
  });
  return updatedPackagePolicy;
};

export const updatePackagePolicy = async (
  packagePolicyService: PackagePolicyServiceInterface,
  packagePolicies: PackagePolicy[],
  esClient: ElasticsearchClient,
  soClient: SavedObjectsClientContract,
  dataYaml: string
): Promise<PackagePolicy[]> => {
  const updatedPackagePolicies = Promise.all(
    packagePolicies.map((packagePolicy) => {
      const updatedPackagePolicy = setVarToPackagePolicy(packagePolicy, dataYaml);
      return packagePolicyService.update(
        soClient,
        esClient,
        packagePolicy.id,
        updatedPackagePolicy
      );
    })
  );
  return updatedPackagePolicies;
};

export const defineUpdateRulesConfigRoute = (router: IRouter, cspContext: CspAppContext): void =>
  router.get(
    {
      path: UPDATE_RULES_CONFIG_ROUTE_PATH,
      validate: false,
    },
    async (context, request, response) => {
      try {
        const esClient = context.core.elasticsearch.client.asCurrentUser;
        const soClient = context.core.savedObjects.client;
        const packagePolicyService = cspContext.service.packagePolicyService;

        // TODO: This validate can be remove after #2819 will be merged
        if (!packagePolicyService) {
          throw new Error(`Failed to get Fleet services`);
        }

        const cspRules = await getCspRules(soClient);
        const rulesConfig = createRulesConfig(cspRules);
        const dataYaml = convertRulesConfigToYaml(rulesConfig);

        const packagePolicies = await getPackagePolicies(
          soClient,
          packagePolicyService,
          CIS_KUBERNETES_PACKAGE_NAME,
          { page: 1, per_page: 10000 } // // TODO: research how to get all packages
        );

        const updatedPackagePolicies = await updatePackagePolicy(
          packagePolicyService!,
          packagePolicies,
          esClient,
          soClient,
          dataYaml
        );

        return response.ok({ body: updatedPackagePolicies });
      } catch (err) {
        const error = transformError(err);
        cspContext.logger.error(
          `Failed to update rules configuration on package policy ${error.message}`
        );
        return response.customError({
          body: { message: error.message },
          statusCode: error.statusCode,
        });
      }
    }
  );
