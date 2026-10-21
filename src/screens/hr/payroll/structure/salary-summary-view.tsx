'use client';

import type {
  SalarySummary,
  SalarySummaryLine,
  SalaryStatutorySummary,
} from 'src/redux/hr/compensation-revision-api';

import { alpha } from '@mui/material/styles';
import { formatPayrollCurrency } from 'src/utils/payroll-currency';
import { FormSectionCard, FormSectionHeader } from 'src/components/form-section-card';
import { Box, Card, Chip, Grid, Stack, Divider, Typography, CardContent } from '@mui/material';

import { formatPayrollMonth } from '../setting/esi-statutory-utils';

const money = (amount: number | null) =>
  amount === null ? 'Unavailable' : formatPayrollCurrency(amount);
const statusLabels = {
  APPLIED: 'Applied',
  NOT_APPLICABLE: 'Not applicable',
  TURNED_OFF: 'Turned off',
  NEEDS_SETUP: 'Needs setup',
} as const;

export function StatutorySummary({ schemes }: { schemes: SalaryStatutorySummary[] }) {
  return (
    <FormSectionCard
      title="Statutory Deductions"
      icon="solar:shield-check-linear"
      titleTypographyProps={{ variant: 'subtitle1' }}
      descriptionTooltip="Applicability and monthly employee and school contributions for each statutory scheme."
      sx={{ minWidth: 0 }}
    >
      <Stack spacing={2} divider={<Divider sx={{ borderStyle: 'dashed' }} />}>
        {schemes.map((scheme) => (
          <Box
            key={scheme.scheme}
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 1fr) minmax(200px, 0.6fr)' },
              gap: 2,
              alignItems: 'start',
            }}
          >
            <Stack spacing={0.5} sx={{ minWidth: 0, overflowWrap: 'anywhere' }}>
              <Stack direction="row" alignItems="center" spacing={1} useFlexGap flexWrap="wrap">
                <Typography component="h3" variant="subtitle2">
                  {scheme.scheme === 'PT' ? 'Professional tax' : scheme.scheme}
                </Typography>
                <Chip
                  size="small"
                  variant="soft"
                  color={
                    scheme.status === 'APPLIED'
                      ? 'success'
                      : scheme.status === 'NEEDS_SETUP'
                        ? 'warning'
                        : 'default'
                  }
                  label={statusLabels[scheme.status]}
                />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {scheme.reason}
              </Typography>
              {scheme.registrationPending && (
                <Typography
                  variant="caption"
                  sx={(theme) => ({
                    color: 'warning.dark',
                    ...theme.applyStyles('dark', { color: 'warning.light' }),
                  })}
                >
                  Registration pending. Contributions still apply when eligible.
                </Typography>
              )}
            </Stack>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                gap: 2,
                alignSelf: 'stretch',
                alignItems: 'center',
                borderInlineStartWidth: { xs: 0, sm: 1 },
                borderInlineStartStyle: 'solid',
                borderColor: 'divider',
                paddingInlineStart: { xs: 0, sm: 2 },
              }}
            >
              <Box
                sx={{
                  textAlign: { xs: 'left', sm: 'right' },
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Employee
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {money(scheme.employeeAmount)}
                </Typography>
              </Box>
              <Box
                sx={{
                  textAlign: { xs: 'left', sm: 'right' },
                  fontVariantNumeric: 'tabular-nums',
                  borderInlineStart: '1px solid',
                  borderColor: 'divider',
                  paddingInlineStart: 2,
                  alignSelf: 'stretch',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  School
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {money(scheme.employerAmount)}
                </Typography>
              </Box>
            </Box>
          </Box>
        ))}
      </Stack>
    </FormSectionCard>
  );
}

type SalaryAmountsProps = {
  gross: number;
  deductions: number | null;
  net: number | null;
  employerCost: number | null;
};

function SalaryAmounts({ gross, deductions, net, employerCost }: SalaryAmountsProps) {
  return (
    <Box
      component="dl"
      sx={{
        m: 0,
        display: 'grid',
        gridTemplateColumns: {
          xs: 'repeat(2, minmax(0, 1fr))',
          md: 'repeat(4, minmax(0, 1fr))',
        },
        gap: 1.5,
      }}
    >
      {(
        [
          ['Full-month gross', gross],
          ['Estimated deductions', deductions],
          ['Estimated take-home', net],
          ['Monthly cost to school', employerCost],
        ] as const
      ).map(([label, value]) => (
        <Box
          key={label}
          sx={(theme) => ({
            minWidth: 0,
            p: { xs: 1.5, sm: 2 },
            border: 1,
            borderColor: 'divider',
            borderRadius: 1.5,
            bgcolor: 'background.neutral',
            display: 'flex',
            flexDirection: 'column',
            ...(label === 'Estimated take-home' &&
              value !== null && {
                bgcolor: alpha(theme.palette.primary.main, 0.06),
                borderColor: alpha(theme.palette.primary.main, 0.24),
              }),
          })}
        >
          <Typography component="dt" variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {label}
          </Typography>
          <Typography
            component="dd"
            variant="h5"
            sx={(theme) => ({
              m: 0,
              mt: 'auto',
              fontVariantNumeric: 'tabular-nums',
              overflowWrap: 'anywhere',
              ...(label === 'Estimated take-home' &&
                value !== null && {
                  color: 'primary.dark',
                  ...theme.applyStyles('dark', { color: 'primary.light' }),
                }),
            })}
          >
            {money(value)}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

export function SalaryTotals(props: SalaryAmountsProps) {
  return (
    <Card sx={{ minWidth: 0 }}>
      <CardContent>
        <SalaryAmounts {...props} />
      </CardContent>
    </Card>
  );
}

export function SalaryEstimateSummary({
  summary,
  month,
}: {
  summary: SalarySummary;
  month: string;
}) {
  const difference =
    summary.employerCost != null && summary.quotedEmployerCost != null
      ? summary.employerCost - summary.quotedEmployerCost
      : null;

  return (
    <Card
      component="section"
      aria-label="Full-month estimate"
      variant="outlined"
      sx={{ minWidth: 0, borderRadius: 2 }}
    >
      <Stack spacing={2.5} sx={{ p: { xs: 1.5, sm: 2 } }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          gap={1}
          useFlexGap
          flexWrap="wrap"
        >
          <FormSectionHeader
            title="Full-month estimate"
            icon="solar:wallet-linear"
            titleTypographyProps={{ variant: 'subtitle1' }}
            descriptionTooltip="Recurring salary for a full month before attendance and one-time payroll adjustments."
          />
          <Typography variant="body2" fontWeight={600}>
            {formatPayrollMonth(month)}
          </Typography>
        </Stack>
        <SalaryAmounts
          gross={summary.grossSalary}
          deductions={summary.totalDeductions}
          net={summary.netSalary}
          employerCost={summary.employerCost}
        />
      </Stack>
      {difference != null && Math.abs(difference) > 0.01 && (
        <Box
          sx={{
            px: { xs: 1.5, sm: 2 },
            py: 1.5,
            bgcolor: 'background.neutral',
            borderTop: 1,
            borderColor: 'divider',
          }}
        >
          <Typography variant="body2">
            School cost is{' '}
            <Box component="span" sx={{ fontWeight: 600 }}>
              {formatPayrollCurrency(Math.abs(difference))} {difference < 0 ? 'lower' : 'higher'}{' '}
              than saved CTC.
            </Box>
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Saved CTC: {formatPayrollCurrency(summary.quotedEmployerCost)} per month. Agreed gross
            salary remains unchanged.
          </Typography>
        </Box>
      )}
      <Box sx={{ px: { xs: 1.5, sm: 2 }, py: 1.5, borderTop: 1, borderColor: 'divider' }}>
        <Typography variant="caption" color="text.secondary" component="p">
          {summary.salaryEffectiveMonth && (
            <>
              Salary effective from {formatPayrollMonth(summary.salaryEffectiveMonth.slice(0, 7))}
              .{' '}
            </>
          )}
          Attendance and one-time adjustments are applied in Run Payroll.
        </Typography>
      </Box>
    </Card>
  );
}

function Breakdown({
  title,
  lines,
  emptyText,
}: {
  title: string;
  lines: SalarySummaryLine[];
  emptyText: string;
}) {
  return (
    <FormSectionCard
      title={title}
      icon="solar:bill-list-linear"
      titleTypographyProps={{ variant: 'subtitle1' }}
      descriptionTooltip={
        title === 'Earnings'
          ? 'Recurring salary components for the full month.'
          : title === 'Employee Deductions'
            ? 'Amounts deducted from gross salary for the selected month.'
            : 'Employer contributions included in the monthly cost to school.'
      }
      sx={{ height: 1, minWidth: 0 }}
    >
      <Stack spacing={1.5} divider={<Divider sx={{ borderStyle: 'dashed' }} />}>
        {lines.map((line, index) => (
          <Box
            key={`${line.code}-${index}`}
            sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}
          >
            <Typography variant="body2" sx={{ overflowWrap: 'anywhere', minWidth: 0 }}>
              {line.name}
            </Typography>
            <Typography
              variant="body2"
              sx={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}
            >
              {formatPayrollCurrency(line.amount)}
            </Typography>
          </Box>
        ))}
      </Stack>
      {!lines.length && (
        <Typography variant="body2" color="text.secondary" py={1}>
          {emptyText}
        </Typography>
      )}
    </FormSectionCard>
  );
}

export function SalaryBreakdown({
  earnings,
  deductions,
  employerContributions,
}: {
  earnings: SalarySummaryLine[];
  deductions: SalarySummaryLine[];
  employerContributions: SalarySummaryLine[];
}) {
  return (
    <Stack spacing={2}>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Breakdown
            title="Earnings"
            lines={earnings}
            emptyText="No recurring earnings are recorded."
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Breakdown
            title="Employee Deductions"
            lines={deductions}
            emptyText="No employee deductions apply for this month."
          />
        </Grid>
      </Grid>
      {employerContributions.length > 0 && (
        <Breakdown
          title="School Contributions"
          lines={employerContributions}
          emptyText="No school contributions apply."
        />
      )}
    </Stack>
  );
}
