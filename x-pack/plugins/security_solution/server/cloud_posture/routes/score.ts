/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable  */

import { ElasticsearchClient, Logger } from 'src/core/server';
import { AggregationsFiltersAggregate, SearchRequest, CountRequest, SearchSort} from '@elastic/elasticsearch/lib/api/types';
import type { SecuritySolutionPluginRouter } from '../../types';

const FINDINGS_INDEX = `kubebeat*`;


const getFindingsEsQuery = (benchmark:string = "*", runId:string): CountRequest => 
{
  if(benchmark == "*"){
    return ({
      index: FINDINGS_INDEX,
      query: {
        bool: {
          filter: [{ term: { 'run_id.keyword': runId } }
          ],
        },
      }
    });
  }
  return({
  index: FINDINGS_INDEX,
  query: {
    bool: {
      filter: [{ term: { 'rule.benchmark.keyword': benchmark } },
              { term: { 'run_id.keyword': runId } }
      ],
    },
  }
});
}

const getPassFindingsEsQuery = (benchmark: string = "*", runId:string): CountRequest => 
{
if(benchmark == "*"){
  return ({
    index: FINDINGS_INDEX,
    query: {
      bool: {
        filter: [{ term: { 'result.evaluation': 'passed' } },
                { term: { 'run_id.keyword': runId } }
        ],
      },
    },
  });
}
return ({
  index: FINDINGS_INDEX,
  query: {
    bool: {
      filter: [
                  { term: { 'result.evaluation': 'passed' } },
                  { term: { 'rule.benchmark.keyword': benchmark } },
                  { term: { 'run_id.keyword': runId } }
                ],

    },
  },
});
}

const prepareScore = (value: number) => (value * 100).toFixed(1)

const getBenchmarksQuery = (): SearchRequest => ({
  index: FINDINGS_INDEX,
  size: 0,
  aggs: {
    benchmarks: {
      terms: { field: "rule.benchmark.keyword" }
    }
  }
});

const getLatestFinding = (): SearchRequest =>({
  index: FINDINGS_INDEX,
  size: 1, 
  sort: { "@timestamp": "desc"},
  query: {
    "match_all": {}
 }
})

const getEvaluationPerFilenameEsQuery = (benchmark: string, runId: string): SearchRequest => ({
    index: FINDINGS_INDEX,
    size: 1000,
    query: {
      bool: {
        filter: [
          { term: { 'result.evaluation': 'passed' } },
                  { term: { 'rule.benchmark.keyword': benchmark } },
                  { term: { 'run_id': runId } }
        ],
      },
    },
    aggs: {
      group: {
        terms: { field: 'resource.filename.keyword' },
      },
    },
    fields: ['run_id', 'resource.filename.keyword'],
    _source: false,
  });

const getScorePerBenchmark = async (esClient: ElasticsearchClient, runId: string) => {
  // const benachmarksQueryResult = await esClient.search(getBenchmarksQuery());
  // console.log(benachmarksQueryResult);
  // const benachmarks1 = benachmarksQueryResult.body.hits.hits?.field
  // const benachmarks1 = (v: any) => v.group_docs.hits.hits?.[0]?.fields['run_id.keyword'][0];
  // @ts-ignore
  // console.log(benachmarksQueryResult.body.aggregations?);
  // const benchmarks = benachmarksQueryResult.body.aggregations?.benachmarks?.buckets?.map((e) => e.key);
  // console.log(benchmarks);
  // @ts-ignore
  const benchmarks = ["CIS Kubernetes"];
  const benchmarkScores = Promise.all(benchmarks.map(async (benchmark) => {
    const benchmarkFindings = await esClient.count(getFindingsEsQuery(benchmark, runId));
    const benchmarkPassFindings = await esClient.count(getPassFindingsEsQuery(benchmark, runId));
    return({
        name: benchmark,
        total: benchmarkFindings.body.count,
        postureScore: prepareScore(benchmarkPassFindings.body.count / benchmarkFindings.body.count),
        totalPassed: benchmarkPassFindings.body.count,
        totalFailed: benchmarkFindings.body.count - benchmarkPassFindings.body.count,
      }
    )
  } ))
  return benchmarkScores;

  };

export const getScoreRoute = (router: SecuritySolutionPluginRouter, logger: Logger): void =>
  router.get(
    {
      path: '/api/csp/score',
      validate: false,
    },

    async (context, _, response) => {
      try {
        const esClient = context.core.elasticsearch.client.asCurrentUser;
        const latestFinding = await esClient.search(getLatestFinding());
        const latestRunId = latestFinding.body.hits.hits[0]?._source.run_id; 
        console.log(latestRunId);
        const findings = await esClient.count(getFindingsEsQuery("*", latestRunId));
        const passFindings = await esClient.count(getPassFindingsEsQuery("*", latestRunId));
        const tmpResults = await esClient.search(getEvaluationPerFilenameEsQuery("CIS Kubernetes", latestRunId));
        // console.log("**************")
        console.log(tmpResults.body.hits.hits);
        console.log(tmpResults.body.aggregations);
        // console.log(tmpResults.body);

        console.log("**************")


        return response.ok({
          body: {
            total: findings.body.count,
            postureScore: prepareScore(passFindings.body.count / findings.body.count),
            totalPassed: passFindings.body.count,
            totalFailed: findings.body.count - passFindings.body.count,
            benchmarks: await getScorePerBenchmark(esClient, latestRunId)
          },
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
