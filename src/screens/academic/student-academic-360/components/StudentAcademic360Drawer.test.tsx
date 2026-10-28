import { Provider } from 'react-redux';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, describe } from 'vitest';
import { _api as iconifyApi } from '@iconify/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { AppRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { studentAcademic360Api } from 'src/redux/academicAPI/StudentAcademic360Api/studentAcademic360Api';

import { StudentAcademic360Drawer } from './StudentAcademic360Drawer';

describe('Student Academic 360 drawer history', () => {
  it('bounds the overview and requests the next server page of learning history', async () => {
    clearCachedAuthSession();
    iconifyApi.setFetch(globalThis.fetch);
    const requests: URL[] = [];
    mswServer.use(
      http.get('*/api/auth/session', () => HttpResponse.json(null)),
      http.get(/https:\/\/.*iconify\.design\/.*/, () => HttpResponse.json({ prefix: 'mdi', icons: {}, not_found: [] })),
      http.get('*/api/academics/student-academic-360/student-1/tabs/:tab', ({ request }) => {
        requests.push(new URL(request.url));
        return HttpResponse.json({
          student: { studentId: 'student-1', studentName: 'Academic Student' },
          learningTasks: { totalAssigned: 26, tasks: [], recentTasks: [] },
          exams: [], examTotalCount: 14,
        });
      })
    );
    const api = studentAcademic360Api;
    const store = configureStore({
      reducer: { [api.reducerPath]: api.reducer, globalState: () => ({}), confirmPopup: () => ({ isChanges: false }) },
      middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
    });
    const student = { studentId: 'student-1', studentName: 'Academic Student' };
    const view = render(
      <Provider store={store}>
        <ThemeProvider theme={createTheme(defaultSettings)}>
        <AppRouterContext.Provider value={{ bfcacheId: 'academic-history', back: vi.fn(), forward: vi.fn(), refresh: vi.fn(), push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }}>
        <StudentAcademic360Drawer open student={student} students={[student]}
          standardId="class-1" divisionId="division-1" onStudentChange={vi.fn()} onClose={vi.fn()} />
        </AppRouterContext.Provider>
        </ThemeProvider>
      </Provider>
    );
    try {
      await waitFor(() => expect(requests).toHaveLength(1));
      expect(requests[0].searchParams.get('taskMaxResultCount')).toBe('10');
      expect(requests[0].searchParams.get('examMaxResultCount')).toBe('5');
      fireEvent.click(screen.getByRole('tab', { name: 'Learning' }));
      await waitFor(() => expect(requests).toHaveLength(2));
      fireEvent.click(await screen.findByRole('button', { name: 'Go to next page' }));
      await waitFor(() => expect(requests).toHaveLength(3));
      expect(requests[2].searchParams.get('taskSkipCount')).toBe('20');
      expect(requests[2].searchParams.get('taskMaxResultCount')).toBe('20');
      fireEvent.click(await screen.findByRole('button', { name: 'Pending' }));
      await waitFor(() => expect(requests).toHaveLength(4));
      expect(requests[3].searchParams.get('taskStatusFilter')).toBe('PENDING');
      expect(requests[3].searchParams.get('taskSkipCount')).toBe('0');
      fireEvent.click(screen.getByRole('tab', { name: 'Exams' }));
      await waitFor(() => expect(requests).toHaveLength(5));
      const search = await screen.findByPlaceholderText('Search exam or subject...');
      search.focus();
      fireEvent.change(search, { target: { value: 'Older exam' } });
      await waitFor(() => expect(requests).toHaveLength(6));
      expect(requests[5].searchParams.get('examSearchTerm')).toBe('Older exam');
      expect(search).toHaveFocus();
    } finally {
      view.unmount();
      store.dispatch(api.util.resetApiState());
    }
  });
});
