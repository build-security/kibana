/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import React, { useState } from 'react';
import {
  EuiFlexItem,
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
  EuiFlexGrid,
  EuiCard,
  PropsOf,
} from '@elastic/eui';
import { assertNever } from '@kbn/std';
import type { CspFinding } from './types';
import { CSPEvaluationBadge } from '../../components/csp_evaluation_badge';
import * as TX from './constants';

const tabs = ['result', 'rule', 'resource'] as const;

type FindingsTab = typeof tabs[number];

type EuiListItemsProps = NonNullable<PropsOf<typeof EuiDescriptionList>['listItems']>[number];

interface Card {
  title: string;
  listItems: Array<[EuiListItemsProps['title'], EuiListItemsProps['description']]>;
}

interface FindingFlyoutProps {
  onClose(): void;
  findings: CspFinding;
}

export const FindingsRuleFlyout = ({ onClose, findings }: FindingFlyoutProps) => {
  const [tab, setTab] = useState<FindingsTab>('result');
  return (
    <EuiFlyout onClose={onClose}>
      <EuiFlyoutHeader>
        <EuiTitle size="l">
          <EuiTextColor color="primary">
            <h2>{TX.FINDINGS}</h2>
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
        <FindingsTab tab={tab} findings={findings} />
      </EuiFlyoutBody>
    </EuiFlyout>
  );
};

const Cards = ({ data }: { data: Card[] }) => (
  <EuiFlexGrid direction="column" gutterSize={'l'}>
    {data.map((card) => (
      <EuiFlexItem key={card.title} style={{ display: 'block' }}>
        <EuiCard textAlign="left" title={card.title}>
          <EuiDescriptionList
            compressed={false}
            type="column"
            listItems={card.listItems.map((v) => ({ title: v[0], description: v[1] }))}
          />
        </EuiCard>
      </EuiFlexItem>
    ))}
  </EuiFlexGrid>
);

const FindingsTab = ({ tab, findings }: { findings: CspFinding; tab: FindingsTab }) => {
  switch (tab) {
    case 'result':
      return <Cards data={getResultCards(findings)} />;
    case 'rule':
      return <Cards data={getRuleCards(findings)} />;
    case 'resource':
      return <Cards data={getResourceCards(findings)} />;
    default:
      assertNever(tab);
  }
};

const getResourceCards = ({ resource }: CspFinding): Card[] => [
  {
    title: TX.RESOURCE,
    listItems: [
      [TX.FILENAME, <EuiCode>{resource.filename}</EuiCode>],
      [TX.MODE, resource.mode],
      [TX.PATH, <EuiCode>{resource.path}</EuiCode>],
      [TX.TYPE, resource.type],
      [TX.UID, resource.uid],
      [TX.GID, resource.gid],
    ],
  },
];

const getRuleCards = ({ rule }: CspFinding): Card[] => [
  {
    title: TX.RULE,
    listItems: [
      [TX.BENCHMARK, rule.benchmark],
      [TX.NAME, rule.name],
      [TX.DESCRIPTION, rule.description],
      [TX.REMEDIATION, <EuiCode>{rule.remediation}</EuiCode>],
      [
        TX.TAGS,
        rule.tags.map((t) => (
          <EuiBadge key={t} color="default">
            {t}
          </EuiBadge>
        )),
      ],
    ],
  },
];

const getResultCards = ({ result, agent, host, ...rest }: CspFinding): Card[] => [
  {
    title: TX.RESULT,
    listItems: [
      [TX.EVALUATION, <CSPEvaluationBadge type={result.evaluation} />],
      [TX.EVIDENCE, <EuiCode>{JSON.stringify(result.evidence, null, 2)}</EuiCode>],
      [TX.TIMESTAMP, rest['@timestamp']],
      result.evaluation === 'failed' && [TX.REMEDIATION, rest.rule.remediation],
    ].filter(Boolean) as Card['listItems'],
  },
  {
    title: TX.AGENT,
    listItems: [
      [TX.NAME, agent.name],
      [TX.ID, agent.id],
      [TX.TYPE, agent.type],
      [TX.VERSION, agent.version],
    ],
  },
  {
    title: TX.HOST,
    listItems: [
      [TX.ARCHITECTURE, host.architecture],
      [TX.CONTAINERIZED, host.containerized ? 'true' : 'false'],
      [TX.HOSTNAME, host.hostname],
      [TX.ID, host.id],
      [TX.IP, host.ip.join(',')],
      [TX.MAC, host.mac.join(',')],
      [TX.NAME, host.name],
    ],
  },
  {
    title: TX.OS,
    listItems: [
      [TX.CODENAME, host.os.codename],
      [TX.FAMILY, host.os.family],
      [TX.KERNEL, host.os.kernel],
      [TX.NAME, host.os.name],
      [TX.PLATFORM, host.os.platform],
      [TX.TYPE, host.os.type],
      [TX.VERSION, host.os.version],
    ],
  },
];
