import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { screen, waitFor, fireEvent } from '@testing-library/react';

import { renderQuickSubstitution } from './quick-substitution-test-fixture';
import { quickLecture, quickCandidate } from './quick-substitution-test-data';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

it('assigns the clipped absence window and refreshes coverage without closing the drawer', async () => {
  let saved: Record<string, unknown> | undefined;
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json(null)),
    http.get('*/api/academics/timetable/teacher-availability/affected-lectures', () =>
      HttpResponse.json({
        items: [
          {
            ...quickLecture,
            canCreateSubstitution: !saved,
            existingSubstitutionStatus: saved ? 'WaitingAck' : null,
          },
        ],
      })
    ),
    http.get('*/api/academics/timetable/substitutions/suggested-teachers', ({ request }) => {
      expect(new URL(request.url).searchParams.get('endTime')).toBe('11:00');
      return HttpResponse.json([quickCandidate]);
    }),
    http.post('*/api/academics/timetable/substitutions', async ({ request }) => {
      saved = (await request.json()) as Record<string, unknown>;
      return HttpResponse.json({ id: 'substitution-1' });
    })
  );
  renderQuickSubstitution();
  fireEvent.click(await screen.findByRole('button', { name: 'Arrange Period 1 for Class 6-A' }));
  fireEvent.click(await screen.findByRole('radio', { name: 'Select Free Teacher' }));
  fireEvent.click(screen.getByRole('button', { name: 'Assign substitute' }));
  await screen.findByText('0 periods need cover');
  expect(saved).toMatchObject({
    originalTeacherId: 'original-1',
    substituteTeacherId: 'substitute-1',
    source: 5,
    timetableSlotSubjectId: 'slot-subject-1',
    startTime: '10:30',
    endTime: '11:00',
    acknowledgementRequired: true,
  });
  expect(screen.getByText(/WaitingAck/)).toBeInTheDocument();
});

it('preserves the substitute selection after a failed assignment and supports retry', async () => {
  let attempts = 0;
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json(null)),
    http.get('*/api/academics/timetable/teacher-availability/affected-lectures', () =>
      HttpResponse.json({ items: [quickLecture] })
    ),
    http.get('*/api/academics/timetable/substitutions/suggested-teachers', () =>
      HttpResponse.json([quickCandidate])
    ),
    http.post('*/api/academics/timetable/substitutions', () => {
      attempts += 1;
      return attempts === 1
        ? HttpResponse.json({ detail: 'Teacher was just assigned elsewhere.' }, { status: 409 })
        : HttpResponse.json({ id: 'substitution-1' });
    })
  );
  renderQuickSubstitution();
  fireEvent.click(await screen.findByRole('button', { name: 'Arrange Period 1 for Class 6-A' }));
  fireEvent.click(await screen.findByRole('radio', { name: 'Select Free Teacher' }));
  fireEvent.click(screen.getByRole('button', { name: 'Assign substitute' }));
  await screen.findByText('Teacher was just assigned elsewhere.');
  expect(screen.getByRole('radio', { name: 'Select Free Teacher' })).toBeChecked();
  fireEvent.click(screen.getByRole('button', { name: 'Assign substitute' }));
  await waitFor(() => expect(attempts).toBe(2));
});

it('does not load academic data without View and Add permissions', async () => {
  let requests = 0;
  mswServer.use(
    http.get('*/api/academics/timetable/teacher-availability/affected-lectures', () => {
      requests += 1;
      return HttpResponse.json({ items: [] });
    })
  );
  renderQuickSubstitution(false);
  expect(
    await screen.findByText(/Timetable View and Add permissions are required/)
  ).toBeInTheDocument();
  expect(requests).toBe(0);
});

it('shows no substitution needed when no published periods are affected', async () => {
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json(null)),
    http.get('*/api/academics/timetable/teacher-availability/affected-lectures', () =>
      HttpResponse.json({ items: [] })
    )
  );
  renderQuickSubstitution();
  expect(await screen.findByText(/No substitution needed/)).toBeInTheDocument();
});
