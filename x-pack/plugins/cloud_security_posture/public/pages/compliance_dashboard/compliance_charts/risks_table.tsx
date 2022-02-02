/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useCallback, useMemo } from 'react';
import {
  EuiBasicTable,
  EuiButtonEmpty,
  EuiFlexGroup,
  EuiFlexItem,
  EuiLink,
  EuiText,
} from '@elastic/eui';
import type { Query } from '@kbn/es-query';
import { useHistory } from 'react-router-dom';
import { CloudPostureStats, Evaluation, ResourceTypeAgg } from '../../../../common/types';
import { allNavigationItems } from '../../../common/navigation/constants';
import { encodeQuery } from '../../../common/navigation/query_utils';
import { getFormattedNum } from '../../../common/utils/getFormattedNum';
import * as TEXT from '../translations';
import { RULE_FAILED } from '../../../../common/constants';

export interface RisksTableProps {
  data: CloudPostureStats['resourceTypesAggs'];
}

export function sortAscending<T>(getter: (x: T) => number) {
  return (a: T, b: T) => {
    const v1 = getter(a);
    const v2 = getter(b);
    if (v1 > v2) return -1;
    if (v2 > v1) return 1;

    return 0;
  };
}

const maxRisks = 5;

export const getTop5Risks = (resourceTypesAggs: CloudPostureStats['resourceTypesAggs']) => {
  const filtered = resourceTypesAggs.filter((x) => x.totalFailed > 0);
  const sorted = filtered.slice().sort(sortAscending((x) => x.totalFailed));

  if (sorted.length > maxRisks) {
    return sorted.slice(0, maxRisks);
  }

  return sorted;
};

const getFailedFindingsQuery = (): Query => ({
  language: 'kuery',
  query: `result.evaluation : "${RULE_FAILED}" `,
});

const getResourceTypeQuery = (resourceType: string, evaluation: Evaluation): Query => ({
  language: 'kuery',
  query: `resource.type : "${resourceType}" and result.evaluation : "${evaluation}" `,
});

export const RisksTable = ({ data: resourceTypesAggs }: RisksTableProps) => {
  const history = useHistory();

  const handleCellClick = useCallback(
    (resourceType: ResourceTypeAgg['resourceType']) =>
      history.push({
        pathname: allNavigationItems.findings.path,
        search: encodeQuery(getResourceTypeQuery(resourceType, RULE_FAILED)),
      }),
    [history]
  );

  const handleViewAllClick = useCallback(
    () =>
      history.push({
        pathname: allNavigationItems.findings.path,
        search: encodeQuery(getFailedFindingsQuery()),
      }),
    [history]
  );

  const columns = useMemo(
    () => [
      {
        field: 'resourceType',
        name: TEXT.RESOURCE_TYPE,
        render: (resourceType: ResourceTypeAgg['resourceType']) => (
          <EuiLink onClick={() => handleCellClick(resourceType)}>{resourceType}</EuiLink>
        ),
      },
      {
        field: 'totalFailed',
        name: TEXT.FAILED_FINDINGS,
        render: (totalFailed: ResourceTypeAgg['totalFailed'], resource: ResourceTypeAgg) => (
          <>
            <EuiText size="s" color="danger">{`${getFormattedNum(resource.totalFailed)}`}</EuiText>
            <EuiText size="s">{`/${getFormattedNum(resource.totalFindings)}`}</EuiText>
          </>
        ),
      },
    ],
    [handleCellClick]
  );

  if (!resourceTypesAggs) return null;

  return (
    <EuiFlexGroup direction="column" justifyContent="spaceBetween" gutterSize="s">
      <EuiFlexItem>
        <EuiBasicTable<ResourceTypeAgg>
          rowHeader="resourceType"
          items={getTop5Risks(resourceTypesAggs)}
          columns={columns}
        />
      </EuiFlexItem>
      <EuiFlexItem grow={false}>
        <EuiFlexGroup justifyContent="center" gutterSize="none">
          <EuiFlexItem grow={false}>
            <EuiButtonEmpty onClick={handleViewAllClick} iconType="search">
              {TEXT.VIEW_ALL_FAILED_FINDINGS}
            </EuiButtonEmpty>
          </EuiFlexItem>
        </EuiFlexGroup>
      </EuiFlexItem>
    </EuiFlexGroup>
  );
};
