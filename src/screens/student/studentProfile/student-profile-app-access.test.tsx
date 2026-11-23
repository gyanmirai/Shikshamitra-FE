import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import userEvent from '@testing-library/user-event';
import { screen, within, waitFor, fireEvent } from '@testing-library/react';
import { studentRecordAppAccessApi } from 'src/redux/student/records/student-record-app-access-api';

import {
  profilePath,
  studentProfile,
  profileStudentId,
  renderStudentProfile,
} from './student-profile-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
vi.mock('next-auth/react', async (importOriginal) => ({
  ...(await importOriginal<typeof import('next-auth/react')>()),
  signOut: vi.fn().mockResolvedValue(undefined),
}));

const accessPath = '*/api/students/records/:studentId/app-access';
const viewPermission = 'Students.Records.AppAccess.View';
const addPermission = 'Students.Records.AppAccess.Add';
const profilePermission = 'Students.Records.StudentList.View';
const snapshot = {
  studentId: profileStudentId,
  recipients: [
    {
      recipientKey: 'student',
      relationship: 'self',
      displayName: 'Aanya Patel',
      status: 'on',
      canUpdate: true,
      concurrencyStamp: 'self-1',
    },
    {
      recipientKey: 'father-link',
      relationship: 'father',
      displayName: 'Raj Patel',
      status: 'off',
      canUpdate: true,
      concurrencyStamp: 'father-1',
    },
    {
      recipientKey: 'mother-link',
      relationship: 'mother',
      displayName: 'Rina Patel',
      status: 'not-set-up',
      canUpdate: false,
      concurrencyStamp: 'mother-1',
    },
  ],
  history: [],
};

function withProfile(recordsAccess: 'Full' | 'Summary' = 'Full') {
  mswServer.use(
    http.get(profilePath, () => HttpResponse.json({ data: { ...studentProfile, recordsAccess } }))
  );
}

it.each([
  ['Full', [addPermission]],
  ['Summary', [viewPermission, addPermission]],
] as const)(
  'keeps App Access data private for %s profiles without both view requirements',
  async (access, grants) => {
    const read = vi.fn(() => HttpResponse.json({ data: snapshot }));
    withProfile(access);
    mswServer.use(http.get(accessPath, read));

    renderStudentProfile(profileStudentId, [profilePermission, ...grants]);

    await screen.findByRole('heading', {
      name: access === 'Summary' ? 'Student summary' : /Aanya/,
    });
    expect(screen.queryByRole('region', { name: 'App Access' })).toBeNull();
    expect(read).not.toHaveBeenCalled();
  }
);

it('shows one status for each recipient and leaves a View-only user without update commands', async () => {
  withProfile();
  mswServer.use(http.get(accessPath, () => HttpResponse.json({ data: snapshot })));

  renderStudentProfile(profileStudentId, [profilePermission, viewPermission]);

  const section = within(await screen.findByRole('region', { name: 'App Access' }));
  expect(await section.findByText('Raj Patel')).toBeVisible();
  expect(section.getByText('Rina Patel')).toBeVisible();
  expect(section.getByText('On', { exact: true })).toBeVisible();
  expect(section.getByText('Off', { exact: true })).toBeVisible();
  expect(section.getByText('Not set up')).toBeVisible();
  expect(section.queryByRole('button', { name: /Turn (on|off)/ })).toBeNull();
  expect(section.getByRole('button', { name: 'View history' })).toBeEnabled();
});

it('writes only the confirmed recipient with a trimmed reason and displays returned history', async () => {
  const requests: unknown[] = [];
  const updated = {
    ...snapshot,
    recipients: snapshot.recipients.map((recipient) =>
      recipient.relationship === 'father'
        ? { ...recipient, status: 'on', concurrencyStamp: 'father-2' }
        : recipient
    ),
    history: [
      {
        id: 'event-1',
        relationship: 'father',
        displayName: 'Raj Patel',
        enabled: true,
        reason: 'Verified by school',
        changedAt: '2026-11-23T08:00:00Z',
        changedByName: 'Office Staff',
      },
    ],
  };
  withProfile();
  mswServer.use(
    http.get(accessPath, () => HttpResponse.json({ data: requests.length ? updated : snapshot })),
    http.put(`${accessPath}/:recipientKey`, async ({ params, request }) => {
      requests.push({ recipientKey: params.recipientKey, body: await request.json() });
      return HttpResponse.json({ data: updated });
    })
  );

  const user = userEvent.setup();
  renderStudentProfile(profileStudentId, [profilePermission, viewPermission, addPermission]);
  const section = within(await screen.findByRole('region', { name: 'App Access' }));
  const turnOn = await section.findByRole('button', {
    name: 'Turn on access for Father Raj Patel',
  });
  expect(section.queryByRole('button', { name: /Rina Patel/ })).toBeNull();
  await user.click(turnOn);
  const dialog = within(screen.getByRole('dialog'));
  const reason = dialog.getByRole('textbox', { name: 'Reason' });
  const confirm = dialog.getByRole('button', { name: 'Turn on' });
  expect(confirm).toBeDisabled();
  await user.type(reason, ' a ');
  expect(confirm).toBeDisabled();
  expect(requests).toHaveLength(0);
  await user.clear(reason);
  await user.type(reason, '  Verified by school  ');
  await user.click(confirm);

  expect(
    await section.findByRole('button', { name: 'Turn off access for Father Raj Patel' })
  ).toBeEnabled();
  expect(requests).toEqual([
    {
      recipientKey: 'father-link',
      body: { enabled: true, reason: 'Verified by school', concurrencyStamp: 'father-1' },
    },
  ]);
  await user.click(section.getByRole('button', { name: 'View history' }));
  const history = within(screen.getByRole('dialog', { name: 'App Access History' }));
  expect(history.getByText('Verified by school')).toBeVisible();
  expect(history.getByText(/Office Staff/)).toBeVisible();
});

it('keeps the reason after a stale save and uses the refreshed version for a deliberate retry', async () => {
  const requests: unknown[] = [];
  const refreshed = {
    ...snapshot,
    recipients: snapshot.recipients.map((recipient) =>
      recipient.relationship === 'father'
        ? { ...recipient, concurrencyStamp: 'father-2' }
        : recipient
    ),
  };
  withProfile();
  mswServer.use(
    http.get(accessPath, () => HttpResponse.json({ data: requests.length ? refreshed : snapshot })),
    http.put(`${accessPath}/:recipientKey`, async ({ request }) => {
      requests.push(await request.json());
      return requests.length === 1
        ? HttpResponse.json({}, { status: 409 })
        : HttpResponse.json({ data: refreshed });
    })
  );

  const user = userEvent.setup();
  renderStudentProfile(profileStudentId, [profilePermission, viewPermission, addPermission]);
  await user.click(
    await screen.findByRole('button', { name: 'Turn on access for Father Raj Patel' })
  );
  const dialog = within(screen.getByRole('dialog'));
  await user.type(dialog.getByRole('textbox', { name: 'Reason' }), 'Keep this reason');
  await user.click(dialog.getByRole('button', { name: 'Turn on' }));

  expect(await dialog.findByRole('alert')).toHaveTextContent(/access changed/i);
  expect(dialog.getByRole('textbox', { name: 'Reason' })).toHaveValue('Keep this reason');
  expect(requests).toHaveLength(1);
  await user.click(dialog.getByRole('button', { name: 'Refresh access' }));
  expect(await dialog.findByText(/review the current status/i)).toBeVisible();
  await user.click(dialog.getByRole('button', { name: 'Turn on' }));
  await waitFor(() => {
    expect(requests).toEqual([
      expect.objectContaining({ concurrencyStamp: 'father-1' }),
      expect.objectContaining({ concurrencyStamp: 'father-2', reason: 'Keep this reason' }),
    ]);
  });
});

it('keeps a valid Turn off reason visible after a save failure and rejects more than 400 trimmed characters', async () => {
  const write = vi.fn(() => HttpResponse.json({}, { status: 503 }));
  withProfile();
  mswServer.use(
    http.get(accessPath, () => HttpResponse.json({ data: snapshot })),
    http.put(`${accessPath}/:recipientKey`, write)
  );
  renderStudentProfile(profileStudentId, [profilePermission, viewPermission, addPermission]);

  fireEvent.click(
    await screen.findByRole('button', { name: 'Turn off access for Student Aanya Patel' })
  );
  const dialog = within(screen.getByRole('dialog'));
  const reason = dialog.getByRole('textbox', { name: 'Reason' });
  const confirm = dialog.getByRole('button', { name: 'Turn off' });
  fireEvent.change(reason, { target: { value: 'x'.repeat(401) } });
  expect(confirm).toBeDisabled();
  expect(write).not.toHaveBeenCalled();
  fireEvent.change(reason, { target: { value: 'x'.repeat(400) } });
  fireEvent.click(confirm);

  expect(await dialog.findByRole('alert')).toHaveTextContent(/could not be saved/i);
  expect(reason).toHaveValue('x'.repeat(400));
  expect(confirm).toBeEnabled();
});

it.each([
  [401, 'AUTHORIZATION_REQUIRED'],
  [403, 'Students:Records:AppAccessIdentityRestricted'],
  [400, 'Students:Records:AppAccessIdentityRestricted'],
  [400, 'Students:Records:AppAccessEnrollmentRequired'],
] as const)(
  'hides the previously read snapshot if refreshing returns %s %s',
  async (status, errorCode) => {
    let rejected = false;
    withProfile();
    mswServer.use(
      http.get(accessPath, () =>
        rejected
          ? HttpResponse.json({ errorCode }, { status })
          : HttpResponse.json({ data: snapshot })
      ),
      http.put(`${accessPath}/:recipientKey`, () => {
        rejected = true;
        return HttpResponse.json({}, { status: 409 });
      })
    );
    const { getState } = renderStudentProfile(profileStudentId, [
      profilePermission,
      viewPermission,
      addPermission,
    ]);
    const section = await screen.findByRole('region', { name: 'App Access' });
    fireEvent.click(
      await within(section).findByRole('button', { name: 'Turn on access for Father Raj Patel' })
    );
    const dialog = within(screen.getByRole('dialog'));
    fireEvent.change(dialog.getByRole('textbox', { name: 'Reason' }), {
      target: { value: 'Review completed' },
    });
    fireEvent.click(dialog.getByRole('button', { name: 'Turn on' }));
    fireEvent.click(await dialog.findByRole('button', { name: 'Refresh access' }));

    await waitFor(() => expect(section).not.toBeInTheDocument());
    expect(
      studentRecordAppAccessApi.endpoints.getStudentRecordAppAccess.select(profileStudentId)(
        getState()
      ).data
    ).toBeNull();
    expect(screen.queryByText('Raj Patel')).not.toBeInTheDocument();
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  }
);
