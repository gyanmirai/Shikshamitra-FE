import { vi, it, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';

import OtpInputField from './index';

describe('OtpInputField accessibility', () => {
  it('associates each visible label and helper with its own input', () => {
    render(
      <>
        <OtpInputField
          label="Aadhaar number"
          value=""
          maxLength={12}
          onChange={vi.fn()}
          helperText="Enter 12 digits."
        />
        <OtpInputField
          label="PAN number"
          value=""
          maxLength={10}
          onChange={vi.fn()}
          helperText="Enter your PAN."
        />
      </>
    );

    const aadhaar = screen.getByRole('textbox', { name: 'Aadhaar number' });
    const pan = screen.getByRole('textbox', { name: 'PAN number' });
    expect(aadhaar.id).not.toBe(pan.id);
    expect(aadhaar).toHaveAccessibleDescription('Enter 12 digits.');
    expect(pan).toHaveAccessibleDescription('Enter your PAN.');
  });

  it('exposes validation errors and preserves disabled state', () => {
    const { rerender } = render(
      <OtpInputField
        label="Aadhaar number"
        value=""
        maxLength={12}
        onChange={vi.fn()}
        error
        helperText="Aadhaar number is required."
        disabled
      />
    );

    const input = screen.getByRole('textbox', { name: 'Aadhaar number' });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription('Aadhaar number is required.');
    expect(input).toBeDisabled();

    rerender(<OtpInputField label="Aadhaar number" value="" maxLength={12} onChange={vi.fn()} />);
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).not.toHaveAttribute('aria-describedby');
    expect(input).not.toBeDisabled();
  });
});
