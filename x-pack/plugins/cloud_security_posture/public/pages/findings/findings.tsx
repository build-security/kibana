/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import React from 'react';
import { EuiEmptyPrompt } from '@elastic/eui';
import type { EuiPageHeaderProps } from '@elastic/eui';
import { EuiLoadingSpinner } from '@elastic/eui';
import { FindingsTableContainer } from './findings_container';
import { CspPageTemplate } from '../../components/page_template';
import { useKubebeatDataView } from './utils';
import { TEST_SUBJECTS } from './constants';

const pageHeader: EuiPageHeaderProps = {
  pageTitle: 'Findings',
};

const MissingDataView = () => (
  // TODO: better design
  <EuiEmptyPrompt
    data-test-subj={TEST_SUBJECTS.FINDINGS_MISSING_INDEX}
    title={<>Kubebeat DataView is missing</>}
  />
);

export const Findings = () => {
  const dataView = useKubebeatDataView();
  return (
    <CspPageTemplate pageHeader={pageHeader}>
      {dataView.status === 'success' && <FindingsTableContainer dataView={dataView.data} />}
      {(dataView.status === 'error' || (dataView.status !== 'loading' && !dataView.data)) && (
        <MissingDataView />
      )}
      {/* TODO: center spinner or use progress bar in header  */}
      {dataView.status === 'loading' && <EuiLoadingSpinner size="m" />}
    </CspPageTemplate>
  );
};
