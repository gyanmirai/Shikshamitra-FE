import type { PropsWithChildren } from 'react';

import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, describe, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { act, waitFor, renderHook } from '@testing-library/react';

import { getInitialValues } from '../workflow-config';
import { getAutomaticPreviewKey, useGuidedSeatingPreview } from './use-guided-seating-preview';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

function proposal(roomId: string) {
  return {
    assignments: [{ studentId: 'student-1', roomId, seatNumber: 1 }],
    unallocatedStudentIds: [],
    totalStudents: 1,
    roomsUsed: 1,
    emptySeats: 3,
    utilizationPercent: 25,
  };
}

function setup() {
  const store = configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
  const wrapper = ({ children }: PropsWithChildren) => (
    <Provider store={store}>{children}</Provider>
  );
  return { store, ...renderHook(() => useGuidedSeatingPreview('exam-1'), { wrapper }) };
}

beforeEach(() => {
  clearCachedAuthSession();
  mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json(null)));
});

describe('automatic seating request ordering', () => {
  it.each(['room-3', 'room-1'])(
    'keeps the latest selected room %s when an older proposal finishes last',
    async (latestRoom) => {
      let releaseOlder = () => {};
      const olderReady = new Promise<void>((resolve) => {
        releaseOlder = resolve;
      });
      let olderStarted = false;
      const requestedRooms: string[] = [];
      mswServer.use(
        http.post(
          '*/api/academics/exams/exam-1/seating-plan/auto-allocate',
          async ({ request }) => {
            const { roomIds } = (await request.json()) as { roomIds: string[] };
            const roomId = roomIds[0];
            requestedRooms.push(roomId);
            if (roomId === 'room-2') {
              olderStarted = true;
              await olderReady;
            }
            return HttpResponse.json(proposal(roomId));
          }
        )
      );
      const { result, store } = setup();
      const values = { ...getInitialValues(), selectedRoomIds: ['room-1'] };
      await act(() => result.current.generatePreview('plan-1', values));
      let pendingOlder: Promise<unknown>;
      act(() => {
        pendingOlder = result.current.generatePreview('plan-1', {
          ...values,
          selectedRoomIds: ['room-2'],
        });
      });
      await waitFor(() => expect(olderStarted).toBe(true));
      const latestValues = { ...values, selectedRoomIds: [latestRoom] };
      await act(() => result.current.generatePreview('plan-1', latestValues));
      expect(result.current.preview).toEqual(proposal(latestRoom));
      await act(async () => {
        releaseOlder();
        await pendingOlder;
      });
      expect(result.current.preview).toEqual(proposal(latestRoom));
      expect(result.current.previewKey).toBe(getAutomaticPreviewKey('plan-1', latestValues));
      expect(requestedRooms).toEqual(
        latestRoom === 'room-1' ? ['room-1', 'room-2'] : ['room-1', 'room-2', 'room-3']
      );
      act(() => store.dispatch(api.util.resetApiState()));
    }
  );
});
