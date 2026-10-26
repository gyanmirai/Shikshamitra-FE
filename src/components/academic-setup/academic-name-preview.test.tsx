import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { setCustomIconsLoader } from '@iconify/react';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';

import { MediumForm } from './medium-form';
import { academicNamePreviewCases } from './academic-name-preview-fixtures';
import { renderAcademicOrder, createAcademicOrderStore } from './academic-order-test-utils';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

let store: ReturnType<typeof createAcademicOrderStore>;
let reads: number;
const defaults = { board: 0, medium: 0, stage: 0, standard: 0, division: 0 };
beforeEach(() => {
  ['clarity', 'lineicons'].forEach((prefix) => {
    setCustomIconsLoader((icons) => ({ prefix, icons: {}, not_found: icons }), prefix);
  });
  reads = 0;
  store = createAcademicOrderStore();
  clearCachedAuthSession();
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json(null)),
    http.get('*/api/app/academic-field-formatting', () => {
      reads += 1;
      return HttpResponse.json({ ...defaults, medium: 2, stage: 2, standard: 2, division: 2 });
    })
  );
});
afterEach(async () => {
  await Promise.all(store.dispatch(api.util.getRunningQueriesThunk()));
  store.dispatch(api.util.resetApiState());
  clearCachedAuthSession();
});

describe('academic create name formatting preview', () => {
  it('keeps typing and the create payload raw while previewing the server formatting once', async () => {
    let submitted: unknown;
    mswServer.use(
      http.post('*/api/app/education-medium', async ({ request }) => {
        submitted = await request.json();
        return HttpResponse.json({ id: 'new-medium', name: 'englishMedium' });
      })
    );
    const close = vi.fn();
    renderAcademicOrder(<MediumForm boardId="board" editData={null} handleClose={close} />, store);
    const input = screen.getByRole('textbox', { name: /Medium name/ });
    fireEvent.change(input, { target: { value: 'eNGLISH medium' } });
    expect(input).toHaveValue('eNGLISH medium');
    expect(await screen.findByText('Will be saved as: englishMedium')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Confirm' }));
    await waitFor(() => expect(close).toHaveBeenCalledOnce());
    expect(submitted).toEqual({ name: 'eNGLISH medium', educationBoardId: 'board' });
  });

  it('keeps stored names unchanged on edit and does not query formatting rules', async () => {
    let submitted: unknown;
    mswServer.use(
      http.put('*/api/app/education-medium/old-medium', async ({ request }) => {
        submitted = await request.json();
        return HttpResponse.json({ id: 'old-medium', name: 'eNGLISH medium' });
      })
    );
    const close = vi.fn();
    renderAcademicOrder(
      <MediumForm
        boardId="board"
        editData={{ id: 'old-medium', name: 'eNGLISH medium' }}
        handleClose={close}
      />,
      store
    );
    expect(screen.getByRole('textbox', { name: /Medium name/ })).toHaveValue('eNGLISH medium');
    expect(screen.queryByText(/Will be saved as:/)).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Confirm' }));
    await waitFor(() => expect(close).toHaveBeenCalledOnce());
    expect(submitted).toEqual({ name: 'eNGLISH medium', educationBoardId: 'board' });
    expect(reads).toBe(0);
  });

  it.each(academicNamePreviewCases)(
    'keeps the %s entry raw while showing the saved rule preview',
    async (_kind, label, form) => {
      mswServer.use(http.get('*/api/app/shift-management', () => HttpResponse.json({ items: [] })));
      renderAcademicOrder(form(), store);
      const input = screen.getByRole('textbox', { name: label });
      fireEvent.change(input, { target: { value: 'new SAMPLE' } });
      expect(input).toHaveValue('new SAMPLE');
      expect(await screen.findByText('Will be saved as: newSample')).toBeVisible();
      fireEvent.blur(input);
      expect(input).toHaveValue('new SAMPLE');
    }
  );

  it('preserves raw Default input and recovers a missing preview without blocking entry', async () => {
    mswServer.use(
      http.get('*/api/app/academic-field-formatting', () =>
        HttpResponse.json({ error: { message: 'Unavailable' } }, { status: 500 })
      )
    );
    renderAcademicOrder(
      <MediumForm boardId="board" editData={null} handleClose={() => {}} />,
      store
    );
    const input = screen.getByRole('textbox', { name: /Medium name/ });
    fireEvent.change(input, { target: { value: 'lower mixed' } });
    expect(await screen.findByText('School formatting will be applied when saved.')).toBeVisible();
    expect(input).toHaveValue('lower mixed');
    expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled();
  });
});
