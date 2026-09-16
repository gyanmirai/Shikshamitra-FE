import { api } from 'src/redux/service';
import { configureStore } from '@reduxjs/toolkit';

import { academicCalendarApi } from './academic-calendar-api';

export const calendarId = 'calendar-one';
export const dayId = 'holiday-one';
export const calendarDayDate = '2026-09-14T00:00:00+05:30';
export const dayArgs = { calendarId };
export const dateArgs = { date: calendarDayDate, validationType: 'LessonPlan' };
export const timelineArgs = { date: calendarDayDate, teacherId: 'teacher-one' };
export const planArgs = { plannedDate: calendarDayDate };
export const calendarUrl = '*/api/academic';
export const createCalendarCacheStore = () =>
  configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });

export const calendarMutations = [
  { action: 'delete', method: 'DELETE', path: `/calendar-days/${dayId}` },
  { action: 'update', method: 'PUT', path: `/calendar-days/${dayId}` },
  { action: 'create', method: 'POST', path: `/calendars/${calendarId}/days` },
  { action: 'bulk', method: 'POST', path: `/calendars/${calendarId}/days/bulk` },
  { action: 'createClosure', method: 'POST', path: '/calendar-days/emergency-closure' },
  { action: 'updateClosure', method: 'PUT', path: `/calendar-days/${dayId}/emergency-closure` },
  {
    action: 'cancelClosure',
    method: 'POST',
    path: `/calendar-days/${dayId}/cancel-emergency-closure`,
  },
] as const;

export function changeCalendarDay(
  store: ReturnType<typeof createCalendarCacheStore>,
  action: (typeof calendarMutations)[number]['action']
) {
  const body = { date: calendarDayDate, title: 'Calendar marker', dayType: 2 };
  const {endpoints} = academicCalendarApi;
  const mutations = {
    delete: () => store.dispatch(endpoints.deleteCalendarDay.initiate(dayId)).unwrap(),
    update: () =>
      store.dispatch(endpoints.updateCalendarDay.initiate({ id: dayId, body })).unwrap(),
    create: () =>
      store.dispatch(endpoints.createCalendarDay.initiate({ calendarId, body })).unwrap(),
    bulk: () =>
      store.dispatch(endpoints.createCalendarDaysBulk.initiate({ calendarId, body })).unwrap(),
    createClosure: () => store.dispatch(endpoints.createEmergencyClosure.initiate(body)).unwrap(),
    updateClosure: () =>
      store.dispatch(endpoints.updateEmergencyClosure.initiate({ id: dayId, body })).unwrap(),
    cancelClosure: () => store.dispatch(endpoints.cancelEmergencyClosure.initiate(dayId)).unwrap(),
  };
  return mutations[action]();
}
