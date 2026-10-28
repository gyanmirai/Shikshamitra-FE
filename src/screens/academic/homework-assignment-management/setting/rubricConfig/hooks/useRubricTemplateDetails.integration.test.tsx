// @vitest-environment jsdom

import type { PropsWithChildren } from 'react';

import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { vi, it, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { act, renderHook } from '@testing-library/react';

import { useRubricTemplateDetails } from './useRubricTemplateDetails';

vi.hoisted(() => vi.stubEnv('NEXT_PUBLIC_API_URL', 'http://localhost:4198'));

it('fetches full criteria only when opening a template, and reuses the same valid cached detail', async () => {
  let reads = 0;
  mswServer.use(
    http.get(/\/api\/auth\/session$/, () => HttpResponse.json(null)),
    http.get('http://localhost:4198/api/academic/rubrics/template', () => {
      reads += 1;
      return HttpResponse.json({ id: 'template', criteria: [{ title: 'Accuracy', teacherGuidance: 'Saved guidance' }] });
    })
  );
  const store = configureStore({
    reducer: { [api.reducerPath]: api.reducer, globalState: () => ({ currentMedium: { id: 'medium' } }) },
    middleware: getDefault => getDefault().concat(api.middleware),
  });
  const wrapper = ({ children }: PropsWithChildren) => <Provider store={store}>{children}</Provider>;
  const { result } = renderHook(useRubricTemplateDetails, { wrapper });
  const open = vi.fn();
  expect(reads).toBe(0);
  await act(async () => result.current.openDetail('template', open));
  expect(reads).toBe(1);
  expect(open.mock.calls[0][0].criteria[0].teacherGuidance).toBe('Saved guidance');
  await act(async () => result.current.openDetail('template', open));
  expect(reads).toBe(1);
  expect(open).toHaveBeenCalledTimes(2);
});
