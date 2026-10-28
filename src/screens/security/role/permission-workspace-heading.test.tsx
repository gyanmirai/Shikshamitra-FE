import React from 'react';
import { it, vi, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings';

import PermissionWorkspaceHeading from './permission-workspace-heading';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

describe('permission workspace navigation guidance', () => {
  it.each([true, false])('explains separate visibility in the action editor (user: %s)', (user) => {
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <PermissionWorkspaceHeading
          moduleTitle="Finance"
          title="Finance"
          sources={[]}
          user={user}
          visibility={false}
          rows={[]}
        />
      </ThemeProvider>
    );

    expect(
      screen.getByText(
        'Sidebar and dashboard access are configured separately in Set Module Visibility.'
      )
    ).toBeVisible();
  });

  it('keeps the visibility editor description focused on navigation', () => {
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <PermissionWorkspaceHeading
          moduleTitle="Finance"
          title="Finance"
          sources={[]}
          user
          visibility
          rows={[]}
        />
      </ThemeProvider>
    );

    expect(screen.getByText('Manage navigation visibility for this user.')).toBeVisible();
    expect(screen.queryByText(/Sidebar and dashboard access/)).not.toBeInTheDocument();
  });
});
