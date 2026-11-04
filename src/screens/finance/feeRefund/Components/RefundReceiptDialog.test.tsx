import React from 'react';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react';

import RefundReceiptDialog from './RefundReceiptDialog';

const { download, createUrl, revokeUrl } = vi.hoisted(() => ({
  download: vi.fn(), createUrl: vi.fn(), revokeUrl: vi.fn(),
}));
vi.mock('src/redux/finance/RefundManagement/feeRefundManage', () => ({
  useDownloadRefundReceiptPdfMutation: () => [download],
}));
vi.mock('src/components/customDialog', () => ({
  default: ({ title, children }: any) => <div role="dialog" aria-label={title}>{children}</div>,
  DialogScrollContent: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('src/components/preview-document/pdf-preview', () => ({
  default: ({ url, title }: any) => <div aria-label={title} data-testid="receipt-pdf" data-url={url} />,
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));

beforeEach(() => {
  vi.clearAllMocks();
  createUrl.mockReturnValue('blob:refund-receipt');
  const OriginalUrl = URL;
  vi.stubGlobal('URL', class extends OriginalUrl {
    static createObjectURL = createUrl;

    static revokeObjectURL = revokeUrl;
  });
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('Refund receipt preview', () => {
  it('reloads the document when a provisional payout becomes completed', async () => {
    download.mockReturnValueOnce({ unwrap: () => Promise.resolve({ blob: new Blob(['pending']), fileName: 'Provisional.pdf' }) })
      .mockReturnValueOnce({ unwrap: () => Promise.resolve({ blob: new Blob(['settled']), fileName: 'Receipt.pdf' }) });
    const { rerender } = render(<RefundReceiptDialog refundId="refund-42" provisional onClose={vi.fn()} />);
    await screen.findByTestId('receipt-pdf');
    rerender(<RefundReceiptDialog refundId="refund-42" provisional={false} onClose={vi.fn()} />);
    await waitFor(() => expect(download).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(screen.getByRole('link', { name: 'Download PDF' })).toHaveAttribute('download', 'Receipt.pdf'));
  });

  it('loads the saved document, retains the server filename, and cleans up on close', async () => {
    const blob = new Blob(['pdf'], { type: 'application/pdf' });
    download.mockReturnValue({ unwrap: () => Promise.resolve({ blob, fileName: 'Refund-Receipt_REF-42.pdf' }) });
    const close = vi.fn();
    const { unmount } = render(<RefundReceiptDialog refundId="refund-42" provisional={false} onClose={close} />);
    expect(screen.getByRole('status', { name: 'Loading refund receipt' })).toBeInTheDocument();
    await screen.findByTestId('receipt-pdf');
    expect(download).toHaveBeenCalledWith('refund-42');
    const link = screen.getByRole('link', { name: 'Download PDF' });
    expect(link).toHaveAttribute('href', 'blob:refund-receipt');
    expect(link).toHaveAttribute('download', 'Refund-Receipt_REF-42.pdf');
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(close).toHaveBeenCalledOnce();
    unmount();
    expect(revokeUrl).toHaveBeenCalledWith('blob:refund-receipt');
  });

  it('keeps a failed preview retryable without issuing another refund', async () => {
    download.mockReturnValueOnce({ unwrap: () => Promise.reject(new Error('network')) })
      .mockReturnValueOnce({ unwrap: () => Promise.resolve({ blob: new Blob(['pdf']), fileName: 'Refund.pdf' }) });
    render(<RefundReceiptDialog refundId="refund-42" provisional onClose={vi.fn()} />);
    expect(screen.getByRole('dialog', { name: 'Provisional Refund Receipt' })).toBeInTheDocument();
    await screen.findByRole('alert');
    expect(screen.queryByTestId('receipt-pdf')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    await screen.findByTestId('receipt-pdf');
    expect(download.mock.calls).toEqual([['refund-42'], ['refund-42']]);
  });

  it('ignores an old response after switching to another refund', async () => {
    let resolveOld!: (value: unknown) => void;
    download.mockReturnValueOnce({ unwrap: () => new Promise((resolve) => { resolveOld = resolve; }) })
      .mockReturnValueOnce({ unwrap: () => Promise.resolve({ blob: new Blob(['new']), fileName: 'New-refund.pdf' }) });
    const { rerender } = render(<RefundReceiptDialog refundId="old" provisional={false} onClose={vi.fn()} />);
    rerender(<RefundReceiptDialog refundId="new" provisional={false} onClose={vi.fn()} />);
    await screen.findByTestId('receipt-pdf');
    resolveOld({ blob: new Blob(['old']), fileName: 'Old-refund.pdf' });
    await waitFor(() => expect(createUrl).toHaveBeenCalledOnce());
    expect(screen.getByRole('link', { name: 'Download PDF' })).toHaveAttribute('download', 'New-refund.pdf');
  });
});
