/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { EuiFlexGrid, EuiFlexItem, EuiPanel, EuiSpacer } from '@elastic/eui';
import { CloudPostureScoreChart } from '../compliance_charts/cloud_posture_score_chart';
import { MiniCPSGoalChart } from '../compliance_charts/mini_cps_goal_chart';
import { ComplianceTrendChart } from '../compliance_charts/compliance_trend_chart';
import { useCloudPostureScoreApi } from '../../../common/api/use_cloud_posture_score_api';

export const BenchmarksSection = () => {
  const getScore = useCloudPostureScoreApi();
  const { benchmarks } = getScore.isSuccess && getScore.data;

  if (!benchmarks.length) return null;

  return (
    <>
      {benchmarks.map((benchmark) => (
        <EuiPanel hasBorder={true} hasShadow={false}>
          <EuiFlexGrid columns={4}>
            <EuiFlexItem
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                flexBasis: '20%',
                borderRight: `1px solid lightgray`,
              }}
            >
              {benchmark.name}
            </EuiFlexItem>
            <EuiFlexItem style={{ flexBasis: '20%' }}>
              <CloudPostureScoreChart {...benchmark} />
            </EuiFlexItem>
            <EuiFlexItem style={{ flexBasis: '40%' }}>
              <ComplianceTrendChart />
            </EuiFlexItem>
            <EuiFlexItem style={{ flexBasis: '10%' }}>
              <MiniCPSGoalChart />
            </EuiFlexItem>
          </EuiFlexGrid>
        </EuiPanel>
      ))}
    </>
  );
};
