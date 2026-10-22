import React from 'react';
import { vi, it, expect, beforeEach } from 'vitest';
import { financePermissions } from 'src/constants/finance-menu';
import { render, screen, fireEvent } from '@testing-library/react';

import RefundPolicyWorkspace from './RefundPolicyWorkspace';
import ProrationPolicyWorkspace from './ProrationPolicyWorkspace';
import CollectionPolicyWorkspace from './CollectionPolicyWorkspace';
import ConcessionPolicyWorkspace from './ConcessionPolicyWorkspace';

const mocks = vi.hoisted(() => ({
  refundList: vi.fn(),
  prorationList: vi.fn(),
  collectionList: vi.fn(),
  concessionList: vi.fn(),
  state: { globalState: { currentYear: { id: 'year-1' } }, auth: { permissions: [] as any[] } },
}));
vi.mock('react-redux', () => ({ useSelector: (select: any) => select(mocks.state) }));
vi.mock('src/redux/finance/refundPolicy', () => ({ useGetRefundPoliciesQuery: mocks.refundList }));
vi.mock('src/redux/finance/prorationPolicy', () => ({
  useGetProrationPoliciesQuery: mocks.prorationList,
}));
vi.mock('src/redux/finance/collectionPolicy', () => ({
  useGetCollectionPoliciesQuery: mocks.collectionList,
}));
vi.mock('src/redux/finance/concessionPolicy', () => ({
  useGetConcessionPoliciesQuery: mocks.concessionList,
}));
vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: ({ heading }: any) => <h1>{heading}</h1>,
}));
vi.mock('src/components/label', () => ({ Label: ({ children }: any) => <span>{children}</span> }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('../components/RefundPolicyDrawer', () => ({ default: () => null }));
vi.mock('../components/ProrationPolicyDrawer', () => ({ default: () => null }));
vi.mock('../components/CollectionPolicyDrawer', () => ({ default: () => null }));
vi.mock('../components/ConcessionPolicyDrawer', () => ({ default: () => null }));
vi.mock('../components/ExceptionWindowsDialog', () => ({ default: () => null }));
vi.mock('../components/FinancePolicyTable', () => ({
  default: ({ archived, policyType }: any) => (
    <div data-testid="policy-table">
      {policyType}:{String(archived)}
    </div>
  ),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mocks.refundList.mockReturnValue({ currentData: { totalCount: 7 } });
  mocks.prorationList.mockReturnValue({ currentData: { totalCount: 7 } });
  mocks.collectionList.mockReturnValue({ currentData: { totalCount: 7 } });
  mocks.concessionList.mockReturnValue({ currentData: { totalCount: 7 } });
  mocks.state.globalState.currentYear.id = 'year-1';
  mocks.state.auth.permissions = [
    { name: financePermissions.policies.refundPolicyActions.create, isGranted: true },
    { name: financePermissions.policies.prorationPolicyActions.create, isGranted: true },
    { name: financePermissions.policies.collectionPolicyActions.create, isGranted: true },
    { name: financePermissions.policies.concessionPolicyActions.create, isGranted: true },
  ];
});

it.each([
  ['refund', RefundPolicyWorkspace, mocks.refundList],
  ['proration', ProrationPolicyWorkspace, mocks.prorationList],
  ['concession', ConcessionPolicyWorkspace, mocks.concessionList],
] as const)(
  '%s switches the Fee Category-style archive buttons and hides creation in Archived',
  (kind, Workspace, list) => {
    render(<Workspace />);
    expect(list).toHaveBeenCalledWith(
      { academicYearId: 'year-1', status: 'Archived', page: 1, pageSize: 1 },
      { skip: false }
    );
    expect(screen.getByTestId('policy-table')).toHaveTextContent(`${kind}:false`);
    expect(screen.getByRole('button', { name: 'Create Policy' })).toBeVisible();
    const currentButton = screen.getByRole('button', { name: 'Current' });
    const archivedButton = screen.getByRole('button', { name: /Archived.*7/ });
    expect(currentButton).toHaveClass('MuiButton-contained');
    expect(archivedButton).toHaveClass('MuiButton-outlined');
    fireEvent.click(archivedButton);
    expect(screen.getByTestId('policy-table')).toHaveTextContent(`${kind}:true`);
    expect(screen.queryByRole('button', { name: 'Create Policy' })).not.toBeInTheDocument();
    expect(archivedButton).toHaveClass('MuiButton-contained');
    fireEvent.click(currentButton);
    expect(screen.getByTestId('policy-table')).toHaveTextContent(`${kind}:false`);
    expect(screen.getByRole('button', { name: 'Create Policy' })).toBeVisible();
  }
);

it('collection uses the same Current and Archived buttons with the archive count', () => {
  render(<CollectionPolicyWorkspace />);
  expect(mocks.collectionList).toHaveBeenCalledWith(
    {
      academicYearId: 'year-1',
      status: 'Archived',
      includeArchived: true,
      skipCount: 0,
      maxResultCount: 1,
    },
    { skip: false }
  );
  expect(screen.getByTestId('policy-table')).toHaveTextContent('collection:false');
  fireEvent.click(screen.getByRole('button', { name: /Archived.*7/ }));
  expect(screen.getByTestId('policy-table')).toHaveTextContent('collection:true');
  expect(screen.queryByRole('button', { name: 'Create Policy' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Current' }));
  expect(screen.getByRole('button', { name: 'Create Policy' })).toBeVisible();
});

it.each([
  ['refund', RefundPolicyWorkspace, mocks.refundList],
  ['proration', ProrationPolicyWorkspace, mocks.prorationList],
  ['concession', ConcessionPolicyWorkspace, mocks.concessionList],
] as const)(
  '%s skips the archive count without a year and respects create permission',
  (_, Workspace, list) => {
    mocks.state.globalState.currentYear.id = '';
    mocks.state.auth.permissions = [];
    render(<Workspace />);
    expect(list).toHaveBeenCalledWith(expect.objectContaining({ academicYearId: '' }), {
      skip: true,
    });
    expect(screen.queryByRole('button', { name: 'Create Policy' })).not.toBeInTheDocument();
  }
);
