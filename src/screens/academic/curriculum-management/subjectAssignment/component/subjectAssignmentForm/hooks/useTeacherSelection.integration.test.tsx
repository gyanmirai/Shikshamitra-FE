import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, expect, afterEach } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { act, renderHook } from '@testing-library/react';
import { clearCachedAuthSession } from 'src/redux/session-cache';

import { useTeacherSelection } from './useTeacherSelection';

afterEach(() => clearCachedAuthSession());

it('queries the selected class after class changes and skips an empty class', async () => {
  clearCachedAuthSession();
  const requests: URL[] = [];
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json(null)),
    http.get('*/api/employees', ({ request }) => {
      const url = new URL(request.url);
      requests.push(url);
      return HttpResponse.json({
        currentPage: 1,
        totalPages: 1,
        items:
          url.searchParams.get('standardId') === 'class11'
            ? [{ id: 'dharmik', fullName: 'Dharmik Jinjala', employeeIdentifier: 'TEA200001' }]
            : [],
      });
    })
  );
  const store = configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
  const { result, rerender } = renderHook(
    ({ standardId }) => useTeacherSelection({ teacherIds: [], standardId }),
    {
      initialProps: { standardId: 'nursery' },
      wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
    }
  );
  await act(async () => {
    expect(await result.current.fetchTeacherOptions('', 1)).toEqual({ data: [], hasMore: false });
  });
  rerender({ standardId: 'class11' });
  await act(async () => {
    const response = await result.current.fetchTeacherOptions('Dharmik', 1);
    expect(response.data[0].label).toBe('TEA200001 - Dharmik Jinjala');
  });
  expect(requests.map((url) => url.searchParams.get('standardId'))).toEqual(['nursery', 'class11']);
  expect(requests[1].searchParams.get('isTeaching')).toBe('true');
  expect(requests[1].searchParams.get('status')).toBe('Active');
  rerender({ standardId: '' });
  await act(async () => {
    expect(await result.current.fetchTeacherOptions('', 1)).toEqual({ data: [], hasMore: false });
  });
  expect(requests).toHaveLength(2);
  store.dispatch(api.util.resetApiState());
});
