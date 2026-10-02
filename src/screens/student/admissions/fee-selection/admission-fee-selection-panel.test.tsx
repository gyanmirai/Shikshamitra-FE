import type {
  AdmissionFeeSelection,
  AdmissionFeeStructureCandidate,
} from 'src/redux/student/admissions/admission-fee-selection-types';

import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings';
import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import AdmissionFeeSelectionPanel from './admission-fee-selection-panel';

const mocks = vi.hoisted(() => ({
  read: vi.fn(),
  candidates: vi.fn(),
  save: vi.fn(),
  confirm: vi.fn(),
  refetch: vi.fn(),
  unwrap: vi.fn(),
  confirmationUnwrap: vi.fn(),
  dispatch: vi.fn(),
}));
let permissions: { name: string; isGranted: boolean }[] = [];
vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden /> }));
vi.mock('react-redux', () => ({
  useSelector: () => permissions,
  useDispatch: () => mocks.dispatch,
}));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: vi.fn() } }));
vi.mock('src/redux/student/admissions/admission-fee-selection-api', () => ({
  useGetAdmissionFeeSelectionQuery: mocks.read,
  useGetAdmissionFeeSelectionCandidatesQuery: mocks.candidates,
  useSaveAdmissionFeeSelectionMutation: () => [mocks.save, { isLoading: false }],
  useConfirmAdmissionFeeSelectionOnboardingMutation: () => [mocks.confirm, { isLoading: false }],
}));

const candidate: AdmissionFeeStructureCandidate = {
  structureId: 'structure-1',
  structureName: 'Class one fees',
  revisionNumber: 2,
  academicYearId: 'year-1',
  standardId: 'class-1',
  heads: [
    {
      feeHeadId: 'tuition',
      feeHeadName: 'Tuition',
      configuredAmount: 12000,
      isOptional: false,
      isOneTime: false,
      paymentTermId: 'term',
      paymentTermVersionId: 'version',
    },
    {
      feeHeadId: 'bus',
      feeHeadName: 'Transport',
      configuredAmount: 3000,
      isOptional: true,
      isOneTime: false,
      paymentTermId: 'term',
      paymentTermVersionId: 'version',
    },
  ],
};
const base: AdmissionFeeSelection = {
  applicationId: 'application-1',
  concurrencyStamp: 'stamp-1',
  ownerStageId: 'offer',
  ownerStageName: 'Offer',
  ownerStageType: 8,
  currentStageId: 'offer',
  currency: 'INR',
  available: true,
  isRequired: false,
  isLocked: false,
  canEdit: true,
  canConfirmOnboarding: false,
  onboardingConfirmed: false,
  onboardingBlocker: null,
  selection: null,
};
const selected: AdmissionFeeSelection = {
  ...base,
  selection: {
    ...candidate,
    heads: [candidate.heads[0]],
    currency: 'INR',
    savedBy: 'staff',
    savedAt: '2026-09-30T08:00:00Z',
    onboardingConfirmedAt: null,
  },
};
const setRead = (state: AdmissionFeeSelection | undefined, extra = {}) =>
  mocks.read.mockReturnValue({
    currentData: state,
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: mocks.refetch,
    ...extra,
  });
const renderPanel = (
  props: Partial<React.ComponentProps<typeof AdmissionFeeSelectionPanel>> = {}
) =>
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <AdmissionFeeSelectionPanel applicationId="application-1" {...props} />
    </ThemeProvider>
  );

describe('AdmissionFeeSelectionPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    permissions = [
      'Students.Admissions.Applications.View',
      'Students.Admissions.Applications.Add',
      'Students.Onboarding.Add',
    ].map((name) => ({ name, isGranted: true }));
    setRead(base);
    mocks.candidates.mockReturnValue({
      currentData: [candidate],
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: mocks.refetch,
    });
    mocks.save.mockReturnValue({ unwrap: mocks.unwrap });
    mocks.unwrap.mockResolvedValue(selected);
    mocks.confirm.mockReturnValue({ unwrap: mocks.confirmationUnwrap });
    mocks.confirmationUnwrap.mockResolvedValue(selected);
  });
  it('skips inaccessible data and hides selection before an Offer or Payment stage is entered', () => {
    permissions = [];
    const { unmount } = renderPanel();
    expect(mocks.read).toHaveBeenCalledWith('application-1', { skip: true });
    expect(screen.queryByRole('region', { name: 'Fee structure' })).not.toBeInTheDocument();
    unmount();
    permissions = [{ name: 'Students.Admissions.Applications.View', isGranted: true }];
    setRead({ ...base, available: false, canEdit: false });
    renderPanel();
    expect(screen.queryByText('Fee structure')).not.toBeInTheDocument();
  });
  it('shows a local loading state and retries errors', () => {
    setRead(undefined, { isLoading: true });
    const { unmount } = renderPanel();
    expect(screen.getByLabelText('Loading fee structure')).toBeInTheDocument();
    unmount();
    setRead(undefined, { isError: true });
    renderPanel();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(mocks.refetch).toHaveBeenCalledOnce();
  });
  it('loads published candidates only when the editor is opened and explains missing setup', () => {
    mocks.candidates.mockReturnValue({
      currentData: [],
      isLoading: false,
      isFetching: false,
      isError: false,
    });
    renderPanel();
    expect(mocks.candidates).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Select fee structure' }));
    expect(mocks.candidates).toHaveBeenCalledWith('application-1', {
      refetchOnMountOrArgChange: true,
    });
    expect(screen.getByText(/No published fee structure matches/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save fee structure' })).toBeDisabled();
  });
  it('saves selected optional heads with the application concurrency token and preserves errors for retry', async () => {
    mocks.unwrap.mockRejectedValue({
      data: { detail: 'The application changed. Reload before saving.' },
    });
    renderPanel();
    fireEvent.click(screen.getByRole('button', { name: 'Select fee structure' }));
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Fee structure *' }));
    fireEvent.click(screen.getByRole('option', { name: 'Class one fees · Revision 2' }));
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Optional fee heads' }));
    fireEvent.click(screen.getByRole('option', { name: /Transport/ }));
    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Escape' });
    fireEvent.click(screen.getByRole('button', { name: 'Save fee structure' }));
    await waitFor(() =>
      expect(mocks.save).toHaveBeenCalledWith({
        applicationId: 'application-1',
        concurrencyStamp: 'stamp-1',
        structureId: 'structure-1',
        optionalHeadIds: ['bus'],
      })
    );
    expect(
      await screen.findByText('The application changed. Reload before saving.')
    ).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Fee structure *' })).toHaveTextContent(
      'Class one fees'
    );
    mocks.unwrap.mockResolvedValue(selected);
    fireEvent.click(screen.getByRole('button', { name: 'Save fee structure' }));
    await waitFor(() =>
      expect(screen.queryByRole('button', { name: 'Save fee structure' })).not.toBeInTheDocument()
    );
  });
  it('keeps paid and subsequent-stage selections read only with their saved revision', () => {
    setRead({ ...selected, canEdit: false, isLocked: true, currentStageId: 'payment' });
    renderPanel();
    expect(screen.getByText('Class one fees · Revision 2')).toBeInTheDocument();
    expect(screen.getByText(/Payment has been recorded/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Change fee structure' })).not.toBeInTheDocument();
    expect(mocks.candidates).not.toHaveBeenCalled();
  });
  it('shows server confirmation blockers and does not expose an unauthorized confirmation', () => {
    setRead({
      ...selected,
      canConfirmOnboarding: false,
      onboardingConfirmed: true,
      onboardingBlocker: 'Finance assignment uses another structure.',
    });
    renderPanel({ mode: 'onboarding', canConfirm: false });
    expect(screen.getByText('Finance assignment uses another structure.')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Confirm admission fee selection' })
    ).not.toBeInTheDocument();
  });
  it('confirms the saved application choice in Onboarding without saving or changing fees', async () => {
    setRead({ ...selected, canEdit: false, canConfirmOnboarding: true });
    renderPanel({ mode: 'onboarding' });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm admission fee selection' }));
    await waitFor(() =>
      expect(mocks.confirm).toHaveBeenCalledWith({
        applicationId: 'application-1',
        concurrencyStamp: 'stamp-1',
      })
    );
    expect(mocks.save).not.toHaveBeenCalled();
    expect(mocks.candidates).not.toHaveBeenCalled();
  });
  it('requires application manage permission even when the backend reports an editable stage', () => {
    permissions = [{ name: 'Students.Admissions.Applicants.View', isGranted: true }];
    renderPanel();
    expect(screen.queryByRole('button', { name: 'Select fee structure' })).not.toBeInTheDocument();
  });
  it('disables saving while candidates load and lets staff retry failed candidate reads', () => {
    mocks.candidates.mockReturnValue({ isLoading: true, isFetching: true });
    const { unmount } = renderPanel();
    fireEvent.click(screen.getByRole('button', { name: 'Select fee structure' }));
    expect(screen.getByRole('button', { name: 'Save fee structure' })).toBeDisabled();
    unmount();
    mocks.candidates.mockReturnValue({ isError: true, refetch: mocks.refetch });
    renderPanel();
    fireEvent.click(screen.getByRole('button', { name: 'Select fee structure' }));
    expect(screen.getByText('Published fee structures could not be loaded.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(mocks.refetch).toHaveBeenCalledOnce();
  });
  it('guards cancellation and signals unsaved application navigation after a selection changes', async () => {
    const onEditorStateChange = vi.fn();
    renderPanel({ onEditorStateChange });
    fireEvent.click(screen.getByRole('button', { name: 'Select fee structure' }));
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Fee structure *' }));
    fireEvent.click(screen.getByRole('option', { name: 'Class one fees · Revision 2' }));
    await waitFor(() =>
      expect(mocks.dispatch).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'confirmPopup/setIsChanges', payload: true })
      )
    );
    expect(onEditorStateChange).toHaveBeenLastCalledWith({ dirty: true, busy: false });
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(
      await screen.findByRole('dialog', { name: 'Discard unsaved changes?' })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
    expect(screen.queryByRole('combobox', { name: 'Fee structure *' })).not.toBeInTheDocument();
    expect(mocks.save).not.toHaveBeenCalled();
    expect(onEditorStateChange).toHaveBeenLastCalledWith({ dirty: false, busy: false });
  });
  it('requires at least one head for a structure containing only optional heads', async () => {
    mocks.candidates.mockReturnValue({
      currentData: [{ ...candidate, heads: [candidate.heads[1]] }],
      isLoading: false,
      isFetching: false,
    });
    renderPanel();
    fireEvent.click(screen.getByRole('button', { name: 'Select fee structure' }));
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Fee structure *' }));
    fireEvent.click(screen.getByRole('option', { name: 'Class one fees · Revision 2' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save fee structure' }));
    expect(
      await screen.findByText(
        'Select at least one optional fee head. This structure has no mandatory heads.'
      )
    ).toBeInTheDocument();
    expect(mocks.save).not.toHaveBeenCalled();
  });
  it('preserves unsaved choices when a background read fails and allows saving after retry', async () => {
    const { rerender } = renderPanel();
    fireEvent.click(screen.getByRole('button', { name: 'Select fee structure' }));
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Fee structure *' }));
    fireEvent.click(screen.getByRole('option', { name: 'Class one fees · Revision 2' }));
    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Optional fee heads' }));
    fireEvent.click(screen.getByRole('option', { name: /Transport/ }));
    fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Escape' });
    const refresh = () =>
      rerender(
        <ThemeProvider theme={createTheme(defaultSettings)}>
          <AdmissionFeeSelectionPanel applicationId="application-1" />
        </ThemeProvider>
      );
    setRead(base, { isError: true });
    refresh();
    expect(screen.getByText(/Your unsaved selection is preserved/)).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'Fee structure *' })).toHaveTextContent(
      'Class one fees'
    );
    expect(screen.getByRole('combobox', { name: 'Optional fee heads' })).toHaveTextContent(
      'Transport'
    );
    expect(screen.getByRole('button', { name: 'Save fee structure' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(mocks.refetch).toHaveBeenCalledOnce();
    setRead(base);
    refresh();
    fireEvent.click(screen.getByRole('button', { name: 'Save fee structure' }));
    await waitFor(() =>
      expect(mocks.save).toHaveBeenCalledWith({
        applicationId: 'application-1',
        concurrencyStamp: 'stamp-1',
        structureId: 'structure-1',
        optionalHeadIds: ['bus'],
      })
    );
  });
  it('preserves the saved plan and shows a retryable confirmation failure', async () => {
    mocks.confirmationUnwrap.mockRejectedValue({
      data: { detail: 'Finance assignment has changed. Review again.' },
    });
    setRead({ ...selected, canEdit: false, canConfirmOnboarding: true });
    renderPanel({ mode: 'onboarding' });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm admission fee selection' }));
    expect(
      await screen.findByText('Finance assignment has changed. Review again.')
    ).toBeInTheDocument();
    expect(screen.getByText('Class one fees · Revision 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Confirm admission fee selection' })).toBeEnabled();
  });
});
