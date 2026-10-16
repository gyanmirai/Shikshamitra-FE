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
import { useGuidedSeatingAllocation } from './use-guided-seating-allocation';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

function setup() {
  const store = configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
  const wrapper = ({ children }: PropsWithChildren) => (
    <Provider store={store}>{children}</Provider>
  );
  const clearReadiness = vi.fn();
  return {
    store,
    clearReadiness,
    ...renderHook(() => useGuidedSeatingAllocation('exam-1', clearReadiness), { wrapper }),
  };
}

function deferred() {
  let release = () => {};
  const ready = new Promise<void>((resolve) => {
    release = resolve;
  });
  return { ready, release };
}

beforeEach(() => {
  clearCachedAuthSession();
  mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json(null)));
});

describe('guided seating loading scope', () => {
  it('keeps the form available while an automatic proposal is pending', async () => {
    const response = deferred();
    let started = false;
    const proposal = {
      assignments: [{ studentId: 'student-1', roomId: 'room-1', seatNumber: 1 }],
      unallocatedStudentIds: [],
      totalStudents: 1,
      roomsUsed: 1,
      emptySeats: 3,
      utilizationPercent: 25,
    };
    mswServer.use(
      http.post('*/api/academics/exams/exam-1/seating-plan/auto-allocate', async () => {
        started = true;
        await response.ready;
        return HttpResponse.json(proposal);
      })
    );
    const { result, store, clearReadiness } = setup();
    let pending: Promise<unknown>;
    act(() => {
      pending = result.current.generatePreview('plan-1', getInitialValues());
    });
    await waitFor(() => expect(started).toBe(true));
    expect(result.current.preview).toBeUndefined();
    expect(result.current.isBusy).toBe(false);
    await act(async () => {
      response.release();
      await pending;
    });
    expect(result.current.preview).toEqual(proposal);
    expect(result.current.isBusy).toBe(false);
    expect(clearReadiness).not.toHaveBeenCalled();
    act(() => store.dispatch(api.util.resetApiState()));
  });

  it.each([200, 500])(
    'blocks during an actual draft save and recovers after HTTP %s',
    async (status) => {
      const response = deferred();
      let started = false;
      mswServer.use(
        http.put('*/api/academics/exams/exam-1/seating-plan', async () => {
          started = true;
          await response.ready;
          return HttpResponse.json(
            status === 200 ? { version: 'draft-v1' } : { detail: 'Draft save unavailable' },
            { status }
          );
        })
      );
      const { result, store, clearReadiness } = setup();
      let pending: Promise<string>;
      act(() => {
        pending = result.current.saveRooms('plan-1', getInitialValues()).then(
          () => 'saved',
          () => 'failed'
        );
      });
      await waitFor(() => {
        expect(started).toBe(true);
        expect(result.current.isBusy).toBe(true);
      });
      await act(async () => {
        response.release();
        expect(await pending).toBe(status === 200 ? 'saved' : 'failed');
      });
      expect(result.current.isBusy).toBe(false);
      expect(result.current.version).toBe(status === 200 ? 'draft-v1' : undefined);
      expect(clearReadiness).toHaveBeenCalledTimes(status === 200 ? 1 : 0);
      act(() => store.dispatch(api.util.resetApiState()));
    }
  );
});
