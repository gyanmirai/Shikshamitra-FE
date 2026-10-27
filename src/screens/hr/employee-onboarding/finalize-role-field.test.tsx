import { useState } from 'react';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { roleApi } from 'src/redux/role/roleApi';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { vi, it, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { act, render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';

import { FinalizeRoleField, useFinalizeRoles } from './finalize-role-field';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

const path = '*/api/identity/roles/all';
const teacher = {
  id: 'teacher',
  name: 'Teacher',
  roleAudience: 'Employee',
  employeeGroupAudience: 'Teaching',
  employeeOnboardingAssignable: true,
};
const customRole = {
  id: 'custom',
  name: 'Learning Facilitator',
  extraProperties: {
    roleAudience: 'Employee',
    employeeOnboardingAssignable: true,
    employeeGroupAudience: 'Teaching',
  },
};
const createStore = () =>
  configureStore({
    reducer: { [api.reducerPath]: api.reducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
  });
let store: ReturnType<typeof createStore>;

function RoleForm({ open = true }: { open?: boolean }) {
  const [roleId, setRoleId] = useState('teacher');
  const [group, setGroup] = useState<0 | 1>(0);
  const lookup = useFinalizeRoles(open, group, roleId);
  return (
    <>
      <FinalizeRoleField
        lookup={lookup}
        value={roleId}
        disabled={false}
        onChange={setRoleId}
        onBlur={() => undefined}
      />
      <output aria-label="Selected role">{roleId}</output>
      <button type="button" disabled={!lookup.ready || Boolean(lookup.selectionError)}>
        Continue
      </button>
      <button type="button" onClick={() => setGroup(1)}>
        Change staff group
      </button>
    </>
  );
}

const form = (open = true) => (
  <Provider store={store}>
    <RoleForm open={open} />
  </Provider>
);

beforeEach(() => {
  clearCachedAuthSession();
  store = createStore();
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json({ accessToken: 'test-token' }))
  );
});

afterEach(() => {
  cleanup();
  store.dispatch(api.util.resetApiState());
  clearCachedAuthSession();
});

it('uses Security roles, including custom metadata, and keeps all eligibility exclusions', async () => {
  mswServer.use(
    http.get(path, () =>
      HttpResponse.json({
        items: [
          teacher,
          customRole,
          { ...teacher, id: 'ops', name: 'Operations', employeeGroupAudience: 'NonTeaching' },
          { id: 'legacy', name: 'Legacy role' },
          { ...teacher, id: 'disabled', name: 'Unapproved', employeeOnboardingAssignable: false },
          ...['Admin', 'super-admin', 'Student', 'Parent'].map((name) => ({
            ...teacher,
            id: name,
            name,
          })),
          { ...teacher, id: 'student-audience', name: 'Learner', roleAudience: 'Student' },
        ],
      })
    )
  );
  render(form());
  await waitFor(() =>
    expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-disabled', 'true')
  );
  fireEvent.mouseDown(screen.getByRole('combobox'));
  expect(await screen.findByRole('option', { name: 'Learning Facilitator' })).toBeVisible();
  expect(screen.getAllByRole('option').map((option) => option.textContent)).toEqual([
    'Teacher',
    'Learning Facilitator',
  ]);
  fireEvent.click(screen.getByRole('option', { name: 'Learning Facilitator' }));
  expect(screen.getByLabelText('Selected role')).toHaveTextContent('custom');
  expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled();
  fireEvent.click(screen.getByRole('button', { name: 'Change staff group' }));
  expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
});

it('fetches on every opening and does not query while the dialog is closed', async () => {
  let reads = 0;
  mswServer.use(
    http.get(path, () => {
      reads += 1;
      return HttpResponse.json({ items: reads === 1 ? [teacher] : [teacher, customRole] });
    })
  );
  const view = render(form(false));
  expect(reads).toBe(0);
  view.rerender(form());
  await waitFor(() => expect(reads).toBe(1));
  await waitFor(() =>
    expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-disabled', 'true')
  );
  view.rerender(form(false));
  view.rerender(form());
  await waitFor(() => expect(reads).toBe(2));
  await waitFor(() =>
    expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-disabled', 'true')
  );
  fireEvent.mouseDown(screen.getByRole('combobox'));
  expect(await screen.findByRole('option', { name: 'Learning Facilitator' })).toBeVisible();
});

it.each([403, 503])(
  'blocks stale choices after a %s refresh and preserves the draft until retry',
  async (status) => {
    let responseStatus = 200;
    mswServer.use(
      http.get(path, () =>
        responseStatus === 200
          ? HttpResponse.json({ items: [teacher] })
          : HttpResponse.json({ detail: 'Unavailable' }, { status: responseStatus })
      )
    );
    render(form());
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled());
    responseStatus = status;
    fireEvent.click(screen.getByRole('button', { name: 'Refresh roles' }));
    expect(await screen.findByRole('button', { name: 'Retry roles' })).toBeEnabled();
    expect(screen.getByRole('combobox')).toHaveAttribute('aria-disabled', 'true');
    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
    expect(screen.getByLabelText('Selected role')).toHaveTextContent('teacher');
    expect(
      screen.getByText(
        status === 403
          ? 'Roles could not be loaded. Ask an administrator to review your Security role access.'
          : 'Roles could not be loaded. Try again.'
      )
    ).toBeVisible();
    responseStatus = 200;
    fireEvent.click(screen.getByRole('button', { name: 'Retry roles' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled());
  }
);

it('explains empty eligibility without introducing fallback roles or accepting a removed role', async () => {
  mswServer.use(http.get(path, () => HttpResponse.json({ items: [] })));
  render(form());
  expect(await screen.findByText(/No roles are available for this staff group/)).toBeVisible();
  expect(screen.getByText(/audience is Employee, employee onboarding is enabled/)).toBeVisible();
  expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
  fireEvent.mouseDown(screen.getByRole('combobox'));
  expect(await screen.findByText('No roles available for this staff group')).toBeVisible();
  expect(screen.queryByRole('option', { name: 'Teacher' })).not.toBeInTheDocument();
});

it('blocks progression during refresh and after Security revokes onboarding eligibility', async () => {
  let reads = 0;
  let finishRefresh: (() => void) | undefined;
  mswServer.use(
    http.get(path, async () => {
      reads += 1;
      if (reads > 1) {
        await new Promise<void>((resolve) => {
          finishRefresh = resolve;
        });
      }
      return HttpResponse.json({
        items: reads === 1 ? [teacher] : [{ ...teacher, employeeOnboardingAssignable: false }],
      });
    })
  );
  render(form());
  await waitFor(() => expect(screen.getByRole('button', { name: 'Continue' })).toBeEnabled());
  fireEvent.click(screen.getByRole('button', { name: 'Refresh roles' }));
  expect(await screen.findByText('Loading roles from Security…')).toBeVisible();
  expect(screen.getByRole('combobox')).toHaveAttribute('aria-disabled', 'true');
  expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
  expect(screen.getByLabelText('Selected role')).toHaveTextContent('teacher');
  await waitFor(() => expect(finishRefresh).toBeDefined());
  await act(async () => {
    finishRefresh!();
  });
  expect(await screen.findByText(/No roles are available for this staff group/)).toBeVisible();
  expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
});

it('refreshes after a Security role mutation through the existing shared cache tag', async () => {
  let reads = 0;
  mswServer.use(
    http.get(path, () => {
      reads += 1;
      return HttpResponse.json({ items: reads === 1 ? [teacher] : [teacher, customRole] });
    }),
    http.put('*/api/identity/roles/custom', () => HttpResponse.json(customRole))
  );
  render(form());
  await waitFor(() =>
    expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-disabled', 'true')
  );
  await act(async () => {
    await store
      .dispatch(roleApi.endpoints.updateRole.initiate({ id: 'custom', body: {} }))
      .unwrap();
  });
  await waitFor(() => expect(reads).toBe(2));
  await waitFor(() =>
    expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-disabled', 'true')
  );
  fireEvent.mouseDown(screen.getByRole('combobox'));
  expect(await screen.findByRole('option', { name: 'Learning Facilitator' })).toBeVisible();
});
