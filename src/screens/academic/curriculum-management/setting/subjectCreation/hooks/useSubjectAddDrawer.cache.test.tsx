import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { academicType } from 'src/redux/tagTypes';
import { it, vi, expect, afterEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { act, waitFor, renderHook } from '@testing-library/react';

import { useSubjectAddDrawer } from './useSubjectAddDrawer';

vi.hoisted(() => { process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000'; });
afterEach(() => clearCachedAuthSession());

it('reuses subject choices on reopen and refreshes them after a subject edit', async () => {
  clearCachedAuthSession();
  let reads = 0;
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json(null)),
    http.get('*/api/academic-mediums/medium-1/subjects/lookup', () => {
      reads += 1;
      return HttpResponse.json([{ id: 'subject-1', name: reads < 2 ? 'English' : 'Science' }]);
    }),
  );
  const store = configureStore({
    reducer: {
      [api.reducerPath]: api.reducer,
      globalState: () => ({ currentMedium: { id: 'medium-1' } }),
    },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
  const wrapper = ({ children }: { children: React.ReactNode }) => <Provider store={store}>{children}</Provider>;
  let probe = renderHook(() => useSubjectAddDrawer({ onClose: () => undefined }), { wrapper });
  try {
    await waitFor(() => expect(probe.result.current.getDuplicateError('English', 'another-row')).toBeTruthy());
    probe.unmount();
    probe = renderHook(() => useSubjectAddDrawer({ onClose: () => undefined }), { wrapper });
    await act(async () => { await new Promise((resolve) => setTimeout(resolve, 100)); });
    expect(reads).toBe(1);
    await act(() => { store.dispatch(api.util.invalidateTags([academicType.subject])); });
    await waitFor(() => expect(probe.result.current.getDuplicateError('Science', 'another-row')).toBeTruthy());
    expect(reads).toBe(2);
  } finally { probe.unmount(); store.dispatch(api.util.resetApiState()); }
});
