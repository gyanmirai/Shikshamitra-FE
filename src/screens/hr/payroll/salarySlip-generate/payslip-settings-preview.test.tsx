import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { defaultSalaryDocumentPresentation as defaults } from 'src/redux/hr/payslip-api';
import { act, render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';

import PayslipSettingsPreview from './payslip-settings-preview';

const state = vi.hoisted(() => ({ preview: vi.fn() }));
vi.mock('src/redux/hr/payslip-api', async (original) => ({
  ...(await original<typeof import('src/redux/hr/payslip-api')>()),
  usePreviewPayslipSettingsMutation: () => [state.preview],
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('./payslip-pdf-viewer', () => ({
  default: ({ url }: { url: string }) => <div data-testid="pdf-bytes">{url}</div>,
}));

const revoke = vi.fn();
beforeEach(() => {
  state.preview.mockReset();
  revoke.mockClear();
  vi.stubGlobal(
    'URL',
    class extends URL {
      static createObjectURL = vi.fn(() => 'blob:synthetic-pdf');

      static revokeObjectURL = revoke;
    }
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it('renders and downloads the same PDF bytes, debounces changes and releases the URL on unmount', async () => {
  state.preview.mockImplementation(() => ({
    unwrap: () => Promise.resolve(new Blob(['synthetic PDF'])),
    abort: vi.fn(),
  }));
  const view = render(<PayslipSettingsPreview presentation={defaults} brandingKey="school-1" />);
  view.rerender(
    <PayslipSettingsPreview
      presentation={{ ...defaults, layout: 'Compact' }}
      brandingKey="school-1"
    />
  );
  expect(screen.getByRole('status')).toHaveTextContent('Updating sample preview');
  expect(await screen.findByTestId('pdf-bytes')).toHaveTextContent('blob:synthetic-pdf');
  expect(state.preview).toHaveBeenCalledOnce();
  expect(state.preview.mock.calls[0][0]).toMatchObject({
    layout: 'Compact',
    statementColumns: [],
    registerColumns: [],
  });
  expect(state.preview.mock.calls[0][0]).not.toHaveProperty('brandingKey');
  expect(screen.getByRole('link', { name: 'Download sample PDF' })).toHaveAttribute(
    'href',
    'blob:synthetic-pdf'
  );
  view.unmount();
  expect(revoke).toHaveBeenCalledWith('blob:synthetic-pdf');
});

it('hides stale bytes immediately and ignores an obsolete response even if abort does not stop it', async () => {
  let finish!: (value: Blob) => void;
  const abort = vi.fn();
  state.preview
    .mockReturnValueOnce({
      unwrap: () =>
        new Promise<Blob>((resolve) => {
          finish = resolve;
        }),
      abort,
    })
    .mockReturnValue({ unwrap: () => Promise.resolve(new Blob(['new PDF'])), abort: vi.fn() });
  const view = render(<PayslipSettingsPreview presentation={defaults} brandingKey="school-1" />);
  await waitFor(() => expect(state.preview).toHaveBeenCalledOnce());
  view.rerender(
    <PayslipSettingsPreview
      presentation={{ ...defaults, showBankDetails: false }}
      brandingKey="school-1"
    />
  );
  expect(abort).toHaveBeenCalledOnce();
  await act(async () => finish(new Blob(['obsolete PDF'])));
  expect(screen.queryByRole('link', { name: 'Download sample PDF' })).not.toBeInTheDocument();
  expect(await screen.findByTestId('pdf-bytes')).toBeVisible();
  expect(URL.createObjectURL).toHaveBeenCalledOnce();
  view.rerender(
    <PayslipSettingsPreview
      presentation={{ ...defaults, showBankDetails: true }}
      brandingKey="school-1"
    />
  );
  expect(screen.queryByTestId('pdf-bytes')).not.toBeInTheDocument();
  expect(revoke).toHaveBeenCalledWith('blob:synthetic-pdf');
});

it('supports retry after PDF generation failure without changing settings', async () => {
  state.preview
    .mockReturnValueOnce({
      unwrap: () => Promise.reject(new Error('synthetic failure')),
      abort: vi.fn(),
    })
    .mockReturnValue({ unwrap: () => Promise.resolve(new Blob(['PDF'])), abort: vi.fn() });
  render(<PayslipSettingsPreview presentation={defaults} brandingKey="school-1" />);
  expect(await screen.findByRole('alert')).toHaveTextContent('Your settings have been kept');
  fireEvent.click(screen.getByRole('button', { name: 'Retry preview' }));
  expect(await screen.findByTestId('pdf-bytes')).toBeVisible();
});
