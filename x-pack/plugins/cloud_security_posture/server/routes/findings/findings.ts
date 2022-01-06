/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { SearchRequest, QueryDslQueryContainer } from '@elastic/elasticsearch/lib/api/types';

import { schema as rt, TypeOf } from '@kbn/config-schema';
import type { SearchSortOrder } from '@elastic/elasticsearch/lib/api/types';
import type { IRouter } from 'src/core/server';
import { getLatestCycleIds } from './get_latest_cycle_ids';
<<<<<<< HEAD
import { CSP_KUBEBEAT_INDEX_NAME, FINDINGS_ROUTE_PATH } from '../../../common/constants';
=======
import { CSP_KUBEBEAT_INDEX_PATTERN, FINDINGS_ROUTE_PATH } from '../../../common/constants';
>>>>>>> 589797a5e4b... fix TS error

type FindingsQuerySchema = TypeOf<typeof findingsInputSchema>;

export const DEFAULT_FINDINGS_PER_PAGE = 20;
export interface FindingsOptions {
  size: number;
  from?: number;
  page?: number;
  sortField?: string;
  sortOrder?: SearchSortOrder;
  fields?: string[];
}

const getFindingsEsQuery = (
  query: QueryDslQueryContainer,
  options: FindingsOptions
): SearchRequest => {
  return {
    index: CSP_KUBEBEAT_INDEX_NAME,
    query,
    ...options,
  };
};

const rewriteReqQuery = (latestCycleIds?: string[]): QueryDslQueryContainer => {
  let filterPart: QueryDslQueryContainer = { match_all: {} };
  if (!!latestCycleIds) {
    const filter = latestCycleIds.map((latestCycleId) => ({
      term: { 'run_id.keyword': latestCycleId },
    }));
    filterPart = { bool: { filter } };
  }

  return {
    ...filterPart,
  };
};

const getFindingsEsQuery = async (
  esClient: ElasticsearchClient,
  queryParams: FindingsQuerySchema
): Promise<SearchRequest> => {
  const query = await buildQueryFilter(esClient, queryParams);
  return {
    index: CSP_KUBEBEAT_INDEX_NAME,
    query,
    size: queryParams.per_page,
    from:
      queryParams.page <= 1
        ? 0
        : queryParams.page * queryParams.per_page - queryParams.per_page + 1,
  };
  ...(queryParams.sort_field
    ? { sort: [{ [queryParams.sort_field]: queryParams.sort_order }] }
    : {}),
  ...(queryParams.fields ? { _source: [queryParams.fields] } : {}),
};

export const defineFindingsIndexRoute = (router: IRouter): void =>
  router.get(
    {
      path: FINDINGS_ROUTE_PATH,
      validate: { query: findingsInputSchema },
    },
    async (context, request, response) => {
      try {
        const esClient = context.core.elasticsearch.client.asCurrentUser;
        const options = rewriteReqOptions(request.query);

        const latestCycleIds =
          request.query.latest_cycle === true ? await getLatestCycleIds(esClient) : undefined;
        const query = rewriteReqQuery(latestCycleIds);
        const esQuery = getFindingsEsQuery(query, options);
        const findings = await esClient.search(esQuery);
        const hits = findings.body.hits.hits;
        return response.ok({ body: hits });
      } catch (err) {
        // TODO: research error handling
        return response.customError({ body: { message: err }, statusCode: 500 });
      }
    }
  );

export const findingsInputSchema = rt.object({
  latest_cycle: rt.maybe(rt.boolean()),
  page: rt.number({ defaultValue: 1, min: 0 }),
  per_page: rt.number({ defaultValue: DEFAULT_FINDINGS_PER_PAGE, min: 0 }),
  sort_field: rt.maybe(rt.string()),
  sort_order: rt.oneOf([rt.literal('asc'), rt.literal('desc')], { defaultValue: 'desc' }),
  fields: rt.maybe(rt.string()),
});
