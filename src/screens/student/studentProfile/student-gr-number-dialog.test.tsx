import type { StudentRecordProfile } from 'src/redux/student/student-profile-types';
import type { CreateRecordChange } from 'src/redux/student/records/student-record-changes-api';

import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import userEvent from '@testing-library/user-event';
import { screen, within, waitFor, fireEvent } from '@testing-library/react';

import {
  profilePath,
  studentProfile,
  profileStudentId,
  renderStudentProfile,
} from './student-profile-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn() },
}));

const grants = [
  'Students.Records.StudentList.View',
  'Students.Records.Changes.View',
  'Students.Records.Changes.Add',
];
const changesPath = '*/api/students/records/changes';
const snapshotPath = `${changesPath}/students/:studentId/snapshot/gr-number`;
const requestId = 'gr-change-1';

function setup(
  student: Partial<StudentRecordProfile> = {},
  permissions = grants,
  load = () => ({ grNumber: null, autoGrNumber: 'GR-00125' }) as Record<string, unknown>
) {
  mswServer.use(
    http.get(profilePath, () =>
      HttpResponse.json({
        data: { ...studentProfile, recordsAccess: 'Full', grNo: null, grNumber: null, ...student },
      })
    ),
    http.get(changesPath, () => HttpResponse.json({ data: { items: [], totalCount: 0 } })),
    http.get(snapshotPath, () =>
      HttpResponse.json({ section: 'gr-number', snapshot: 'gr-snapshot', data: load() })
    )
  );
  renderStudentProfile(profileStudentId, permissions);
}

async function open() {
  await userEvent.click(await screen.findByRole('button', { name: 'Assign GR number' }));
  const dialog = within(await screen.findByRole('dialog', { name: 'Assign GR Number' }));
  await dialog.findByRole('radio', { name: /Manual/ });
  return dialog;
}

it.each<Partial<StudentRecordProfile>>([
  { recordsAccess: 'Summary' },
  { status: 7 },
  { status: 8 },
  { maskedFields: ['Identity'] },
  { firstName: null, lastName: null },
  { grNo: 43 },
  { grNumber: 'GR-00043' },
])('hides the request action for an ineligible profile %#', async (profile) => {
  setup(profile);
  if (profile.recordsAccess === 'Summary')
    await screen.findByRole('heading', { name: 'Student summary' });
  else await screen.findByRole('tab', { name: 'Overview' });
  expect(screen.queryByRole('button', { name: 'Assign GR number' })).not.toBeInTheDocument();
});

it.each([grants.slice(0, 2), [grants[0], grants[2]]])(
  'requires both Changes & Approvals permissions %#',
  async (...permissions) => {
    setup({}, permissions);
    await screen.findByRole('tab', { name: 'Overview' });
    expect(screen.queryByRole('button', { name: 'Assign GR number' })).not.toBeInTheDocument();
  }
);

it('requires a register reference and submits a trimmed Manual request for review', async () => {
  setup(
    {
      academicYearId: 'historic-year',
      standardName: 'Grade 4',
      enrollmentHistory: [
        {
          id: 'active-enrollment',
          academicYearId: 'current-year',
          standardName: 'Grade 5',
          divisionName: 'A',
          isActive: true,
        },
      ],
    },
    grants,
    () => ({ academicYearId: 'current-year', grNumber: null, autoGrNumber: 'GR-00125' })
  );
  const requests: CreateRecordChange[] = [];
  mswServer.use(
    http.post(changesPath, async ({ request }) => {
      requests.push((await request.json()) as CreateRecordChange);
      return HttpResponse.json({ data: { id: requestId, status: 'Pending' } });
    })
  );
  const dialog = await open();
  expect(dialog.getByText('Aanya Patel')).toBeVisible();
  expect(dialog.getByText('Grade 5 · A')).toBeVisible();
  await userEvent.click(dialog.getByRole('radio', { name: /Manual/ }));
  fireEvent.change(dialog.getByLabelText(/^GR number/), { target: { value: '  GR-00043  ' } });
  fireEvent.change(dialog.getByLabelText(/^Reason/), { target: { value: '  Historical entry  ' } });
  await userEvent.click(dialog.getByRole('button', { name: 'Submit for approval' }));
  expect(await dialog.findByText('Enter the school register reference.')).toBeVisible();
  expect(requests).toHaveLength(0);
  fireEvent.change(dialog.getByLabelText(/^Register reference/), {
    target: { value: '  Volume 2, page 7  ' },
  });
  await userEvent.click(dialog.getByRole('button', { name: 'Submit for approval' }));
  const review = await screen.findByRole('link', { name: 'View GR number request' });
  expect(review).toHaveAttribute('href', expect.stringContaining(`request=${requestId}`));
  expect(requests).toEqual([
    {
      studentId: profileStudentId,
      section: 'gr-number',
      expectedSnapshot: 'gr-snapshot',
      clientKey: expect.any(String),
      reason: 'Historical entry',
      payload: { mode: 'manual', grNumber: 'GR-00043', registerReference: 'Volume 2, page 7' },
    },
  ]);
});

it('keeps the client key and exact Auto proposal when the same request is retried', async () => {
  setup();
  const requests: CreateRecordChange[] = [];
  mswServer.use(
    http.post(changesPath, async ({ request }) => {
      requests.push((await request.json()) as CreateRecordChange);
      return requests.length === 1
        ? HttpResponse.json({}, { status: 500 })
        : HttpResponse.json({ id: requestId, status: 'Pending' });
    })
  );
  const dialog = await open();
  await userEvent.click(dialog.getByRole('radio', { name: /Auto/ }));
  expect(dialog.getByDisplayValue('GR-00125')).toHaveAttribute('readonly');
  fireEvent.change(dialog.getByLabelText(/^Reason/), {
    target: { value: 'Assign missing number' },
  });
  await userEvent.click(dialog.getByRole('button', { name: 'Submit for approval' }));
  await dialog.findByRole('alert');
  await userEvent.click(dialog.getByRole('button', { name: 'Submit for approval' }));
  await waitFor(() => expect(requests).toHaveLength(2));
  expect(requests[0].payload).toEqual({ mode: 'auto', grNumber: 'GR-00125' });
  expect(requests[1]).toEqual(requests[0]);
});

it('shows the Auto prerequisite, allows Manual, and protects an unsaved draft', async () => {
  setup({}, grants, () => ({
    grNumber: null,
    autoGrNumber: null,
    autoUnavailableReason: 'Publish a GR series for this scope first.',
  }));
  const dialog = await open();
  expect(dialog.getByRole('radio', { name: /Auto/ })).toBeDisabled();
  expect(dialog.getByText('Publish a GR series for this scope first.')).toBeVisible();
  await userEvent.click(dialog.getByRole('radio', { name: /Manual/ }));
  fireEvent.change(dialog.getByLabelText(/^GR number/), { target: { value: '00071' } });
  await userEvent.click(dialog.getByRole('button', { name: 'Cancel' }));
  await userEvent.click(await screen.findByRole('button', { name: 'Keep editing' }));
  expect(dialog.getByDisplayValue('00071')).toBeVisible();
});

it('requires an explicit review of the refreshed Auto number after a stale proposal', async () => {
  let autoGrNumber = 'GR-00125';
  setup({}, grants, () => ({ grNumber: null, autoGrNumber }));
  const requests: CreateRecordChange[] = [];
  mswServer.use(
    http.post(changesPath, async ({ request }) => {
      requests.push((await request.json()) as CreateRecordChange);
      if (requests.length === 1) {
        autoGrNumber = 'GR-00126';
        return HttpResponse.json(
          { errorCode: 'Students:Records:GrAutoPreviewChanged' },
          { status: 403 }
        );
      }
      return HttpResponse.json({ id: requestId, status: 'Pending' });
    })
  );
  const dialog = await open();
  await userEvent.click(dialog.getByRole('radio', { name: /Auto/ }));
  fireEvent.change(dialog.getByLabelText(/^Reason/), { target: { value: 'Assign missing GR' } });
  const submit = dialog.getByRole('button', { name: 'Submit for approval' });
  await userEvent.click(submit);
  const reload = await dialog.findByRole('button', { name: 'Refresh preview' });
  expect(submit).toBeDisabled();
  await userEvent.click(reload);
  expect(await dialog.findByDisplayValue('GR-00126')).toBeVisible();
  expect(dialog.getByDisplayValue('Assign missing GR')).toBeVisible();
  expect(requests).toHaveLength(1);
  await userEvent.click(submit);
  await waitFor(() => expect(requests).toHaveLength(2));
  expect(requests[1].payload).toEqual({ mode: 'auto', grNumber: 'GR-00126' });
  expect(requests[1].clientKey).not.toBe(requests[0].clientKey);
});

it('attaches a duplicate Manual number error to the field and retains the verified reference', async () => {
  setup();
  mswServer.use(
    http.post(changesPath, () =>
      HttpResponse.json(
        { errorCode: 'Students.Onboarding.IdentifierAlreadyAllocated' },
        { status: 409 }
      )
    )
  );
  const dialog = await open();
  await userEvent.click(dialog.getByRole('radio', { name: /Manual/ }));
  const number = dialog.getByLabelText(/^GR number/);
  fireEvent.change(number, { target: { value: '00071' } });
  fireEvent.change(dialog.getByLabelText(/^Register reference/), {
    target: { value: 'Volume 2, entry 7' },
  });
  fireEvent.change(dialog.getByLabelText(/^Reason/), { target: { value: 'Assign missing GR' } });
  await userEvent.click(dialog.getByRole('button', { name: 'Submit for approval' }));
  expect(await dialog.findByText(/GR number is already assigned/)).toBeVisible();
  expect(number).toHaveAttribute('aria-invalid', 'true');
  expect(dialog.getByDisplayValue('Volume 2, entry 7')).toBeVisible();
});

it('links to the existing review workflow when a GR assignment is already pending', async () => {
  setup();
  mswServer.use(
    http.get(snapshotPath, () =>
      HttpResponse.json({ errorCode: 'Students:Records:GrAssignmentPending' }, { status: 409 })
    )
  );
  await userEvent.click(await screen.findByRole('button', { name: 'Assign GR number' }));
  const dialog = within(await screen.findByRole('dialog', { name: 'Assign GR Number' }));
  const review = await dialog.findByRole('link', { name: 'View changes and approvals' });
  expect(review).toHaveAttribute('href', expect.stringContaining(`student=${profileStudentId}`));
  expect(dialog.getByRole('button', { name: 'Submit for approval' })).toBeDisabled();
  expect(dialog.queryByRole('radio')).not.toBeInTheDocument();
});
