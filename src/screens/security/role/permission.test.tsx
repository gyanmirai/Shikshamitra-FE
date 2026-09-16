import React from 'react';
import { it, vi, expect } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings';
import { render, screen, fireEvent } from '@testing-library/react';

import Permission from './permission';

import type { CataloguePermission } from './permission-catalogue';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

vi.mock('src/layouts/config-nav-dashboard', () => ({
  fullSecurityNavData: () => [
    {
      items: [
        {
          title: 'HR/Staff',
          permissionName: 'ShikshaMitra.Module.HR',
          submodule: [
            {
              title: 'Payroll Management',
              children: [{ title: 'ESI', permissionName: 'ESI.View' }],
            },
          ],
        },
      ],
    },
  ],
}));
const entry = (name: string, parentName?: string): CataloguePermission => ({
  name,
  parentName,
  displayName: name.split('.').at(-1)!,
  isGranted: false,
  allowedProviders: [],
  grantedProviders: [],
});
it('allows configuring hidden modules and bulk removal includes search-hidden actions', () => {
  const entries = [
    entry('ShikshaMitra.Module.HR'),
    entry('ESI'),
    entry('ESI.View', 'ESI'),
    entry('ESI.Activate', 'ESI'),
    entry('ESI.FutureAction', 'ESI'),
  ];
  const setGrants = vi.fn();
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <Permission
        catalogue={{ groups: [{ name: 'HR', displayName: 'HR', permissions: entries }] }}
        provider={{ providerName: 'R', providerKey: 'role' }}
        grants={{ 'ESI.Activate': true, 'ESI.FutureAction': true }}
        setGrants={setGrants}
      />
    </ThemeProvider>
  );
  fireEvent.click(screen.getByRole('button', { name: 'HR/Staff' }));
  fireEvent.click(screen.getByRole('button', { name: 'Payroll Management' }));
  expect(screen.getByText(/Navigation is hidden/)).toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Search permissions'), { target: { value: 'Activate' } });
  expect(screen.queryByRole('switch', { name: 'ESI: FutureAction' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Revoke All (4)' }));
  expect(setGrants).toHaveBeenCalledExactlyOnceWith(
    ['ESI', 'ESI.View', 'ESI.Activate', 'ESI.FutureAction'],
    false
  );
  expect(setGrants.mock.calls[0][0]).not.toContain('ShikshaMitra.Module.HR');
});
