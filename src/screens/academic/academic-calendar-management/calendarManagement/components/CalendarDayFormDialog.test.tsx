import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { DayType, CalendarStatus } from 'src/enums/academic-calendar';

import CalendarDayFormDialog from './CalendarDayFormDialog';
import {
  calendarId,
  calendarUrl,
  renderCalendarForm,
  prepareCalendarFormNetwork,
} from './calendar-date-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

const editData = {
  id: 'exam-marker',
  dayType: DayType.Exam,
  date: '2026-10-01T00:00:00+05:30',
  title: 'Oral exam (Science)',
  examTypeId: 'oral',
  linkedExamId: 'exam-one',
  appliesToAll: false,
  standardIds: ['class-ten'],
  examStartTime: '11:00:00',
  examEndTime: '12:00:00',
};

beforeEach(async () => {
  await prepareCalendarFormNetwork();
  mswServer.use(
    http.get('*/api/academics/examination/settings/exam-type', () =>
      HttpResponse.json({ items: [{ id: 'oral', examType: 'Oral Exam' }] })
    ),
    http.get('*/api/academics/exams', () =>
      HttpResponse.json({
        items: [
          {
            id: 'exam-one',
            examName: 'Oral exam for two subjects',
            examTypeId: 'oral',
            standardId: 'class-ten',
            standardName: 'Class 10',
          },
        ],
      })
    ),
    http.get('*/api/academics/exams/exam-one/schedule', () => HttpResponse.json({ subjects: [] }))
  );
});

describe('editing a linked exam calendar marker', () => {
  it('remains editable and saves after linked exam options load', async () => {
    const payloads: Record<string, unknown>[] = [];
    const onClose = vi.fn();
    mswServer.use(
      http.put(`${calendarUrl}/calendar-days/exam-marker`, async ({ request }) => {
        payloads.push((await request.json()) as Record<string, unknown>);
        return HttpResponse.json({ id: editData.id });
      })
    );
    renderCalendarForm(
      <CalendarDayFormDialog
        open
        onClose={onClose}
        calendarId={calendarId}
        calendarStatus={CalendarStatus.Draft}
        editData={editData}
      />
    );
    await screen.findByText(/Class: Class 10/);
    fireEvent.change(screen.getByRole('textbox', { name: 'Title *' }), {
      target: { value: 'Updated oral exam (Science)' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Update Day' }));
    await waitFor(() => expect(payloads).toHaveLength(1));
    expect(payloads[0]).toMatchObject({
      title: 'Updated oral exam (Science)',
      linkedExamId: 'exam-one',
      standardIds: ['class-ten'],
      examStartTime: '11:00:00',
      examEndTime: '12:00:00',
    });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('can close an unchanged marker after linked exam options load', async () => {
    const onClose = vi.fn();
    renderCalendarForm(
      <CalendarDayFormDialog
        open
        onClose={onClose}
        calendarId={calendarId}
        calendarStatus={CalendarStatus.Draft}
        editData={editData}
      />
    );
    await screen.findByText(/Class: Class 10/);
    fireEvent.click(screen.getByRole('button', { name: 'close' }));
    expect(onClose).toHaveBeenCalledOnce();
  });
});
