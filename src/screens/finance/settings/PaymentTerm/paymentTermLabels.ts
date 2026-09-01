import type { DemandGenerationRule, HolidayShiftingMethod } from './type';

const DEMAND_GENERATION_RULE_LABELS: Record<DemandGenerationRule, string> = {
  OnInstallmentStartDate: 'On Installment Start Date',
  XDaysBeforeDue: 'X Days Before Due',
  OnDueDate: 'On Due Date',
  SpecificDate: 'Specific Date',
};

const HOLIDAY_SHIFTING_METHOD_LABELS: Record<HolidayShiftingMethod, string> = {
  None: 'None',
  NextWorkingDay: 'Next Working Day',
  PreviousWorkingDay: 'Previous Working Day',
};

export const getDemandGenerationRuleLabel = (rule: DemandGenerationRule) =>
  DEMAND_GENERATION_RULE_LABELS[rule];

export const getHolidayShiftingMethodLabel = (method: HolidayShiftingMethod) =>
  HOLIDAY_SHIFTING_METHOD_LABELS[method];
