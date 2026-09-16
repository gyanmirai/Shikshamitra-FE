import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { waitFor } from '@testing-library/react';
import { it, vi, expect, describe } from 'vitest';

import { academicCalendarApi } from './academic-calendar-api';
import { lessonPlanApi } from '../CurriculumManagementApi/LessonPlanApi/lesson-plan-api';
import {
  dayId,
  dayArgs,
  dateArgs,
  planArgs,
  calendarId,
  calendarUrl,
  timelineArgs,
  calendarDayDate,
  changeCalendarDay,
  calendarMutations,
  createCalendarCacheStore,
} from './calendar-cache-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

describe('calendar markers refresh curriculum date rules', () => {
  it.each(calendarMutations)(
    '$action refreshes date checking, calendar days, plans, and timeline',
    async ({ action, method, path }) => {
      let blocked = action === 'delete' || action === 'cancelClosure';
      const initialBlocked = blocked;
      const day = { id: dayId, date: calendarDayDate, dayType: 2, title: 'Holiday' };
      const calendarPath = `${calendarUrl}/calendars/${calendarId}/days`;
      const checkPath = `${calendarUrl}/calendar/check-date`;
      const planPath = `${calendarUrl}/curriculum/lesson-plans`;
      const timelinePath = `${planPath}/timeline`;
      mswServer.use(
        http.get('*/api/auth/session', () => HttpResponse.json(null)),
        http.get(calendarPath, () => HttpResponse.json({ items: blocked ? [day] : [] })),
        http.get(checkPath, () =>
          HttpResponse.json({ isAllowed: !blocked, date: calendarDayDate })
        ),
        http.get(planPath, () =>
          HttpResponse.json({ items: [{ id: 'plan-one', isNonWorkingDay: blocked }] })
        ),
        http.get(timelinePath, () => HttpResponse.json({ slots: [], isNonWorkingDay: blocked })),
        http.all(`${calendarUrl}${path}`, ({ request }) => {
          if (request.method !== method) return undefined;
          blocked = !blocked;
          return HttpResponse.json({});
        })
      );
      const store = createCalendarCacheStore();
      const { getCalendarDays, checkDate } = academicCalendarApi.endpoints;
      const { getLessonPlans, getLessonPlanTimeline } = lessonPlanApi.endpoints;
      const subscriptions = [
        store.dispatch(getCalendarDays.initiate(dayArgs)),
        store.dispatch(checkDate.initiate(dateArgs)),
        store.dispatch(getLessonPlans.initiate(planArgs)),
        store.dispatch(getLessonPlanTimeline.initiate(timelineArgs)),
      ];
      try {
        await Promise.all(subscriptions.map((query) => query.unwrap()));
        expect(checkDate.select(dateArgs)(store.getState()).data?.isAllowed).toBe(!initialBlocked);
        await changeCalendarDay(store, action);
        await waitFor(() => {
          expect(getCalendarDays.select(dayArgs)(store.getState()).data?.items).toEqual(
            blocked ? [day] : []
          );
          expect(checkDate.select(dateArgs)(store.getState()).data?.isAllowed).toBe(!blocked);
          expect(
            getLessonPlans.select(planArgs)(store.getState()).data?.items[0].isNonWorkingDay
          ).toBe(blocked);
          expect(
            getLessonPlanTimeline.select(timelineArgs)(store.getState()).data?.isNonWorkingDay
          ).toBe(blocked);
        });
      } finally {
        subscriptions.forEach((query) => query.unsubscribe());
      }
    }
  );
});
