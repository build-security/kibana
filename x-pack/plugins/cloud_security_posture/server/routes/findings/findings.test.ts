/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
// eslint-disable-next-line @kbn/eslint/no-restricted-paths
import { elasticsearchClientMock } from 'src/core/server/elasticsearch/client/mocks';
// eslint-disable-next-line @kbn/eslint/no-restricted-paths
import { KibanaRequest } from 'src/core/server/http/router/request';

import { httpServiceMock } from 'src/core/server/mocks';
import { getMockCycleIdsResponse } from './get_latest_cycle.test';
import {
  defineFindingsIndexRoute,
  findingsInputSchema,
  DEFAULT_FINDINGS_PER_PAGE,
} from './findings';
import { getMockContext, getMockResponseFactory } from '../test_utils';

const mockEsClient = elasticsearchClientMock.createClusterClient().asScoped().asInternalUser;

afterEach(() => {
  mockEsClient.search.mockClear();
});

describe('test input schema ', () => {
  it('expect to find default values', async () => {
    const validatedQuery = findingsInputSchema.validate({});
    expect(validatedQuery).toMatchObject({
      page: 1,
      per_page: DEFAULT_FINDINGS_PER_PAGE,
      sort_order: expect.stringMatching('desc' || 'asc'),
    });
  });
  it('number params to be positive', async () => {
    expect(() => {
      findingsInputSchema.validate({ page: -2 }); // expext to get boolean
    }).toThrow();

    expect(() => {
      findingsInputSchema.validate({ per_page: -2 }); // expext to get boolean
    }).toThrow();
  });
  it('expect latest_run filter to get only boolean', async () => {
    expect(() => {
      findingsInputSchema.validate({ latest_cycle: 'some string' }); // expext to get boolean
    }).toThrow();

    expect(() => {
      findingsInputSchema.validate({ latest_cycle: true });
    }).toBeDefined();
  });
});

describe('findings API', () => {
  const router = httpServiceMock.createRouter();
  defineFindingsIndexRoute(router);
  const [config, handler] = router.get.mock.calls[0];
  const mockContext = getMockContext(mockEsClient);
  it('validate API routh', async () => {
    expect(config.path).toMatchInlineSnapshot(`"/api/csp/findings"`);
  });

  it('test query building', async () => {
    mockEsClient.search.mockResolvedValueOnce(
      // @ts-expect-error @elastic/elasticsearch Aggregate only allows unknown values
      getMockCycleIdsResponse(['randomId1'])
    );

    const [context, req, res] = [
      mockContext,
      {
        query: { latest_cycle: true },
      } as KibanaRequest,
      getMockResponseFactory(['noContent']),
    ];

    await handler(context, req, res);
    // "1" for the second call argument "0" is the first
    const handlerArgs = mockEsClient.search.mock.calls[1][0];
    const expected = { query: { bool: { filter: [{ term: { 'run_id.keyword': 'randomId1' } }] } } };
    // console.log(temp.query.bool.filter[0].term);
    expect(handlerArgs).toMatchObject(expected);
  });

  it('test sort by field', async () => {
    mockEsClient.search.mockResolvedValueOnce(
      // @ts-expect-error @elastic/elasticsearch Aggregate only allows unknown values
      getMockCycleIdsResponse(['randomId1'])
    );

    const [context, req, res] = [
      mockContext,
      {
        query: {
          sort_field: 'agent.id',
          sort_order: 'asc',
        },
      } as KibanaRequest,
      getMockResponseFactory(['noContent']),
    ];

    await handler(context, req, res);
    // "0" the first call (getLatestCycleIds()) in the api not in use, so the second become first
    const handlerArgs = mockEsClient.search.mock.calls[0][0];
    const expected = {
      sort: [{ 'agent.id': 'asc' }],
    };
    expect(handlerArgs).toMatchObject(expected);
  });

  it('test pagination', async () => {
    mockEsClient.search.mockResolvedValueOnce(
      // @ts-expect-error @elastic/elasticsearch Aggregate only allows unknown values
      getMockCycleIdsResponse(['randomId1'])
    );

    const [context, req, res] = [
      mockContext,
      {
        query: {
          per_page: 10,
          page: 3,
        },
      } as KibanaRequest,
      getMockResponseFactory(['noContent']),
    ];

    await handler(context, req, res);
    // "0" the first call (getLatestCycleIds()) in the api not in use, so the second become first
    const handlerArgs = mockEsClient.search.mock.calls[0][0];
    const expected = {
      from: 21,
      size: 10,
    };
    expect(handlerArgs).toMatchObject(expected);
  });

  it('test getting speific fields from findings index', async () => {
    mockEsClient.search.mockResolvedValueOnce(
      // @ts-expect-error @elastic/elasticsearch Aggregate only allows unknown values
      getMockCycleIdsResponse(['randomId1'])
    );

    const [context, req, res] = [
      mockContext,
      {
        query: {
          fields: 'field1, field2, field3',
        },
      } as KibanaRequest,
      getMockResponseFactory(['noContent']),
    ];

    await handler(context, req, res);
    // "0" the first call (getLatestCycleIds()) in the api not in use, so the second become first
    const handlerArgs = mockEsClient.search.mock.calls[0][0];
    const expected = {
      _source: ['field1, field2, field3'],
    };
    expect(handlerArgs).toMatchObject(expected);
  });
});
