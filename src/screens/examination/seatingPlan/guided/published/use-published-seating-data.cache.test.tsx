import type { SeatingPlanGroupDto } from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocation-v2.types';

import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { act, waitFor, renderHook } from '@testing-library/react';

import { usePublishedSeatingData } from './use-published-seating-data';

vi.hoisted(() => { process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000'; });
beforeEach(() => {
  clearCachedAuthSession();
  mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json(null)));
});
afterEach(() => clearCachedAuthSession());

it('reuses a published plan roster across room switches while retaining per-room layouts and retry', async () => {
  let students = 0;
  const rooms: string[] = [];
  mswServer.use(
    http.get('*/api/academics/exams/:examId/seat-allocation/divisions/:divisionId/students', () => {
      students += 1;
      return HttpResponse.json({ items: [{ studentId: 'student-1', studentName: 'Alice', rollNo: 1 }] });
    }),
    http.get('*/api/academics/exams/:examId/seat-layout', ({ request }) => {
      const roomId = new URL(request.url).searchParams.get('RoomId') || '';
      rooms.push(roomId);
      return HttpResponse.json({ roomId, room: { capacity: 1, totalBenches: 1, benchesPerRow: 1,
        benchesPerColumn: 1, benchCapacity: 1 }, items: [] });
    }),
  );
  const plan: SeatingPlanGroupDto = {
    seatingPlanId: 'plan', name: 'Published', scopeType: 0, status: 2, isLocked: true,
    hasCompleteSchedule: true, canConfigure: false, scheduleCount: 1, subjects: [],
    divisions: [{ id: 'division', name: 'A' }], availableRooms: [], selectedRoomIds: ['one', 'two'],
    totalStudents: 1, allocatedStudents: 1, pendingStudents: 0, roomsUsed: 2, usableCapacity: 2,
    emptySeats: 1, utilization: 50, issues: [],
  };
  const store = configureStore({ reducer: { [api.reducerPath]: api.reducer }, middleware: (defaults) => defaults().concat(api.middleware) });
  const probe = renderHook(({ roomId }) => usePublishedSeatingData({ examId: 'exam', standardId: 'class', plan, roomId }), {
    initialProps: { roomId: 'one' }, wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
  });
  try {
    await waitFor(() => expect(probe.result.current.rooms[0]?.roomId).toBe('one'));
    probe.rerender({ roomId: 'two' });
    await waitFor(() => expect(probe.result.current.rooms[0]?.roomId).toBe('two'));
    probe.rerender({ roomId: 'one' });
    await waitFor(() => expect(probe.result.current.rooms[0]?.roomId).toBe('one'));
    expect(students).toBe(1);
    expect(rooms).toEqual(['one', 'two']);
    act(() => probe.result.current.retry());
    await waitFor(() => expect(students).toBe(2));
  } finally { probe.unmount(); store.dispatch(api.util.resetApiState()); }
});
