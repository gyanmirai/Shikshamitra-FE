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
import { useGuidedSeatingPreview } from './use-guided-seating-preview';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

const proposal = {
  assignments: [{ studentId: 'student-1', roomId: 'room-1', seatNumber: 1 }],
  unallocatedStudentIds: [],
  totalStudents: 1,
  roomsUsed: 1,
  emptySeats: 3,
  utilizationPercent: 25,
};

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

describe('automatic seating proposal requests', () => {
  it('shares concurrent requests and reuses the exact proposal when continuing to Review', async () => {
    let requests = 0;
    mswServer.use(
      http.post('*/api/academics/exams/exam-1/seating-plan/auto-allocate', () => {
        requests += 1;
        return HttpResponse.json(proposal);
      })
    );
    const { result, store } = setup();
    const values = { ...getInitialValues(), selectedRoomIds: ['room-1'] };
    await act(async () => {
      const first = result.current.generatePreview('plan-1', values);
      expect(result.current.generatePreview('plan-1', values)).toBe(first);
      await first;
    });
    await act(() => result.current.generatePreview('plan-1', values));
    expect(requests).toBe(1);
    expect(result.current.preview).toEqual(proposal);
    await act(() => result.current.generatePreview('plan-1', { ...values, leaveGap: true }));
    expect(requests).toBe(2);
    act(() => store.dispatch(api.util.resetApiState()));
  });

  it('ignores a late automatic response after switching to manual mode', async () => {
    let release = () => {};
    const responseReady = new Promise<void>((resolve) => {
      release = resolve;
    });
    let started = false;
    mswServer.use(
      http.post('*/api/academics/exams/exam-1/seating-plan/auto-allocate', async () => {
        started = true;
        await responseReady;
        return HttpResponse.json(proposal);
      })
    );
    const { result, store } = setup();
    let pending: Promise<unknown>;
    act(() => {
      pending = result.current.generatePreview('plan-1', getInitialValues());
    });
    await waitFor(() => expect(started).toBe(true));
    const manual = { ...proposal, assignments: [{ ...proposal.assignments[0], seatNumber: 3 }] };
    act(() => result.current.setManualPreview(manual));
    await act(async () => {
      release();
      await pending;
    });
    expect(result.current.preview).toEqual(manual);
    expect(result.current.previewKey).toBe('');
    act(() => store.dispatch(api.util.resetApiState()));
  });
});
