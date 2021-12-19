/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { IRouter } from 'kibana/server';

export const findRulesRoute = (router: IRouter): void =>
  router.get(
    {
      path: '/api/csp/rules/find',
      validate: false, // todo: add validation
    },
    async (context, request, response) => {
      try {
        const savedObjectsClient = context.core.savedObjects.client;

        const result = await savedObjectsClient.find({
          type: 'csp_rule',
          page: 1,
          perPage: 20,
        });

        return response.ok({
          body: result,
        });
      } catch (err) {
        // TODO - validate err object and parse
        return response.customError({ body: { message: 'Unknown error' }, statusCode: 500 });
      }
    }
  );
