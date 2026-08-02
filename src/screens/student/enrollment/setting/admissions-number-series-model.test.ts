import { describe, expect, it } from 'vitest';

import { validateIdentifierSeriesStep } from './admissions-number-series-model';

const validDraft = {
  code: 'GR-MAIN',
  name: 'General register number',
  padding: '6',
  startingSequence: '1',
  maximumSequence: '999999',
  effectiveFrom: '2026-04-01',
  effectiveUntil: '2027-03-31',
};

describe('Identifier series editor validation', () => {
  it('requires identity fields before leaving the first step', () => {
    expect(validateIdentifierSeriesStep({ ...validDraft, code: '' }, 0)).toMatch(/series code/i);
  });

  it('rejects fractional and inverted number ranges', () => {
    expect(validateIdentifierSeriesStep({ ...validDraft, padding: '2.5' }, 1)).toMatch(/padding/i);
    expect(
      validateIdentifierSeriesStep(
        { ...validDraft, startingSequence: '100', maximumSequence: '99' },
        1
      )
    ).toMatch(/maximum/i);
  });

  it('rejects an invalid or inverted effective period', () => {
    expect(validateIdentifierSeriesStep({ ...validDraft, effectiveFrom: '' }, 2)).toMatch(
      /date range/i
    );
    expect(
      validateIdentifierSeriesStep(
        { ...validDraft, effectiveFrom: '2027-04-01', effectiveUntil: '2027-03-31' },
        2
      )
    ).toMatch(/date range/i);
  });
});
