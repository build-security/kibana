/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { ElasticsearchClient } from 'kibana/server';
import {
  AggregationsMultiBucketAggregateBase as Aggregation,
  SearchRequest,
} from '@elastic/elasticsearch/lib/api/types';
import { CloudPostureStats } from '../../../common/types';
import { KeyDocCount } from './compliance_dashboard';
import { CSP_KUBEBEAT_INDEX_PATTERN } from '../../../common/constants';

export interface ResourceTypeQueryResult {
  aggs_by_resource_type: Aggregation<ResourceTypeBucket>;
}

export interface ResourceTypeBucket extends KeyDocCount {
  failed_findings: {
    doc_count: number;
  };
  passed_findings: {
    doc_count: number;
  };
}

export const resourceTypeAggQuery = {
  aggs_by_resource_type: {
    terms: {
      field: 'resource.type.keyword',
    },
    aggs: {
      failed_findings: {
        filter: { term: { 'result.evaluation.keyword': 'failed' } },
      },
      passed_findings: {
        filter: { term: { 'result.evaluation.keyword': 'passed' } },
      },
    },
  },
};

export const getRisksEsQuery = (cycleId: string): SearchRequest => ({
  index: CSP_KUBEBEAT_INDEX_PATTERN,
  size: 0,
  query: {
    match_all: {},
    // bool: {
    //   filter: [{ term: { 'cycle_id.keyword': cycleId } }],
    // },
  },
  aggs: resourceTypeAggQuery,
});

export const getResourceTypeFromAggs = (
  queryResult: ResourceTypeBucket[]
): CloudPostureStats['resourcesTypes'] =>
  queryResult.map((bucket) => ({
    name: bucket.key,
    totalFindings: bucket.doc_count,
    totalFailed: bucket.failed_findings.doc_count || 0,
    totalPassed: bucket.passed_findings.doc_count || 0,
  }));

export const getResourcesTypes = async (
  esClient: ElasticsearchClient,
  cycleId: string
): Promise<CloudPostureStats['resourcesTypes']> => {
  const resourceTypesQueryResult = await esClient.search<unknown, ResourceTypeQueryResult>(
    getRisksEsQuery(cycleId)
  );

  const resourceTypes = resourceTypesQueryResult.body.aggregations?.aggs_by_resource_type.buckets;
  if (!Array.isArray(resourceTypes)) throw new Error('missing resources types buckets');

  return getResourceTypeFromAggs(resourceTypes);
};
