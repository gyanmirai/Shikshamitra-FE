import React from 'react';
import { it, vi, expect, beforeEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings';
import { renderWithProviders } from 'src/test/test-utils';
import { screen, within, fireEvent } from '@testing-library/react';

import Permission from './permission';

import type { CataloguePermission } from './permission-catalogue';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
beforeEach(() => {
  window.matchMedia = vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
});
const base = 'Students.Admissions.Forms';
vi.mock('src/constants/navigation', () => ({
  fullSecurityNavData: () => [
    {
      items: [
        {
          title: 'Student',
          permissionName: 'ShikshaMitra.Module.Students',
          submodule: [
            {
              title: 'Admissions',
              children: [
                {
                  title: 'Applications',
                  permissionName: 'Students.Admissions.Applications',
                  children: [
                    { title: 'All Applications', permissionName: 'Students.Admissions.Forms.View' },
                  ],
                },
              ],
            },
            {
              title: 'Student Records',
              children: [
                {
                  title: 'Profiles',
                  permissionName: 'Students.Records.View',
                },
              ],
            },
          ],
        },
        {
          title: 'HR/Staff',
          permissionName: 'ShikshaMitra.Module.HR',
          submodule: [
            {
              title: 'Payroll Management',
              children: [
                {
                  title: 'Statutory Schemes',
                  permissionName: 'HR.PayrollManagement.Settings.StatutorySchemes.View',
                },
                {
                  title: 'Salary Templates',
                  permissionName: 'HR.PayrollManagement.Settings.SalaryTemplates.View',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}));
const entry = (name: string): CataloguePermission => ({
  name,
  displayName: name,
  isGranted: true,
  allowedProviders: [],
  grantedProviders: [],
});
function renderPermissions(granted = true, disabled = false, providerName = 'R') {
  const names = ['View', 'Add', 'Delete'].map((action) => `${base}.${action}`);
  const visibility = 'ShikshaMitra.Module.Students';
  const setGrants = vi.fn();
  renderWithProviders(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <Permission
        catalogue={{
          groups: [
            {
              name: 'Students',
              displayName: 'Students',
              permissions: [...names, visibility].map(entry),
            },
          ],
        }}
        provider={{ providerName, providerKey: 'test-provider' }}
        grants={{ ...Object.fromEntries(names.map((name) => [name, granted])), [visibility]: true }}
        setGrants={setGrants}
        disabled={disabled}
      />
    </ThemeProvider>
  );
  if (!disabled) fireEvent.click(screen.getByRole('button', { name: 'Student' }));
  return { names, setGrants };
}

const editor = (action: string, feature = 'All Applications') =>
  within(screen.getByRole('group', { name: `${feature} ${action} editor` }));
it.each(['R', 'U'])(
  'shows the %s module overview and preserves navigation state without changing grants',
  (providerName) => {
    const { setGrants } = renderPermissions(true, false, providerName);
    const student = screen.getByRole('button', { name: 'Student' });
    expect(screen.getByRole('heading', { name: 'Student' })).toBeInTheDocument();
    expect(screen.getByTestId('permission-All Applications')).toBeInTheDocument();
    expect(screen.getByTestId('permission-Profiles')).toBeInTheDocument();
    const admissions = screen.getByRole('button', { name: 'Admissions' });
    fireEvent.click(admissions);
    const row = screen.getByTestId('permission-All Applications');
    expect(screen.queryByTestId('permission-Profiles')).not.toBeInTheDocument();
    fireEvent.click(admissions);
    expect(admissions).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByTestId('permission-All Applications')).toBe(row);
    fireEvent.click(screen.getByRole('button', { name: 'Collapse Applications' }));
    expect(screen.queryByTestId('permission-All Applications')).not.toBeInTheDocument();
    fireEvent.click(admissions);
    expect(screen.getByRole('button', { name: 'Expand Applications' })).toBeInTheDocument();

    fireEvent.click(student);
    expect(screen.getByRole('heading', { name: 'Student' })).toBeInTheDocument();
    expect(admissions).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByTestId('permission-Profiles')).toBeInTheDocument();
    const overviewRow = screen.getByTestId('permission-All Applications');
    fireEvent.click(student);
    expect(screen.getByTestId('permission-All Applications')).toBe(overviewRow);
    expect(setGrants).not.toHaveBeenCalled();
  }
);
it('switches submodules and clears stale selection on a different module', () => {
  const { setGrants } = renderPermissions();
  fireEvent.click(screen.getByRole('button', { name: 'Admissions' }));
  fireEvent.click(screen.getByRole('button', { name: 'Student Records' }));
  expect(screen.getByTestId('permission-Profiles')).toBeInTheDocument();
  expect(screen.queryByTestId('permission-All Applications')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'HR/Staff' }));
  expect(screen.getByRole('heading', { name: 'HR/Staff' })).toBeInTheDocument();
  expect(screen.getByTestId('permission-Statutory Schemes')).toBeInTheDocument();
  expect(screen.getByTestId('permission-Salary Templates')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Payroll Management' })).toHaveAttribute(
    'aria-pressed',
    'false'
  );
  expect(screen.queryByTestId('permission-Profiles')).not.toBeInTheDocument();
  expect(setGrants).not.toHaveBeenCalled();
});
it('maps grouped Student actions and their dependencies without individual backend tiles', () => {
  const { names, setGrants } = renderPermissions();
  fireEvent.click(screen.getByRole('button', { name: 'Admissions' }));
  ['View', 'Add/Update', 'Delete'].forEach((action) => {
    expect(editor(action).getByRole('radio', { name: 'Allow' })).toBeChecked();
  });
  expect(
    screen.queryByRole('group', { name: /All Applications Create editor/ })
  ).not.toBeInTheDocument();
  fireEvent.click(editor('View').getByRole('radio', { name: 'Revoke' }));
  expect(new Set(setGrants.mock.calls[0][0])).toEqual(new Set(names));
  expect(setGrants.mock.calls[0][1]).toBe(false);
});
it('granting Add/Update changes only the canonical Add and View grants', () => {
  const { setGrants } = renderPermissions(false);
  fireEvent.click(screen.getByRole('button', { name: 'Admissions' }));
  fireEvent.click(editor('Add/Update').getByRole('radio', { name: 'Allow' }));
  expect(new Set(setGrants.mock.calls[0][0])).toEqual(
    new Set(['View', 'Add'].map((action) => `${base}.${action}`))
  );
  expect(setGrants.mock.calls[0][1]).toBe(true);
});
it('search reveals matching descendants of collapsed groups without changing grants', () => {
  const { setGrants } = renderPermissions();
  fireEvent.click(screen.getByRole('button', { name: 'Admissions' }));
  fireEvent.click(screen.getByRole('button', { name: 'Collapse Applications' }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Search permissions' }), {
    target: { value: 'All Applications' },
  });
  expect(screen.getByTestId('permission-All Applications')).toBeInTheDocument();
  expect(setGrants).not.toHaveBeenCalled();
});
it('blocks interaction during a save', () => {
  const { setGrants } = renderPermissions(true, true);
  expect(screen.getByRole('button', { name: 'Student' })).toBeDisabled();
  expect(setGrants).not.toHaveBeenCalled();
});
it('keeps statutory Edit independent and leaves unavailable Delete disabled', () => {
  const root = 'HR.PayrollManagement.Settings.StatutorySchemes';
  const edits = ['Edit', 'Activate', 'ManageEnrollment', 'ApproveOverride'].map(
    (action) => `${root}.${action}`
  );
  const visibility = 'ShikshaMitra.Module.HR';
  const names = [
    `${root}.View`,
    ...edits,
    'HR.PayrollManagement.Settings.SalaryTemplates.View',
    visibility,
  ];
  const setGrants = vi.fn();
  renderWithProviders(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <Permission
        catalogue={{ groups: [{ name: 'HR', displayName: 'HR', permissions: names.map(entry) }] }}
        provider={{ providerName: 'R', providerKey: 'test-role' }}
        grants={Object.fromEntries(
          names.map((name) => [name, name === visibility || edits.includes(name)])
        )}
        setGrants={setGrants}
      />
    </ThemeProvider>
  );
  fireEvent.click(screen.getByRole('button', { name: 'HR/Staff' }));
  fireEvent.click(screen.getByRole('button', { name: 'Payroll Management' }));
  fireEvent.click(editor('Edit', 'Statutory Schemes').getByRole('radio', { name: 'Revoke' }));
  expect(setGrants).toHaveBeenCalledExactlyOnceWith(edits, false);
  expect(
    editor('Delete', 'Statutory Schemes').getByRole('radio', { name: 'Allow' })
  ).toBeDisabled();
});
