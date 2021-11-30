/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

/* eslint-disable  */

import { ElasticsearchClient, Logger } from 'src/core/server';
import { SearchRequest, CountRequest } from '@elastic/elasticsearch/lib/api/types';
import type { SecuritySolutionPluginRouter } from '../../types';
import type { CloudPostureStats, PostureScore } from '../types';

const FINDINGS_INDEX = `kubebeat*`;

const getFindingsEsQuery = (benchmark: string = '*', cycleId: string): CountRequest => {
  if (benchmark == '*') {
    return {
      index: FINDINGS_INDEX,
      query: {
        bool: {
          filter: [{ term: { 'run_id.keyword': cycleId } }],
        },
      },
    };
  }
  return {
    index: FINDINGS_INDEX,
    query: {
      bool: {
        filter: [
          { term: { 'rule.benchmark.keyword': benchmark } },
          { term: { 'run_id.keyword': cycleId } },
        ],
      },
    },
  };
};

// todo: replace "*"
const getPassFindingsEsQuery = (benchmark: string = '*', cycleId: string): CountRequest => {
  if (benchmark == '*') {
    return {
      index: FINDINGS_INDEX,
      query: {
        bool: {
          filter: [
            { term: { 'result.evaluation.keyword': 'passed' } },
            { term: { 'run_id.keyword': cycleId } },
          ],
        },
      },
    };
  }
  return {
    index: FINDINGS_INDEX,
    query: {
      bool: {
        filter: [
          { term: { 'result.evaluation.keyword': 'passed' } },
          { term: { 'rule.benchmark.keyword': benchmark } },
          { term: { 'run_id.keyword': cycleId } },
        ],
      },
    },
  };
};

const fixScore = (value: number) => (value * 100).toFixed(1);

const getLatestFinding = (): SearchRequest => ({
  index: FINDINGS_INDEX,
  size: 1,
  sort: { '@timestamp': 'desc' }, // todo - fix error
  query: {
    match_all: {},
  },
});

// todo: get top 5 frequent
const getEvaluationPerFilenameEsQuery = (cycleId: string): SearchRequest => ({
  index: FINDINGS_INDEX,
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
  const latestCycleId = lastCycle._source?.run_id;
  return latestCycleId;
};

const getEvaluationPerFilename = async (
  esClient: ElasticsearchClient,
  cycleId: string
): Promise<PostureScore[]> => {
  const evaluationsPerFilename = await esClient.search(getEvaluationPerFilenameEsQuery(cycleId));
  //@ts-expect-error
  const evaluationsBuckets = evaluationsPerFilename.body.aggregations?.group.buckets;
  const counterPerFilename = evaluationsBuckets.map((filenameObject: any) => ({
    name: filenameObject.key,
    //@ts-expect-error
    totalPassed: filenameObject.group_docs.buckets.find((e) => e.key === 'passed')?.doc_count || 0,
    //@ts-expect-error
    totalFailed: filenameObject.group_docs.buckets.find((e) => e.key === 'failed')?.doc_count || 0,
  }));
  return counterPerFilename;
};

const getAllFindingsStats = async (
  esClient: ElasticsearchClient,
  cycleId: string
): Promise<PostureScore> => {
  const findings = await esClient.count(getFindingsEsQuery('*', cycleId));
  const passFindings = await esClient.count(getPassFindingsEsQuery('*', cycleId));
  return {
<<<<<<< HEAD
    total: findings.body.count,
    postureScore: fixScore(passFindings.body.count / findings.body.count),
=======
    totalFindings: findings.body.count,
    postureScore: roundScore(passFindings.body.count / findings.body.count),
>>>>>>> a56802f928c (data types fix)
    totalPassed: passFindings.body.count,
    totalFailed: findings.body.count - passFindings.body.count,
  };
};

const getScorePerBenchmark = async (
  esClient: ElasticsearchClient,
  cycleId: string
): Promise<PostureScore[]> => {
  //todo: get benchmarks from DB
  // @ts-ignore
  const benchmarks = ['CIS Kubernetes'];
  const benchmarkScores = Promise.all(
    benchmarks.map(async (benchmark) => {
      const benchmarkFindings = await esClient.count(getFindingsEsQuery(benchmark, cycleId));
      const benchmarkPassFindings = await esClient.count(
        getPassFindingsEsQuery(benchmark, cycleId)
      );
      return {
        name: benchmark,
<<<<<<< HEAD
        total: benchmarkFindings.body.count,
        postureScore: fixScore(benchmarkPassFindings.body.count / benchmarkFindings.body.count),
=======
        totalFindings: benchmarkFindings.body.count,
        postureScore: roundScore(benchmarkPassFindings.body.count / benchmarkFindings.body.count),
>>>>>>> a56802f928c (data types fix)
        totalPassed: benchmarkPassFindings.body.count,
        totalFailed: benchmarkFindings.body.count - benchmarkPassFindings.body.count,
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
        const latestCycleID = await getLatestCycleId(esClient);
        if (typeof latestCycleID === 'undefined') {
          throw 'cycle id is missing';
        }
        const allFindingsStats = await getAllFindingsStats(esClient, latestCycleID);
        const statsPerBenchmark = await getScorePerBenchmark(esClient, latestCycleID);
        const evaluationsPerFilename = await getEvaluationPerFilename(esClient, latestCycleID);
        const body: CloudPostureStats = {
          totalFindings: allFindingsStats.totalFindings,
          postureScore: allFindingsStats.postureScore,
          totalPassed: allFindingsStats.totalPassed,
          totalFailed: allFindingsStats.totalFailed,
          statsPerBenchmark: statsPerBenchmark,
          evaluationPerFilename: evaluationsPerFilename,
        };
        return response.ok({
          body,
        });
      } catch (err) {
        return response.customError({ body: { message: 'Unknown error' }, statusCode: 500 });
      }
    }
  );

// const getRunId = (v: any) => v.group_docs.hits.hits?.[0]?.fields['run_id.keyword'][0];

// const AGENT_LOGS_INDEX = `agent_logs`;
// const AGENT_TIMEOUT_IN_MINUTES = 60;

// const getFindingsEsQuery = ({ runIds }: { runIds: string[] }): SearchRequest => ({
//   index: FINDINGS_INDEX,
//   size: 1000,
//   query: { terms: { 'run_id.keyword': runIds } },
// });

// const getAgentLogsEsQuery = (): SearchRequest => ({
//     index: AGENT_LOGS_INDEX,
//     size: 1000,
//     query: {
//       bool: {
//         filter: [
//           { term: { 'event_status.keyword': 'end' } },
//           { term: { 'compliance.keyword': 'k8s cis' } },
//         ],
//       },
//     },
//     aggs: {
//       group: {
//         terms: { field: 'agent.keyword' },
//         aggs: {
//           group_docs: {
//             top_hits: {
//               size: 1,
//               sort: [{ timestamp: { order: 'desc' } }],
//             },
//           },
//         },
//       },
//     },
//     fields: ['run_id.keyword', 'agent.keyword'],
//     _source: false,
//   });

// export const getScoreRoute = (router: SecuritySolutionPluginRouter, logger: Logger): void =>
//   router.get(
//     {
//       path: '/api/csp/score',
//       validate: false,
//     },
//     async (context, _, response) => {
//       try {
//         const esClient = context.core.elasticsearch.client.asCurrentUser;
//         const agentLogs = await esClient.search(getAgentLogsEsQuery());
//         const aggregations = agentLogs.body.aggregations;

//         if (!aggregations) {
//           logger.error(`Missing 'aggregations' in agent logs query response`);
//           return response.notFound();
//         }
//         const buckets = (aggregations.group as Record<string, AggregationsFiltersAggregate>)
//           .buckets;
//         if (!Array.isArray(buckets)) {
//           logger.error(`Missing 'buckets' in agent logs query response`);
//           return response.notFound();
//         }
//         const findings = await esClient.search(
//           getFindingsEsQuery({ runIds: buckets.map(getRunId) })
//         );
//         const passFindings = await esClient.search(getPassFindingsEsQuery());

//         return response.ok({
//           body: {
//             score: passFindings.body.hits.hits.length / findings.body.hits.hits.length,
//             pass: passFindings.body.hits.hits.length,
//             fail: passFindings.body.hits.hits.length - findings.body.hits.hits.length,
//           },
//         });
//       } catch (err) {
//         return response.customError({ body: { message: 'Unknown error' }, statusCode: 500 });
//       }
//     }

//   );
// const getBenchmarksQuery = (): SearchRequest => ({
//   index: FINDINGS_INDEX,
//   size: 0,
//   aggs: {
//     benchmarks: {
//       terms: { field: 'rule.benchmark.keyword' },
//     },
//   },
// });
