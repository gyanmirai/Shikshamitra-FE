import { it, expect, describe } from 'vitest';

import { formatAdmissionReference } from './admission-reference';

describe('formatAdmissionReference', () => {
  it('keeps the readable sequential reference format', () => {
    expect(formatAdmissionReference('INQ-2026-000042')).toBe('INQ-2026-000042');
    expect(formatAdmissionReference('APP-2026-000107')).toBe('APP-2026-000107');
  });

  it('shortens legacy generated references without changing stored values', () => {
    expect(formatAdmissionReference('INQ/2026/74e04fa07b0')).toBe('INQ-2026-74E04F');
    expect(formatAdmissionReference('APP/2026/3a23c67c84f')).toBe('APP-2026-3A23C6');
  });

  it('preserves unknown external references', () => {
    expect(formatAdmissionReference('TRANSFER-42')).toBe('TRANSFER-42');
  });
});
