import React from 'react';
import { it, vi, expect } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings';
import { renderWithProviders } from 'src/test/test-utils';
import { screen, within, waitFor, fireEvent } from '@testing-library/react';

import PermissionWorkspace from './permission-workspace';

const moduleName = 'ShikshaMitra.Module.HR';
const visibility = `${moduleName}.Employee`;
const root = 'HR.Employee.EmployeeList';
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/constants/navigation', () => ({
  fullSecurityNavData: () => [
    {
      items: [
        {
          title: 'HR/Staff',
          permissionName: 'ShikshaMitra.Module.HR',
          submodule: [
            {
              title: 'Staff',
              permissionName: 'ShikshaMitra.Module.HR.Employee',
              children: [
                {
                  title: 'Employee List',
                  permissionName: 'HR.Employee.EmployeeList.View',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}));

function renderWorkspace(restricted = false) {
  const setStates = vi.fn();
  const names = [moduleName, visibility, `${root}.View`, `${root}.Add`, `${root}.Delete`];
  renderWithProviders(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <PermissionWorkspace
        catalogue={{
          groups: [
            {
              name: 'HR',
              displayName: 'HR',
              permissions: names.map((name) => ({
                name,
                displayName: name,
                isGranted: false,
                allowedProviders: restricted && name === visibility ? ['U'] : [],
                grantedProviders: [],
              })),
            },
          ],
        }}
        provider={{ providerName: 'R', providerKey: 'HR Manager' }}
        states={{}}
        setStates={setStates}
        disabled={false}
      />
    </ThemeProvider>
  );
  fireEvent.click(screen.getByRole('button', { name: 'HR/Staff' }));
  return setStates;
}

it('disables hidden feature permissions and exposes the prerequisite guidance', async () => {
  renderWorkspace();
  const editor = screen.getByRole('group', { name: 'Employee List View editor' });
  expect(within(editor).getByRole('radio', { name: 'Allow' })).toBeDisabled();
  fireEvent.mouseOver(within(editor).getByRole('radiogroup').parentElement!);
  expect(await screen.findByRole('tooltip')).toHaveTextContent(
    "Enable Visibility access for this feature in 'Set Visibility' before configuring module permissions."
  );
});

it('keeps cancellation clean and confirms visibility and actions in one draft change', async () => {
  const setStates = renderWorkspace();
  fireEvent.click(screen.getByRole('button', { name: 'Grant all Employee List permissions' }));
  const dialog = screen.getByRole('dialog', { name: 'Enable Navigation Visibility?' });
  expect(dialog).toHaveTextContent(
    'Enabling module permissions will automatically grant Navigation Visibility'
  );
  expect(setStates).not.toHaveBeenCalled();
  fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(setStates).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Grant all Employee List permissions' }));
  fireEvent.click(screen.getByRole('button', { name: 'Enable visibility and grant' }));
  expect(setStates).toHaveBeenCalledOnce();
  expect(new Set(setStates.mock.calls[0][0])).toEqual(
    new Set([`${root}.View`, `${root}.Add`, `${root}.Delete`, moduleName, visibility])
  );
  expect(setStates.mock.calls[0][1]).toBe('allow');
});

it('does not silently grant a prerequisite unavailable to the selected provider', () => {
  const setStates = renderWorkspace(true);
  fireEvent.click(screen.getByRole('button', { name: 'Grant all Employee List permissions' }));
  expect(screen.getByRole('button', { name: 'Enable visibility and grant' })).toBeDisabled();
  expect(screen.getByRole('alert')).toHaveTextContent('cannot be changed for this role or user');
  expect(setStates).not.toHaveBeenCalled();
});
