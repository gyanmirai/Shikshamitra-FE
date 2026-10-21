import type { EsiRule } from 'src/redux/hr/statutory-scheme-api';

import { Alert, Stack, Button, Skeleton, Typography } from '@mui/material';

import { formatEsiCurrency } from './esi-statutory-utils';

type Props = {
  rules: { data?: EsiRule; isError: boolean; refetch: () => unknown };
};

export function EsiAutomaticCalculation({ rules }: Props) {
  if (rules.isError)
    return (
      <Alert severity="error" action={<Button onClick={() => rules.refetch()}>Retry</Button>}>
        Statutory rates could not be loaded.
      </Alert>
    );
  if (!rules.data) return <Skeleton aria-label="Loading statutory rates" />;
  const rule = rules.data;
  return (
    <Stack spacing={1}>
      <Typography variant="body2" color="text.secondary">
        Calculated automatically · Employee {rule.employeePercentage}% · School{' '}
        {rule.employerPercentage}%
      </Typography>
    </Stack>
  );
}

export function esiCalculationHelp(rule?: EsiRule): string {
  const explanation =
    'Eligibility uses full-month ESIC wages. Contributions use payable ESIC wages after attendance adjustments. Salary components define what is included. Contribution-period continuity is applied automatically. Each share is rounded up to the next rupee.';
  return rule
    ? `${explanation} The standard monthly wage ceiling is ${formatEsiCurrency(rule.standardWageCeiling)}; for persons with disability it is ${formatEsiCurrency(rule.disabilityWageCeiling)}. Average daily wages up to ${formatEsiCurrency(rule.employeeShareDailyWageExemption)} are exempt from the employee share; the school share still applies.`
    : explanation;
}
