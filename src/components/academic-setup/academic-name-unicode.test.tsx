import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';

import { MediumForm } from './medium-form';
import { renderAcademicOrder, createAcademicOrderStore } from './academic-order-test-utils';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

let store: ReturnType<typeof createAcademicOrderStore>;
let previews: unknown[];
let settingsReads: number;
beforeEach(() => {
  store = createAcademicOrderStore();
  previews = [];
  settingsReads = 0;
  clearCachedAuthSession();
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json(null)),
    http.get('*/api/app/academic-field-formatting', () => {
      settingsReads += 1;
      return HttpResponse.json({ board: 0, medium: 2, stage: 0, standard: 0, division: 0 });
    }),
    http.post('*/api/app/academic-field-formatting/preview', async ({ request }) => {
      previews.push(await request.json());
      return HttpResponse.json({ value: 'İstanbulMedium' });
    })
  );
});
afterEach(() => {
  store.dispatch(api.util.resetApiState());
  clearCachedAuthSession();
});

describe('Unicode academic create names', () => {
  it('shows the authoritative preview while submitting the original input exactly once', async () => {
    let submitted: unknown;
    mswServer.use(
      http.post('*/api/app/education-medium', async ({ request }) => {
        submitted = await request.json();
        return HttpResponse.json({ id: 'new-medium', name: 'İstanbulMedium' });
      })
    );
    const close = vi.fn();
    renderAcademicOrder(<MediumForm boardId="board" editData={null} handleClose={close} />, store);
    const input = screen.getByRole('textbox', { name: /Medium name/ });
    fireEvent.change(input, { target: { value: 'İSTANBUL medium' } });
    expect(await screen.findByText('Will be saved as: İstanbulMedium')).toBeVisible();
    expect(previews).toEqual([{ value: 'İSTANBUL medium', textCase: 2 }]);
    expect(input).toHaveValue('İSTANBUL medium');
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Confirm' }));
    await waitFor(() => expect(close).toHaveBeenCalledOnce());
    expect(submitted).toEqual({ name: 'İSTANBUL medium', educationBoardId: 'board' });
  });

  it('keeps a Unicode edit raw without requesting settings or previews', async () => {
    renderAcademicOrder(
      <MediumForm
        boardId="board"
        editData={{ id: 'existing', name: 'İSTANBUL' }}
        handleClose={() => {}}
      />,
      store
    );
    const input = screen.getByRole('textbox', { name: /Medium name/ });
    fireEvent.change(input, { target: { value: 'ΟΣ' } });
    fireEvent.blur(input);
    expect(input).toHaveValue('ΟΣ');
    expect(screen.queryByText(/Will be saved as:/)).not.toBeInTheDocument();
    expect(previews).toHaveLength(0);
    expect(settingsReads).toBe(0);
  });

  it('does not invent a preview after the authoritative preview API fails', async () => {
    mswServer.use(
      http.post('*/api/app/academic-field-formatting/preview', () =>
        HttpResponse.json({ error: { message: 'Unavailable' } }, { status: 500 })
      )
    );
    renderAcademicOrder(
      <MediumForm boardId="board" editData={null} handleClose={() => {}} />,
      store
    );
    const input = screen.getByRole('textbox', { name: /Medium name/ });
    fireEvent.change(input, { target: { value: 'İSTANBUL' } });
    expect(
      await screen.findByText(
        'Name preview is unavailable. School formatting will be applied when saved.'
      )
    ).toBeVisible();
    expect(screen.queryByText(/Will be saved as:/)).not.toBeInTheDocument();
    expect(input).toHaveValue('İSTANBUL');
  });
});
