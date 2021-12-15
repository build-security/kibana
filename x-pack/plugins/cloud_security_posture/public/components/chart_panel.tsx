/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import styled from 'styled-components';
import { EuiPanel, EuiText, EuiTitle, EuiLoadingChart } from '@elastic/eui';
import { Datum } from '@elastic/charts';

interface ChartPanelProps {
  title?: string;
  description?: string;
  hasBorder?: boolean;
  chart: React.FC<{ data: any }>;
  isLoading: boolean;
  isError: boolean;
  data: Datum[] | undefined;
}

const Loading = () => (
  <CenteredBox color="subdued">
    <EuiLoadingChart size="m" />
  </CenteredBox>
);

const Error = () => (
  <CenteredBox color="subdued">
    <EuiText color="subdued">{'Error'}</EuiText>
  </CenteredBox>
);

export const ChartPanel = ({
  title,
  description,
  hasBorder = true,
  chart: Chart,
  isLoading,
  isError,
  data,
}: ChartPanelProps) => {
  const renderChart = () => {
    if (isLoading) return <Loading />;
    if (isError) return <Error />;
    return <Chart data={data} />;
  };

  return (
    <EuiPanel hasBorder={hasBorder} style={{ display: 'flex', flexDirection: 'column' }}>
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
    </EuiPanel>
  );
};

const StyledEuiTitle = styled(EuiTitle)`
  font-weight: 400;
`;

const CenteredBox = styled.div`
  width: 100%;
  flex-basis: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;
