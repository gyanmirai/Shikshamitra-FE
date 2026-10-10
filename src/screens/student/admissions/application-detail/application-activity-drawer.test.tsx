import type { AdmissionApplication } from 'src/redux/student/admissions/admission-applications-api';

import dayjs from 'dayjs';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { vi, it, expect, beforeEach } from 'vitest';
import { screen, within, waitFor, fireEvent } from '@testing-library/react';

import { ApplicationActivityDrawer } from './application-activity-drawer';
import { renderDocumentUi } from '../document-verification/document-ui-test-fixture';

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden /> }));
vi.mock('@mui/x-date-pickers', () => ({
  DateTimePicker: ({
    label,
    value,
    disabled,
    onChange,
  }: {
    label: string;
    value: dayjs.Dayjs | null;
    disabled: boolean;
    onChange: (value: dayjs.Dayjs | null) => void;
  }) => (
    <input
      aria-label={label}
      disabled={disabled}
      value={value?.format('YYYY-MM-DDTHH:mm') ?? ''}
      onChange={(event) => onChange(event.target.value ? dayjs(event.target.value) : null)}
    />
  ),
}));

const application = {
  id: 'application-1',
  applicantId: 'applicant-1',
  inquiryId: 'inquiry-1',
  applicantName: 'QA Applicant',
  applicationNumber: 'APP-2026-000001',
} as AdmissionApplication;
const notesPath = '*/api/student/enrollment/admissions/applicants/applicant-1';
const followPath = '*/api/student/enrollment/admissions/applications/application-1/follow-ups';
const grants = [
  'Students.Admissions.Applications.View',
  'Students.Admissions.Applicants.View',
  'Students.Admissions.Applicants.Add',
];
const note = {
  id: 'note-1',
  text: 'Parent prefers an afternoon call',
  creationTime: '2026-10-10T10:00:00Z',
};
const followUp = {
  id: 'follow-up-1',
  purpose: 'Call parent about documents',
  scheduledAt: '2026-10-11T10:00:00Z',
  status: 0,
  concurrencyStamp: 'follow-stamp',
  completedAt: null,
  completionNote: null,
};
const followValue = {
  inquiryId: 'inquiry-1',
  concurrencyStamp: 'inquiry-stamp',
  canManageFollowUps: true,
  followUps: [followUp],
};
let notesReads = 0;
let followReads = 0;
beforeEach(() => {
  notesReads = 0;
  followReads = 0;
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json(null)),
    http.get(notesPath, () => {
      notesReads += 1;
      return HttpResponse.json({ notes: [note] });
    }),
    http.get(followPath, () => {
      followReads += 1;
      return HttpResponse.json(followValue);
    })
  );
});
const renderDrawer = (permissions = grants, props = {}) =>
  renderDocumentUi(
    <ApplicationActivityDrawer open application={application} onClose={vi.fn()} {...props} />,
    permissions
  );

it('does not request notes or follow-ups until the drawer opens', () => {
  renderDrawer(grants, { open: false });
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(notesReads).toBe(0);
  expect(followReads).toBe(0);
});

it('combines evidence in one history and preserves the note endpoint and edit flow', async () => {
  const writes = vi.fn();
  mswServer.use(
    http.post(`${notesPath}/notes`, async ({ request }) => {
      writes(await request.json());
      return HttpResponse.json({ ...note, id: 'new-note' });
    })
  );
  renderDrawer();
  expect(await screen.findByText(note.text)).toBeVisible();
  expect(await screen.findByText(followUp.purpose)).toBeVisible();
  expect(screen.getByText('1 open')).toBeVisible();
  expect(notesReads).toBe(1);
  expect(followReads).toBe(1);
  const field = screen.getByRole('textbox', { name: 'Add note' });
  fireEvent.change(field, { target: { value: '  Parent asked for a morning visit  ' } });
  fireEvent.click(screen.getByRole('button', { name: 'Add note' }));
  await waitFor(() =>
    expect(writes).toHaveBeenCalledWith({ text: 'Parent asked for a morning visit' })
  );
  await waitFor(() => expect(field).toHaveValue(''));
  fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
  expect(screen.getByRole('textbox', { name: 'Edit note' })).toHaveValue(note.text);
});

it('schedules a follow-up through the existing application route with an ISO date and current stamp', async () => {
  const writes = vi.fn();
  mswServer.use(
    http.post(followPath, async ({ request }) => {
      writes(await request.json());
      return HttpResponse.json(followValue);
    })
  );
  renderDrawer();
  await screen.findByText(followUp.purpose);
  fireEvent.click(screen.getByRole('tab', { name: 'Follow-up' }));
  expect(screen.queryByRole('textbox', { name: 'Add note' })).not.toBeInTheDocument();
  fireEvent.change(screen.getByLabelText('Next follow-up'), {
    target: { value: '2026-10-12T16:00' },
  });
  fireEvent.change(screen.getByRole('textbox', { name: /Purpose/ }), {
    target: { value: '  Check fee structure  ' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Schedule follow-up' }));
  await waitFor(() =>
    expect(writes).toHaveBeenCalledWith({
      purpose: 'Check fee structure',
      scheduledAt: dayjs('2026-10-12T16:00').toISOString(),
      concurrencyStamp: 'inquiry-stamp',
    })
  );
  await waitFor(() => expect(screen.getByRole('textbox', { name: /Purpose/ })).toHaveValue(''));
});

it.each(['complete', 'cancel'])(
  'finishes a follow-up with a required note and both concurrency stamps: %s',
  async (action) => {
    const writes = vi.fn();
    mswServer.use(
      http.post(`${followPath}/follow-up-1/${action}`, async ({ request }) => {
        writes(await request.json());
        return HttpResponse.json(followValue);
      })
    );
    renderDrawer();
    await screen.findByText(followUp.purpose);
    const button = screen.getByRole('button', {
      name: action === 'complete' ? 'Complete' : 'Cancel',
    });
    expect(button).toBeDisabled();
    fireEvent.change(screen.getByRole('textbox', { name: /Completion or cancellation note/ }), {
      target: { value: 'Parent contacted' },
    });
    fireEvent.click(button);
    await waitFor(() =>
      expect(writes).toHaveBeenCalledWith({
        note: 'Parent contacted',
        concurrencyStamp: 'inquiry-stamp',
        followUpConcurrencyStamp: 'follow-stamp',
      })
    );
  }
);

it('protects both note and follow-up drafts when changing type or closing', async () => {
  const onClose = vi.fn();
  renderDrawer(grants, { onClose });
  await screen.findByText(note.text);
  fireEvent.change(screen.getByRole('textbox', { name: 'Add note' }), {
    target: { value: 'Unsaved note' },
  });
  fireEvent.click(screen.getByRole('tab', { name: 'Follow-up' }));
  fireEvent.change(screen.getByRole('textbox', { name: /Purpose/ }), {
    target: { value: 'Unsaved follow-up' },
  });
  fireEvent.click(screen.getByRole('tab', { name: 'Note' }));
  expect(screen.getByRole('textbox', { name: 'Add note' })).toHaveValue('Unsaved note');
  fireEvent.click(screen.getByRole('button', { name: 'Close' }));
  expect(onClose).not.toHaveBeenCalled();
  expect(screen.getByRole('dialog', { name: 'Discard Unsaved Activity?' })).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
  fireEvent.click(screen.getByRole('tab', { name: 'Follow-up' }));
  expect(screen.getByRole('textbox', { name: /Purpose/ })).toHaveValue('Unsaved follow-up');
});

it('does not fetch applicant notes without applicant View and still permits authorized follow-ups', async () => {
  renderDrawer(['Students.Admissions.Applications.View']);
  expect(await screen.findByText(followUp.purpose)).toBeVisible();
  expect(notesReads).toBe(0);
  expect(followReads).toBe(1);
  expect(screen.queryByText(note.text)).not.toBeInTheDocument();
  expect(screen.getByRole('tab', { name: 'Note' })).toBeDisabled();
});

it('keeps notes available when the application has no inquiry and skips the follow-up read', async () => {
  renderDrawer(grants, { application: { ...application, inquiryId: null } });
  expect(await screen.findByText(note.text)).toBeVisible();
  expect(
    screen.getByText('No source inquiry is linked to this application. Follow-ups are unavailable.')
  ).toBeVisible();
  expect(followReads).toBe(0);
});

it('keeps failed-save drafts and supports an independent follow-up retry', async () => {
  let failFollow = true;
  mswServer.use(
    http.get(followPath, () =>
      failFollow
        ? HttpResponse.json({ detail: 'Follow-ups unavailable' }, { status: 500 })
        : HttpResponse.json(followValue)
    ),
    http.post(`${notesPath}/notes`, () =>
      HttpResponse.json({ detail: 'Could not save note' }, { status: 400 })
    )
  );
  renderDrawer();
  expect(await screen.findByText(note.text)).toBeVisible();
  await screen.findByRole('button', { name: 'Retry follow-ups' });
  fireEvent.change(screen.getByRole('textbox', { name: 'Add note' }), {
    target: { value: 'Keep this note' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Add note' }));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Add note' })).toBeEnabled());
  expect(screen.getByRole('textbox', { name: 'Add note' })).toHaveValue('Keep this note');
  failFollow = false;
  fireEvent.click(screen.getByRole('button', { name: 'Retry follow-ups' }));
  expect(await screen.findByText(followUp.purpose)).toBeVisible();
  expect(screen.getByRole('textbox', { name: 'Add note' })).toHaveValue('Keep this note');
});

it('shows a combined empty state and withholds all editing for a read-only viewer', async () => {
  mswServer.use(
    http.get(notesPath, () => HttpResponse.json({ notes: [] })),
    http.get(followPath, () =>
      HttpResponse.json({ ...followValue, followUps: [], canManageFollowUps: false })
    )
  );
  renderDrawer(['Students.Admissions.Applicants.View', 'Students.Admissions.Applications.View']);
  expect(await screen.findByText('No notes or follow-ups yet')).toBeVisible();
  const drawer = screen.getByRole('dialog', { name: 'Notes & Follow-ups' });
  expect(within(drawer).queryByRole('textbox')).not.toBeInTheDocument();
});

it('locks closing and duplicate note submissions until the save finishes', async () => {
  let finish: () => void = () => undefined;
  const pending = new Promise<void>((resolve) => {
    finish = resolve;
  });
  const writes = vi.fn();
  const onClose = vi.fn();
  mswServer.use(
    http.post(`${notesPath}/notes`, async () => {
      writes();
      await pending;
      return HttpResponse.json(note);
    })
  );
  renderDrawer(grants, { onClose });
  await screen.findByText(note.text);
  fireEvent.change(screen.getByRole('textbox', { name: 'Add note' }), {
    target: { value: 'QA pending note' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Add note' }));
  await waitFor(() => expect(writes).toHaveBeenCalledOnce());
  expect(screen.getByRole('button', { name: 'Close' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Close Notes & Follow-ups' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Add note' }));
  fireEvent.keyDown(screen.getByRole('dialog', { name: 'Notes & Follow-ups' }), { key: 'Escape' });
  expect(onClose).not.toHaveBeenCalled();
  expect(writes).toHaveBeenCalledOnce();
  finish();
  await waitFor(() => expect(screen.getByRole('button', { name: 'Close' })).toBeEnabled());
  fireEvent.click(screen.getByRole('button', { name: 'Close' }));
  expect(onClose).toHaveBeenCalledOnce();
});

it('does not show an empty history as confirmed when a source cannot be loaded', async () => {
  mswServer.use(
    http.get(notesPath, () => HttpResponse.json({ detail: 'Unavailable' }, { status: 500 })),
    http.get(followPath, () => HttpResponse.json({ ...followValue, followUps: [] }))
  );
  renderDrawer();
  await screen.findByRole('button', { name: 'Retry notes' });
  expect(screen.queryByText('No notes or follow-ups yet')).not.toBeInTheDocument();
});
