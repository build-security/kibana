/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
/* eslint-disable prefer-template */
/* eslint-disable react/display-name */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */

import React from 'react';
import { RouteProps } from 'react-router-dom';
import { TrackApplicationView } from '../../../../../src/plugins/usage_collection/public';
import { SecurityPageName } from '../../common/constants';

import { Dashboard } from './pages/dashboard';
import { Alerts } from './pages/alerts';
import { Rules } from './pages/rules';
import { Findings } from './pages/findings';

export const routes: RouteProps[] = [
  {
    path: '/cloud_posture_dashboard',
    render: Dashboard,
  },
  {
    path: '/cloud_posture_rules',
    render: Rules,
  },
  {
    path: '/cloud_posture_alerts',
    render: Alerts,
  },
  {
    path: '/cloud_posture_findings',
    render: Findings,
  },
];
