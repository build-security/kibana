/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Storage } from '../../../../../src/plugins/kibana_utils/public';
import { getTimelinesInStorageByIds } from '../timelines/containers/local_storage';
import { TimelineIdLiteral, TimelineId } from '../../common/types/timeline';
import { routes } from './routes';
import { SecuritySubPlugin } from '../app/types';

export const DETECTIONS_TIMELINE_IDS: TimelineIdLiteral[] = [
  TimelineId.detectionsRulesDetailsPage,
  TimelineId.detectionsPage,
];

export class CloudPosture {
  public setup() {}

  public start(storage: Storage, core: any, plugins: any): SecuritySubPlugin {
    // public start(storage: Storage, core: CoreStart, plugins: StartPlugins): SecuritySubPlugin {
    return {
      storageTimelines: {
        timelineById: getTimelinesInStorageByIds(storage, DETECTIONS_TIMELINE_IDS),
      },
      routes,
    };
  }
}
