import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { vi, it, expect, describe, beforeEach } from 'vitest';

import PdfCanvas from './pdf-canvas';
import { usePdfPage } from './use-pdf-page';

vi.mock('./use-pdf-page', () => ({ usePdfPage: vi.fn() }));

describe('PDF page controls', () => {
  beforeEach(() => {
    vi.mocked(usePdfPage).mockReturnValue({
      canvasRef: createRef<HTMLCanvasElement>(),
      loading: false,
      error: false,
      pageCount: 3,
      renderedPage: 2,
      hasRendered: true,
      text: '',
    });
  });

  it('uses arrow-only controls with accessible previous and next names', () => {
    render(<PdfCanvas url="/sample.pdf" title="Registration" />);

    expect(screen.getByRole('button', { name: 'Previous page' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Previous Page' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next Page' })).not.toBeInTheDocument();
  });
});
