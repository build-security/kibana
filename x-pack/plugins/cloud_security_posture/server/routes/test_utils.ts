/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
// eslint-disable-next-line @kbn/eslint/no-restricted-paths
import { ElasticsearchClientMock } from 'src/core/server/elasticsearch/client/mocks';
// eslint-disable-next-line @kbn/eslint/no-restricted-paths
import { KibanaRequest, KibanaResponseFactory } from 'src/core/server/index';
import { MethodKeysOf } from '@kbn/utility-types';
import { httpServerMock } from 'src/core/server/mocks';
import { identity } from 'lodash';

export const getMockContext = (mockEsClient: ElasticsearchClientMock): KibanaRequest => {
  return {
    core: {
      elasticsearch: {
        client: { asCurrentUser: mockEsClient },
      },
    },
  } as unknown as KibanaRequest;
};

export const getMockResponseFactory = (
  resToMock: Array<MethodKeysOf<KibanaResponseFactory>> = []
) => {
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
