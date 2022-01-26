/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import {
  Chart,
  Datum,
  ElementClickListener,
  Partition,
  PartitionLayout,
  Settings,
} from '@elastic/charts';
import { EuiFlexGroup, EuiText, EuiHorizontalRule, EuiFlexItem } from '@elastic/eui';
import type { PartitionElementEvent } from '@elastic/charts';
import type { Query } from '@kbn/es-query';
import { useHistory } from 'react-router-dom';
import { statusColors } from '../../../common/constants';
import type { Stats } from '../../../../common/types';
import * as TEXT from '../translations';
import { encodeQuery } from '../../../common/navigation/query_utils';
import { allNavigationItems } from '../../../common/navigation/constants';

interface ChartName {
  name?: string;
}

interface CloudPostureScoreChartProps {
  data: Stats & ChartName;
}

const getQuery = (name: ChartName['name'], evaluation: string): Query => ({
  language: 'kuery',
  query: `${name ? `rule.benchmark : "${name}" and` : ''} result.evaluation : "${evaluation}"`,
});

const ScoreChart = ({ totalPassed, totalFailed, name }: CloudPostureScoreChartProps['data']) => {
  const history = useHistory();

  const handleElementClick: ElementClickListener = (elements) => {
    const [element] = elements as PartitionElementEvent[];
    const [layerValue] = element;
    const rollupValue = layerValue[0].groupByRollup as string;

    history.push({
      pathname: allNavigationItems.findings.path,
      search: encodeQuery(getQuery(name, rollupValue.toLowerCase())),
    });
  };

  const data = [
    { label: TEXT.PASSED, value: totalPassed },
    { label: TEXT.FAILED, value: totalFailed },
  ];

  return (
    <Chart size={{ height: 75, width: 90 }}>
      <Settings onElementClick={handleElementClick} />
      <Partition
        id={name || 'score_chart'}
        data={data}
        valueGetter="percent"
        valueAccessor={(d: Datum) => d.value as number}
        layers={[
          {
            groupByRollup: (d: Datum) => d.label,
            shape: {
              fillColor: (d, index) =>
                d.dataName === 'Passed' ? statusColors.success : statusColors.danger,
            },
          },
        ]}
        config={{
          partitionLayout: PartitionLayout.sunburst,
          linkLabel: { maximumSection: Infinity, maxCount: 0 },
          outerSizeRatio: 0.9,
          emptySizeRatio: 0.8,
        }}
      />
    </Chart>
  );
};

const PercentageInfo = ({
  postureScore,
  totalPassed,
  totalFindings,
}: CloudPostureScoreChartProps['data']) => {
  const percentage = `${Math.round(postureScore)}%`;

  return (
    <EuiFlexGroup direction="column" justifyContent="flexEnd">
      <EuiText style={{ fontSize: 36, fontWeight: 'bold', lineHeight: 1 }}>{percentage}</EuiText>
      <EuiText
        style={{ fontSize: 12 }}
      >{`${totalPassed}/${totalFindings} Findings passed`}</EuiText>
    </EuiFlexGroup>
  );
};

const ComplianceTrendChart = () => <div>Trend Placeholder</div>;

export const CloudPostureScoreChart = ({ data }: CloudPostureScoreChartProps) => {
  if (data.totalPassed === undefined || data.totalFailed === undefined) return null;

  return (
    <EuiFlexGroup direction="column">
      <EuiFlexItem>
        <EuiFlexGroup direction="row" style={{ padding: '0 10px' }}>
          <EuiFlexItem grow={false} style={{ margin: 0 }}>
            <ScoreChart {...data} />
          </EuiFlexItem>
          <EuiFlexItem>
            <PercentageInfo {...data} />
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexItem>
      <EuiHorizontalRule margin="m" />
      <EuiFlexItem>
        <ComplianceTrendChart />
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
