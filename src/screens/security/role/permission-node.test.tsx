import React from 'react';
import { it, vi, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings';
import { render, screen, fireEvent } from '@testing-library/react';

import PermissionNode from './permission-node';
import { branchPermissions } from './permission-catalogue';

import type { PermissionBranch, CataloguePermission } from './permission-catalogue';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

const provider = { providerName: 'R', providerKey: 'synthetic-role' };
const entry = (name: string, parentName?: string): CataloguePermission => ({
  name,
  parentName,
  displayName: name.split('.').at(-1)!,
  isGranted: false,
  grantedProviders: [],
  allowedProviders: [],
});
function renderNode(
  node: PermissionBranch,
  options: { granted?: boolean; user?: boolean; disabled?: boolean } = {}
) {
  const onToggle = vi.fn();
  const onBulk = vi.fn();
  const entries = branchPermissions([node]);
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <PermissionNode
        node={node}
        provider={options.user ? { providerName: 'U', providerKey: 'synthetic-user' } : provider}
        grants={Object.fromEntries(entries.map((item) => [item.name, !!options.granted]))}
        subtreeEntries={
          new Map(
            entries.map((item) => [
              item.name,
              entries.filter(
                (child) => child.name === item.name || child.name.startsWith(`${item.name}.`)
              ),
            ])
          )
        }
        onToggle={onToggle}
        onBulk={onBulk}
        disabled={options.disabled}
      />
    </ThemeProvider>
  );
  return { onToggle, onBulk };
}

describe('independent catalogue actions in the retained permission card', () => {
  it.each(['Finance.Settings.FeeStructure', 'Students.Admissions.Inquiries', 'HR.Payroll.ESI'])(
    'renders every %s action, including unfamiliar future actions, without bundling',
    (base) => {
      const actions = [
        'View',
        'Add',
        'Edit',
        'Delete',
        'Create',
        'Manage',
        'Assign',
        'Publish',
        'Activate',
        'ApproveOverride',
        'FutureAction',
      ];
      const { onToggle } = renderNode({
        permission: entry(base),
        children: actions.map((action) => ({
          permission: entry(`${base}.${action}`, base),
          children: [],
        })),
      });
      actions.forEach((action, index) => {
        fireEvent.click(
          screen.getByRole('switch', { name: `${base.split('.').at(-1)}: ${action}` })
        );
        expect(onToggle).toHaveBeenCalledTimes(index + 1);
        expect(onToggle).toHaveBeenLastCalledWith(`${base}.${action}`, true);
      });
    }
  );

  it('expands nested features without granting and bulk includes collapsed actions', () => {
    const node = {
      permission: entry('Payroll'),
      children: [
        {
          permission: entry('Payroll.ESI', 'Payroll'),
          children: [{ permission: entry('Payroll.ESI.Activate', 'Payroll.ESI'), children: [] }],
        },
      ],
    };
    const { onToggle, onBulk } = renderNode(node, { granted: true });
    expect(screen.queryByRole('switch', { name: 'ESI: Activate' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Revoke All (3)' }));
    expect(onBulk).toHaveBeenCalledWith('Payroll', false);
    fireEvent.click(screen.getByRole('button', { name: 'Expand Payroll' }));
    expect(screen.getByRole('switch', { name: 'ESI: Activate' })).toBeChecked();
    expect(onToggle).not.toHaveBeenCalled();
  });

  it('labels role inheritance separately and removes only direct user grants', () => {
    const permission = {
      ...entry('Lock'),
      isGranted: true,
      grantedProviders: [{ providerName: 'R', providerKey: 'Payroll Manager' }],
    };
    const { onBulk } = renderNode({ permission, children: [] }, { granted: true, user: true });
    expect(
      screen.getByText(/Inherited from role Payroll Manager. Remains effective/)
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Remove direct grants (1)' }));
    expect(onBulk).toHaveBeenCalledWith('Lock', false);
    expect(screen.getByText(/does not remove the 1 inherited/)).toBeInTheDocument();
  });

  it('shows provider-ineligible entries without allowing a mutation', () => {
    renderNode(
      { permission: { ...entry('RoleOnly'), allowedProviders: ['R'] }, children: [] },
      { user: true }
    );
    expect(screen.getByRole('switch', { name: 'RoleOnly: RoleOnly' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Grant All (0)' })).toBeDisabled();
    expect(screen.getByText('Managed through R only.')).toBeInTheDocument();
  });

  it('preserves pending-save disabled state', () => {
    renderNode({ permission: entry('Activate'), children: [] }, { disabled: true });
    expect(screen.getByRole('switch')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Grant All (1)' })).toBeDisabled();
  });
});
