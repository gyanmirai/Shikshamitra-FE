import React from 'react';
import { vi, it, expect, beforeEach } from 'vitest';
import { financePermissions } from 'src/constants/finance-menu';
import { render, screen, fireEvent } from '@testing-library/react';

import RefundPolicyWorkspace from './RefundPolicyWorkspace';
import ProrationPolicyWorkspace from './ProrationPolicyWorkspace';

const mocks = vi.hoisted(() => ({
  refundList: vi.fn(),
  prorationList: vi.fn(),
  state: { globalState: { currentYear: { id: 'year-1' } }, auth: { permissions: [] as any[] } },
}));
vi.mock('react-redux', () => ({ useSelector: (select: any) => select(mocks.state) }));
vi.mock('src/redux/finance/refundPolicy', () => ({ useGetRefundPoliciesQuery: mocks.refundList }));
vi.mock('src/redux/finance/prorationPolicy', () => ({
  useGetProrationPoliciesQuery: mocks.prorationList,
}));
vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: ({ heading }: any) => <h1>{heading}</h1>,
}));
vi.mock('src/components/label', () => ({ Label: ({ children }: any) => <span>{children}</span> }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('../components/RefundPolicyDrawer', () => ({ default: () => null }));
vi.mock('../components/ProrationPolicyDrawer', () => ({ default: () => null }));
vi.mock('../components/FinancePolicyTable', () => ({
  default: ({ archived, policyType }: any) => (
    <div data-testid="policy-table">
      {policyType}:{String(archived)}
    </div>
  ),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.refundList.mockReturnValue({ data: { totalCount: 7 } });
  mocks.prorationList.mockReturnValue({ data: { totalCount: 7 } });
  mocks.state.globalState.currentYear.id = 'year-1';
  mocks.state.auth.permissions = [
    { name: financePermissions.policies.refundPolicyActions.create, isGranted: true },
    { name: financePermissions.policies.prorationPolicyActions.create, isGranted: true },
  ];
});

it.each([
  ['refund', 'Refund Policy', RefundPolicyWorkspace, mocks.refundList],
  ['proration', 'Proration Policy', ProrationPolicyWorkspace, mocks.prorationList],
] as const)(
  '%s switches views, shows archive count, and hides creation in Archived',
  (kind, label, Workspace, list) => {
    render(<Workspace />);
    expect(list).toHaveBeenCalledWith(
      { academicYearId: 'year-1', status: 'Archived', page: 1, pageSize: 1 },
      { skip: false }
    );
    expect(screen.getByTestId('policy-table')).toHaveTextContent(`${kind}:false`);
    expect(screen.getByRole('button', { name: label })).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: /Archived.*7/ }));
    expect(screen.getByTestId('policy-table')).toHaveTextContent(`${kind}:true`);
    expect(screen.queryByRole('button', { name: label })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Current Policies' }));
    expect(screen.getByTestId('policy-table')).toHaveTextContent(`${kind}:false`);
    expect(screen.getByRole('button', { name: label })).toBeVisible();
  }
);

it.each([
  ['Refund Policy', RefundPolicyWorkspace, mocks.refundList],
  ['Proration Policy', ProrationPolicyWorkspace, mocks.prorationList],
] as const)(
  '%s skips the archive count without a year and respects create permission',
  (label, Workspace, list) => {
    mocks.state.globalState.currentYear.id = '';
    mocks.state.auth.permissions = [];
    render(<Workspace />);
    expect(list).toHaveBeenCalledWith(expect.objectContaining({ academicYearId: '' }), {
      skip: true,
    });
    expect(screen.queryByRole('button', { name: label })).not.toBeInTheDocument();
  }
);
