import React from 'react';
import { api } from 'src/redux/service';
import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

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
it('retains the draft and reports failure instead of closing after a rejected status mutation', async () => {
  mswServer.use(
    http.get('http://library.test/api/library/books/book-id/copies/copy-id/state', () =>
      HttpResponse.json(statusState)
    ),
    http.put('http://library.test/api/library/books/book-id/copies/status', () =>
      HttpResponse.json({ detail: 'This copy has an active loan.' }, { status: 409 })
    )
  );
  const onClose = vi.fn();
  const { store, wrapper } = makeStatusTestWrapper();
  render(<ChangeBookStatusForm editData={statusCopy} onClose={onClose} />, { wrapper });
  fireEvent.change(await screen.findByLabelText('Remarks'), { target: { value: 'Keep my draft' } });
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() =>
    expect(
      Object.values(store.getState()[api.reducerPath].mutations).some(
        (mutation) => mutation?.status === 'rejected'
      )
    ).toBe(true)
  );
  expect(onClose).not.toHaveBeenCalled();
  expect(screen.getByLabelText('Remarks')).toHaveValue('Keep my draft');
  expect(await screen.findByText('This copy has an active loan.')).toBeInTheDocument();
});
