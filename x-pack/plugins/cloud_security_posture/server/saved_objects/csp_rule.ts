/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { SavedObjectsType } from 'src/core/server';

export const cspRule: SavedObjectsType = {
  name: 'csp_rule',
  hidden: false,
  namespaceType: 'multiple-isolated', // todo: add to ticket
  mappings: {
    dynamic: false,
    properties: {
      id: {
        type: 'text',
      },
      name: {
        type: 'text',
      },
      description: {
        type: 'text',
      },
      rationale: {
        type: 'text',
      },
      impact: {
        type: 'text',
      },
      default_value: {
        type: 'text',
      },
      benchmark: {
        type: 'object',
      },
      tags: {
        type: 'text',
      },
      enabled: {
        type: 'boolean',
      },
    },
  },
  management: {
    importableAndExportable: true,
    getTitle(savedObject) {
      return `[CSP Rule] ${savedObject.attributes.name}`;
    },
  },
  // migrations: {
  //   '1.0.0': migratedashboardVisualizationToV1,
  // },
};
