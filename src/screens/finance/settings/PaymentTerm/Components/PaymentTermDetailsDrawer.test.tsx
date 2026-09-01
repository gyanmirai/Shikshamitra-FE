import type { ReactElement } from 'react';

import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { renderWithProviders } from 'src/test/test-utils';
import { screen, fireEvent } from '@testing-library/react';
import { vi, it, expect, describe, beforeEach } from 'vitest';
import { defaultSettings } from 'src/components/settings/config-settings';

import PaymentTermDetailsDrawer from './PaymentTermDetailsDrawer';

const getDetail = vi.fn();
const getVersionHistory = vi.fn();

vi.mock('src/redux/finance/paymentTerm', () => ({
  useGetPaymentTermByIdQuery: (...args: unknown[]) => getDetail(...args),
  useGetPaymentTermVersionHistoryQuery: (...args: unknown[]) => getVersionHistory(...args),
}));

vi.mock('src/components/iconify', () => ({
  Iconify: () => null,
}));

const renderDrawer = (drawer: ReactElement) =>
  renderWithProviders(<ThemeProvider theme={createTheme(defaultSettings)}>{drawer}</ThemeProvider>);

const installment = {
  sequence: 1,
  name: 'Installment 1',
  coverageStartDate: '2026-09-01T00:00:00+05:30',
  coverageEndDate: '2026-09-23T00:00:00+05:30',
  demandDate: '2026-09-28T00:00:00+05:30',
  dueDate: '2026-09-30T00:00:00+05:30',
  allocationPercentage: 100,
  demandEnabled: true,
  reminderEnabled: false,
  reminderDate: null,
  allowPartialOverride: null,
  gracePeriodDaysOverride: null,
  id: 'installment-1',
};

const detail = {
  id: 'term-id',
  academicYearId: 'year-id',
  academicYearName: '2026-2027',
  boardId: 'board-id',
  boardName: 'GSEB',
  name: 'Quarterly Payment Term',
  code: 'PT-GSEB-QUARTERLY',
  description: null,
  status: 'Active',
  isDefault: false,
  holidayShiftingMethod: 'None',
  demandGenerationRule: 'XDaysBeforeDue',
  demandOffsetDays: 2,
  initialDemandStatus: 'Published',
  currentVersionId: 'version-2',
  totalInstallments: 2,
  versionCount: 2,
  isUsedInFeeStructures: false,
  canDirectEdit: true,
  versions: [
    {
      id: 'version-2',
      versionNumber: 2,
      status: 'Published',
      holidayShiftingMethod: 'None',
      demandGenerationRule: 'XDaysBeforeDue',
      demandOffsetDays: 2,
      effectiveFrom: '2026-09-02T00:00:00+05:30',
      effectiveTo: null,
      publishedAt: '2026-09-01T07:07:01.877356+05:30',
      changeReason: 'Edited published schedule',
      installments: [
        { ...installment, allocationPercentage: 50 },
        {
          ...installment,
          id: 'installment-2',
          sequence: 2,
          name: 'Installment 2',
          coverageStartDate: '2026-10-01T00:00:00+05:30',
          coverageEndDate: '2026-10-16T00:00:00+05:30',
          demandDate: '2026-10-27T00:00:00+05:30',
          dueDate: '2026-10-29T00:00:00+05:30',
          allocationPercentage: 50,
        },
      ],
    },
    {
      id: 'version-1',
      versionNumber: 1,
      status: 'Superseded',
      holidayShiftingMethod: 'None',
      demandGenerationRule: 'XDaysBeforeDue',
      demandOffsetDays: 2,
      effectiveFrom: '2026-09-01T00:00:00+05:30',
      effectiveTo: '2026-09-01T00:00:00+05:30',
      publishedAt: '2026-09-01T06:16:54.862202+05:30',
      changeReason: null,
      installments: [installment],
    },
  ],
};

describe('PaymentTermDetailsDrawer version history', () => {
  beforeEach(() => {
    getDetail.mockReturnValue({
      data: detail,
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    });
    getVersionHistory.mockReturnValue({
      data: {
        totalCount: 1,
        items: [
          {
            id: 'version-2',
            versionNumber: 2,
            status: 'Published',
            changeAction: 'revision_created',
            changeReason: 'Edited published schedule',
            creationTime: '2026-09-01T10:30:00Z',
            creatorId: 'user-id',
            createdByName: 'Finance Admin',
          },
        ],
      },
      isFetching: false,
      isError: false,
      refetch: vi.fn(),
    });
  });

  it('renders a selectable immutable snapshot with rules, audit details, and installments', () => {
    renderDrawer(
      <PaymentTermDetailsDrawer
        open
        paymentTermId="term-id"
        initialTab="versions"
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('Quarterly Payment Term')).toBeInTheDocument();
    expect(screen.getByText('Immutable payment-term snapshot')).toBeInTheDocument();
    expect(screen.getByText('Revision Created')).toBeInTheDocument();
    expect(screen.getByText(/Finance Admin/)).toBeInTheDocument();
    expect(screen.getByText('Edited published schedule')).toBeInTheDocument();
    expect(screen.getByText('X Days Before Due')).toBeInTheDocument();
    expect(screen.queryByText('XDaysBeforeDue')).not.toBeInTheDocument();
    expect(screen.getByText('Installment 2')).toBeInTheDocument();
  });

  it('switches between version snapshots from the version list', () => {
    renderDrawer(
      <PaymentTermDetailsDrawer
        open
        paymentTermId="term-id"
        initialTab="versions"
        onClose={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'View version 1' }));

    expect(screen.getAllByText('Superseded')).toHaveLength(2);
    expect(screen.getAllByText('100%').length).toBeGreaterThan(0);
    expect(screen.getByText('01 Sep 2026 – 01 Sep 2026')).toBeInTheDocument();
    expect(screen.queryByText('Installment 2')).not.toBeInTheDocument();
  });

  it('uses the spaced demand-rule label on the details tab', () => {
    renderDrawer(
      <PaymentTermDetailsDrawer
        open
        paymentTermId="term-id"
        initialTab="details"
        onClose={vi.fn()}
      />
    );

    expect(screen.getByText('X Days Before Due')).toBeInTheDocument();
    expect(screen.queryByText('XDaysBeforeDue')).not.toBeInTheDocument();
  });
});
