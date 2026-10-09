import React from 'react';
import { it, vi, expect } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings';
import { render, screen, fireEvent } from '@testing-library/react';

import Visibility from './visibility';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/layouts/config-nav-dashboard', () => ({
  fullSecurityNavData: () => [
    {
      items: [
        {
          title: 'HR',
          permissionName: 'ShikshaMitra.Module.HR',
          submodule: [
            { title: 'Payroll', permissionName: 'ShikshaMitra.Module.HR.Payroll' },
            { title: 'Leave', permissionName: 'ShikshaMitra.Module.HR.Leave' },
          ],
        },
      ],
    },
  ],
}));
const initial = [
  { name: 'ShikshaMitra.Module.HR', isGranted: false },
  { name: 'ShikshaMitra.Module.HR.Payroll', isGranted: false },
  { name: 'ShikshaMitra.Module.HR.Leave', isGranted: false },
  { name: 'HR.ESI.Activate', isGranted: true },
];
it('shows inherited visibility without creating a direct grant and toggles an unrelated submodule', () => {
  const setVisibility = vi.fn();
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <Visibility
        visibility={initial}
        setVisibility={setVisibility}
        inherited={new Map([['ShikshaMitra.Module.HR.Payroll', ['role HR Manager']]])}
      />
    </ThemeProvider>
  );
  expect(screen.getByText('Select a module')).toBeInTheDocument();
  const moduleButton = screen.getByRole('button', { name: 'HR' });
  fireEvent.click(moduleButton);
  const payroll = screen.getByRole('switch', { name: 'Payroll visibility' });
  fireEvent.click(moduleButton);
  fireEvent.click(moduleButton);
  expect(moduleButton).toHaveAttribute('aria-pressed', 'true');
  expect(screen.queryByText('Select a module')).not.toBeInTheDocument();
  expect(screen.getByRole('switch', { name: 'Payroll visibility' })).toBe(payroll);
  expect(payroll).toBeChecked();
  expect(payroll).toBeDisabled();
  expect(setVisibility).not.toHaveBeenCalled();
  expect(screen.getByText('Inherited from role HR Manager')).toBeInTheDocument();
  fireEvent.click(payroll);
  expect(setVisibility).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('switch', { name: 'Leave visibility' }));
  expect(setVisibility).toHaveBeenCalledExactlyOnceWith(
    initial.map((entry) => (entry.name.endsWith('.Leave') ? { ...entry, isGranted: true } : entry))
  );
});

it('bulk visibility excludes actions and provider-ineligible entries', () => {
  const setVisibility = vi.fn();
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <Visibility
        visibility={initial}
        setVisibility={setVisibility}
        manageableNames={new Set(['ShikshaMitra.Module.HR.Payroll'])}
      />
    </ThemeProvider>
  );
  fireEvent.click(screen.getByRole('button', { name: 'HR' }));
  expect(screen.getByRole('switch', { name: 'Leave visibility' })).toBeDisabled();
  fireEvent.click(screen.getByRole('switch', { name: 'Select all HR submodule visibility' }));
  expect(setVisibility).toHaveBeenCalledExactlyOnceWith(
    initial.map((entry) =>
      entry.name.endsWith('.Payroll') ? { ...entry, isGranted: true } : entry
    )
  );
});
