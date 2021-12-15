/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useCallback } from 'react';
import styled from 'styled-components';
import { EuiPanel, EuiText, EuiTitle, EuiLoadingChart, EuiFlexGroup } from '@elastic/eui';

interface ChartPanelProps {
  title?: string;
  description?: string;
  hasBorder?: boolean;
  isLoading: boolean;
  isError: boolean;
  chart: JSX.Element;
}

const Loading = () => (
  <EuiFlexGroup justifyContent="center" alignItems="center">
    <EuiLoadingChart size="m" />
  </EuiFlexGroup>
);

const Error = () => (
  <EuiFlexGroup justifyContent="center" alignItems="center">
    <EuiText size="xs" color="subdued">
      {'Error'}
    </EuiText>
  </EuiFlexGroup>
);

export const ChartPanel = ({
  title,
  description,
  hasBorder = true,
  chart: Chart,
  isLoading,
  isError,
}: ChartPanelProps) => {
  const renderChart = useCallback(() => {
    if (isLoading) return <Loading />;
    if (isError) return <Error />;
    return Chart;
  }, [isLoading, isError, Chart]);

  return (
    <EuiPanel hasBorder={hasBorder} hasShadow={false}>
      <EuiFlexGroup direction="column" gutterSize="xs">
        {title && (
          <StyledEuiTitle size="s">
            <h3>{title}</h3>
          </StyledEuiTitle>
        )}
        {description && (
          <EuiText size="xs" color="subdued">
            {description}
          </EuiText>
        )}
        {renderChart()}
      </EuiFlexGroup>
    </EuiPanel>
  );
};

const StyledEuiTitle = styled(EuiTitle)`
  font-weight: 400;
`;
