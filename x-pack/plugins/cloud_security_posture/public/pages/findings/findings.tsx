/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import type { EuiPageHeaderProps } from '@elastic/eui';
import { FindingsTableContainer } from './findings_container';
import { CspPageTemplate } from '../../components/page_template';

const pageHeader: EuiPageHeaderProps = {
  pageTitle: 'Findings',
};

export const Findings = () => (
  <CspPageTemplate pageHeader={pageHeader}>
    <FindingsTableContainer />
  </CspPageTemplate>
);
