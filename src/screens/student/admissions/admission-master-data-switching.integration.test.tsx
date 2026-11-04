import { useState } from 'react';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import userEvent from '@testing-library/user-event';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { act, render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react';

import AdmissionRuntimeField from './admission-runtime-field';
import { dependentAdmissionFieldValues } from './admission-field-dependencies';
import { addAcademicClassSelector } from './form-dialog/academic-class-selector';
import { getBlankAdmissionFormInitialValues } from './form-dialog/form-dialog-model';
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

it('queries the explicit Board → Medium → Class group, resets descendants and restores saved answers without duplicate companions', async () => {
  const reads: {source: string | null; parent: string | null; year: string | null}[] = [];
  mswServer.use(http.get(url, ({ request }) => {
    const params = new URL(request.url).searchParams;
    const source = params.get('sourceKey'); const parent = params.get('parentId');
    reads.push({source, parent, year: params.get('academicYearId')});
    const options = source === 'EducationBoards' ? [...choices('board-a'), ...choices('board-b')]
      : source === 'EducationMediums' ? choices(parent === 'board-a' ? 'medium-a' : 'medium-b')
        : choices(parent === 'medium-a' ? 'class-a' : 'class-b');
    return HttpResponse.json({data: options});
  }));
  const academicFields = addAcademicClassSelector(getBlankAdmissionFormInitialValues(0), null).form.sections
    .flatMap(section => section.fields).filter(item => item.optionsJson?.includes('"source"'));
  let saved = {BOARD: 'board-a', MEDIUM: 'medium-a', CLASS: 'class-a'} as Record<string, string>;
  function Form() {
    const [values, setValues] = useState(saved);
    return <>{academicFields.map(item => <AdmissionRuntimeField key={item.id} field={item} value={values[item.code] || ''}
      formValues={values} disabled={false} onChange={next => setValues(current => {
        saved = {...current, [item.code]: next, ...dependentAdmissionFieldValues(academicFields, item.code, current)};
        return saved;
      })} />)}<output data-testid="academic-values">{JSON.stringify(values)}</output></>;
  }
  const tree = () => <Provider store={store}><Form /></Provider>;
  const rendered = render(tree());
  const user = userEvent.setup();
  await waitFor(() => expect(screen.getByRole('combobox', {name: 'Class'})).not.toHaveAttribute('aria-disabled', 'true'));
  expect(screen.getAllByRole('combobox')).toHaveLength(3);
  await user.click(screen.getByRole('combobox', {name: 'Board'}));
  await user.click(await screen.findByRole('option', {name: 'board-b'}));
  expect(saved).toEqual({BOARD: 'board-b', MEDIUM: '', CLASS: ''});
  expect(screen.getByRole('combobox', {name: 'Class'})).toHaveAttribute('aria-disabled', 'true');
  await waitFor(() => expect(screen.getByRole('combobox', {name: 'Medium'})).not.toHaveAttribute('aria-disabled', 'true'));
  await user.click(screen.getByRole('combobox', {name: 'Medium'}));
  await user.click(await screen.findByRole('option', {name: 'medium-b'}));
  await waitFor(() => expect(screen.getByRole('combobox', {name: 'Class'})).not.toHaveAttribute('aria-disabled', 'true'));
  await user.click(screen.getByRole('combobox', {name: 'Class'}));
  await user.click(await screen.findByRole('option', {name: 'class-b'}));
  expect(saved).toEqual({BOARD: 'board-b', MEDIUM: 'medium-b', CLASS: 'class-b'});
  expect(reads).toContainEqual({source: 'EducationBoards', parent: null, year: 'year'});
  expect(reads).toContainEqual({source: 'EducationMediums', parent: 'board-b', year: 'year'});
  expect(reads).toContainEqual({source: 'StandardsByMedium', parent: 'medium-b', year: 'year'});
  rendered.unmount();
  render(tree());
  await waitFor(() => expect(screen.getByRole('combobox', {name: 'Class'})).toHaveTextContent('class-b'));
  expect(screen.getAllByRole('combobox')).toHaveLength(3);
});

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
