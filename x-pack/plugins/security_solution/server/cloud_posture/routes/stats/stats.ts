/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { ElasticsearchClient, Logger } from 'src/core/server';
import {
  AggregationsTermsAggregate,
  DictionaryResponseBase,
  AggregationsKeyedBucketKeys,
} from '@elastic/elasticsearch/lib/api/types';
import {
  getFindingsEsQuery,
  getResourcesEvaluationEsQuery,
  getBenchmarksQuery,
  getLatestFindingQuery,
} from './stats_queries';
import type { SecuritySolutionPluginRouter } from '../../../types';
import type { CloudPostureStats, BenchmarkStats, EvaluationStats } from '../../types';

/**
 * @param value value is [0, 1] range
 */
<<<<<<< HEAD:x-pack/plugins/security_solution/server/cloud_posture/routes/score.ts
const roundScore = (value: number) => Number((value * 100).toFixed(1));

const calculatePostureScore = (total: number, passed: number, failed: number) =>
  total === 0 ? undefined : roundScore(passed / failed);

const getLatestFinding = (): SearchRequest => ({
  index: FINDINGS_INDEX,
  size: 1,
  /* @ts-expect-error TS2322 - missing SearchSortContainer */
  sort: { '@timestamp': 'desc' },
  query: {
    match_all: {},
  },
});

const getResourcesEvaluationEsQuery = (
  cycleId: string,
  result: 'passed' | 'failed',
  size: number,
  resources?: string[]
): SearchRequest => {
  const query: Required<Pick<QueryDslQueryContainer, 'bool'>> = {
    bool: {
      filter: [
        { term: { 'run_id.keyword': cycleId } },
        { term: { 'result.evaluation.keyword': result } },
      ],
    },
  };
  if (resources) {
    query.bool.must = { terms: { 'resource.filename.keyword': resources } };
  }
  return {
    index: FINDINGS_INDEX,
    size,
    query,
    aggs: {
      group: {
        terms: { field: 'resource.filename.keyword' },
      },
    },
    sort: 'resource.filename.keyword',
  };
};
=======
>>>>>>> b537cc5b564 (server tests):x-pack/plugins/security_solution/server/cloud_posture/routes/stats/stats.ts
interface LastCycle {
  run_id: string;
}

interface GroupFilename {
  // TODO find the 'key', 'doc_count' interface
  key: string;
  doc_count: number;
  group_docs: AggregationsTermsAggregate<AggregationsKeyedBucketKeys>;
}

export const roundScore = (value: number) => Number((value * 100).toFixed(1));

const calculatePostureScore = (total: number, passed: number, failed: number) =>
  passed + failed === 0 || total === undefined ? undefined : roundScore(passed / (passed + failed));

const getLatestCycleId = async (esClient: ElasticsearchClient) => {
  const latestFinding = await esClient.search<LastCycle>(getLatestFindingQuery());
  const lastCycle = latestFinding.body.hits.hits[0];
  return lastCycle?._source?.run_id;
};

export const getBenchmarks = async (esClient: ElasticsearchClient) => {
  const queryResult = await esClient.search(getBenchmarksQuery());
  const bencmarksBuckets = queryResult.body.aggregations?.benchmarks as AggregationsTermsAggregate<
    DictionaryResponseBase<string, string>
  >;
  return bencmarksBuckets.buckets.map((e) => e.key);
};

export const getAllFindingsStats = async (
  esClient: ElasticsearchClient,
  cycleId: string
): Promise<BenchmarkStats> => {
  const findings = await esClient.count(getFindingsEsQuery(cycleId));
  const passedFindings = await esClient.count(getFindingsEsQuery(cycleId, 'passed'));
  const failedFindings = await esClient.count(getFindingsEsQuery(cycleId, 'failed'));

  const totalFindings = findings.body.count;
  const totalPassed = passedFindings.body.count;
  const totalFailed = failedFindings.body.count;

  return {
    name: 'general',
    postureScore: calculatePostureScore(totalFindings, totalPassed, totalFailed),
    totalFindings,
    totalPassed,
    totalFailed,
  };
};

export const getBenchmarksStats = async (
  esClient: ElasticsearchClient,
  cycleId: string,
  benchmarks: string[]
): Promise<BenchmarkStats[]> => {
  const benchmarkScores = Promise.all(
    benchmarks.map(async (benchmark) => {
      const benchmarkFindings = await esClient.count(getFindingsEsQuery(benchmark, cycleId));
      const benchmarkPassedFindings = await esClient.count(
        getFindingsEsQuery(cycleId, 'passed', benchmark)
      );
      const benchmarkFailedFindings = await esClient.count(
        getFindingsEsQuery(cycleId, 'failed', benchmark)
      );
      const totalFindings = benchmarkFindings.body.count;
      const totalPassed = benchmarkPassedFindings.body.count;
      const totalFailed = benchmarkFailedFindings.body.count;

      return {
        name: benchmark,
        postureScore: calculatePostureScore(totalFindings, totalPassed, totalFailed),
        totalFindings,
        totalPassed,
        totalFailed,
      };
    })
  );
  return benchmarkScores;
};

export const getResourcesEvaluation = async (
  esClient: ElasticsearchClient,
  cycleId: string
): Promise<EvaluationStats[]> => {
  const failedEvaluationsPerResourceResult = await esClient.search(
    getResourcesEvaluationEsQuery(cycleId, 'failed', 5)
  );

  const failedResourcesGroup = failedEvaluationsPerResourceResult.body.aggregations
    ?.group as AggregationsTermsAggregate<GroupFilename>;
  const topFailedResources = failedResourcesGroup.buckets.map((e) => e.key);
  const failedEvaluationPerResorces = failedResourcesGroup.buckets.map((e) => {
    return {
      resource: e.key,
      value: e.doc_count,
      evaluation: 'failed',
    } as const;
  });

  const passedEvaluationsPerResourceResult = await esClient.search(
    getResourcesEvaluationEsQuery(cycleId, 'passed', 5, topFailedResources)
  );

  const passedResourcesGroup = passedEvaluationsPerResourceResult.body.aggregations
    ?.group as AggregationsTermsAggregate<GroupFilename>;
  const passedEvaluationPerResorces = passedResourcesGroup.buckets.map((e) => {
    return {
      resource: e.key,
      value: e.doc_count,
      evaluation: 'passed',
    } as const;
  });

  return [...passedEvaluationPerResorces, ...failedEvaluationPerResorces];
};

export const getScoreRoute = (router: SecuritySolutionPluginRouter, logger: Logger): void =>
  router.get(
    {
      path: '/api/csp/stats',
      validate: false,
    },
    async (context, _, response) => {
      try {
        const esClient = context.core.elasticsearch.client.asCurrentUser;
        const benchmarks = await getBenchmarks(esClient);
        const latestCycleID = await getLatestCycleId(esClient);
        if (latestCycleID === undefined) {
          throw new Error('cycle id is missing');
        }
        const [allFindingsStats, benchmarksStats, resourcesEvaluations] = await Promise.all([
          getAllFindingsStats(esClient, latestCycleID),
          getBenchmarksStats(esClient, latestCycleID, benchmarks),
          getResourcesEvaluation(esClient, latestCycleID),
        ]);
        const body: CloudPostureStats = {
          ...allFindingsStats,
          benchmarksStats,
          resourcesEvaluations,
        };
        return response.ok({
          body,
        });
      } catch (err) {
        // TODO - validate err object and parse
        return response.customError({ body: { message: 'Unknown error' }, statusCode: 500 });
      }
    }
  );
