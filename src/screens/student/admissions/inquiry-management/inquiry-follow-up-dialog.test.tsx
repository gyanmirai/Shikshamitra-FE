import type { AdmissionInquiry } from 'src/redux/student/admissions/admission-inquiries-api';
import type { AdmissionInquiryManagement } from 'src/redux/student/admissions/admission-inquiry-management-api';

import dayjs from 'dayjs';
import { it, vi, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { InquiryFollowUpDialog } from './inquiry-follow-up-dialog';

type QueryState<T> = {
  currentData?: T;
  isFetching: boolean;
  isError: boolean;
  fulfilledTimeStamp?: number;
  refetch: () => void;
};
const mocks = vi.hoisted(() => ({
  record: vi.fn(),
  move: vi.fn(),
  close: vi.fn(),
  error: vi.fn(),
  refetch: vi.fn(),
  detail: {} as QueryState<AdmissionInquiry>,
  management: {} as QueryState<AdmissionInquiryManagement>,
  permissions: [{ name: 'Students.Admissions.Inquiries.Add', isGranted: true }],
  shell: vi.fn(),
}));
vi.mock('react-redux', () => ({
  useSelector: (selector: (state: unknown) => unknown) =>
    selector({ auth: { permissions: mocks.permissions, user: { sub: 'counsellor-1' } } }),
}));
vi.mock('src/redux/student/admissions/admission-inquiries-api', () => ({
  useGetAdmissionInquiryQuery: () => mocks.detail,
}));
vi.mock('src/redux/student/admissions/admission-inquiry-management-api', () => ({
  useGetAdmissionInquiryManagementQuery: () => mocks.management,
  useRecordAdmissionInquiryFollowUpNoteMutation: () => [mocks.record, { isLoading: false }],
}));
vi.mock('src/redux/student/admissions/admission-applications-api', () => ({
  useStartAdmissionApplicationMutation: () => [mocks.move, { isLoading: false }],
}));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: mocks.error },
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
vi.mock('src/components/customDialog', () => ({
  default: ({ title, children, handleClose, disableClose, guardUnsavedChanges }: any) => {
    mocks.shell({ guardUnsavedChanges });
    return (
      <div role="dialog" aria-label={title}>
        <button type="button" aria-label="close" disabled={disableClose} onClick={handleClose}>
          Close
        </button>
        {children}
      </div>
    );
  },
  DialogScrollContent: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('src/components/custom-select', () => ({
  default: ({ label, name, value, options, onChange, disabled }: any) => (
    <label htmlFor={`test-${name}`}>
      {label}
      <select
        id={`test-${name}`}
        disabled={disabled}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option: any) => (
          <option value={option.value} key={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  ),
}));
vi.mock('@mui/x-date-pickers', () => ({
  DatePicker: ({ label, value, onChange, disabled, slotProps }: any) => (
    <div>
      <label htmlFor="test-reminder-date">{label}</label>
      <input
        id="test-reminder-date"
        type="date"
        disabled={disabled}
        value={value?.format('YYYY-MM-DD') ?? ''}
        onChange={(event) => onChange(event.target.value ? dayjs(event.target.value) : null)}
        onBlur={slotProps.textField.onBlur}
      />
      {slotProps.textField.helperText && <span>{slotProps.textField.helperText}</span>}
    </div>
  ),
}));

const inquiry = {
  id: 'inquiry-1',
  concurrencyStamp: 'inquiry-stamp',
  status: 0,
  assignedCounsellorId: 'counsellor-1',
  applicantName: 'Aanya Patel',
} as AdmissionInquiry;
const management = {
  inquiryId: inquiry.id,
  concurrencyStamp: 'management-stamp',
  isLocked: false,
  followUps: [],
  policy: { restrictActionsToAssignedCounsellor: true },
  notes: [
    {
      id: 'note-1',
      occurredAt: '2026-10-07T10:30:00Z',
      note: 'Parent asked about campus visit.',
      status: 0,
      reminderAt: '2026-10-10T00:00:00Z',
      authorName: 'Asha Shah',
    },
  ],
} as unknown as AdmissionInquiryManagement;
const future = dayjs().add(3, 'day').startOf('day');
const changeReminder = () =>
  fireEvent.change(screen.getByLabelText('Next reminder date'), {
    target: { value: future.format('YYYY-MM-DD') },
  });

beforeEach(() => {
  mocks.record.mockReset();
  mocks.close.mockReset();
  mocks.move.mockReset();
  mocks.error.mockReset();
  mocks.refetch.mockReset();
  mocks.shell.mockReset();
  mocks.permissions = [{ name: 'Students.Admissions.Inquiries.Add', isGranted: true }];
  mocks.detail = {
    currentData: inquiry,
    isFetching: false,
    isError: false,
    fulfilledTimeStamp: Date.now() + 60_000,
    refetch: mocks.refetch,
  };
  mocks.management = {
    currentData: management,
    isFetching: false,
    isError: false,
    fulfilledTimeStamp: Date.now() + 60_000,
    refetch: mocks.refetch,
  };
  mocks.record.mockReturnValue({ unwrap: () => Promise.resolve(management) });
});

it('shows notes and exactly three statuses, then saves one atomic Interested follow-up with distinct stamps', async () => {
  const user = userEvent.setup();
  render(<InquiryFollowUpDialog inquiry={inquiry} onClose={mocks.close} />);
  expect(screen.getByText('Parent asked about campus visit.')).toBeVisible();
  expect(screen.getByText('Asha Shah')).toBeVisible();
  expect(screen.getAllByRole('option').map((item) => item.textContent)).toEqual([
    'Pending',
    'Interested',
    'Not interested',
  ]);
  expect(screen.queryByRole('button', { name: /Move/i })).not.toBeInTheDocument();
  await user.type(screen.getByRole('textbox', { name: 'Notes' }), '  Parent wants to proceed  ');
  changeReminder();
  fireEvent.change(screen.getByRole('combobox', { name: 'Status' }), { target: { value: '2' } });
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() =>
    expect(mocks.record).toHaveBeenCalledExactlyOnceWith({
      inquiryId: 'inquiry-1',
      concurrencyStamp: 'management-stamp',
      inquiryConcurrencyStamp: 'inquiry-stamp',
      note: 'Parent wants to proceed',
      status: 2,
      reminderAt: future.toISOString(),
    })
  );
  await waitFor(() => expect(mocks.close).toHaveBeenCalledOnce());
  expect(mocks.move).not.toHaveBeenCalled();
});

it('prefills the active reminder when the detail response has no queue projection', async () => {
  mocks.management.currentData = {
    ...management,
    followUps: [
      { id: 'cancelled', status: 2, scheduledAt: dayjs().add(1, 'day').toISOString() },
      { id: 'active', status: 0, scheduledAt: future.toISOString() },
    ] as AdmissionInquiryManagement['followUps'],
  };
  render(<InquiryFollowUpDialog inquiry={inquiry} onClose={mocks.close} />);
  await waitFor(() =>
    expect(screen.getByLabelText('Next reminder date')).toHaveValue(future.format('YYYY-MM-DD'))
  );
});

it('uses the offset-safe reminder projection ahead of legacy scheduled timestamps', async () => {
  mocks.management.currentData = {
    ...management,
    nextReminderAt: future.toISOString(),
    followUps: [
      { id: 'active', status: 0, scheduledAt: dayjs().subtract(1, 'day').toISOString() },
    ] as AdmissionInquiryManagement['followUps'],
  };
  render(<InquiryFollowUpDialog inquiry={inquiry} onClose={mocks.close} />);
  await waitFor(() =>
    expect(screen.getByLabelText('Next reminder date')).toHaveValue(future.format('YYYY-MM-DD'))
  );
});

it('waits for both opening GETs before using defaults and preserves edits on later refreshes', async () => {
  const user = userEvent.setup();
  const cachedStamp = Date.now() - 60_000;
  const freshStamp = Date.now() + 60_000;
  const cachedReminder = dayjs().add(2, 'day').startOf('day');
  const freshReminder = dayjs().add(5, 'day').startOf('day');
  const editedReminder = dayjs().add(7, 'day').startOf('day');
  mocks.detail = { ...mocks.detail, fulfilledTimeStamp: cachedStamp };
  mocks.management = {
    ...mocks.management,
    fulfilledTimeStamp: cachedStamp,
    currentData: { ...management, nextReminderAt: cachedReminder.toISOString() },
  };
  const view = render(<InquiryFollowUpDialog inquiry={inquiry} onClose={mocks.close} />);
  expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  expect(screen.getByLabelText('Next reminder date')).toHaveValue('');

  // Inquiry finishes first; the old management cache must not initialize the form.
  mocks.detail = {
    ...mocks.detail,
    fulfilledTimeStamp: freshStamp,
    currentData: { ...inquiry, status: 2 },
  };
  view.rerender(<InquiryFollowUpDialog inquiry={inquiry} onClose={mocks.close} />);
  expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  expect(screen.getByLabelText('Next reminder date')).toHaveValue('');

  mocks.management = {
    ...mocks.management,
    fulfilledTimeStamp: freshStamp,
    currentData: { ...management, nextReminderAt: freshReminder.toISOString() },
  };
  view.rerender(<InquiryFollowUpDialog inquiry={inquiry} onClose={mocks.close} />);
  await waitFor(() => expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled());
  expect(screen.getByRole('combobox', { name: 'Status' })).toHaveValue('2');
  expect(screen.getByLabelText('Next reminder date')).toHaveValue(
    freshReminder.format('YYYY-MM-DD')
  );
  expect(mocks.refetch).not.toHaveBeenCalled();

  await user.type(screen.getByRole('textbox', { name: 'Notes' }), 'Keep this draft after refresh');
  fireEvent.change(screen.getByLabelText('Next reminder date'), {
    target: { value: editedReminder.format('YYYY-MM-DD') },
  });
  mocks.detail = {
    ...mocks.detail,
    fulfilledTimeStamp: freshStamp + 1,
    currentData: { ...inquiry, status: 6 },
  };
  mocks.management = {
    ...mocks.management,
    fulfilledTimeStamp: freshStamp + 1,
    currentData: management,
  };
  view.rerender(<InquiryFollowUpDialog inquiry={inquiry} onClose={mocks.close} />);
  expect(screen.getByRole('textbox', { name: 'Notes' })).toHaveValue(
    'Keep this draft after refresh'
  );
  expect(screen.getByRole('combobox', { name: 'Status' })).toHaveValue('2');
  expect(screen.getByLabelText('Next reminder date')).toHaveValue(
    editedReminder.format('YYYY-MM-DD')
  );
});

it('blocks empty notes and requires a future reminder for Pending', async () => {
  const user = userEvent.setup();
  render(<InquiryFollowUpDialog inquiry={inquiry} onClose={mocks.close} />);
  expect(screen.getByRole('textbox', { name: 'Notes' }).closest('form')).toHaveAttribute(
    'novalidate'
  );
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  expect(await screen.findByText('Notes are required')).toBeVisible();
  expect(screen.getByText('Next reminder date is required')).toBeVisible();
  await user.type(screen.getByRole('textbox', { name: 'Notes' }), 'Call again');
  fireEvent.change(screen.getByLabelText('Next reminder date'), {
    target: { value: dayjs().format('YYYY-MM-DD') },
  });
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  expect(await screen.findByText('Choose a future reminder date')).toBeVisible();
  expect(mocks.record).not.toHaveBeenCalled();
});

it('saves Not interested without a reminder and clears any previously chosen date', async () => {
  const user = userEvent.setup();
  render(<InquiryFollowUpDialog inquiry={inquiry} onClose={mocks.close} />);
  await user.type(screen.getByRole('textbox', { name: 'Notes' }), 'Family chose another school');
  changeReminder();
  fireEvent.change(screen.getByRole('combobox', { name: 'Status' }), { target: { value: '6' } });
  expect(screen.getByLabelText('Next reminder date')).toBeDisabled();
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() =>
    expect(mocks.record).toHaveBeenCalledWith(
      expect.objectContaining({ status: 6, reminderAt: null })
    )
  );
});

it('preserves failed drafts and selected status across refetch while using fresh stamps on retry', async () => {
  const user = userEvent.setup();
  mocks.record.mockReturnValueOnce({
    unwrap: () =>
      Promise.reject(
        Object.assign(new Error('Inquiry changed'), {
          data: {
            error: {
              code: 'Admissions:Inquiry:ConcurrencyConflict',
              message: 'One or more business rules were violated.',
            },
          },
        })
      ),
  });
  const view = render(<InquiryFollowUpDialog inquiry={inquiry} onClose={mocks.close} />);
  await user.type(screen.getByRole('textbox', { name: 'Notes' }), 'Keep this parent note');
  changeReminder();
  fireEvent.change(screen.getByRole('combobox', { name: 'Status' }), { target: { value: '2' } });
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  expect(
    await screen.findByText('This inquiry changed. Reload its details and submit your note again.')
  ).toBeVisible();
  expect(mocks.close).not.toHaveBeenCalled();
  mocks.detail = {
    ...mocks.detail,
    currentData: { ...inquiry, concurrencyStamp: 'inquiry-new', status: 6 },
  };
  mocks.management = {
    ...mocks.management,
    currentData: { ...management, concurrencyStamp: 'management-new' },
  };
  view.rerender(<InquiryFollowUpDialog inquiry={inquiry} onClose={mocks.close} />);
  expect(screen.getByRole('textbox', { name: 'Notes' })).toHaveValue('Keep this parent note');
  expect(screen.getByRole('combobox', { name: 'Status' })).toHaveValue('2');
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() =>
    expect(mocks.record).toHaveBeenLastCalledWith(
      expect.objectContaining({
        inquiryConcurrencyStamp: 'inquiry-new',
        concurrencyStamp: 'management-new',
        note: 'Keep this parent note',
        status: 2,
      })
    )
  );
});

it('preserves the draft and shows a plain error for a failed network request', async () => {
  const user = userEvent.setup();
  mocks.record.mockReturnValueOnce({
    unwrap: () =>
      Promise.reject(
        Object.assign(new Error('Network error'), {
          status: 'FETCH_ERROR',
          error: 'TypeError: Failed to fetch',
        })
      ),
  });
  render(<InquiryFollowUpDialog inquiry={inquiry} onClose={mocks.close} />);
  await user.type(screen.getByRole('textbox', { name: 'Notes' }), 'Keep this note');
  changeReminder();
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() =>
    expect(mocks.error).toHaveBeenCalledWith({
      message: 'Unable to save the follow-up. Your draft is preserved; try again.',
    })
  );
  expect(screen.getByRole('textbox', { name: 'Notes' })).toHaveValue('Keep this note');
  expect(mocks.close).not.toHaveBeenCalled();
});

it('uses the shared discard dialog instead of native confirmation for unsaved notes', async () => {
  const user = userEvent.setup();
  render(<InquiryFollowUpDialog inquiry={inquiry} onClose={mocks.close} />);
  await user.type(screen.getByRole('textbox', { name: 'Notes' }), 'Draft note');
  await user.click(screen.getByRole('button', { name: /^Cancel$/ }));
  expect(screen.getByRole('dialog', { name: 'Discard unsaved changes?' })).toBeVisible();
  expect(mocks.shell).toHaveBeenLastCalledWith({ guardUnsavedChanges: false });
  expect(mocks.close).not.toHaveBeenCalled();
  await user.click(screen.getByRole('button', { name: 'Discard changes' }));
  expect(mocks.close).toHaveBeenCalledOnce();
});

it('locks inputs, cancel and close while the atomic save is pending', async () => {
  const user = userEvent.setup();
  let finish!: (value: AdmissionInquiryManagement) => void;
  mocks.record.mockReturnValue({
    unwrap: () =>
      new Promise<AdmissionInquiryManagement>((resolve) => {
        finish = resolve;
      }),
  });
  render(<InquiryFollowUpDialog inquiry={inquiry} onClose={mocks.close} />);
  await user.type(screen.getByRole('textbox', { name: 'Notes' }), 'No longer interested');
  fireEvent.change(screen.getByRole('combobox', { name: 'Status' }), { target: { value: '6' } });
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(mocks.record).toHaveBeenCalledOnce());
  expect(screen.getByRole('button', { name: /^Cancel$/ })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'close' })).toBeDisabled();
  expect(screen.getByRole('textbox', { name: 'Notes' })).toBeDisabled();
  finish(management);
  await waitFor(() => expect(mocks.close).toHaveBeenCalledOnce());
});

it('blocks submit while loading or when queries fail and provides retry', async () => {
  const user = userEvent.setup();
  mocks.detail = { ...mocks.detail, isFetching: true };
  const view = render(<InquiryFollowUpDialog inquiry={inquiry} onClose={mocks.close} />);
  expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  mocks.detail = { ...mocks.detail, isFetching: false, isError: true };
  view.rerender(<InquiryFollowUpDialog inquiry={inquiry} onClose={mocks.close} />);
  expect(screen.getByText('Follow-up notes could not be loaded.')).toBeVisible();
  await user.click(screen.getByRole('button', { name: 'Retry' }));
  expect(mocks.refetch).toHaveBeenCalledTimes(2);
  expect(mocks.record).not.toHaveBeenCalled();
});

it.each(['transferred', 'duplicate', 'permission', 'counsellor'])(
  'keeps %s inquiries read-only while showing history',
  (reason) => {
    if (reason === 'transferred') mocks.detail.currentData = { ...inquiry, isTransferred: true };
    if (reason === 'duplicate') mocks.detail.currentData = { ...inquiry, isDuplicate: true };
    if (reason === 'permission') mocks.permissions = [];
    if (reason === 'counsellor')
      mocks.detail.currentData = { ...inquiry, assignedCounsellorId: 'other-user' };
    render(<InquiryFollowUpDialog inquiry={inquiry} onClose={mocks.close} />);
    expect(screen.getByText('Parent asked about campus visit.')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
    expect(screen.getByRole('textbox', { name: 'Notes' })).toBeDisabled();
  }
);
