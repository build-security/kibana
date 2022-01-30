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
import { EuiBasicTable, EuiLink, euiPaletteForStatus, EuiText } from '@elastic/eui';
import type { Query } from '@kbn/es-query';
import { useHistory } from 'react-router-dom';
import { CloudPostureStats, EvaluationResult } from '../../../../common/types';
import { encodeQuery } from '../../../common/navigation/query_utils';
import { allNavigationItems } from '../../../common/navigation/constants';

interface ResourcesAtRiskChartProps {
  data: CloudPostureStats['resourcesEvaluations'];
}

const getResourceQuery = (resource: string, evaluation: string): Query => ({
  language: 'kuery',
  query: `resource.filename : "${resource}" and result.evaluation : "${evaluation}" `,
});

export const RisksTable = ({ data: risks }: any) => {
  const history = useHistory();
  if (!risks) return null;

  // const handleElementClick: ElementClickListener = (elements) => {
  //   const [element] = elements as XYChartElementEvent[];
  //   const [geometryValue] = element;
  //   const { resource, evaluation } = geometryValue.datum as EvaluationResult;
  //
  //   history.push({
  //     pathname: allNavigationItems.findings.path,
  //     search: encodeQuery(getResourceQuery(resource, evaluation)),
  //   });
  // };

  const columns = [
    {
      field: 'resource_type',
      name: 'Resource Type',
      render: (resource_type) => <EuiLink href="#">{resource_type}</EuiLink>,
    },
    {
      field: 'failed_findings',
      name: 'Failed Findings',
      render: (v, resource) => (
        <>
          <EuiText size="s" color="danger">{`${resource.total_failed}`}</EuiText>
          <EuiText size="s">{`/${resource.total_findings}`}</EuiText>
        </>
      ),
    },
  ];

  return (
    <EuiBasicTable
      tableCaption="Risks Table"
      rowHeader="resource_type"
      items={risks}
      columns={columns}
    />
  );
};
