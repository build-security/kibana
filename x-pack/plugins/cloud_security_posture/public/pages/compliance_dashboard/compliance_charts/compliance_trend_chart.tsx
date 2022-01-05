/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import {
  Chart,
  Settings,
  Axis,
  timeFormatter,
  niceTimeFormatByDay,
  AreaSeries,
} from '@elastic/charts';
import type { BenchmarkStats } from '../../../../common/types';

interface ComplianceTrendChartProps {
  data: BenchmarkStats;
}

export const dateValueToTuple = ({ date, value }: { date: number; value: number }) => [date, value];

export const ComplianceTrendChart = ({ data }: ComplianceTrendChartProps) => {
  return (
    <Chart size={{ height: 200 }}>
      <Settings showLegend={false} legendPosition="right" />
      <AreaSeries
        id="compliance_score"
        name="Compliance Score"
        // TODO: no api for this chart yet, using empty state for now. needs BE
        data={[]}
        xScaleType="time"
        xAccessor={0}
        yAccessors={[1]}
      />
      <Axis id="bottom-axis" position="bottom" tickFormat={timeFormatter(niceTimeFormatByDay(1))} />
      <Axis ticks={4} id="left-axis" position="left" showGridLines domain={{ min: 0, max: 100 }} />
    </Chart>
  );
};
