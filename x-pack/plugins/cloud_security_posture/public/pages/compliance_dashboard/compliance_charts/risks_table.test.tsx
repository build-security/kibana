/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { RisksTable, RisksTableProps } from './risks_table';

const mockData: RisksTableProps['data'] = [
  {
    resourceType: 'pods',
    totalFindings: 3,
    totalPassed: 1,
    totalFailed: 2,
  },
  {
    resourceType: 'etcd',
    totalFindings: 4,
    totalPassed: 0,
    totalFailed: 4,
  },
];

describe('<RisksTable />', () => {
  it('renders loading state', () => {
    render(<RisksTable data={mockData} />);
    // expect(screen.getByTestId(CHART_PANEL_TEST_SUBJECTS.LOADING)).toBeInTheDocument();
  });
});
