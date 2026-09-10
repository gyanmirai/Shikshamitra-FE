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

describe('Accounts permission controls', () => {
  it('renders separate Edit and Change Status switches using the exact permission base', () => {
    const onToggle = renderNode(['View', 'Add', 'Edit', 'ChangeStatus', 'Delete']);
    fireEvent.click(screen.getByLabelText('Edit'));
    expect(onToggle).toHaveBeenLastCalledWith(base, 'Edit', false);
    fireEvent.click(screen.getByLabelText('ChangeStatus'));
    expect(onToggle).toHaveBeenLastCalledWith(base, 'ChangeStatus', false);
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
    expect(toggle).toHaveBeenLastCalledWith(root, action, true);
  });
  expect(screen.queryByLabelText('Edit')).not.toBeInTheDocument();
  expect(screen.queryByLabelText('Publish')).not.toBeInTheDocument();
});
