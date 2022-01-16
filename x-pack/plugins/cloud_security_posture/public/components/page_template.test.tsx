/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
jest.mock('../common/navigation/constants');

import React from 'react';
import { render, screen } from '@testing-library/react';
import { createNavigationItemFixture } from '../test/fixtures/navigationItem';
import Chance from 'chance';
import { getAllNavigationItems } from '../common/navigation/constants';
import { CspPageTemplate } from './page_template';
import { TestProvider } from '../test/test_provider';

const chance = new Chance();

describe('<CspPageTemplate />', () => {
  const renderCspPageTemplate = () =>
    render(
      <TestProvider>
        <CspPageTemplate />
      </TestProvider>
    );

  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('renders navigation items', () => {
    const navigationItemName = chance.word();
    const navigationItem = createNavigationItemFixture({ name: navigationItemName });
    (getAllNavigationItems as jest.Mock).mockReturnValue({ ...navigationItem });

    renderCspPageTemplate();

    expect(screen.getByText(navigationItemName)).toBeInTheDocument();
  });

  it('does not render disabled navigation items', () => {
    const navigationItemName = chance.word();
    const navigationItem = createNavigationItemFixture({
      name: navigationItemName,
      disabled: true,
    });
    (getAllNavigationItems as jest.Mock).mockReturnValue({ ...navigationItem });

    renderCspPageTemplate();

    expect(screen.queryByText(navigationItemName)).not.toBeInTheDocument();
  });
});
