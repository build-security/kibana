/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import React, { useState, Fragment, useContext, useEffect } from 'react';
import {
  Chart,
  Settings,
  Axis,
  LineSeries,
  BarSeries,
  DataGenerator,
  Partition,
} from '@elastic/charts';
import {
  EuiFlexGrid,
  EuiFlexItem,
  EuiTitle,
  EuiSpacer,
  EUI_CHARTS_THEME_DARK,
  EUI_CHARTS_THEME_LIGHT,
  EuiPanel,
  EuiText,
  euiTextSubduedColor,
  euiColorLightShade,
} from '@elastic/eui';
import {
  euiPaletteColorBlind,
  euiPaletteComplimentary,
  euiPaletteForStatus,
  euiPaletteForTemperature,
  euiPaletteCool,
  euiPaletteWarm,
  euiPaletteNegative,
  euiPalettePositive,
  euiPaletteGray,
} from '@elastic/eui/lib/services';
import styled from 'styled-components'
import { useHistory } from 'react-router-dom';
import { SummarySection } from './dashboard_sections/summary_section';
import { AccumulatedSection } from './dashboard_sections/accumulated_section';
import { ListSection } from './dashboard_sections/list_section';
import { DateValue } from './compliance_charts/charts_data_types';
import { SecuritySolutionPageWrapper } from '../../../common/components/page_wrapper';
import { HeaderPage } from '../../../common/components/header_page';
import { CloudPostureScoreChart } from './cloud_posture_score_chart';
import { SpyRoute } from '../../../common/utils/route/spy_routes';
import { CloudPosturePage } from '../../../app/types';

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

export const ComplianceDashboard = () => {

  return (
      <SecuritySolutionPageWrapper noPadding={false} >
        <HeaderPage hideSourcerer border title='Compliance' />
          <EuiTitle>
            <h3>Summary</h3>
          </EuiTitle>
          <EuiSpacer />
          <SummarySection />
          <EuiSpacer />
          <AccumulatedSection />
          <EuiSpacer />
          <EuiTitle>
            <h3>Frameworks</h3>
          </EuiTitle>
          <EuiSpacer />
          <ListSection />
        <EuiSpacer />
        <SpyRoute pageName={CloudPosturePage.dashboard} />
      </SecuritySolutionPageWrapper>
  );
};
