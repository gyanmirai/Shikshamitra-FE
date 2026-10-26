import React from 'react';
import { it, vi, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { PolicyImpactDrawer } from './PolicyImpactDrawer';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('./HRPolicySharedUI', () => ({
  DrawerHeader: () => <h2>Policy Impact</h2>,
  SectionTable: () => null,
  EmptyRows: () => null,
}));

it('opens exact blockers and all conflicts immediately while retaining the disabled confirmation', () => {
  render(
    <PolicyImpactDrawer
      ctx={
        {
          impactDrawerOpen: true,
          previewPolicyImpactState: {},
          previewPolicyAssignmentImpactState: {},
          pendingImpactAction: { label: 'Save' },
          impactPreview: {
            policyType: 'attendance',
            action: 'update',
            affectedEmployeeCount: 7,
            affectedAssignmentCount: 1,
            warnings: [],
            blockingWarnings: [
              { severity: 'blocking', code: 'locked', message: 'October 2026 payroll is locked.' },
            ],
            lockedPayrollMonths: [
              { year: 2026, month: 10, label: 'October 2026', status: 'locked', count: 2 },
            ],
            effectiveAssignmentConflicts: Array.from({ length: 7 }, (_, index) => ({
              employeeId: `staff-${index}`,
              employeeName: `Synthetic staff ${index}`,
              date: '2026-10-01',
              candidateAssignments: [],
            })),
          },
        } as any
      }
    />
  );
  expect(screen.getByRole('button', { name: /Errors/ })).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByText('October 2026 payroll is locked.')).toBeVisible();
  expect(screen.getByRole('button', { name: /Effective Policy Conflicts/ })).toHaveAttribute(
    'aria-expanded',
    'true'
  );
  expect(screen.getByText('Synthetic staff 6')).toBeVisible();
  expect(screen.getByText('October 2026 — locked (2 records)')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Confirm Save' })).toBeDisabled();
});
