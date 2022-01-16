/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import {
  Axis,
  BarSeries,
  Chart,
  ElementClickListener,
  XYChartElementEvent,
  Settings,
} from '@elastic/charts';
import { euiPaletteForStatus } from '@elastic/eui';
<<<<<<< HEAD
import type { Query } from '@kbn/es-query';
import { useHistory } from 'react-router-dom';
import { CloudPostureStats, EvaluationResult } from '../../../../common/types';
import { encodeQuery } from '../../../common/navigation/query_utils';
import { allNavigationItems } from '../../../common/navigation/constants';
=======
import { CloudPostureStats, EvaluationResult } from '../../../../common/types';
import { useNavigateToCspFindings } from '../../../common/navigation/use_navigate_to_csp_findings';
>>>>>>> 95855fa7343125d097f00abedc1b9b6ed4cf1164

interface ResourcesAtRiskChartProps {
  data: CloudPostureStats['resourcesEvaluations'];
}

<<<<<<< HEAD
const getResourceQuery = (resource: string, evaluation: string): Query => ({
  language: 'kuery',
  query: `resource.filename : "${resource}" and result.evaluation : "${evaluation}" `,
});

export const ResourcesAtRiskChart = ({ data: resources }: ResourcesAtRiskChartProps) => {
  const history = useHistory();

=======
export const ResourcesAtRiskChart = ({ data: resources }: ResourcesAtRiskChartProps) => {
  const { navigate } = useNavigateToCspFindings();
>>>>>>> 95855fa7343125d097f00abedc1b9b6ed4cf1164
  if (!resources) return null;

  const handleElementClick: ElementClickListener = (elements) => {
    const [element] = elements as XYChartElementEvent[];
    const [geometryValue] = element;
    const { resource, evaluation } = geometryValue.datum as EvaluationResult;

<<<<<<< HEAD
    history.push({
      pathname: allNavigationItems.findings.path,
      search: encodeQuery(getResourceQuery(resource, evaluation)),
    });
=======
    navigate(
      `(language:kuery,query:'resource.filename : "${resource}" and result.evaluation : ${evaluation.toLowerCase()}')`
    );
>>>>>>> 95855fa7343125d097f00abedc1b9b6ed4cf1164
  };

  const top5 = resources.length > 5 ? resources.slice(0, 5) : resources;

  return (
    <Chart size={{ height: 200 }}>
      <Settings
        theme={theme}
        rotation={90}
        showLegend={false}
        onElementClick={handleElementClick}
      />
      <Axis id="left" position="left" />
      <BarSeries
        displayValueSettings={{
          showValueLabel: true,
        }}
        id="resources-at-risk-bars"
        data={top5}
        xAccessor={'resource'}
        yAccessors={['value']}
        splitSeriesAccessors={['evaluation']}
        stackAccessors={['evaluation']}
      />
    </Chart>
  );
};

const theme = {
  colors: { vizColors: euiPaletteForStatus(2) },
  barSeriesStyle: {
    displayValue: {
      fontSize: 14,
      fill: { color: 'white', borderColor: 'blue', borderWidth: 0 },
      offsetX: 5,
      offsetY: -5,
    },
  },
};
