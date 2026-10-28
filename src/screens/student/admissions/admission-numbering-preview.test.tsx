import { it, vi, expect, describe } from 'vitest';
import { shikshaMitraToast } from 'src/components/toast';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { AdmissionNumberingPreview } from './admission-numbering-preview';
import { defaultNumbering, numberingFormValues } from './admission-numbering-model';

vi.mock('src/components/toast', () => ({
  shikshaMitraToast: {
    error: vi.fn(),
    success: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    dismiss: vi.fn(),
  },
}));

const values = numberingFormValues(defaultNumbering);
describe('server application number preview', () => {
  it('debounces edits and ignores an older response after a newer format is selected', async () => {
    let oldResolve!: (value: { nextNumber: string; nextSequence: number }) => void;
    const onPreview = vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            oldResolve = resolve;
          })
      )
      .mockResolvedValue({ nextNumber: 'DDVS-2026-0051', nextSequence: 51 });
    const { rerender } = render(
      <AdmissionNumberingPreview values={values} onPreview={onPreview} />
    );
    await waitFor(() => expect(onPreview).toHaveBeenCalledOnce());
    rerender(
      <AdmissionNumberingPreview values={{ ...values, prefix: 'D' }} onPreview={onPreview} />
    );
    rerender(
      <AdmissionNumberingPreview
        values={{ ...values, prefix: 'DDVS', digits: 4 }}
        onPreview={onPreview}
      />
    );
    expect(await screen.findByText('DDVS-2026-0051')).toBeVisible();
    oldResolve({ nextNumber: 'APP-2026-000051', nextSequence: 51 });
    await waitFor(() => expect(screen.queryByText('APP-2026-000051')).not.toBeInTheDocument());
    expect(onPreview).toHaveBeenCalledTimes(2);
    expect(onPreview).toHaveBeenLastCalledWith(
      expect.objectContaining({ prefix: 'DDVS', digits: 4, startingNumber: 1 })
    );
  });
  it('shows errors with retry and refreshes the actual next number', async () => {
    const onPreview = vi
      .fn()
      .mockRejectedValueOnce({ data: { detail: 'Preview temporarily unavailable' } })
      .mockResolvedValueOnce({ nextNumber: 'APP-2026-000051', nextSequence: 51 })
      .mockResolvedValue({ nextNumber: 'APP-2026-000052', nextSequence: 52 });
    render(<AdmissionNumberingPreview values={values} onPreview={onPreview} />);
    await waitFor(() => expect(shikshaMitraToast.error).toHaveBeenCalled());
    expect(screen.queryByRole('button', { name: 'Retry preview' })).not.toBeInTheDocument();
    const notice = render(
      <div role="alert">{vi.mocked(shikshaMitraToast.error).mock.lastCall![0].message}</div>
    );
    expect(await screen.findByText('Preview temporarily unavailable')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Retry preview' }));
    notice.unmount();
    expect(await screen.findByText('APP-2026-000051')).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Refresh preview' }));
    expect(await screen.findByText('APP-2026-000052')).toBeVisible();
  });
  it('does not request a number for an invalid draft or a missing required academic year', async () => {
    const onPreview = vi.fn();
    const { rerender } = render(
      <AdmissionNumberingPreview values={{ ...values, startingNumber: '' }} onPreview={onPreview} />
    );
    expect(
      screen.getByText('Complete the numbering fields to preview the next number.')
    ).toBeVisible();
    rerender(
      <AdmissionNumberingPreview
        values={{ ...values, yearFormat: 2, resetPolicy: 2 }}
        onPreview={onPreview}
      />
    );
    expect(
      screen.getByText('Select an academic year on the page to preview this format.')
    ).toBeVisible();
    expect(onPreview).not.toHaveBeenCalled();
  });
});
