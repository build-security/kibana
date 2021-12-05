/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import styled from 'styled-components';
import {
  EuiStat,
  EuiFlexItem,
  EuiPanel,
  EuiIcon,
  EuiFlexGrid,
  euiPaletteForStatus,
} from '@elastic/eui';
import { Chart, Settings, LineSeries } from '@elastic/charts';
import { useCloudPostureStatsApi } from '../../../common/api';

const [green, yellow, red] = euiPaletteForStatus(3);
const warningColor = '#F5A700';

const getTitleColor = (value: number) => {
  if (value <= 65) return 'danger';
  if (value <= 86) return warningColor;
  if (value <= 100) return 'success';
  return 'default';
};

const getScoreIcon = (value: number) => {
  if (value <= 65) return 'alert';
  if (value <= 86) return 'alert';
  if (value <= 100) return 'check';
  return 'error';
};

const getScoreTrendPercentage = (scoreTrend: Array<[time: number, value: number]>) => {
  const beforeLast = scoreTrend[scoreTrend.length - 2][1];
  const last = scoreTrend[scoreTrend.length - 1][1];

  return Number((last - beforeLast).toFixed(1));
};

export const ComplianceStats = () => {
  const getStats = useCloudPostureStatsApi();
  const postureScore = getStats.isSuccess && getStats.data.postureScore;
  if (!postureScore) return null;

  const scoreTrend = [
    [0, 0],
    [1, 10],
    [2, 100],
    [3, 50],
    [4, postureScore],
  ];

  const scoreChange = getScoreTrendPercentage(scoreTrend);
  const isPositiveChange = scoreChange > 0;

  const stats = [
    {
      title: postureScore,
      description: 'Posture Score',
      titleColor: getTitleColor(postureScore),
      iconType: getScoreIcon(postureScore),
    },
    {
      title: (
        <span>
          <EuiIcon size="xl" type={isPositiveChange ? 'sortUp' : 'sortDown'} />
          {`${scoreChange}%`}
        </span>
      ),
      description: 'Posture Score Trend',
      titleColor: isPositiveChange ? 'success' : 'danger',
      renderBody: (
        <>
          <Chart size={{ height: 30 }}>
            <Settings
              showLegend={false}
              tooltip="none"
              theme={{
                lineSeriesStyle: {
                  point: {
                    visible: false,
                  },
                },
              }}
            />
            <LineSeries
              id="posture-score-trend-sparkline"
              data={scoreTrend}
              xAccessor={0}
              yAccessors={[1]}
              color={isPositiveChange ? green : red}
            />
          </Chart>
        </>
      ),
    },
    {
      title: '1',
      description: 'Active Frameworks',
    },
    {
      title: '1,369',
      description: 'Total Resources',
    },
  ];

  return (
    <EuiFlexGrid columns={2}>
      {stats.map((s) => (
        <EuiFlexItem style={{ height: '45%' }}>
          <EuiPanel hasShadow={false} hasBorder>
            <StyledEuiStat
              title={s.title}
              description={s.description}
              textAlign="left"
              titleColor={s.titleColor}
            >
              {s.renderBody || <EuiIcon type={s.iconType || 'empty'} color={s.titleColor} />}
            </StyledEuiStat>
          </EuiPanel>
        </EuiFlexItem>
      ))}
    </EuiFlexGrid>
  );
};

const StyledEuiStat = styled(EuiStat)`
  .euiTitle {
    font-weight: 300;
  }
`;
