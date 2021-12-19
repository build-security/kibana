/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { IRouter } from 'kibana/server';
import { CSPRule } from '../../../common/types';

export const loadRulesRoute = (router: IRouter): void =>
  router.get(
    {
      path: '/api/csp/rules/load',
      validate: false,
    },
    async (context, _, response) => {
      try {
        const savedObjectsClient = context.core.savedObjects.client;
        const cspRules: CSPRule[] = [
          {
            id: '01',
            name: 'Check Some Kube things',
            description: 'Some Rule',
            rationale: 'prevent bad things from happening',
            impact: 'None',
            default_value: 'set to false by default',
            remediation: "Fix the stuff that's broken",
            benchmark: { name: 'CIS Kubernetes', version: 'v1.0.0' },
            tags: ['1.1.1', 'CIS', 'Kubernetes'],
            enabled: true,
          },
          {
            id: '02',
            name: 'Check Some other Kube things',
            description: 'Some Rule',
            rationale: 'prevent bad things from happening',
            impact: 'None',
            default_value: 'set to false by default',
            remediation: "Fix the stuff that's broken",
            benchmark: { name: 'CIS Kubernetes', version: 'v1.0.0' },
            tags: ['1.1.2', 'CIS', 'Kubernetes'],
            enabled: false,
          },
        ];

        // todo: check if not exist already before creating
        const type = 'csp_rule';
        const result = await savedObjectsClient.bulkCreate(
          [
            {
              type,
              id: '001',
              attributes: cspRules[0],
            },
            {
              type,
              id: '002',
              attributes: cspRules[1],
            },
          ],
          { overwrite: true }
        );

        return response.ok({
          body: result,
        });
      } catch (err) {
        // TODO - validate err object and parse
        return response.customError({ body: { message: 'Unknown error' }, statusCode: 500 });
      }
    }
  );
