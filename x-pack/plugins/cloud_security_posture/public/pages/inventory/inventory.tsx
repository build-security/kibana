/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */
import React from 'react';
import { EuiPageHeaderProps, EuiPanel } from '@elastic/eui';
import { EuiBasicTable, type EuiBasicTableColumn } from '@elastic/eui';
import { allNavigationItems } from '../../common/navigation/constants';
import { useCspBreadcrumbs } from '../../common/navigation/use_csp_breadcrumbs';
import { CspPageTemplate } from '../../components/page_template';
import { useInventoryApi } from './use_inventory_api';

const PAGE_HEADER: EuiPageHeaderProps = {
  pageTitle: 'Inventory',
};

export const Inventory = () => {
  useCspBreadcrumbs([allNavigationItems.inventory]);
  const query = useInventoryApi();

  console.log(query);

  const render = (status: any) => {
    if (status === 'error') return <>error</>;
    if (status === 'loading') return <>loading</>;
    if (status === 'success') return <InventoryTable items={query.data.inventory} />;
  };

  return (
    <CspPageTemplate pageHeader={PAGE_HEADER} isLoading={query.status === 'loading'}>
      {render(query.status)}
    </CspPageTemplate>
  );
};

const INVENTORY_TABLE_COLUMNS: Array<EuiBasicTableColumn<{}>> = [
  {
    field: 'name',
    name: 'Resource',
    dataType: 'string',
  },
  {
    field: 'instances',
    name: 'Instances',
    dataType: 'string',
  },
];

export const InventoryTable = ({ items }: any) => (
  <EuiPanel hasBorder>
    <EuiBasicTable items={items} columns={INVENTORY_TABLE_COLUMNS} />
  </EuiPanel>
);
