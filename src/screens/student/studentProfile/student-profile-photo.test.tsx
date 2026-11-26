import type { CreateRecordChange } from 'src/redux/student/records/student-record-changes-api';

import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import userEvent from '@testing-library/user-event';
import { screen, within } from '@testing-library/react';

import {
  profilePath,
  studentProfile,
  profileStudentId,
  renderStudentProfile,
} from './student-profile-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
vi.mock('src/components/image-frame/image-frame', async (importOriginal) => ({
  ...(await importOriginal<typeof import('src/components/image-frame/image-frame')>()),
  loadFrameImage: async () => ({ naturalWidth: 800, naturalHeight: 600 }),
  renderImageFrame: async () => new File(['framed'], 'framed.png', { type: 'image/png' }),
}));

const photoPermissions = [
  'Students.Records.StudentList.View',
  'Students.Records.Changes.View',
  'Students.Records.Changes.Add',
];

it('saves the framed photo as one audited change, reusing the staged file and key after a failed response', async () => {
  const user = userEvent.setup();
  const photoPath = '*/api/students/records/:studentId/photo';
  const changesPath = '*/api/students/records/changes';
  let uploads = 0;
  const changes: CreateRecordChange[] = [];
  let entry: Record<string, unknown> | null = null;
  mswServer.use(
    http.get(profilePath, () =>
      HttpResponse.json({ data: { ...studentProfile, recordsAccess: 'Full' } })
    ),
    http.get(photoPath, () =>
      entry
        ? new HttpResponse(new Uint8Array([137, 80, 78, 71]), {
            headers: { 'Content-Type': 'image/png' },
          })
        : new HttpResponse(null, { status: 404 })
    ),
    http.get('*/api/students/records/changes/students/:studentId/snapshot/photo', () =>
      HttpResponse.json({ section: 'photo', snapshot: 'photo-version', data: { photoUrl: null } })
    ),
    http.post(
      '*/api/students/records/changes/students/:studentId/photo-drafts',
      async ({ request }) => {
        uploads += 1;
        const body = await request.formData();
        expect(body.get('file')).toMatchObject({ name: 'framed.png', type: 'image/png' });
        return HttpResponse.json({ id: 'draft-photo', photoUrl: '/preview' });
      }
    ),
    http.get(changesPath, () =>
      HttpResponse.json({ items: entry ? [entry] : [], totalCount: entry ? 1 : 0 })
    ),
    http.post(changesPath, async ({ request }) => {
      const change = (await request.json()) as CreateRecordChange;
      changes.push(change);
      if (changes.length === 1)
        return HttpResponse.json({ error: { message: 'Transient error' } }, { status: 503 });
      entry = {
        ...change,
        id: 'photo-audit',
        action: 'Photo',
        status: 'Applied',
        creationTime: '2026-11-25T09:00:00Z',
        requestedByName: 'QA Staff',
        decisions: [],
      };
      return HttpResponse.json(entry);
    })
  );
  renderStudentProfile(profileStudentId, photoPermissions);
  await user.click(await screen.findByRole('button', { name: 'Upload photo' }));
  await screen.findByRole('button', { name: 'Choose student photo' });
  const dialog = screen.getByRole('dialog', { name: 'Upload Photo' });
  const input = dialog.querySelector<HTMLInputElement>('input[type="file"]')!;
  await user.upload(input, new File(['original'], 'test.jpg', { type: 'image/jpeg' }));
  await user.click(await screen.findByRole('button', { name: 'Use framed photo' }));
  expect(uploads).toBe(0);
  await user.type(
    within(dialog).getByRole('textbox', { name: /Reason for change/ }),
    'Updated school portrait'
  );
  await user.click(within(dialog).getByRole('button', { name: 'Save photo' }));
  expect(await within(dialog).findByText(/selected photo and reason are still here/)).toBeVisible();
  await user.click(within(dialog).getByRole('button', { name: 'Save photo' }));
  expect(await screen.findByRole('button', { name: 'Replace photo' })).toBeVisible();
  expect(uploads).toBe(1);
  expect(changes).toHaveLength(2);
  expect(changes[1]).toEqual(changes[0]);
  expect(changes[1]).toMatchObject({
    section: 'photo',
    reason: 'Updated school portrait',
    studentId: profileStudentId,
    expectedSnapshot: 'photo-version',
    payload: { photoDraftId: 'draft-photo' },
  });
  await user.click(screen.getByRole('tab', { name: 'History' }));
  expect(await screen.findByText('Updated school portrait')).toBeVisible();
  expect(screen.getByText(/Submitted by QA Staff/)).toBeVisible();
}, 20000);
