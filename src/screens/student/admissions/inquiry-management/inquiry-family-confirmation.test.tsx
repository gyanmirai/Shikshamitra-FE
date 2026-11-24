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
  relationship: 'father' as const,
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
  await screen.findByRole('combobox', { name: /^Family/ });
}
async function selectFamily() {
  await choose('Family', /^Riya$/);
}
const otherMatch = {
  ...match,
  applicantId: 'other-child',
  familyId: 'other-family',
  applicantName: 'Anya',
  existingInquiryId: 'other-inquiry',
  parents: [{ ...parent, sourceApplicantId: 'other-child' }],
};
beforeEach(() => {
  vi.clearAllMocks();
  requests.lookup.mockReturnValue({ unwrap: async () => [match, otherMatch] });
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

it('opens Check Parent Details from a list selection and confirms the saved family', async () => {
  const onClose = vi.fn();
  const load = vi.fn(async () => ({
    inquiry: { ...inquiry, concurrencyStamp: 'current' },
    matches: [match],
  }));
  open({ duplicateInput: undefined, listReview: { load, onClose } });
  expect(await screen.findByRole('dialog', { name: 'Check Parent Details' })).toBeVisible();
  expect(await screen.findByText('Riya')).toBeVisible();
  expect(screen.getByText('Priya')).toBeVisible();
  expect(screen.getByText('Amit')).toBeVisible();
  expect(requests.lookup).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Add as Sibling' }));
  await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  expect(requests.confirm).toHaveBeenCalledWith({
    id: 'target',
    body: {
      existingFamilyId: 'family',
      existingParentApplicantId: 'source-child',
      familyLinkOnly: true,
      concurrencyStamp: 'current',
    },
  });
});

it('shows the same confirmed family from either inquiry without offering to add it again', async () => {
  const linked = { ...inquiry, familyId: 'family', hasLinkedSiblings: true };
  const first = open({
    inquiry: linked,
    listReview: { load: async () => ({ inquiry: linked, matches: [match] }), onClose: vi.fn() },
  });
  expect(await screen.findByText('Riya')).toBeVisible();
  expect(screen.getByText('Priya')).toBeVisible();
  expect(screen.getByText('Siblings linked')).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Add as Sibling' })).not.toBeInTheDocument();
  first.unmount();
  const other = { ...linked, id: 'source', applicantId: 'source-child', applicantName: 'Riya' };
  open({
    inquiry: other,
    listReview: {
      load: async () => ({
        inquiry: other,
        matches: [
          {
            ...match,
            applicantId: 'target-child',
            applicantName: 'Priya',
            existingInquiryId: 'target',
          },
        ],
      }),
      onClose: vi.fn(),
    },
  });
  expect(await screen.findByText('Priya')).toBeVisible();
  expect(screen.getByText('Riya')).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Add as Sibling' })).not.toBeInTheDocument();
  expect(requests.confirm).not.toHaveBeenCalled();
});

it('offers a read-only retry when the list review fails for an inquiry viewer', async () => {
  const onClose = vi.fn();
  const load = vi
    .fn<NonNullable<Props['listReview']>['load']>()
    .mockRejectedValueOnce({ data: { detail: 'The family review could not be loaded.' } })
    .mockResolvedValueOnce({ inquiry, matches: [match, otherMatch] });
  open({ readOnly: true, listReview: { load, onClose } });
  expect(await screen.findByRole('alert')).toHaveTextContent(
    'The family review could not be loaded.'
  );
  fireEvent.click(screen.getByRole('button', { name: 'Reload Matches' }));
  await screen.findByRole('combobox', { name: /^Family/ });
  await selectFamily();
  expect(await screen.findByText('Amit')).toBeVisible();
  expect(screen.getByRole('alert')).toHaveTextContent(
    'You do not have permission to confirm siblings.'
  );
  expect(screen.queryByRole('button', { name: 'Add as Sibling' })).not.toBeInTheDocument();
  expect(load).toHaveBeenCalledTimes(2);
  expect(requests.confirm).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: /^Close$/ }));
  await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
});

it('loads candidates only after explicit open and requires an explicit choice between distinct families', async () => {
  open();
  expect(requests.lookup).not.toHaveBeenCalled();
  await launch();
  expect(requests.lookup).toHaveBeenCalledOnce();
  expect(screen.queryByRole('combobox', { name: /Existing Child/ })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Confirm siblings' })).toBeDisabled();
  expect(requests.confirm).not.toHaveBeenCalled();
  await selectFamily();
  expect(screen.getAllByRole('dialog')).toHaveLength(1);
  expect(
    screen.queryByRole('button', { name: /copy|use saved|review parent/i })
  ).not.toBeInTheDocument();
  expect(screen.queryByText(/Amit|Meera|saved parent|Relationship/)).not.toBeInTheDocument();
  expect(screen.getByRole('list', { name: 'Children in this family' })).toHaveTextContent('Riya');
  expect(screen.getByRole('list', { name: 'Children in this family' })).toHaveTextContent('INQ-A');
  fireEvent.click(screen.getByRole('button', { name: 'Confirm siblings' }));
  await waitFor(() => expect(requests.saved).toHaveBeenCalledOnce());
  expect(requests.confirm).toHaveBeenCalledWith({
    id: 'target',
    body: {
      existingFamilyId: 'family',
      existingParentApplicantId: 'source-child',
      familyLinkOnly: true,
      concurrencyStamp: 'stamp',
    },
  });
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

it('auto-selects one saved family and confirms without parent details or a relationship choice', async () => {
  requests.lookup.mockReturnValue({
    unwrap: async () => [
      {
        ...match,
        applicantName: 'Riya Meera Shah',
        guardianPhone: inquiry.normalizedPhone,
        matchByEmail: true,
        parents: [],
      },
    ],
  });
  open();
  fireEvent.click(screen.getByRole('button', { name: 'Confirm Siblings' }));
  const children = await screen.findByRole('list', { name: 'Children in this family' });
  expect(children).toHaveTextContent('Riya Meera Shah');
  expect(
    screen.getByText(
      'We found a possible sibling. The parent mobile number and email address match. Confirm both children belong to the same family.'
    )
  ).toBeVisible();
  expect(screen.queryByText('Priya', { exact: true })).toBeNull();
  expect(screen.queryByText('Link with')).toBeNull();
  expect(screen.queryByRole('combobox')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Confirm siblings' })).toBeEnabled();
  expect(requests.confirm).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Confirm siblings' }));
  await waitFor(() =>
    expect(requests.confirm).toHaveBeenCalledWith(
      expect.objectContaining({
        body: {
          existingFamilyId: 'family',
          existingParentApplicantId: 'source-child',
          familyLinkOnly: true,
          concurrencyStamp: 'stamp',
        },
      })
    )
  );
});

it('treats self-only and unavailable-family results as no matches and retries only explicitly', async () => {
  requests.lookup.mockReturnValue({
    unwrap: async () => [
      { ...match, applicantId: 'target-child' },
      { ...match, canLinkFamily: false },
    ],
  });
  open();
  fireEvent.click(screen.getByRole('button', { name: 'Confirm Siblings' }));
  await screen.findByText(/No available family matches/);
  expect(requests.confirm).not.toHaveBeenCalled();
  expect(requests.lookup).toHaveBeenCalledOnce();
  requests.lookup.mockReturnValue({ unwrap: async () => [match, otherMatch] });
  fireEvent.click(screen.getByRole('button', { name: 'Reload Matches' }));
  await screen.findByRole('combobox', { name: /^Family/ });
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
  fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
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
  await selectFamily();
  fireEvent.click(screen.getByRole('button', { name: 'Confirm siblings' }));
  await screen.findByText('The saved parent changed. Reload matches.');
  expect(screen.getByRole('combobox', { name: /^Family/ })).toHaveTextContent('Riya');
  expect(requests.saved).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Reload Matches' }));
  await waitFor(() =>
    expect(screen.getByRole('combobox', { name: /^Family/ })).not.toHaveTextContent('Riya')
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
  await selectFamily();
  fireEvent.click(screen.getByRole('button', { name: 'Confirm siblings' }));
  await waitFor(() => expect(requests.confirm).toHaveBeenCalledOnce());
  expect(screen.getByRole('button', { name: 'Confirm siblings' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'close' })).toBeDisabled();
  expect(screen.getByRole('combobox', { name: /^Family/ })).toHaveAttribute(
    'aria-disabled',
    'true'
  );
  fireEvent.click(screen.getByRole('button', { name: 'Confirm siblings' }));
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
it.each(['Cancel', 'close', 'Escape'])(
  'uses the shared discard guard for dirty %s without a browser prompt',
  async (action) => {
    open();
    await launch();
    await selectFamily();
    if (action === 'Escape')
      fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape', code: 'Escape' });
    else fireEvent.click(screen.getByRole('button', { name: action }));
    await screen.findByRole('dialog', { name: 'Discard Unsaved Changes?' });
    expect(window.confirm).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
    await waitFor(() =>
      expect(screen.getByRole('combobox', { name: /^Family/ })).toHaveTextContent('Riya')
    );
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Discard changes' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(requests.busy).toHaveBeenLastCalledWith(false);
    expect(requests.saved).not.toHaveBeenCalled();
    expect(requests.confirm).not.toHaveBeenCalled();
  }
);
it.each([{ hasLinkedSiblings: true }, { siblingFamilyConfirmed: true }])(
  'shows persisted linked status without a lookup or repeat action: %j',
  (linked) => {
    open({ inquiry: { ...inquiry, ...linked } });
    expect(screen.getByText('Siblings linked')).toBeVisible();
    expect(requests.lookup).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'Confirm Siblings' })).not.toBeInTheDocument();
  }
);
it('blocks a stale target stamp until an explicit reload rather than sending the old proof', async () => {
  const rendered = open();
  await launch();
  await selectFamily();
  rendered.rerenderProps({ inquiry: { ...inquiry, concurrencyStamp: 'newer' } });
  expect(screen.getByRole('button', { name: 'Confirm siblings' })).toBeDisabled();
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
  await selectFamily();
  expect(requests.refresh).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole('button', { name: 'Confirm siblings' }));
  await screen.findByText('This inquiry changed.');
  fireEvent.click(screen.getByRole('button', { name: 'Reload Matches' }));
  await waitFor(() => expect(requests.refresh).toHaveBeenCalledWith('target', false));
  await waitFor(() => expect(requests.lookup).toHaveBeenCalledTimes(2));
  expect(requests.refreshed).toHaveBeenCalledWith(
    expect.objectContaining({ concurrencyStamp: 'server-B' })
  );
  expect(requests.saved).not.toHaveBeenCalled();
  expect(screen.getByRole('combobox', { name: /^Family/ })).not.toHaveTextContent('Riya');
  await selectFamily();
  fireEvent.click(screen.getByRole('button', { name: 'Confirm siblings' }));
  await waitFor(() => expect(requests.saved).toHaveBeenCalledOnce());
  expect(requests.confirm.mock.calls[1][0].body.concurrencyStamp).toBe('server-B');
});

it('preserves the selection and blocks another POST when explicit target refresh fails', async () => {
  const review = open();
  await launch();
  await selectFamily();
  requests.refresh.mockReturnValue({
    unwrap: async () => {
      throw Object.assign(new Error('Forbidden'), { data: { detail: 'Target is unavailable.' } });
    },
  });
  review.rerenderProps({ inquiry: { ...inquiry, concurrencyStamp: 'newer' } });
  fireEvent.click(screen.getByRole('button', { name: 'Reload Matches' }));
  await screen.findByText('Target is unavailable.');
  expect(screen.getByRole('combobox', { name: /^Family/ })).toHaveTextContent('Riya');
  expect(screen.getByRole('button', { name: 'Confirm siblings' })).toBeDisabled();
  expect(requests.confirm).not.toHaveBeenCalled();
  expect(requests.refreshed).not.toHaveBeenCalled();
});

it('does not reload sources or confirm when the refreshed target has already started an application', async () => {
  const review = open();
  await launch();
  await selectFamily();
  requests.refresh.mockReturnValue({
    unwrap: async () => ({ ...inquiry, concurrencyStamp: 'server-B', applicationId: 'app' }),
  });
  review.rerenderProps({ inquiry: { ...inquiry, concurrencyStamp: 'newer' } });
  fireEvent.click(screen.getByRole('button', { name: 'Reload Matches' }));
  await waitFor(() => expect(requests.refresh).toHaveBeenCalledOnce());
  await screen.findByText('Only an editable pending inquiry can be confirmed as a sibling.');
  expect(screen.getByRole('button', { name: 'Confirm siblings' })).toBeDisabled();
  expect(requests.lookup).toHaveBeenCalledOnce();
  expect(requests.confirm).not.toHaveBeenCalled();
});

it('retains selected source details but blocks confirmation when the source reload fails after a fresh target read', async () => {
  const review = open();
  await launch();
  await selectFamily();
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
  expect(screen.getByRole('combobox', { name: /^Family/ })).toHaveTextContent('Riya');
  expect(screen.getByRole('button', { name: 'Confirm siblings' })).toBeDisabled();
  expect(requests.saved).not.toHaveBeenCalled();
});

it('does not apply refreshed data to a parent draft that became dirty while the target GET was pending', async () => {
  let finish!: (value: AdmissionInquiry) => void;
  const rendered = open();
  await launch();
  await selectFamily();
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
    expect(screen.getByRole('combobox', { name: /^Family/ })).toHaveTextContent('Riya')
  );
  expect(requests.refreshed).not.toHaveBeenCalled();
  expect(requests.lookup).toHaveBeenCalledOnce();
  expect(requests.confirm).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Confirm siblings' })).toBeDisabled();
});
