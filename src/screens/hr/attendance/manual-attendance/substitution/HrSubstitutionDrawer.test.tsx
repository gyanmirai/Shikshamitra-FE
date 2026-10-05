import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { screen, waitFor, fireEvent } from '@testing-library/react';

import { renderHrSubstitution } from './hr-substitution-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

it('waits for successful attendance persistence before loading absence and periods', async () => {
  let finishSave: () => void = () => {};
  const pendingSave = new Promise<void>((resolve) => {
    finishSave = resolve;
  });
  let saved = false;
  let availabilityReads = 0;
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json(null)),
    http.post('*/api/hr/attendance/take-attendance/day/save', async () => {
      await pendingSave;
      saved = true;
      return HttpResponse.json({ upsertedCount: 1 });
    }),
    http.get('*/api/academics/timetable/teacher-availability', ({ request }) => {
      availabilityReads += 1;
      expect(saved).toBe(true);
      expect(new URL(request.url).searchParams.get('teacherId')).toBe('original-1');
      return HttpResponse.json({
        totalCount: 1,
        items: [
          {
            id: 'absence-1',
            teacherId: 'original-1',
            teacherName: 'Absent Teacher',
            departmentName: 'Academic',
            startTime: '08:00',
            endTime: '15:00',
            reason: 'Absent',
            isFullDay: true,
          },
        ],
      });
    }),
    http.get('*/api/academics/timetable/teacher-availability/affected-lectures', ({ request }) => {
      expect(new URL(request.url).searchParams.get('startTime')).toBe('08:00');
      return HttpResponse.json({ items: [] });
    })
  );
  renderHrSubstitution();
  fireEvent.click(
    screen.getByRole('button', {
      name: 'Save attendance and arrange substitution for Absent Teacher',
    })
  );
  await waitFor(() => expect(screen.getByRole('button')).toBeDisabled());
  expect(availabilityReads).toBe(0);
  finishSave();
  expect(await screen.findByText(/No substitution needed/)).toBeInTheDocument();
  expect(screen.getByText(/08:00–15:00/)).toBeInTheDocument();
});

it('keeps the drawer closed when attendance saving fails', async () => {
  let absenceReads = 0;
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json(null)),
    http.post('*/api/hr/attendance/take-attendance/day/save', () =>
      HttpResponse.json({ detail: 'Day is locked' }, { status: 409 })
    ),
    http.get('*/api/academics/timetable/teacher-availability', () => {
      absenceReads += 1;
      return HttpResponse.json({ items: [] });
    })
  );
  renderHrSubstitution();
  fireEvent.click(screen.getByRole('button'));
  await waitFor(() => expect(screen.getByRole('button')).toBeEnabled());
  expect(absenceReads).toBe(0);
  expect(screen.queryByText('Arrange substitution')).not.toBeInTheDocument();
});
