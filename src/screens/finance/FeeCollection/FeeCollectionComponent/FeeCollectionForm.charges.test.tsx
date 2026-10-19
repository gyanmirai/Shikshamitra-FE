import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { formatNumber } from 'src/utils/formate_number';
import { Checkbox, FormControlLabel } from '@mui/material';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { defaultSettings } from 'src/components/settings/config-settings';
import { FeeMonth, FeeCollectionStatusType } from 'src/enums/fee-collection-type';
import {
  act,
  screen,
  within,
  waitFor,
  fireEvent,
  render as rtlRender,
} from '@testing-library/react';

import FeeCollectComponentForm from './FeeCollectionForm';

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

// Browser verification covers sticky-column measurement. These regressions exercise
// selection, filters, amounts and submission without deferred DOM geometry timers.
vi.mock('src/components/customizabaleTable/hooks/useStickyColumns', () => ({
  useStickyColumns: () => ({ getStickyStyle: () => ({}) }),
}));

const mocks = vi.hoisted(() => ({
  data: {} as any,
  collect: vi.fn(),
  collectQuery: vi.fn(),
  bankQuery: vi.fn(),
  monthsQuery: vi.fn(),
  monthsRequests: vi.fn(),
  currentYear: { id: 'year-2026', year: 2026, name: '2026-2027' } as any,
  collectMutation: vi.fn(),
  downloadMutation: vi.fn(),
}));

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
// These regressions exercise collection selection and allocations, not drag geometry.
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
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: () => undefined,
    transform: null,
    transition: undefined,
    isDragging: false,
  }),
  verticalListSortingStrategy: vi.fn(),
  sortableKeyboardCoordinates: vi.fn(),
  arrayMove: () => {
    throw new Error('Drag ordering is outside this collection regression');
  },
}));
vi.mock('src/redux/feeCollection/feeCollection', () => ({
  useGetCollectFormQuery: mocks.collectQuery,
  useCollectFeeMutation: mocks.collectMutation,
  useDownloadReceiptPdfMutation: mocks.downloadMutation,
}));
vi.mock('src/redux/finance/financeRoutingApi', () => ({
  useGetFinanceRoutingOptionsQuery: mocks.bankQuery,
}));
vi.mock('src/redux/finance/financeFeeStructure', () => ({
  useGetAcademicYearMonthsQuery: mocks.monthsQuery,
}));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: ({ currentQueryAndMutation, options }: any) => {
    if (currentQueryAndMutation === mocks.collectQuery) return { data: mocks.data };
    if (currentQueryAndMutation === mocks.bankQuery)
      return { data: { bankAccounts: [{ id: 'school-bank', label: 'SBI' }] } };
    if (currentQueryAndMutation === mocks.monthsQuery) {
      if (options?.skip) return { data: undefined };
      mocks.monthsRequests();
      return {
        data: Array.from({ length: 12 }, (_, index) => ({
          month: (index + 5) % 12,
          year: index < 7 ? 2026 : 2027,
        })),
      };
    }
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
  DialogScrollContent: ({ children }: any) => children,
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
  default: ({
    filters,
    onFilterChange,
    onSelectionFilterChange,
    selectionStates,
    academicYearMonths,
    isMonthsLoading,
    entryCount,
  }: any) => (
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
      {Object.entries({
        allPending: 'All Pending',
        allCharges: 'All Charges',
        firstSixMonths: 'First 6 Month',
        lastSixMonths: 'Last 6 Month',
      }).map(([key, label]) => (
        <FormControlLabel
          key={key}
          label={label}
          control={
            <Checkbox
              checked={selectionStates[key].checked}
              indeterminate={selectionStates[key].indeterminate}
              disabled={
                (key === 'firstSixMonths' || key === 'lastSixMonths') &&
                (isMonthsLoading || !academicYearMonths?.length)
              }
              slotProps={{
                input: { 'aria-checked': selectionStates[key].indeterminate ? 'mixed' : undefined },
              }}
              onChange={(_, checked) => onSelectionFilterChange(key, checked)}
            />
          }
        />
      ))}
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

const selectReceivingBank = async () => {
  const bank = screen.queryByLabelText(/Receiving School Bank Account/);
  if (bank) {
    fireEvent.mouseDown(bank);
    fireEvent.click(await screen.findByRole('option', { name: 'SBI' }));
  }
};

const outstandingRow = () => within(screen.getByText('Total outstanding').parentElement!);

const ledger = () => {
  const region = screen.getByRole('region', { name: 'Fee ledger' });
  within(region)
    .queryAllByRole('button', { expanded: false })
    .forEach((button) => fireEvent.click(button));
  return within(region);
};
const rowCheckbox = (label: string) => {
  const row = ledger()
    .getAllByText(label)
    .find((node) => node.closest('tr'))!
    .closest('tr')!;
  return within(row).getByRole('checkbox');
};

const buildSelectionForm = () => {
  const data = buildForm(false);
  data.ledger = Array.from({ length: 12 }, (_, index) => {
    const month = (index + 5) % 12;
    const year = index < 7 ? 2026 : 2027;
    const paid = index < 5;
    return {
      month,
      year,
      totalDue: paid ? 0 : 2000,
      items: [
        {
          ...data.ledger[0].items[0],
          dueFeeId: `tuition-${index}`,
          installmentLabel: `${FeeMonth[month]} ${year}`,
          paid: paid ? 2000 : 0,
          due: paid ? 0 : 2000,
          status: paid
            ? FeeCollectionStatusType.Paid
            : index === 5
              ? FeeCollectionStatusType.Overdue
              : index === 6
                ? FeeCollectionStatusType.Partial
                : FeeCollectionStatusType.Pending,
        },
      ],
    };
  });
  data.ledger[5].items.push({
    ...data.ledger[5].items[0],
    dueFeeId: 'transport-q2',
    feeHeadId: 'transport',
    feeHeadName: 'Transport',
    installmentLabel: 'Quarter 2',
    total: 3000,
    due: 3000,
  });
  data.charges = [
    ...lateFees,
    {
      ...lateFees[0],
      chargeId: 'art',
      sourceId: 'art',
      sourceType: 'Charge',
      name: 'ART Charge',
      amount: 1111,
      pendingAmount: 1111,
    },
    {
      ...lateFees[0],
      chargeId: 'sports',
      sourceId: 'sports',
      sourceType: 'Charge',
      name: 'Sports Charge',
      amount: 1200,
      paidAmount: 1200,
      pendingAmount: 0,
      status: FeeCollectionStatusType.Paid,
    },
  ];
  return data;
};

const selectedAllocationCount = () =>
  screen
    .getByRole('heading', { name: 'Payment summary' })
    .closest('section')!
    .querySelectorAll('button[aria-label^="Remove "][aria-label$=" from collection"]').length;

const expectSelection = async (count: number, amount: number) => {
  expect(selectedAllocationCount()).toBe(count);
  await waitFor(() =>
    expect(screen.getByLabelText(/Amount to collect/)).toHaveValue(
      `₹ ${amount.toLocaleString('en-IN')}`
    )
  );
};

describe('Collect Fees presentation and shared ledger', () => {
  beforeEach(() => {
    mocks.data = buildForm(false);
    mocks.currentYear = { id: 'year-2026', year: 2026, name: '2026-2027' };
  });

  it('shows student information and outstanding balance above the collection', () => {
    mocks.data.student = {
      ...mocks.data.student,
      studentName: 'Diya',
      grNo: '10092',
      rollNo: '2',
      standardName: 'Class 3',
      divisionName: 'A',
    };
    render(<FeeCollectComponentForm student={student} />);
    expect(screen.getByText('Diya')).toBeVisible();
    expect(screen.getByText(/GR 10092.*Class 3 A.*2026-2027/)).toBeVisible();
    expect(screen.getByText('Total outstanding')).toBeVisible();
  }, 30_000);

  it('preserves an edited partial amount and selection through grouping and sorting', async () => {
    render(<FeeCollectComponentForm student={student} />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'All Pending' }));
    await expectSelection(1, 2000);
    await act(async () => {
      fireEvent.change(screen.getByLabelText(/Amount to collect/), { target: { value: '500' } });
    });
    fireEvent.click(screen.getByText('Switch ledger view'));
    expect(screen.getByLabelText(/Amount to collect/)).toHaveValue('₹ 500');
    expect(selectedAllocationCount()).toBe(1);
    expect(screen.queryByText('1 item selected')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Sort by Amount' }));
    expect(
      screen.getByRole('checkbox', { name: 'Select Class 3 Tuition Fee, June 2026' })
    ).toBeChecked();
    expect(screen.getByLabelText(/Cash Received/)).toHaveValue('₹ 500');
  }, 30_000);

  it('shows the fee breakdown from the common View icon and keeps the selection on close', () => {
    render(<FeeCollectComponentForm student={student} />);
    const checkbox = screen.getByRole('checkbox', {
      name: 'Select Class 3 Tuition Fee, June 2026',
    });
    fireEvent.click(checkbox);
    fireEvent.click(screen.getByRole('button', { name: 'View Class 3 Tuition Fee, June 2026' }));
    expect(screen.getByText('Outstanding principal')).toBeVisible();
    expect(screen.getByText('Reconciliation amount')).toBeVisible();
    expect(screen.getByText('Concession')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(checkbox).toBeChecked();
  }, 30_000);

  it('selects fee and charge groups independently from their headers', async () => {
    render(<FeeCollectComponentForm student={student} />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select Class 3 Tuition Fee' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'Select Additional Charges' }));
    await expectSelection(5, 2400);
    fireEvent.change(screen.getByLabelText(/Cash Received/), { target: { value: '3000' } });
    expect(screen.getByLabelText(/Cash Received/)).toHaveValue('₹ 3,000');
    fireEvent.click(screen.getByRole('button', { name: 'Clear All' }));
    expect(screen.getByLabelText(/Cash Received/)).toHaveValue('');
    expect(screen.getByRole('button', { name: 'Clear All' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Collect Payment' })).toBeDisabled();
  }, 30_000);
});

describe('Fee Collection selection presets', () => {
  beforeEach(() => {
    mocks.data = buildSelectionForm();
    mocks.currentYear = { id: 'year-2026', year: 2026, name: '2026-2027' };
    mocks.monthsRequests.mockClear();
  });

  it('uses server academic-year dates for a collector without Fee Structure calendar access', async () => {
    mocks.currentYear = { ...mocks.currentYear, startDate: '2026-06-01', endDate: '2027-05-31' };
    render(<FeeCollectComponentForm student={student} />);
    expect(mocks.monthsRequests).not.toHaveBeenCalled();
    expect(screen.getByRole('checkbox', { name: 'First 6 Month' })).toBeEnabled();
    expect(screen.getByRole('checkbox', { name: 'Last 6 Month' })).toBeEnabled();
    fireEvent.click(screen.getByRole('checkbox', { name: 'First 6 Month' }));
    await expectSelection(2, 5000);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Last 6 Month' }));
    await expectSelection(8, 17000);
    expect(mocks.monthsRequests).not.toHaveBeenCalled();
  }, 30_000);

  it('uses the actual final six months when the academic period contains thirteen months', async () => {
    mocks.currentYear = { ...mocks.currentYear, startDate: '2026-06-01', endDate: '2027-06-30' };
    mocks.data.ledger.push({
      ...mocks.data.ledger[11],
      month: FeeMonth.June,
      year: 2027,
      items: [
        {
          ...mocks.data.ledger[11].items[0],
          dueFeeId: 'tuition-13',
          installmentLabel: 'June 2027',
        },
      ],
    });
    render(<FeeCollectComponentForm student={student} />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Last 6 Month' }));
    await expectSelection(6, 12000);
    expect(rowCheckbox('December 2026')).not.toBeChecked();
    expect(rowCheckbox('June 2027')).toBeChecked();
  }, 30_000);

  it.each([
    ['All Pending', 8, 17000],
    ['All Charges', 5, 1511],
    ['First 6 Month', 2, 5000],
    ['Last 6 Month', 6, 12000],
  ])(
    'applies %s on the first click using unpaid academic periods and synchronized checkout',
    async (label, count, amount) => {
      render(<FeeCollectComponentForm student={student} />);
      fireEvent.click(screen.getByRole('checkbox', { name: String(label) }));
      await expectSelection(Number(count), Number(amount));
      expect(rowCheckbox('June 2026')).toBeDisabled();
      expect(rowCheckbox('Sports Charge')).toBeDisabled();
      fireEvent.click(screen.getByRole('checkbox', { name: String(label) }));
      expect(screen.getByRole('button', { name: 'Clear All' })).toBeDisabled();
    },
    30_000
  );

  it('preserves overlapping filters and manual rows when each preset is unchecked', async () => {
    render(<FeeCollectComponentForm student={student} />);
    fireEvent.click(rowCheckbox('December 2026'));
    fireEvent.click(rowCheckbox('ART Charge'));
    fireEvent.click(screen.getByRole('checkbox', { name: 'All Pending' }));
    expect(screen.getByRole('checkbox', { name: 'First 6 Month' })).not.toBeChecked();
    fireEvent.click(screen.getByRole('checkbox', { name: 'First 6 Month' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'All Charges' }));
    await expectSelection(13, 18511);
    fireEvent.click(screen.getByRole('checkbox', { name: 'All Pending' }));
    await expectSelection(8, 8511);
    fireEvent.click(screen.getByRole('checkbox', { name: 'All Charges' }));
    await expectSelection(4, 8111);
    fireEvent.click(screen.getByRole('checkbox', { name: 'First 6 Month' }));
    await expectSelection(2, 3111);
    expect(rowCheckbox('December 2026')).toBeChecked();
    expect(rowCheckbox('ART Charge')).toBeChecked();
  }, 30_000);

  it('shows a mixed preset after manual removal and restores its full scope with one click', async () => {
    render(<FeeCollectComponentForm student={student} />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'All Pending' }));
    fireEvent.click(rowCheckbox('November 2026'));
    expect(screen.getByRole('checkbox', { name: 'All Pending' })).toHaveAttribute(
      'aria-checked',
      'mixed'
    );
    await expectSelection(7, 15000);
    fireEvent.click(screen.getByRole('checkbox', { name: 'All Pending' }));
    await expectSelection(8, 17000);
    expect(rowCheckbox('November 2026')).toBeChecked();
    fireEvent.click(screen.getByRole('checkbox', { name: 'All Pending' }));
    expect(screen.getByRole('button', { name: 'Clear All' })).toBeDisabled();
  }, 30_000);

  it('selects the full ledger across display filters without changing academic halves', async () => {
    render(<FeeCollectComponentForm student={student} />);
    fireEvent.change(screen.getByLabelText('Fee Head'), { target: { value: 'transport' } });
    fireEvent.change(screen.getByLabelText('Status'), {
      target: { value: String(FeeCollectionStatusType.Partial) },
    });
    expect(screen.getByText('No entries found for selected filters')).toBeVisible();
    fireEvent.click(screen.getByRole('checkbox', { name: 'First 6 Month' }));
    await expectSelection(2, 5000);
    fireEvent.click(screen.getByRole('checkbox', { name: 'Last 6 Month' }));
    await expectSelection(8, 17000);
    fireEvent.click(screen.getByRole('checkbox', { name: 'All Charges' }));
    await expectSelection(13, 18511);
    fireEvent.click(screen.getByText('Switch ledger view'));
    await expectSelection(13, 18511);
  }, 30_000);

  it('keeps distinct installments in the same head and month independently selectable', async () => {
    mocks.data.ledger[5].items.push({
      ...mocks.data.ledger[5].items[0],
      dueFeeId: 'second-installment',
      installmentLabel: 'Second installment',
      due: 500,
    });
    render(<FeeCollectComponentForm student={student} />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'All Pending' }));
    await expectSelection(9, 17500);
    fireEvent.click(rowCheckbox('Second installment'));
    await expectSelection(8, 17000);
    expect(rowCheckbox('November 2026')).toBeChecked();
    expect(rowCheckbox('Second installment')).not.toBeChecked();
  }, 30_000);

  it('reconciles selected fees and charges to refreshed unpaid balances', async () => {
    const view = render(<FeeCollectComponentForm student={student} />);
    fireEvent.click(screen.getByRole('checkbox', { name: 'All Pending' }));
    fireEvent.click(screen.getByRole('checkbox', { name: 'All Charges' }));
    await expectSelection(13, 18511);

    const refreshed = buildSelectionForm();
    Object.assign(refreshed.ledger[5].items[0], {
      due: 0,
      paid: 2000,
      status: FeeCollectionStatusType.Paid,
    });
    Object.assign(refreshed.ledger[6].items[0], { due: 500, paid: 1500 });
    Object.assign(refreshed.charges[4], {
      pendingAmount: 0,
      paidAmount: 1111,
      status: FeeCollectionStatusType.Paid,
    });
    mocks.data = refreshed;
    view.rerender(<FeeCollectComponentForm student={student} />);

    await expectSelection(11, 13900);
    expect(screen.getByRole('checkbox', { name: 'All Pending' })).toBeChecked();
    expect(screen.getByRole('checkbox', { name: 'All Charges' })).toBeChecked();
    fireEvent.click(screen.getByRole('checkbox', { name: 'All Pending' }));
    await expectSelection(4, 400);
    fireEvent.click(screen.getByRole('checkbox', { name: 'All Charges' }));
    expect(screen.getByRole('button', { name: 'Clear All' })).toBeDisabled();
  }, 30_000);
});

describe('Fee Collection independent additional charges', () => {
  beforeEach(() => {
    mocks.currentYear = { id: 'year-2026', year: 2026, name: '2026-2027' };
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
      expect(ledger().getByText('Class 3 Tuition Fee')).toBeVisible();
      expect(ledger().queryAllByText('Additional Charges')[0] ?? null).not.toBeInTheDocument();
      [
        FeeCollectionStatusType.Paid,
        FeeCollectionStatusType.Partial,
        FeeCollectionStatusType.Reversed,
        FeeCollectionStatusType.InReconciliation,
      ].forEach((status) => {
        fireEvent.change(screen.getByLabelText('Status'), { target: { value: String(status) } });
        expect(screen.getByText('0 entries')).toBeVisible();
        expect(screen.getByText('No entries found for selected filters')).toBeVisible();
        expect(ledger().queryAllByText('Additional Charges')[0] ?? null).not.toBeInTheDocument();
      });
      fireEvent.change(screen.getByLabelText('Status'), {
        target: { value: String(FeeCollectionStatusType.Pending) },
      });
      expect(screen.getByText('4 entries')).toBeVisible();
      expect(ledger().getAllByText('Additional Charges')[0]).toBeVisible();
      expect(ledger().queryByText('Class 3 Tuition Fee')).not.toBeInTheDocument();
      lateFees.forEach((charge) => expect(screen.getByText(charge.name)).toBeVisible());
      fireEvent.click(screen.getByText('Switch ledger view'));
    });
  });

  it('All Charges selects unpaid charges across display filters and preserves manually selected hidden charges', async () => {
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
    const firstChargeRow = ledger().getByText(lateFees[0].name).closest('tr')!;
    fireEvent.click(within(firstChargeRow).getByRole('checkbox'));
    fireEvent.change(screen.getByLabelText('Status'), {
      target: { value: String(FeeCollectionStatusType.Partial) },
    });
    expect(screen.getByText('1 entries')).toBeVisible();
    expect(ledger().queryAllByText('Additional Charges')[0] ?? null).toBeVisible();
    fireEvent.click(screen.getByRole('checkbox', { name: 'All Charges' }));
    await waitFor(() => expect(selectedAllocationCount()).toBe(5));
    await selectReceivingBank();
    fireEvent.click(screen.getByRole('button', { name: 'Collect Payment' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Review payment' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Confirm collection' }));
    await waitFor(() => expect(mocks.collect).toHaveBeenCalledOnce());
    expect(mocks.collect.mock.calls[0][0].lateFeePayments).toEqual([
      ...lateFees.map((charge) => ({ dueFeeId: charge.sourceId, amount: 100 })),
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
    expect(ledger().getAllByText('Additional Charges')[0]).toBeVisible();
    expect(screen.getByText(lateFees[0].name)).toBeVisible();
    expect(ledger().getByText('Class 3 Tuition Fee')).toBeVisible();
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
    expect(ledger().getByText(lateFees[0].name)).toBeVisible();
    expect(screen.queryByText('Unscoped manual charge')).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Fee Head'), { target: { value: 'transport' } });
    expect(screen.getByText('0 entries')).toBeVisible();
    expect(screen.getByText('No entries found for selected filters')).toBeVisible();
    fireEvent.change(screen.getByLabelText('Month'), { target: { value: 'All' } });
    fireEvent.change(screen.getByLabelText('Fee Head'), { target: { value: 'All' } });
    expect(screen.getByText('6 entries')).toBeVisible();
    expect(ledger().getByText('Unscoped manual charge')).toBeVisible();
  });

  it('uses fresh fee and charge balances instead of the stale Collections row', () => {
    const view = render(<FeeCollectComponentForm student={student} />);
    expect(outstandingRow().getByText(formatNumber(2400, 'INR'))).toBeVisible();

    mocks.data = buildForm(true);
    view.rerender(<FeeCollectComponentForm student={student} />);
    expect(outstandingRow().getByText(formatNumber(400, 'INR'))).toBeVisible();
    expect(ledger().getAllByText('Additional Charges')[0]).toBeVisible();
    lateFees.forEach((charge) => expect(screen.getByText(charge.name)).toBeVisible());
  });

  it('collects only selected principal and keeps unpaid late fees selectable on reopening', async () => {
    const view = render(<FeeCollectComponentForm student={student} />);
    const principalRow = ledger().getByText('Jun 2026').closest('tr')!;
    fireEvent.click(within(principalRow).getByRole('checkbox'));
    await selectReceivingBank();
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
        const row = ledger().getByText(charge.name).closest('tr')!;
        expect(within(row).getByRole('checkbox')).toBeChecked();
        expect(within(row).getByRole('checkbox')).toBeEnabled();
      });
    });
    expect(outstandingRow().getByText(formatNumber(400, 'INR'))).toBeVisible();
    await selectReceivingBank();
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
