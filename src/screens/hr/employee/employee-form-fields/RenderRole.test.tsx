import { useFormik } from 'formik';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { roleType } from 'src/redux/tagTypes';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { vi, it, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { act, render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';

import { RenderRole } from './RenderRole';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

const path = '*/api/employees/assignable-roles';
const teacher = {
  id: 'teacher', name: 'Teacher', roleAudience: 'Employee',
  employeeGroupAudience: 'Teaching', employeeOnboardingAssignable: true,
};
const createStore = () => configureStore({
  reducer: { [api.reducerPath]: api.reducer },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
});
let store: ReturnType<typeof createStore>;

function RoleForm({ employeeGroup = 0 }: { employeeGroup?: number }) {
  const formik = useFormik({ initialValues: { employeeGroup, role: 'teacher' }, onSubmit: () => undefined });
  return <>
    <RenderRole formik={formik} />
    <output aria-label="Selected role">{formik.values.role}</output>
    <button type="button" onClick={() => formik.setFieldValue('employeeGroup', 1)}>
      Change to non-teaching
    </button>
  </>;
}

function setup() {
  return render(<Provider store={store}><RoleForm /></Provider>);
}

beforeEach(() => {
  clearCachedAuthSession();
  store = createStore();
  mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json({ accessToken: 'staff-token' })));
});
afterEach(() => {
  cleanup();
  store.dispatch(api.util.resetApiState());
  clearCachedAuthSession();
});

it('loads staff role choices from the staff lookup and retains group filtering', async () => {
  const reads: string[] = [];
  mswServer.use(http.get(path, ({ request }) => {
    reads.push(new URL(request.url).pathname);
    return HttpResponse.json({ items: [teacher, { ...teacher, id: 'admin', name: 'Admin' }] });
  }));
  setup();
  await waitFor(() => expect(screen.getByRole('combobox')).toHaveValue('Teacher'));
  fireEvent.mouseDown(screen.getByRole('combobox'));
  expect(await screen.findByRole('option', { name: 'Teacher' })).toBeVisible();
  expect(screen.queryByRole('option', { name: 'Admin' })).not.toBeInTheDocument();
  expect(reads).toEqual(['/api/employees/assignable-roles']);
  fireEvent.click(screen.getByRole('button', { name: 'Change to non-teaching' }));
  await waitFor(() => expect(screen.getByLabelText('Selected role').textContent).toBe(''));
});

it('shows role-specific access guidance without clearing the entered role on a denied lookup', async () => {
  mswServer.use(http.get(path, () => HttpResponse.json({ detail: 'Forbidden' }, { status: 403 })));
  setup();
  expect(await screen.findByText(/Staff role access is unavailable/)).toBeVisible();
  expect(screen.getByRole('combobox')).toBeDisabled();
  expect(screen.getByLabelText('Selected role')).toHaveTextContent('teacher');
  expect(screen.queryByText("You don't have permission to access this resource.")).not.toBeInTheDocument();
});

it('offers retry for a failed lookup and preserves the role until recovery', async () => {
  let reads = 0;
  mswServer.use(http.get(path, () => {
    reads += 1;
    return reads === 1
      ? HttpResponse.json({ detail: 'Unavailable' }, { status: 503 })
      : HttpResponse.json({ items: [teacher] });
  }));
  setup();
  expect(await screen.findByText('Staff roles could not be loaded. Try again.')).toBeVisible();
  expect(screen.getByLabelText('Selected role')).toHaveTextContent('teacher');
  fireEvent.click(screen.getByRole('button', { name: 'Retry staff roles' }));
  await waitFor(() => expect(screen.getByRole('combobox')).toHaveValue('Teacher'));
  expect(screen.getByRole('combobox')).toBeEnabled();
  expect(screen.queryByRole('button', { name: 'Retry staff roles' })).not.toBeInTheDocument();
});

it('does not erase the selected role after a failed refetch with stale cached options', async () => {
  let denied = false;
  mswServer.use(http.get(path, () => denied
    ? HttpResponse.json({ detail: 'Forbidden' }, { status: 403 })
    : HttpResponse.json({ items: [teacher] })));
  setup();
  await waitFor(() => expect(screen.getByRole('combobox')).toHaveValue('Teacher'));
  denied = true;
  await act(async () => { store.dispatch(api.util.invalidateTags([roleType.role])); });
  expect(await screen.findByText(/Staff role access is unavailable/)).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Change to non-teaching' }));
  expect(screen.getByLabelText('Selected role')).toHaveTextContent('teacher');
});
