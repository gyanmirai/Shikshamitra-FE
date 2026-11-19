import { it, vi, expect, describe } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { DEFAULT_ADMISSION_PRINT_SETTINGS } from './form-print-model';
import { AdmissionPrintBrandingEditor } from './admission-print-branding-editor';

describe('Registration print branding placement', () => {
  it('moves and resizes the selected asset without replacing other print settings', () => {
    const onChange = vi.fn();
    const settings = {
      ...DEFAULT_ADMISSION_PRINT_SETTINGS,
      advanced: { header: { title: 'School Registration' } },
    };
    render(
      <AdmissionPrintBrandingEditor
        settings={settings}
        branding={{ logoUrl: 'data:image/png;base64,logo', bannerUrl: 'data:image/png;base64,banner' }}
        onChange={onChange}
      />
    );
    fireEvent.keyDown(screen.getByRole('button', { name: 'Move banner' }), { key: 'ArrowRight' });
    expect(onChange).toHaveBeenLastCalledWith({
      ...settings,
      advanced: {
        ...settings.advanced,
        branding: { banner: { x: 21, y: 10, width: 60, height: 80, lockAspectRatio: true } },
      },
    });
    fireEvent.keyDown(screen.getByRole('button', { name: 'Resize banner' }), { key: 'ArrowLeft' });
    expect(onChange).toHaveBeenLastCalledWith(
      expect.objectContaining({
        advanced: expect.objectContaining({
          branding: { banner: { x: 20, y: 10, width: 59, height: 78.7, lockAspectRatio: true } },
        }),
      })
    );
  });
});
