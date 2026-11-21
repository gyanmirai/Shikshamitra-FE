import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { catalogueSchool } from './catalogue-test-data';
import CatalogueConfigurationScreen from './CatalogueConfigurationScreen';
import { catalogueTestStore, catalogueTestWrapper } from './catalogue-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/routes/hooks', () => ({ useRouter: () => ({ push: vi.fn() }) }));
beforeEach(clearCachedAuthSession);

it('shows school values read-only when the server denies management despite local Update grants', async () => {
  let reads = 0;
  mswServer.use(
    http.get('http://library.test/api/library/catalogue/configuration', () => {
      reads += 1;
      return HttpResponse.json({ ...catalogueSchool, canManageConfiguration: false });
    })
  );
  render(<CatalogueConfigurationScreen />, { wrapper: catalogueTestWrapper(catalogueTestStore()) });
  expect(screen.getByRole('heading', { name: 'Catalogue Configuration' })).toBeVisible();
  await waitFor(() => expect(reads).toBe(1));
  expect(screen.getByRole('checkbox', { name: 'Author' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
});

it('submits the opened revision and retains edited labels after a real HTTP conflict', async () => {
  let sent: Record<string, unknown> | undefined;
  mswServer.use(
    http.get('http://library.test/api/library/catalogue/configuration', () =>
      HttpResponse.json(catalogueSchool)
    ),
    http.put('http://library.test/api/library/catalogue/configuration', async ({ request }) => {
      sent = (await request.json()) as Record<string, unknown>;
      return HttpResponse.json(
        {
          status: 409,
          detail: 'The catalogue configuration changed. Review the latest rules.',
        },
        { status: 409 }
      );
    })
  );
  render(<CatalogueConfigurationScreen />, { wrapper: catalogueTestWrapper(catalogueTestStore()) });
  const user = userEvent.setup();
  const input = await screen.findByRole('textbox', { name: 'Language label (gu)' });
  await user.clear(input);
  fireEvent.change(input, { target: { value: 'Reviewed Gujarati' } });
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  expect(
    await screen.findByText('The catalogue configuration changed. Review the latest rules.')
  ).toBeVisible();
  expect(input).toHaveValue('Reviewed Gujarati');
  expect(sent).toMatchObject({
    expectedRevision: 'school-revision-1',
    definition: {
      languages: expect.arrayContaining([
        { code: 'gu', label: 'Reviewed Gujarati', isActive: true },
      ]),
    },
  });
});
