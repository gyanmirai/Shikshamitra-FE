import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';

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
  expect(await screen.findByText('Patel Aanya')).toBeInTheDocument();
  expect(screen.getByText('GR-2026-00123')).toBeInTheDocument();
  expect(screen.getByText('Grade 5-A')).toBeInTheDocument();
  expect(screen.getByText('English')).toBeInTheDocument();
  expect(requests).toEqual([`profile:${profileStudentId}`]);
  await userEvent.click(screen.getByRole('tab', { name: 'Documents' }));
  expect(
    await screen.findByText('No admission evidence is linked to this student.')
  ).toBeInTheDocument();
  await waitFor(() =>
    expect(requests).toEqual(
      expect.arrayContaining([`documents:${profileStudentId}`, `evidence:${profileStudentId}`])
    )
  );
});

it('keeps tabs unmounted on a failed read and retries the actual profile request', async () => {
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
  expect(await screen.findByRole('alert')).toHaveTextContent('Unable to load this student profile');
  expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
  expect(screen.queryByText('Admission evidence')).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
  expect(await screen.findByText('Patel Aanya')).toBeInTheDocument();
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
    mswServer.use(http.get(profilePath, () => HttpResponse.json({ data: response })));
    renderStudentProfile();
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Unable to load this student profile'
    );
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(screen.queryByText('Admission evidence')).not.toBeInTheDocument();
  }
);
