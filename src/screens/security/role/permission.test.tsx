import React from 'react';
import { it, vi, expect } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings';
import { render, screen, within, fireEvent } from '@testing-library/react';

import Permission from './permission';

import type { CataloguePermission } from './permission-catalogue';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
const base = 'Students.Admissions.Forms';
vi.mock('src/layouts/config-nav-dashboard', () => ({
  fullSecurityNavData: () => [{ items: [{
    title: 'Student', permissionName: 'ShikshaMitra.Module.Students',
    submodule: [{ title: 'Admissions', children: [{
      title: 'Applications', permissionName: 'Students.Admissions.Applications',
      children: [{ title: 'All Applications', permissionName: 'Students.Admissions.Forms.View' }],
    }] }],
  }, {
    title: 'HR/Staff', permissionName: 'ShikshaMitra.Module.HR',
    submodule: [{ title: 'Payroll Management', children: [{
      title: 'Statutory Schemes', permissionName: 'HR.PayrollManagement.Settings.StatutorySchemes.View',
    }, {
      title: 'Salary Templates', permissionName: 'HR.PayrollManagement.Settings.SalaryTemplates.View',
    }] }],
  }] }],
}));
const entry = (name: string): CataloguePermission => ({
  name, displayName: name, isGranted: true, allowedProviders: [], grantedProviders: [],
});
function renderPermissions(granted = true, disabled = false) {
  const names = ['View', 'Create', 'Edit', 'Withdraw'].map((action) => `${base  }.${  action}`);
  const setGrants = vi.fn();
  render(<ThemeProvider theme={createTheme(defaultSettings)}>
    <Permission
      catalogue={{ groups: [{ name: 'Students', displayName: 'Students', permissions: names.map(entry) }] }}
      provider={{ providerName: 'R', providerKey: 'test-role' }}
      grants={Object.fromEntries(names.map((name) => [name, granted]))}
      setGrants={setGrants} disabled={disabled}
    />
  </ThemeProvider>);
  return { names, setGrants };
}
it('restores staging groups and three switches, with no individual backend action tiles', () => {
  const { names, setGrants } = renderPermissions();
  fireEvent.click(screen.getByRole('button', { name: 'Admissions' }));
  fireEvent.click(screen.getByRole('button', { name: 'Expand Applications' }));
  expect(setGrants).not.toHaveBeenCalled();
  expect(screen.getByRole('switch', { name: 'View' })).toBeChecked();
  expect(screen.getByRole('switch', { name: 'Add' })).toBeChecked();
  expect(screen.getByRole('switch', { name: 'Delete' })).toBeChecked();
  expect(screen.queryByRole('switch', { name: /Create|Edit|Withdraw/ })).not.toBeInTheDocument();
  expect(screen.queryByLabelText('Search permissions')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Revoke All' }));
  expect(setGrants).toHaveBeenCalledExactlyOnceWith(names, false);
});
it('row View removal clears grouped actions without bulk switches or expansion side effects', () => {
  const { names, setGrants } = renderPermissions();
  fireEvent.click(screen.getByRole('button', { name: 'Admissions' }));
  expect(screen.queryByText('All Applications')).not.toBeInTheDocument();
  expect(screen.queryByRole('switch', { name: /^All / })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Expand Applications' }));
  expect(setGrants).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('switch', { name: 'View' }));
  expect(setGrants).toHaveBeenCalledExactlyOnceWith(names, false);
});
it('keeps staging Add behavior and only changes the mapped group plus View', () => {
  const { setGrants } = renderPermissions(false);
  fireEvent.click(screen.getByRole('button', { name: 'Admissions' }));
  fireEvent.click(screen.getByRole('button', { name: 'Expand Applications' }));
  fireEvent.click(screen.getByRole('switch', { name: 'Add' }));
  expect(setGrants).toHaveBeenCalledExactlyOnceWith(
    ['View', 'Create', 'Edit'].map((action) => `${base  }.${  action}`), true
  );
});
it('blocks permission changes while saving', () => {
  const { setGrants } = renderPermissions(true, true);
  expect(screen.getByRole('button', { name: 'Admissions' })).toBeDisabled();
  expect(setGrants).not.toHaveBeenCalled();
});

it('revokes all eligible direct statutory grants while preserving provider-ineligible and unrelated entries', () => {
  const root = 'HR.PayrollManagement.Settings.StatutorySchemes';
  const eligible = ['View', 'Edit', 'Activate', 'ManageEnrollment', 'ApproveOverride', 'Future.Action'].map((action) => `${root}.${action}`);
  const restricted = { ...entry(`${root}.RoleOnly`), allowedProviders: ['R'] };
  const unrelated = entry('Finance.Settings.FeeStructure.View');
  const permissions = [...eligible.map(entry), restricted, unrelated];
  const setGrants = vi.fn();
  render(<ThemeProvider theme={createTheme(defaultSettings)}>
    <Permission catalogue={{ groups: [{ name: 'HR', displayName: 'HR', permissions }] }}
      provider={{ providerName: 'U', providerKey: 'test-user' }}
      grants={Object.fromEntries(permissions.map(({ name }) => [name, true]))} setGrants={setGrants} />
  </ThemeProvider>);
  fireEvent.click(screen.getByRole('button', { name: 'HR/Staff' }));
  fireEvent.click(screen.getByRole('button', { name: 'Payroll Management' }));
  fireEvent.click(screen.getByRole('button', { name: 'Revoke All' }));
  expect(setGrants).toHaveBeenCalledExactlyOnceWith(eligible, false);
});

it('limits statutory Edit to its mapped actions without changing salary template grants', () => {
  const root = 'HR.PayrollManagement.Settings.StatutorySchemes';
  const edits = ['Edit', 'Activate', 'ManageEnrollment', 'ApproveOverride'].map((action) => `${root}.${action}`);
  const otherRoot = 'HR.PayrollManagement.Settings.SalaryTemplates';
  const names = [`${root}.View`, ...edits, ...['View', 'Add', 'Edit'].map((action) => `${otherRoot}.${action}`)];
  const setGrants = vi.fn();
  render(<ThemeProvider theme={createTheme(defaultSettings)}>
    <Permission catalogue={{ groups: [{ name: 'HR', displayName: 'HR', permissions: names.map(entry) }] }}
      provider={{ providerName: 'R', providerKey: 'test-role' }}
      grants={Object.fromEntries(names.map((name) => [name, edits.includes(name)]))} setGrants={setGrants} />
  </ThemeProvider>);
  fireEvent.click(screen.getByRole('button', { name: 'HR/Staff' }));
  fireEvent.click(screen.getByRole('button', { name: 'Payroll Management' }));
  expect(screen.queryByRole('switch', { name: /^All / })).not.toBeInTheDocument();
  const statutoryEdit = within(screen.getByTestId('permission-Statutory Schemes')).getByRole('switch', { name: 'Edit' });
  expect(statutoryEdit).toBeChecked();
  fireEvent.click(statutoryEdit);
  expect(setGrants).toHaveBeenCalledExactlyOnceWith(edits, false);
});
