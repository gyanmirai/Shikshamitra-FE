import { describe, expect, it } from 'vitest';

import {
  getAdmissionApplicationStatusColor,
  getAdmissionApplicationStatusLabel,
} from './application-status';

describe('admission application statuses', () => {
  it('keeps the complete decision lifecycle readable', () => {
    expect(getAdmissionApplicationStatusLabel(0)).toBe('Draft');
    expect(getAdmissionApplicationStatusLabel(4)).toBe('In review');
    expect(getAdmissionApplicationStatusLabel(7)).toBe('Offer issued');
    expect(getAdmissionApplicationStatusLabel(10)).toBe('Enrolled');
    expect(getAdmissionApplicationStatusLabel(99)).toBe('Unknown');
  });

  it('uses risk-aware colors for terminal decisions', () => {
    expect(getAdmissionApplicationStatusColor(3)).toBe('error');
    expect(getAdmissionApplicationStatusColor(5)).toBe('warning');
    expect(getAdmissionApplicationStatusColor(10)).toBe('success');
  });
});
