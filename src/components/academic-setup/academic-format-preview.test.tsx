import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { act, screen, waitFor } from '@testing-library/react';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';

import { AcademicTextCase } from './academic-field-formatting-model';
import { useAcademicFormatPreview } from './use-academic-format-preview';
import { renderAcademicOrder, createAcademicOrderStore } from './academic-order-test-utils';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
});

let store: ReturnType<typeof createAcademicOrderStore>;
let requests: { value: string; textCase: AcademicTextCase }[];
function Preview({
  value,
  mode,
  disabled = false,
}: {
  value: string;
  mode: AcademicTextCase;
  disabled?: boolean;
}) {
  const preview = useAcademicFormatPreview(value, mode, disabled);
  return (
    <>
      <output aria-label="Preview">{preview.value}</output>
      <span role="status" aria-label="Preview state">
        {preview.isError ? 'Error' : preview.isLoading ? 'Loading' : 'Ready'}
      </span>
    </>
  );
}
beforeEach(() => {
  store = createAcademicOrderStore();
  requests = [];
  clearCachedAuthSession();
  mswServer.use(http.get('*/api/auth/session', () => HttpResponse.json(null)));
});
afterEach(() => {
  store.dispatch(api.util.resetApiState());
  clearCachedAuthSession();
});

describe('authoritative academic name preview', () => {
  it.each([
    ['İSTANBUL', AcademicTextCase.CamelCase, 'İstanbul'],
    ['ΟΣ', AcademicTextCase.CamelCase, 'οσ'],
    ['ßeta', AcademicTextCase.PascalCase, 'ßeta'],
    ['école primaire', AcademicTextCase.Uppercase, 'ÉCOLE PRIMAIRE'],
  ] as const)('uses the server response exactly for %s', async (value, mode, expected) => {
    mswServer.use(
      http.post('*/api/app/academic-field-formatting/preview', async ({ request }) => {
        requests.push((await request.json()) as (typeof requests)[number]);
        return HttpResponse.json({ value: expected });
      })
    );
    renderAcademicOrder(<Preview value={value} mode={mode} />, store);
    await waitFor(() => expect(screen.getByLabelText('Preview')).toHaveTextContent(expected));
    expect(requests).toEqual([{ value, textCase: mode }]);
  });

  it.each([
    ['  İSTANBUL  ', AcademicTextCase.Default, false, '  İSTANBUL  '],
    ['SECONDARY stage', AcademicTextCase.CamelCase, false, 'secondaryStage'],
    [' secondary stage ', AcademicTextCase.Uppercase, false, ' SECONDARY STAGE '],
    ['İSTANBUL', AcademicTextCase.CamelCase, true, ''],
  ] as const)(
    'keeps local/disabled previews off the network',
    async (value, mode, disabled, expected) => {
      mswServer.use(
        http.post('*/api/app/academic-field-formatting/preview', async ({ request }) => {
          requests.push((await request.json()) as (typeof requests)[number]);
          return HttpResponse.json({ value: 'unexpected' });
        })
      );
      renderAcademicOrder(<Preview value={value} mode={mode} disabled={disabled} />, store);
      expect(screen.getByLabelText('Preview').textContent).toBe(expected);
      expect(screen.getByRole('status', { name: 'Preview state' })).toHaveTextContent('Ready');
      expect(requests).toHaveLength(0);
    }
  );

  it('never displays a previous value when the text or mode changes', async () => {
    let finish: ((value: string) => void) | undefined;
    mswServer.use(
      http.post('*/api/app/academic-field-formatting/preview', async ({ request }) => {
        const body = (await request.json()) as (typeof requests)[number];
        requests.push(body);
        const value =
          requests.length === 1
            ? 'İstanbul'
            : await new Promise<string>((resolve) => {
                finish = resolve;
              });
        return HttpResponse.json({ value });
      })
    );
    const view = renderAcademicOrder(
      <Preview value="İSTANBUL" mode={AcademicTextCase.CamelCase} />,
      store
    );
    await waitFor(() => expect(screen.getByLabelText('Preview')).toHaveTextContent('İstanbul'));
    view.rerender(<Preview value="ΟΣ" mode={AcademicTextCase.CamelCase} />);
    await waitFor(() => expect(requests).toHaveLength(2));
    expect(screen.getByLabelText('Preview').textContent).toBe('');
    expect(screen.getByRole('status', { name: 'Preview state' })).toHaveTextContent('Loading');
    await act(async () => {
      finish?.('οσ');
    });
    await waitFor(() => expect(screen.getByLabelText('Preview')).toHaveTextContent('οσ'));
    view.rerender(<Preview value="ΟΣ" mode={AcademicTextCase.PascalCase} />);
    await waitFor(() => expect(requests).toHaveLength(3));
    expect(screen.getByLabelText('Preview').textContent).toBe('');
    await act(async () => {
      finish?.('Οσ');
    });
    await waitFor(() => expect(screen.getByLabelText('Preview')).toHaveTextContent('Οσ'));
  });

  it('shows an unavailable preview honestly after an API error', async () => {
    mswServer.use(
      http.post('*/api/app/academic-field-formatting/preview', () =>
        HttpResponse.json({ error: { message: 'Unavailable' } }, { status: 500 })
      )
    );
    renderAcademicOrder(<Preview value="ΟΣ" mode={AcademicTextCase.CamelCase} />, store);
    await waitFor(() =>
      expect(screen.getByRole('status', { name: 'Preview state' })).toHaveTextContent('Error')
    );
    expect(screen.getByLabelText('Preview').textContent).toBe('');
  });
});
