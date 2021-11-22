/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { useHistory } from 'react-router-dom';
import { encode } from 'rison-node';

export const useNavigateToCSPFindings = () => {
  const history = useHistory();

  return {
    navigate: (query: { language: string; query: 'string' }) =>
      history.push({
        pathname: '/csp/findings',
        search: new URLSearchParams(
          [['query', encode(query.query)]].filter((p) => !!p[1])
        ).toString(),
      }),
  };
};
