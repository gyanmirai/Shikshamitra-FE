import type { ReactNode, ComponentProps } from 'react';

import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import PaymentTermForm from './PaymentTermForm';

const formState = vi.hoisted(() => ({
  dirty: false,
  submitting: false,
  loading: false,
  calendarMissing: false,
  resetForm: vi.fn(),
  dispatch: vi.fn(),
}));

vi.mock('react-redux', async (importOriginal) => ({
  ...(await importOriginal<typeof import('react-redux')>()),
  useDispatch: () => formState.dispatch,
}));

vi.mock('../hooks/usePaymentTermForm', () => ({
  usePaymentTermForm: () => ({
    formik: {
      initialValues: { paymentTermName: '' },
      values: { paymentTermName: formState.dirty ? 'Changed' : '' },
      dirty: formState.dirty,
      isValid: true,
      isValidating: false,
      resetForm: formState.resetForm,
    },
    boards: [],
    calendarMissing: formState.calendarMissing,
    refreshPrerequisites: vi.fn(),
    checks: { isReadyToPublish: false, validationMessage: '' },
    demandLabel: '',
    isSubmitting: formState.submitting,
    isLoadingDetail: formState.loading,
    handleSubmit: vi.fn(),
    confirmationImpact: null,
    cancelDefaultConfirmation: vi.fn(),
    isLoadingImpact: false,
    impactError: false,
    addInstallment: vi.fn(),
    removeInstallment: vi.fn(),
  }),
}));

vi.mock('src/components/back-popup-check/BackPopUpCheck', () => ({
  BackPopUpChecked: ({ children }: { children: ReactNode }) => children,
}));
vi.mock('src/screens/finance/components/FinancePrerequisiteState', () => ({
  default: () => <div>Board calendar required</div>,
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/utils/icons', () => ({
  GlobalIcons: { calendar: 'test:calendar', refresh: 'test:refresh', cancel: 'test:cancel' },
}));
vi.mock('src/components/scrollbar', () => ({
  Scrollbar: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock('./sections/GeneralInfoSection', () => ({
  GeneralInfoSection: () => <div>Board context</div>,
}));
vi.mock('./sections/InstallmentSection', () => ({
  InstallmentSection: () => <div>Installment fields</div>,
}));
vi.mock('./panels/SummaryPanel', () => ({ SummaryPanel: () => null }));
vi.mock('./PaymentTermUsage', () => ({
  PaymentTermDefaultSummary: () => null,
  PaymentTermUsageSummary: () => null,
}));
vi.mock('./FormFooter', () => ({
  FormFooter: ({ onCancel }: { onCancel: () => void }) => (
    <button type="button" onClick={onCancel}>
      Cancel
    </button>
  ),
}));

const editData = { id: 'existing-term' } as ComponentProps<typeof PaymentTermForm>['editData'];

const renderForm = (mode: 'create' | 'edit') => {
  const onClose = vi.fn();
  render(<PaymentTermForm open onClose={onClose} editData={mode === 'edit' ? editData : null} />);
  return onClose;
};

const closeBy = (method: 'backdrop' | 'escape' | 'header' | 'cancel') => {
  if (method === 'backdrop') {
    fireEvent.mouseDown(document.querySelector('.MuiDrawer-root .MuiBackdrop-root')!);
    fireEvent.click(document.querySelector('.MuiDrawer-root .MuiBackdrop-root')!);
  } else if (method === 'escape') {
    fireEvent.keyDown(document.querySelector('.MuiDrawer-root')!, { key: 'Escape' });
  } else if (method === 'header') {
    fireEvent.click(screen.getByRole('button', { name: /Close (Create|Edit) Payment Term/ }));
  } else {
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  }
};

describe.each(['create', 'edit'] as const)('Payment Term %s close behavior', (mode) => {
  beforeEach(() => {
    formState.dirty = false;
    formState.submitting = false;
    formState.loading = false;
    formState.resetForm.mockClear();
  });

  it.each(['backdrop', 'escape', 'header', 'cancel'] as const)(
    'closes untouched form through %s',
    async (method) => {
      const onClose = renderForm(mode);
      closeBy(method);
      await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
      expect(screen.queryByText('Discard unsaved changes?')).not.toBeInTheDocument();
    }
  );

  it.each(['backdrop', 'escape', 'header', 'cancel'] as const)(
    'requires a discard decision through %s when dirty',
    async (method) => {
      formState.dirty = true;
      const onClose = renderForm(mode);
      closeBy(method);
      expect(await screen.findByText('Discard unsaved changes?')).toBeInTheDocument();
      expect(onClose).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole('button', { name: 'Stay' }));
      expect(onClose).not.toHaveBeenCalled();
      expect(formState.resetForm).not.toHaveBeenCalled();
      await waitFor(() =>
        expect(screen.queryByText('Discard unsaved changes?')).not.toBeInTheDocument()
      );
      closeBy(method);
      fireEvent.click(await screen.findByRole('button', { name: 'Discard' }));
      expect(formState.resetForm).toHaveBeenCalledOnce();
      expect(onClose).toHaveBeenCalledOnce();
    }
  );
});

it.each(['submitting', 'loading'] as const)('keeps the drawer open while %s', (state) => {
  formState.dirty = true;
  formState[state] = true;
  const onClose = renderForm('create');
  closeBy('backdrop');
  closeBy('escape');
  expect(onClose).not.toHaveBeenCalled();
  expect(screen.queryByText('Discard unsaved changes?')).not.toBeInTheDocument();
  formState[state] = false;
});

it('clears the shared navigation dirty flag when the form closes', () => {
  formState.dispatch.mockClear();
  const { unmount } = render(<PaymentTermForm open onClose={vi.fn()} editData={null} />);
  unmount();
  expect(formState.dispatch).toHaveBeenCalledWith({
    type: 'confirmPopup/setIsChanges',
    payload: false,
  });
});

it('shows the payment-term field skeleton while fetching instead of empty schedule fields', () => {
  formState.loading = true;
  formState.submitting = false;
  renderForm('edit');
  expect(screen.getByRole('status', { name: 'Loading payment term' })).toBeVisible();
  expect(screen.queryByText('Board context')).not.toBeInTheDocument();
  expect(screen.queryByText('Installment fields')).not.toBeInTheDocument();
  expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
  formState.loading = false;
});

it('keeps fields visible during submission without showing a fetch skeleton', () => {
  formState.submitting = true;
  formState.loading = false;
  renderForm('edit');
  expect(screen.getByText('Board context')).toBeVisible();
  expect(screen.getByText('Installment fields')).toBeVisible();
  expect(screen.queryByRole('status', { name: 'Loading payment term' })).not.toBeInTheDocument();
  formState.submitting = false;
});

it('keeps board context and Cancel when calendar setup replaces the dependent schedule', () => {
  formState.calendarMissing = true;
  renderForm('create');
  expect(screen.getByText('Board context')).toBeVisible();
  expect(screen.getByText('Board calendar required')).toBeVisible();
  expect(screen.queryByText('Installment fields')).toBeNull();
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled();
  formState.calendarMissing = false;
});
