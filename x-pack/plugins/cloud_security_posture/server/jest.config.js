/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

/** @type {import('@jest/types').Config.InitialOptions} */
module.exports = {
  preset: '@kbn/test',
  rootDir: '../../../../',
  testMatch: ['<rootDir>/x-pack/plugins/cloud_security_posture/server/**/*.test.{js,mjs,ts,tsx}'],
  roots: ['<rootDir>/x-pack/plugins/cloud_security_posture/server'],
  coverageDirectory:
    '<rootDir>/target/kibana-coverage/jest/x-pack/plugins/cloud_security_posture/server',
  coverageReporters: ['text', 'html'],
  collectCoverageFrom: ['<rootDir>/x-pack/plugins/cloud_security_posture/server/**/*.{ts,tsx}'],
  coveragePathIgnorePatterns: ['<rootDir>/src'], // TODO: remove this
};
