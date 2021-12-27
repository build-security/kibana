/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
// eslint-disable-next-line @kbn/eslint/no-restricted-paths
import { elasticsearchClientMock } from 'src/core/server/elasticsearch/client/mocks';
// eslint-disable-next-line @kbn/eslint/no-restricted-paths
import { KibanaResponseFactory, RequestHandlerContext } from 'src/core/server/index';
// eslint-disable-next-line @kbn/eslint/no-restricted-paths
import { KibanaRequest } from 'src/core/server/http/router/request';

import { httpServerMock, httpServiceMock, coreMock } from 'src/core/server/mocks';
import {
  defineFindingsIndexRoute,
  findingsInputSchema,
  DEFAULT_FINDINGS_PER_PAGE,
} from './findings';
import { getLatestCycleIds } from './get_latest_cycle_ids';
import { MethodKeysOf } from '@kbn/utility-types';
import { identity } from 'lodash';
import { number } from 'joi';
const mockEsClient = elasticsearchClientMock.createClusterClient().asScoped().asInternalUser;

// describe('test input schema ', () => {
//   it('expect to find default values', async () => {
//     const validatedQuery = findingsInputSchema.validate({});
//     expect(validatedQuery).toMatchObject({
//       page: 1,
//       per_page: DEFAULT_FINDINGS_PER_PAGE,
//       sort_order: expect.stringMatching('desc' || 'asc'),
//     });
//   });
//   it('number params to be positive', async () => {
//     expect(() => {
//       findingsInputSchema.validate({ page: -2 }); // expext to get boolean
//     }).toThrow();

//     expect(() => {
//       findingsInputSchema.validate({ per_page: -2 }); // expext to get boolean
//     }).toThrow();
//   });
//   it('expect latest_run filter to get only boolean', async () => {
//     expect(() => {
//       findingsInputSchema.validate({ latest_cycle: 'some string' }); // expext to get boolean
//     }).toThrow();

//     expect(() => {
//       findingsInputSchema.validate({ latest_cycle: true });
//     }).toBeDefined();
//   });
// });

describe('api', () => {
  it('expect latest_run filter to be boolean', async () => {
    const router = httpServiceMock.createRouter();
    await mockEsClient.search.mockResolvedValueOnce(
      // @ts-expect-error @elastic/elasticsearch Aggregate only allows unknown values
      elasticsearchClientMock.createSuccessTransportRequestPromise({
        aggregations: {
          group: {
            buckets: [{}],
          },
        },
      })
    );

    defineFindingsIndexRoute(router);
    const [config, handler] = router.get.mock.calls[0];
    const mockContext = {
      core: {
        elasticsearch: {
          client: { asCurrentUser: mockEsClient },
        },
      },
    };
    // expect(config.path).toMatchInlineSnapshot(`"/api/csp/findings"`);
    console.log(config.path);
    console.log(config.validate);
    const [context, req, res] = [
      { core: mockContext.core } as unknown as RequestHandlerContext,
      {
        query: {},
      } as KibanaRequest,
      mockResponseFactory(['noContent']),
    ];

    const response = await handler(context, req, res);
  });
});

export const mockResponseFactory = (resToMock: Array<MethodKeysOf<KibanaResponseFactory>> = []) => {
  const factory: jest.Mocked<KibanaResponseFactory> = httpServerMock.createResponseFactory();
  resToMock.forEach((key: string) => {
    if (key in factory) {
      Object.defineProperty(factory, key, {
        value: jest.fn(identity),
      });
    }
  });
  return factory as unknown as KibanaResponseFactory;
};
