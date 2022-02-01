/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { getFormattedNum } from './getFormattedNum';

const mockNums: number[] = [
  -1000000000, -1000, 0, 100, 1000, 12345, 123456, 1234567, 12345678, 123456789, 1234567890,
  1234567890000,
];

describe('getFormattedNum', () => {
  it('returns correct abbreviation', () => {
    // tests that the used properties for Intl.NumberFormat set in 'getFormattedNum' are correct
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
