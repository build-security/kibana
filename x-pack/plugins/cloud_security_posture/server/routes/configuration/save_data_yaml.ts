/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import { produce } from 'immer';
import { schema as rt } from '@kbn/config-schema';
import { unset } from 'lodash';

import type {
  ElasticsearchClient,
  IRouter,
  SavedObjectsClientContract,
  SavedObjectsFindResponse,
} from 'src/core/server';

import { transformError } from '@kbn/securitysolution-es-utils';
import yaml from 'js-yaml';

import { CspConfigSchema } from '../../../common/schemas/csp_configuration';
import { CspAppContext } from '../../plugin';
import { SAVE_DATA_YAML_ROUTE_PATH } from '../../../common/constants';
import { CspRuleSchema, cspRuleAssetSavedObjectType } from '../../../common/schemas/csp_rule';
import { PackagePolicyServiceInterface } from '../../../../fleet/server';
import { PackagePolicy, PackagePolicyConfigRecord } from '../../../../fleet/common';
import { CIS_KUBERNETES_PACKAGE_NAME } from '../../../common/constants';
import { PackagePolicyService } from '../../../../fleet/server/services/package_policy';

export const DEFAULT_FINDINGS_PER_PAGE = 20;

const getCspRule = async (soClient: SavedObjectsClientContract) => {
  const cspRules = await soClient.find<CspRuleSchema>({
    type: cspRuleAssetSavedObjectType,
    search: '',
    searchFields: ['name'],
    page: 1,
    sortField: 'name.raw',
    perPage: 10,
  });
  return cspRules;
};

const createConfig = async (
  cspRules: SavedObjectsFindResponse<CspRuleSchema>
): Promise<CspConfigSchema> => {
  const activatedRules = cspRules.saved_objects.filter(
    (cspRule) => cspRule.attributes.enabled === true
  );
  const config = {
    activated_rules: {
      cis_k8s: activatedRules.map((activatedRule) => activatedRule.id),
    },
  };
  return config;
};

const convertConfigToYaml = (config: CspConfigSchema): string => {
  return yaml.safeDump(config);
};

export const PACKAGE_POLICY_SAVED_OBJECT_TYPE = 'ingest-package-policies';

export const getPackageNameQuery = (packageName: string): string => {
  return `${PACKAGE_POLICY_SAVED_OBJECT_TYPE}.package.name:${packageName}`;
};

const setVarToPackagePolicy = (packagePolicy: PackagePolicy, dataYaml: string): PackagePolicy => {
  const configFile: PackagePolicyConfigRecord = {
    dataYaml: { type: 'config', value: dataYaml },
  };
  const updatedPackagePolicy = produce(packagePolicy, (draft) => {
    unset(draft, 'id');
    draft.vars = configFile;
  });
  return updatedPackagePolicy;
};

const updatePackagePolicy = async (
  packagePolicyService: PackagePolicyService,
  packagePolicies: PackagePolicy[],
  esClient: ElasticsearchClient,
  soClient: SavedObjectsClientContract,
  dataYaml: string
): Promise<PackagePolicy[]> => {
  const updatedPackagePolicies = Promise.all(
    packagePolicies.map((packagePolicy) => {
      const updatedPackagePolicy = setVarToPackagePolicy(packagePolicy, dataYaml);
      return packagePolicyService?.update(
        soClient,
        esClient,
        packagePolicy.id,
        updatedPackagePolicy
      );
    })
  );
  return updatedPackagePolicies;
};

export const getPackagePolicies = async (
  soClient: SavedObjectsClientContract,
  packagePolicyService: PackagePolicyServiceInterface | undefined,
  packageName: string
): Promise<PackagePolicy[]> => {
  if (!packagePolicyService) {
    throw new Error('packagePolicyService is undefined');
  }

  const packageNameQuery = getPackageNameQuery(packageName);

  const { items: packagePolicies } = (await packagePolicyService?.list(soClient, {
    kuery: packageNameQuery,
    page: 1,
    perPage: 20,
  })) ?? { items: [] as PackagePolicy[] };

  return packagePolicies;
};

export const defineSaveDataYamlRoute = (router: IRouter, cspContext: CspAppContext): void =>
  router.get(
    {
      path: SAVE_DATA_YAML_ROUTE_PATH,
      validate: { query: schema },
    },
    async (context, request, response) => {
      try {
        const esClient = context.core.elasticsearch.client.asCurrentUser;
        const soClient = context.core.savedObjects.client;

        const cspRules = await getCspRule(soClient);
        const config = await createConfig(cspRules);
        const dataYaml = convertConfigToYaml(config);

        const packagePolicyService = cspContext.service.packagePolicyService;
        const packagePolicies = await getPackagePolicies(
          soClient,
          packagePolicyService,
          CIS_KUBERNETES_PACKAGE_NAME
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

const schema = rt.object({
  latest_cycle: rt.maybe(rt.boolean()),
  page: rt.number({ defaultValue: 1, min: 0 }),
  per_page: rt.number({ defaultValue: DEFAULT_FINDINGS_PER_PAGE, min: 0 }),
});
