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
import { EuiFlexGroup, EuiText, EuiHorizontalRule, EuiSpacer, EuiFlexItem } from '@elastic/eui';
import type { PartitionElementEvent } from '@elastic/charts';
import type { Query } from '@kbn/es-query';
import { useHistory } from 'react-router-dom';
import { statusColors } from '../../../common/constants';
import type { Stats } from '../../../../common/types';
import * as TEXT from '../translations';
import { encodeQuery } from '../../../common/navigation/query_utils';
import { allNavigationItems } from '../../../common/navigation/constants';

interface CloudPostureScoreChartProps {
  data: Stats & { name?: string };
}

const getBenchmarkAndResultEvaluationQuery = (name: string, evaluation: string): Query => ({
  language: 'kuery',
  query: `${name ? `rule.benchmark : "${name}" and` : ''} result.evaluation : "${evaluation}"`,
});

export const CloudPostureScoreChart = ({
  data: { postureScore, totalPassed, totalFailed, totalFindings, name = '' },
}: CloudPostureScoreChartProps) => {
  const history = useHistory();

  if (totalPassed === undefined || totalFailed === undefined) return null;

  const handleElementClick: ElementClickListener = (elements) => {
    const [element] = elements as PartitionElementEvent[];
    const [layerValue] = element;
    const rollupValue = layerValue[0].groupByRollup as string;

    history.push({
      pathname: allNavigationItems.findings.path,
      search: encodeQuery(getBenchmarkAndResultEvaluationQuery(name, rollupValue.toLowerCase())),
    });
  };

  const total = totalPassed + totalFailed;
  const percentage = `${Math.round((totalPassed / total) * 100)}%`;

  const data = [
    { label: TEXT.PASSED, value: totalPassed },
    { label: TEXT.FAILED, value: totalFailed },
  ];

  return (
    <EuiFlexGroup direction="column">
      <EuiFlexGroup direction="row" style={{ padding: '0 10px' }}>
        <EuiFlexItem grow={false} style={{ margin: 0 }}>
          <Chart size={{ height: 75, width: 100 }}>
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
        </EuiFlexItem>
        <EuiFlexItem>
          <EuiFlexGroup direction="column" justifyContent="flexEnd">
            <EuiText style={{ fontSize: 36, fontWeight: 'bold', lineHeight: 1 }}>
              {percentage}
            </EuiText>
            <EuiText style={{ fontSize: 12, fontWeight: 'bold' }}>{'199/270 Rules passed'}</EuiText>
          </EuiFlexGroup>
        </EuiFlexItem>
      </EuiFlexGroup>
      <EuiHorizontalRule margin="m" />
      <EuiFlexItem>
        <div>trend</div>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
