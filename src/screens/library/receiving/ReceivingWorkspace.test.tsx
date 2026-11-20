import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';
import { clearCachedAuthSession } from 'src/redux/session-cache';

import ReceivingWorkspace from './ReceivingWorkspace';
import { receivingUiWrapper } from './receiving-ui-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
vi.mock('src/routes/hooks', () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
beforeEach(() => {
  clearCachedAuthSession();
  mswServer.use(
    http.get('http://library.test/api/library/receiving/options', () =>
      HttpResponse.json({
        sections: [
          {
            id: 'section-id',
            sectionName: 'Fiction',
            shelfDetails: [{ id: 'shelf-id', shelfName: 'Shelf 1' }],
          },
        ],
      })
    )
  );
});

it('loads real receiving destinations without catalogue-edit/settings grants and starts with explicit dates', async () => {
  const requests: string[] = [];
  mswServer.use(
    http.get('http://library.test/api/library/receiving/options', () => {
      requests.push('receiving-options');
      return HttpResponse.json({
        sections: [
          {
            id: 'section-id',
            sectionName: 'Fiction',
            shelfDetails: [{ id: 'shelf-id', shelfName: 'Shelf 1' }],
          },
        ],
      });
    }),
    http.get('http://library.test/api/library/books/editor-options', () => {
      requests.push('catalogue-edit-options');
      return HttpResponse.json({}, { status: 403 });
    })
  );
  render(<ReceivingWorkspace />, { wrapper: receivingUiWrapper() });
  await waitFor(() => expect(screen.getByRole('combobox', { name: /Section/ })).toBeEnabled());
  expect(screen.getByRole('heading', { name: 'Stock Receiving' })).toBeVisible();
  expect(screen.getByText(/Enter the school date explicitly/)).toBeVisible();
  expect(
    screen
      .getByRole('combobox', { name: /Source/ })
      .textContent?.replaceAll('\u200b', '')
      .trim()
  ).toBe('');
  expect(screen.getByRole('checkbox', { name: 'Cost is known' })).not.toBeChecked();
  expect(requests).toEqual(['receiving-options']);
});

it('keeps every entered cost digit in the real shared numeric input without a title price default', async () => {
  render(<ReceivingWorkspace />, { wrapper: receivingUiWrapper() });
  const user = userEvent.setup();
  await user.click(screen.getByRole('checkbox', { name: 'Cost is known' }));
  const cost = screen.getByRole('textbox', { name: /Unit cost/ });
  expect(cost).toHaveValue('');
  await user.type(cost, '9999999999999998.99');
  expect((cost as HTMLInputElement).value.replaceAll(',', '')).toBe('9999999999999998.99');
  expect(screen.getByRole('textbox', { name: /Currency/ })).toHaveValue('');
});
