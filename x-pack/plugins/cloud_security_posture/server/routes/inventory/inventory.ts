/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { ElasticsearchClient, IRouter } from 'kibana/server';
import { transformError } from '@kbn/securitysolution-es-utils';
import { CspAppContext } from '../../plugin';
import {
  CSP_KUBEBEAT_INDEX_PATTERN,
  INVENTORY_ROUTE_PATH,
  STATS_ROUTE_PATH,
} from '../../../common/constants';

export const getInventoryQuery = (): any => {
  return {
    index: CSP_KUBEBEAT_INDEX_PATTERN,
    query: {
      match_all: {},
    },
    aggs: {
      aggs_by_resource_name: {
        terms: { field: 'resource.filename.keyword' },
      },
    },
  };
};

export const getInventory = async (esClient: ElasticsearchClient) => {
  const queryResult = await esClient.search(getInventoryQuery());
  // @ts-ignore
  const resourceNameAggs = queryResult.body.aggregations?.aggs_by_resource_name.buckets;
  if (!Array.isArray(resourceNameAggs)) throw new Error('error');
  console.log(resourceNameAggs);

  return resourceNameAggs.map((e) => ({ name: e.key, instances: e.doc_count }));
};

export const defineGetInventoryRoute = (router: IRouter, cspContext: CspAppContext): void =>
  router.get(
    {
      path: INVENTORY_ROUTE_PATH,
      validate: false,
    },
    async (context, _, response) => {
      try {
        const esClient = context.core.elasticsearch.client.asCurrentUser;

        const inventory = await getInventory(esClient);

        const body: any = { inventory };

        return response.ok({
          body,
        });
      } catch (err) {
        const error = transformError(err);

        return response.customError({
          body: { message: error.message },
          statusCode: error.statusCode,
        });
      }
    }
  );
