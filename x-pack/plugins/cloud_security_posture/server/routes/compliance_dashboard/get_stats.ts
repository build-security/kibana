/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { ElasticsearchClient } from 'kibana/server';
import { SearchRequest } from '@elastic/elasticsearch/lib/api/types';
import { CSP_KUBEBEAT_INDEX_PATTERN } from '../../../common/constants';
import { CloudPostureStats, Score } from '../../../common/types';

/**
 * @param value value is [0, 1] range
 */
export const roundScore = (value: number): Score => Number((value * 100).toFixed(1));

export const calculatePostureScore = (
  total: number,
  passed: number,
  failed: number
): Score | undefined =>
  passed + failed === 0 || total === undefined ? undefined : roundScore(passed / (passed + failed));

export interface FindingsEvaluationsQueryResult {
  failed_findings: {
    doc_count: number;
  };
  passed_findings: {
    doc_count: number;
  };
}

export const findingsEvaluationAggsQuery = {
  failed_findings: {
    filter: { term: { 'result.evaluation.keyword': 'failed' } },
  },
  passed_findings: {
    filter: { term: { 'result.evaluation.keyword': 'passed' } },
  },
};

export const getEvaluationsQuery = (cycleId: string): SearchRequest => ({
  index: CSP_KUBEBEAT_INDEX_PATTERN,
  query: {
    // bool: {
    //   filter: [{ term: { 'cycle_id.keyword': cycleId } }],
    // },
    match_all: {},
  },
  aggs: findingsEvaluationAggsQuery,
});

export const getStatsFromFindingsEvaluationsAggs = (
  findingsEvaluationsAggs: FindingsEvaluationsQueryResult
): CloudPostureStats['stats'] => {
  const failedFindings = findingsEvaluationsAggs.failed_findings.doc_count;
  const passedFindings = findingsEvaluationsAggs.passed_findings.doc_count;
  const totalFindings = failedFindings + passedFindings;
  const postureScore = calculatePostureScore(totalFindings, passedFindings, failedFindings);
  if (postureScore === undefined) throw new Error("couldn't calculate posture score");

  return {
    totalFailed: failedFindings,
    totalPassed: passedFindings,
    totalFindings,
    postureScore,
  };
};

export const getStats = async (
  esClient: ElasticsearchClient,
  cycleId: string
): Promise<CloudPostureStats['stats']> => {
  const evaluationsQueryResult = await esClient.search<unknown, FindingsEvaluationsQueryResult>(
    getEvaluationsQuery(cycleId)
  );
  const findingsEvaluations = evaluationsQueryResult.body.aggregations;
  if (!findingsEvaluations) throw new Error('missing findings evaluations');

  return getStatsFromFindingsEvaluationsAggs(findingsEvaluations);
};
