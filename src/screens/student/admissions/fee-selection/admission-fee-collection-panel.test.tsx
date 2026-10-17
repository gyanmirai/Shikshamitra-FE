import type { AdmissionFeeCollectionSummary } from 'src/redux/student/admissions/admission-fee-collection-types';

import { it, vi, expect, beforeEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import AdmissionFeeCollectionPanel from './admission-fee-collection-panel';
import { ADMISSION_FEE_COLLECTION_PERMISSIONS } from './admission-fee-collection-permissions';

const mocks = vi.hoisted(() => ({
  summary: vi.fn(),
  form: vi.fn(),
  prepare: vi.fn(),
  prepareUnwrap: vi.fn(),
  collect: vi.fn(),
  collectUnwrap: vi.fn(),
  download: vi.fn(),
  refetch: vi.fn(),
  formProps: vi.fn(),
}));
let permissions: { name: string; isGranted: boolean }[] = [];
vi.mock('react-redux', () => ({
  useSelector: (selector: (state: unknown) => unknown) =>
    selector({ auth: { permissions }, confirmPopup: { isChanges: false } }),
  useDispatch: () => vi.fn(),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden /> }));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { error: vi.fn() } }));
vi.mock('src/components/customizabaleTable', () => ({
  default: ({ data }: { data: { receiptNumber: string }[] }) => (
    <div aria-label="Fee receipts">
      {data.map((row) => (
        <span key={row.receiptNumber}>{row.receiptNumber}</span>
      ))}
    </div>
  ),
}));
vi.mock('src/screens/finance/FeeCollection/FeeCollectionComponent/FeeCollectionForm', () => ({
  default: (props: {
    academicYear: { id: string };
    student: unknown;
    collectionAdapter: { collect: (input: unknown) => Promise<unknown> };
    onBusyChange: (busy: boolean) => void;
    onCancel: () => void;
  }) => {
    mocks.formProps(props);
    return (
      <>
        <span>Collection form</span>
        <button type="button" onClick={() => props.onBusyChange(true)}>
          Start saving
        </button>
        <button
          type="button"
          onClick={async () => {
            await props.collectionAdapter.collect({
              academicYearId: props.academicYear.id,
              idempotencyKey: 'stable-retry-key',
              dueFeePayments: [],
              chargePayments: [],
              payments: [],
            });
            props.onCancel();
          }}
        >
          Complete payment
        </button>
      </>
    );
  },
}));
vi.mock('src/redux/student/admissions/admission-fee-collection-api', () => ({
  useGetAdmissionFeeCollectionSummaryQuery: mocks.summary,
  useGetAdmissionFeeCollectFormQuery: mocks.form,
  usePrepareAdmissionFeeCollectionMutation: () => [mocks.prepare, { isLoading: false }],
  useCollectAdmissionFeeMutation: () => [mocks.collect, { isLoading: false }],
}));
vi.mock('src/redux/feeCollection/feeCollection', () => ({
  useDownloadReceiptPdfMutation: () => [mocks.download, { isLoading: false }],
}));

const summary: AdmissionFeeCollectionSummary = {
  applicationId: 'application-1',
  accountId: null,
  studentId: null,
  applicantName: 'Kabir Shah',
  applicationNumber: 'APP-2026-004',
  academicYear: {
    id: 'application-year',
    name: '2026-2027',
    year: 2026,
    startDate: '2026-06-01',
    endDate: '2027-05-31',
  },
  currency: 'INR',
  structureName: 'Class one fees',
  structureRevision: 2,
  totalAmount: 12000,
  confirmedPaidAmount: 4000,
  pendingVerificationAmount: 2000,
  outstandingAmount: 6000,
  canCollect: true,
  blocker: null,
  hasPaymentEvidence: true,
  feeHeads: [],
  receipts: [
    {
      id: 'receipt-1',
      receiptNumber: 'FEE-0001',
      amount: 4000,
      status: 'confirmed',
      collectedAt: '2026-10-12T05:00:00Z',
      paymentMethods: ['Cash'],
    },
  ],
};

const renderPanel = (
  props: Partial<React.ComponentProps<typeof AdmissionFeeCollectionPanel>> = {}
) =>
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <AdmissionFeeCollectionPanel applicationId="application-1" {...props} />
    </ThemeProvider>
  );

beforeEach(() => {
  vi.clearAllMocks();
  permissions = Object.values(ADMISSION_FEE_COLLECTION_PERMISSIONS).map((name) => ({
    name,
    isGranted: true,
  }));
  mocks.summary.mockReturnValue({
    currentData: summary,
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: mocks.refetch,
  });
  mocks.form.mockReturnValue({
    currentData: undefined,
    isLoading: false,
    isFetching: false,
    refetch: mocks.refetch,
  });
  mocks.prepare.mockReturnValue({ unwrap: mocks.prepareUnwrap });
  mocks.prepareUnwrap.mockResolvedValue(summary);
  mocks.collect.mockReturnValue({ unwrap: mocks.collectUnwrap });
  mocks.collectUnwrap.mockResolvedValue({ id: 'transaction-1' });
});

it('skips financial reads and renders no collection controls without exact Finance view', () => {
  permissions = [{ name: 'Students.Onboarding.Add', isGranted: true }];
  renderPanel();
  expect(mocks.summary).toHaveBeenCalledWith('application-1', { skip: true });
  expect(screen.queryByRole('button', { name: 'Collect fees' })).not.toBeInTheDocument();
  expect(mocks.prepare).not.toHaveBeenCalled();
});

it('uses server balances and separates unverified money instead of deriving total minus paid', () => {
  renderPanel();
  expect(screen.getByText('Fee balance').nextElementSibling).toHaveTextContent('6,000');
  expect(screen.getByText('Confirmed payments').nextElementSibling).toHaveTextContent('4,000');
  expect(screen.getByText('Scheduled fees')).toBeInTheDocument();
  expect(screen.getByText('Fee balance')).toBeInTheDocument();
  expect(
    screen.getByText('Charges and late fees are shown separately in the collection form.')
  ).toBeInTheDocument();
  expect(screen.getByRole('alert')).toHaveTextContent('2,000');
  expect(mocks.prepare).not.toHaveBeenCalled();
});

it.each([false, true])('shows settled fees and receipts without a collection action (workspace=%s)', (stretch) => {
  mocks.summary.mockReturnValue({
    currentData: {
      ...summary,
      isSettled: true,
      canCollect: false,
      outstandingAmount: 0,
      confirmedPaidAmount: 12000,
      pendingVerificationAmount: 0,
    },
    isFetching: false,
  });
  renderPanel({ stretch });
  expect(screen.getByText('Settled')).toBeVisible();
  expect(screen.getByText('Fee balance').nextElementSibling).toHaveTextContent('₹0');
  expect(screen.getByLabelText('Fee receipts')).toHaveTextContent('FEE-0001');
  expect(screen.queryByRole('button', { name: 'Collect fees' })).not.toBeInTheDocument();
  expect(screen.queryByText('Collection form')).not.toBeInTheDocument();
  expect(screen.queryByText('Charges and late fees are shown separately in the collection form.'))
    .not.toBeInTheDocument();
  expect(mocks.prepare).not.toHaveBeenCalled();
  expect(mocks.collect).not.toHaveBeenCalled();
});

it('keeps collection available when Finance reports unsettled charges despite zero fee principal', () => {
  mocks.summary.mockReturnValue({
    currentData: { ...summary, isSettled: false, outstandingAmount: 0, pendingVerificationAmount: 0 },
    isFetching: false,
  });
  renderPanel();
  expect(screen.getByRole('button', { name: 'Collect fees' })).toBeEnabled();
  expect(screen.queryByText('Settled')).not.toBeInTheDocument();
});

it('keeps unknown balances distinct from zero and preserves collection prerequisites in the workspace', () => {
  mocks.summary.mockReturnValue({
    currentData: {
      ...summary,
      totalAmount: null,
      outstandingAmount: null,
      confirmedPaidAmount: 0,
      pendingVerificationAmount: 0,
      canCollect: false,
      blocker: 'Confirm a published fee structure before collecting fees.',
      hasPaymentEvidence: false,
      receipts: [],
    },
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: mocks.refetch,
  });
  renderPanel({
    stretch: true,
    footerAction: <button type="button">Collect later in Onboarding</button>,
  });
  expect(screen.getAllByLabelText('Not calculated')).toHaveLength(2);
  expect(screen.getByText('Confirmed payments').nextElementSibling).toHaveTextContent('₹0');
  expect(
    screen.getByText('Confirm a published fee structure before collecting fees.')
  ).toBeVisible();
  expect(screen.getByRole('button', { name: 'Collect fees' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Collect later in Onboarding' })).toBeEnabled();
  expect(mocks.prepare).not.toHaveBeenCalled();
});

it.each(['loading', 'error'])(
  'retains the independent deferral action while collection is %s',
  (status) => {
    mocks.summary.mockReturnValue({
      currentData: undefined,
      isLoading: status === 'loading',
      isFetching: status === 'loading',
      isError: status === 'error',
      refetch: mocks.refetch,
    });
    renderPanel({
      stretch: true,
      footerAction: <button type="button">Collect later in Onboarding</button>,
    });
    expect(screen.getByRole('button', { name: 'Collect later in Onboarding' })).toBeEnabled();
    if (status === 'error') {
      fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
      expect(mocks.refetch).toHaveBeenCalledOnce();
    }
    expect(mocks.prepare).not.toHaveBeenCalled();
  }
);

it('preserves an open Finance form while blocking a new payment when parent fee details become unavailable', async () => {
  const view = renderPanel();
  fireEvent.click(screen.getByRole('button', { name: 'Collect fees' }));
  await screen.findByText('Collection form');
  const mountedForm = screen.getByText('Collection form');
  view.rerender(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <AdmissionFeeCollectionPanel applicationId="application-1" disabled />
    </ThemeProvider>
  );
  expect(screen.getByText('Collection form')).toBe(mountedForm);
  const props = mocks.formProps.mock.calls.at(-1)![0];
  await expect(
    props.collectionAdapter.collect({ idempotencyKey: 'preserved-key' })
  ).rejects.toMatchObject({
    status: 409,
    data: { detail: 'Fee details must be refreshed before recording another payment.' },
  });
  expect(mocks.collect).not.toHaveBeenCalled();
});

it('keeps the parent interaction lock when the open callback changes identity', async () => {
  const first = vi.fn();
  const latest = vi.fn();
  const view = renderPanel({ onOpenChange: first });
  fireEvent.click(screen.getByRole('button', { name: 'Collect fees' }));
  await screen.findByText('Collection form');
  expect(first).toHaveBeenLastCalledWith(true);
  view.rerender(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <AdmissionFeeCollectionPanel applicationId="application-1" onOpenChange={latest} />
    </ThemeProvider>
  );
  expect(first).not.toHaveBeenCalledWith(false);
  expect(latest).not.toHaveBeenCalledWith(false);
  view.unmount();
  expect(latest).toHaveBeenLastCalledWith(false);
});

it.each(['parent', 'settled'])('allows only the previously submitted key to retry while %s blocks new payments', async (blocker) => {
  const view = renderPanel();
  fireEvent.click(screen.getByRole('button', { name: 'Collect fees' }));
  await screen.findByText('Collection form');
  const input = {
    academicYearId: 'application-year',
    idempotencyKey: 'existing-payment',
    dueFeePayments: [],
    chargePayments: [],
    payments: [],
  };
  await mocks.formProps.mock.lastCall![0].collectionAdapter.collect(input);
  if (blocker === 'settled') {
    mocks.summary.mockReturnValue({
      currentData: { ...summary, isSettled: true, canCollect: false, outstandingAmount: 0 },
      isFetching: false,
    });
  }
  view.rerender(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <AdmissionFeeCollectionPanel applicationId="application-1" disabled={blocker === 'parent'} />
    </ThemeProvider>
  );
  const adapter = mocks.formProps.mock.lastCall![0].collectionAdapter;
  await expect(adapter.collect(input)).resolves.toEqual({ id: 'transaction-1' });
  await expect(adapter.collect({ ...input, idempotencyKey: 'new-payment' })).rejects.toMatchObject({
    status: 409,
  });
  expect(mocks.collect).toHaveBeenCalledTimes(2);
});

it('gives view-only staff a clear disabled action and omits protected receipt references', () => {
  permissions = [{ name: ADMISSION_FEE_COLLECTION_PERMISSIONS.view, isGranted: true }];
  renderPanel();
  expect(screen.getByRole('button', { name: 'Collect fees' })).toBeDisabled();
  expect(screen.getByText(/authorized fee collection user/)).toBeVisible();
  expect(screen.queryByText('FEE-0001')).not.toBeInTheDocument();
});

it('prepares only on explicit open, prevents repeated prepare clicks and passes real academic context without fake Student', async () => {
  const onOpenChange = vi.fn();
  renderPanel({ onOpenChange });
  const button = screen.getByRole('button', { name: 'Collect fees' });
  fireEvent.click(button);
  fireEvent.click(button);
  await screen.findByRole('dialog', { name: 'Collect Fees · Kabir Shah' });
  expect(mocks.prepare).toHaveBeenCalledExactlyOnceWith({
    applicationId: 'application-1',
    variableFeeHeads: [],
  });
  expect(mocks.form).toHaveBeenLastCalledWith('application-1', {
    skip: false,
    refetchOnMountOrArgChange: true,
  });
  expect(mocks.formProps.mock.lastCall?.[0]).toMatchObject({
    student: null,
    academicYear: summary.academicYear,
  });
  expect(onOpenChange).toHaveBeenCalledWith(true);
  fireEvent.click(screen.getByRole('button', { name: 'Complete payment' }));
  await waitFor(() =>
    expect(mocks.collect).toHaveBeenCalledWith({
      applicationId: 'application-1',
      input: {
        academicYearId: 'application-year',
        idempotencyKey: 'stable-retry-key',
        dueFeePayments: [],
        chargePayments: [],
        payments: [],
      },
    })
  );
  await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
});

it('preserves the collection entry point after prepare fails and allows a safe retry', async () => {
  mocks.prepareUnwrap.mockRejectedValueOnce({
    data: { detail: 'Fee configuration is incomplete.' },
  });
  const onOpenChange = vi.fn();
  renderPanel({ onOpenChange });
  fireEvent.click(screen.getByRole('button', { name: 'Collect fees' }));
  await screen.findByText('Fee configuration is incomplete.');
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(onOpenChange).toHaveBeenLastCalledWith(false);
  fireEvent.click(screen.getByRole('button', { name: 'Collect fees' }));
  await screen.findByRole('dialog');
  expect(mocks.prepare).toHaveBeenCalledTimes(2);
});

it('prevents collection from stale error data and offers refresh', () => {
  mocks.summary.mockReturnValue({ currentData: summary, isError: true, refetch: mocks.refetch });
  renderPanel();
  expect(screen.getByRole('button', { name: 'Collect fees' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
  expect(mocks.refetch).toHaveBeenCalledOnce();
});

it('keeps the modal close action unavailable while the reused Finance form is saving', async () => {
  renderPanel();
  fireEvent.click(screen.getByRole('button', { name: 'Collect fees' }));
  await screen.findByRole('dialog');
  fireEvent.click(screen.getByRole('button', { name: 'Start saving' }));
  expect(screen.getByRole('button', { name: /Close/i })).toBeDisabled();
});

it.each([null, 'existing-unspent-account'])(
  'asks for configured variable fees before preparation even with account %s',
  async (accountId) => {
    mocks.summary.mockReturnValue({
      currentData: {
        ...summary,
        accountId,
        variableFeeHeads: [
          {
            feeHeadId: 'transport',
            feeHeadName: 'Transport',
            included: true,
            isVariable: true,
            isOptional: true,
            isOneTime: false,
            configuredAmount: null,
            effectiveAmount: null,
            amountBasis: 'Term coverage',
            obligation: 0,
            verification: 'Required',
          },
        ],
      },
      refetch: mocks.refetch,
    });
    renderPanel();
    fireEvent.click(screen.getByRole('button', { name: 'Collect fees' }));
    await screen.findByRole('dialog', { name: 'Set variable fee amounts · Kabir Shah' });
    expect(mocks.prepare).not.toHaveBeenCalled();
    fireEvent.change(screen.getByRole('textbox', { name: /Transport total for term coverage/ }), {
      target: { value: '1250.75' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Continue to collection' }));
    await screen.findByRole('dialog', { name: 'Collect Fees · Kabir Shah' });
    expect(mocks.prepare).toHaveBeenCalledWith({
      applicationId: 'application-1',
      variableFeeHeads: [{ feeHeadId: 'transport', amount: 1250.75, zeroAmountReason: undefined }],
    });
  }
);
