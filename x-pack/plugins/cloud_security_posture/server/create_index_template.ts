/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import { ElasticsearchClient } from 'src/core/server';
import { CSP_KUBEBEAT_INDEX_PATTERN, CSP_KUBEBEAT_INDEX_NAME } from '../common/constants';
import indexTemplate from './mapping.json';

const VERSION = 0.1; // TODO: get current agent version

export type Status = true | false | 'exists' | undefined;

export const createBackwardsCompatibilityIndexTemplate = (version: number) => {
  const backwardsCompatibilityMapping = [indexTemplate]
    .filter((mapping) => version <= mapping.maxVersion && version >= mapping.minVersion)
    .map((mapping) => mapping.mappings);
  if (backwardsCompatibilityMapping.length) {
    return { mappings: backwardsCompatibilityMapping[0] };
  }
};

export const doesIndexTemplateExist = async (
  esClient: ElasticsearchClient,
  templateName: string
) => {
  try {
    const isExisting = await await esClient.indices.existsIndexTemplate({ name: templateName });
    return isExisting.body;
  } catch (err) {
    throw new Error(`error checking existence of index template: ${err.message}`);
  }
};

export const createFindingsIndexTemplate = async (
  esClient: ElasticsearchClient
): Promise<Status> => {
  try {
    const isExisting = await doesIndexTemplateExist(esClient, CSP_KUBEBEAT_INDEX_NAME);
    if (isExisting === true) return 'exists';

    const mappings = createBackwardsCompatibilityIndexTemplate(VERSION)?.mappings;
    if (!!mappings) {
      const response = await esClient.indices.putIndexTemplate({
        name: CSP_KUBEBEAT_INDEX_NAME,
        index_patterns: CSP_KUBEBEAT_INDEX_PATTERN,
        _meta: {
          managed: true,
        },
        priority: 500,
        create: true,
        template: {
          mappings,
        },
      });
      return response.body.acknowledged;
    }
    return false;
  } catch (err) {
    // TODO: error handling
    // TODO: logger
    return false;
  }
};
