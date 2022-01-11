/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { SearchRequest, QueryDslQueryContainer } from '@elastic/elasticsearch/lib/api/types';

import { schema as rt, TypeOf } from '@kbn/config-schema';
import type { SortOrder } from '@elastic/elasticsearch/lib/api/types';
import type { IRouter } from 'src/core/server';
import { fromKueryExpression, toElasticsearchQuery } from '@kbn/es-query';
import { QueryDslBoolQuery } from '@elastic/elasticsearch/lib/api/typesWithBodyKey';
import { getLatestCycleIds } from './get_latest_cycle_ids';
import { CSP_KUBEBEAT_INDEX_PATTERN, FINDINGS_ROUTE_PATH } from '../../../common/constants';

type FindingsQuerySchema = TypeOf<typeof findingsInputSchema>;

export const DEFAULT_FINDINGS_PER_PAGE = 20;
export interface FindingsOptions {
  size: number;
  from?: number;
  page?: number;
  sortField?: string;
  sortOrder?: SortOrder;
  fields?: string[];
}

const buildLatestCycleFilter = (latestCycleIds?: string[]): QueryDslQueryContainer[] => {
  if (!!latestCycleIds) {
    const latestCycleFilter = latestCycleIds.map((latestCycleId) => ({
      term: { 'run_id.keyword': latestCycleId },
    }));
    return latestCycleFilter;
  }
  return [];
};

const convertKqueryToElasticsearchQuery = (
  filter?: string
  // logger: Logger
): QueryDslQueryContainer[] => {
  let dslFilterQuery: QueryDslBoolQuery['filter'];
  try {
    dslFilterQuery = filter ? toElasticsearchQuery(fromKueryExpression(filter)) : [];
    if (!Array.isArray(dslFilterQuery)) {
      dslFilterQuery = [dslFilterQuery];
    }
  } catch (err) {
    // TODO: uncomment after adding logger (task #2611) is merged
    // logger.debug(`Invalid kuery syntax for the filter (${filter}) error:`, {
    //   message: err.message,
    //   statusCode: err.statusCode,
    // });
    throw err;
  }
  return dslFilterQuery;
};

const buildQueryRequest = (
  queryParams: FindingsQuerySchema,
  latestCycleIds?: string[]
): QueryDslQueryContainer => {
  const filter = convertKqueryToElasticsearchQuery(queryParams.dsl_query);
  const latestCycleIdsFilter = buildLatestCycleFilter(latestCycleIds);
  filter.push(...latestCycleIdsFilter);
  const query = {
    bool: {
      filter,
    },
  };
  return query;
};
const getPointerForFirstDoc = (page: number, perPage: number): number =>
  page <= 1 ? 0 : page * perPage - perPage + 1;

const getSort = (sortField: string | undefined, sortOrder: string) =>
  sortField
    ? { sort: [{ [sortField]: sortOrder }] }
    : { sort: [{ '@timestamp': { order: sortOrder } }] };

const getSearchFields = (fields: string | undefined) => (fields ? { _source: [fields] } : {});

const buildOptionsRequest = (queryParams: FindingsQuerySchema): FindingsOptions => ({
  size: queryParams.per_page,
  from: getPointerForFirstDoc(queryParams.page, queryParams.per_page),
  ...getSort(queryParams.sort_field, queryParams.sort_order),
  ...getSearchFields(queryParams.fields),
});

const getFindingsEsQuery = (
  query: QueryDslQueryContainer,
  options: FindingsOptions
): SearchRequest => {
  return {
    index: CSP_KUBEBEAT_INDEX_PATTERN,
    query,
    ...options,
  };
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
        const options = buildOptionsRequest(request.query);

        const latestCycleIds =
          request.query.latest_cycle === true ? await getLatestCycleIds(esClient) : undefined;
        const query = buildQueryRequest(request.query, latestCycleIds);
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
  page: rt.number({ defaultValue: 1, min: 0 }),
  per_page: rt.number({ defaultValue: DEFAULT_FINDINGS_PER_PAGE, min: 0 }),
  dsl_query: rt.maybe(rt.string()),
  latest_cycle: rt.maybe(rt.boolean()),
  sort_field: rt.maybe(rt.string()),
  sort_order: rt.oneOf([rt.literal('asc'), rt.literal('desc')], { defaultValue: 'desc' }),
  fields: rt.maybe(rt.string()),
});
