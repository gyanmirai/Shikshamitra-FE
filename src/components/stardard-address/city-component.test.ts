import { describe, expect, it } from 'vitest';

import { resolveCityComponentStateCode } from './city-component';

describe('CityComponent helpers', () => {
  it('uses the existing state ISO code when present', () => {
    expect(
      resolveCityComponentStateCode(
        { name: 'Gujarat', isoCode: 'GJ' },
        { name: 'India', isoCode: 'IN' }
      )
    ).toBe('GJ');
  });

  it('resolves a missing state ISO code from the selected country and state name', () => {
    expect(
      resolveCityComponentStateCode({ name: 'Gujarat' }, { name: 'India', isoCode: 'IN' })
    ).toBe('GJ');
  });

  it('returns an empty state code when country or state is unresolved', () => {
    expect(resolveCityComponentStateCode({ name: 'Gujarat' }, undefined)).toBe('');
    expect(resolveCityComponentStateCode(undefined, { name: 'India', isoCode: 'IN' })).toBe('');
  });
});
