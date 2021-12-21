/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import React from 'react';
import { Findings } from './findings';
import { render, screen } from '@testing-library/react';
import { TestProvider } from '../../application/test_provider';
import { dataPluginMock } from '../../../../../../src/plugins/data/public/mocks';
import { coreMock } from '../../../../../../src/core/public/mocks';
import { createStubDataView } from '../../../../../../src/plugins/data_views/public/data_views/data_view.stub';
import * as utils from './utils';
import { CSP_KUBEBEAT_INDEX_PATTERN } from '../../../common/constants';
import { TEST_SUBJECTS } from './constants';
import type { UseQueryResult } from 'react-query';
import type { DataView } from '../../../../../../src/plugins/data/common';

const spy = jest.spyOn(utils, 'useKubebeatDataView');

beforeEach(() => {
  spy.mockReset();
});

const FindingsComponentWithTestProvider = () => {
  const core = coreMock.createStart();
  const params = coreMock.createAppMountParameters();
  const dataMock = dataPluginMock.createStartContract();
  const services = { core, deps: { data: dataMock }, params };
  return (
    <TestProvider {...services}>
      <Findings />
    </TestProvider>
  );
};

describe('Test findings page conditional rendering', () => {
  it("renders the error state component when 'kubebeat' DataView doesn't exists", async () => {
    spy.mockImplementation(
      () => ({ status: 'error', data: undefined } as UseQueryResult<DataView>)
    );

    render(<FindingsComponentWithTestProvider />);

    expect(await screen.findByTestId(TEST_SUBJECTS.FINDINGS_MISSING_INDEX)).toBeInTheDocument();
  });

  it("renders the success state component when 'kubebeat' DataView exists", async () => {
    spy.mockImplementation(
      () =>
        ({
          status: 'success',
          data: createStubDataView({
            spec: {
              id: CSP_KUBEBEAT_INDEX_PATTERN,
            },
          }),
        } as UseQueryResult<DataView>)
    );

    render(<FindingsComponentWithTestProvider />);

    expect(await screen.findByTestId(TEST_SUBJECTS.FINDINGS_CONTAINER)).toBeInTheDocument();
  });
});
