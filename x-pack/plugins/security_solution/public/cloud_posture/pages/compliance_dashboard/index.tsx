/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useEffect, useState } from 'react';
import { EuiSpacer, EuiTitle } from '@elastic/eui';
import {
  euiPaletteColorBlind,
  euiPaletteComplimentary,
  euiPaletteCool,
  euiPaletteForStatus,
  euiPaletteForTemperature,
  euiPaletteGray,
  euiPaletteNegative,
  euiPalettePositive,
  euiPaletteWarm,
} from '@elastic/eui/lib/services';
import { SummarySection } from './dashboard_sections/summary_section';
import { AccumulatedSection } from './dashboard_sections/accumulated_section';
import { FrameworksSection } from './dashboard_sections/frameworks_section';
import { DateValue } from './compliance_charts/charts_data_types';
import { SecuritySolutionPageWrapper } from '../../../common/components/page_wrapper';
import { HeaderPage } from '../../../common/components/header_page';
import { SpyRoute } from '../../../common/utils/route/spy_routes';
import { CloudPosturePage } from '../../../app/types';
import { useCloudPostureScoreApi } from '../../common/api/use_cloud_posture_score_api';
import { useKibana } from '../../../common/lib/kibana';
import { DataView } from '../../../../../../../src/plugins/data_views/common/data_views';

const paletteData = {
  euiPaletteColorBlind,
  euiPaletteForStatus,
  euiPaletteForTemperature,
  euiPaletteComplimentary,
  euiPaletteNegative,
  euiPalettePositive,
  euiPaletteCool,
  euiPaletteWarm,
  euiPaletteGray,
};

export const dateValueToTuple = ({ date, value }: DateValue) => [date, value];

const CompliancePage = () => {
  const getScore = useCloudPostureScoreApi();
  console.log(getScore);

  return (
    <>
      <EuiTitle>
        <h3>{'Summary'}</h3>
      </EuiTitle>
      <EuiSpacer />
      <SummarySection />
      <EuiSpacer />
      <AccumulatedSection />
      <EuiSpacer />
      <EuiTitle>
        <h3>{'Frameworks'}</h3>
      </EuiTitle>
      <EuiSpacer />
      <FrameworksSection />
      <EuiSpacer />
    </>
  );
};

export const ComplianceDashboard = () => {
  return (
    <SecuritySolutionPageWrapper noPadding={false}>
      <HeaderPage hideSourcerer border title="Compliance" />
      <CompliancePage />
      <SpyRoute pageName={CloudPosturePage.dashboard} />
    </SecuritySolutionPageWrapper>
  );
};
