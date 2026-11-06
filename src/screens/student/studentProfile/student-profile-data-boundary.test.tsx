import type { ReactNode } from 'react';
import type { AlertProps } from '@mui/material';

import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';
import { act, render, screen, within, waitFor } from '@testing-library/react';

import {
  profilePath,
  studentProfile,
  profileStudentId,
  profileEvidencePath,
  renderStudentProfile,
  profileDocumentsPath,
} from './student-profile-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
const feedback = vi.hoisted(() => ({
  error: vi.fn(
    (_options: { message: ReactNode; alertProps: (id: string | number) => AlertProps }) =>
      'profile-error'
  ),
  info: vi.fn(),
  warning: vi.fn(),
  success: vi.fn(),
  dismiss: vi.fn(),
}));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: feedback }));
const loadFailure =
  'Unable to load this student profile. Please try again. If the problem continues, check your student record access.';
async function deliveredRecovery(message: string) {
  await waitFor(() =>
    expect(feedback.error).toHaveBeenCalledWith(expect.objectContaining({ message }))
  );
  const notice = feedback.error.mock.calls.findLast(
    ([options]) => options.message === message
  )?.[0];
  const action = render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      {notice?.alertProps('profile-error').action}
    </ThemeProvider>
  );
  return within(action.container);
}
beforeEach(() => vi.clearAllMocks());

it('loads the protected profile and passes its canonical GUID to both real Documents queries only after selection', async () => {
  const requests: string[] = [];
  mswServer.use(
    http.get(profilePath, ({ params }) => {
      requests.push(`profile:${params.studentId}`);
      return HttpResponse.json({ data: studentProfile });
    }),
    http.get(profileDocumentsPath, ({ params }) => {
      requests.push(`documents:${params.studentId}`);
      return HttpResponse.json({ data: [] });
    }),
    http.get(profileEvidencePath, ({ params }) => {
      requests.push(`evidence:${params.studentId}`);
      return HttpResponse.json({ data: [] });
    })
  );
  renderStudentProfile();
  expect(screen.getByRole('status')).toHaveTextContent('Loading student profile');
  expect(screen.queryByRole('tab', { name: 'Documents' })).not.toBeInTheDocument();
  expect(await screen.findByText('Aanya Patel')).toBeInTheDocument();
  expect(screen.getAllByText('GR-2026-00123').length).toBeGreaterThan(0);
  expect(screen.getByText('Grade 5 · A')).toBeInTheDocument();
  expect(screen.getAllByText('English').length).toBeGreaterThan(0);
  expect(requests).toEqual([`profile:${profileStudentId}`]);
  await userEvent.click(screen.getByRole('tab', { name: 'Documents' }));
  expect(
    await screen.findByText('No documents are available for this student.')
  ).toBeInTheDocument();
  await waitFor(() =>
    expect(requests).toEqual(
      expect.arrayContaining([`documents:${profileStudentId}`, `evidence:${profileStudentId}`])
    )
  );
});

it('keeps tabs unmounted on a failed read and retries the actual profile request from its toast', async () => {
  let attempts = 0;
  mswServer.use(
    http.get(profilePath, () => {
      attempts += 1;
      return attempts === 1
        ? HttpResponse.json({ error: { message: 'Temporary outage' } }, { status: 503 })
        : HttpResponse.json({ data: studentProfile });
    })
  );
  renderStudentProfile();
  const recovery = await deliveredRecovery(loadFailure);
  expect(
    screen.queryByText('Unable to load this student profile', { exact: false })
  ).not.toBeInTheDocument();
  expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
  expect(screen.queryByText('Admission evidence')).not.toBeInTheDocument();
  await userEvent.click(recovery.getByRole('button', { name: 'Retry' }));
  expect(await screen.findByText('Aanya Patel')).toBeInTheDocument();
  expect(attempts).toBe(2);
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
});

it.each([
  { ...studentProfile, id: 0 },
  {
    ...studentProfile,
    id: 'ad499999-0000-4000-8000-000000000001',
    studentId: 'ad499999-0000-4000-8000-000000000001',
  },
])(
  'rejects malformed or mismatched profile identity without a URL-only fallback',
  async (response) => {
    let attempts = 0;
    mswServer.use(
      http.get(profilePath, () => {
        attempts += 1;
        return HttpResponse.json({ data: attempts === 1 ? response : studentProfile });
      })
    );
    renderStudentProfile();
    const recovery = await deliveredRecovery(loadFailure);
    expect(
      screen.queryByText('Unable to load this student profile', { exact: false })
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(screen.queryByText('Admission evidence')).not.toBeInTheDocument();
    await userEvent.click(recovery.getByRole('button', { name: 'Retry' }));
    expect(await screen.findByText('Aanya Patel')).toBeVisible();
    expect(attempts).toBe(2);
  }
);

it('retries a failed refresh from the delivered toast without unmounting the current profile', async () => {
  let reads = 0;
  mswServer.use(
    http.get(profilePath, () => {
      reads += 1;
      return reads === 2
        ? HttpResponse.json({ detail: 'Unavailable' }, { status: 503 })
        : HttpResponse.json({ data: studentProfile });
    })
  );
  const view = renderStudentProfile();
  await screen.findByText('Aanya Patel');
  const overview = screen.getByRole('tab', { name: 'Overview' });
  await act(async () => {
    view.invalidateProfile();
  });
  const recovery = await deliveredRecovery(
    'The profile could not be refreshed. Your current view and draft have been kept.'
  );
  expect(screen.getByRole('tab', { name: 'Overview' })).toBe(overview);
  expect(screen.getByText('Aanya Patel')).toBeVisible();
  await userEvent.click(recovery.getByRole('button', { name: 'Retry profile' }));
  await waitFor(() => expect(reads).toBe(3));
  expect(screen.getByRole('tab', { name: 'Overview' })).toBe(overview);
});

it('keeps protected section queries unmounted during summary-only provisioning', async () => {
  const protectedRequests: string[] = [];
  mswServer.use(
    http.get(profilePath, () =>
      HttpResponse.json({ data: { ...studentProfile, recordsAccess: 'Summary', maskedFields: [] } })
    ),
    http.get(profileDocumentsPath, () => {
      protectedRequests.push('documents');
      return HttpResponse.json({ data: [] });
    }),
    http.get(profileEvidencePath, () => {
      protectedRequests.push('evidence');
      return HttpResponse.json({ data: [] });
    })
  );
  renderStudentProfile(profileStudentId, [
    'Students.Records.StudentList.View',
    'Students.Admissions.Documents.View',
    'Students.Onboarding.View',
  ]);
  expect(await screen.findByRole('heading', { name: 'Student summary' })).toBeVisible();
  expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Open Student Onboarding' })).toBeVisible();
  expect(protectedRequests).toEqual([]);
});
