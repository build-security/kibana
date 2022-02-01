/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { EuiFlexGroup, EuiFlexItem, EuiLoadingSpinner } from '@elastic/eui';
import React from 'react';

interface CspLoadingStateProps {
  loadingText?: string;
}

export const CspLoadingState = ({ loadingText = 'Loading...' }: CspLoadingStateProps) => (
  <EuiFlexGroup direction="column" alignItems="center" style={{ marginTop: '10vh' }}>
    <EuiFlexItem>
      <EuiLoadingSpinner size="xl" />
    </EuiFlexItem>
    <EuiFlexItem>{loadingText}</EuiFlexItem>
  </EuiFlexGroup>
);
