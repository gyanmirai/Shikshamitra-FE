import React from 'react';
import { it, vi, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings';
import { render, screen, fireEvent } from '@testing-library/react';

import PermissionNode from './permission-node';

const base = 'Finance.Accounts.Settings.IncomeCategory';

function renderNode(actions: string[]) {
  const onToggle = vi.fn();
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <PermissionNode
        node={{ title: 'Income Category', permissionName: `${base}.View` }}
        moduleTitle="Finance"
        submoduleTitle="Accounts"
        permissions={actions.map((action) => ({ name: `${base}.${action}`, isGranted: false }))}
        onToggle={onToggle}
        onSelectAll={vi.fn()}
        setPermission={vi.fn()}
      />
    </ThemeProvider>
  );
  return onToggle;
}

describe('Student rows with unavailable actions', () => {
  it('maps Student Onboarding to the canonical server action bundle', () => {
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <PermissionNode
          node={{ title: 'Student Setup', permissionName: 'Students.Onboarding.View' }}
          moduleTitle="Student"
          submoduleTitle="Student Onboarding"
          permissions={['View', 'Add', 'Delete'].map((action) => ({
            name: `Students.Onboarding.${action}`,
            isGranted: false,
          }))}
          onToggle={vi.fn()}
          onSelectAll={vi.fn()}
          setPermission={vi.fn()}
        />
      </ThemeProvider>
    );

    ['View', 'Add', 'Delete'].forEach((action) => {
      expect(screen.getByRole('switch', { name: action })).toBeEnabled();
    });
    expect(screen.getByRole('button', { name: 'Grant All' })).toBeEnabled();
    expect(screen.queryByText(/permissions are missing from the server/)).not.toBeInTheDocument();
  });

  it.each([{ actions: ['View'] }, { actions: ['View', 'Create'] }])(
    'can revoke all available grants when the catalogue only contains $actions',
    ({ actions }) => {
      const root = 'Students.Admissions.Applications';
      const node = { title: 'All Applications', permissionName: `${root}.View` };
      const onSelectAll = vi.fn();
      render(<ThemeProvider theme={createTheme(defaultSettings)}>
        <PermissionNode node={node} moduleTitle="Student" submoduleTitle="Admissions"
          permissions={actions.map((action) => ({ name: `${root}.${action}`, isGranted: true }))}
          onToggle={vi.fn()} onSelectAll={onSelectAll} setPermission={vi.fn()} />
      </ThemeProvider>);

      expect(screen.getByRole('switch', { name: 'Delete' })).toBeDisabled();
      fireEvent.click(screen.getByRole('button', { name: 'Revoke All' }));
      expect(onSelectAll).toHaveBeenCalledExactlyOnceWith(node, false, false);
    }
  );

  it('disables Grant All when no matching server permissions exist', () => {
    render(<ThemeProvider theme={createTheme(defaultSettings)}>
      <PermissionNode node={{ title: 'Student Setup', permissionName: 'Students.Setup.View' }}
        moduleTitle="Student" submoduleTitle="Student Onboarding" permissions={[]}
        onToggle={vi.fn()} onSelectAll={vi.fn()} setPermission={vi.fn()} />
    </ThemeProvider>);

    expect(screen.getByRole('button', { name: 'Grant All' })).toBeDisabled();
    expect(screen.getByText(/permissions are missing from the server/)).toBeInTheDocument();
  });
});

describe('Statutory Schemes controls', () => {
  it.each(['Activate', 'FutureAction'])('can revoke a lone %s grant while both visible groups are off', (action) => {
    const root = 'HR.PayrollManagement.Settings.StatutorySchemes';
    const node = { title: 'Statutory Schemes', permissionName: `${root}.View` };
    const onSelectAll = vi.fn();
    render(<ThemeProvider theme={createTheme(defaultSettings)}>
      <PermissionNode node={node} moduleTitle="HR/Staff" submoduleTitle="Payroll Management"
        permissions={['View', 'Edit', 'Activate', 'ManageEnrollment', 'ApproveOverride', 'FutureAction']
          .map((name) => ({ name: `${root}.${name}`, isGranted: name === action }))}
        onToggle={vi.fn()} onSelectAll={onSelectAll} setPermission={vi.fn()} />
    </ThemeProvider>);
    expect(screen.getAllByRole('switch')).toHaveLength(3);
    expect(screen.getByRole('switch', { name: 'View' })).not.toBeChecked();
    expect(screen.getByRole('switch', { name: 'Edit' })).not.toBeChecked();
    expect(screen.getByRole('switch', { name: 'Delete' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Revoke All' }));
    expect(onSelectAll).toHaveBeenCalledExactlyOnceWith(node, false, false);
  });
});

describe('Accounts permission controls', () => {
  it('renders separate Edit and Change Status switches using the exact permission base', () => {
    const onToggle = renderNode(['View', 'Add', 'Edit', 'ChangeStatus', 'Delete']);
    fireEvent.click(screen.getByLabelText('Edit'));
    expect(onToggle).toHaveBeenLastCalledWith(
      expect.objectContaining({ permissionName: `${base}.View` }),
      'Edit',
      false
    );
    fireEvent.click(screen.getByLabelText('ChangeStatus'));
    expect(onToggle).toHaveBeenLastCalledWith(
      expect.objectContaining({ permissionName: `${base}.View` }),
      'ChangeStatus',
      false
    );
    expect(screen.queryByText(/permissions are missing/)).not.toBeInTheDocument();
  });

  it('explains an outdated server catalog and prevents granting nonexistent permissions', () => {
    renderNode([]);
    expect(screen.getByText(/permissions are missing from the server/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Grant All' })).toBeDisabled();
    expect(screen.queryByLabelText('Edit')).not.toBeInTheDocument();
  });
});


it('toggles all three Fee Structure switches against canonical API names', () => {
  const root = 'Finance.Settings.FeeStructure';
  const toggle = vi.fn();
  render(<ThemeProvider theme={createTheme(defaultSettings)}>
    <PermissionNode node={{ title: 'Fee Structure', permissionName: `${root}.View` }}
      moduleTitle="Finance" submoduleTitle="Settings"
      permissions={['View', 'Add', 'Delete'].map((action) => ({ name: `${root}.${action}`, isGranted: true }))}
      onToggle={toggle} onSelectAll={vi.fn()} setPermission={vi.fn()} />
  </ThemeProvider>);
  ['View', 'Add', 'Delete'].forEach((action) => {
    expect(screen.getByLabelText(action)).toBeChecked();
    fireEvent.click(screen.getByLabelText(action));
    expect(toggle).toHaveBeenLastCalledWith(
      expect.objectContaining({ permissionName: `${root}.View` }),
      action,
      true
    );
  });
  expect(screen.queryByLabelText('Edit')).not.toBeInTheDocument();
  expect(screen.queryByLabelText('Publish')).not.toBeInTheDocument();
});

it('shows only View, Add, and Delete for specialized Student Admissions actions', () => {
  const root = 'Students.Admissions.Inquiries';
  const toggle = vi.fn();
  const actions = ['View', 'Add', 'Delete', 'Manage', 'Create', 'Edit', 'Assign'];
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <PermissionNode
        node={{ title: 'Inquiries', permissionName: `${root}.View` }}
        moduleTitle="Student"
        submoduleTitle="Admissions"
        permissions={actions.map((action) => ({
          name: `${root}.${action}`,
          isGranted: false,
        }))}
        onToggle={toggle}
        onSelectAll={vi.fn()}
        setPermission={vi.fn()}
      />
    </ThemeProvider>
  );

  expect(screen.queryByLabelText('Manage')).not.toBeInTheDocument();
  expect(screen.queryByLabelText('Create')).not.toBeInTheDocument();
  expect(screen.queryByLabelText('Edit')).not.toBeInTheDocument();
  expect(screen.queryByLabelText('Assign')).not.toBeInTheDocument();
  expect(screen.getByLabelText('View')).toBeEnabled();
  expect(screen.getByLabelText('Add')).toBeEnabled();
  expect(screen.getByLabelText('Delete')).toBeEnabled();
  fireEvent.click(screen.getByLabelText('Add'));
  expect(toggle).toHaveBeenLastCalledWith(
    expect.objectContaining({ permissionName: `${root}.View` }),
    'Add',
    false
  );
});

it('keeps every Student Dashboard permission switch enabled', () => {
  const root = 'Students.Dashboard';
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <PermissionNode
        node={{ title: 'Dashboard', permissionName: `${root}.View` }}
        moduleTitle="Student"
        submoduleTitle="Dashboard"
        permissions={['View', 'Add', 'Delete'].map((action) => ({
          name: `${root}.${action}`,
          isGranted: false,
        }))}
        onToggle={vi.fn()}
        onSelectAll={vi.fn()}
        setPermission={vi.fn()}
      />
    </ThemeProvider>
  );

  ['View', 'Add', 'Delete'].forEach((action) => {
    expect(screen.getByLabelText(action)).toBeEnabled();
  });
  expect(screen.getByRole('button', { name: 'Grant All' })).toBeEnabled();
  expect(screen.queryByText(/permissions are missing/)).not.toBeInTheDocument();
});
