/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { SearchRequest, QueryDslQueryContainer } from '@elastic/elasticsearch/lib/api/types';

import { schema as rt, TypeOf } from '@kbn/config-schema';
<<<<<<< HEAD
import type { SortOrder } from '@elastic/elasticsearch/lib/api/types';
import type { IRouter } from 'src/core/server';
=======
import type { ElasticsearchClient } from 'src/core/server';
import type { IRouter, Logger } from 'src/core/server';
import { transformError } from '@kbn/securitysolution-es-utils';
>>>>>>> main
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

const getPointerForFirstDoc = (page: number, perPage: number): number =>
  page <= 1 ? 0 : page * perPage - perPage;

const getSort = (sortField: string | undefined, sortOrder: string) =>
  sortField
    ? { sort: [{ [sortField]: sortOrder }] }
    : { sort: [{ '@timestamp': { order: sortOrder } }] };

const getSearchFields = (fields: string | undefined) =>
  fields ? { _source: fields.split(',') } : {};

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

const buildQueryRequest = (latestCycleIds?: string[]): QueryDslQueryContainer => {
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

<<<<<<< HEAD
const buildOptionsRequest = (queryParams: FindingsQuerySchema): FindingsOptions => ({
  size: queryParams.per_page,
  from: getPointerForFirstDoc(queryParams.page, queryParams.per_page),
  ...getSort(queryParams.sort_field, queryParams.sort_order),
  ...getSearchFields(queryParams.fields),
});

export const defineFindingsIndexRoute = (router: IRouter): void =>
=======
export const defineFindingsIndexRoute = (router: IRouter, logger: Logger): void =>
>>>>>>> main
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
        const query = buildQueryRequest(latestCycleIds);
        const esQuery = getFindingsEsQuery(query, options);
        const findings = await esClient.search(esQuery);
        const hits = findings.body.hits.hits;
        return response.ok({ body: hits });
      } catch (err) {
<<<<<<< HEAD
        // TODO: research error handling
        return response.customError({ body: { message: err }, statusCode: 500 });
=======
        const error = transformError(err);
        return response.customError({
          body: { message: error.message },
          statusCode: error.statusCode,
        });
>>>>>>> main
      }
    }
  );

<<<<<<< HEAD
export const findingsInputSchema = rt.object({
  page: rt.number({ defaultValue: 1, min: 0 }),
=======
const schema = rt.object({
  latest_cycle: rt.maybe(rt.boolean()),
  page: rt.number({ defaultValue: 1, min: 0 }), // TODO: research for pagination best practice
>>>>>>> main
  per_page: rt.number({ defaultValue: DEFAULT_FINDINGS_PER_PAGE, min: 0 }),
  latest_cycle: rt.maybe(rt.boolean()),
  sort_field: rt.maybe(rt.string()),
  sort_order: rt.oneOf([rt.literal('asc'), rt.literal('desc')], { defaultValue: 'desc' }),
  fields: rt.maybe(rt.string()),
});
