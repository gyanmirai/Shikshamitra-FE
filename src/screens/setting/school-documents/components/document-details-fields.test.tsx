import { useFormik } from 'formik';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { addIcon } from '@iconify/react';
import auth from 'src/redux/auth/authSlice';
import { GlobalIcons } from 'src/utils/icons';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { act, render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';

import { DocumentDetailsFields } from './document-details-fields';

import type { DocumentFormValues } from '../types';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

Object.values(GlobalIcons).forEach((icon) => addIcon(icon, { body: '<path />' }));

const createStore = () =>
  configureStore({
    reducer: { auth, [api.reducerPath]: api.reducer },
    preloadedState: {
      auth: {
        ...auth(undefined, { type: 'init' }),
        permissionsInitialized: true,
        permissions: [{ name: 'InstituteSetup.SchoolDocuments.View', isGranted: true }],
      },
    },
    middleware: (defaults) => defaults().concat(api.middleware),
  });
let store: ReturnType<typeof createStore>;
beforeEach(() => {
  store = createStore();
  clearCachedAuthSession();
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json(null)),
    http.get('*/api/app/institute-field-formatting/schoolDocuments', () =>
      HttpResponse.json({ fields: { name: 0, notes: 0 } })
    )
  );
});
afterEach(async () => {
  await act(async () => {
    cleanup();
    store.dispatch(api.util.resetApiState());
  });
  clearCachedAuthSession();
});

function DocumentFields({ editing = false }: { editing?: boolean }) {
  const formik = useFormik<DocumentFormValues>({
    initialValues: {
      name: editing ? 'existing CBSE approval' : '',
      notes: editing ? 'existing note' : '',
      category: 0,
      files: [],
      retainedFiles: [],
    },
    onSubmit: () => {},
  });
  return <DocumentDetailsFields formik={formik} isEditing={editing} />;
}

function setup(editing = false) {
  return render(
    <Provider store={store}>
      <DocumentFields editing={editing} />
    </Provider>
  );
}

it('preserves typed or pasted document names and notes for Default field formatting', async () => {
  setup();
  const name = screen.getByLabelText(/Document name/);
  const notes = screen.getByLabelText('Notes');
  fireEvent.change(name, { target: { value: 'division CBSE Approval' } });
  fireEvent.change(notes, { target: { value: '  approved by CBSE\nkeep PDF copy' } });
  expect(name).toHaveValue('division CBSE Approval');
  expect(notes).toHaveValue('  approved by CBSE\nkeep PDF copy');
  await waitFor(() => expect(screen.queryByText('Loading field format…')).not.toBeInTheDocument());
  fireEvent.change(name, { target: { value: '' } });
  expect(name).toHaveValue('');
});

it('leaves saved values unchanged when the edit form opens', () => {
  setup(true);
  expect(screen.getByLabelText(/Document name/)).toHaveValue('existing CBSE approval');
  expect(screen.getByLabelText('Notes')).toHaveValue('existing note');
});

it('shows the configured saved-value preview while preserving the entered text', async () => {
  mswServer.use(
    http.get('*/api/app/institute-field-formatting/schoolDocuments', () =>
      HttpResponse.json({ fields: { name: 4, notes: 1 } })
    )
  );
  setup();
  const name = screen.getByLabelText(/Document name/);
  fireEvent.change(name, { target: { value: 'school approval' } });
  expect(await screen.findByText('Will be saved as: SCHOOL APPROVAL')).toBeVisible();
  expect(name).toHaveValue('school approval');
});
