/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { ElasticsearchClient, Logger } from 'src/core/server';
import {
  SearchRequest,
  CountRequest,
  QueryDslQueryContainer,
  AggregationsTermsAggregate,
  DictionaryResponseBase,
} from '@elastic/elasticsearch/lib/api/types';
import type { SecuritySolutionPluginRouter } from '../../types';
import type { CloudPostureStats, PostureScore } from '../types';

const FINDINGS_INDEX = `kubebeat*`;

const getFindingsEsQuery = (
  cycleId: string,
  evaluationResult?: string,
  benchmark?: string
): CountRequest => {
  const filter: QueryDslQueryContainer[] = [{ term: { 'run_id.keyword': cycleId } }];

  if (benchmark !== undefined) {
    filter.push({ term: { 'rule.benchmark.keyword': benchmark } });
  }

  if (evaluationResult !== undefined) {
    filter.push({ term: { 'result.evaluation.keyword': evaluationResult } });
  }

  return {
    index: FINDINGS_INDEX,
    query: {
      bool: { filter },
    },
  };
};

/**
 * @param value value is [0, 1] range
 */
const roundScore = (value: number) => Number((value * 100).toFixed(1));

const getLatestFinding = (): SearchRequest => ({
  index: FINDINGS_INDEX,
  size: 1,
  /* @ts-expect-error TS2322 */
  sort: { '@timestamp': 'desc' }, // TODO - expected to get string or string[] but it's working. check it.
  query: {
    match_all: {},
  },
});

// TODO: get top 5 frequent
const getEvaluationPerFilenameEsQuery = (cycleId: string): SearchRequest => ({
  index: FINDINGS_INDEX,
  // TODO: figure out what needs to be the size (considering large collections / pagination)
  size: 1000,
  query: {
    bool: {
      filter: [{ term: { 'run_id.keyword': cycleId } }],
    },
  },
  aggs: {
    group: {
      terms: { field: 'resource.filename.keyword' },
      aggs: {
        group_docs: {
          terms: { field: 'result.evaluation.keyword' },
        },
      },
    },
  },
});

interface LastCycle {
  run_id: string;
}

const getLatestCycleId = async (esClient: ElasticsearchClient) => {
  const latestFinding = await esClient.search<LastCycle>(getLatestFinding());
  const lastCycle = latestFinding.body.hits.hits[0];
  return lastCycle?._source?.run_id;
};

const getBenchmarksQuery = (): SearchRequest => ({
  index: FINDINGS_INDEX,
  size: 0,
  aggs: {
    benchmarks: {
      terms: { field: 'rule.benchmark.keyword' },
    },
  },
});

const getBenchmarks = async (esClient: ElasticsearchClient) => {
  const queryReult = await esClient.search(getBenchmarksQuery());
  const bencmarksBuckets = queryReult.body.aggregations
    ?.benchmarks as AggregationsTermsAggregate<DictionaryResponseBase>;
  return bencmarksBuckets.buckets.map((e) => e.key);
};

interface GroupFilename {
  key: string;
  group_docs: AggregationsTermsAggregate<DictionaryResponseBase<string, number>>;
}

const getEvaluationPerFilename = async (
  esClient: ElasticsearchClient,
  cycleId: string
): Promise<PostureScore[]> => {
  const evaluationsPerFilename = await esClient.search(getEvaluationPerFilenameEsQuery(cycleId));
  const evaluationsBuckets = evaluationsPerFilename.body.aggregations
    ?.group as AggregationsTermsAggregate<GroupFilename>;
  const counterPerFilename = evaluationsBuckets.buckets.map((filenameObject) => ({
    name: filenameObject.key,
    totalPassed: filenameObject.group_docs.buckets.find((e) => e.key === 'passed')?.doc_count || 0,
    // totalPassed: 0,
    totalFailed: 0,
    // totalFailed: filenameObject.group_docs.buckets.find((e) => e.key === 'failed')?.doc_count || 0,
  }));
  return counterPerFilename;
};

const getAllFindingsStats = async (
  esClient: ElasticsearchClient,
  cycleId: string
): Promise<PostureScore> => {
  const findings = await esClient.count(getFindingsEsQuery(cycleId));
  const passedFindings = await esClient.count(getFindingsEsQuery(cycleId, 'passed'));
  const failedFindings = await esClient.count(getFindingsEsQuery(cycleId, 'failed'));
  return {
    totalFindings: findings.body.count,
    postureScore:
      findings.body.count === 0
        ? undefined
        : roundScore(passedFindings.body.count / findings.body.count),
    totalPassed: passedFindings.body.count,
    totalFailed: failedFindings.body.count,
  };
};

const getScorePerBenchmark = async (
  esClient: ElasticsearchClient,
  cycleId: string,
  benchmarks: string[]
): Promise<PostureScore[]> => {
  const benchmarkScores = Promise.all(
    benchmarks.map(async (benchmark) => {
      const benchmarkFindings = await esClient.count(getFindingsEsQuery(benchmark, cycleId));
      const benchmarkPassedFindings = await esClient.count(
        getFindingsEsQuery(cycleId, 'passed', benchmark)
      );
      const benchmarkFailedFindings = await esClient.count(
        getFindingsEsQuery(cycleId, 'failed', benchmark)
      );

      return {
        name: benchmark,
        totalFindings: benchmarkFindings.body.count,
        postureScore:
          benchmarkFindings.body.count === 0
            ? undefined
            : roundScore(benchmarkPassedFindings.body.count / benchmarkFindings.body.count),
        totalPassed: benchmarkPassedFindings.body.count,
        totalFailed: benchmarkFailedFindings.body.count,
      };
    })
  );
  return benchmarkScores;
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
        const [allFindingsStats, statsPerBenchmark, evaluationsPerFilename] = await Promise.all([
          getAllFindingsStats(esClient, latestCycleID),
          getScorePerBenchmark(esClient, latestCycleID, benchmarks),
          getEvaluationPerFilename(esClient, latestCycleID),
        ]);
        const body: CloudPostureStats = {
          ...allFindingsStats,
          statsPerBenchmark,
          evaluationsPerFilename,
        };
        return response.ok({
          body,
        });
      } catch (err) {
        // TODO: add custom error handling
        return response.customError({ body: { message: 'Unknown error' }, statusCode: 400 });
      }
    }
  );
