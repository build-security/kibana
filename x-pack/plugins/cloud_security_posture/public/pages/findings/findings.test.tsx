/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import React from 'react';
import { Findings } from './findings';
import { render, screen } from '@testing-library/react';
import { TestProvider as TestProviderComponent } from '../../application/test_provider';
import { dataPluginMock } from '../../../../../../src/plugins/data/public/mocks';
import { coreMock } from '../../../../../../src/core/public/mocks';
import { createStubDataView } from '../../../../../../src/plugins/data_views/public/data_views/data_view.stub';
import * as utils from './utils';
import { CSP_KUBEBEAT_INDEX } from '../../../common/constants';
import { FINDINGS_MISSING_INDEX_TESTID, FINDINGS_CONTAINER_TESTID } from './constants';

const createTestCompWithProvider = (Comp: React.FC): React.FC => {
  const core = coreMock.createStart();
  const params = coreMock.createAppMountParameters();
  const dataMock = dataPluginMock.createStartContract();
  const services = { core, deps: { data: dataMock }, params };
  return () => (
    <TestProviderComponent {...services}>
      <Comp />
    </TestProviderComponent>
  );
};

describe('Test findings page conditional rendering', () => {
  it("renders the empty state component when 'kubebeat' DataView doesn't exists", async () => {
    const spy = jest
      .spyOn(utils, 'useKubebeatDataView')
      .mockImplementation(() => ({ kubebeatDataView: undefined }));

    const TestComp = createTestCompWithProvider(Findings);
    render(<TestComp />);

    expect(await screen.findByTestId(FINDINGS_MISSING_INDEX_TESTID)).toBeInTheDocument();
    spy.mockRestore();
  });

  it("renders the success state component when 'kubebeat' DataView exists", async () => {
    const spy = jest.spyOn(utils, 'useKubebeatDataView').mockImplementation(() => ({
      kubebeatDataView: createStubDataView({
        spec: {
          id: CSP_KUBEBEAT_INDEX,
        },
      }),
    }));

    const TestComp = createTestCompWithProvider(Findings);
    render(<TestComp />);

    expect(await screen.findByTestId(FINDINGS_CONTAINER_TESTID)).toBeInTheDocument();
    spy.mockRestore();
  });
});
