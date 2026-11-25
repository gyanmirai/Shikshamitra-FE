import type { StructureSettings } from 'src/redux/finance/feeStructureWorkspace';

import React from 'react';
import { it, vi, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import StructurePolicyPreview from './StructurePolicyPreview';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/scrollbar', () => ({
  Scrollbar: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('src/redux/finance/collectionPolicy', () => ({
  useGetCollectionPolicyByIdQuery: 'collection-detail',
  useGetCollectionPolicyVersionsQuery: 'collection-version',
}));
vi.mock('src/redux/finance/refundPolicy', () => ({
  useGetRefundPolicyByIdQuery: 'refund-detail',
  useGetRefundPolicyVersionsQuery: 'refund-version',
}));
vi.mock('src/redux/finance/prorationPolicy', () => ({
  useGetProrationPolicyByIdQuery: 'proration-detail',
  useGetProrationPolicyVersionsQuery: 'proration-version',
  useSimulateProrationPolicyMutation: () => [vi.fn(), { isLoading: false }],
}));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: ({ currentQueryAndMutation, options }: any) => ({
    currentData:
      !options?.skip && currentQueryAndMutation === 'proration-detail'
        ? {
            id: 'proration',
            currentVersionId: 'version-1',
            policyName: 'School proration',
            version: 1,
            description: 'Saved proration configuration',
            feeHeadRules: [
              {
                feeHeadId: 'tuition',
                feeHeadName: 'Tuition Fee',
                ruleType: 'MonthlyCutoff',
                applyOnAdmission: true,
                applyOnEarlyWithdrawal: false,
              },
            ],
          }
        : undefined,
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: vi.fn(),
  }),
}));

it('opens saved proration details from Fee Structure without editable preview controls', () => {
  render(
    <StructurePolicyPreview
      option={{
        id: 'proration',
        family: 'proration',
        name: 'School proration',
        versionId: 'version-1',
        versionNumber: 1,
        isCurrent: true,
      }}
      settings={
        {
          academicYearId: 'year',
          academicYearName: '2026–27',
          permissions: { prorationRead: true },
        } as unknown as StructureSettings
      }
      onVersionChanged={vi.fn()}
    />
  );
  expect(screen.getByRole('heading', { name: 'Fee Head Configuration' })).toBeVisible();
  expect(screen.getByRole('rowheader', { name: 'Tuition Fee' })).toBeVisible();
  expect(screen.getByText('Monthly proration')).toBeVisible();
  expect(screen.getByText('v1')).toBeVisible();
  expect(screen.queryByRole('heading', { name: 'Version & Audit Trail' })).toBeNull();
  expect(screen.queryByRole('heading', { name: 'Proration Preview' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Calculate proration preview' })).toBeNull();
  expect(screen.queryByRole('textbox')).toBeNull();
  expect(screen.queryByRole('combobox')).toBeNull();
});
