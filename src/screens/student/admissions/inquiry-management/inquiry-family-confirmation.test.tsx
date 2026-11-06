import type { ComponentProps } from 'react';
import type {
  DuplicateMatch,
  AdmissionInquiry,
} from 'src/redux/student/admissions/admission-inquiries-api';

import { it, vi, expect, beforeEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';

import { InquiryFamilyConfirmation } from './inquiry-family-confirmation';

const requests = vi.hoisted(() => ({
  lookup: vi.fn(),
  confirm: vi.fn(),
  saved: vi.fn(),
  busy: vi.fn(),
  dispatch: vi.fn(),
  refresh: vi.fn(),
  refreshed: vi.fn(),
}));
vi.mock('react-redux', () => ({
  useSelector: (selector: (state: unknown) => unknown) =>
    selector({ confirmPopup: { isChanges: true } }),
  useDispatch: () => requests.dispatch,
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden="true" /> }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { error: vi.fn(), success: vi.fn() },
}));
vi.mock('src/redux/student/admissions/admission-inquiries-api', () => ({
  useCheckAdmissionInquiryDuplicatesMutation: () => [requests.lookup, { isLoading: false }],
  useConfirmAdmissionInquiryFamilyMutation: () => [requests.confirm, { isLoading: false }],
  useLazyGetAdmissionInquiryQuery: () => [requests.refresh],
}));
const inquiry = {
  id: 'target',
  applicantId: 'target-child',
  applicantName: 'Priya',
  inquiryNumber: 'INQ-B',
  status: 0,
  concurrencyStamp: 'stamp',
  admissionCycleId: 'cycle',
  normalizedPhone: '9876543210',
} as AdmissionInquiry;
const parent = {
  sourceApplicantId: 'source-child',
  relationship: 'father',
  name: 'Amit',
  firstName: 'Amit',
};
const match = {
  applicantId: 'source-child',
  applicantName: 'Riya',
  existingInquiryId: 'source',
  existingInquiryNumber: 'INQ-A',
  familyId: 'family',
  canLinkFamily: true,
  parents: [parent, { ...parent, relationship: 'mother', name: 'Meera' }],
} as DuplicateMatch;
type Props = ComponentProps<typeof InquiryFamilyConfirmation>;
function open(overrides: Partial<Props> = {}) {
  const props: Props = {
    inquiry,
    readOnly: false,
    dirty: false,
    busy: false,
    duplicateInput: {
      admissionCycleId: 'cycle',
      guardianPhone: '9876543210',
      applicantName: 'Priya',
    },
    onConfirmed: requests.saved,
    onBusyChange: requests.busy,
    onTargetRefreshed: requests.refreshed,
    ...overrides,
  };
  const content = (next: Props) => (
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <InquiryFamilyConfirmation {...next} />
    </ThemeProvider>
  );
  const rendered = render(content(props));
  return {
    ...rendered,
    rerenderProps: (next: Partial<Props>) => rendered.rerender(content({ ...props, ...next })),
  };
}
async function choose(label: string, name: RegExp) {
  fireEvent.mouseDown(screen.getByRole('combobox', { name: new RegExp(label) }));
  fireEvent.click(await screen.findByRole('option', { name }));
}
async function launch() {
  fireEvent.click(screen.getByRole('button', { name: 'Confirm Siblings' }));
  await screen.findByText('Review the saved parent details before continuing.');
}
async function selectSavedParent() {
  await choose('Parent', /Father.*Amit/);
}
beforeEach(() => {
  vi.clearAllMocks();
  requests.lookup.mockReturnValue({ unwrap: async () => [match] });
  requests.refresh.mockReturnValue({ unwrap: async () => inquiry });
  requests.refreshed.mockImplementation((target: AdmissionInquiry) => ({
    admissionCycleId: target.admissionCycleId,
    guardianPhone: target.normalizedPhone,
    applicantName: target.applicantName,
  }));
  requests.confirm.mockReturnValue({
    unwrap: async () => ({ ...inquiry, siblingFamilyConfirmed: true, concurrencyStamp: 'saved' }),
  });
  vi.stubGlobal(
    'confirm',
    vi.fn(() => true)
  );
});

it('loads candidates only after explicit open and requires the exact saved parent while keeping children read-only', async () => {
  open();
  expect(requests.lookup).not.toHaveBeenCalled();
  await launch();
  expect(requests.lookup).toHaveBeenCalledOnce();
  expect(screen.queryByRole('combobox', { name: /Existing Child/ })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Add as Sibling' })).toBeDisabled();
  expect(requests.confirm).not.toHaveBeenCalled();
  await selectSavedParent();
  expect(screen.getAllByRole('dialog')).toHaveLength(1);
  expect(
    screen.queryByRole('button', { name: /copy|use saved|review parent/i })
  ).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Add as Sibling' }));
  await waitFor(() => expect(requests.saved).toHaveBeenCalledOnce());
  expect(requests.confirm).toHaveBeenCalledWith({
    id: 'target',
    body: {
      existingFamilyId: 'family',
      existingParentApplicantId: 'source-child',
      parentRelationship: 'father',
      concurrencyStamp: 'stamp',
    },
  });
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

it('requires an explicit Father or Mother for a legacy saved parent and never infers the role', async () => {
  requests.lookup.mockReturnValue({
    unwrap: async () => [{ ...match, parents: [{ ...parent, relationship: null }] }],
  });
  open();
  await launch();

  expect(screen.getByRole('button', { name: 'Add as Sibling' })).toBeDisabled();
  expect(requests.confirm).not.toHaveBeenCalled();
  await choose('Relationship to Student', /^Mother$/);
  fireEvent.click(screen.getByRole('button', { name: 'Add as Sibling' }));
  await waitFor(() =>
    expect(requests.confirm).toHaveBeenCalledWith(
      expect.objectContaining({ body: expect.objectContaining({ parentRelationship: 'mother' }) })
    )
  );
});

it('treats self-only, invalid and unavailable-parent results as no matches and retries only explicitly', async () => {
  requests.lookup.mockReturnValue({
    unwrap: async () => [
      { ...match, applicantId: 'target-child' },
      { ...match, parents: [] },
    ],
  });
  open();
  fireEvent.click(screen.getByRole('button', { name: 'Confirm Siblings' }));
  await screen.findByText(/No available family matches/);
  expect(requests.confirm).not.toHaveBeenCalled();
  expect(requests.lookup).toHaveBeenCalledOnce();
  requests.lookup.mockReturnValue({ unwrap: async () => [match] });
  fireEvent.click(screen.getByRole('button', { name: 'Reload Matches' }));
  await screen.findByRole('combobox', { name: /^Parent/ });
  expect(requests.lookup).toHaveBeenCalledTimes(2);
});

it('reports lookup errors without blocking normal entry and keeps the explicit retry available', async () => {
  requests.lookup.mockReturnValue({
    unwrap: async () => {
      throw Object.assign(new Error('Matches are unavailable.'), {
        data: { detail: 'Matches are unavailable.' },
      });
    },
  });
  open();
  fireEvent.click(screen.getByRole('button', { name: 'Confirm Siblings' }));
  await screen.findByText('Matches are unavailable.');
  fireEvent.click(screen.getByRole('button', { name: 'Reload Matches' }));
  await waitFor(() => expect(requests.lookup).toHaveBeenCalledTimes(2));
  fireEvent.click(screen.getByRole('button', { name: 'Edit Contact Details' }));
  expect(requests.busy).toHaveBeenLastCalledWith(false);
  expect(screen.getByRole('button', { name: 'Confirm Siblings' })).toBeEnabled();
});

it('retains the chosen source and parent on a failed confirmation and reload clears stale selections', async () => {
  requests.confirm.mockReturnValue({
    unwrap: async () => {
      throw Object.assign(new Error('The saved parent changed.'), {
        data: { detail: 'The saved parent changed. Reload matches.' },
      });
    },
  });
  open();
  await launch();
  await selectSavedParent();
  fireEvent.click(screen.getByRole('button', { name: 'Add as Sibling' }));
  await screen.findByText('The saved parent changed. Reload matches.');
  expect(screen.getByRole('combobox', { name: /^Parent/ })).toHaveTextContent('Amit');
  expect(requests.saved).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Reload Matches' }));
  await waitFor(() =>
    expect(screen.getByRole('combobox', { name: /^Parent/ })).not.toHaveTextContent('Amit')
  );
});

it('locks every submit/close/control while saving and ignores duplicate confirmation clicks', async () => {
  let finish!: (value: unknown) => void;
  requests.confirm.mockReturnValue({
    unwrap: () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  });
  open();
  await launch();
  await selectSavedParent();
  fireEvent.click(screen.getByRole('button', { name: 'Add as Sibling' }));
  await waitFor(() => expect(requests.confirm).toHaveBeenCalledOnce());
  expect(screen.getByRole('button', { name: 'Add as Sibling' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Edit Contact Details' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'close' })).toBeDisabled();
  expect(screen.getByRole('combobox', { name: /^Parent/ })).toHaveAttribute(
    'aria-disabled',
    'true'
  );
  fireEvent.click(screen.getByRole('button', { name: 'Add as Sibling' }));
  expect(requests.confirm).toHaveBeenCalledOnce();
  await act(async () => finish({ ...inquiry, siblingFamilyConfirmed: true }));
  await waitFor(() => expect(requests.saved).toHaveBeenCalledOnce());
});

it.each([{ dirty: true }, { busy: true }])(
  'disables entry without querying or changing an unsafe parent draft: %j',
  (override) => {
    open(override);
    expect(screen.getByRole('button', { name: 'Confirm Siblings' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm Siblings' }));
    expect(requests.lookup).not.toHaveBeenCalled();
    expect(requests.saved).not.toHaveBeenCalled();
  }
);
it.each([
  { readOnly: true },
  { inquiry: { ...inquiry, applicationId: 'app' } },
  { inquiry: { ...inquiry, isDuplicate: true } },
  { inquiry: { ...inquiry, status: 2 as const } },
])('hides confirmation for readonly and nonpending inquiries %j', (override) => {
  open(override);
  expect(screen.queryByRole('button', { name: 'Confirm Siblings' })).not.toBeInTheDocument();
  expect(requests.lookup).not.toHaveBeenCalled();
});
it.each(['Edit Contact Details', 'close', 'Escape'])(
  'uses the shared discard guard for dirty %s without a browser prompt',
  async (action) => {
    open();
    await launch();
    await selectSavedParent();
    if (action === 'Escape')
      fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape', code: 'Escape' });
    else fireEvent.click(screen.getByRole('button', { name: action }));
    await screen.findByRole('dialog', { name: 'Discard Unsaved Changes?' });
    expect(window.confirm).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
    await waitFor(() =>
      expect(screen.getByRole('combobox', { name: /^Parent/ })).toHaveTextContent('Amit')
    );
    fireEvent.click(screen.getByRole('button', { name: 'Edit Contact Details' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Discard changes' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(requests.busy).toHaveBeenLastCalledWith(false);
    expect(requests.saved).not.toHaveBeenCalled();
    expect(requests.confirm).not.toHaveBeenCalled();
  }
);
it('shows a persisted confirmed badge without a lookup or additional action', () => {
  open({ inquiry: { ...inquiry, siblingFamilyConfirmed: true } });
  expect(screen.getByText('Sibling Confirmed')).toBeVisible();
  expect(requests.lookup).not.toHaveBeenCalled();
  expect(screen.queryByRole('button', { name: 'Confirm Siblings' })).not.toBeInTheDocument();
});
it('blocks a stale target stamp until an explicit reload rather than sending the old proof', async () => {
  const rendered = open();
  await launch();
  await selectSavedParent();
  rendered.rerenderProps({ inquiry: { ...inquiry, concurrencyStamp: 'newer' } });
  expect(screen.getByRole('button', { name: 'Add as Sibling' })).toBeDisabled();
  expect(screen.getByText(/This inquiry changed/)).toBeVisible();
  expect(requests.confirm).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Reload Matches' }));
  await waitFor(() => expect(requests.lookup).toHaveBeenCalledTimes(2));
});

it('recovers a rejected server stamp by explicitly GETting the target before reloading and reselecting, without new props', async () => {
  requests.confirm.mockReturnValueOnce({
    unwrap: async () => {
      throw Object.assign(new Error('Conflict'), { data: { detail: 'This inquiry changed.' } });
    },
  });
  requests.refresh.mockReturnValue({
    unwrap: async () => ({ ...inquiry, concurrencyStamp: 'server-B' }),
  });
  open();
  await launch();
  await selectSavedParent();
  expect(requests.refresh).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Add as Sibling' }));
  await screen.findByText('This inquiry changed.');
  fireEvent.click(screen.getByRole('button', { name: 'Reload Matches' }));
  await waitFor(() => expect(requests.refresh).toHaveBeenCalledWith('target', false));
  await waitFor(() => expect(requests.lookup).toHaveBeenCalledTimes(2));
  expect(requests.refreshed).toHaveBeenCalledWith(
    expect.objectContaining({ concurrencyStamp: 'server-B' })
  );
  expect(requests.saved).not.toHaveBeenCalled();
  expect(screen.getByRole('combobox', { name: /^Parent/ })).not.toHaveTextContent('Amit');
  await selectSavedParent();
  fireEvent.click(screen.getByRole('button', { name: 'Add as Sibling' }));
  await waitFor(() => expect(requests.saved).toHaveBeenCalledOnce());
  expect(requests.confirm.mock.calls[1][0].body.concurrencyStamp).toBe('server-B');
});

it('preserves the selection and blocks another POST when explicit target refresh fails', async () => {
  const review = open();
  await launch();
  await selectSavedParent();
  requests.refresh.mockReturnValue({
    unwrap: async () => {
      throw Object.assign(new Error('Forbidden'), { data: { detail: 'Target is unavailable.' } });
    },
  });
  review.rerenderProps({ inquiry: { ...inquiry, concurrencyStamp: 'newer' } });
  fireEvent.click(screen.getByRole('button', { name: 'Reload Matches' }));
  await screen.findByText('Target is unavailable.');
  expect(screen.getByRole('combobox', { name: /^Parent/ })).toHaveTextContent('Amit');
  expect(screen.getByRole('button', { name: 'Add as Sibling' })).toBeDisabled();
  expect(requests.confirm).not.toHaveBeenCalled();
  expect(requests.refreshed).not.toHaveBeenCalled();
});

it('does not reload sources or confirm when the refreshed target has already started an application', async () => {
  const review = open();
  await launch();
  await selectSavedParent();
  requests.refresh.mockReturnValue({
    unwrap: async () => ({ ...inquiry, concurrencyStamp: 'server-B', applicationId: 'app' }),
  });
  review.rerenderProps({ inquiry: { ...inquiry, concurrencyStamp: 'newer' } });
  fireEvent.click(screen.getByRole('button', { name: 'Reload Matches' }));
  await waitFor(() => expect(requests.refresh).toHaveBeenCalledOnce());
  await screen.findByText('Only an editable pending inquiry can be confirmed as a sibling.');
  expect(screen.getByRole('button', { name: 'Add as Sibling' })).toBeDisabled();
  expect(requests.lookup).toHaveBeenCalledOnce();
  expect(requests.confirm).not.toHaveBeenCalled();
});

it('retains selected source details but blocks confirmation when the source reload fails after a fresh target read', async () => {
  const review = open();
  await launch();
  await selectSavedParent();
  requests.lookup.mockReturnValue({
    unwrap: async () => {
      throw Object.assign(new Error('Source unavailable'), {
        data: { detail: 'Family source is unavailable.' },
      });
    },
  });
  review.rerenderProps({ inquiry: { ...inquiry, concurrencyStamp: 'newer' } });
  fireEvent.click(screen.getByRole('button', { name: 'Reload Matches' }));
  await screen.findByText('Family source is unavailable.');
  expect(screen.getByRole('combobox', { name: /^Parent/ })).toHaveTextContent('Amit');
  expect(screen.getByRole('button', { name: 'Add as Sibling' })).toBeDisabled();
  expect(requests.saved).not.toHaveBeenCalled();
});

it('does not apply refreshed data to a parent draft that became dirty while the target GET was pending', async () => {
  let finish!: (value: AdmissionInquiry) => void;
  const rendered = open();
  await launch();
  await selectSavedParent();
  requests.refresh.mockReturnValue({
    unwrap: () =>
      new Promise<AdmissionInquiry>((resolve) => {
        finish = resolve;
      }),
  });
  rendered.rerenderProps({ inquiry: { ...inquiry, concurrencyStamp: 'newer' } });
  fireEvent.click(screen.getByRole('button', { name: 'Reload Matches' }));
  rendered.rerenderProps({ dirty: true });
  await act(async () => finish({ ...inquiry, concurrencyStamp: 'server-B' }));
  await waitFor(() =>
    expect(screen.getByRole('combobox', { name: /^Parent/ })).toHaveTextContent('Amit')
  );
  expect(requests.refreshed).not.toHaveBeenCalled();
  expect(requests.lookup).toHaveBeenCalledOnce();
  expect(requests.confirm).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Add as Sibling' })).toBeDisabled();
});
