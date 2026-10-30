import type {
  ProrationRuleType,
  IProrationFeeHeadRule,
  IProrationRuleConfiguration,
} from '../../types/finance-policy.types';

export const isProratedModel = (model?: ProrationRuleType) =>
  model === 'DailyProration' || model === 'MonthlyProration' || model === 'FullMonthCharge';

export const enabledModels = (rule: IProrationFeeHeadRule): ProrationRuleType[] => [
  ...(rule.applyOnAdmission !== false ? [rule.ruleType] : []),
  ...(rule.applyOnEarlyWithdrawal ? [rule.earlyWithdrawalRuleType ?? 'NoProration'] : []),
];

export const isConfiguredRule = (rule: IProrationFeeHeadRule) =>
  enabledModels(rule).some((model) => model !== 'NoProration');

export const isProratedRule = (rule: IProrationFeeHeadRule) =>
  rule.feeType !== 'OneTime' && enabledModels(rule).some(isProratedModel);

export function defaultConfiguration(model: ProrationRuleType): IProrationRuleConfiguration {
  if (model === 'DailyProration') return { calculationBasis: 'CalendarDays', roundOff: 'RoundUp' };
  if (model === 'MonthlyProration') return { monthlyRule: 'ChargeNextMonth', cutOffDay: 15 };
  return {};
}

export function configurationError(model: ProrationRuleType, config: IProrationRuleConfiguration) {
  return configurationErrors(model, config)[0] ?? null;
}

export function configurationErrors(model: ProrationRuleType, config: IProrationRuleConfiguration) {
  const errors: { field: keyof IProrationRuleConfiguration; message: string }[] = [];
  if (model === 'DailyProration') {
    if (config.calculationBasis !== 'CalendarDays')
      errors.push({ field: 'calculationBasis', message: 'Calculation basis is required' });
  }
  if (model === 'MonthlyProration') {
    if (!['ChargeNextMonth', 'HalfMonthRule'].includes(config.monthlyRule ?? ''))
      errors.push({ field: 'monthlyRule', message: 'Cut-off behavior strategy is required' });
    const cutoff = config.cutOffDay;
    if (cutoff == null || !Number.isInteger(cutoff) || cutoff < 1 || cutoff > 31)
      errors.push({
        field: 'cutOffDay',
        message: 'Monthly cut-off day must be a whole number from 1 to 31',
      });
  }
  return errors;
}

// Admission presets deliberately leave the independently configured withdrawal event intact.
export function applyAdmissionPreset(rules: IProrationFeeHeadRule[], model: ProrationRuleType) {
  return rules.map((rule) =>
    rule.feeType === 'OneTime'
      ? rule
      : {
          ...rule,
          ruleType: model,
          applyOnAdmission: true,
          configuration: {
            ...defaultConfiguration(model),
            roundOff: 'RoundUp' as const,
          },
        }
  );
}
