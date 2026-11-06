import type { AdmissionApplication } from 'src/redux/student/admissions/admission-applications-api';

import dayjs from 'dayjs';
import { useState } from 'react';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { vi, it, expect, beforeEach } from 'vitest';
import { expectStudentErrorToast } from 'src/test/student-toast-test-fixture';
import { act, screen, within, waitFor, fireEvent } from '@testing-library/react';
import { admissionApplicationFollowUpsApi } from 'src/redux/student/admissions/admission-application-follow-ups-api';

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

it.each(['footer', 'header', 'Escape'])(
  'allows %s closing while the initial activity reads are pending',
  async (control) => {
    let finishRead: () => void = () => {};
    const pending = new Promise<void>((resolve) => {
      finishRead = resolve;
    });
    const reads = vi.fn();
    mswServer.use(
      http.get(notesPath, async () => {
        reads();
        await pending;
        return HttpResponse.json({ notes: [note] });
      }),
      http.get(followPath, async () => {
        reads();
        await pending;
        return HttpResponse.json(followValue);
      })
    );
    const onClose = vi.fn();
    const onBusyChange = vi.fn();
    function Harness() {
      const [open, setOpen] = useState(true);
      return (
        <ApplicationActivityDrawer
          open={open}
          application={application}
          onBusyChange={onBusyChange}
          onClose={() => {
            onClose();
            setOpen(false);
          }}
        />
      );
    }
    renderDocumentUi(<Harness />, grants);
    await waitFor(() => expect(reads).toHaveBeenCalledTimes(2));
    expect(screen.getByRole('status', { name: 'Loading Notes and Follow-Ups' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Close' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Close Notes & Follow-Ups' })).toBeEnabled();
    expect(onBusyChange).not.toHaveBeenCalledWith(true);
    if (control === 'Escape') fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    else
      fireEvent.click(
        screen.getByRole('button', {
          name: control === 'header' ? 'Close Notes & Follow-Ups' : 'Close',
        })
      );
    expect(onClose).toHaveBeenCalledOnce();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await act(async () => finishRead());
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.queryByText(note.text)).not.toBeInTheDocument();
    expect(onBusyChange).toHaveBeenLastCalledWith(false);
  }
);

it('does not display a closed read result after another application activity opens', async () => {
  let finishOld: () => void = () => {};
  const pending = new Promise<void>((resolve) => {
    finishOld = resolve;
  });
  const oldReads = vi.fn();
  const other = {
    ...application,
    id: 'application-2',
    applicantId: 'applicant-2',
    applicantName: 'Other applicant',
  };
  mswServer.use(
    http.get(notesPath, async () => {
      oldReads();
      await pending;
      return HttpResponse.json({ notes: [note] });
    }),
    http.get(followPath, async () => {
      oldReads();
      await pending;
      return HttpResponse.json(followValue);
    }),
    http.get('*/api/student/enrollment/admissions/applicants/applicant-2', () =>
      HttpResponse.json({ notes: [{ ...note, id: 'other-note', text: 'Other application note' }] })
    ),
    http.get('*/api/student/enrollment/admissions/applications/application-2/follow-ups', () =>
      HttpResponse.json({ ...followValue, followUps: [] })
    )
  );
  function Harness() {
    const [open, setOpen] = useState(true);
    const [current, setCurrent] = useState(application);
    return (
      <>
        <button
          type="button"
          onClick={() => {
            setCurrent(other);
            setOpen(true);
          }}
        >
          Open other activity
        </button>
        <ApplicationActivityDrawer
          open={open}
          application={current}
          onClose={() => setOpen(false)}
        />
      </>
    );
  }
  const store = renderDocumentUi(<Harness />, grants);
  await waitFor(() => expect(oldReads).toHaveBeenCalledTimes(2));
  fireEvent.click(screen.getByRole('button', { name: 'Close' }));
  fireEvent.click(screen.getByRole('button', { name: 'Open other activity' }));
  expect(await screen.findByText('Other application note')).toBeVisible();
  await act(async () => finishOld());
  await waitFor(() => {
    const {
      queries,
    }: { queries: Record<string, { originalArgs?: unknown; status?: string } | undefined> } =
      store.getState().api;
    const originalReads = Object.values(queries).filter(
      (query) =>
        query?.originalArgs === application.id || query?.originalArgs === application.applicantId
    );
    expect(originalReads).toHaveLength(2);
    expect(originalReads.every((query) => query?.status !== 'pending')).toBe(true);
  });
  expect(screen.getByText('Other application note')).toBeVisible();
  expect(screen.queryByText(note.text)).not.toBeInTheDocument();
  expect(screen.queryByText(followUp.purpose)).not.toBeInTheDocument();
});

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
  expect(screen.getByText('1 Open')).toBeVisible();
  expect(notesReads).toBe(1);
  expect(followReads).toBe(1);
  const field = screen.getByRole('textbox', { name: 'Add Note' });
  fireEvent.change(field, { target: { value: '  Parent asked for a morning visit  ' } });
  fireEvent.click(screen.getByRole('button', { name: 'Add Note' }));
  await waitFor(() =>
    expect(writes).toHaveBeenCalledWith({ text: 'Parent asked for a morning visit' })
  );
  await waitFor(() => expect(field).toHaveValue(''));
  fireEvent.click(screen.getByRole('button', { name: 'Edit' }));
  expect(screen.getByRole('textbox', { name: 'Edit Note' })).toHaveValue(note.text);
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
  fireEvent.click(screen.getByRole('tab', { name: 'Follow-Up' }));
  expect(screen.queryByRole('textbox', { name: 'Add Note' })).not.toBeInTheDocument();
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
  fireEvent.change(screen.getByRole('textbox', { name: 'Add Note' }), {
    target: { value: 'Unsaved note' },
  });
  fireEvent.click(screen.getByRole('tab', { name: 'Follow-Up' }));
  fireEvent.change(screen.getByRole('textbox', { name: /Purpose/ }), {
    target: { value: 'Unsaved follow-up' },
  });
  fireEvent.click(screen.getByRole('tab', { name: 'Note' }));
  expect(screen.getByRole('textbox', { name: 'Add Note' })).toHaveValue('Unsaved note');
  fireEvent.click(screen.getByRole('button', { name: 'Close' }));
  expect(onClose).not.toHaveBeenCalled();
  expect(screen.getByRole('dialog', { name: 'Discard Unsaved Activity?' })).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
  fireEvent.click(screen.getByRole('tab', { name: 'Follow-Up' }));
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
    screen.getByText('No Source Inquiry Is Linked to This Application. Follow-ups Are Unavailable.')
  ).toBeVisible();
  expect(followReads).toBe(0);
});

it('keeps failed-save drafts when a failed follow-up query recovers independently', async () => {
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
  const store = renderDrawer();
  expect(await screen.findByText(note.text)).toBeVisible();
  await expectStudentErrorToast('Follow-ups unavailable');
  expect(screen.queryByRole('button', { name: 'Retry Follow-Ups' })).not.toBeInTheDocument();
  await waitFor(() => expect(screen.getByRole('textbox', { name: 'Add Note' })).toBeEnabled(), {
    timeout: 10000,
  });
  fireEvent.change(screen.getByRole('textbox', { name: 'Add Note' }), {
    target: { value: 'Keep this note' },
  });
  await waitFor(() => expect(screen.getByRole('button', { name: 'Add Note' })).toBeEnabled(), {
    timeout: 10000,
  });
  fireEvent.click(screen.getByRole('button', { name: 'Add Note' }));
  await expectStudentErrorToast('Could not save note');
  await waitFor(() => expect(screen.getByRole('button', { name: 'Add Note' })).toBeEnabled(), {
    timeout: 10000,
  });
  expect(screen.getByRole('textbox', { name: 'Add Note' })).toHaveValue('Keep this note');
  const previousNotesReads = notesReads;
  failFollow = false;
  await act(async () => {
    await store.dispatch(
      admissionApplicationFollowUpsApi.endpoints.getAdmissionApplicationFollowUps.initiate(
        application.id,
        { subscribe: false, forceRefetch: true }
      )
    );
  });
  expect(await screen.findByText(followUp.purpose)).toBeVisible();
  expect(notesReads).toBe(previousNotesReads);
  expect(screen.getByRole('textbox', { name: 'Add Note' })).toHaveValue('Keep this note');
});

it('shows a combined empty state and withholds all editing for a read-only viewer', async () => {
  mswServer.use(
    http.get(notesPath, () => HttpResponse.json({ notes: [] })),
    http.get(followPath, () =>
      HttpResponse.json({ ...followValue, followUps: [], canManageFollowUps: false })
    )
  );
  renderDrawer(['Students.Admissions.Applicants.View', 'Students.Admissions.Applications.View']);
  expect(await screen.findByText('No Notes or Follow-Ups Yet')).toBeVisible();
  const drawer = screen.getByRole('dialog', { name: 'Notes & Follow-Ups' });
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
  fireEvent.change(screen.getByRole('textbox', { name: 'Add Note' }), {
    target: { value: 'QA pending note' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Add Note' }));
  await waitFor(() => expect(writes).toHaveBeenCalledOnce());
  expect(screen.getByRole('button', { name: 'Close' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Close Notes & Follow-Ups' })).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Add Note' }));
  fireEvent.keyDown(screen.getByRole('dialog', { name: 'Notes & Follow-Ups' }), { key: 'Escape' });
  expect(onClose).not.toHaveBeenCalled();
  expect(writes).toHaveBeenCalledOnce();
  finish();
  await waitFor(() => expect(screen.getByRole('button', { name: 'Close' })).toBeEnabled());
  fireEvent.click(screen.getByRole('button', { name: 'Close' }));
  expect(onClose).toHaveBeenCalledOnce();
});

it('keeps parent and child close locks until a follow-up write finishes', async () => {
  let finishWrite: () => void = () => {};
  const pending = new Promise<void>((resolve) => {
    finishWrite = resolve;
  });
  const writes = vi.fn();
  const onClose = vi.fn();
  const onBusyChange = vi.fn();
  mswServer.use(
    http.post(followPath, async () => {
      writes();
      await pending;
      return HttpResponse.json(followValue);
    })
  );
  renderDrawer(grants, { onClose, onBusyChange });
  await screen.findByText(followUp.purpose);
  fireEvent.click(screen.getByRole('tab', { name: 'Follow-Up' }));
  fireEvent.change(screen.getByLabelText('Next follow-up'), {
    target: { value: '2026-10-12T16:00' },
  });
  fireEvent.change(screen.getByRole('textbox', { name: /Purpose/ }), {
    target: { value: 'Keep this follow-up write' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Schedule follow-up' }));
  await waitFor(() => expect(writes).toHaveBeenCalledOnce());
  expect(screen.getByRole('button', { name: 'Close' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Close Notes & Follow-Ups' })).toBeDisabled();
  expect(onBusyChange).toHaveBeenLastCalledWith(true);
  fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
  expect(onClose).not.toHaveBeenCalled();
  finishWrite();
  await waitFor(() => expect(screen.getByRole('button', { name: 'Close' })).toBeEnabled());
  expect(onBusyChange).toHaveBeenLastCalledWith(false);
});

it('does not show an empty history as confirmed when a source cannot be loaded', async () => {
  mswServer.use(
    http.get(notesPath, () => HttpResponse.json({ detail: 'Unavailable' }, { status: 500 })),
    http.get(followPath, () => HttpResponse.json({ ...followValue, followUps: [] }))
  );
  renderDrawer();
  await expectStudentErrorToast('Applicant notes could not be loaded. Try again.');
  expect(screen.queryByRole('button', { name: 'Retry Notes' })).not.toBeInTheDocument();
  expect(screen.queryByText('No Notes or Follow-Ups Yet')).not.toBeInTheDocument();
});
