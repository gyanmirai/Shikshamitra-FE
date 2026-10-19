import { it, expect, describe } from 'vitest';
import { hasGrantedPermission } from 'src/utils/permissions';

import { setPermissionGrants } from './permission-grants';
import { permissionBulkNames } from './permission-bulk-state';
import {
  getNodePermissionActions,
  getAffectedNodePermissionNames,
  getNodeActionPermissionNamesForAction,
} from './account-settings-permissions';

const catalogue = (base: string, actions: string[]) => actions.map((action) => ({ name: `${base}.${action}`, isGranted: false }));

describe('Finance grouped action enforcement', () => {
  const base = 'Finance.Fees.Charges';
  const grants = catalogue(base, ['View', 'Add', 'Update', 'Delete', 'Approve', 'Reject', 'Void', 'Export', 'ViewAudit']);
  const node = { title: 'Charges', permissionName: base };

  it('View reads, exports and audits without granting a write', () => {
    const names = getAffectedNodePermissionNames(node, 'View', true, grants);
    const effective = setPermissionGrants(grants, [...names], true);
    expect([...names]).toEqual([`${base}.View`, `${base}.Export`, `${base}.ViewAudit`]);
    expect(hasGrantedPermission(effective, `${base}.Update`)).toBe(false);
    expect(hasGrantedPermission(effective, `${base}.Delete`)).toBe(false);
  });

  it('Add grants the exact create, update and approval keys plus reading', () => {
    const names = getAffectedNodePermissionNames(node, 'Add', true, grants);
    const effective = setPermissionGrants(grants, [...names], true);
    ['View', 'Add', 'Update', 'Approve', 'Reject'].forEach((action) => {
      expect(hasGrantedPermission(effective, `${base}.${action}`)).toBe(true);
    });
    expect(hasGrantedPermission(effective, `${base}.Delete`)).toBe(false);
    expect(hasGrantedPermission(effective, `${base}.Void`)).toBe(false);
    expect(getNodePermissionActions(base, grants)).toEqual(['View', 'Add', 'Delete']);
  });

  it('Delete grants void/deletion and reading independently of Add and approvals', () => {
    const names = getAffectedNodePermissionNames(node, 'Delete', true, grants);
    const effective = setPermissionGrants(grants, [...names], true);
    expect(hasGrantedPermission(effective, `${base}.Delete`)).toBe(true);
    expect(hasGrantedPermission(effective, `${base}.Void`)).toBe(true);
    expect(hasGrantedPermission(effective, `${base}.View`)).toBe(true);
    expect(hasGrantedPermission(effective, `${base}.Add`)).toBe(false);
    expect(hasGrantedPermission(effective, `${base}.Approve`)).toBe(false);
  });

  it('revoking View clears all grouped writes', () => {
    const names = getAffectedNodePermissionNames(node, 'View', false, grants);
    expect(setPermissionGrants(grants.map((grant) => ({ ...grant, isGranted: true })), [...names], false)
      .every((grant) => !grant.isGranted)).toBe(true);
  });

  it('bulk operations include collapsed children and revoke hidden grants without granting bypasses', () => {
    const refund = 'Finance.Fees.Refund';
    const all = [...grants, ...catalogue(refund, ['View', 'Add', 'Edit', 'Approve', 'Delete', 'OverrideMakerChecker', 'FutureAction'])];
    const names = permissionBulkNames([{ title: 'Fees', children: [node, { title: 'Refund', permissionName: refund }] }], all, new Set(all.map(({name}) => name)));
    expect(names.grant).toContain(`${base}.Update`);
    expect(names.grant).toContain(`${refund}.Approve`);
    expect(names.grant).not.toContain(`${refund}.OverrideMakerChecker`);
    expect(names.grant).not.toContain(`${refund}.FutureAction`);
    expect(names.revoke).toContain(`${refund}.OverrideMakerChecker`);
    expect(names.revoke).toContain(`${refund}.FutureAction`);
  });

  it.each(['Settings.ChargeCategory', 'Settings.ConcessionType', 'Accounts.Settings.IncomeCategory', 'Accounts.Settings.ExpenseCategory', 'Accounts.Settings.BankAccount'])(
    '%s Add includes editing and status changes, not Delete', (feature) => {
      const root = `Finance.${feature}`;
      const entries = catalogue(root, ['View', 'Add', 'Edit', 'ChangeStatus', 'Delete']);
      expect(getNodeActionPermissionNamesForAction(`${root}.View`, 'Add', entries))
        .toEqual(['Add', 'Edit', 'ChangeStatus'].map((action) => `${root}.${action}`));
      expect(getNodePermissionActions(root, entries)).toEqual(['View', 'Add', 'Delete']);
    }
  );

  it.each(['Auditing', 'Fees.InvoiceReceipt', 'Accounts.Reconciliation', 'Fees.FeeCollections', 'Fees.StructureAssign'])(
    '%s hides unsupported writes without inventing grants', (feature) => {
      const root = `Finance.${feature}`;
      const actions = getNodePermissionActions(root, catalogue(root, ['View', 'Add', 'Delete']));
      expect(actions).not.toContain('Delete');
      if (feature === 'Auditing' || feature === 'Fees.InvoiceReceipt') expect(actions).not.toContain('Add');
    }
  );

  it('never submits names absent from older server catalogues or neighbouring features', () => {
    expect(getNodeActionPermissionNamesForAction(base, 'Add', catalogue(base, ['View', 'Add']))).toEqual([`${base}.Add`]);
    expect(getNodePermissionActions(base, [])).toEqual([]);
    expect(getNodeActionPermissionNamesForAction(base, 'Add', catalogue(`${base}Other`, ['Add', 'Update']))).toEqual([]);
  });
});
