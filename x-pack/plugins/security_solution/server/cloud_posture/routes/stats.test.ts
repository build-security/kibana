/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
// eslint-disable-next-line @kbn/eslint/no-restricted-paths
import { elasticsearchClientMock } from '../../../../../../src/core/server/elasticsearch/client/mocks';
import { getBenchmarks, getAllFindingsStats, roundScore } from './score';

describe('benchmark mapping', () => {
  it('getBenchmarks - takes esClient and returned unique bencmarks array ', async () => {
    const mockEsClient = elasticsearchClientMock.createClusterClient().asScoped().asInternalUser;
    mockEsClient.search.mockReturnValue(
      // @ts-expect-error @elastic/elasticsearch Aggregate only allows unknown values
      elasticsearchClientMock.createSuccessTransportRequestPromise({
        aggregations: {
          benchmarks: {
            doc_count_error_upper_bound: 0,
            sum_other_doc_count: 0,
            buckets: [
              { key: 'CIS Kubernetes', doc_count: 248514 },
              { key: 'GDPR', doc_count: 248514 },
            ],
          },
        },
      })
    );

    const benchmarks = await getBenchmarks(mockEsClient);
    // expect(mockEsClient.search).toHaveBeenCalledTimes(1);
    expect(benchmarks).toEqual(['CIS Kubernetes', 'GDPR']);
  });
});

describe('testing round score', () => {
  it('take dcimel and exept the roundScore will return it with one digit after the dot ', async () => {
    const score = roundScore(0.85245);
    expect(score).toEqual(85.2);
  });
});
describe('general score', () => {
  it('getAllFindingsStats ', async () => {
    const mockEsClient = elasticsearchClientMock.createClusterClient().asScoped().asInternalUser;
    mockEsClient.count.mockReturnValueOnce(
      elasticsearchClientMock.createSuccessTransportRequestPromise({ count: 10 })
    );
    mockEsClient.count.mockReturnValueOnce(
      elasticsearchClientMock.createSuccessTransportRequestPromise({ count: 3 })
    );
    mockEsClient.count.mockReturnValueOnce(
      elasticsearchClientMock.createSuccessTransportRequestPromise({ count: 7 })
    );
    const generalScore = await getAllFindingsStats(mockEsClient, 'randomCycleId');
    expect(generalScore).toEqual({
      name: 'general',
      postureScore: 30,
      totalFailed: 7,
      totalFindings: 10,
      totalPassed: 3,
    });
  });
});
