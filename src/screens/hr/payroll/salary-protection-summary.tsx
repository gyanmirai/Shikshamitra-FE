import { formatCurrency } from 'src/utils/cureencyFormater';
import { Box, Grid, Alert, Typography } from '@mui/material';

export type SalaryProtectionResult = {
  policy: string;
  monthlyTarget: number;
  periodTarget: number;
  achieved: number;
  difference: number;
  recurringGross: number;
  grossAdjustment: number;
  excludedDeductions: number;
  additionalEarnings: number;
  additionalEmployeeStatutoryDeductions: number;
  additionalEmployerContributions: number;
  status: 'ADJUSTED' | 'UNCHANGED' | 'BLOCKED' | 'LEGACY';
};

export default function SalaryProtectionSummary({ result }: { result?: SalaryProtectionResult | null }) {
  if (!result) return null;
  const takeHome = result.policy === 'PROTECT_TAKE_HOME';
  return (
    <Box component="section" aria-label="Salary protection" sx={{ my: 2 }}>
      <Typography variant="subtitle2" mb={1}>
        {takeHome ? 'Protected employee take-home' : result.status === 'LEGACY' ? 'Legacy gross protection' : 'Protected school cost (CTC)'}
      </Typography>
      {result.status === 'BLOCKED' && (
        <Alert severity="error" sx={{ mb: 1 }}>
          The protected target could not be restored. Correct the earning rules or statutory setup before locking payroll.
        </Alert>
      )}
      <Grid container spacing={1}>
        {[
          ['Monthly target', result.monthlyTarget],
          ['Target for payable days', result.periodTarget],
          ['Achieved recurring amount', result.achieved],
          ['Gross adjustment', result.grossAdjustment],
          ['Other deductions', result.excludedDeductions],
          ['Additional earnings', result.additionalEarnings],
          ['Additional employee statutory deductions', result.additionalEmployeeStatutoryDeductions],
          ['Additional employer contributions', result.additionalEmployerContributions],
        ].map(([label, amount]) => (
          <Grid key={String(label)} size={{ xs: 6, md: 3 }}>
            <Typography variant="caption" color="text.secondary">{label}</Typography>
            <Typography variant="body2">{formatCurrency(Number(amount))}</Typography>
          </Grid>
        ))}
      </Grid>
      <Typography variant="caption" color="text.secondary" display="block" mt={1}>
        {takeHome
          ? 'PT, employee PF and ESI are covered by the recurring target. Other deductions reduce payout.'
          : 'The recurring target includes gross and employer contributions. Employee deductions reduce payout.'}
        {' '}The target follows payable days; statutory deductions follow their applicable period rules.
      </Typography>
    </Box>
  );
}
