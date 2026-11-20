import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';
import { catalogueConfigurationApi } from 'src/redux/library/catalogue-configuration-api';

import { catalogueSchool } from './catalogue-test-data';
import CatalogueConfigurationScreen from './CatalogueConfigurationScreen';
import { catalogueTestStore, catalogueTestWrapper } from './catalogue-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock('src/routes/hooks', () => ({ useRouter: () => ({ push: vi.fn() }) }));
beforeEach(clearCachedAuthSession);

it('opens configuration management from its explicit fulfilled read and uses that actual revision', async () => {
  const store = catalogueTestStore();
  mswServer.use(
    http.get('http://library.test/api/library/catalogue/configuration', () =>
      HttpResponse.json({ ...catalogueSchool, revision: 'OLD' })
    )
  );
  await store
    .dispatch(
      catalogueConfigurationApi.endpoints.getCatalogueConfiguration.initiate(undefined, {
        subscribe: false,
      })
    )
    .unwrap();
  let release!: () => void;
  let freshReads = 0;
  let saved = { ...catalogueSchool, revision: 'NEW' };
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  let sent: Record<string, unknown> | undefined;
  mswServer.use(
    http.get('http://library.test/api/library/catalogue/configuration', async () => {
      freshReads += 1;
      await pending;
      return HttpResponse.json(saved);
    }),
    http.put('http://library.test/api/library/catalogue/configuration', async ({ request }) => {
      sent = (await request.json()) as Record<string, unknown>;
      saved = { ...saved, revision: 'SAVED' };
      return HttpResponse.json(saved);
    })
  );
  render(<CatalogueConfigurationScreen />, { wrapper: catalogueTestWrapper(store) });
  try {
    await waitFor(() => expect(freshReads).toBeGreaterThan(0));
    expect(
      screen
        .queryAllByRole('button', { name: 'Submit' })
        .filter((button) => !(button as HTMLButtonElement).disabled)
    ).toHaveLength(0);
  } finally {
    await act(async () => {
      release();
    });
  }
  const input = await screen.findByRole('textbox', { name: 'Language label (gu)' });
  fireEvent.change(input, { target: { value: 'Reviewed Gujarati label' } });
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(sent).toMatchObject({ expectedRevision: 'NEW' }));
});
