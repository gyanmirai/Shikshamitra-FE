import React from 'react';
import { it, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings';

import { matrixAction } from './permission-matrix-action';
import PermissionRoleResult from './permission-role-result';

import type { PermissionStates } from './permission-draft-state';
import type { PermissionCatalogue } from './permission-catalogue';

function renderResult(states: PermissionStates, roleGranted: boolean, visibility = false) {
  const catalogue: PermissionCatalogue = {
    groups: [
      {
        name: 'Test',
        displayName: 'Test',
        permissions: Object.keys(states).map((name) => ({
          name,
          displayName: name,
          isGranted: roleGranted,
          allowedProviders: ['U', 'R'],
          grantedProviders: roleGranted ? [{ providerName: 'R', providerKey: 'School Admin' }] : [],
        })),
      },
    ],
  };
  const action = matrixAction(
    Object.keys(states),
    'View',
    {
      catalogue,
      provider: { providerName: 'U', providerKey: 'user-1' },
      states,
    },
    visibility
  );
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <PermissionRoleResult action={action} visibility={visibility} />
    </ThemeProvider>
  );
}

describe('effective user permission status', () => {
  it.each([
    ['allow', false, false, 'Allowed by user override', 'Denied', 'Denied by role'],
    ['deny', true, false, 'Denied by user override', 'Allowed', 'Allowed by role'],
    ['allow', false, true, 'Visible by user override', 'Hidden', 'Hidden by role'],
    ['deny', true, true, 'Hidden by user override', 'Visible', 'Visible by role'],
  ] as const)(
    'shows %s ahead of the role result (visibility: %s)',
    (state, roleGranted, visibility, status, roleDefault, contradictoryStatus) => {
      renderResult({ 'Test.View': state }, roleGranted, visibility);

      expect(screen.getByText(status)).toBeVisible();
      expect(screen.getByText(`Role default: ${roleDefault}`)).toBeVisible();
      expect(screen.queryByText(contradictoryStatus)).not.toBeInTheDocument();
    }
  );

  it('identifies partial grouped access instead of claiming every action is allowed', () => {
    renderResult({ 'Test.View': 'allow', 'Test.Export': 'inherit' }, false);

    expect(screen.getByText('Mixed access with user overrides')).toBeVisible();
    expect(screen.getByText('Role default: Denied')).toBeVisible();
    expect(screen.queryByText('Allowed by user override')).not.toBeInTheDocument();
  });
});
