'use client';

import type {
  SalarySummaryLine,
  SalaryStatutorySummary,
} from 'src/redux/hr/compensation-revision-api';

import { formatPayrollCurrency } from 'src/utils/payroll-currency';
import {
  Box,
  Card,
  Chip,
  Grid,
  Stack,
  Divider,
  CardHeader,
  Typography,
  CardContent,
} from '@mui/material';

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
    <Card component="section" aria-label="Statutory deductions" sx={{ minWidth: 0 }}>
      <CardHeader title="Statutory deductions" titleTypographyProps={{ component: 'h2' }} />
      <CardContent>
        <Stack spacing={2} divider={<Divider sx={{ borderStyle: 'dashed' }} />}>
          {schemes.map((scheme) => (
            <Box
              key={scheme.scheme}
              sx={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))',
                gap: 2,
                alignItems: 'start',
              }}
            >
              <Stack spacing={1} sx={{ minWidth: 0 }}>
                <Stack direction="row" alignItems="center" spacing={1} useFlexGap flexWrap="wrap">
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
                  alignSelf: 'center',
                }}
              >
                <Box
                  sx={{
                    textAlign: 'right',
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
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    School
                  </Typography>
                  <Typography variant="body2">{money(scheme.employerAmount)}</Typography>
                </Box>
              </Box>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
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
    <Card sx={{ minWidth: 0 }}>
      <CardContent>
        <Box
          component="dl"
          sx={{
            m: 0,
            display: 'grid',
            gridTemplateColumns: {
              xs: 'repeat(2, minmax(0, 1fr))',
              md: 'repeat(4, minmax(0, 1fr))',
            },
            gap: 3,
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
            <Box key={label} sx={{ minWidth: 0 }}>
              <Typography component="dt" variant="caption" color="text.secondary">
                {label}
              </Typography>
              <Typography
                component="dd"
                variant="h5"
                sx={{ m: 0, fontVariantNumeric: 'tabular-nums', overflowWrap: 'anywhere' }}
              >
                {money(value)}
              </Typography>
            </Box>
          ))}
        </Box>
      </CardContent>
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
    <Card component="section" sx={{ height: 1, minWidth: 0 }}>
      <CardHeader title={title} titleTypographyProps={{ component: 'h2' }} />
      <CardContent>
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
      </CardContent>
    </Card>
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
