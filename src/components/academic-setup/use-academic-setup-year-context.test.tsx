import type { PropsWithChildren } from 'react';

import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { act, waitFor, renderHook } from '@testing-library/react';
import globalState, { setCurrentYear } from 'src/redux/globalState/globalSlice';

import { useAcademicSetupWorkspace } from './use-academic-setup-workspace';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
const years = [
  { id: 'year-1', name: '2025-2026' },
  { id: 'year-2', name: '2026-2027' },
];
let requestedYears: string[];

function fixture(yearId = 'year-2') {
  const store = configureStore({
    reducer: { globalState, [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
  store.dispatch(setCurrentYear({ id: yearId }));
  const wrapper = ({ children }: PropsWithChildren) => (
    <Provider store={store}>{children}</Provider>
  );
  return { store, wrapper };
}

beforeEach(() => {
  clearCachedAuthSession();
  requestedYears = [];
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json(null)),
    http.get('*/api/app/academic-year', () => HttpResponse.json({ items: years })),
    http.get('*/api/app/education-board/hierarchy', ({ request }) => {
      const yearId = new URL(request.url).searchParams.get('academicYearId')!;
      requestedYears.push(yearId);
      return HttpResponse.json({
        items: [
          {
            id: `board-${yearId}`,
            name: 'CBSE',
            academicYearId: yearId,
            educationMediums: [],
          },
        ],
      });
    })
  );
});
afterEach(clearCachedAuthSession);

it('opens the shell academic year instead of the oldest year and never queries the wrong hierarchy', async () => {
  const setup = fixture();
  const { result, unmount } = renderHook(() => useAcademicSetupWorkspace(), setup);
  try {
    await waitFor(() => expect(result.current.tree[0]?.id).toBe('board-year-2'));
    expect(result.current.currentYear?.name).toBe('2026-2027');
    expect(requestedYears).toEqual(['year-2']);
  } finally {
    unmount();
    setup.store.dispatch(api.util.resetApiState());
  }
});

it('keeps an explicit linked year ahead of the shell year', async () => {
  const setup = fixture();
  const { result, unmount } = renderHook(() => useAcademicSetupWorkspace('year-1'), setup);
  try {
    await waitFor(() => expect(result.current.tree[0]?.id).toBe('board-year-1'));
    expect(result.current.selectedYearId).toBe('year-1');
  } finally {
    unmount();
    setup.store.dispatch(api.util.resetApiState());
  }
});

it('preserves a manually selected year when the shell context changes', async () => {
  const setup = fixture('year-1');
  const { result, unmount } = renderHook(() => useAcademicSetupWorkspace(), setup);
  try {
    await waitFor(() => expect(result.current.years).toHaveLength(2));
    act(() => result.current.selectYear('year-1'));
    act(() => setup.store.dispatch(setCurrentYear({ id: 'year-2' })));
    await waitFor(() => expect(result.current.tree[0]?.id).toBe('board-year-1'));
    expect(result.current.selectedYearId).toBe('year-1');
  } finally {
    unmount();
    setup.store.dispatch(api.util.resetApiState());
  }
});

it('uses the first permitted year when the shell year is unavailable', async () => {
  const setup = fixture('unavailable-year');
  const { result, unmount } = renderHook(() => useAcademicSetupWorkspace(), setup);
  try {
    await waitFor(() => expect(result.current.tree[0]?.id).toBe('board-year-1'));
    expect(requestedYears).toEqual(['year-1']);
  } finally {
    unmount();
    setup.store.dispatch(api.util.resetApiState());
  }
});

it('uses a late shell context until the user explicitly selects a year', async () => {
  const setup = fixture('');
  const { result, unmount } = renderHook(() => useAcademicSetupWorkspace(), setup);
  try {
    await waitFor(() => expect(result.current.tree[0]?.id).toBe('board-year-1'));
    act(() => setup.store.dispatch(setCurrentYear({ id: 'year-2' })));
    await waitFor(() => expect(result.current.tree[0]?.id).toBe('board-year-2'));
  } finally {
    unmount();
    setup.store.dispatch(api.util.resetApiState());
  }
});
