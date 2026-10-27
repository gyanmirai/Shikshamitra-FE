import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { act, screen, within, cleanup, waitFor, fireEvent } from '@testing-library/react';

import { AcademicFieldFormattingPopover } from './academic-field-formatting-popover';
import { renderAcademicOrder, createAcademicOrderStore } from './academic-order-test-utils';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

const defaults = { board: 0, medium: 0, stage: 0, standard: 0, division: 0 };
let requests: unknown[];
let store: ReturnType<typeof createAcademicOrderStore>;

beforeEach(() => {
  requests = [];
  store = createAcademicOrderStore();
  clearCachedAuthSession();
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json(null)),
    http.get('*/api/app/academic-field-formatting', () => HttpResponse.json(defaults)),
    http.put('*/api/app/academic-field-formatting', async ({ request }) => {
      const body = await request.json();
      requests.push(body);
      return HttpResponse.json(body);
    })
  );
});

afterEach(async () => {
  await act(async () => {
    cleanup();
    store.dispatch(api.util.resetApiState());
  });
  clearCachedAuthSession();
});

it('selects every editable academic field and preserves the disabled official board code', async () => {
  renderAcademicOrder(<AcademicFieldFormattingPopover />, store);
  fireEvent.click(screen.getByRole('button', { name: 'Field settings' }));
  await screen.findByRole('radio', { name: /^Default/ });
  const dialog = screen.getByRole('dialog', { name: 'Field Formatting' });
  fireEvent.mouseDown(within(dialog).getByRole('combobox', { name: 'Field' }));
  const menu = await screen.findByRole('listbox');
  expect(within(menu).getByRole('option', { name: 'Stage name' })).toHaveAttribute(
    'aria-selected',
    'true'
  );
  const board = within(menu).getByRole('option', { name: /^Board name/ });
  expect(board).toHaveAttribute('aria-disabled', 'true');
  fireEvent.click(within(menu).getByRole('option', { name: 'Select All' }));
  expect(within(menu).getByRole('option', { name: 'Deselect All' })).toBeInTheDocument();
  ['Medium name', 'Stage name', 'Standard name', 'Division name'].forEach((name) => {
    expect(within(menu).getByRole('option', { name })).toHaveAttribute('aria-selected', 'true');
  });
  expect(board).toHaveAttribute('aria-selected', 'false');
  fireEvent.keyDown(menu, { key: 'Escape' });
  await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
  expect(within(dialog).getByRole('button', { name: 'Submit' })).toBeDisabled();
  fireEvent.click(within(dialog).getByRole('radio', { name: /^Uppercase/ }));
  fireEvent.click(within(dialog).getByRole('button', { name: 'Submit' }));
  await waitFor(() =>
    expect(requests).toEqual([{ board: 0, medium: 4, stage: 4, standard: 4, division: 4 }])
  );
});
