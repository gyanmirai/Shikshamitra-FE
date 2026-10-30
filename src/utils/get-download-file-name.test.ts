import { it, expect, describe } from 'vitest';

import { getDownloadFileName } from './get-download-file-name';

describe('download filenames', () => {
  it('prefers a UTF-8 filename over its compatibility fallback', () => {
    expect(getDownloadFileName("attachment; filename=legacy.pdf; filename*=UTF-8''Receipt_Fee_FIN-2026-000001_2026-10-23.pdf")).toBe('Receipt_Fee_FIN-2026-000001_2026-10-23.pdf');
  });
  it('reads quoted and unquoted filenames', () => {
    expect(getDownloadFileName('attachment; filename="Provisional-Receipt.pdf"')).toBe('Provisional-Receipt.pdf');
    expect(getDownloadFileName('attachment; filename=Receipt.pdf')).toBe('Receipt.pdf');
  });
  it('handles missing or malformed encoded filenames', () => {
    expect(getDownloadFileName(null)).toBeNull();
    expect(getDownloadFileName("attachment; filename=fallback.pdf; filename*=UTF-8''%invalid")).toBe('fallback.pdf');
  });
});
