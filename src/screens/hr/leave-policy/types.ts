export type LeaveType = 'CL' | 'SL' | 'EL' | 'LOP' | 'COMP_OFF';

export type AccrualFrequency = 'Monthly' | 'Quarterly' | 'Yearly';

export type LeavePolicyConfig = {
  id: string;
  type: LeaveType;
  name: string; // e.g., "Casual Leave"
  code: string; // e.g., "CL"
  isPaid: boolean;
  annualQuota: number;
  accrualFrequency: AccrualFrequency;
  carryForwardAllowed: boolean;
  maxCarryForwardDays?: number;
  encashable: boolean;
  encashmentLimit?: number;
  // Eligibility
  probationPeriodMonths: number;
  noticePeriodBenefit: boolean;
  // Accrual Rules (Screen 2)
  monthlyAccrualRate?: number; // e.g., 1.5 days per month
  proRata: boolean;
};

export const DEFAULT_LEAVE_TYPES: LeavePolicyConfig[] = [
  {
    id: '1',
    type: 'CL',
    name: 'Casual Leave',
    code: 'CL',
    isPaid: true,
    annualQuota: 12,
    accrualFrequency: 'Monthly',
    carryForwardAllowed: false,
    encashable: false,
    probationPeriodMonths: 0,
    noticePeriodBenefit: true,
    monthlyAccrualRate: 1,
    proRata: true,
  },
  {
    id: '2',
    type: 'SL',
    name: 'Sick Leave',
    code: 'SL',
    isPaid: true,
    annualQuota: 10,
    accrualFrequency: 'Yearly',
    carryForwardAllowed: true,
    maxCarryForwardDays: 30,
    encashable: false,
    probationPeriodMonths: 3,
    noticePeriodBenefit: true,
    proRata: false,
  },
  {
    id: '3',
    type: 'EL',
    name: 'Earned Leave',
    code: 'EL',
    isPaid: true,
    annualQuota: 15,
    accrualFrequency: 'Monthly',
    carryForwardAllowed: true,
    maxCarryForwardDays: 45,
    encashable: true,
    encashmentLimit: 15,
    probationPeriodMonths: 6,
    noticePeriodBenefit: false,
    monthlyAccrualRate: 1.25,
    proRata: true,
  },
];
