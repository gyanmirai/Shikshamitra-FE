import { Label } from 'src/components/label';
import { Stack } from '@mui/material';

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

  const label = !enabled
    ? 'Disabled'
    : daily
      ? 'Daily Proration'
      : monthly
        ? 'Monthly Proration'
        : fullMonth
          ? 'Full Month Charge'
          : 'No Proration';

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
    </Stack>
  );
}
