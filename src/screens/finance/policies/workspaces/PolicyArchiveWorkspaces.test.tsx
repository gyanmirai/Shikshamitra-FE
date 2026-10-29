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
  CustomBreadcrumbs: ({ heading, action }: any) => (
    <>
      <h1>{heading}</h1>
      {action}
    </>
  ),
}));
vi.mock('src/components/label', () => ({ Label: ({ children }: any) => <span>{children}</span> }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('../components/RefundPolicyDrawer', () => ({ default: () => null }));
vi.mock('../components/ProrationPolicyDrawer', () => ({ default: () => null }));
vi.mock('../components/CollectionPolicyDrawer', () => ({ default: () => null }));
vi.mock('../components/ConcessionPolicyDrawer', () => ({ default: () => null }));
vi.mock('../components/ExceptionWindowsDialog', () => ({ default: () => null }));
vi.mock('../components/FinancePolicyTable', () => ({
  default: ({ policyType }: any) => <div data-testid="policy-table">{policyType}</div>,
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
  ['refund', RefundPolicyWorkspace],
  ['proration', ProrationPolicyWorkspace],
  ['concession', ConcessionPolicyWorkspace],
  ['collection', CollectionPolicyWorkspace],
] as const)('%s shows a single table without archive tabs', (kind, Workspace) => {
  render(<Workspace />);
  expect(screen.getByTestId('policy-table')).toHaveTextContent(kind);
  expect(screen.queryByRole('button', { name: 'Current' })).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: /Archived/ })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Policy/ })).toBeVisible();
});
