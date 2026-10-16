import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { defaultSettings } from 'src/components/settings/config-settings';
import {
  act,
  screen,
  within,
  waitFor,
  fireEvent,
  render as rtlRender,
} from '@testing-library/react';

import FeeCollectComponentForm from './FeeCollectionForm';

import type { FeeCollectionAdapter } from './FeeCollectionForm';

const theme = createTheme(defaultSettings);
const render = (ui: React.ReactElement) =>
  rtlRender(ui, {
    wrapper: ({ children }) => <ThemeProvider theme={theme}>{children}</ThemeProvider>,
  });

vi.mock('@mui/icons-material', () => {
  const Icon = () => null;
  return {
    ArrowDownward: Icon,
    ArrowUpward: Icon,
    Clear: Icon,
    Close: Icon,
    ExpandLess: Icon,
    ExpandMore: Icon,
    RemoveRedEye: Icon,
    Search: Icon,
  };
});

const mocks = vi.hoisted(() => ({
  currentYear: { id: 'global-year', name: '2025-2026', year: 2025 },
  formData: {} as any,
  queries: vi.fn(),
  defaultCollect: vi.fn(),
  defaultDownload: vi.fn(),
  collectQuery: vi.fn(),
  collectMutation: vi.fn(),
  routingQuery: vi.fn(),
  monthsQuery: vi.fn(),
  downloadMutation: vi.fn(),
  filterProps: vi.fn(),
  selectionOverrides: undefined as any[] | undefined,
  refetch: vi.fn(),
}));

vi.mock('react-redux', () => ({
  useSelector: (selector: any) =>
    selector({
      globalState: { currentYear: mocks.currentYear },
      confirmPopup: { isChanges: false },
    }),
  useDispatch: () => vi.fn(),
}));
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: any) => children,
  useSensor: () => ({}),
  useSensors: () => [],
  PointerSensor: vi.fn(),
  closestCenter: vi.fn(),
}));
vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: any) => children,
  useSortable: () => ({ attributes: {}, listeners: {}, setNodeRef: vi.fn() }),
  verticalListSortingStrategy: vi.fn(),
  arrayMove: (items: unknown[]) => items,
}));
vi.mock('src/redux/feeCollection/feeCollection', () => ({
  useGetCollectFormQuery: mocks.collectQuery,
  useCollectFeeMutation: mocks.collectMutation,
  useDownloadReceiptPdfMutation: mocks.downloadMutation,
}));
vi.mock('src/redux/finance/financeRoutingApi', () => ({
  useGetFinanceRoutingOptionsQuery: mocks.routingQuery,
}));
vi.mock('src/redux/finance/financeFeeStructure', () => ({
  useGetAcademicYearMonthsQuery: mocks.monthsQuery,
}));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: (request: any) => {
    mocks.queries(request);
    if (request.type === 'query') {
      if (request.currentQueryAndMutation === mocks.collectQuery) {
        return { data: request.options?.skip ? undefined : mocks.formData, refetch: mocks.refetch };
      }
      if (request.currentQueryAndMutation === mocks.routingQuery) {
        return { data: { bankAccounts: [] } };
      }
      return { data: [] };
    }
    return [
      request.currentQueryAndMutation === mocks.collectMutation
        ? mocks.defaultCollect
        : mocks.defaultDownload,
      { isLoading: false },
    ];
  },
}));
vi.mock('framer-motion', () => ({
  motion: {
    div: React.forwardRef(({ initial, animate, transition, ...props }: any, ref: any) => (
      <div ref={ref} {...props} />
    )),
  },
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock('src/components/scrollbar', () => ({
  Scrollbar: React.forwardRef(({ children, sx, slotProps, ...props }: any, ref: any) => (
    <div ref={ref} {...props} data-testid="common-scrollbar">
      {children}
    </div>
  )),
}));
vi.mock('src/components/customDialog', () => ({
  default: ({ open, children }: any) => (open ? children : null),
}));
vi.mock('src/components/back-popup-check/BackPopUpCheck', () => ({
  BackPopUpChecked: ({ children }: any) => children,
}));
vi.mock('src/components/shaking-text-field', () => ({ default: ({ children }: any) => children }));
vi.mock('@mui/x-date-pickers', () => ({ DatePicker: () => null }));
vi.mock(
  'src/screens/finance/FeeStructureAssign/Components/StudentFeeStructureAssignmentForm',
  () => ({ default: () => null })
);
vi.mock('../Components/StudentFeesSummaryCard', () => ({
  StudentFeeSummaryCard: ({ student }: any) => <span>{student?.name}</span>,
}));
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
  default: (props: any) => {
    mocks.filterProps(props);
    return null;
  },
}));
vi.mock('./CollectionLedgerTable', () => ({
  default: ({ onSelectionChange }: any) => (
    <button
      type="button"
      onClick={() =>
        onSelectionChange(
          mocks.selectionOverrides ?? [
            {
              dueFeeId: 'canonical-due',
              feeHeadId: 'form-fee',
              feeHeadName: 'Form fee',
              period: '2026-06',
              dueAmount: 500,
              originalDueAmount: 500,
              roundingAdjustment: 0,
              installmentLabel: 'June 2026',
            },
          ]
        )
      }
    >
      Select form fee
    </button>
  ),
}));
vi.mock('./FeeCollectionFormSkeleton', () => ({ default: () => <span>Loading fees</span> }));
vi.mock('./UnifiedReceiptDisplay', () => ({ default: () => null }));
vi.mock('./preview/FeeCollectionPreviewDialog', () => ({
  default: ({ open, onConfirm, academicYear }: any) =>
    open ? (
      <button type="button" onClick={onConfirm}>
        Review {academicYear}
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

const academicYear = {
  id: 'application-year',
  name: '2026-2027',
  year: 2026,
  startDate: '2026-06-01',
  endDate: '2027-05-31',
};
const student = { id: 'student-one', name: 'Existing student' } as any;
const form = () => ({
  student: {
    studentId: null,
    studentName: 'Kabir Shah',
    isFeeStructureAssigned: true,
    standardName: 'Class 1',
    boardName: 'GSEB',
    educationMediumName: 'English',
    divisionName: '',
    grNo: '',
    rollNo: '',
    contactNo: '',
    email: '',
  },
  summary: { totalFee: 500, paidFee: 0, pendingFee: 500 },
  charges: [],
  allowOnlineCollection: true,
  ledger: [
    {
      month: 5,
      year: 2026,
      totalDue: 500,
      items: [
        {
          dueFeeId: 'canonical-due',
          feeHeadId: 'form-fee',
          feeHeadName: 'Form fee',
          installmentLabel: 'June 2026',
          total: 500,
          paid: 0,
          due: 500,
          status: 0,
        },
      ],
    },
  ],
});
const output = {
  id: 'collection-one',
  studentId: null,
  studentName: 'Kabir Shah',
  academicYearId: 'application-year',
  receivedAmount: 500,
  totalAmount: 500,
  status: 1,
  receiptNumber: 'R-1',
  feeReceiptId: 'receipt-one',
  paidFeeHeads: [{ feeHeadId: 'form-fee', feeHeadName: 'Form fee', amountPaid: 500 }],
  paidDueFees: [{ dueFeeId: 'canonical-due', feeHeadId: 'form-fee', amountPaid: 500 }],
  collectedAt: '2026-10-12T12:00:00Z',
  collectedBy: 'Cashier',
  createdAt: '2026-10-12T12:00:00Z',
} as any;
const adapter = (overrides: Partial<FeeCollectionAdapter> = {}): FeeCollectionAdapter => ({
  contextKey: 'application-one',
  data: form() as any,
  isLoading: false,
  isCollecting: false,
  refetch: vi.fn(),
  collect: vi.fn().mockResolvedValue(output),
  canViewReceipts: false,
  downloadReceiptPdf: vi.fn(),
  ...overrides,
});
const beginCollection = async (yearName = '2026-2027') => {
  fireEvent.click(screen.getByRole('button', { name: 'Select form fee' }));
  await screen.findByText('Form fee - (Jun 2026)');
  fireEvent.change(screen.getByLabelText('Amount to collect *'), { target: { value: '500' } });
  await waitFor(() => expect(screen.getByLabelText('Amount to collect *')).toHaveValue('₹ 500'));
  fireEvent.click(screen.getByRole('button', { name: 'Collect Payment' }));
  fireEvent.click(await screen.findByRole('button', { name: `Review ${yearName}` }));
};

describe('embedded Finance collection context', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.formData = form();
    mocks.selectionOverrides = undefined;
    mocks.defaultCollect.mockReturnValue({ unwrap: () => Promise.resolve(output) });
  });

  it.each(['Ledger + Checkout', 'Period First', 'Wide Ledger'])(
    'preserves checkout values when switching from the %s layout and keeps footer actions outside the panel',
    async (layout) => {
      const context = adapter();
      render(<FeeCollectComponentForm academicYear={academicYear} collectionAdapter={context} />);
      fireEvent.click(screen.getByRole('tab', { name: layout }));
      const checkoutRegion = screen.getByRole('tabpanel');
      expect(
        within(checkoutRegion).getByRole('combobox', { name: /Payment method/i })
      ).toBeInTheDocument();
      expect(checkoutRegion).not.toContainElement(
        screen.getByRole('button', { name: 'Collect Payment' })
      );
      expect(checkoutRegion).not.toContainElement(screen.getByRole('button', { name: 'Cancel' }));
      fireEvent.click(screen.getByRole('button', { name: 'Select form fee' }));
      await screen.findByText('Form fee - (Jun 2026)');
      fireEvent.change(within(checkoutRegion).getByLabelText('Amount to collect *'), {
        target: { value: '250' },
      });
      expect(within(checkoutRegion).getByLabelText('Amount to collect *')).toHaveValue('₹ 250');
      fireEvent.click(
        screen.getByRole('tab', {
          name: layout === 'Wide Ledger' ? 'Ledger + Checkout' : 'Wide Ledger',
        })
      );
      expect(screen.getByLabelText('Amount to collect *')).toHaveValue('₹ 250');
      expect(screen.getByText('Form fee - (Jun 2026)')).toBeInTheDocument();
      expect(screen.getByRole('tabpanel')).toContainElement(
        screen.getByLabelText('Amount to collect *')
      );
    }
  );

  it('retains global-year defaults and uses the explicit year in every Finance query', () => {
    const view = render(<FeeCollectComponentForm student={student} />);
    expect(mocks.queries).toHaveBeenCalledWith(
      expect.objectContaining({
        currentQueryAndMutation: mocks.collectQuery,
        params: { studentId: 'student-one', academicYearId: 'global-year' },
        options: { skip: false },
      })
    );
    view.rerender(<FeeCollectComponentForm student={student} academicYear={academicYear} />);
    expect(mocks.queries).toHaveBeenCalledWith(
      expect.objectContaining({
        currentQueryAndMutation: mocks.collectQuery,
        params: { studentId: 'student-one', academicYearId: 'application-year' },
      })
    );
    expect(mocks.queries).toHaveBeenCalledWith(
      expect.objectContaining({
        currentQueryAndMutation: mocks.routingQuery,
        params: { academicYearId: 'application-year', operation: 'collection' },
      })
    );
    expect(mocks.filterProps).toHaveBeenLastCalledWith(
      expect.objectContaining({ academicYearId: 'application-year' })
    );
  });

  it('skips student APIs, displays the applicant and supplies the same Finance ledger heads', () => {
    render(<FeeCollectComponentForm collectionAdapter={adapter()} academicYear={academicYear} />);
    fireEvent.click(screen.getByRole('button', { name: 'Student information' }));
    expect(screen.getByText('Kabir Shah')).toBeVisible();
    expect(mocks.queries).toHaveBeenCalledWith(
      expect.objectContaining({
        currentQueryAndMutation: mocks.collectQuery,
        options: { skip: true },
      })
    );
    expect(mocks.queries).toHaveBeenCalledWith(
      expect.objectContaining({
        currentQueryAndMutation: mocks.monthsQuery,
        options: { skip: true },
      })
    );
    expect(mocks.filterProps).toHaveBeenLastCalledWith(
      expect.objectContaining({
        studentId: undefined,
        feeHeads: [{ feeHeadId: 'form-fee', feeHeadName: 'Form fee' }],
      })
    );
  });

  it('keeps loading, denied access and safe retry explicit without offering Student assignment', () => {
    const refetch = vi.fn();
    const view = render(
      <FeeCollectComponentForm
        academicYear={academicYear}
        collectionAdapter={adapter({ isLoading: true })}
      />
    );
    expect(screen.getByText('Loading fees')).toBeVisible();
    view.rerender(
      <FeeCollectComponentForm
        academicYear={academicYear}
        collectionAdapter={adapter({
          error: { status: 403, data: { detail: 'Collection access denied.' } },
          refetch,
        })}
      />
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Collection access denied.');
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(refetch).toHaveBeenCalledOnce();
    view.rerender(
      <FeeCollectComponentForm
        academicYear={academicYear}
        collectionAdapter={adapter({
          data: { ...form(), student: { ...form().student, isFeeStructureAssigned: false } } as any,
        })}
      />
    );
    expect(screen.getByText('No Fee Structure Assigned')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Assign Fee Structure' })).not.toBeInTheDocument();
  });

  it('blocks repeated confirmation, keeps canonical allocations and never sends a Student ID for the applicant', async () => {
    let resolve!: (value: any) => void;
    const collect = vi.fn<FeeCollectionAdapter['collect']>(
      () =>
        new Promise<any>((done) => {
          resolve = done;
        })
    );
    const context = adapter({ collect });
    const onBusyChange = vi.fn();
    const onDirtyChange = vi.fn();
    render(
      <FeeCollectComponentForm
        academicYear={academicYear}
        collectionAdapter={context}
        onBusyChange={onBusyChange}
        onDirtyChange={onDirtyChange}
      />
    );
    await beginCollection();
    const confirm = screen.getByRole('button', { name: 'Confirm collection' });
    fireEvent.click(confirm);
    fireEvent.click(confirm);
    expect(collect).toHaveBeenCalledOnce();
    expect(collect.mock.calls[0][0]).toMatchObject({
      academicYearId: 'application-year',
      dueFeePayments: [{ dueFeeId: 'canonical-due', feeHeadId: 'form-fee', amount: 500 }],
      payments: [{ paymentMethod: 0, amount: 500 }],
      idempotencyKey: expect.any(String),
    });
    expect(collect.mock.calls[0][0]).not.toHaveProperty('studentId');
    expect(mocks.defaultCollect).not.toHaveBeenCalled();
    expect(onBusyChange).toHaveBeenLastCalledWith(true);
    expect(onDirtyChange).toHaveBeenCalledWith(true);
    await act(async () => {
      resolve(output);
    });
    expect(context.downloadReceiptPdf).not.toHaveBeenCalled();
    expect(
      screen.getByText('Payment recorded. Receipt access is unavailable for your account.')
    ).toBeVisible();
    expect(screen.queryByRole('link', { name: 'View in audit trail' })).not.toBeInTheDocument();
    expect(onBusyChange).toHaveBeenLastCalledWith(false);
    expect(onDirtyChange).toHaveBeenLastCalledWith(false);
  });

  it('retains the idempotency key and entered amount on uncertain failure and retry', async () => {
    const collect = vi
      .fn()
      .mockRejectedValueOnce({ data: { detail: 'Connection lost. Retry safely.' } })
      .mockResolvedValueOnce(output);
    render(
      <FeeCollectComponentForm
        academicYear={academicYear}
        collectionAdapter={adapter({ collect })}
      />
    );
    await beginCollection();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm collection' }));
    await screen.findByText('Connection lost. Retry safely.');
    expect(screen.getByLabelText('Amount to collect *')).toHaveValue('₹ 500');
    expect(screen.getByLabelText('Amount to collect *')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Collect Payment' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    fireEvent.change(screen.getByLabelText('Amount to collect *'), { target: { value: '250' } });
    fireEvent.click(screen.getByRole('button', { name: 'Select form fee' }));
    expect(screen.getByLabelText('Amount to collect *')).toHaveValue('₹ 500');
    fireEvent.click(screen.getByRole('button', { name: 'Retry payment' }));
    await waitFor(() => expect(collect).toHaveBeenCalledTimes(2));
    expect(collect.mock.calls[1][0]).toEqual(collect.mock.calls[0][0]);
  });

  it('collects the entered partial amount against the selected canonical due', async () => {
    const collect = vi.fn().mockResolvedValue({
      ...output,
      totalAmount: 250,
      receivedAmount: 250,
      paidFeeHeads: [{ feeHeadId: 'form-fee', feeHeadName: 'Form fee', amountPaid: 250 }],
      paidDueFees: [{ dueFeeId: 'canonical-due', feeHeadId: 'form-fee', amountPaid: 250 }],
    });
    render(
      <FeeCollectComponentForm
        academicYear={academicYear}
        collectionAdapter={adapter({ collect })}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Select form fee' }));
    await screen.findByText('Form fee - (Jun 2026)');
    fireEvent.change(screen.getByLabelText('Amount to collect *'), { target: { value: '250' } });
    fireEvent.click(screen.getByRole('button', { name: 'Collect Payment' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Review 2026-2027' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Confirm collection' }));
    await waitFor(() => expect(collect).toHaveBeenCalledOnce());
    expect(collect.mock.calls[0][0]).toMatchObject({
      dueFeePayments: [{ dueFeeId: 'canonical-due', feeHeadId: 'form-fee', amount: 250 }],
      payments: [{ amount: 250 }],
    });
  });

  it('retries the exact multi-due command after a saved payment response is lost and the ledger refreshes', async () => {
    const original = form();
    original.ledger[0].items.push({
      ...original.ledger[0].items[0],
      dueFeeId: 'tuition-due',
      feeHeadId: 'tuition-fee',
      feeHeadName: 'Tuition',
    });
    original.ledger[0].totalDue = 1000;
    original.summary = { totalFee: 1000, paidFee: 0, pendingFee: 1000 };
    mocks.selectionOverrides = original.ledger[0].items.map((item) => ({
      dueFeeId: item.dueFeeId,
      feeHeadId: item.feeHeadId,
      feeHeadName: item.feeHeadName,
      period: '2026-06',
      dueAmount: 500,
      originalDueAmount: 500,
      roundingAdjustment: 0,
      installmentLabel: 'June 2026',
    }));
    const collect = vi
      .fn()
      .mockRejectedValueOnce({ status: 'FETCH_ERROR', data: { detail: 'Payment response lost.' } })
      .mockResolvedValueOnce({ ...output, totalAmount: 600, receivedAmount: 600, status: 4 });
    const context = adapter({ data: original as any, collect });
    const view = render(
      <FeeCollectComponentForm academicYear={academicYear} collectionAdapter={context} />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Select form fee' }));
    await screen.findByText('Tuition - (Jun 2026)');
    fireEvent.change(screen.getByLabelText('Amount to collect *'), { target: { value: '600' } });
    fireEvent.click(screen.getByRole('button', { name: 'Collect Payment' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Review 2026-2027' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Confirm collection' }));
    await screen.findByText('Payment response lost.');
    expect(
      screen.getByText(/Payment may already have been recorded. Editing and closing are blocked/)
    ).toBeInTheDocument();
    const attempted = structuredClone(collect.mock.calls[0][0]);
    expect(attempted.dueFeePayments).toEqual([
      { dueFeeId: 'canonical-due', feeHeadId: 'form-fee', amount: 500 },
      { dueFeeId: 'tuition-due', feeHeadId: 'tuition-fee', amount: 100 },
    ]);
    const refreshed = structuredClone(original);
    refreshed.summary = { totalFee: 1000, paidFee: 600, pendingFee: 400 };
    refreshed.ledger[0].totalDue = 400;
    refreshed.ledger[0].items[0] = {
      ...refreshed.ledger[0].items[0],
      paid: 500,
      due: 0,
      status: 1,
    };
    refreshed.ledger[0].items[1] = {
      ...refreshed.ledger[0].items[1],
      paid: 100,
      due: 400,
      status: 4,
    };
    view.rerender(
      <FeeCollectComponentForm
        academicYear={academicYear}
        collectionAdapter={{ ...context, data: refreshed as any }}
      />
    );
    expect(screen.getByLabelText('Amount to collect *')).toHaveValue('₹ 600');
    fireEvent.click(screen.getByRole('button', { name: 'Retry payment' }));
    await waitFor(() => expect(collect).toHaveBeenCalledTimes(2));
    expect(collect.mock.calls[1][0]).toEqual(attempted);
  });

  it.each([400])(
    'creates a fresh command only after a deliberate amount correction following %s',
    async (status) => {
      const collect = vi
        .fn()
        .mockRejectedValueOnce({ status, data: { detail: 'Payment could not be completed.' } })
        .mockResolvedValueOnce(output);
      render(
        <FeeCollectComponentForm
          academicYear={academicYear}
          collectionAdapter={adapter({ collect })}
        />
      );
      await beginCollection();
      fireEvent.click(screen.getByRole('button', { name: 'Confirm collection' }));
      await screen.findByText('Payment could not be completed.');
      fireEvent.change(screen.getByLabelText('Amount to collect *'), { target: { value: '250' } });
      expect(screen.queryByRole('button', { name: 'Retry payment' })).not.toBeInTheDocument();
      expect(screen.queryByText(/Editing and closing are blocked/)).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Collect Payment' }));
      fireEvent.click(await screen.findByRole('button', { name: 'Review 2026-2027' }));
      fireEvent.click(await screen.findByRole('button', { name: 'Confirm collection' }));
      await waitFor(() => expect(collect).toHaveBeenCalledTimes(2));
      expect(collect.mock.calls[1][0].idempotencyKey).not.toBe(
        collect.mock.calls[0][0].idempotencyKey
      );
      expect(collect.mock.calls[1][0].payments[0].amount).toBe(250);
    }
  );

  it.each(['FETCH_ERROR', 408, 500])(
    'preserves the pinned command and blocks edits and closure after an uncertain %s outcome',
    async (status) => {
      const collect = vi
        .fn()
        .mockRejectedValueOnce({ status, data: { detail: 'Payment response unavailable.' } })
        .mockResolvedValueOnce(output);
      const busy = vi.fn();
      render(
        <FeeCollectComponentForm
          academicYear={academicYear}
          collectionAdapter={adapter({ collect })}
          onBusyChange={busy}
        />
      );
      await beginCollection();
      fireEvent.click(screen.getByRole('button', { name: 'Confirm collection' }));
      await screen.findByText('Payment response unavailable.');
      expect(busy).toHaveBeenLastCalledWith(true);
      expect(screen.getByLabelText('Amount to collect *')).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
      fireEvent.change(screen.getByLabelText('Amount to collect *'), { target: { value: '1' } });
      fireEvent.click(screen.getByRole('button', { name: 'Clear all' }));
      fireEvent.click(screen.getByRole('button', { name: 'Retry payment' }));
      await waitFor(() => expect(collect).toHaveBeenCalledTimes(2));
      expect(collect.mock.calls[1][0]).toEqual(collect.mock.calls[0][0]);
      await waitFor(() => expect(busy).toHaveBeenLastCalledWith(false));
    }
  );

  it('loads a receipt through the supplied Finance adapter only when receipt access is granted', async () => {
    const downloadReceiptPdf = vi
      .fn()
      .mockResolvedValue(new Blob(['receipt'], { type: 'application/pdf' }));
    render(
      <FeeCollectComponentForm
        academicYear={academicYear}
        collectionAdapter={adapter({ canViewReceipts: true, downloadReceiptPdf })}
      />
    );
    await beginCollection();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm collection' }));
    await waitFor(() => expect(downloadReceiptPdf).toHaveBeenCalledWith('receipt-one', 'fee'));
    expect(mocks.defaultDownload).not.toHaveBeenCalled();
  });

  it('keeps native Student collection and charge receipt routing intact', async () => {
    mocks.defaultCollect.mockReturnValue({
      unwrap: () =>
        Promise.resolve({
          ...output,
          studentId: 'student-one',
          feeReceiptId: undefined,
          chargeReceiptId: 'charge-receipt',
          chargeReceiptNumber: 'CH-1',
        }),
    });
    mocks.defaultDownload.mockReturnValue({
      unwrap: () => Promise.resolve(new Blob(['receipt'], { type: 'application/pdf' })),
    });
    render(<FeeCollectComponentForm student={student} academicYear={academicYear} />);
    await beginCollection();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm collection' }));
    await waitFor(() =>
      expect(mocks.defaultDownload).toHaveBeenCalledWith({
        receiptId: 'charge-receipt',
        receiptType: 'charge',
      })
    );
    expect(mocks.defaultCollect).toHaveBeenCalledWith(
      expect.objectContaining({
        studentId: 'student-one',
        academicYearId: 'application-year',
        idempotencyKey: expect.any(String),
      })
    );
  });

  it('clears the previous applicant draft when the collection context changes', async () => {
    const context = adapter();
    const view = render(
      <FeeCollectComponentForm academicYear={academicYear} collectionAdapter={context} />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Select form fee' }));
    await screen.findByText('Form fee - (Jun 2026)');
    fireEvent.change(screen.getByLabelText('Amount to collect *'), { target: { value: '250' } });
    view.rerender(
      <FeeCollectComponentForm
        academicYear={academicYear}
        collectionAdapter={{ ...context, contextKey: 'application-two' }}
      />
    );
    await waitFor(() => expect(screen.getByLabelText('Amount to collect *')).toHaveValue(''));
    expect(screen.getByRole('button', { name: 'Collect Payment' })).toBeDisabled();
    expect(screen.queryByText('Form fee - (Jun 2026)')).not.toBeInTheDocument();
    expect(context.collect).not.toHaveBeenCalled();
  });
});
