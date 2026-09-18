import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';

import { it, expect, describe } from 'vitest';

import {
  canEditCycle,
  canCloseCycle,
  canDeleteCycle,
  canReopenCycle,
  canArchiveCycle,
  canPublishCycle,
  normalizeCycleCode,
} from './admission-cycle-model';

const cycle = (overrides: Partial<AdmissionCycle> = {}): AdmissionCycle => ({
  id: 'cycle-1',
  name: 'Fresh Admission',
  code: 'ADM27',
  academicYearId: 'year-1',
  academicYearName: '2027-2028',
  startDate: '2027-01-01',
  endDate: '2027-03-31',
  status: 0,
  windowStatus: 0,
  isAcceptingApplications: false,
  linkedOfferingCount: 0,
  activeOfferingCount: 0,
  applicationCount: 0,
  concurrencyStamp: 'stamp',
  ...overrides,
});

describe('admission cycle rules', () => {
  it('normalizes school-entered codes consistently', () => {
    expect(normalizeCycleCode(' adm 27 / a ')).toBe('ADM27A');
  });

  it('keeps draft actions separate from published actions', () => {
    expect(canEditCycle(cycle())).toBe(true);
    expect(canPublishCycle(cycle())).toBe(true);
    expect(canCloseCycle(cycle())).toBe(false);
    expect(canCloseCycle(cycle({ status: 1 }))).toBe(true);
  });

  it('only reopens and archives a closed cycle', () => {
    expect(canReopenCycle(cycle({ status: 2 }))).toBe(true);
    expect(canArchiveCycle(cycle({ status: 2 }))).toBe(true);
    expect(canArchiveCycle(cycle({ status: 0 }))).toBe(false);
  });

  it('only deletes a completely unused draft', () => {
    expect(canDeleteCycle(cycle())).toBe(true);
    expect(canDeleteCycle(cycle({ linkedOfferingCount: 1 }))).toBe(false);
    expect(canDeleteCycle(cycle({ applicationCount: 1 }))).toBe(false);
    expect(canDeleteCycle(cycle({ status: 2 }))).toBe(false);
  });
});
