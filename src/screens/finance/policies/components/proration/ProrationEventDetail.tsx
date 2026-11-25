import { Label } from 'src/components/label';
import { Stack, Typography } from '@mui/material';

import type { IProrationPolicyRule } from '../../types/finance-policy.types';

const eventModel = (rule: IProrationPolicyRule, withdrawal = false) =>
  withdrawal
    ? (rule.earlyWithdrawalRuleType ??
      (rule.ruleType === 'MonthlyCutoff' ? 'FullMonthCharge' : rule.ruleType))
    : rule.ruleType;

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
  const day = withdrawal ? rule.earlyWithdrawalCutoffDay : rule.cutoffDay;
  const action = withdrawal ? rule.earlyWithdrawalBeforeCutoffAction : rule.afterCutoffAction;
  const cutoffBehavior =
    action === 'HalfCharge'
      ? 'Half month charge'
      : action === 'NoCharge'
        ? withdrawal
          ? 'Waive exit month'
          : 'Charge from next month'
        : undefined;

  const label = !enabled
    ? 'Disabled'
    : daily
      ? 'Daily proration'
      : monthly || fullMonth
        ? 'Monthly proration'
        : 'No proration';

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
      {enabled && daily && <Typography variant="caption">Calendar days</Typography>}
      {enabled && fullMonth && <Typography variant="caption">Full month charge</Typography>}
      {enabled && monthly && cutoffBehavior && (
        <Typography variant="caption">{cutoffBehavior}</Typography>
      )}
      {enabled && monthly && day != null && (
        <Typography variant="caption">Monthly cut-off day {day}</Typography>
      )}
    </Stack>
  );
}
