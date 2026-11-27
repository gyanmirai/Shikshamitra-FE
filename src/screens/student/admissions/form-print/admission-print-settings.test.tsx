import { it, vi, expect, describe } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { DEFAULT_ADMISSION_PRINT_SETTINGS } from './form-print-model';
import { AdmissionPrintSettingsPanel } from './admission-print-settings';
import type { AdmissionPrintDefinition } from './form-print-model';

describe('basic print settings', () => {
  it('offers page fitting and per-section page controls without losing other settings', () => {
    const onChange = vi.fn();
    const settings = {
      ...DEFAULT_ADMISSION_PRINT_SETTINGS,
      advanced: { flow: { stepTitles: false } },
    };
    const form: AdmissionPrintDefinition = {
      name: 'Registration',
      sections: [{ id: 'address', code: 'ADDRESS', name: 'Address', displayOrder: 0, fields: [] }],
    };
    const { rerender } = render(
      <AdmissionPrintSettingsPanel settings={settings} onChange={onChange} form={form} />
    );
    expect(screen.getByRole('switch', { name: 'Smart page fitting' })).toBeChecked();
    fireEvent.click(screen.getByRole('switch', { name: 'Smart page fitting' }));
    expect(onChange).toHaveBeenLastCalledWith({
      ...settings,
      advanced: { flow: { stepTitles: false, smartPageFitting: false } },
    });
    fireEvent.click(screen.getByRole('switch', { name: 'Keep section together' }));
    expect(onChange).toHaveBeenLastCalledWith({
      ...settings,
      advanced: { flow: { stepTitles: false }, sections: { ADDRESS: { keepTogether: true } } },
    });
    rerender(
      <AdmissionPrintSettingsPanel
        settings={{ ...settings, advanced: { flow: { smartPageFitting: false } } }}
        onChange={onChange}
        form={form}
      />
    );
    expect(screen.getByRole('switch', { name: 'Keep section together' })).toBeChecked();
    fireEvent.click(screen.getByRole('switch', { name: 'Keep section together' }));
    expect(onChange).toHaveBeenLastCalledWith({
      ...settings,
      advanced: {
        flow: { smartPageFitting: false },
        sections: { ADDRESS: { keepTogether: false } },
      },
    });
  });
  it('changes spacing without replacing a saved print layout', () => {
    const onChange = vi.fn();
    const settings = {
      ...DEFAULT_ADMISSION_PRINT_SETTINGS,
      layout: 'spacious' as const,
      advanced: { border: { style: 'double' as const } },
    };
    render(<AdmissionPrintSettingsPanel settings={settings} onChange={onChange} />);
    expect(screen.getByRole('radio', { name: 'Simple (saved layout)' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Boxed Grid' })).not.toBeChecked();
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('radio', { name: 'Spacious' })).toBeChecked();
    fireEvent.click(screen.getByRole('radio', { name: 'Compact' }));
    expect(onChange).toHaveBeenLastCalledWith({ ...settings, layout: 'compact' });
  });

  it('switches print templates from Basic while preserving the other print settings', () => {
    const onChange = vi.fn();
    const settings = {
      ...DEFAULT_ADMISSION_PRINT_SETTINGS,
      template: 'boxed-grid' as const,
      advanced: {
        border: { enabled: true, style: 'double' as const, corners: 'rounded' as const },
      },
    };
    render(<AdmissionPrintSettingsPanel settings={settings} onChange={onChange} />);
    expect(screen.getByRole('radio', { name: 'Boxed Grid' })).toBeChecked();
    fireEvent.click(screen.getByRole('radio', { name: 'Structured Classic' }));
    expect(onChange).toHaveBeenLastCalledWith({ ...settings, template: 'structured-classic' });
  });
});
