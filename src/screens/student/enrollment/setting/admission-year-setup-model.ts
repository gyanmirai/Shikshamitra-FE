import type {
  AdmissionCrmAdmissionYearSetupDto,
  UpdateAdmissionCrmAdmissionYearSetupDto,
} from 'src/redux/student/admissions-crm/setup-playbooks-contracts';

import {
  AdmissionCrmRouteType,
  AdmissionCrmPlacementTiming,
} from 'src/redux/student/admissions-crm/final-admission-contracts';

import dayjs from 'dayjs';
import * as Yup from 'yup';

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

export const admissionScopeSchema = Yup.object().shape({
  targetStandardIds: Yup.array()
    .of(Yup.string())
    .min(1, 'Select at least one standard that is open for admission.'),
  routeTypes: Yup.array().of(Yup.number()).min(1, 'Select at least one admission route.'),
});

export const datesAndGatesSchema = Yup.object().shape({
  inquiryOpenDate: Yup.string()
    .required('Inquiry open date is required')
    .test(
      'is-valid-date',
      'Inquiry open date is invalid',
      (value) => !value || dayjs(value, 'YYYY-MM-DD', true).isValid()
    ),
  inquiryCloseDate: Yup.string()
    .required('Inquiry close date is required')
    .test(
      'is-valid-date',
      'Inquiry close date is invalid',
      (value) => !value || dayjs(value, 'YYYY-MM-DD', true).isValid()
    )
    .test(
      'is-after-open',
      'Inquiry close date cannot be earlier than inquiry open date',
      function (value) {
        const { inquiryOpenDate } = this.parent;
        if (!value || !inquiryOpenDate) return true;
        return dayjs(value).diff(dayjs(inquiryOpenDate), 'day') >= 0;
      }
    ),
  registrationCloseDate: Yup.string()
    .required('Registration close date is required')
    .test(
      'is-valid-date',
      'Registration close date is invalid',
      (value) => !value || dayjs(value, 'YYYY-MM-DD', true).isValid()
    )
    .test(
      'is-after-inquiry-close',
      'Registration close date cannot be earlier than inquiry close date',
      function (value) {
        const { inquiryCloseDate } = this.parent;
        if (!value || !inquiryCloseDate) return true;
        return dayjs(value).diff(dayjs(inquiryCloseDate), 'day') >= 0;
      }
    ),
  activationTargetDate: Yup.string()
    .required('Activation target date is required')
    .test(
      'is-valid-date',
      'Activation target date is invalid',
      (value) => !value || dayjs(value, 'YYYY-MM-DD', true).isValid()
    )
    .test(
      'is-after-registration-close',
      'Activation target date cannot be earlier than registration close date',
      function (value) {
        const { registrationCloseDate } = this.parent;
        if (!value || !registrationCloseDate) return true;
        return dayjs(value).diff(dayjs(registrationCloseDate), 'day') >= 0;
      }
    ),
  entranceExamRequired: Yup.boolean(),
  financeVerificationRequired: Yup.boolean(),
  placementTiming: Yup.number().required('Placement timing is required'),
});

export const ownershipSchema = Yup.object().shape({
  defaultOwnerUserId: Yup.string().nullable(),
  stepOwners: Yup.object().nullable(),
});

export const getValidationSchemaForStep = (step: AdmissionYearSetupStep) => {
  switch (step) {
    case 0:
      return admissionScopeSchema;
    case 1:
      return datesAndGatesSchema;
    case 2:
      return ownershipSchema;
    default:
      return Yup.object(); // No validation for review step
  }
};

export const admissionYearSetupPublishSchema = Yup.object().shape({
  targetStandardIds: Yup.array()
    .of(Yup.string())
    .min(1, 'Select at least one standard that is open for admission.'),
  routeTypes: Yup.array().of(Yup.number()).min(1, 'Select at least one admission route.'),
  inquiryOpenDate: Yup.string()
    .required('Inquiry open date is required')
    .test(
      'is-valid-date',
      'Inquiry open date is invalid',
      (value) => !value || dayjs(value, 'YYYY-MM-DD', true).isValid()
    ),
  inquiryCloseDate: Yup.string()
    .required('Inquiry close date is required')
    .test(
      'is-valid-date',
      'Inquiry close date is invalid',
      (value) => !value || dayjs(value, 'YYYY-MM-DD', true).isValid()
    )
    .test(
      'is-after-open',
      'Inquiry close date cannot be earlier than inquiry open date',
      function (value) {
        const { inquiryOpenDate } = this.parent;
        if (!value || !inquiryOpenDate) return true;
        return dayjs(value).diff(dayjs(inquiryOpenDate), 'day') >= 0;
      }
    ),
  registrationCloseDate: Yup.string()
    .required('Registration close date is required')
    .test(
      'is-valid-date',
      'Registration close date is invalid',
      (value) => !value || dayjs(value, 'YYYY-MM-DD', true).isValid()
    )
    .test(
      'is-after-inquiry-close',
      'Registration close date cannot be earlier than inquiry close date',
      function (value) {
        const { inquiryCloseDate } = this.parent;
        if (!value || !inquiryCloseDate) return true;
        return dayjs(value).diff(dayjs(inquiryCloseDate), 'day') >= 0;
      }
    ),
  activationTargetDate: Yup.string()
    .required('Activation target date is required')
    .test(
      'is-valid-date',
      'Activation target date is invalid',
      (value) => !value || dayjs(value, 'YYYY-MM-DD', true).isValid()
    )
    .test(
      'is-after-registration-close',
      'Activation target date cannot be earlier than registration close date',
      function (value) {
        const { registrationCloseDate } = this.parent;
        if (!value || !registrationCloseDate) return true;
        return dayjs(value).diff(dayjs(registrationCloseDate), 'day') >= 0;
      }
    ),
});

const DATE_ORDER_ERROR =
  'Dates must follow inquiry opening, inquiry closing, registration closing, and activation target order.';

const validateAdmissionYearSetupSchema = (
  schema: Yup.ObjectSchema<Record<string, unknown>>,
  form: AdmissionYearSetupForm
) => {
  try {
    schema.validateSync(form, { abortEarly: false });
    return [];
  } catch (error) {
    if (!(error instanceof Yup.ValidationError)) throw error;

    const messages = error.inner.length ? error.inner.map((issue) => issue.message) : error.errors;
    const normalizedMessages = messages.map((message) =>
      message.includes('cannot be earlier than') ? DATE_ORDER_ERROR : message
    );
    return [...new Set(normalizedMessages)];
  }
};

export const validateAdmissionYearSetupStep = (
  form: AdmissionYearSetupForm,
  step: AdmissionYearSetupStep
) => validateAdmissionYearSetupSchema(getValidationSchemaForStep(step), form);

export const validateAdmissionYearSetupForPublish = (form: AdmissionYearSetupForm) =>
  validateAdmissionYearSetupSchema(admissionYearSetupPublishSchema, form);
