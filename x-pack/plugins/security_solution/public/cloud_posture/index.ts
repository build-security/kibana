/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { Storage } from '../../../../../src/plugins/kibana_utils/public';
import { TimelineIdLiteral, TimelineId } from '../../common/types/timeline';
import { SecuritySubPluginWithStore } from '../app/types';
import { getTimelinesInStorageByIds } from '../timelines/containers/local_storage';
import { routes } from './routes';

export class CloudPosture {
  public setup() {}

  public start(storage: Storage) {
    return {
      routes,
      storageTimelines: {},
    };
  }
}
