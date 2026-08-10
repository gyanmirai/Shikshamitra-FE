import type {
  AdmissionCrmAdmissionYearSetupDto,
  UpdateAdmissionCrmAdmissionYearSetupDto,
} from 'src/redux/student/admissions-crm/setup-playbooks-contracts';

import {
  AdmissionCrmRouteType,
  AdmissionCrmPlacementTiming,
} from 'src/redux/student/admissions-crm/final-admission-contracts';

export type AdmissionYearSetupStep = 0 | 1 | 2 | 3;
export type AdmissionYearSetupForm = UpdateAdmissionCrmAdmissionYearSetupDto;

const dateValue = (value: string) => value.slice(0, 10);

export const emptyAdmissionYearSetupForm: AdmissionYearSetupForm = {
  concurrencyStamp: '',
  inquiryOpenDate: '',
  inquiryCloseDate: '',
  registrationCloseDate: '',
  activationTargetDate: '',
  entranceExamRequired: true,
  financeVerificationRequired: false,
  placementTiming: AdmissionCrmPlacementTiming.StandardBeforeActivation,
  defaultOwnerUserId: null,
  targetStandardIds: [],
  routeTypes: [AdmissionCrmRouteType.Fresh],
  stepOwners: {},
};

export const toAdmissionYearSetupForm = (
  setup: AdmissionCrmAdmissionYearSetupDto
): AdmissionYearSetupForm => ({
  concurrencyStamp: setup.concurrencyStamp,
  inquiryOpenDate: dateValue(setup.inquiryOpenDate),
  inquiryCloseDate: dateValue(setup.inquiryCloseDate),
  registrationCloseDate: dateValue(setup.registrationCloseDate),
  activationTargetDate: dateValue(setup.activationTargetDate),
  entranceExamRequired: setup.entranceExamRequired,
  financeVerificationRequired: setup.financeVerificationRequired,
  placementTiming: setup.placementTiming,
  defaultOwnerUserId: setup.defaultOwnerUserId ?? null,
  targetStandardIds: [...setup.targetStandardIds],
  routeTypes: [...setup.routeTypes],
  stepOwners: { ...setup.stepOwners },
});

export const validateAdmissionYearSetupStep = (
  form: AdmissionYearSetupForm,
  step: AdmissionYearSetupStep
): string[] => {
  const errors: string[] = [];

  if (step === 0) {
    if (!form.targetStandardIds.length) {
      errors.push('Select at least one standard that is open for admission.');
    }
    if (!form.routeTypes.length) {
      errors.push('Select at least one admission route.');
    }
  }

  if (step === 1) {
    const dates = [
      form.inquiryOpenDate,
      form.inquiryCloseDate,
      form.registrationCloseDate,
      form.activationTargetDate,
    ];
    if (dates.some((value) => !value)) {
      errors.push('Complete all admission dates.');
    } else if (
      form.inquiryOpenDate > form.inquiryCloseDate ||
      form.inquiryCloseDate > form.registrationCloseDate ||
      form.registrationCloseDate > form.activationTargetDate
    ) {
      errors.push(
        'Dates must follow inquiry opening, inquiry closing, registration closing, and activation target order.'
      );
    }
  }

  return errors;
};

export const validateAdmissionYearSetupForPublish = (form: AdmissionYearSetupForm): string[] =>
  ([0, 1, 2, 3] as AdmissionYearSetupStep[]).flatMap((step) =>
    validateAdmissionYearSetupStep(form, step)
  );
