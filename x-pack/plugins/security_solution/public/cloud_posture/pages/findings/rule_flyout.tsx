/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import {
  EuiSpacer,
  EuiCode,
  EuiDescriptionList,
  EuiTextColor,
  EuiFlyout,
  EuiFlyoutHeader,
  EuiTitle,
  EuiFlyoutBody,
  EuiBadge,
} from '@elastic/eui';
import { CSPFinding } from './types';

const getEvaluationBadge = (v: string) => (
  <EuiBadge color={v === 'passed' ? 'success' : v === 'failed' ? 'danger' : 'default'}>
    {v.toUpperCase()}
  </EuiBadge>
);

const getTagsBadges = (v: string[]) => (
  <>
    {v.map((x) => (
      <EuiBadge color="default">{x}</EuiBadge>
    ))}
  </>
);

export const FindingsRuleFlyOut = ({
  onClose,
  findings,
}: {
  onClose(): void;
  findings: CSPFinding;
}) => {
  return (
    <EuiFlyout onClose={onClose}>
      <EuiFlyoutHeader hasBorder aria-labelledby={'foo'}>
        <EuiTitle size="l">
          <EuiTextColor color="accent">
            <h2>{findings.rule.benchmark}</h2>
          </EuiTextColor>
        </EuiTitle>
        <EuiSpacer />
        <EuiTitle size="xs">
          <EuiTextColor color="subdued">
            <h3>{findings.rule.name}</h3>
          </EuiTextColor>
        </EuiTitle>
        <EuiSpacer />
        {getTagsBadges(findings.rule.tags)}
        <EuiSpacer size="l" />
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <EuiSpacer />
        <EuiDescriptionList
          compressed={false}
          listItems={[
            {
              title: 'Rule Description',
              description: findings.rule.description,
            },
            {
              title: 'Rule Evaluation',
              description: getEvaluationBadge(findings.result.evaluation),
            },
            {
              title: 'Evidence',
              description: <EuiCode>{JSON.stringify(findings.result.evidence, null, 2)}</EuiCode>,
            },
            findings.result.evaluation === 'failed' && {
              title: 'Remediation',
              description: <EuiCode>{findings.rule.remediation}</EuiCode>,
            },
          ].filter((v): v is NonNullable<typeof v> => !!v)}
        />
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};
