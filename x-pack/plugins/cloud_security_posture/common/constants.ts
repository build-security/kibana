/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
<<<<<<< HEAD
export const CSP_KUBEBEAT_INDEX_NAME = 'logs-k8s_cis*';
export const CSP_FINDINGS_INDEX_NAME = 'findings';
export const STATS_ROUTE_PATH = '/api/csp/stats';
export const FINDINGS_ROUTE_PATH = '/api/csp/finding';
export const AGENT_LOGS_INDEX = 'logs-k8s_cis*';
=======
export const CSP_KUBEBEAT_INDEX_NAME = 'kubebeat*';
export const CSP_FINDINGS_INDEX_NAME = 'findings';
export const STATS_ROUTE_PATH = '/api/csp/stats';
export const FINDINGS_ROUTE_PATH = '/api/csp/finding';
export const AGENT_LOGS_INDEX = 'kubebeat*';
>>>>>>> 95855fa7343125d097f00abedc1b9b6ed4cf1164
export const RULE_PASSED = `passed`;
export const RULE_FAILED = `failed`;
