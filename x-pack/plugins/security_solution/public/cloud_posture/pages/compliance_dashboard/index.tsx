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
  const { data: dataService } = useKibana().services;
  const [views, setDataViews] = useState<[DataView, DataView]>();

  const {
    ui: { SearchBar },
    dataViews,
    query,
    search,
  } = dataService;

  const findingsDataView = views?.[1];

  useEffect(() => {
    if (!dataViews) return;
    async function getDataViews() {
      // const dataView = (await dataViews.find('agent_log_2'))?.[0];
      const dataViewLogs = (await dataViews.find('agent_logs'))?.[0];
      const dataViewFindings = (await dataViews.find('findings2'))?.[0];
      const dataViewFindings2 = (await dataViews.find('kube*'))?.[0];
      setDataViews([dataViewLogs, dataViewFindings, dataViewFindings2]);
    }
    getDataViews();
  }, [dataViews]);
  console.log(views);
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
