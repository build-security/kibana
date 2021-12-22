/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

export const CSP_KUBEBEAT_INDEX_PATTERN = 'kubebeat*';
export const CSP_KUBEBEAT_INDEX_NAME = 'findings';
export const STATS_ROUTH_PATH = '/api/csp/stats';
export const FINDINGS_ROUTH_PATH = '/api/csp/findingstmp'; // TODO: update when we switch with FE
export const AGENT_LOGS_INDEX = 'kubebeat*';
export const DEFAULT_FINDINGS_PER_PAGE = 20;
export const RULE_PASSED = `passed` as const;
export const RULE_FAILED = `failed` as const;
