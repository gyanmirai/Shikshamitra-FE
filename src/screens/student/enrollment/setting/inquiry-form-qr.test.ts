import { vi, it, expect, describe } from 'vitest';

import { downloadInquiryFormQr, getInquiryFormQrFileName } from './inquiry-form-qr';

const { toDataURL } = vi.hoisted(() => ({
  toDataURL: vi.fn(async () => 'data:image/png;base64,generated-qr'),
}));

vi.mock('qrcode', () => ({ toDataURL }));

describe('getInquiryFormQrFileName', () => {
  it('creates a stable safe filename from the template name', () => {
    expect(getInquiryFormQrFileName('  Grade 1 / 2026 Inquiry  ')).toBe(
      'grade-1-2026-inquiry-qr.png'
    );
  });

  it('uses a safe fallback when the template name has no filename characters', () => {
    expect(getInquiryFormQrFileName('---')).toBe('inquiry-form-qr.png');
  });

  it('generates and downloads a QR code for the exact public inquiry URL', async () => {
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => undefined);

    await downloadInquiryFormQr({
      publicUrl: 'https://school.example/admissions/inquiry?template=template-1',
      templateName: 'Grade 1 Inquiry',
    });

    expect(toDataURL).toHaveBeenCalledWith(
      'https://school.example/admissions/inquiry?template=template-1',
      expect.objectContaining({ errorCorrectionLevel: 'M', width: 768 })
    );
    expect(click).toHaveBeenCalledOnce();
    expect(document.querySelector('a[download="grade-1-inquiry-qr.png"]')).toBeNull();
  });
});
