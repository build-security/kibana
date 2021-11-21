/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useState } from 'react';
import {
  Chart,
  Settings,
  Goal,
  BandFillColorAccessorInput,
  Partition,
  Datum,
  PartitionLayout,
} from '@elastic/charts';
import { euiPaletteForStatus, EuiBadge, EuiSpacer } from '@elastic/eui';
import styled from 'styled-components';
import { CspData } from './charts_data_types';

const [green, yellow, red] = euiPaletteForStatus(3);

function getBadgeVariant(value: number) {
  if (value <= 65) return 'danger';
  if (value <= 85) return 'warning';
  if (value <= 100) return 'success';
  return 'error';
}

function getBadgeText(value: number) {
  if (value <= 65) return 'High severity violations';
  if (value <= 85) return 'Some violations';
  if (value <= 100) return 'Compliant';
  return 'error';
}

const mock = 20;

export const ComplianceScoreBadge = ({ postureScore = mock }: CspData) => {
  return (
    <>
      <EuiSpacer />
      <EuiBadge color={getBadgeVariant(postureScore)}>{getBadgeText(postureScore)}</EuiBadge>
    </>
  );
};
