/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { EuiSpacer } from '@elastic/eui';
import { SecuritySolutionPageWrapper } from '../../../common/components/page_wrapper';
import { HeaderPage } from '../../../common/components/header_page';
import { SpyRoute } from '../../../common/utils/route/spy_routes';
import { CloudPosturePage } from '../../../app/types';
import { encode } from 'rison-node';
import { useHistory } from 'react-router-dom';

export const Dashboard = () => {
  return (
    <SecuritySolutionPageWrapper noPadding={false} data-test-subj="csp_rules">
      <HeaderPage border title={'Dashboard'} />

      {/* <Button /> */}
      <EuiSpacer />
      <SpyRoute pageName={CloudPosturePage.dashboard} />
    </SecuritySolutionPageWrapper>
  );
};

// const useNavigateToCSPFindings = () => {
//   const history = useHistory();
//   return (query: string) => {
//     const v = {
//       pathname: '/csp/findings',
//       search: new URLSearchParams([['query', query]]).toString(),
//     };
//     history.push(v);
//   };
// };

// const Button = () => {
//   const navigate = useNavigateToCSPFindings();

//   const handler = () =>
//     navigate({
//       language: 'kuery',
//       query: `(language:kuery,query:'rule.benchmark : "CIS Kubernetes" and result.evaluation : passed')`,
//     });

//   return <button onClick={handler}>foo</button>;
// };
