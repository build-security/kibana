/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import { RouteProps } from 'react-router-dom';
import { getAllNavigationItems } from '../common/navigation/constants';
import * as pages from '../pages';

const allNavigationItems = getAllNavigationItems();

export const routes: readonly RouteProps[] = [
  { path: allNavigationItems.findings.path, component: pages.Findings },
  { path: allNavigationItems.dashboard.path, component: pages.ComplianceDashboard },
  { path: allNavigationItems.benchmarks.path, component: pages.Benchmarks },
];
