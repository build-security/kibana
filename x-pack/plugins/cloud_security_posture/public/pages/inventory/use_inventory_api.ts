/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { useQuery } from 'react-query';
import { useKibana } from '../../../../../../src/plugins/kibana_react/public';
import { INVENTORY_ROUTE_PATH } from '../../../common/constants';

const getInventoryKey = 'csp_inventory';

export const useInventoryApi = () => {
  const { http } = useKibana().services;
  return useQuery([getInventoryKey], () => http!.get<any>(INVENTORY_ROUTE_PATH));
};
