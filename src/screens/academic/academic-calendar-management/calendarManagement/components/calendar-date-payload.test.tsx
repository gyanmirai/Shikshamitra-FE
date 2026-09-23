import dayjs from 'dayjs';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { datePickerToDateTimeOffset } from 'src/utils/dateConvertor';
import { DayType, CalendarStatus } from 'src/enums/academic-calendar';

import CalendarBuilderForm from './CalendarBuilderForm';
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
beforeEach(prepareCalendarFormNetwork);
const selectedDay = dayjs('2026-09-15');
const selectedEnd = dayjs('2026-09-17');

describe('calendar form DateTimeOffset payloads', () => {
  it('creates a calendar marker using the selected local day and shared offset serializer', async () => {
    const payloads: Record<string, unknown>[] = [];
    mswServer.use(
      http.post(`${calendarUrl}/calendars/${calendarId}/days`, async ({ request }) => {
        payloads.push((await request.json()) as Record<string, unknown>);
        return HttpResponse.json({ id: 'day-one' });
      })
    );
    renderCalendarForm(
      <CalendarDayFormDialog
        open
        onClose={() => {}}
        calendarId={calendarId}
        calendarStatus={CalendarStatus.Draft}
        prefillDate={selectedDay.hour(14).toISOString()}
      />
    );
    fireEvent.mouseDown(screen.getByRole('combobox'));
    fireEvent.click(await screen.findByRole('option', { name: 'Holiday' }));
    const selects = screen.getAllByRole('combobox');
    expect(selects).toHaveLength(2);
    fireEvent.mouseDown(selects[1]);
    fireEvent.click(await screen.findByRole('option', { name: 'National' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'Title *' }), {
      target: { value: 'School holiday' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Add Day' }));
    await waitFor(() => expect(payloads).toHaveLength(1));
    expect(payloads[0]).toMatchObject({
      date: datePickerToDateTimeOffset(selectedDay),
      endDate: null,
    });
  });

  it('updates vacation start and end dates without carrying UTC dates or time of day into the request', async () => {
    const payloads: Record<string, unknown>[] = [];
    mswServer.use(
      http.put(`${calendarUrl}/calendar-days/day-one`, async ({ request }) => {
        payloads.push((await request.json()) as Record<string, unknown>);
        return HttpResponse.json({ id: 'day-one' });
      })
    );
    renderCalendarForm(
      <CalendarDayFormDialog
        open
        onClose={() => {}}
        calendarId={calendarId}
        calendarStatus={CalendarStatus.Draft}
        editData={{
          id: 'day-one',
          title: 'School vacation',
          dayType: DayType.Vacation,
          date: selectedDay.hour(14).toISOString(),
          endDate: selectedEnd.hour(10).toISOString(),
        }}
      />
    );
    expect(screen.getByRole('textbox', { name: 'Vacation dates *' })).toHaveValue(
      '15/09/2026 - 17/09/2026'
    );
    fireEvent.click(screen.getByRole('button', { name: 'Update Day' }));
    await waitFor(() => expect(payloads).toHaveLength(1));
    expect(payloads[0]).toMatchObject({
      date: datePickerToDateTimeOffset(selectedDay),
      endDate: datePickerToDateTimeOffset(selectedEnd),
    });
  });

  it('uses the same local-midnight offset serializer for calendar boundaries', async () => {
    const payloads: Record<string, unknown>[] = [];
    mswServer.use(
      http.put(`${calendarUrl}/calendars/${calendarId}`, async ({ request }) => {
        payloads.push((await request.json()) as Record<string, unknown>);
        return HttpResponse.json({ id: calendarId });
      })
    );
    renderCalendarForm(
      <CalendarBuilderForm
        onSuccess={() => {}}
        onClose={() => {}}
        editData={{
          id: calendarId,
          academicMediumId: 'medium-one',
          name: 'School calendar',
          startDate: selectedDay.hour(14).toISOString(),
          endDate: selectedEnd.hour(10).toISOString(),
        }}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: 'Update Calendar' }));
    await waitFor(() => expect(payloads).toHaveLength(1));
    expect(payloads[0]).toMatchObject({
      startDate: datePickerToDateTimeOffset(selectedDay),
      endDate: datePickerToDateTimeOffset(selectedEnd),
    });
  });
});
