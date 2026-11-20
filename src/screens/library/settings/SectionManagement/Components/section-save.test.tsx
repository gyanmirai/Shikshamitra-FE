import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, beforeEach } from 'vitest';
import { shikshaMitraToast } from 'src/components/toast';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';

import SectionForm from './SectionManagementForm';
import {
  catalogueTestStore,
  catalogueTestWrapper,
} from '../../catalogue-configuration/catalogue-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn() },
}));
beforeEach(() => {
  clearCachedAuthSession();
  vi.clearAllMocks();
});
const saved = {
  id: 'section-id',
  sectionName: 'Reading Room',
  numberOfShelf: 2,
  shelfNames: ['Early Readers', 'Reference'],
  shelfItems: ['Early Readers', 'Reference'],
};
const mount = (edit: boolean) => {
  const onClose = vi.fn();
  render(<SectionForm editData={edit ? saved : null} open onClose={onClose} />, {
    wrapper: catalogueTestWrapper(
      catalogueTestStore([
        'Library.Settings.SectionManagement.View',
        'Library.Settings.SectionManagement.Add',
      ])
    ),
  });
  fireEvent.change(screen.getByRole('textbox', { name: /Section Name/i }), {
    target: { value: 'Learning Corner' },
  });
  if (!edit)
    fireEvent.change(screen.getByRole('textbox', { name: /Number.*Shel/i }), {
      target: { value: '2' },
    });
  return onClose;
};
it.each([false, true])(
  'retains the %s section draft and actual error when the server rejects its save',
  async (edit) => {
    let calls = 0;
    const handler = async ({ request }: { request: Request }) => {
      calls += 1;
      expect(await request.json()).toMatchObject({
        sectionName: 'Learning Corner',
        numberOfShelf: 2,
      });
      return HttpResponse.json(
        { detail: 'This section has retained copy locations.' },
        { status: 400 }
      );
    };
    mswServer.use(
      edit
        ? http.put('http://library.test/api/library/sections/section-id', handler)
        : http.post('http://library.test/api/library/sections', handler)
    );
    const onClose = mount(edit);
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(calls).toBe(1));
    await waitFor(() => expect(shikshaMitraToast.error).toHaveBeenCalled());
    expect(shikshaMitraToast.success).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('textbox', { name: /Section Name/i })).toHaveValue('Learning Corner');
    expect(screen.getByRole('textbox', { name: /Number.*Shel/i })).toHaveDisplayValue('2');
    expect(screen.getByText('This section has retained copy locations.')).toBeVisible();
  }
);
it('keeps editing and cancellation locked while the real section command is pending', async () => {
  let release!: () => void;
  let calls = 0;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  mswServer.use(
    http.post('http://library.test/api/library/sections', async () => {
      calls += 1;
      await pending;
      return HttpResponse.json({ detail: 'Section save refused.' }, { status: 400 });
    })
  );
  const onClose = mount(false);
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  try {
    await waitFor(() => expect(calls).toBe(1));
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByRole('textbox', { name: /Section Name/i })).toBeDisabled();
    expect(onClose).not.toHaveBeenCalled();
    expect(shikshaMitraToast.success).not.toHaveBeenCalled();
  } finally {
    await act(async () => {
      release();
    });
  }
});
