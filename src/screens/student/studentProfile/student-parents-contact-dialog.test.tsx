import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import userEvent from '@testing-library/user-event';
import { shikshaMitraToast } from 'src/components/toast';
import { screen, within, waitFor, fireEvent } from '@testing-library/react';

import {
  profilePath,
  studentProfile,
  profileStudentId,
  profileDetailsPath,
  renderStudentProfile,
} from './student-profile-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn() },
}));

const permission = [
  'Students.Records.StudentList.View',
  'Students.Records.Changes.View',
  'Students.Records.Changes.Add',
];
const family = {
  fatherDetails: { fullName: 'Raj Patel', email: 'raj@example.test', occupation: 'Teacher' },
  motherDetails: { fullName: 'Meera Patel', email: 'meera@example.test' },
  siblingStudentIds: ['sibling-1'],
  isSingleParent: false,
};
const snapshotPath = '*/api/students/records/changes/students/:studentId/snapshot/family';
const changesPath = '*/api/students/records/changes';
function setup({
  masked = false,
  canEdit = true,
  access = 'Full',
  snapshot = family,
}: {
  masked?: boolean;
  canEdit?: boolean;
  access?: string;
  snapshot?: Record<string, unknown>;
} = {}) {
  vi.mocked(shikshaMitraToast.error).mockClear();
  mswServer.use(
    http.get(profilePath, () => HttpResponse.json({ data: studentProfile })),
    http.get(profileDetailsPath, () =>
      HttpResponse.json({
        data: {
          studentId: profileStudentId,
          recordsAccess: access,
          structuredSections: [
            { section: 'family', hasData: true, isMasked: masked, canEdit, data: snapshot },
          ],
          registrationSources: [],
          customDetailsMasked: false,
          customDetailsEditable: false,
        },
      })
    ),
    http.get(changesPath, () => HttpResponse.json({ data: { items: [], totalCount: 0 } })),
    http.get(snapshotPath, () =>
      HttpResponse.json({ section: 'family', snapshot: 'frozen-family-1', data: snapshot })
    )
  );
}
async function open() {
  await userEvent.click(await screen.findByRole('button', { name: 'Manage contacts' }));
  return screen.findByRole('dialog', { name: 'Manage Contacts' });
}
async function choose(dialog: HTMLElement, label: string) {
  await userEvent.click(within(dialog).getByRole('combobox', { name: /Main school contact/ }));
  await userEvent.click(await screen.findByRole('option', { name: label }));
}
it('requires an explicit choice for two parents and submits the frozen snapshot without losing sibling or parent fields', async () => {
  setup();
  const requests: any[] = [];
  mswServer.use(
    http.post(changesPath, async ({ request }) => {
      requests.push(await request.json());
      return HttpResponse.json({ data: { id: 'change-1', status: 'PendingApproval' } });
    })
  );
  renderStudentProfile(profileStudentId, permission);
  const dialog = await open();
  fireEvent.change(within(dialog).getByLabelText(/Reason for change/), {
    target: { value: 'Family requested contact update' },
  });
  await userEvent.click(within(dialog).getByRole('button', { name: 'Submit' }));
  expect(await within(dialog).findByText('Choose the main school contact.')).toBeVisible();
  expect(requests).toHaveLength(0);
  await choose(dialog, 'Mother — Meera Patel');
  await userEvent.click(within(dialog).getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(requests).toHaveLength(1));
  expect(requests[0]).toEqual(
    expect.objectContaining({
      studentId: profileStudentId,
      section: 'family',
      expectedSnapshot: 'frozen-family-1',
      reason: 'Family requested contact update',
      clientKey: expect.any(String),
      payload: { ...family, mainContactRelationship: 'mother' },
    })
  );
  expect(await screen.findByText('Contact change submitted for review.')).toBeVisible();
});
it('allows an optional guardian to be the contact while preserving both parents and app access separation', async () => {
  setup();
  const requests: any[] = [];
  mswServer.use(
    http.post(changesPath, async ({ request }) => {
      requests.push(await request.json());
      return HttpResponse.json({ data: { id: 'change-2', status: 'Applied' } });
    })
  );
  renderStudentProfile(profileStudentId, permission);
  const dialog = await open();
  await userEvent.click(within(dialog).getByRole('button', { name: 'Add other guardian' }));
  fireEvent.change(within(dialog).getByLabelText(/Other guardian name/), {
    target: { value: 'Aunt Patel' },
  });
  fireEvent.change(within(dialog).getByLabelText(/Relationship to student/), {
    target: { value: 'Aunt' },
  });
  await choose(dialog, 'Other guardian — Aunt Patel');
  fireEvent.change(within(dialog).getByLabelText(/Reason for change/), {
    target: { value: 'Guardian handles school contact' },
  });
  await userEvent.click(within(dialog).getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(requests).toHaveLength(1));
  expect(requests[0].payload).toEqual({
    ...family,
    mainContactRelationship: 'guardian',
    guardianRelationship: 'Aunt',
    guardianDetails: { fullName: 'Aunt Patel', email: null, contactNo: null },
  });
  expect(await screen.findByText('Parents and contact details updated.')).toBeVisible();
});
it('requires a main contact choice when a second parent is added to an automatically selected single parent', async () => {
  setup({ snapshot: { fatherDetails: family.fatherDetails, siblingStudentIds: ['sibling-1'] } });
  const requests: any[] = [];
  mswServer.use(
    http.post(changesPath, async ({ request }) => {
      requests.push(await request.json());
      return HttpResponse.json({ data: { id: 'change-second-parent', status: 'Applied' } });
    })
  );
  renderStudentProfile(profileStudentId, permission);
  const dialog = await open();
  await userEvent.click(within(dialog).getByRole('button', { name: 'Add mother' }));
  fireEvent.change(within(dialog).getByLabelText(/Mother name/), {
    target: { value: 'Meera Patel' },
  });
  fireEvent.change(within(dialog).getByLabelText(/Reason for change/), {
    target: { value: 'Add the other parent' },
  });
  await userEvent.click(within(dialog).getByRole('button', { name: 'Submit' }));
  expect(await within(dialog).findByText('Choose the main school contact.')).toBeVisible();
  expect(requests).toHaveLength(0);
  await userEvent.click(within(dialog).getByRole('button', { name: 'Remove mother' }));
  expect(within(dialog).getByRole('combobox', { name: /Main school contact/ })).toHaveTextContent(
    'Father — Raj Patel'
  );
  await userEvent.click(within(dialog).getByRole('button', { name: 'Add mother' }));
  fireEvent.change(within(dialog).getByLabelText(/Mother name/), {
    target: { value: 'Meera Patel' },
  });
  await choose(dialog, 'Mother — Meera Patel');
  await userEvent.click(within(dialog).getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(requests).toHaveLength(1));
  expect(requests[0].payload).toEqual({
    fatherDetails: family.fatherDetails,
    siblingStudentIds: ['sibling-1'],
    motherDetails: { fullName: 'Meera Patel', email: null, contactNo: null },
    mainContactRelationship: 'mother',
  });
});
it.each([{ masked: true }, { canEdit: false }, { access: 'Summary' }])(
  'does not offer editing for restricted or policy-disabled family data %o',
  async (options) => {
    setup(options);
    renderStudentProfile(profileStudentId, permission);
    await screen.findByText('Aanya Patel');
    await waitFor(() =>
      expect(screen.queryByLabelText('Loading parents and contact details')).not.toBeInTheDocument()
    );
    expect(screen.queryByRole('button', { name: 'Manage contacts' })).not.toBeInTheDocument();
  }
);
it('does not offer editing without the existing change permission', async () => {
  setup();
  renderStudentProfile();
  await screen.findByText('Raj Patel');
  expect(screen.queryByRole('button', { name: 'Manage contacts' })).not.toBeInTheDocument();
});
it('keeps edits on failed submit and uses the same snapshot and client key on retry', async () => {
  setup({ snapshot: { fatherDetails: family.fatherDetails, siblingStudentIds: ['sibling-1'] } });
  const requests: any[] = [];
  mswServer.use(
    http.post(changesPath, async ({ request }) => {
      requests.push(await request.json());
      return requests.length === 1
        ? HttpResponse.json({ error: { message: 'Unavailable' } }, { status: 503 })
        : HttpResponse.json({ data: { id: 'change-3', status: 'Applied' } });
    })
  );
  renderStudentProfile(profileStudentId, permission);
  const dialog = await open();
  const name = within(dialog).getByLabelText('Father name');
  fireEvent.change(name, { target: { value: 'Corrected Patel' } });
  fireEvent.change(within(dialog).getByLabelText(/Reason for change/), {
    target: { value: 'Correct saved name' },
  });
  await userEvent.click(within(dialog).getByRole('button', { name: 'Submit' }));
  await waitFor(() =>
    expect(shikshaMitraToast.error).toHaveBeenCalledWith({
      message:
        'The contact change could not be submitted. Your draft has been kept. Review the details and submit again.',
    })
  );
  expect(within(dialog).queryByText(/could not be submitted/)).not.toBeInTheDocument();
  expect(within(dialog).queryByRole('button', { name: /Retry|Reload/ })).not.toBeInTheDocument();
  expect(name).toHaveValue('Corrected Patel');
  await userEvent.click(within(dialog).getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(requests).toHaveLength(2));
  expect(requests[1]).toEqual(requests[0]);
});
it('guards dirty close with Keep editing and Discard changes', async () => {
  setup();
  renderStudentProfile(profileStudentId, permission);
  const dialog = await open();
  fireEvent.change(within(dialog).getByLabelText(/Reason for change/), {
    target: { value: 'Keep this draft' },
  });
  await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
  const confirmation = await screen.findByRole('dialog', { name: 'Discard Unsaved Changes?' });
  await userEvent.click(within(confirmation).getByRole('button', { name: 'Keep editing' }));
  expect(within(dialog).getByLabelText(/Reason for change/)).toHaveValue('Keep this draft');
  await userEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
  await userEvent.click(
    within(await screen.findByRole('dialog', { name: 'Discard Unsaved Changes?' })).getByRole(
      'button',
      { name: 'Discard changes' }
    )
  );
  await waitFor(() =>
    expect(screen.queryByRole('dialog', { name: 'Manage Contacts' })).not.toBeInTheDocument()
  );
});

it('retains the draft after a stale snapshot and failed reload rather than silently discarding edits', async () => {
  setup({ snapshot: { fatherDetails: family.fatherDetails } });
  let snapshotReads = 0;
  mswServer.use(
    http.get(snapshotPath, () => {
      snapshotReads += 1;
      return snapshotReads === 1
        ? HttpResponse.json({
            section: 'family',
            snapshot: 'frozen-family-1',
            data: { fatherDetails: family.fatherDetails },
          })
        : HttpResponse.json({ error: { message: 'Unavailable' } }, { status: 503 });
    }),
    http.post(changesPath, () =>
      HttpResponse.json({ error: { code: 'Students:Records:StaleSnapshot' } }, { status: 409 })
    )
  );
  renderStudentProfile(profileStudentId, permission);
  const dialog = await open();
  fireEvent.change(within(dialog).getByLabelText('Father name'), {
    target: { value: 'Keep corrected name' },
  });
  fireEvent.change(within(dialog).getByLabelText(/Reason for change/), {
    target: { value: 'Correct contact' },
  });
  await userEvent.click(within(dialog).getByRole('button', { name: 'Submit' }));
  expect(await within(dialog).findByText(/These contacts changed while/)).toBeVisible();
  expect(within(dialog).getByRole('button', { name: 'Submit' })).toBeDisabled();
  await userEvent.click(within(dialog).getByRole('button', { name: 'Reload current contacts' }));
  await userEvent.click(
    within(await screen.findByRole('dialog', { name: 'Discard Unsaved Changes?' })).getByRole(
      'button',
      { name: 'Discard changes' }
    )
  );
  await waitFor(() =>
    expect(shikshaMitraToast.error).toHaveBeenCalledWith({
      message:
        'Current contacts could not be refreshed. Your draft has been kept. Close and reopen Manage contacts to load current details.',
    })
  );
  expect(
    screen.queryByText(
      'Current contacts could not be refreshed. Your draft has been kept. Close and reopen Manage contacts to load current details.'
    )
  ).not.toBeInTheDocument();
  expect(screen.getByLabelText('Father name')).toHaveValue('Keep corrected name');
});

it('locks all fields and close actions while submitting and prevents duplicate requests', async () => {
  setup({ snapshot: { fatherDetails: family.fatherDetails } });
  let requests = 0;
  let finish!: () => void;
  const completion = new Promise<void>((resolve) => {
    finish = resolve;
  });
  mswServer.use(
    http.post(changesPath, async () => {
      requests += 1;
      await completion;
      return HttpResponse.json({ data: { id: 'change-4', status: 'Applied' } });
    })
  );
  renderStudentProfile(profileStudentId, permission);
  const dialog = await open();
  fireEvent.change(within(dialog).getByLabelText(/Reason for change/), {
    target: { value: 'Confirm main contact' },
  });
  const submit = within(dialog).getByRole('button', { name: 'Submit' });
  await userEvent.click(submit);
  expect(within(dialog).getByLabelText('Father name')).toBeDisabled();
  expect(within(dialog).getByRole('combobox', { name: /Main school contact/ })).toHaveAttribute(
    'aria-disabled',
    'true'
  );
  expect(within(dialog).getByRole('button', { name: 'Cancel' })).toBeDisabled();
  expect(within(dialog).getByRole('button', { name: 'close' })).toBeDisabled();
  expect(submit).toBeDisabled();
  // A native click on the disabled action must not enqueue another request.
  fireEvent.click(submit);
  finish();
  expect(await screen.findByText('Parents and contact details updated.')).toBeVisible();
  expect(requests).toBe(1);
});

it('does not reveal cached family snapshots after an access-denied read', async () => {
  setup();
  mswServer.use(
    http.get(snapshotPath, () =>
      HttpResponse.json({ error: { message: 'Denied' } }, { status: 403 })
    )
  );
  renderStudentProfile(profileStudentId, permission);
  const dialog = await open();
  expect(
    await within(dialog).findByText(
      'Parents and contacts are not available with your current access.'
    )
  ).toBeVisible();
  expect(within(dialog).queryByLabelText('Father name')).not.toBeInTheDocument();
  expect(within(dialog).queryByRole('button', { name: 'Submit' })).not.toBeInTheDocument();
});

it('returns to the profile context with an error toast after an initial contacts read fails', async () => {
  setup();
  mswServer.use(
    http.get(snapshotPath, () =>
      HttpResponse.json({ error: { message: 'Unavailable' } }, { status: 503 })
    )
  );
  renderStudentProfile(profileStudentId, permission);
  await userEvent.click(await screen.findByRole('button', { name: 'Manage contacts' }));
  await waitFor(() =>
    expect(shikshaMitraToast.error).toHaveBeenCalledWith({
      message: 'Contacts could not be loaded. Open Manage contacts again to try.',
    })
  );
  await waitFor(() =>
    expect(screen.queryByRole('dialog', { name: 'Manage Contacts' })).not.toBeInTheDocument()
  );
  expect(screen.getByRole('button', { name: 'Manage contacts' })).toBeVisible();
  expect(screen.queryByRole('button', { name: /Retry|Reload/ })).not.toBeInTheDocument();
});
