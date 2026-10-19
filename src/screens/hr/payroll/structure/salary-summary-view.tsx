'use client';

import type {
  SalarySummaryLine,
  SalaryStatutorySummary,
} from 'src/redux/hr/compensation-revision-api';

import { formatPayrollCurrency } from 'src/utils/payroll-currency';
import { Box, Chip, Grid, Paper, Stack, Divider, Typography } from '@mui/material';

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
    <Stack component="section" aria-label="Statutory deductions" spacing={1}>
      <Typography variant="subtitle1">Statutory deductions</Typography>
      <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
        <Stack divider={<Divider />}>
          {schemes.map((scheme) => (
            <Box
              key={scheme.scheme}
              sx={{
                p: 1.5,
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'minmax(0, 1fr) auto',
                  md: '160px minmax(0, 1fr) 120px 120px',
                },
                gap: 1.5,
                alignItems: 'start',
              }}
            >
              <Stack spacing={0.75} alignItems="flex-start">
                <Typography variant="subtitle2">
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
              <Box
                sx={{
                  gridColumn: { xs: '1 / -1', md: 'auto' },
                  gridRow: { xs: 2, md: 'auto' },
                  minWidth: 0,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {scheme.reason}
                </Typography>
                {scheme.registrationPending && (
                  <Typography variant="caption" color="warning.dark">
                    Registration pending. Contributions still apply when eligible.
                  </Typography>
                )}
              </Box>
              <Box
                sx={{
                  textAlign: 'right',
                  gridColumn: { xs: 2, md: 'auto' },
                  gridRow: { xs: 1, md: 'auto' },
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
                  textAlign: 'right',
                  gridColumn: { xs: 2, md: 'auto' },
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  School
                </Typography>
                <Typography variant="body2">{money(scheme.employerAmount)}</Typography>
              </Box>
            </Box>
          ))}
        </Stack>
      </Paper>
    </Stack>
  );
}

export function SalaryTotals({
  gross,
  deductions,
  net,
  employerCost,
}: {
  gross: number;
  deductions: number | null;
  net: number | null;
  employerCost: number | null;
}) {
  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Box
        component="dl"
        sx={{
          m: 0,
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' },
          gap: 2,
        }}
      >
        {(
          [
            ['Full-month gross', gross],
            ['Employee deductions', deductions],
            ['Estimated take-home', net],
            ['Total school cost', employerCost],
          ] as const
        ).map(([label, value]) => (
          <Box key={label} sx={{ minWidth: 0 }}>
            <Typography component="dt" variant="caption" color="text.secondary">
              {label}
            </Typography>
            <Typography
              component="dd"
              variant="h6"
              sx={{ m: 0, fontVariantNumeric: 'tabular-nums', overflowWrap: 'anywhere' }}
            >
              {money(value)}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
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
    <Paper component="section" variant="outlined" sx={{ p: 2, height: 1, minWidth: 0 }}>
      <Typography variant="subtitle1" mb={1}>
        {title}
      </Typography>
      <Stack divider={<Divider />}>
        {lines.map((line, index) => (
          <Box
            key={`${line.code}-${index}`}
            sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, py: 1 }}
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
    </Paper>
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
            title="Employee deductions"
            lines={deductions}
            emptyText="No employee deductions apply for this month."
          />
        </Grid>
      </Grid>
      {employerContributions.length > 0 && (
        <Breakdown
          title="School contributions"
          lines={employerContributions}
          emptyText="No school contributions apply."
        />
      )}
    </Stack>
  );
}
