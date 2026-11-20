import React from 'react';
import { api } from 'src/redux/service';
import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { libraryModuleType } from 'src/redux/tagTypes';
import { libraryCopyLifecycleApi } from 'src/redux/library/copy-lifecycle-api';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';

import ChangeBookStatusForm from './BookStatusChangeForm';
import {
  statusCopy,
  statusState,
  makeStatusTestWrapper,
} from '../../../circulation/copy-status-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
vi.mock('@iconify/react', async (original) => ({
  ...(await original<typeof import('@iconify/react')>()),
  Icon: () => null,
}));

it('keeps the opened revision and dirty values after a background refresh and conflict', async () => {
  let reads = 0;
  let submitted: unknown;
  mswServer.use(
    http.get('http://library.test/api/library/books/book-id/copies/copy-id/state', () => {
      reads += 1;
      return HttpResponse.json(
        reads === 1
          ? statusState
          : {
              ...statusState,
              revision: 'revision-2',
              remarks: 'Changed by another librarian',
            }
      );
    }),
    http.put('http://library.test/api/library/books/book-id/copies/status', async ({ request }) => {
      submitted = await request.json();
      return HttpResponse.json(
        { detail: 'This copy changed. Reload and review the current copy state.' },
        { status: 409 }
      );
    })
  );
  const onClose = vi.fn();
  const { store, wrapper } = makeStatusTestWrapper();
  render(<ChangeBookStatusForm editData={statusCopy} onClose={onClose} />, { wrapper });
  await waitFor(() => expect(reads).toBe(1));
  fireEvent.change(await screen.findByLabelText('Remarks'), {
    target: { value: 'My retained notes' },
  });
  act(() => {
    store.dispatch(api.util.invalidateTags([libraryModuleType.copies]));
  });
  await waitFor(() =>
    expect(
      Object.values(store.getState()[api.reducerPath].queries).some(
        (query) => (query?.data as { revision?: string })?.revision === 'revision-2'
      )
    ).toBe(true)
  );
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await screen.findByText('This copy changed. Reload and review the current copy state.');
  expect(submitted).toEqual({ status: 3, remarks: 'My retained notes', revision: 'revision-1' });
  expect(screen.getByLabelText('Remarks')).toHaveValue('My retained notes');
  expect(onClose).not.toHaveBeenCalled();
});

it('waits for the opening state refresh before freezing a previously cached copy revision', async () => {
  let release: (() => void) | undefined;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  let reads = 0;
  mswServer.use(
    http.get('http://library.test/api/library/books/book-id/copies/copy-id/state', async () => {
      reads += 1;
      if (reads > 1) await pending;
      return HttpResponse.json(
        reads === 1
          ? statusState
          : {
              ...statusState,
              revision: 'revision-2',
              remarks: 'Current saved notes',
            }
      );
    })
  );
  const { store, wrapper } = makeStatusTestWrapper();
  const cached = store.dispatch(
    libraryCopyLifecycleApi.endpoints.getLibraryCopyState.initiate({
      bookId: 'book-id',
      copyId: 'copy-id',
    })
  );
  await cached.unwrap();
  cached.unsubscribe();
  render(<ChangeBookStatusForm editData={statusCopy} onClose={vi.fn()} />, { wrapper });
  await waitFor(() => expect(reads).toBe(2));
  expect(screen.queryByLabelText('Remarks')).not.toBeInTheDocument();
  await act(async () => {
    release?.();
    await pending;
  });
  expect(await screen.findByLabelText('Remarks')).toHaveValue('Current saved notes');
});

it.each([true, false])(
  'uses the independent notes capability when condition changes are blocked (%s)',
  async (canEditNotes) => {
    mswServer.use(
      http.get('http://library.test/api/library/books/book-id/copies/copy-id/state', () =>
        HttpResponse.json({
          ...statusState,
          hasOpenLoan: true,
          activeLoanId: 'loan-id',
          canEditNotes,
          canChangeCondition: false,
          allowedConditionStatuses: [],
        })
      )
    );
    const { wrapper } = makeStatusTestWrapper();
    render(<ChangeBookStatusForm editData={statusCopy} onClose={vi.fn()} />, { wrapper });
    const remarks = await screen.findByLabelText('Remarks');
    if (canEditNotes) {
      expect(remarks).toBeEnabled();
      fireEvent.change(remarks, { target: { value: 'Additional loan context' } });
      expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled();
    } else {
      expect(remarks).toBeDisabled();
      expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
    }
  }
);
