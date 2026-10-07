import { createRef } from 'react';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { act, render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';

import PayslipPdfViewer from './payslip-pdf-viewer';

const pdf = vi.hoisted(() => ({ getDocument: vi.fn(), destroy: vi.fn(), terminate: vi.fn(), cancel: vi.fn() }));
vi.mock('pdfjs-dist', () => ({ getDocument: pdf.getDocument, PDFWorker: { create: () => ({}) } }));

function documentWithText(text: string, count = 1) {
  return { numPages: count, getPage: vi.fn().mockResolvedValue({
    getViewport: () => ({ width: 1190, height: 1684 }),
    render: vi.fn(() => ({ promise: Promise.resolve(), cancel: pdf.cancel })),
    getTextContent: vi.fn().mockResolvedValue({ items: [{ str: text }] }),
    getStructTree: vi.fn().mockResolvedValue(null),
  }) };
}

describe('canonical PDF renderer', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    pdf.destroy.mockResolvedValue(undefined);
    vi.stubGlobal('Worker', class { terminate = pdf.terminate; });
  });
  afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

  it('renders all pages from the stored artifact before enabling print content', async () => {
    const source = documentWithText('Employee ESI 75.00 Net pay 9925.00', 2);
    pdf.getDocument.mockReturnValue({ promise: Promise.resolve(source), destroy: pdf.destroy });
    const contentRef = createRef<HTMLDivElement>();
    const ready = vi.fn();
    render(<PayslipPdfViewer url="blob:issued-pdf" title="Official payslip PDF, revision 4" contentRef={contentRef} onReady={ready} />);
    await waitFor(() => expect(ready).toHaveBeenLastCalledWith('blob:issued-pdf'));
    expect(pdf.getDocument).toHaveBeenCalledWith(expect.objectContaining({ url: 'blob:issued-pdf' }));
    expect(contentRef.current?.querySelectorAll('canvas')).toHaveLength(2);
    expect(screen.getAllByText('Employee ESI 75.00 Net pay 9925.00')).toHaveLength(2);
    expect(source.getPage).toHaveBeenNthCalledWith(1, 1);
    expect(source.getPage).toHaveBeenNthCalledWith(2, 2);
  });

  it('does not publish a late document after selection changes', async () => {
    let resolveOld!: (value: ReturnType<typeof documentWithText>) => void;
    pdf.getDocument.mockReturnValueOnce({ promise: new Promise((resolve) => { resolveOld = resolve; }), destroy: pdf.destroy })
      .mockReturnValueOnce({ promise: Promise.resolve(documentWithText('New employee')), destroy: pdf.destroy });
    const ready = vi.fn();
    const contentRef = createRef<HTMLDivElement>();
    const { rerender } = render(<PayslipPdfViewer url="blob:old" title="Payslip" contentRef={contentRef} onReady={ready} />);
    await waitFor(() => expect(pdf.getDocument).toHaveBeenCalledTimes(1));
    rerender(<PayslipPdfViewer url="blob:new" title="Payslip" contentRef={contentRef} onReady={ready} />);
    await waitFor(() => expect(ready).toHaveBeenLastCalledWith('blob:new'));
    await act(async () => { resolveOld(documentWithText('Previous employee')); });
    expect(screen.queryByText('Previous employee')).not.toBeInTheDocument();
    expect(ready).not.toHaveBeenCalledWith('blob:old');
    expect(pdf.destroy).toHaveBeenCalled();
    expect(pdf.terminate).toHaveBeenCalled();
  });

  it('zooms the same stored pages without refetching or including view controls in print content', async () => {
    const source = documentWithText('Employee ESI 75.00 Net pay 9925.00');
    pdf.getDocument.mockReturnValue({ promise: Promise.resolve(source), destroy: pdf.destroy });
    const contentRef = createRef<HTMLDivElement>();
    const ready = vi.fn();
    render(<PayslipPdfViewer url="blob:issued-pdf" title="Official payslip PDF" contentRef={contentRef} onReady={ready} />);
    await waitFor(() => expect(ready).toHaveBeenLastCalledWith('blob:issued-pdf'));
    const originalCanvas = contentRef.current?.querySelector('canvas');

    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'PDF zoom' }));
    fireEvent.click(screen.getByRole('option', { name: /^150%$/ }));
    await waitFor(() => expect(getComputedStyle(contentRef.current!).width).toBe('892.5px'));
    expect(screen.getByRole('region', { name: 'Payslip PDF viewer' })).toHaveAttribute('tabindex', '0');
    expect(contentRef.current?.querySelector('canvas')).toBe(originalCanvas);
    expect(contentRef.current?.textContent).toBe('Employee ESI 75.00 Net pay 9925.00');
    expect(contentRef.current?.querySelector('[role="combobox"]')).toBeNull();
    expect(pdf.getDocument).toHaveBeenCalledTimes(1);
    expect(source.getPage).toHaveBeenCalledTimes(1);

    fireEvent.mouseDown(screen.getByRole('combobox', { name: 'PDF zoom' }));
    fireEvent.click(screen.getByRole('option', { name: /^Fit width$/ }));
    await waitFor(() => expect(getComputedStyle(contentRef.current!).width).toBe('100%'));
    expect(contentRef.current?.querySelector('canvas')).toBe(originalCanvas);
  });

  it('announces unmapped source glyphs without guessing letters or changing the PDF source', async () => {
    const source = documentWithText('Synthe\u0000c Employee ESI 75.00 Net pay 9925.00');
    pdf.getDocument.mockReturnValue({ promise: Promise.resolve(source), destroy: pdf.destroy });
    const contentRef = createRef<HTMLDivElement>();
    const ready = vi.fn();
    render(<PayslipPdfViewer url="blob:unchanged-issued-pdf" title="Official payslip PDF" contentRef={contentRef} onReady={ready} />);
    await waitFor(() => expect(ready).toHaveBeenLastCalledWith('blob:unchanged-issued-pdf'));
    const extracted = contentRef.current?.querySelector('.payslip-pdf-text')?.textContent;
    expect(extracted).toBe('Text extraction is incomplete for this page. Synthe[unmapped PDF glyph]c Employee ESI 75.00 Net pay 9925.00');
    expect(extracted).not.toContain('\u0000');
    expect(extracted).not.toContain('Synthetic');
    expect(pdf.getDocument).toHaveBeenCalledWith(expect.objectContaining({ url: 'blob:unchanged-issued-pdf' }));
    expect(contentRef.current?.querySelectorAll('canvas')).toHaveLength(1);
  });

  it('reads a recorded PDF span without substituting API fields or changing the rendered artifact', async () => {
    const source = documentWithText('');
    const page = await source.getPage();
    page.getTextContent.mockResolvedValue({ items: [
      { type: 'beginMarkedContentProps', id: 'employee-name' }, { str: 'દી\u0000િ શાહ' },
      { type: 'endMarkedContent' }, { str: 'Employee ESI Rs. 75.00' },
    ] });
    page.getStructTree.mockResolvedValue({ role: 'Root', children: [{ role: 'Span',
      alt: 'દીપ્તિ શાહ', children: [{ type: 'content', id: 'employee-name' }],
    }] });
    pdf.getDocument.mockReturnValue({ promise: Promise.resolve(source), destroy: pdf.destroy });
    const contentRef = createRef<HTMLDivElement>();
    const ready = vi.fn();
    render(<PayslipPdfViewer url="blob:stored-gujarati-pdf" title="Official payslip PDF" contentRef={contentRef} onReady={ready} />);
    await waitFor(() => expect(ready).toHaveBeenLastCalledWith('blob:stored-gujarati-pdf'));
    expect(contentRef.current?.querySelector('.payslip-pdf-text')?.textContent).toBe('દીપ્તિ શાહ Employee ESI Rs. 75.00');
    expect(page.getTextContent).toHaveBeenCalledWith({ includeMarkedContent: true });
    expect(page.render).toHaveBeenCalledTimes(1);
    expect(pdf.getDocument).toHaveBeenCalledWith(expect.objectContaining({ url: 'blob:stored-gujarati-pdf' }));
  });

  it('keeps incomplete pages non-printable and retries a rendering failure', async () => {
    pdf.getDocument.mockImplementationOnce(() => ({ promise: Promise.reject(new Error('Unreadable PDF')), destroy: pdf.destroy }))
      .mockReturnValueOnce({ promise: Promise.resolve(documentWithText('Recovered PDF')), destroy: pdf.destroy });
    const ready = vi.fn();
    render(<PayslipPdfViewer url="blob:issued" title="Payslip" contentRef={createRef<HTMLDivElement>()} onReady={ready} />);
    await screen.findByText('The payslip PDF could not be displayed.');
    expect(ready).not.toHaveBeenCalledWith('blob:issued');
    expect(screen.getByRole('combobox', { name: 'PDF zoom' })).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    await waitFor(() => expect(ready).toHaveBeenLastCalledWith('blob:issued'));
    expect(screen.getByText('Recovered PDF')).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: 'PDF zoom' })).not.toHaveAttribute('aria-disabled', 'true');
  });
});
