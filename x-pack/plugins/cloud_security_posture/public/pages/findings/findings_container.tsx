/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React, { useCallback, useEffect, useState } from 'react';
// TODO: switch css to @emotion
// eslint-disable-next-line @kbn/eslint/module_migration
import styled from 'styled-components';
import { EuiSpacer } from '@elastic/eui';
import { FindingsTable } from './findings_table';
import { useKibana } from '../../../../../../src/plugins/kibana_react/public';
import { FindingsSearchBar } from './findings_search_bar';
import { CSP_KUBEBEAT_INDEX } from '../../../common/constants';

import type { DataView } from '../../../../../../src/plugins/data/common';
import type { CSPFinding, FetchState } from './types';
import type { CspPluginSetup } from '../../types';

// TODO: find similar/existing function
const extractErrorMessage = (e: unknown) =>
  typeof e === 'string' ? e : (e as Error)?.message || 'Unknown Error';

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

  const onLoading = useCallback(() => set({ error: false, loading: true, data: undefined }), []);

  const onSuccess = useCallback(
    (v: CSPFinding[]) => set({ error: false, loading: false, data: v }),
    []
  );

  const onError = useCallback(
    (v: unknown) => set({ error: extractErrorMessage(v), loading: false, data: undefined }),
    []
  );

  // TODO:
  // - make sure kibana data view is created automatically, without a user action
  // - add an empty screen state
  if (!kubebeatDataView) return null;

  return (
    <Wrapper data-test-subj="findings_page">
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
    (async () => setKubebeatDataView((await dataViews.find(CSP_KUBEBEAT_INDEX))?.[0]))();
  }, [dataViews]);
  return { kubebeatDataView };
};
