/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { EuiSpacer } from '@elastic/eui';
import styled from 'styled-components';
import { DataView } from '../../../../../../src/plugins/data/common';
import { RulesTable } from './rules_table';
import { useKibana } from '../../../../../../src/plugins/kibana_react/public';

import type { FetchState } from './types';
import { CSPRule } from '../../../common/types';
import type { CspPluginSetup } from '../../types';

import { RulesSearchBar } from './rules_search_bar';

import { CSP_KUBEBEAT_INDEX } from '../../../common/constants';

/**
 * This component syncs the RulesTable with RulesSearchBar
 */
export const RulesTableContainer = () => {
  const { cspRulesDataView } = useCspRulesDataView();
  const [state, set] = useState<FetchState<CSPRule[]>>({
    loading: false,
    error: false,
    data: [],
  });

  const onError = useCallback((v) => set({ error: v, loading: false, data: undefined }), []);
  const onSuccess = useCallback((v) => set({ error: false, loading: false, data: v }), []);
  const onLoading = useCallback(() => set({ error: false, loading: true, data: undefined }), []);

  if (!cspRulesDataView) return null;

  return (
    <Wrapper>
      <RulesSearchBar
        dataView={cspRulesDataView}
        onError={onError}
        onSuccess={onSuccess}
        onLoading={onLoading}
        {...state}
      />
      <EuiSpacer />
      <RulesTable {...state} />
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
`;

/**
 *  Temp DataView Utility
 *  TODO: use perfected kibana data views
 */
const useCspRulesDataView = () => {
  const [cspRulesDataView, setCspRulesDataView] = useState<DataView>();
  const {
    data: { dataViews },
  } = useKibana<CspPluginSetup>().services; // TODO: is this the right generic?
  useEffect(() => {
    if (!dataViews) return;
    (async () => setCspRulesDataView((await dataViews.find(CSP_KUBEBEAT_INDEX))?.[0]))();
  }, [dataViews]);
  return { cspRulesDataView };
};
