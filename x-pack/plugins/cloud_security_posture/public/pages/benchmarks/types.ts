/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

// TODO: This is a mocked interface, waiting for actual BE for the real interface
export interface CspBenchmarkIntegration {
  integration_name: string;
  benchmark: string;
  rules: {
    active: number;
    total: number;
  };
  agent_policy: {
    id: string;
    name: string;
    number_of_agents: number;
  };
  created_by: string;
  created_at: Date;
}
