/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { renderHook, act } from '@testing-library/react-hooks';
import { useUrlQuery } from './use_url_query';
import { useLocation, useHistory } from 'react-router-dom';
import { encodeQuery } from '../navigation/query_utils';

jest.mock('react-router-dom', () => ({
  useHistory: jest.fn(),
  useLocation: jest.fn(),
}));

describe('useUrlQuery', () => {
  it('uses default query when no query is provided', () => {
    const defaultQuery = { foo: 1 };

    (useLocation as jest.Mock).mockReturnValue({
      search: encodeQuery(defaultQuery),
    });
    (useHistory as jest.Mock).mockReturnValue({
      push: jest.fn(),
    });
    const { result } = renderHook(() => useUrlQuery(() => defaultQuery));

    act(() => {
      result.current.setUrlQuery({});
    });

    expect(result.current.urlQuery.foo).toBe(1);
    expect(useHistory().push).toHaveBeenCalledTimes(1);
  });

  it('merges default query when query is partial', () => {
    const defaultQuery = { foo: 1, zoo: 2 };
    const nextValue = { zoo: 3 };
    (useLocation as jest.Mock).mockReturnValue({
      search: encodeQuery({ ...defaultQuery, ...nextValue }),
    });
    (useHistory as jest.Mock).mockReturnValue({
      push: jest.fn(),
    });
    const { result } = renderHook(() => useUrlQuery(() => defaultQuery));

    act(() => {
      result.current.setUrlQuery(nextValue);
    });

    expect(result.current.urlQuery.foo).toBe(1);
    expect(result.current.urlQuery.zoo).toBe(3);
    expect(useHistory().push).toHaveBeenCalledTimes(1);
  });
});
