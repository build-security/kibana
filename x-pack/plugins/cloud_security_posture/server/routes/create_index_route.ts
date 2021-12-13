/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { IRouter } from 'kibana/server';
import { CREATE_FINDING_INDEX_URL, CSP_KUBEBEAT_INDEX } from '../../common/constants';

export const defineCreateIndexRoute = (router: IRouter) => {
  router.post(
    {
      path: CREATE_FINDING_INDEX_URL,
      validate: false,
    },
    async (context, _, response) => {
      const esClient = context.core.elasticsearch.client.asInternalUser;
      try {
        // const body = getTemplate();
        await esClient.indices.putIndexTemplate({
          name: 'lowercases',
          index_patterns: 'banana*',
          template: {
            mappings: {
              properties: {
                rule: {
                  properties: {
                    benchmark: {
                      type: 'keyword',
                    },
                  },
                },
              },
            },
          },
        });

        //   allow_no_indices: true,
        return response.ok({ body: { acknowledged: true } });
      } catch (err) {
        return response.customError({
          body: { message: err },
          statusCode: 500,
        });
        // const error = transformError(err);
        // return siemResponse.error({
        //   body: error.message,
        //   statusCode: error.statusCode,
        // });
      }
    }
  );
};

export const getTemplate = () => {
  const template = {
    // index_patterns: [`kubebeat-*`],
    template: {
      mappings: {
        dynamic: false,
        properties: {
          '@timestamp': {
            type: 'date',
          },
          rule: {
            properties: {
              benchmark: {
                type: 'text',
                fields: {
                  keyword: {
                    type: 'keyword',
                    ignore_above: 256,
                  },
                },
              },
            },
          },
          result: {
            properties: {
              evaluation: {
                type: 'text',
                fields: {
                  keyword: {
                    type: 'keyword',
                    ignore_above: 256,
                  },
                },
              },
            },
          },
          run_id: {
            type: 'text',
            fields: {
              keyword: {
                type: 'keyword',
                ignore_above: 256,
              },
            },
          },
          resource: {
            properties: {
              filename: {
                type: 'text',
                fields: {
                  keyword: {
                    type: 'keyword',
                    ignore_above: 256,
                  },
                },
              },
            },
          },
        },
      },
    },
  };
  return template;
};
