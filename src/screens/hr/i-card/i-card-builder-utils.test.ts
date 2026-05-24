import { it, expect, describe } from 'vitest';

import { isPdfBlob, clampCardsPerPage } from './i-card-builder-utils';

describe('Employee I-Card builder utilities', () => {
  it('clamps cards per page into the backend-supported range', () => {
    expect(clampCardsPerPage(0)).toBe(1);
    expect(clampCardsPerPage(8)).toBe(8);
    expect(clampCardsPerPage(11)).toBe(10);
  });

  it('prevents NaN and decimal card counts', () => {
    expect(clampCardsPerPage(Number.NaN)).toBe(1);
    expect(clampCardsPerPage(4.8)).toBe(4);
  });

  it('accepts only non-empty PDF blobs', async () => {
    await expect(isPdfBlob(new Blob(['%PDF-1.7'], { type: 'application/pdf' }))).resolves.toBe(
      true
    );
    await expect(
      isPdfBlob(new Blob(['{"error":true}'], { type: 'application/json' }))
    ).resolves.toBe(false);
    await expect(isPdfBlob(new Blob([], { type: 'application/pdf' }))).resolves.toBe(false);
  });
});
