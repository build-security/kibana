/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  KibanaPageTemplate,
  KibanaPageTemplateProps,
} from '../../../../../src/plugins/kibana_react/public';
import { getAllNavigationItems } from '../common/navigation/constants';
import { CLOUD_SECURITY_POSTURE } from '../common/translations';

const activeItemStyle = { fontWeight: 700 };

const getSideNavItems = (): NonNullable<KibanaPageTemplateProps['solutionNav']>['items'] =>
  Object.values(getAllNavigationItems())
    .filter((navigationItem) => !navigationItem.disabled)
    .map((navigationItem) => ({
      id: navigationItem.id,
      name: navigationItem.name,
      renderItem: () => (
        <NavLink to={navigationItem.path} activeStyle={activeItemStyle}>
          {navigationItem.name}
        </NavLink>
      ),
    }));

const getDefaultProps = (): KibanaPageTemplateProps => ({
  solutionNav: {
    name: CLOUD_SECURITY_POSTURE,
    items: getSideNavItems(),
  },
  restrictWidth: false,
  template: 'default',
});

export const CspPageTemplate: React.FC<KibanaPageTemplateProps> = ({ children, ...props }) => {
  return (
    <KibanaPageTemplate {...getDefaultProps()} {...props}>
      {children}
    </KibanaPageTemplate>
  );
};
