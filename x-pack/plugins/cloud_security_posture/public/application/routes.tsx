/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import { RouteProps } from 'react-router-dom';
<<<<<<< HEAD
import { allNavigationItems } from '../common/navigation/constants';
import * as pages from '../pages';

export const routes: readonly RouteProps[] = [
  { path: allNavigationItems.findings.path, component: pages.Findings },
  { path: allNavigationItems.dashboard.path, component: pages.ComplianceDashboard },
=======
import { CSP_DASHBOARD_PATH, CSP_FINDINGS_PATH } from '../common/navigation/constants';
import * as pages from '../pages';

export const routes: readonly RouteProps[] = [
  { path: CSP_FINDINGS_PATH, component: pages.Findings },
  { path: CSP_DASHBOARD_PATH, component: pages.ComplianceDashboard },
>>>>>>> 95855fa7343125d097f00abedc1b9b6ed4cf1164
];
