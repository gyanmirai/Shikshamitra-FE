import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { shikshaMitraToast } from 'src/components/toast';
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
  receiptProps: vi.fn(),
}));

vi.mock('./UnifiedReceiptDisplay', async (importOriginal) => {
  const original = await importOriginal<typeof import('./UnifiedReceiptDisplay')>();
  return {
    default: (props: React.ComponentProps<typeof original.default>) => {
      mocks.receiptProps(props);
      return <original.default {...props} />;
    },
  };
});

vi.mock('react-redux', () => ({
  useSelector: (selector: any) =>
    selector({
      auth: {
        permissionsInitialized: true,
        loading: false,
        permissions: ['Finance.Fees.FeeCollections.View', 'Finance.Fees.FeeCollections.Add'].map(
          (name) => ({ name, isGranted: true })
        ),
      },
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
  KeyboardSensor: vi.fn(),
  closestCenter: vi.fn(),
}));
vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: any) => children,
  useSortable: () => ({ attributes: {}, listeners: {}, setNodeRef: vi.fn() }),
  verticalListSortingStrategy: vi.fn(),
  sortableKeyboardCoordinates: vi.fn(),
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
vi.mock('src/components/preview-document/pdf-preview', () => ({
  default: ({ title, url }: any) => <div role="document" aria-label={title} data-url={url} />,
}));
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
  await screen.findByRole('row', { name: 'Form fee, Jun 2026' });
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

  it('submits the configured screen order and keeps unfunded dues in the automatic selection', async () => {
    const data = form() as any;
    const later = {
      ...data.ledger[0].items[0],
      dueFeeId: 'later-due',
      installmentLabel: 'July 2026',
    };
    data.ledger.push({ month: 6, year: 2026, totalDue: 500, items: [later] });
    Object.assign(data, {
      allocationBasis: 'Installment',
      allocationDueFeeOrder: ['canonical-due', 'later-due'],
      allocationRevision: 'review-version',
      collectionPolicyName: 'Standard policy',
      collectionPolicyVersion: 2,
    });
    mocks.selectionOverrides = [
      {
        dueFeeId: 'later-due',
        feeHeadId: 'form-fee',
        period: '2026-07',
        dueAmount: 500,
        installmentLabel: 'July 2026',
      },
      {
        dueFeeId: 'canonical-due',
        feeHeadId: 'form-fee',
        period: '2026-06',
        dueAmount: 500,
        installmentLabel: 'June 2026',
      },
    ];
    const context = adapter({ data });
    render(<FeeCollectComponentForm academicYear={academicYear} collectionAdapter={context} />);
    fireEvent.click(screen.getByRole('button', { name: 'Select form fee' }));
    await screen.findByRole('row', { name: 'Form fee, June 2026' });
    expect(screen.queryByRole('button', { name: /Reorder Form fee/ })).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Amount to collect *'), { target: { value: '250' } });
    await waitFor(() => expect(screen.getByLabelText('Amount to collect *')).toHaveValue('₹ 250'));
    fireEvent.click(screen.getByRole('button', { name: 'Collect Payment' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Review 2026-2027' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm collection' }));
    await waitFor(() =>
      expect(context.collect).toHaveBeenCalledWith(
        expect.objectContaining({
          automaticAllocation: {
            revision: 'review-version',
            dueFeeIds: ['canonical-due', 'later-due'],
            chargeIds: [],
          },
          dueFeePayments: [{ dueFeeId: 'canonical-due', feeHeadId: 'form-fee', amount: 250 }],
        })
      )
    );
  });

  it.each([
    { basis: 'Installment', order: ['canonical-due', 'later-due'], funded: 'canonical-due' },
    { basis: 'FeeHead', order: ['later-due', 'canonical-due'], funded: 'later-due' },
  ])(
    'collects an amount without selection using $basis priority',
    async ({ basis, order, funded }) => {
      const data = form() as any;
      data.ledger.push({
        month: 6,
        year: 2026,
        totalDue: 500,
        items: [
          { ...data.ledger[0].items[0], dueFeeId: 'later-due', installmentLabel: 'July 2026' },
        ],
      });
      Object.assign(data, {
        allocationBasis: basis,
        allocationDueFeeOrder: order,
        allocationRevision: 'review-version',
      });
      const context = adapter({ data });
      render(<FeeCollectComponentForm academicYear={academicYear} collectionAdapter={context} />);
      expect(screen.getByLabelText('Amount to collect *')).toHaveValue('');
      fireEvent.change(screen.getByLabelText('Amount to collect *'), {
        target: { value: '250.25' },
      });
      await waitFor(() =>
        expect(screen.getByLabelText('Amount to collect *')).toHaveValue('₹ 250.25')
      );
      const rows = within(
        screen.getByRole('table', { name: 'Selected collection items' })
      ).getAllByRole('row');
      expect(rows).toHaveLength(2);
      expect(screen.queryByRole('button', { name: /Remove Form fee/ })).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: 'Collect Payment' }));
      fireEvent.click(await screen.findByRole('button', { name: 'Review 2026-2027' }));
      fireEvent.click(screen.getByRole('button', { name: 'Confirm collection' }));
      await waitFor(() =>
        expect(context.collect).toHaveBeenCalledWith(
          expect.objectContaining({
            automaticAllocation: { revision: 'review-version', dueFeeIds: order, chargeIds: [] },
            dueFeePayments: [{ dueFeeId: funded, feeHeadId: 'form-fee', amount: 250.25 }],
          })
        )
      );
    }
  );

  it('rejects excess automatic payments and clears amount-only entry', async () => {
    const data = form() as any;
    Object.assign(data, {
      allocationBasis: 'Installment',
      allocationDueFeeOrder: ['canonical-due'],
      allocationRevision: 'review-version',
    });
    render(
      <FeeCollectComponentForm academicYear={academicYear} collectionAdapter={adapter({ data })} />
    );
    fireEvent.change(screen.getByLabelText('Amount to collect *'), { target: { value: '600' } });
    fireEvent.blur(screen.getByLabelText('Amount to collect *'));
    expect(await screen.findByText('Amount cannot exceed ₹500')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Clear All' }));
    await waitFor(() => expect(screen.getByLabelText('Amount to collect *')).toHaveValue(''));
    expect(screen.getByRole('button', { name: 'Collect Payment' })).toBeDisabled();
  });

  it('collects only the explicitly selected due instead of other outstanding fees', async () => {
    const data = form() as any;
    data.ledger.push({
      month: 6,
      year: 2026,
      totalDue: 500,
      items: [{ ...data.ledger[0].items[0], dueFeeId: 'later-due', installmentLabel: 'July 2026' }],
    });
    Object.assign(data, {
      allocationBasis: 'Installment',
      allocationDueFeeOrder: ['canonical-due', 'later-due'],
      allocationRevision: 'review-version',
    });
    mocks.selectionOverrides = [
      { dueFeeId: 'later-due', feeHeadId: 'form-fee', period: '2026-07', dueAmount: 500 },
    ];
    const context = adapter({ data });
    render(<FeeCollectComponentForm academicYear={academicYear} collectionAdapter={context} />);
    fireEvent.click(screen.getByRole('button', { name: 'Select form fee' }));
    fireEvent.change(screen.getByLabelText('Amount to collect *'), { target: { value: '250' } });
    fireEvent.click(screen.getByRole('button', { name: 'Collect Payment' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Review 2026-2027' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm collection' }));
    await waitFor(() =>
      expect(context.collect).toHaveBeenCalledWith(
        expect.objectContaining({
          automaticAllocation: {
            revision: 'review-version',
            dueFeeIds: ['later-due'],
            chargeIds: [],
          },
          dueFeePayments: [{ dueFeeId: 'later-due', feeHeadId: 'form-fee', amount: 250 }],
        })
      )
    );
  });

  it('keeps payment fields in the summary and collection actions in the bottom footer', async () => {
    render(<FeeCollectComponentForm academicYear={academicYear} collectionAdapter={adapter()} />);
    const checkout = screen.getByRole('heading', { name: 'Payment summary' }).closest('section')!;
    expect(within(checkout).getByRole('combobox', { name: /Payment method/i })).toBeInTheDocument();
    const footer = screen.getByLabelText('Collection actions');
    expect(checkout).not.toContainElement(footer);
    expect(footer).toContainElement(screen.getByRole('button', { name: 'Collect Payment' }));
    expect(footer).toContainElement(screen.getByRole('button', { name: 'Cancel' }));
    expect(footer).toContainElement(screen.getByText('Collecting now'));
    const details = screen.getByRole('region', { name: 'Payment details' });
    expect(details).not.toContainElement(screen.getByRole('heading', { name: 'Payment summary' }));
    expect(details).not.toContainElement(screen.getByText('Collecting now'));
    expect(details).not.toContainElement(screen.getByRole('button', { name: 'Collect Payment' }));
    expect(details).not.toContainElement(screen.getByRole('button', { name: 'Cancel' }));
    expect(screen.getByRole('button', { name: 'Cancel' })).toHaveClass('MuiButton-outlined');
    expect(screen.getByRole('button', { name: 'Collect Payment' })).toHaveClass(
      'MuiButton-colorInherit'
    );
    expect(screen.getByRole('button', { name: 'Clear All' })).toHaveClass('MuiButton-outlined');
    expect(screen.queryByText(/\d+ items? selected/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Select form fee' }));
    await screen.findByRole('row', { name: 'Form fee, Jun 2026' });
    fireEvent.change(screen.getByLabelText('Amount to collect *'), { target: { value: '250' } });
    expect(screen.getByLabelText('Amount to collect *')).toHaveValue('₹ 250');
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  });

  it('allows leaving when fee refresh fails while blocking another collection', () => {
    const onCancel = vi.fn();
    render(
      <FeeCollectComponentForm
        academicYear={academicYear}
        collectionAdapter={adapter({ error: { status: 500 } })}
        onCancel={onCancel}
      />
    );
    expect(screen.getByLabelText('Amount to collect *')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Collect Payment' })).toBeDisabled();
    const cancel = screen.getByRole('button', { name: 'Cancel' });
    expect(cancel).toBeEnabled();
    fireEvent.click(cancel);
    expect(onCancel).toHaveBeenCalledWith(null, false);
  });

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
          data: {
            ...form(),
            ledger: [],
            charges: [],
            student: { ...form().student, isFeeStructureAssigned: false },
          } as any,
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
    await screen.findByRole('row', { name: 'Form fee, Jun 2026' });
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

  it('collects cash using only the amount to collect', async () => {
    const collect = vi.fn().mockResolvedValue(output);
    render(
      <FeeCollectComponentForm
        academicYear={academicYear}
        collectionAdapter={adapter({ collect })}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Select form fee' }));
    await waitFor(() => expect(screen.getByLabelText('Amount to collect *')).toHaveValue('₹ 500'));
    expect(screen.queryByLabelText('Cash Received')).not.toBeInTheDocument();
    expect(screen.queryByText('Change to return')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Collect Payment' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Collect Payment' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Review 2026-2027' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirm collection' }));
    await waitFor(() => expect(collect).toHaveBeenCalledOnce());
    expect(collect.mock.calls[0][0].payments[0].amount).toBe(500);
    expect(collect.mock.calls[0][0].dueFeePayments[0].amount).toBe(500);
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
    await screen.findByRole('row', { name: 'Tuition, Jun 2026' });
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
      fireEvent.click(screen.getByRole('button', { name: 'Clear All' }));
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

  it.each([
    {
      grouping: 'Separate',
      principal: 20000,
      ordinary: 0,
      fee: 20000,
      charge: 60600,
      combined: false,
    },
    {
      grouping: 'Separate',
      principal: 20000,
      ordinary: 1000,
      fee: 20000,
      charge: 61600,
      combined: false,
    },
    {
      grouping: 'Separate',
      principal: 0,
      ordinary: 0,
      fee: undefined,
      charge: 60600,
      combined: undefined,
    },
    {
      grouping: 'Combined',
      principal: 20000,
      ordinary: 0,
      fee: 80600,
      charge: undefined,
      combined: true,
    },
  ])(
    'groups late fees into the charge receipt for $grouping collection ($principal principal, $ordinary ordinary)',
    async ({ grouping, principal, ordinary, fee, charge, combined }) => {
      const collectOutput = {
        ...output,
        receiptGrouping: grouping,
        feeReceiptId: principal > 0 || grouping === 'Combined' ? 'fee-receipt' : undefined,
        feeReceiptAmount: fee,
        chargeReceiptAmount: charge,
        chargeReceiptId: grouping === 'Separate' ? 'charge-receipt' : undefined,
        paidFeeHeads:
          principal > 0
            ? [{ feeHeadId: 'tuition', feeHeadName: 'Tuition', amountPaid: principal }]
            : [],
        paidDueFees:
          principal > 0
            ? [{ dueFeeId: 'due-one', feeHeadId: 'tuition', amountPaid: principal }]
            : [],
        paidLateFees: [{ dueFeeId: 'due-one', feeHeadId: 'tuition', amountPaid: 60600 }],
        paidCharges:
          ordinary > 0
            ? [{ chargeId: 'manual-charge', chargeName: 'Manual charge', amountPaid: ordinary }]
            : [],
        receivedAmount: principal + 60600 + ordinary,
        totalAmount: principal + 60600 + ordinary,
      };
      mocks.defaultCollect.mockReturnValue({ unwrap: () => Promise.resolve(collectOutput) });
      mocks.defaultDownload.mockReturnValue({
        unwrap: () => Promise.resolve(new Blob(['receipt'], { type: 'application/pdf' })),
      });
      render(<FeeCollectComponentForm student={student} academicYear={academicYear} />);
      await beginCollection();
      fireEvent.click(screen.getByRole('button', { name: 'Confirm collection' }));
      await waitFor(() => {
        const props = mocks.receiptProps.mock.lastCall?.[0];
        expect(props?.feeReceipt?.totalAmount).toBe(fee);
        expect(props?.chargeReceipt?.totalAmount).toBe(charge);
        expect(props?.feeReceipt?.combined).toBe(combined);
      });
    }
  );

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

  it('keeps a collected charge successful when its PDF fails and retries only the receipt', async () => {
    const chargeOutput = {
      ...output,
      studentId: 'student-one',
      feeReceiptId: undefined,
      chargeReceiptId: 'charge-receipt',
      chargeReceiptNumber: 'CH-1',
      paidCharges: [{ chargeId: 'charge-one', chargeName: 'Charge', amountPaid: 500 }],
    };
    mocks.defaultCollect.mockReturnValue({ unwrap: () => Promise.resolve(chargeOutput) });
    let rejectPdf!: (error: unknown) => void;
    const pendingPdf = new Promise<Blob>((_resolve, reject) => {
      rejectPdf = reject;
    });
    mocks.defaultDownload.mockReturnValueOnce({ unwrap: () => pendingPdf }).mockReturnValue({
      unwrap: () => Promise.resolve(new Blob(['%PDF-1.4'], { type: 'application/pdf' })),
    });
    render(<FeeCollectComponentForm student={student} academicYear={academicYear} />);
    await beginCollection();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm collection' }));
    await screen.findByRole('status', { name: 'Loading charge receipt' });
    expect(screen.queryByText(/receipt preview is unavailable/)).not.toBeInTheDocument();
    expect(screen.getByLabelText('Amount to collect *')).toHaveValue('');
    expect(screen.queryByText(/exceeds the payable amount/)).not.toBeInTheDocument();
    await waitFor(() => expect(mocks.refetch).toHaveBeenCalled());
    await act(async () => {
      rejectPdf({ status: 404 });
    });
    await screen.findByText(
      'Payment was collected, but the receipt could not be generated. Please retry or contact support.'
    );
    expect(shikshaMitraToast.error).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Retry payment' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry receipt' }));
    await screen.findByRole('document', { name: 'Charge Receipt' });
    expect(screen.getByRole('button', { name: 'Download' })).toBeEnabled();
    expect(mocks.defaultCollect).toHaveBeenCalledTimes(1);
    expect(mocks.defaultDownload).toHaveBeenCalledTimes(2);
    expect(mocks.defaultDownload).toHaveBeenLastCalledWith({
      receiptId: 'charge-receipt',
      receiptType: 'charge',
    });
    expect(mocks.queries).toHaveBeenCalledWith(
      expect.objectContaining({
        currentQueryAndMutation: mocks.downloadMutation,
        popupConfig: expect.objectContaining({ error: false }),
      })
    );
  });

  it('keeps both PDF URLs valid as separate fee and charge receipts finish loading', async () => {
    let resolveCharge!: (blob: Blob) => void;
    const pendingCharge = new Promise<Blob>((resolve) => {
      resolveCharge = resolve;
    });
    const revoke = vi.spyOn(URL, 'revokeObjectURL');
    const context = adapter({
      canViewReceipts: true,
      collect: vi.fn().mockResolvedValue({
        ...output,
        chargeReceiptId: 'charge-two',
        chargeReceiptNumber: 'CH-2',
        paidCharges: [{ chargeId: 'charge-one', chargeName: 'Charge', amountPaid: 500 }],
      }),
      downloadReceiptPdf: vi
        .fn()
        .mockImplementation((_id, scope) =>
          scope === 'fee'
            ? Promise.resolve(new Blob(['%PDF-fee'], { type: 'application/pdf' }))
            : pendingCharge
        ),
    });
    const view = render(
      <FeeCollectComponentForm academicYear={academicYear} collectionAdapter={context} />
    );
    try {
      await beginCollection();
      fireEvent.click(screen.getByRole('button', { name: 'Confirm collection' }));
      const feeUrl = (await screen.findByRole('document', { name: 'Fee Receipt' })).getAttribute(
        'data-url'
      );
      expect(screen.getByRole('status', { name: 'Loading charge receipt' })).toBeInTheDocument();
      await act(async () => {
        resolveCharge(new Blob(['%PDF-charge'], { type: 'application/pdf' }));
      });
      const chargeUrl = (
        await screen.findByRole('document', { name: 'Charge Receipt' })
      ).getAttribute('data-url');
      expect(feeUrl).toBeTruthy();
      expect(chargeUrl).toBeTruthy();
      expect(revoke).not.toHaveBeenCalledWith(feeUrl);
      expect(revoke).not.toHaveBeenCalledWith(chargeUrl);
      view.unmount();
      expect(revoke).toHaveBeenCalledWith(feeUrl);
      expect(revoke).toHaveBeenCalledWith(chargeUrl);
    } finally {
      revoke.mockRestore();
    }
  });

  it('keeps receipt access when the post-collection summary refresh rejects', async () => {
    const context = adapter({
      canViewReceipts: true,
      refetch: vi.fn().mockRejectedValue(new Error('Summary unavailable')),
      downloadReceiptPdf: vi
        .fn()
        .mockResolvedValue(new Blob(['%PDF-1.4'], { type: 'application/pdf' })),
    });
    render(<FeeCollectComponentForm academicYear={academicYear} collectionAdapter={context} />);
    await beginCollection();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm collection' }));
    await screen.findByRole('document', { name: 'Fee Receipt' });
    await screen.findByText(/Fee details could not be refreshed/);
    expect(screen.getByRole('button', { name: 'Collect Payment' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Retry payment' })).not.toBeInTheDocument();
    expect(shikshaMitraToast.error).not.toHaveBeenCalled();
    expect(context.collect).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole('button', { name: 'Refresh fees' }));
    expect(context.refetch).toHaveBeenCalledTimes(2);
  });

  it.each(['failed', 'pending'] as const)(
    'does not carry a previous applicant’s %s summary refresh into a new collection context',
    async (state) => {
      let rejectRefresh!: (error: unknown) => void;
      const pendingRefresh = new Promise((_resolve, reject) => {
        rejectRefresh = reject;
      });
      const context = adapter({ refetch: vi.fn().mockReturnValue(pendingRefresh) });
      const view = render(
        <FeeCollectComponentForm academicYear={academicYear} collectionAdapter={context} />
      );
      await beginCollection();
      fireEvent.click(screen.getByRole('button', { name: 'Confirm collection' }));
      await waitFor(() => expect(context.refetch).toHaveBeenCalledOnce());
      if (state === 'failed') {
        await act(async () => {
          rejectRefresh(new Error('Previous applicant summary unavailable'));
        });
        await screen.findByText(/Fee details could not be refreshed/);
      }
      view.rerender(
        <FeeCollectComponentForm
          academicYear={academicYear}
          collectionAdapter={adapter({ contextKey: 'application-two' })}
        />
      );
      await waitFor(() => expect(screen.getByLabelText('Amount to collect *')).toHaveValue(''));
      fireEvent.click(screen.getByRole('button', { name: 'Select form fee' }));
      fireEvent.change(screen.getByLabelText('Amount to collect *'), { target: { value: '500' } });
      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'Collect Payment' })).toBeEnabled()
      );
      if (state === 'pending')
        await act(async () => {
          rejectRefresh(new Error('Previous applicant summary unavailable'));
        });
      expect(screen.queryByText(/Fee details could not be refreshed/)).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Collect Payment' })).toBeEnabled();
    }
  );

  it('clears the previous applicant draft when the collection context changes', async () => {
    const context = adapter();
    const view = render(
      <FeeCollectComponentForm academicYear={academicYear} collectionAdapter={context} />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Select form fee' }));
    await screen.findByRole('row', { name: 'Form fee, Jun 2026' });
    fireEvent.change(screen.getByLabelText('Amount to collect *'), { target: { value: '250' } });
    view.rerender(
      <FeeCollectComponentForm
        academicYear={academicYear}
        collectionAdapter={{ ...context, contextKey: 'application-two' }}
      />
    );
    await waitFor(() => expect(screen.getByLabelText('Amount to collect *')).toHaveValue(''));
    expect(screen.getByRole('button', { name: 'Collect Payment' })).toBeDisabled();
    expect(screen.queryByRole('row', { name: 'Form fee, Jun 2026' })).not.toBeInTheDocument();
    expect(context.collect).not.toHaveBeenCalled();
  });
});
