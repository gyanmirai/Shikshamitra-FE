import { it, vi, expect, describe } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { DEFAULT_ADMISSION_PRINT_SETTINGS } from './form-print-model';
import { AdmissionPrintSettingsPanel } from './admission-print-settings';

describe('print template choices', () => {
  it('changes template independently of spacing and branding', () => {
    const onChange = vi.fn();
    const settings = {
      ...DEFAULT_ADMISSION_PRINT_SETTINGS,
      template: 'boxed-grid' as const,
      layout: 'spacious' as const,
    };
    render(<AdmissionPrintSettingsPanel settings={settings} onChange={onChange} branding={{}} />);
    expect(screen.getByRole('radio', { name: /Boxed Grid/ })).toBeChecked();
    fireEvent.click(screen.getByRole('radio', { name: /Structured Classic/ }));
    expect(onChange).toHaveBeenLastCalledWith({ ...settings, template: 'structured-classic' });
    fireEvent.click(screen.getByRole('radio', { name: 'Compact' }));
    expect(onChange).toHaveBeenLastCalledWith({ ...settings, layout: 'compact' });
  });

  it('keeps the saved legacy layout selected until explicitly changed', () => {
    render(
      <AdmissionPrintSettingsPanel
        settings={DEFAULT_ADMISSION_PRINT_SETTINGS}
        onChange={vi.fn()}
        branding={{}}
      />
    );
    expect(screen.getByRole('radio', { name: /Simple/ })).toBeChecked();
  });
});
