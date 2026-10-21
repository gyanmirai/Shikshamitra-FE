import React from 'react';
import { it, vi, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings';
import { render, screen, fireEvent } from '@testing-library/react';

import PermissionInlineEditor from './permission-inline-editor';

import type { MatrixAction } from './permission-matrix-model';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

const action: MatrixAction = {
  action: 'View',
  label: 'View',
  names: ['HR.PayrollManagement.RunPayroll.View'],
  rule: 'allow',
  result: 'Allowed',
  roleResult: 'Denied',
  sources: [],
  editable: true,
  overridden: false,
  hasDirect: true,
};

function renderEditor(overrides: Partial<MatrixAction>, user = false, visibility = false) {
  const onChange = vi.fn();
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <PermissionInlineEditor
        feature="Run Payroll"
        action={{ ...action, ...overrides }}
        user={user}
        visibility={visibility}
        disabled={false}
        onChange={onChange}
      />
    </ThemeProvider>
  );
  return onChange;
}

describe('permission source summary', () => {
  it('keeps the effective role result and direct source available without adding visible rows', async () => {
    const onChange = renderEditor({});
    const summary = 'Allowed. Direct grant. Direct grants apply to this role.';

    expect(screen.getByText(summary)).not.toBeVisible();
    expect(screen.getByRole('radiogroup')).toHaveAccessibleDescription(summary);

    fireEvent.mouseOver(screen.getByRole('radiogroup'));
    expect(await screen.findByRole('tooltip')).toHaveTextContent(summary);

    fireEvent.click(screen.getByRole('radio', { name: 'Revoke' }));
    expect(onChange).toHaveBeenCalledWith('inherit');
  });

  it('shows role access and role names when an explicit user denial overrides them', () => {
    const onChange = renderEditor(
      {
        rule: 'deny',
        result: 'Denied',
        roleResult: 'Allowed',
        sources: ['Administrative Manager', 'Payroll Approver'],
        overridden: true,
        hasDirect: false,
      },
      true
    );

    expect(screen.getByRole('radiogroup')).toHaveAccessibleDescription(
      'Denied. User override. Role default: Allowed from Administrative Manager, Payroll Approver. This user override stays when role permissions change.'
    );
    expect(screen.getByText(/^Denied\. User override\./)).not.toBeVisible();
    expect(screen.getByRole('radio', { name: 'Deny' })).toBeChecked();
    expect(screen.getByText('Allowed by role')).toBeVisible();
    expect(screen.getByText('User override: Denied')).toBeVisible();

    fireEvent.click(screen.getByRole('radio', { name: 'Follow role' }));
    expect(onChange).toHaveBeenCalledWith('inherit');
  });

  it('does not describe mixed role visibility as hidden', () => {
    renderEditor(
      {
        rule: 'inherit',
        result: 'Mixed access',
        roleResult: 'Mixed access',
        sources: ['Administrative Manager'],
        hasDirect: false,
      },
      true,
      true
    );

    expect(screen.getByRole('radiogroup')).toHaveAccessibleDescription(
      /Role default: Mixed access from Administrative Manager/
    );
    expect(screen.queryByText(/Role default: Hidden/)).not.toBeInTheDocument();
  });

  it.each([
    ['Allowed', false, 'Allowed by role'],
    ['Denied', false, 'Denied by role'],
    ['Mixed access', false, 'Mixed role access'],
    ['Allowed', true, 'Visible by role'],
    ['Denied', true, 'Hidden by role'],
    ['Mixed access', true, 'Mixed role access'],
  ] as const)(
    'makes the %s role value visible (visibility: %s)',
    (roleResult, visibility, text) => {
      const onChange = renderEditor(
        { rule: 'inherit', roleResult, hasDirect: false },
        true,
        visibility
      );
      expect(screen.getByText(text)).toBeVisible();
      expect(screen.getByRole('radio', { name: 'Follow role' })).toBeChecked();
      expect(onChange).not.toHaveBeenCalled();
    }
  );

  it('does not present a missing catalogue action as denied by role', () => {
    renderEditor({ rule: 'inherit', result: 'Unavailable', editable: false }, true);
    expect(screen.getByText('Role value unavailable')).toBeVisible();
    expect(screen.queryByText('Denied by role')).not.toBeInTheDocument();
    screen.getAllByRole('radio').forEach((radio) => expect(radio).toBeDisabled());
  });
});
