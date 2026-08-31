import { it, expect, describe } from 'vitest';

import {
  FeeHeadModule,
  FEE_HEAD_MODULE_VALUES,
  getFeeHeadModuleDisplayName,
} from './feeHeadModuleApi';

describe('FeeHeadModule', () => {
  it('uses the numeric values from the backend contract', () => {
    expect(FeeHeadModule.Dashboard).toBe(0);
    expect(FeeHeadModule.Library).toBe(8);
    expect(FEE_HEAD_MODULE_VALUES).toContain(FeeHeadModule.Library);
  });

  it('renders backend numeric values as user-facing labels', () => {
    expect(getFeeHeadModuleDisplayName(8)).toBe('Library');
    expect(getFeeHeadModuleDisplayName(null)).toBe('-');
  });
});
