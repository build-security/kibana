/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { transformError } from '@kbn/securitysolution-es-utils';
import type { ElasticsearchClient, Logger } from '../../../../src/core/server';
import { LATEST_FINDINGS_INDEX_PATTERN } from '../common/constants';

export const initializeCspLatestFindingsIndex = async (
  esClient: ElasticsearchClient,
  logger: Logger
) => {
  try {
    const isExists = await esClient.indices.existsAlias({ name: LATEST_FINDINGS_INDEX_PATTERN });

    if (!isExists.body) {
      await esClient.indices.create({
        index: LATEST_FINDINGS_INDEX_PATTERN,
        settings: {
          //   is_write_index: true,
          hidden: true,
        },
        // op_type: 'create',
        // aliases: {
        //   '.csp-findings-latest': {
        //     is_write_index: true,
        //     is_hidden: true,
        //   },
        // },
      });
    }
  } catch (err) {
    const error = transformError(err);
    logger.error(`Failed to create ${LATEST_FINDINGS_INDEX_PATTERN}`);
    logger.error(error.message);
  }
};

// async createInitialIndexIfNotExists(): Promise<void> {
//     const exists = await this.esContext.esAdapter.doesAliasExist(this.esContext.esNames.alias);
//     if (!exists) {
//       await this.esContext.esAdapter.createIndex(this.esContext.esNames.initialIndex, {
//         aliases: {
//           [this.esContext.esNames.alias]: {
//             is_write_index: true,
//             is_hidden: true,
//           },
//         },
//       });
//     }
//   }
