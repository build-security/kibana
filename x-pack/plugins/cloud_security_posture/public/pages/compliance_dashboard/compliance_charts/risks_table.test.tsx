/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { getFormattedNum, RisksTable, RisksTableProps } from './risks_table';

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

const mockNums: number[] = [
  -1000000000, -1000, 0, 100, 1000, 12345, 123456, 1234567, 12345678, 123456789, 1234567890,
  1234567890000,
];

describe('<RisksTable />', () => {
  it('renders loading state', () => {
    render(<RisksTable data={mockData} />);
    // expect(screen.getByTestId(CHART_PANEL_TEST_SUBJECTS.LOADING)).toBeInTheDocument();
  });
});

describe('getFormattedNum', () => {
  it('returns correct abbreviation', () => {
    // tests that the used properties for Intl.NumberFormat are correct
    const formattedResults = mockNums.map((n) => getFormattedNum(n));
    expect(formattedResults).toEqual([
      '-1B',
      '-1K',
      '0',
      '100',
      '1K',
      '12.3K',
      '123.5K',
      '1.2M',
      '12.3M',
      '123.5M',
      '1.2B',
      '1.2T',
    ]);
  });
});
