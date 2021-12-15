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
import { FindingsTable } from './findings_table';
import { useKibana } from '../../../../../../src/plugins/kibana_react/public';

import type { CSPFinding, FetchState } from './types';
import type { CspPluginSetup } from '../../types';

import { FindingsSearchBar } from './findings_search_bar';

import { CSP_KUBEBEAT_INDEX_PATTERN } from '../../../common/constants';

/**
 * This component syncs the FindingsTable with FindingsSearchBar
 */
export const FindingsTableContainer = () => {
  const { kubebeatDataView } = useKubebeatDataView();
  const [state, set] = useState<FetchState<CSPFinding[]>>({
    loading: false,
    error: false,
    data: [],
  });

  const onError = useCallback((v) => set({ error: v, loading: false, data: undefined }), []);
  const onSuccess = useCallback((v) => set({ error: false, loading: false, data: v }), []);
  const onLoading = useCallback(() => set({ error: false, loading: true, data: undefined }), []);

  if (!kubebeatDataView) return null;

  return (
    <Wrapper>
      <FindingsSearchBar
        dataView={kubebeatDataView}
        onError={onError}
        onSuccess={onSuccess}
        onLoading={onLoading}
        {...state}
      />
      <EuiSpacer />
      <FindingsTable {...state} />
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
const useKubebeatDataView = () => {
  const [kubebeatDataView, setKubebeatDataView] = useState<DataView>();
  const {
    data: { dataViews },
  } = useKibana<CspPluginSetup>().services; // TODO: is this the right generic?
  useEffect(() => {
    if (!dataViews) return;
    (async () => setKubebeatDataView((await dataViews.find(CSP_KUBEBEAT_INDEX_PATTERN))?.[0]))();
  }, [dataViews]);
  return { kubebeatDataView };
};
