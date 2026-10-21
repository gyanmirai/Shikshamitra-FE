import { Label } from 'src/components/label';
import { Stack, Typography } from '@mui/material';

import type { IProrationPolicyRule } from '../../types/finance-policy.types';

const eventModel = (rule: IProrationPolicyRule, withdrawal = false) =>
  withdrawal
    ? (rule.earlyWithdrawalRuleType ??
      (rule.ruleType === 'MonthlyCutoff' ? 'FullMonthCharge' : rule.ruleType))
    : rule.ruleType;

export const hasActiveProration = (rule: IProrationPolicyRule) =>
  ((rule.applyOnAdmission ?? true) &&
    ['Daily', 'MonthlyCutoff', 'FullMonthCharge'].includes(eventModel(rule))) ||
  ((rule.applyOnEarlyWithdrawal ?? true) &&
    ['Daily', 'MonthlyCutoff', 'FullMonthCharge'].includes(eventModel(rule, true)));

export function ProrationEventDetail({
  rule,
  withdrawal = false,
}: {
  rule: IProrationPolicyRule;
  withdrawal?: boolean;
}) {
  const enabled = (withdrawal ? rule.applyOnEarlyWithdrawal : rule.applyOnAdmission) ?? true;
  const model = eventModel(rule, withdrawal);
  const daily = model === 'Daily';
  const monthly = model === 'MonthlyCutoff';
  const fullMonth = model === 'FullMonthCharge';
  const minimum = withdrawal
    ? (rule.earlyWithdrawalMinimumChargeDays ??
      (rule.earlyWithdrawalRuleType ? 0 : rule.minimumChargeDays))
    : rule.minimumChargeDays;
  const cutoff = withdrawal ? rule.earlyWithdrawalCutoffDay : rule.cutoffDay;
  const action = withdrawal ? rule.earlyWithdrawalBeforeCutoffAction : rule.afterCutoffAction;
  const label = !enabled
    ? 'Disabled'
    : daily
      ? 'Daily Proration'
      : monthly
        ? 'Monthly Proration'
        : fullMonth
          ? 'Full Month Charge'
          : 'No Proration';
  const description = !enabled
    ? 'This event does not reduce the charge.'
    : daily
      ? `Calendar Days · Minimum ${minimum ?? 0} days`
      : monthly
        ? withdrawal
          ? `On/before day ${cutoff}: ${action === 'HalfCharge' ? '50% exit month' : 'waive exit month'}; after: full exit month. Later months excluded.`
          : `On/before day ${cutoff}: full current month; after: ${action === 'HalfCharge' ? '50% current month' : 'charge from next month'}.`
        : fullMonth
          ? 'Charge touched calendar months in full.'
          : 'Full coverage amount for this event.';
  return (
    <Stack spacing={0.5} alignItems="flex-start">
      <Label
        color={
          !enabled
            ? 'default'
            : daily
              ? 'primary'
              : monthly
                ? 'info'
                : fullMonth
                  ? 'warning'
                  : 'default'
        }
      >
        {label}
      </Label>
      <Typography variant="caption" color="text.secondary">
        {description}
      </Typography>
    </Stack>
  );
}
