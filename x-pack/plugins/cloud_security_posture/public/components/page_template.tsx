/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import React from 'react';
import { NavLink } from 'react-router-dom';
import { EuiEmptyPrompt, EuiErrorBoundary, EuiTitle } from '@elastic/eui';
import {
  KibanaPageTemplate,
  type KibanaPageTemplateProps,
} from '../../../../../src/plugins/kibana_react/public';
import { useKubebeatDataView } from '../common/api/use_kubebeat_data_view';
import { allNavigationItems } from '../common/navigation/constants';
import type { CspNavigationItem } from '../common/navigation/types';
import { CLOUD_SECURITY_POSTURE } from '../common/translations';
import { CspLoadingState } from './csp_loading_state';
import {
  ERROR_LOADING_DATA,
  LOADING,
  NO_DATA_CONFIG_BUTTON,
  NO_DATA_CONFIG_DESCRIPTION,
  NO_DATA_CONFIG_SOLUTION_NAME,
  NO_DATA_CONFIG_TITLE,
} from './translations';

const activeItemStyle = { fontWeight: 700 };

export const getSideNavItems = (
  navigationItems: Record<string, CspNavigationItem>
): NonNullable<KibanaPageTemplateProps['solutionNav']>['items'] =>
  Object.entries(navigationItems)
    .filter(([_, navigationItem]) => !navigationItem.disabled)
    .map(([id, navigationItem]) => ({
      id,
      name: navigationItem.name,
      renderItem: () => (
        <NavLink to={navigationItem.path} activeStyle={activeItemStyle}>
          {navigationItem.name}
        </NavLink>
      ),
    }));

const DEFAULT_PROPS: KibanaPageTemplateProps = {
  solutionNav: {
    name: CLOUD_SECURITY_POSTURE,
    items: getSideNavItems(allNavigationItems),
  },
  restrictWidth: false,
  template: 'default',
};

const NO_DATA_CONFIG: KibanaPageTemplateProps['noDataConfig'] = {
  pageTitle: NO_DATA_CONFIG_TITLE,
  solution: NO_DATA_CONFIG_SOLUTION_NAME,
  // TODO: Add real docs link once we have it https://github.com/elastic/security-team/issues/3105
  docsLink: 'https://www.elastic.co/guide/index.html',
  logo: 'logoSecurity',
  actions: {
    elasticAgent: {
      // TODO: Use `href` prop to link to our own integration once we have it https://github.com/elastic/security-team/issues/3104
      title: NO_DATA_CONFIG_BUTTON,
      description: NO_DATA_CONFIG_DESCRIPTION,
    },
  },
};

export const CspPageTemplate: React.FC<KibanaPageTemplateProps> = ({ children, ...props }) => {
  // TODO: Consider using more sophisticated logic to find out if our integration is installed
  const { status: kubeBeatFetchStatus, data: kubeBeatDataView } = useKubebeatDataView();

  let noDataConfig: KibanaPageTemplateProps['noDataConfig'];
  if (kubeBeatFetchStatus === 'success' && !kubeBeatDataView) {
    noDataConfig = NO_DATA_CONFIG;
  }

  return (
    <KibanaPageTemplate {...DEFAULT_PROPS} {...props} noDataConfig={noDataConfig}>
      <EuiErrorBoundary>
        {kubeBeatFetchStatus === 'loading' && <CspLoadingState>{LOADING}</CspLoadingState>}
        {kubeBeatFetchStatus === 'error' && (
          <EuiEmptyPrompt
            color="danger"
            iconType="alert"
            title={
              <EuiTitle>
                <h2>{ERROR_LOADING_DATA}</h2>
              </EuiTitle>
            }
          />
        )}
        {kubeBeatFetchStatus === 'success' && children}
      </EuiErrorBoundary>
    </KibanaPageTemplate>
  );
};
