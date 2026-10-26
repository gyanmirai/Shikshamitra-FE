import type React from 'react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';

import { screen } from '@testing-library/react';
import { vi, it, expect, describe } from 'vitest';
import { renderWithProviders } from 'src/test/test-utils';

import { PolicyVersionDrawer } from './PolicyVersionDrawer';

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-icon={icon} />,
}));

vi.mock('./HRPolicySharedUI', () => ({
  DrawerHeader: ({ title }: { title: string }) => <h2>{title}</h2>,
  EmptyRows: () => <tr />,
  InfoTooltipIcon: () => null,
  SectionTable: ({ columns, children }: { columns: string[]; children: React.ReactNode }) => (
    <table>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column}>{column}</th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  ),
}));

describe('PolicyVersionDrawer restore preview summary rendering', () => {
  it('keeps draft creation disabled until restore preview is available', () => {
    renderWithProviders(
      <PolicyVersionDrawer
        ctx={
          {
            versionTarget: {
              policyType: 'payroll',
              policyId: 'payroll-policy-id',
              policyName: 'Teacher Payroll Policy',
            },
            versionHistory: { items: [] },
            versionCompare: null,
            compareVersionIds: { from: null, to: null },
            versionFilters: { action: 'all', search: '' },
            versionPage: { number: 1, size: 20 },
            setVersionPage: vi.fn(),
            versionHistoryLoading: false,
            versionCompareLoading: false,
            isPolicyOperationActive: false,
            canClonePolicy: true,
            restoreVersionState: { isLoading: false },
            restoreVersion: {
              version: {
                id: 'version-id',
                versionNumber: 3,
                name: 'Teacher Payroll Policy',
              },
              name: 'Teacher Payroll Policy v3 Restore Draft',
              reason: 'Restore old version',
            },
            restorePreviewLoading: false,
            restorePreview: null,
            setVersionTarget: vi.fn(),
            setCompareVersionIds: vi.fn(),
            setVersionFilters: vi.fn(),
            setRestoreVersion: vi.fn(),
            restoreVersionAsDraft: vi.fn(),
          } as any
        }
      />
    );

    expect(screen.getByRole('button', { name: /create draft/i })).toBeDisabled();
  });

  it('shows blocking restore preview details and disables draft creation', () => {
    renderWithProviders(
      <PolicyVersionDrawer
        ctx={
          {
            versionTarget: {
              policyType: 'payroll',
              policyId: 'payroll-policy-id',
              policyName: 'Teacher Payroll Policy',
            },
            versionHistory: { items: [] },
            versionCompare: null,
            compareVersionIds: { from: null, to: null },
            versionFilters: { action: 'all', search: '' },
            versionPage: { number: 1, size: 20 },
            setVersionPage: vi.fn(),
            versionHistoryLoading: false,
            versionCompareLoading: false,
            isPolicyOperationActive: false,
            canClonePolicy: true,
            restoreVersionState: { isLoading: false },
            restoreVersion: {
              version: {
                id: 'version-id',
                versionNumber: 3,
                name: 'Teacher Payroll Policy',
              },
              name: 'Teacher Payroll Policy v3 Restore Draft',
              reason: 'Restore old version',
            },
            restorePreviewLoading: false,
            restorePreview: {
              affectedEmployeeCount: 2,
              affectedAssignmentCount: 1,
              hasStalePayrollRisk: false,
              warnings: [
                {
                  severity: 'blocking',
                  code: 'ShikshaMitra:InvalidWorkCalendarPolicy',
                  message: 'The referenced work calendar could not be found.',
                },
              ],
              blockingWarnings: [
                {
                  severity: 'blocking',
                  code: 'ShikshaMitra:InvalidWorkCalendarPolicy',
                  message: 'The referenced work calendar could not be found.',
                },
              ],
              riskSummary: '1 blocking issue(s) must be resolved before this action can continue.',
              recommendedAction: 'Resolve the blocking warnings, then run impact preview again.',
            },
            setVersionTarget: vi.fn(),
            setCompareVersionIds: vi.fn(),
            setVersionFilters: vi.fn(),
            setRestoreVersion: vi.fn(),
            restoreVersionAsDraft: vi.fn(),
          } as any
        }
      />
    );

    expect(
      screen.getByText('The referenced work calendar could not be found.')
    ).toBeInTheDocument();
    expect(screen.getByText(/1 blocking issue/)).toBeInTheDocument();
    expect(screen.getByText(/Resolve the blocking warnings/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create draft/i })).toBeDisabled();
  });

  it('shows review-only restore warnings without disabling draft creation', () => {
    renderWithProviders(
      <PolicyVersionDrawer
        ctx={
          {
            versionTarget: {
              policyType: 'payroll',
              policyId: 'payroll-policy-id',
              policyName: 'Teacher Payroll Policy',
            },
            versionHistory: { items: [] },
            versionCompare: null,
            compareVersionIds: { from: null, to: null },
            versionFilters: { action: 'all', search: '' },
            versionPage: { number: 1, size: 20 },
            setVersionPage: vi.fn(),
            versionHistoryLoading: false,
            versionCompareLoading: false,
            isPolicyOperationActive: false,
            canClonePolicy: true,
            restoreVersionState: { isLoading: false },
            restoreVersion: {
              version: {
                id: 'version-id',
                versionNumber: 3,
                name: 'Teacher Payroll Policy',
              },
              name: 'Teacher Payroll Policy v3 Restore Draft',
              reason: 'Restore old version',
            },
            restorePreviewLoading: false,
            restorePreview: {
              affectedEmployeeCount: 0,
              affectedAssignmentCount: 0,
              hasStalePayrollRisk: false,
              requiresConfirmation: false,
              warnings: [
                {
                  severity: 'warning',
                  code: 'ShikshaMitra:WorkCalendarPolicyMustBeActive',
                  message: 'The referenced work calendar is draft.',
                },
              ],
              blockingWarnings: [],
              riskSummary: '1 non-blocking notice(s) found; no confirmation is required.',
              recommendedAction:
                'This action can be saved after reviewing the informational notices.',
            },
            setVersionTarget: vi.fn(),
            setCompareVersionIds: vi.fn(),
            setVersionFilters: vi.fn(),
            setRestoreVersion: vi.fn(),
            restoreVersionAsDraft: vi.fn(),
          } as any
        }
      />
    );

    expect(screen.getByText('The referenced work calendar is draft.')).toBeInTheDocument();
    expect(screen.getByText(/no confirmation is required/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create draft/i })).toBeEnabled();
  });

  it('shows explicit restore blocking warnings when warnings are empty', () => {
    renderWithProviders(
      <PolicyVersionDrawer
        ctx={
          {
            versionTarget: {
              policyType: 'payroll',
              policyId: 'payroll-policy-id',
              policyName: 'Teacher Payroll Policy',
            },
            versionHistory: { items: [] },
            versionCompare: null,
            compareVersionIds: { from: null, to: null },
            versionFilters: { action: 'all', search: '' },
            versionPage: { number: 1, size: 20 },
            setVersionPage: vi.fn(),
            versionHistoryLoading: false,
            versionCompareLoading: false,
            isPolicyOperationActive: false,
            canClonePolicy: true,
            restoreVersionState: { isLoading: false },
            restoreVersion: {
              version: {
                id: 'version-id',
                versionNumber: 3,
                name: 'Teacher Payroll Policy',
              },
              name: 'Teacher Payroll Policy v3 Restore Draft',
              reason: 'Restore old version',
            },
            restorePreviewLoading: false,
            restorePreview: {
              affectedEmployeeCount: 2,
              affectedAssignmentCount: 1,
              hasStalePayrollRisk: false,
              warnings: [],
              blockingWarnings: [
                {
                  severity: 'blocking',
                  code: 'ShikshaMitra:InvalidWorkCalendarPolicy',
                  message: 'The referenced work calendar could not be found.',
                },
              ],
              riskSummary: '1 blocking issue(s) must be resolved before this action can continue.',
              recommendedAction: 'Resolve the blocking warnings, then run impact preview again.',
            },
            setVersionTarget: vi.fn(),
            setCompareVersionIds: vi.fn(),
            setVersionFilters: vi.fn(),
            setRestoreVersion: vi.fn(),
            restoreVersionAsDraft: vi.fn(),
          } as any
        }
      />
    );

    expect(
      screen.getByText('The referenced work calendar could not be found.')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create draft/i })).toBeDisabled();
  });
});

vi.mock('src/screens/hr/hooks/use-hr-table-export', () => ({ useHrTableExport: () => vi.fn() }));

it.each([true, false])(
  'keeps two compare actions direct and gates restore overflow, permission=%s',
  async (canClonePolicy) => {
    const setRestoreVersion = vi.fn();
    const version = {
      id: 'version-3',
      versionNumber: 3,
      name: 'Synthetic policy',
      status: 'active',
      creationTime: '2026-10-01',
      changeAction: 'published',
    };
    renderWithProviders(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <PolicyVersionDrawer
          ctx={
            {
              versionTarget: {
                policyType: 'payroll',
                policyId: 'synthetic',
                policyName: 'Synthetic policy',
              },
              versionHistory: { items: [version] },
              versionPage: { number: 1, size: 20 },
              versionFilters: { action: 'all', search: '' },
              compareVersionIds: { from: null, to: null },
              canClonePolicy,
              isPolicyOperationActive: false,
              restoreVersionState: { isLoading: false },
              setVersionPage: vi.fn(),
              setVersionFilters: vi.fn(),
              setVersionTarget: vi.fn(),
              setCompareVersionIds: vi.fn(),
              setRestoreVersion,
            } as any
          }
        />
      </ThemeProvider>
    );
    expect(screen.getByRole('button', { name: 'Compare from version 3' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Compare to version 3' })).toBeVisible();
    if (canClonePolicy) {
      await userEvent.click(screen.getByRole('button', { name: 'More actions for version 3' }));
      await userEvent.click(screen.getByRole('menuitem', { name: 'Restore as draft' }));
      expect(setRestoreVersion).toHaveBeenCalledWith({
        version,
        name: 'Synthetic policy v3 Restore Draft',
        reason: '',
      });
    } else
      expect(
        screen.queryByRole('button', { name: 'More actions for version 3' })
      ).not.toBeInTheDocument();
  }
);
