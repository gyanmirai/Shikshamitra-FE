import { it, expect } from 'vitest';

import {
  financePermissionActions,
  financeActionPermissionNames,
} from './finance-permission-groups';

it('preserves grouped cash View/Add editor controls using exact server write grants', () => {
  const base = 'Finance.Accounts.CashManagement';
  const permissions = ['View', 'Approve', 'Deposit', 'Reconcile'].map((action) => ({
    name: `${base}.${action}`,
    isGranted: false,
  }));
  expect(financePermissionActions(base, permissions)).toEqual(['View', 'Add']);
  expect(financeActionPermissionNames(base, 'View', permissions)).toEqual([`${base}.View`]);
  expect(financeActionPermissionNames(base, 'Add', permissions)).toEqual([
    `${base}.Approve`,
    `${base}.Deposit`,
    `${base}.Reconcile`,
  ]);
  expect(financeActionPermissionNames(base, 'Delete', permissions)).toEqual([]);
});
