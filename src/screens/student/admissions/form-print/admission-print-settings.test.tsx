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

  it('presents Boxed Grid for a legacy layout without changing settings on mount', () => {
    const onChange = vi.fn();
    render(
      <AdmissionPrintSettingsPanel
        settings={DEFAULT_ADMISSION_PRINT_SETTINGS}
        onChange={onChange}
        branding={{}}
      />
    );
    expect(screen.getByRole('radio', { name: 'Boxed Grid' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Structured Classic' })).not.toBeChecked();
    expect(screen.queryByRole('radio', { name: /Simple/ })).not.toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });
});
