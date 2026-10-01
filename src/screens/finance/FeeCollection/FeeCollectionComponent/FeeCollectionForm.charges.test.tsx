import React from 'react';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FeeMonth, FeeCollectionStatusType } from 'src/enums/fee-collection-type';

import FeeCollectComponentForm from './FeeCollectionForm';

const mocks = vi.hoisted(() => ({
  data: {} as any,
  collect: vi.fn(),
  collectQuery: vi.fn(),
  bankQuery: vi.fn(),
  collectMutation: vi.fn(),
  downloadMutation: vi.fn(),
}));

vi.mock('react-redux', () => ({
  useSelector: () => ({ currentYear: { id: 'year-2026', year: 2026, name: '2026-2027' } }),
}));
// These regressions exercise collection selection and allocations, not drag geometry.
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: any) => children,
  useSensor: () => ({}),
  useSensors: () => [],
  PointerSensor: vi.fn(),
  closestCenter: vi.fn(),
}));
vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: any) => children,
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: () => undefined,
    transform: null,
    transition: undefined,
    isDragging: false,
  }),
  verticalListSortingStrategy: vi.fn(),
  arrayMove: () => {
    throw new Error('Drag ordering is outside this collection regression');
  },
}));
vi.mock('src/redux/feeCollection/feeCollection', () => ({
  useGetCollectFormQuery: mocks.collectQuery,
  useCollectFeeMutation: mocks.collectMutation,
  useDownloadReceiptPdfMutation: mocks.downloadMutation,
}));
vi.mock('src/redux/finance/BankAccountManage/bankAccountApi', () => ({
  useGetBankAccountQuery: mocks.bankQuery,
}));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: ({ currentQueryAndMutation }: any) => {
    if (currentQueryAndMutation === mocks.collectQuery) return { data: mocks.data };
    if (currentQueryAndMutation === mocks.bankQuery) return { data: { items: [] } };
    return [mocks.collect, { isLoading: false }];
  },
}));
vi.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef(
      ({ initial, animate, transition, whileHover, whileTap, layout, ...props }: any, ref: any) => (
        <div ref={ref} {...props} />
      )
    ),
  },
  AnimatePresence: ({ children }: any) => children,
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('@mui/x-date-pickers', () => ({ DatePicker: () => null }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock('src/components/scrollbar', () => ({ Scrollbar: ({ children }: any) => children }));
vi.mock('src/components/customDialog', () => ({
  default: ({ open, children }: any) => (open ? children : null),
}));
vi.mock('src/components/back-popup-check/BackPopUpCheck', () => ({
  BackPopUpChecked: ({ children }: any) => children,
}));
vi.mock('src/components/shaking-text-field', () => ({
  default: ({ children }: any) => children,
}));
vi.mock(
  'src/screens/finance/FeeStructureAssign/Components/StudentFeeStructureAssignmentForm',
  () => ({
    default: () => null,
  })
);
vi.mock('../Components/StudentFeesSummaryCard', () => ({ StudentFeeSummaryCard: () => null }));
vi.mock('./FeeWaiverToggle', () => ({ default: () => null }));
vi.mock('./UnifiedReceiptDisplay', () => ({ default: () => null }));
vi.mock('./FeeCollectionOutcomePanel', () => ({ default: () => null }));
vi.mock('./FeeLedgerFilterBar', () => ({
  FEE_LEDGER_INITIAL_FILTERS: {
    activeTab: 'by-fee-head',
    month: 'All',
    feeHead: 'All',
    status: 'All',
    selectionFilters: {
      allPending: false,
      allCharges: false,
      firstSixMonths: false,
      lastSixMonths: false,
    },
  },
  default: ({ filters, onFilterChange, entryCount }: any) => (
    <div>
      <span>{entryCount} entries</span>
      <select
        aria-label="Month"
        value={filters.month}
        onChange={(event) => onFilterChange({ ...filters, month: event.target.value })}
      >
        <option value="All">All</option>
        <option value="5-2026">June 2026</option>
        <option value="6-2026">July 2026</option>
      </select>
      <select
        aria-label="Fee Head"
        value={filters.feeHead}
        onChange={(event) => onFilterChange({ ...filters, feeHead: event.target.value })}
      >
        <option value="All">All</option>
        <option value="tuition">Tuition</option>
        <option value="transport">Transport</option>
      </select>
      <select
        aria-label="Status"
        value={filters.status}
        onChange={(event) => onFilterChange({ ...filters, status: event.target.value })}
      >
        <option value="All">All</option>
        {Object.entries(FeeCollectionStatusType)
          .filter(([, value]) => typeof value === 'number')
          .map(([label, value]) => (
            <option key={label} value={String(value)}>
              {label}
            </option>
          ))}
      </select>
      <button
        type="button"
        onClick={() =>
          onFilterChange({
            ...filters,
            activeTab: filters.activeTab === 'by-month' ? 'by-fee-head' : 'by-month',
          })
        }
      >
        Switch ledger view
      </button>
      <label htmlFor="ledger-all-charges">
        <input
          id="ledger-all-charges"
          type="checkbox"
          checked={filters.selectionFilters.allCharges}
          onChange={(event) =>
            onFilterChange({
              ...filters,
              selectionFilters: { ...filters.selectionFilters, allCharges: event.target.checked },
            })
          }
        />
        All Charges
      </label>
    </div>
  ),
}));
vi.mock('./preview/FeeCollectionPreviewDialog', () => ({
  default: ({ open, onConfirm }: any) =>
    open ? (
      <button type="button" onClick={onConfirm}>
        Review payment
      </button>
    ) : null,
}));
vi.mock('./preview/FinalPaymentReviewDialog', () => ({
  default: ({ open, onConfirmCollect }: any) =>
    open ? (
      <button type="button" onClick={onConfirmCollect}>
        Confirm collection
      </button>
    ) : null,
}));

const student = { id: 'diya', name: 'Diya Sweta Badgujar', pendingFees: 21996 } as any;
const lateFees = ['Jun', 'Jul', 'Transport Quarter 1', 'Aug'].map((period, index) => ({
  chargeId: `due-${index}`,
  sourceId: `due-${index}`,
  sourceType: 'LateFee',
  isSystemGenerated: true,
  name: `Late Fee - ${period} 2026`,
  amount: 100,
  paidAmount: 0,
  pendingAmount: 100,
  waivedAmount: 0,
  canWaive: true,
  status: FeeCollectionStatusType.Pending,
}));

const buildForm = (paid: boolean) => ({
  student: { isFeeStructureAssigned: true },
  summary: { totalFee: 2000, paidFee: paid ? 2000 : 0, pendingFee: paid ? 0 : 2000 },
  charges: lateFees,
  ledger: [
    {
      month: FeeMonth.June,
      year: 2026,
      totalDue: paid ? 0 : 2000,
      items: [
        {
          dueFeeId: 'due-0',
          feeHeadId: 'tuition',
          feeHeadName: 'Class 3 Tuition Fee',
          installmentLabel: 'Jun 2026',
          total: 2000,
          paid: paid ? 2000 : 0,
          due: paid ? 0 : 2000,
          lateFeeAmount: 0,
          status: paid ? FeeCollectionStatusType.Paid : FeeCollectionStatusType.Pending,
        },
      ],
    },
  ],
});

const outstandingRow = () => within(screen.getByText('Overall Outstanding').parentElement!);

describe('Fee Collection independent additional charges', () => {
  beforeEach(() => {
    mocks.data = buildForm(false);
    mocks.collect.mockReset();
    mocks.collect.mockReturnValue({ unwrap: async () => ({ studentName: student.name }) });
  });

  it('filters charges and fee rows uniformly, counts visible entries and shows a filtered empty state in both views', () => {
    mocks.data.ledger[0].items[0].status = 'Overdue';
    render(<FeeCollectComponentForm student={student} />);
    expect(screen.getByText('5 entries')).toBeVisible();
    ['by-fee-head', 'by-month'].forEach(() => {
      fireEvent.change(screen.getByLabelText('Status'), {
        target: { value: String(FeeCollectionStatusType.Overdue) },
      });
      expect(screen.getByText('1 entries')).toBeVisible();
      expect(screen.getByText('Class 3 Tuition Fee')).toBeVisible();
      expect(screen.queryByText('Additional Charges')).not.toBeInTheDocument();
      [
        FeeCollectionStatusType.Paid,
        FeeCollectionStatusType.Partial,
        FeeCollectionStatusType.Reversed,
        FeeCollectionStatusType.InReconciliation,
      ].forEach((status) => {
        fireEvent.change(screen.getByLabelText('Status'), { target: { value: String(status) } });
        expect(screen.getByText('0 entries')).toBeVisible();
        expect(screen.getByText('No entries found for selected filters')).toBeVisible();
        expect(screen.queryByText('Additional Charges')).not.toBeInTheDocument();
      });
      fireEvent.change(screen.getByLabelText('Status'), {
        target: { value: String(FeeCollectionStatusType.Pending) },
      });
      expect(screen.getByText('4 entries')).toBeVisible();
      expect(screen.getByText('Additional Charges')).toBeVisible();
      expect(screen.queryByText('Class 3 Tuition Fee')).not.toBeInTheDocument();
      lateFees.forEach((charge) => expect(screen.getByText(charge.name)).toBeVisible());
      fireEvent.click(screen.getByText('Switch ledger view'));
    });
  });

  it('status filtering preserves previously selected hidden charges and limits All Charges to matching rows', async () => {
    mocks.data.ledger[0].items[0].status = FeeCollectionStatusType.Overdue;
    mocks.data.charges = [
      ...lateFees,
      {
        ...lateFees[0],
        chargeId: 'partial-charge',
        sourceId: 'partial-source',
        name: 'Partial late fee',
        paidAmount: 50,
        pendingAmount: 50,
        status: 'Partial',
      },
    ];
    render(<FeeCollectComponentForm student={student} />);
    const firstChargeRow = screen.getByText(lateFees[0].name).parentElement!.parentElement!
      .parentElement!;
    fireEvent.click(within(firstChargeRow).getByRole('checkbox'));
    fireEvent.change(screen.getByLabelText('Status'), {
      target: { value: String(FeeCollectionStatusType.Partial) },
    });
    expect(screen.getByText('1 entries')).toBeVisible();
    expect(screen.queryByText('Additional Charges')).toBeVisible();
    fireEvent.click(screen.getByRole('checkbox', { name: 'All Charges' }));
    await waitFor(() => expect(screen.getByText('2 items selected')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Collect Payment' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Review payment' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Confirm collection' }));
    await waitFor(() => expect(mocks.collect).toHaveBeenCalledOnce());
    expect(mocks.collect.mock.calls[0][0].lateFeePayments).toEqual([
      { dueFeeId: lateFees[0].sourceId, amount: 100 },
      { dueFeeId: 'partial-source', amount: 50 },
    ]);
  }, 120_000);

  it.each([
    [FeeCollectionStatusType.Paid, 'Paid'],
    [FeeCollectionStatusType.Partial, 'Partial Pending'],
    [FeeCollectionStatusType.Reversed, 'Reversed'],
    [FeeCollectionStatusType.InReconciliation, 'InReconciliation'],
  ])('shows matching fee and charge rows for status %s', (status, apiLabel) => {
    Object.assign(mocks.data.ledger[0].items[0], {
      status: String(status),
      paid: status === FeeCollectionStatusType.Partial ? 500 : 2000,
      due: status === FeeCollectionStatusType.Partial ? 1500 : 0,
      reconciliationAmount: status === FeeCollectionStatusType.InReconciliation ? 2000 : 0,
    });
    mocks.data.charges = [
      {
        ...lateFees[0],
        status: apiLabel,
        paidAmount: status === FeeCollectionStatusType.Partial ? 50 : 100,
        pendingAmount: status === FeeCollectionStatusType.Partial ? 50 : 0,
        reconciliationAmount: status === FeeCollectionStatusType.InReconciliation ? 100 : 0,
      },
    ];
    render(<FeeCollectComponentForm student={student} />);
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: String(status) } });
    expect(screen.getByText('2 entries')).toBeVisible();
    expect(screen.getByText('Additional Charges')).toBeVisible();
    expect(screen.getByText(lateFees[0].name)).toBeVisible();
    expect(screen.getByText('Class 3 Tuition Fee')).toBeVisible();
  });

  it('filters source late fees by month and fee head without assigning scope to unrelated manual charges', () => {
    mocks.data.charges = [
      ...lateFees,
      {
        ...lateFees[0],
        chargeId: 'manual',
        sourceId: 'manual',
        sourceType: 'Charge',
        name: 'Unscoped manual charge',
      },
    ];
    render(<FeeCollectComponentForm student={student} />);
    expect(screen.getByText('6 entries')).toBeVisible();
    fireEvent.change(screen.getByLabelText('Month'), { target: { value: '5-2026' } });
    expect(screen.getByText('2 entries')).toBeVisible();
    expect(screen.getByText(lateFees[0].name)).toBeVisible();
    expect(screen.queryByText('Unscoped manual charge')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Fee Head'), { target: { value: 'transport' } });
    expect(screen.getByText('0 entries')).toBeVisible();
    expect(screen.getByText('No entries found for selected filters')).toBeVisible();
    fireEvent.change(screen.getByLabelText('Month'), { target: { value: 'All' } });
    fireEvent.change(screen.getByLabelText('Fee Head'), { target: { value: 'All' } });
    expect(screen.getByText('6 entries')).toBeVisible();
    expect(screen.getByText('Unscoped manual charge')).toBeVisible();
  });

  it('uses fresh fee and charge balances instead of the stale Collections row', () => {
    const view = render(<FeeCollectComponentForm student={student} />);
    expect(outstandingRow().getByText(/^₹\s*2,\s*400\.\s*00$/)).toBeVisible();

    mocks.data = buildForm(true);
    view.rerender(<FeeCollectComponentForm student={student} />);
    expect(outstandingRow().getByText(/^₹\s*400\.\s*00$/)).toBeVisible();
    expect(screen.getByText('Additional Charges')).toBeVisible();
    lateFees.forEach((charge) => expect(screen.getByText(charge.name)).toBeVisible());
  });

  it('collects only selected principal and keeps unpaid late fees selectable on reopening', async () => {
    const view = render(<FeeCollectComponentForm student={student} />);
    const principalRow = screen.getByText('Jun 2026').parentElement!.parentElement!.parentElement!;
    fireEvent.click(within(principalRow).getByRole('checkbox'));
    fireEvent.click(screen.getByRole('button', { name: 'Collect Payment' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Review payment' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Confirm collection' }));

    await waitFor(() => expect(mocks.collect).toHaveBeenCalledOnce());
    expect(mocks.collect.mock.calls[0][0]).toMatchObject({
      dueFeePayments: [{ dueFeeId: 'due-0', feeHeadId: 'tuition', amount: 2000 }],
      lateFeePayments: [],
      chargePayments: [],
      payments: [{ amount: 2000 }],
    });

    view.unmount();
    mocks.data = buildForm(true);
    render(<FeeCollectComponentForm student={student} />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'All Charges' }));
    await waitFor(() => {
      lateFees.forEach((charge) => {
        const row = screen.getByText(charge.name).parentElement!.parentElement!.parentElement!;
        expect(within(row).getByRole('checkbox')).toBeChecked();
        expect(within(row).getByRole('checkbox')).toBeEnabled();
      });
    });
    expect(outstandingRow().getByText(/^₹\s*400\.\s*00$/)).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Collect Payment' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Review payment' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Confirm collection' }));
    await waitFor(() => expect(mocks.collect).toHaveBeenCalledTimes(2));
    expect(mocks.collect.mock.calls[1][0]).toMatchObject({
      dueFeePayments: [],
      chargePayments: [],
      lateFeePayments: lateFees.map((charge) => ({ dueFeeId: charge.sourceId, amount: 100 })),
      payments: [{ amount: 400 }],
    });
  }, 120_000);
});
