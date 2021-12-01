/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { ReactNode, useState, useCallback } from 'react';
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
  EuiTabs,
  EuiTab,
  EuiCard,
} from '@elastic/eui';
import { assertNever } from '@kbn/std';
import { CSPFinding } from './types';
import { CSPEvaluationBadge } from '../../components/csp_evaluation_badge';

const tabs = ['resource', 'rule', 'overview'] as const;

interface Card {
  title: string;
  listItems: Array<{
    title: NonNullable<ReactNode>;
    description: NonNullable<ReactNode>;
  }>;
}

interface FindingFlyoutProps {
  onClose(): void;
  findings: CSPFinding;
}

export const FindingsRuleFlyout = ({ onClose, findings }: FindingFlyoutProps) => {
  const [tab, setTab] = useState<typeof tabs[number]>('resource');

  const Tab = useCallback(() => {
    switch (tab) {
      case 'overview':
        return <FlyoutTab cards={getOverviewCards(findings)} />;
      case 'rule':
        return <FlyoutTab cards={getRuleCards(findings)} />;
      case 'resource':
        return <FlyoutTab cards={getResourceCards(findings)} />;
    }

    assertNever(tab);
  }, [findings, tab]);

  return (
    <EuiFlyout onClose={onClose}>
      <EuiFlyoutHeader aria-labelledby={'foo'}>
        <EuiTitle size="l">
          <EuiTextColor color="primary">
            <h2>{'Findings'}</h2>
          </EuiTextColor>
        </EuiTitle>
        <EuiSpacer />
        <EuiTabs>
          {tabs.map((v) => (
            <EuiTab
              key={v}
              isSelected={tab === v}
              onClick={() => setTab(v)}
              style={{ textTransform: 'capitalize' }}
            >
              {v}
            </EuiTab>
          ))}
        </EuiTabs>
      </EuiFlyoutHeader>
      <EuiFlyoutBody>
        <Tab />
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};

const FlyoutTab = ({ cards }: { cards: Card[] }) => (
  <div style={{ display: 'grid', gridGap: 15, gridAutoFlow: 'rows' }}>
    {cards.map((card) => (
      <EuiCard textAlign="left" title={card.title}>
        <EuiDescriptionList compressed={false} type="column" listItems={card.listItems} />
      </EuiCard>
    ))}
  </div>
);

const getOverviewCards = ({ agent, host }: CSPFinding): Card[] => [
  {
    title: 'Agent',
    listItems: [
      { title: 'Name', description: agent.name },
      { title: 'ID', description: agent.id },
      { title: 'Type', description: agent.type },
      { title: 'Version', description: agent.version },
    ],
  },
  {
    title: 'Host',
    listItems: [
      { title: 'Architecture', description: host.architecture },
      {
        title: 'Containerized',
        description: host.containerized ? 'true' : 'false',
      },
      { title: 'Hostname', description: host.hostname },
      { title: 'ID', description: host.id },
      { title: 'IP', description: host.ip.join(',') },
      { title: 'Mac', description: host.mac.join(',') },
      { title: 'Name', description: host.name },
    ],
  },
  {
    title: 'OS',
    listItems: [
      { title: 'Codename', description: host.os.codename },
      { title: 'Family', description: host.os.family },
      { title: 'Kernel', description: host.os.kernel },
      { title: 'Name', description: host.os.name },
      { title: 'Platform', description: host.os.platform },
      { title: 'Type', description: host.os.type },
      { title: 'Version', description: host.os.version },
    ],
  },
];

const getRuleCards = ({ rule }: CSPFinding): Card[] => [
  {
    title: 'Rule',
    listItems: [
      { title: 'Benchmark', description: rule.benchmark },
      { title: 'Name', description: rule.name },
      { title: 'Description', description: rule.description },
      {
        title: 'Tags',
        description: rule.tags.map((t) => (
          <EuiBadge key={t} color="default">
            {t}
          </EuiBadge>
        )),
      },
      { title: 'Remediation', description: <EuiCode>{rule.remediation}</EuiCode> },
    ],
  },
];

const getResourceCards = ({ resource, result }: CSPFinding): Card[] => [
  {
    title: 'Resource',
    listItems: [
      { title: 'Filename', description: <EuiCode>{resource.filename}</EuiCode> },
      { title: 'Mode', description: resource.mode },
      { title: 'Path', description: <EuiCode>{resource.path}</EuiCode> },
      { title: 'Type', description: resource.type },
      { title: 'UID', description: resource.uid },
      { title: 'GID', description: resource.gid },
    ],
  },
  {
    title: 'Result',
    listItems: [
      {
        title: 'Evaluation',
        description: <CSPEvaluationBadge type={result.evaluation} />,
      },
      {
        title: 'Evidence',
        description: <EuiCode>{JSON.stringify(result.evidence, null, 2)}</EuiCode>,
      },
    ],
  },
];
