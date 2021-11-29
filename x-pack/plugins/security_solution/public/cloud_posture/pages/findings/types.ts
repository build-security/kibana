/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

export interface CSPFinding {
  '@timestamp': string;
  run_id: string;
  result: CSPFindingResult;
  resource: CSPFindingResource;
  rule: {
    benchmark: string;
    description: string;
    impact: string;
    name: string;
    remediation: string;
    tags: string[];
  };
  host: CSPFindingHost;
  agent: CSPFindingAgent;
  ecs: {
    version: string;
  };
}

// TODO: rename
interface CSPFindingResult {
  evaluation: 'passed' | 'failed';
  evidence: {
    filemode: string;
  };
}

// TODO: rename
interface CSPFindingResource {
  uid: string;
  filename: string;
  gid: string;
  mode: string;
  path: string;
  type: string;
}

// TODO: rename
interface CSPFindingHost {
  id: string;
  containerized: boolean;
  ip: string[];
  mac: string[];
  name: string;
  hostname: string;
  architecture: string;
  os: {
    kernel: string;
    codename: string;
    type: string;
    platform: string;
    version: string;
    family: string;
    name: string;
  };
}

// TODO: rename
interface CSPFindingAgent {
  version: string;
  ephemeral_id: string;
  id: string;
  name: string;
  type: string;
}
