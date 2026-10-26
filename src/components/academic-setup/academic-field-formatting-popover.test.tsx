import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { setCustomIconsLoader } from '@iconify/react';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { act, screen, within, cleanup, waitFor, fireEvent } from '@testing-library/react';

import { AcademicSetupHeader } from './academic-setup-header';
import { renderAcademicOrder, createAcademicOrderStore } from './academic-order-test-utils';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

const defaults = { board: 0, medium: 0, stage: 0, standard: 0, division: 0 };
let saved = { ...defaults };
let store: ReturnType<typeof createAcademicOrderStore>;
const header = () => (
  <AcademicSetupHeader
    years={[]}
    selectedYearId=""
    isLoading={false}
    onSelectYear={() => undefined}
    onCreateYear={() => undefined}
    onEditYear={() => undefined}
    onAddBoard={() => undefined}
  />
);
const open = async () => {
  fireEvent.click(screen.getByRole('button', { name: 'Field settings' }));
  await screen.findByRole('radio', { name: /Default/ });
  return screen.getByRole('dialog', { name: 'Field Formatting' });
};
beforeEach(() => {
  ['mingcute', 'clarity', 'lineicons', 'eva'].forEach((prefix) => {
    setCustomIconsLoader((icons) => ({ prefix, icons: {}, not_found: icons }), prefix);
  });
  saved = { ...defaults };
  store = createAcademicOrderStore();
  clearCachedAuthSession();
  mswServer.use(
    http.get('*/api/auth/session', () => HttpResponse.json(null)),
    http.get('*/api/app/academic-field-formatting', () => HttpResponse.json(saved)),
    http.put('*/api/app/academic-field-formatting', async ({ request }) => {
      saved = (await request.json()) as typeof defaults;
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

describe('Academic Setup field formatting', () => {
  it('opens a school settings popover with Default and preserves entered case', async () => {
    renderAcademicOrder(header(), store);
    const dialog = await open();
    expect(within(dialog).getByRole('radio', { name: /Default/ })).toBeChecked();
    fireEvent.change(within(dialog).getByLabelText('You type'), {
      target: { value: 'mIxEd stage' },
    });
    expect(within(dialog).getByLabelText('New entry will be saved as')).toHaveTextContent(
      'mIxEd stage'
    );
    expect(within(dialog).getByRole('button', { name: 'Submit' })).toBeDisabled();
  });

  it('saves the selected case and reloads it on reopening', async () => {
    renderAcademicOrder(header(), store);
    const dialog = await open();
    fireEvent.click(within(dialog).getByRole('radio', { name: /camelCase/ }));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Submit' }));
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Field Formatting' })).not.toBeInTheDocument()
    );
    expect(saved).toEqual({ ...defaults, stage: 2 });
    const reopened = await open();
    expect(within(reopened).getByRole('radio', { name: /camelCase/ })).toBeChecked();
  });

  it('previews and saves Uppercase without changing other field rules', async () => {
    renderAcademicOrder(header(), store);
    const dialog = await open();
    fireEvent.click(within(dialog).getByRole('radio', { name: /^Uppercase/ }));
    expect(within(dialog).getByLabelText('New entry will be saved as')).toHaveTextContent(
      'SECONDARY STAGE'
    );
    fireEvent.click(within(dialog).getByRole('button', { name: 'Submit' }));
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Field Formatting' })).not.toBeInTheDocument()
    );
    expect(saved).toEqual({ ...defaults, stage: 4 });
    const reopened = await open();
    expect(within(reopened).getByRole('radio', { name: /^Uppercase/ })).toBeChecked();
  });

  it('loads the latest saved school rules before opening a fresh editing session', async () => {
    renderAcademicOrder(header(), store);
    const dialog = await open();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    saved = { ...defaults, stage: 3 };
    const reopened = await open();
    await waitFor(() =>
      expect(within(reopened).getByRole('radio', { name: /PascalCase/ })).toBeChecked()
    );
  });

  it('uses the authoritative preview for Unicode input without modifying that input', async () => {
    let requestBody: unknown;
    mswServer.use(
      http.post('*/api/app/academic-field-formatting/preview', async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json({ value: 'ßeta' });
      })
    );
    renderAcademicOrder(header(), store);
    const dialog = await open();
    fireEvent.change(within(dialog).getByLabelText('You type'), { target: { value: 'ßeta' } });
    fireEvent.click(within(dialog).getByRole('radio', { name: /PascalCase/ }));
    await waitFor(() =>
      expect(within(dialog).getByLabelText('New entry will be saved as')).toHaveTextContent('ßeta')
    );
    expect(requestBody).toEqual({ value: 'ßeta', textCase: 3 });
    expect(within(dialog).getByLabelText('You type')).toHaveValue('ßeta');
  });

  it('preserves a failed draft for retry and guards dirty cancellation', async () => {
    mswServer.use(
      http.put('*/api/app/academic-field-formatting', () =>
        HttpResponse.json({ error: { message: 'Please retry.' } }, { status: 500 })
      )
    );
    renderAcademicOrder(header(), store);
    const dialog = await open();
    fireEvent.click(within(dialog).getByRole('radio', { name: /PascalCase/ }));
    fireEvent.click(within(dialog).getByRole('button', { name: 'Submit' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not save');
    expect(within(dialog).getByRole('radio', { name: /PascalCase/ })).toBeChecked();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
    expect(within(dialog).getByRole('radio', { name: /PascalCase/ })).toBeChecked();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel' }));
    fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Field Formatting' })).not.toBeInTheDocument()
    );
    expect(saved).toEqual(defaults);
  });

  it('hides school formatting settings without the edit permission', () => {
    store = createAcademicOrderStore(false);
    renderAcademicOrder(header(), store);
    expect(screen.queryByRole('button', { name: 'Field settings' })).not.toBeInTheDocument();
  });
});
