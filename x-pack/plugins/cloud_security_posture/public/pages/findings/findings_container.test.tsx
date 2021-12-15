/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import React from 'react';
import { FindingsTableContainer } from './findings_container';
import { render, screen } from '@testing-library/react';
import { TestProvider as TestProviderComponent } from '../../application/test_provider';
import { dataPluginMock } from '../../../../../../src/plugins/data/public/mocks';
import { coreMock } from '../../../../../../src/core/public/mocks';
// import { registerTestBed, TestBed, AsyncTestBedConfig, findTestSubject } from '@kbn/test/jest';

jest.mock('react-router-dom', () => {
  const orig = jest.requireActual('react-router-dom');
  return {
    ...orig,
    useLocation: () => '',
  };
});

const createTestCompWithProvider = (Comp: React.FC): React.FC => {
  const core = coreMock.createStart();
  const params = coreMock.createAppMountParameters();
  const dataMock = dataPluginMock.createStartContract();
  // const deps = {
  //   data: {
  //     ...dataMock,
  //     ui: {
  //       ...dataMock.ui,
  //       SearchBar: jest.fn().mockImplementation((props) => (
  //         <button
  //           data-test-subj="findings_search_bar"
  //           onClick={() => props.onQuerySubmit({ dateRange: { from: 'now', to: 'now' } })}
  //           type="button"
  //         >
  //           &nbsp;
  //         </button>
  //       )),
  //     },
  //   },
  // };
  const services = { core, deps: { data: dataMock }, params };
  return () => (
    <TestProviderComponent {...services}>
      <Comp />
    </TestProviderComponent>
  );
};

describe('Test findings page', () => {
  it('renders <FindingsTableContainer/>', async () => {
    const TestComp = createTestCompWithProvider(FindingsTableContainer);

    render(<TestComp />);
    expect(await screen.findByTestId('findings_page')).toBeInTheDocument();
    // expect(await screen.findByTestId('findings_search_bar')).toBeInTheDocument();
    expect(await screen.findByTestId('findings_table')).toBeInTheDocument();
  });

  // Using kbn testbed
  //////////////////////////////////////
  // it('renders', async () => {
  //   const TestComp = createTestCompWithProvider(FindingsTableContainer);
  //   const setup = registerTestBed(TestComp, {
  //     memoryRouter: {
  //       initialEntries: [{ pathname: '/findings' }],
  //     },
  //   });
  //   const { find, component } = setup();
  //   console.log('PARENT', component.debug());
  //   console.log('CHILD', find('findings_page').debug());
  // });
});
