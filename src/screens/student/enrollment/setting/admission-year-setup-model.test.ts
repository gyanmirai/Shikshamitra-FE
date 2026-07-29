import { it, expect, describe } from 'vitest';
import {
  AdmissionCrmRouteType,
  AdmissionCrmPlacementTiming,
  AdmissionCrmAdmissionYearSetupStatus,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import {
  toAdmissionYearSetupForm,
  emptyAdmissionYearSetupForm,
  validateAdmissionYearSetupStep,
  validateAdmissionYearSetupForPublish,
} from './admission-year-setup-model';

describe('Admission Year Setup model', () => {
  it('normalizes API dates for native date fields', () => {
    const form = toAdmissionYearSetupForm({
      id: 'setup-1',
      concurrencyStamp: 'stamp-1',
      academicYearId: 'year-1',
      version: 2,
      status: AdmissionCrmAdmissionYearSetupStatus.Draft,
      inquiryOpenDate: '2026-09-01T00:00:00Z',
      inquiryCloseDate: '2027-03-31T00:00:00Z',
      registrationCloseDate: '2027-04-15T00:00:00Z',
      activationTargetDate: '2027-06-01T00:00:00Z',
      entranceExamRequired: true,
      financeVerificationRequired: false,
      placementTiming: AdmissionCrmPlacementTiming.StandardBeforeActivation,
      targetStandardIds: ['standard-1'],
      routeTypes: [AdmissionCrmRouteType.Fresh],
      stepOwners: {},
    });

    expect(form.inquiryOpenDate).toBe('2026-09-01');
    expect(form.activationTargetDate).toBe('2027-06-01');
  });

  it('requires standards and admission routes before advancing', () => {
    expect(validateAdmissionYearSetupStep(emptyAdmissionYearSetupForm, 0)).toEqual([
      'Select at least one standard that is open for admission.',
    ]);
  });

  it('rejects dates that do not follow the admission sequence', () => {
    const form = {
      ...emptyAdmissionYearSetupForm,
      targetStandardIds: ['standard-1'],
      inquiryOpenDate: '2026-09-01',
      inquiryCloseDate: '2026-08-01',
      registrationCloseDate: '2027-04-01',
      activationTargetDate: '2027-06-01',
    };

    expect(validateAdmissionYearSetupStep(form, 1)).toContain(
      'Dates must follow inquiry opening, inquiry closing, registration closing, and activation target order.'
    );
  });

  it('accepts a complete publishable setup', () => {
    const form = {
      ...emptyAdmissionYearSetupForm,
      targetStandardIds: ['standard-1'],
      inquiryOpenDate: '2026-09-01',
      inquiryCloseDate: '2027-03-31',
      registrationCloseDate: '2027-04-15',
      activationTargetDate: '2027-06-01',
    };

    expect(validateAdmissionYearSetupForPublish(form)).toEqual([]);
  });
});
