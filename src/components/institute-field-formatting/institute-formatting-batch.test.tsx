import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { setPermissions } from 'src/redux/auth/authSlice';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { act, screen, within, cleanup, waitFor, fireEvent } from '@testing-library/react';

import { InstituteFieldFormattingPopover } from './institute-field-formatting-popover';
import {
  renderAcademicOrder,
  createAcademicOrderStore,
} from '../academic-setup/academic-order-test-utils';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

const defaults = { buildingName: 0, floorName: 0, description: 0 };
let saved = { fields: { ...defaults } };
let requests: unknown[];
let store: ReturnType<typeof createAcademicOrderStore>;

beforeEach(() => {
  saved = { fields: { ...defaults } };
  requests = [];
  store = createAcademicOrderStore();
  store.dispatch(
    setPermissions(
      ['View', 'Add'].map((action) => ({
        name: `ShikshaMitra.Module.InstituteSetup.BuildingManagement.${action}`,
        isGranted: true,
      }))
    )
  );
  clearCachedAuthSession();
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json(null)),
    http.get('*/api/app/institute-field-formatting/buildings', () => HttpResponse.json(saved)),
    http.put('*/api/app/institute-field-formatting/buildings', async ({ request }) => {
      saved = (await request.json()) as typeof saved;
      requests.push(saved);
      return HttpResponse.json(saved);
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

async function open() {
  renderAcademicOrder(<InstituteFieldFormattingPopover scope="buildings" />, store);
  fireEvent.click(screen.getByRole('button', { name: 'Field settings' }));
  await screen.findByRole('radio', { name: /^Default/ });
  return screen.getByRole('dialog', { name: 'Field Formatting' });
}

async function openFields(dialog: HTMLElement) {
  fireEvent.mouseDown(within(dialog).getByRole('combobox', { name: 'Field' }));
  return screen.findByRole('listbox');
}

async function closeFields() {
  fireEvent.keyDown(screen.getByRole('listbox'), { key: 'Escape' });
  await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
}

it('selects every field without changing settings, then submits one full batch', async () => {
  const dialog = await open();
  const menu = await openFields(dialog);
  expect(within(menu).getByRole('option', { name: 'Building name' })).toHaveAttribute(
    'aria-selected',
    'true'
  );
  fireEvent.click(within(menu).getByRole('option', { name: 'Select All' }));
  expect(within(menu).getByRole('option', { name: 'Deselect All' })).toBeInTheDocument();
  ['Building name', 'Floor name', 'Description'].forEach((name) => {
    expect(within(menu).getByRole('option', { name })).toHaveAttribute('aria-selected', 'true');
  });
  await closeFields();
  expect(within(dialog).getByRole('button', { name: 'Submit' })).toBeDisabled();
  expect(requests).toEqual([]);
  fireEvent.click(within(dialog).getByRole('radio', { name: /^Uppercase/ }));
  fireEvent.click(within(dialog).getByRole('button', { name: 'Submit' }));
  await waitFor(() =>
    expect(requests).toEqual([{ fields: { buildingName: 4, floorName: 4, description: 4 } }])
  );
});

it('keeps mixed cases untouched until a case is applied to the selected subset', async () => {
  saved = { fields: { buildingName: 4, floorName: 1, description: 3 } };
  const dialog = await open();
  const menu = await openFields(dialog);
  fireEvent.click(within(menu).getByRole('option', { name: 'Floor name' }));
  await closeFields();
  expect(within(dialog).queryByRole('radio', { checked: true })).not.toBeInTheDocument();
  expect(within(dialog).queryByLabelText('New entry will be saved as')).not.toBeInTheDocument();
  expect(within(dialog).getByRole('button', { name: 'Submit' })).toBeDisabled();
  expect(requests).toEqual([]);
  fireEvent.click(within(dialog).getByRole('radio', { name: /camelCase/ }));
  expect(within(dialog).getByRole('radio', { name: /camelCase/ })).toBeChecked();
  fireEvent.click(within(dialog).getByRole('button', { name: 'Submit' }));
  await waitFor(() =>
    expect(requests).toEqual([{ fields: { buildingName: 2, floorName: 2, description: 3 } }])
  );
});

it('clears every selected field and disables formatting without making a draft', async () => {
  const dialog = await open();
  const menu = await openFields(dialog);
  fireEvent.click(within(menu).getByRole('option', { name: 'Select All' }));
  fireEvent.click(within(menu).getByRole('option', { name: 'Deselect All' }));
  ['Building name', 'Floor name', 'Description'].forEach((name) => {
    expect(within(menu).getByRole('option', { name })).toHaveAttribute('aria-selected', 'false');
  });
  await closeFields();
  within(dialog)
    .getAllByRole('radio')
    .forEach((radio) => expect(radio).toBeDisabled());
  expect(within(dialog).queryByRole('radio', { checked: true })).not.toBeInTheDocument();
  expect(within(dialog).queryByLabelText('New entry will be saved as')).not.toBeInTheDocument();
  expect(within(dialog).getByRole('button', { name: 'Submit' })).toBeDisabled();
  fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(screen.queryByRole('button', { name: 'Discard changes' })).not.toBeInTheDocument();
  expect(requests).toEqual([]);
});

it('retains the selected batch and draft after a failed save for retry', async () => {
  let fail = true;
  mswServer.use(
    http.put('*/api/app/institute-field-formatting/buildings', async ({ request }) => {
      const body = (await request.json()) as typeof saved;
      requests.push(body);
      if (fail) return HttpResponse.json({}, { status: 500 });
      saved = body;
      return HttpResponse.json(saved);
    })
  );
  const dialog = await open();
  fireEvent.click(within(await openFields(dialog)).getByRole('option', { name: 'Select All' }));
  await closeFields();
  fireEvent.click(within(dialog).getByRole('radio', { name: /PascalCase/ }));
  fireEvent.click(within(dialog).getByRole('button', { name: 'Submit' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Could not save');
  expect(within(dialog).getByRole('radio', { name: /PascalCase/ })).toBeChecked();
  expect(
    within(await openFields(dialog)).getByRole('option', { name: 'Deselect All' })
  ).toBeInTheDocument();
  await closeFields();
  fail = false;
  fireEvent.click(within(dialog).getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  expect(requests).toEqual([
    { fields: { buildingName: 3, floorName: 3, description: 3 } },
    { fields: { buildingName: 3, floorName: 3, description: 3 } },
  ]);
});
