import { Provider } from 'react-redux';
import { http, HttpResponse } from 'msw';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, beforeEach, afterEach } from 'vitest';
import { act, render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react';

import { api } from 'src/redux/service';
import { mswServer } from 'src/test/mswServer';
import { clearCachedAuthSession } from 'src/redux/session-cache';

import { AdmissionMasterDataRuntimeField } from './admission-master-data-runtime-field';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});
vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { error: vi.fn(), warning: vi.fn(), success: vi.fn() },
}));

const createStore = () => configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    globalState: () => ({ currentYear: { id: 'year' } }),
    auth: () => ({ permissions: [] }),
  },
  middleware: (defaults) => defaults().concat(api.middleware),
});
let store: ReturnType<typeof createStore>;
beforeEach(() => {
  clearCachedAuthSession();
  store = createStore();
  mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json(null)));
});
afterEach(() => {
  cleanup();
  store.dispatch(api.util.resetApiState());
  clearCachedAuthSession();
});

const field = {
  code: 'DIVISION', label: 'Division', fieldType: 6, required: false, readOnly: false,
  optionsJson: '{"source":"DivisionsByStandard","parentField":"CLASS"}',
};
const view = (standardId: string) => (
  <Provider store={store}>
    <AdmissionMasterDataRuntimeField field={field} value="" disabled={false}
      formValues={{ CLASS: standardId }} onChange={vi.fn()} />
  </Provider>
);
const url = '*/api/student/enrollment/admissions/forms/metadata/options';
const choices = (label: string) => [{ value: label, label, displayOrder: 0, isActive: true }];

it('refreshes a previously empty class after switching A → B → A', async () => {
  const reads: string[] = [];
  mswServer.use(http.get(url, ({ request }) => {
    const params = new URL(request.url).searchParams;
    expect(params.has('optionsCheckId')).toBe(false);
    const id = params.get('parentId')!;
    reads.push(id);
    return HttpResponse.json({ data: id === 'class-a' && reads.length === 1 ? [] : choices(id) });
  }));
  const rendered = render(view('class-a'));
  await waitFor(() => expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-disabled', 'true'));
  rendered.rerender(view('class-b'));
  await waitFor(() => expect(reads).toEqual(['class-a', 'class-b']));
  await waitFor(() => expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-disabled', 'true'));
  rendered.rerender(view('class-a'));
  await waitFor(() => expect(reads).toEqual(['class-a', 'class-b', 'class-a']));
  await waitFor(() => expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-disabled', 'true'));
  rendered.rerender(view('class-a'));
  expect(reads).toEqual(['class-a', 'class-b', 'class-a']);
});

it('does not join an earlier pending class request when switching A → B → A', async () => {
  const reads: string[] = [];
  let release!: () => void;
  const first = new Promise<void>((resolve) => { release = resolve; });
  mswServer.use(http.get(url, async ({ request }) => {
    const id = new URL(request.url).searchParams.get('parentId')!;
    reads.push(id);
    const original = reads.length === 1;
    if (original) await first;
    return HttpResponse.json({ data: choices(original ? 'Old result' : 'Latest result') });
  }));
  const rendered = render(view('class-a'));
  try {
    await waitFor(() => expect(reads).toEqual(['class-a']));
    rendered.rerender(view('class-b'));
    await waitFor(() => expect(reads).toEqual(['class-a', 'class-b']));
    rendered.rerender(view('class-a'));
    await waitFor(() => expect(reads).toEqual(['class-a', 'class-b', 'class-a']));
    await waitFor(() => expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-disabled', 'true'));
    fireEvent.mouseDown(screen.getByRole('combobox'));
    expect(await screen.findByRole('option', { name: 'Latest result' })).toBeVisible();
    await act(async () => { release(); await first; });
    expect(screen.queryByRole('option', { name: 'Old result' })).not.toBeInTheDocument();
  } finally {
    release();
  }
});
