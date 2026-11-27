import { createRef } from 'react';
import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import useMediaQuery from '@mui/material/useMediaQuery';

import PdfCanvas from './pdf-canvas';
import { usePdfPage } from './use-pdf-page';

vi.mock('./use-pdf-page', () => ({ usePdfPage: vi.fn() }));
vi.mock('@mui/material/useMediaQuery', () => ({ default: vi.fn(() => false) }));

describe('PDF page controls', () => {
  beforeEach(() => {
    vi.mocked(useMediaQuery).mockReturnValue(false);
    vi.mocked(usePdfPage).mockReturnValue({
      canvasRef: createRef<HTMLCanvasElement>(),
      loading: false,
      error: false,
      pageCount: 3,
      renderedPage: 2,
      revealLocation: undefined,
      failedReveal: undefined,
      hasRendered: true,
      text: '',
    });
  });

  it('offers separate zoom controls for admission print preview', () => {
    render(<PdfCanvas url="/sample.pdf" title="Registration" separateZoomControls />);
    expect(usePdfPage).toHaveBeenCalledWith('/sample.pdf', 1, 0, false, undefined, 3);
    const pageArea = screen.getByRole('region', { name: 'Registration PDF pages' });
    const sheet = screen.getByRole('img', { name: 'Registration, page 2' }).parentElement!
      .parentElement!;
    expect(pageArea).toHaveStyle({ overflow: 'visible' });
    const zoomIn = screen.getByRole('button', { name: 'Zoom in' });
    const zoomOut = screen.getByRole('button', { name: 'Zoom out' });
    expect(screen.getByRole('button', { name: 'Reset zoom' })).toHaveTextContent('100%');
    expect(zoomOut).toBeEnabled();
    fireEvent.click(zoomIn);
    expect(sheet).toHaveStyle({ width: '125%', marginLeft: 'auto', marginRight: 'auto' });
    expect(screen.getByRole('button', { name: 'Reset zoom' })).toHaveTextContent('125%');
    expect(zoomOut).toBeEnabled();
    fireEvent.click(zoomOut);
    expect(screen.getByRole('button', { name: 'Reset zoom' })).toHaveTextContent('100%');
    fireEvent.click(zoomOut);
    expect(screen.getByRole('button', { name: 'Reset zoom' })).toHaveTextContent('75%');
    expect(sheet).toHaveStyle({ width: '75%' });
    fireEvent.click(screen.getByRole('button', { name: 'Reset zoom' }));
    expect(screen.getByRole('button', { name: 'Reset zoom' })).toHaveTextContent('100%');
  });

  it('shows the following page beside the selected page only in wide editable previews', () => {
    vi.mocked(useMediaQuery).mockReturnValue(true);
    vi.mocked(usePdfPage).mockImplementation((_url, pageNumber) => ({
      canvasRef: createRef<HTMLCanvasElement>(),
      loading: false,
      error: false,
      pageCount: 3,
      renderedPage: pageNumber,
      revealLocation: undefined,
      failedReveal: undefined,
      hasRendered: true,
      text: '',
    }));
    const { rerender } = render(
      <PdfCanvas url="/sample.pdf" title="Registration" showAdjacentPage />
    );
    expect(screen.getByRole('img', { name: 'Registration, page 1' })).toBeVisible();
    expect(screen.getByRole('img', { name: 'Registration, page 2' })).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(screen.getByRole('img', { name: 'Registration, page 2' })).toBeVisible();
    expect(screen.getByRole('img', { name: 'Registration, page 3' })).toBeVisible();
    fireEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(screen.getAllByRole('img')).toHaveLength(1);
    vi.mocked(useMediaQuery).mockReturnValue(false);
    rerender(<PdfCanvas url="/sample.pdf" title="Registration" showAdjacentPage />);
    expect(screen.getAllByRole('img')).toHaveLength(1);
  });

  it('uses arrow-only controls with accessible previous and next names', () => {
    render(<PdfCanvas url="/sample.pdf" title="Registration" />);

    expect(screen.getByRole('button', { name: 'Previous page' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Previous Page' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next Page' })).not.toBeInTheDocument();
  });

  it('distinguishes page boundaries and keeps both arrows enabled between them', () => {
    render(<PdfCanvas url="/sample.pdf" title="Registration" usePageSelector />);
    const previous = screen.getByRole('button', { name: 'Previous page' });
    const next = screen.getByRole('button', { name: 'Next page' });
    expect(previous).toBeDisabled();
    expect(previous).toHaveStyle({ cursor: 'not-allowed' });
    expect(next).toBeEnabled();

    fireEvent.click(next);
    expect(previous).toBeEnabled();
    expect(next).toBeEnabled();

    fireEvent.click(next);
    expect(previous).toBeEnabled();
    expect(next).toBeDisabled();
    expect(next).toHaveStyle({ cursor: 'not-allowed' });
  });
});
