/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import {
  elasticsearchClientMock,
  ElasticsearchClientMock,
  // eslint-disable-next-line @kbn/eslint/no-restricted-paths
} from 'src/core/server/elasticsearch/client/mocks';
// eslint-disable-next-line @kbn/eslint/no-restricted-paths
import { KibanaRequest } from 'src/core/server/http/router/request';
import { httpServerMock, httpServiceMock } from 'src/core/server/mocks';
import {
  defineFindingsIndexRoute,
  findingsInputSchema,
  DEFAULT_FINDINGS_PER_PAGE,
} from './findings';

export const getMockCspContext = (mockEsClient: ElasticsearchClientMock): KibanaRequest => {
  return {
    core: {
      elasticsearch: {
        client: { asCurrentUser: mockEsClient },
      },
    },
  } as unknown as KibanaRequest;
};

describe('findings API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('validate the API route path', async () => {
    const router = httpServiceMock.createRouter();
    defineFindingsIndexRoute(router);

    const [config, _] = router.get.mock.calls[0];

    expect(config.path).toEqual('/api/csp/findings');
  });

  describe('test input schema', () => {
    it('expect to find default values', async () => {
      const validatedQuery = findingsInputSchema.validate({});

      expect(validatedQuery).toMatchObject({
        page: 1,
        per_page: DEFAULT_FINDINGS_PER_PAGE,
        sort_order: expect.stringMatching('desc'),
      });
    });

    it('should throw when page field is not a positive integer', async () => {
      expect(() => {
        findingsInputSchema.validate({ page: -2 });
      }).toThrow();
    });

    it('should throw when per_page field is not a positive integer', async () => {
      expect(() => {
        findingsInputSchema.validate({ per_page: -2 });
      }).toThrow();
    });

    it('should throw when latest_run is not a boolean', async () => {
      expect(() => {
        findingsInputSchema.validate({ latest_cycle: 'some string' }); // expects to get boolean
      }).toThrow();
    });

    it('should not throw when latest_run is a boolean', async () => {
      expect(() => {
        findingsInputSchema.validate({ latest_cycle: true });
      }).toBeDefined();
    });
  });

  describe('test query building', () => {
    it('takes cycle_id and validate the filter was built right', async () => {
      const mockEsClient = elasticsearchClientMock.createClusterClient().asScoped().asInternalUser;
      const router = httpServiceMock.createRouter();
      defineFindingsIndexRoute(router);

      const [_, handler] = router.get.mock.calls[0];
      const mockContext = getMockCspContext(mockEsClient);
      const mockResponse = httpServerMock.createResponseFactory();
      const mockRequest = httpServerMock.createKibanaRequest({
        query: { latest_cycle: true },
      });

      mockEsClient.search.mockResolvedValueOnce(
        // @ts-expect-error @elastic/elasticsearch Aggregate only allows unknown values
        elasticsearchClientMock.createSuccessTransportRequestPromise({
          aggregations: {
            group: {
              buckets: [
                {
                  group_docs: {
                    hits: {
                      hits: [{ fields: { 'run_id.keyword': ['randomId1'] } }],
                    },
                  },
                },
              ],
            },
          },
        })
      );

      const [context, req, res] = [mockContext, mockRequest, mockResponse];

      await handler(context, req, res);

      expect(mockEsClient.search.mock.calls).toHaveLength(2);

      // "1" for the second call argument "0" is the first
      const handlerArgs = mockEsClient.search.mock.calls[1][0];

      expect(handlerArgs).toMatchObject({
        query: {
          bool: {
            filter: [{ term: { 'run_id.keyword': 'randomId1' } }],
          },
        },
      });
    });

    it('validate that default sort is timestamp desc', async () => {
      const mockEsClient = elasticsearchClientMock.createClusterClient().asScoped().asInternalUser;
      const router = httpServiceMock.createRouter();
      defineFindingsIndexRoute(router);
      const [_, handler] = router.get.mock.calls[0];
      const mockContext = getMockCspContext(mockEsClient);
      const mockResponse = httpServerMock.createResponseFactory();
      const mockRequest = httpServerMock.createKibanaRequest({
        query: {
          sort_order: 'desc',
        },
      });

      const [context, req, res] = [mockContext, mockRequest, mockResponse];

      await handler(context, req, res);

      // "0" the first call (getLatestCycleIds()) in the api not in use, so the second become first
      const handlerArgs = mockEsClient.search.mock.calls[0][0];

      expect(handlerArgs).toMatchObject({
        sort: [{ '@timestamp': { order: 'desc' } }],
      });
    });

    it('should build sort request by `sort_field` and `sort_order` - asc', async () => {
      const mockEsClient = elasticsearchClientMock.createClusterClient().asScoped().asInternalUser;
      const router = httpServiceMock.createRouter();
      defineFindingsIndexRoute(router);
      const [_, handler] = router.get.mock.calls[0];
      const mockContext = getMockCspContext(mockEsClient);
      const mockResponse = httpServerMock.createResponseFactory();
      const mockRequest = httpServerMock.createKibanaRequest({
        query: {
          sort_field: 'agent.id',
          sort_order: 'asc',
        },
      });

      const [context, req, res] = [mockContext, mockRequest, mockResponse];

      await handler(context, req, res);

      // "0" the first call (getLatestCycleIds()) in the api not in use, so the second become first
      const handlerArgs = mockEsClient.search.mock.calls[0][0];

      expect(handlerArgs).toMatchObject({
        sort: [{ 'agent.id': 'asc' }],
      });
    });

    it('should build sort request by `sort_field` and `sort_order` - desc', async () => {
      const mockEsClient = elasticsearchClientMock.createClusterClient().asScoped().asInternalUser;
      const router = httpServiceMock.createRouter();
      defineFindingsIndexRoute(router);
      const [_, handler] = router.get.mock.calls[0];
      const mockContext = getMockCspContext(mockEsClient);
      const mockResponse = httpServerMock.createResponseFactory();
      const mockRequest = httpServerMock.createKibanaRequest({
        query: {
          sort_field: 'agent.id',
          sort_order: 'desc',
        },
      });

      const [context, req, res] = [mockContext, mockRequest, mockResponse];

      await handler(context, req, res);

      // "0" the first call (getLatestCycleIds()) in the api not in use, so the second become first
      const handlerArgs = mockEsClient.search.mock.calls[0][0];

      expect(handlerArgs).toMatchObject({
        sort: [{ 'agent.id': 'desc' }],
      });
    });

    it('takes `page_number` and `per_page` validate that the requested selected page was called', async () => {
      const mockEsClient = elasticsearchClientMock.createClusterClient().asScoped().asInternalUser;
      const router = httpServiceMock.createRouter();
      defineFindingsIndexRoute(router);
      const [_, handler] = router.get.mock.calls[0];
      const mockContext = getMockCspContext(mockEsClient);
      const mockResponse = httpServerMock.createResponseFactory();
      const mockRequest = httpServerMock.createKibanaRequest({
        query: {
          per_page: 10,
          page: 3,
        },
      });

      const [context, req, res] = [mockContext, mockRequest, mockResponse];
      await handler(context, req, res);

      // "0" the first call (getLatestCycleIds()) in the api not in use, so the second become first
      const handlerArgs = mockEsClient.search.mock.calls[0][0];

      expect(handlerArgs).toMatchObject({
        from: 21,
        size: 10,
      });
    });

    it('takes specific fields and validating the request for getting them', async () => {
      const mockEsClient = elasticsearchClientMock.createClusterClient().asScoped().asInternalUser;
      const router = httpServiceMock.createRouter();
      defineFindingsIndexRoute(router);
      const [_, handler] = router.get.mock.calls[0];

      const mockContext = getMockCspContext(mockEsClient);
      const mockResponse = httpServerMock.createResponseFactory();
      const mockRequest = httpServerMock.createKibanaRequest({
        query: {
          fields: 'field1, field2, field3',
        },
      });

      const [context, req, res] = [mockContext, mockRequest, mockResponse];

      await handler(context, req, res);

      // "0" the first call (getLatestCycleIds()) in the api not in use, so the second become first
      const handlerArgs = mockEsClient.search.mock.calls[0][0];

      expect(handlerArgs).toMatchObject({
        _source: ['field1, field2, field3'],
      });
    });
  });
});
