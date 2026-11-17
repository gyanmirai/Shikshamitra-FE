import type { ReactNode } from 'react';

import { StrictMode } from 'react';
import { it, vi, expect, describe, afterEach } from 'vitest';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';

import { PhotoEditorDialog } from './photo-editor-dialog';

vi.mock('src/components/customDialog', () => ({
  default: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogScrollContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));
vi.mock('src/components/confirm-dialog', () => ({ ConfirmDialog: () => null }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('./photo-preview', () => ({ PhotoPreview: () => null }));
vi.mock('./photo-background', () => ({ PhotoBackground: () => null }));
vi.mock('./photo-adjustments', () => ({ PhotoAdjustments: () => null }));
vi.mock('./image-processing', () => ({ exportPhoto: () => 'data:image/png;base64,AAAA' }));
vi.mock('./use-photo-editor', () => ({
  usePhotoEditor: () => ({
    source: {}, mask: {}, settings: {}, error: '', dirty: false, before: false,
    removal: { busy: false }, setError: vi.fn(), setBefore: vi.fn(), reset: vi.fn(),
  }),
}));

afterEach(() => vi.restoreAllMocks());

describe('photo apply lifecycle', () => {
  it('applies after Strict Mode has replayed the session effects', async () => {
    const onApply = vi.fn();
    render(<StrictMode><PhotoEditorDialog open source={{ imageData: 'data:image/png;base64,AAAA', name: 'Synthetic' }} onClose={vi.fn()} onApply={onApply} /></StrictMode>);
    fireEvent.click(screen.getByRole('button', { name: 'Apply photo' }));
    await waitFor(() => expect(onApply).toHaveBeenCalledWith('data:image/png;base64,AAAA'));
  });
  it('ignores a pending apply after its source session is unmounted', async () => {
    let frame: FrameRequestCallback | undefined;
    vi.spyOn(globalThis, 'requestAnimationFrame').mockImplementation((callback) => { frame = callback; return 1; });
    const onApply = vi.fn();
    const view = render(<PhotoEditorDialog open source={{ imageData: 'data:image/png;base64,AAAA', name: 'Synthetic' }} onClose={vi.fn()} onApply={onApply} />);
    fireEvent.click(screen.getByRole('button', { name: 'Apply photo' }));
    view.unmount();
    await act(async () => { frame?.(0); });
    expect(onApply).not.toHaveBeenCalled();
  });
});
