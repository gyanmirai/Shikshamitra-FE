import type { AdmissionCrmFeeComponentDto } from 'src/redux/student/admissions-crm/admissions-crm-api';

import {
  AdmissionCrmPaymentGateType,
  AdmissionCrmPaymentGateMilestone,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

export type FeePolicyTemplateId =
  | 'full-advance'
  | 'registration-only'
  | 'admission-registration'
  | 'custom';

export type FeePolicyTemplate = {
  id: FeePolicyTemplateId;
  label: string;
  description: string;
  suggestedCode: string;
  suggestedName: string;
  components: AdmissionCrmFeeComponentDto[];
  gateType: AdmissionCrmPaymentGateType;
  gateMilestone: AdmissionCrmPaymentGateMilestone;
  requiredAmount: number;
  requiredPercentage: number;
};

const component = (
  key: string,
  name: string,
  isRefundable = false
): AdmissionCrmFeeComponentDto => ({
  key,
  name,
  amount: 0,
  ownerModule: 'Finance',
  isRefundable,
  parentDescription: '',
});

export const feePolicyTemplates: FeePolicyTemplate[] = [
  {
    id: 'full-advance',
    label: '100% Before Activation',
    description: 'Collect the full quoted amount before the student record is activated.',
    suggestedCode: 'FULL-ADVANCE',
    suggestedName: '100% before activation',
    components: [component('ADMISSION_FEE', 'Admission fee'), component('TUITION_FEE', 'Tuition fee')],
    gateType: AdmissionCrmPaymentGateType.FinanceCleared,
    gateMilestone: AdmissionCrmPaymentGateMilestone.StudentActivation,
    requiredAmount: 0,
    requiredPercentage: 100,
  },
  {
    id: 'registration-only',
    label: 'Registration Fee Only',
    description: 'Collect only the registration fee before the family accepts the offer.',
    suggestedCode: 'REGISTRATION-FEE',
    suggestedName: 'Registration fee only',
    components: [component('REGISTRATION_FEE', 'Registration fee')],
    gateType: AdmissionCrmPaymentGateType.FinanceCleared,
    gateMilestone: AdmissionCrmPaymentGateMilestone.OfferAcceptance,
    requiredAmount: 0,
    requiredPercentage: 100,
  },
  {
    id: 'admission-registration',
    label: 'Admission + Registration',
    description: 'Collect admission and registration charges before final approval.',
    suggestedCode: 'ADMISSION-REGISTRATION',
    suggestedName: 'Admission and registration fees',
    components: [
      component('ADMISSION_FEE', 'Admission fee'),
      component('REGISTRATION_FEE', 'Registration fee'),
    ],
    gateType: AdmissionCrmPaymentGateType.FinanceCleared,
    gateMilestone: AdmissionCrmPaymentGateMilestone.FinalApproval,
    requiredAmount: 0,
    requiredPercentage: 100,
  },
  {
    id: 'custom',
    label: 'Custom Setup',
    description: 'Start with one blank fee line and no payment block.',
    suggestedCode: '',
    suggestedName: '',
    components: [component('', '')],
    gateType: AdmissionCrmPaymentGateType.None,
    gateMilestone: AdmissionCrmPaymentGateMilestone.StudentActivation,
    requiredAmount: 0,
    requiredPercentage: 0,
  },
];

export const cloneFeeComponents = (components: AdmissionCrmFeeComponentDto[]) =>
  components.map((item) => ({ ...item }));

export const calculateFeeTotal = (components: AdmissionCrmFeeComponentDto[]) =>
  components.reduce((sum, item) => sum + (Number.isFinite(item.amount) ? item.amount : 0), 0);

export const calculateRequiredPayment = (
  total: number,
  requiredAmount: number,
  requiredPercentage: number
) => {
  const percentageAmount = Math.max(0, total) * Math.max(0, requiredPercentage) / 100;
  return Math.min(Math.max(0, total), Math.max(0, requiredAmount, percentageAmount));
};

export const formatIndianCurrency = (amount: number) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);

export type FeePolicyValidationInput = {
  code: string;
  name: string;
  components: AdmissionCrmFeeComponentDto[];
  gateType: AdmissionCrmPaymentGateType;
  requiredAmount: number;
  requiredPercentage: number;
  gracePeriodHours: number;
  effectiveFrom: string;
  effectiveUntil: string;
};

export const validateFeePolicyDraft = (value: FeePolicyValidationInput) => {
  const errors: Record<string, string> = {};
  if (!value.code.trim()) errors.code = 'Policy code is required.';
  if (!value.name.trim()) errors.name = 'Policy name is required.';
  if (!value.components.length) errors.components = 'Add at least one fee line.';
  if (
    value.components.some(
      (item) => !item.key.trim() || !item.name.trim() || !Number.isFinite(item.amount) || item.amount < 0
    )
  ) {
    errors.components =
      'Every fee line needs an internal code, a parent label, and a non-negative amount.';
  }
  if (!Number.isFinite(value.requiredPercentage) || value.requiredPercentage < 0 || value.requiredPercentage > 100) {
    errors.requiredPercentage = 'Minimum payment must be between 0% and 100%.';
  }
  if (!Number.isFinite(value.requiredAmount) || value.requiredAmount < 0) {
    errors.requiredAmount = 'Minimum fixed amount cannot be negative.';
  }
  if (
    value.gateType === AdmissionCrmPaymentGateType.RequiredAmountConfirmed &&
    value.requiredAmount <= 0
  ) {
    errors.requiredAmount = 'Enter an amount for the required-amount confirmation.';
  }
  if (!Number.isFinite(value.gracePeriodHours) || value.gracePeriodHours < 0) {
    errors.gracePeriodHours = 'Grace hours cannot be negative.';
  }
  if (!value.effectiveFrom) errors.effectiveFrom = 'Start date is required.';
  if (value.effectiveUntil && value.effectiveFrom && value.effectiveUntil <= value.effectiveFrom) {
    errors.effectiveUntil = 'End date must be after the start date.';
  }
  return errors;
};
