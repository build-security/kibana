/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { SearchRequest, QueryDslQueryContainer } from '@elastic/elasticsearch/lib/api/types';
import type { SearchSortOrder } from '@elastic/elasticsearch/lib/api/types';

import { schema as rt, TypeOf } from '@kbn/config-schema';
import type { ElasticsearchClient } from 'src/core/server';
import type { IRouter } from 'src/core/server';
import { getLatestCycleIds } from './get_latest_cycle_ids';
import { CSP_KUBEBEAT_INDEX_PATTERN, FINDINGS_ROUTH_PATH } from '../../../common/constants';
// import { options } from 'joi';
export const DEFAULT_FINDINGS_PER_PAGE = 20;
type FindingsQuerySchema = TypeOf<typeof schema>;

const buildQueryFilter = async (
  esClient: ElasticsearchClient,
  queryParams: FindingsQuerySchema
): Promise<QueryDslQueryContainer> => {
  if (queryParams.latest_cycle) {
    const latestCycleIds = await getLatestCycleIds(esClient);
    if (!!latestCycleIds) {
      const filter = latestCycleIds.map((latestCycleId) => ({
        term: { 'run_id.keyword': latestCycleId },
      }));

      return {
        bool: { filter },
      };
    }
  }
  return {
    match_all: {},
  };
};

const getFindingsEsQuery = async (
  esClient: ElasticsearchClient,
  queryParams: FindingsQuerySchema,
  options: FindingsOptions
): Promise<SearchRequest> => {
  const query = await buildQueryFilter(esClient, queryParams);
  return {
    index: CSP_KUBEBEAT_INDEX_PATTERN,
    query,
    ...options,
  };
};

const rewriteQueryReq = (queryParams: FindingsQuerySchema): FindingsOptions => ({
  size: queryParams.per_page,
  from: (queryParams.page - 1) * queryParams.per_page,
  // ...(queryParams.sort_order ? { sort_order: queryParams.sort_order } : {}),
  ...(queryParams.sort_field
    ? { sort: queryParams.sort_field + ':' + queryParams.sort_order }
    : {}),
  ...(queryParams.fields ? { _source: [queryParams.fields] } : {}),
});

export interface FindingsOptions {
  size: number;
  from?: number;
  page?: number;
  sortField?: string;
  sortOrder?: SearchSortOrder;
  fields?: string[];
}

export const defineFindingsIndexRoute = (router: IRouter): void =>
  router.get(
    {
      path: FINDINGS_ROUTH_PATH,
      validate: { query: schema },
    },
    async (context, request, response) => {
      try {
        const esClient = context.core.elasticsearch.client.asCurrentUser;
        const { query } = request;
        const options = rewriteQueryReq(query);
        console.log(options);
        const esQuery = await getFindingsEsQuery(esClient, query, options);
        const findings = await esClient.search(esQuery);
        const hits = findings.body.hits.hits;
        return response.ok({ body: hits });
      } catch (err) {
        // TODO: research error handling
        return response.customError({ body: { message: err }, statusCode: 500 });
      }
    }
  );

const schema = rt.object({
  latest_cycle: rt.maybe(rt.boolean()),
  page: rt.number({ defaultValue: 1, min: 0 }), // TODO: research for pagintaion best practice
  per_page: rt.number({ defaultValue: DEFAULT_FINDINGS_PER_PAGE, min: 0 }),
  sort_field: rt.maybe(rt.string()),
  sort_order: rt.oneOf([rt.literal('asc'), rt.literal('desc')], { defaultValue: 'desc' }),
  fields: rt.maybe(rt.string()),
});
