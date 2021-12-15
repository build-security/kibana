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

export const createBackwardsCompatibilityIndexTemplate = (version: number) => {
  const backwardsCompatibilityMapping = [indexTemplate]
    .filter((mapping) => version <= mapping.maxVersion && version >= mapping.minVersion)
    .map((mapping) => mapping.mappings);
  if (backwardsCompatibilityMapping.length) {
    return { mappings: backwardsCompatibilityMapping[0] };
  }
};

async function doesIndexTemplateExist(esClient: ElasticsearchClient, templateName: string) {
  try {
    return await esClient.indices.existsIndexTemplate({ name: templateName }).body;
  } catch (err) {
    throw new Error(`error checking existence of index template: ${err.message}`);
  }
}

export async function createIndexTemplate(esClient: ElasticsearchClient) {
  try {
    const mappings = createBackwardsCompatibilityIndexTemplate(VERSION)?.mappings;
    if (!!mappings) {
      await esClient.indices.putIndexTemplate({
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
    }
  } catch (err) {
    // The error message doesn't have a type attribute we can look to guarantee it's due
    // to the template already existing (only long message) so we'll check ourselves to see
    // if the template now exists. This scenario would happen if you startup multiple Kibana
    // instances at the same time.
    const existsNow = await doesIndexTemplateExist(esClient, CSP_KUBEBEAT_INDEX_NAME);
    if (!existsNow) {
      throw new Error(`error creating index template: ${err.message}`);
    }
  }
}

