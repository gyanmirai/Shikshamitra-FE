import type React from 'react';

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
