/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useMemo } from 'react';
import { EuiBasicTable, EuiLink, EuiText } from '@elastic/eui';
import type { Query } from '@kbn/es-query';
import { useHistory } from 'react-router-dom';
import { CloudPostureStats, ResourceTypeAgg } from '../../../../common/types';
import { allNavigationItems } from '../../../common/navigation/constants';
import { encodeQuery } from '../../../common/navigation/query_utils';

export interface RisksTableProps {
  data: CloudPostureStats['resourceTypesAggs'];
}

const getResourceTypeQuery = (resourceType: string, evaluation: string): Query => ({
  language: 'kuery',
  query: `resource.type : "${resourceType}" and result.evaluation : "${evaluation}" `,
});

export const getFormattedNum = (num: number) =>
  new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 1,
    notation: 'compact',
    compactDisplay: 'short',
  }).format(num);

export const RisksTable = ({ data: resourceTypesAggs }: RisksTableProps) => {
  const history = useHistory();
  if (!resourceTypesAggs) return null;

  // const handleElementClick: ElementClickListener = (elements) => {
  //   const [element] = elements as XYChartElementEvent[];
  //   const [geometryValue] = element;
  //   const { resource, evaluation } = geometryValue.datum as EvaluationResult;
  //

  // };

  const handleClick = (resourceType: ResourceTypeAgg['resourceType']) =>
    history.push({
      pathname: allNavigationItems.findings.path,
      search: encodeQuery(getResourceTypeQuery(resourceType, 'failed')),
    });

  const columns = useMemo(
    () => [
      {
        field: 'resourceType',
        name: 'Resource Type',
        render: (resourceType: ResourceTypeAgg['resourceType']) => (
          <EuiLink onClick={() => handleClick(resourceType)}>{resourceType}</EuiLink>
        ),
      },
      {
        field: 'totalFailed',
        name: 'Failed Findings',
        render: (totalFailed: ResourceTypeAgg['totalFailed'], resource: ResourceTypeAgg) => (
          <>
            <EuiText size="s" color="danger">{`${getFormattedNum(resource.totalFailed)}`}</EuiText>
            <EuiText size="s">{`/${getFormattedNum(resource.totalFindings)}`}</EuiText>
          </>
        ),
      },
    ],
    [handleClick]
  );

  return (
    <EuiBasicTable<ResourceTypeAgg>
      tableCaption="Risks Table"
      rowHeader="resourceType"
      items={resourceTypesAggs}
      columns={columns}
    />
  );
};
