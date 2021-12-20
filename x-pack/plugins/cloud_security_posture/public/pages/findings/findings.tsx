/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import React from 'react';
import { EuiEmptyPrompt } from '@elastic/eui';
import type { EuiPageHeaderProps } from '@elastic/eui';
import { FindingsTableContainer } from './findings_container';
import { CspPageTemplate } from '../../components/page_template';
import { useKubebeatDataView } from './utils';
import { FINDINGS_MISSING_INDEX_TESTID } from './constants';

const pageHeader: EuiPageHeaderProps = {
  pageTitle: 'Findings',
};

const MissingDataView = () => (
  // TODO: better design
  <EuiEmptyPrompt data-test-subj={FINDINGS_MISSING_INDEX_TESTID} title={<>"NO DAT VIEW BRUH"</>} />
);

export const Findings = () => {
  const { kubebeatDataView } = useKubebeatDataView();

  return (
    <CspPageTemplate pageHeader={pageHeader}>
      {kubebeatDataView && <FindingsTableContainer dataView={kubebeatDataView} />}
      {!kubebeatDataView && <MissingDataView />}
    </CspPageTemplate>
  );
};
