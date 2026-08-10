import type {
  AdmissionCrmForecastDto,
  AdmissionCrmAdmissionReportDto,
  AdmissionCrmAnalyticsSummaryDto,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import {
  Box,
  Alert,
  Stack,
  Paper,
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  TableContainer,
} from '@mui/material';

const integerFormatter = new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 });
const percentFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 1,
  style: 'percent',
});

const Metric = ({ label, value, hint }: { label: string; value: string; hint?: string }) => (
  <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1, minWidth: 0 }}>
    <Typography variant="h6" sx={{ fontVariantNumeric: 'tabular-nums' }}>
      {value}
    </Typography>
    <Typography variant="caption" color="text.secondary" display="block">
      {label}
    </Typography>
    {hint ? (
      <Typography variant="caption" color="text.secondary" display="block">
        {hint}
      </Typography>
    ) : null}
  </Paper>
);

const comparisonRows = [
  ['Total applicants', 'totalApplicantCount'],
  ['Open applicants', 'openApplicantCount'],
  ['Activated', 'activatedApplicantCount'],
  ['Rejected or ineligible', 'rejectedApplicantCount'],
  ['Withdrawn', 'withdrawnApplicantCount'],
] as const satisfies ReadonlyArray<
  readonly [string, keyof AdmissionCrmAdmissionReportDto]
>;

export function AdmissionIntelligencePanel({
  summary,
  forecast,
  currentReport,
  comparisonReport,
  comparisonName,
}: {
  summary?: AdmissionCrmAnalyticsSummaryDto;
  forecast?: AdmissionCrmForecastDto;
  currentReport?: AdmissionCrmAdmissionReportDto;
  comparisonReport?: AdmissionCrmAdmissionReportDto;
  comparisonName?: string;
}) {
  if (!summary && !forecast && !comparisonReport) return null;

  return (
    <Stack spacing={1.5}>
      <Box>
        <Typography variant="h6">Enrollment intelligence</Typography>
        <Typography variant="body2" color="text.secondary">
          Advisory demand, capacity, funnel health, and service-risk signals for operational planning.
        </Typography>
      </Box>

      {forecast ? (
        <>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, minmax(0, 1fr))',
                md: 'repeat(3, minmax(0, 1fr))',
                xl: 'repeat(6, minmax(0, 1fr))',
              },
              gap: 1,
            }}
          >
            <Metric
              label="Projected additional activations"
              value={integerFormatter.format(forecast.projectedAdditionalActivations)}
              hint={`${forecast.confidence} confidence`}
            />
            <Metric
              label="Projected accepted offers"
              value={integerFormatter.format(forecast.projectedAdditionalAcceptedOffers)}
              hint={`${percentFormatter.format(forecast.observedOfferAcceptanceRate)} observed yield`}
            />
            <Metric
              label={
                forecast.capacityIsScopeComplete && forecast.projectedSeatSurplus < 0
                  ? 'Projected seat shortfall'
                  : 'Projected seats remaining'
              }
              value={
                forecast.capacityIsScopeComplete
                  ? integerFormatter.format(Math.abs(forecast.projectedSeatSurplus))
                  : '—'
              }
              hint={
                forecast.capacityIsScopeComplete
                  ? `${integerFormatter.format(forecast.remainingSeatCapacity)} currently available`
                  : 'Academic-year-wide scope required'
              }
            />
            <Metric
              label="First responses at risk"
              value={integerFormatter.format(forecast.firstResponseAtRiskCount)}
              hint="At least 75% of SLA elapsed"
            />
            <Metric
              label="Unanswered SLA breaches"
              value={integerFormatter.format(forecast.firstResponseAlreadyBreachedCount)}
            />
            <Metric
              label="Active approved capacity"
              value={
                forecast.capacityIsScopeComplete
                  ? integerFormatter.format(forecast.approvedSeatCapacity)
                  : '—'
              }
            />
          </Box>
          <Alert severity="info">
            This forecast is advisory. It uses current-cycle operational data and cannot make or change an admission decision.
          </Alert>
          {!forecast.capacityIsScopeComplete ? (
            <Alert severity="warning">
              Capacity totals are hidden because your current data scope does not cover the full academic year.
            </Alert>
          ) : null}
        </>
      ) : null}

      {summary ? (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' },
            gap: 1,
          }}
        >
          <Metric
            label="Registration completion"
            value={`${summary.registrationAnalytics.completionRate.toFixed(1)}%`}
          />
          <Metric
            label="Abandoned registrations"
            value={integerFormatter.format(summary.registrationAnalytics.abandonedCount)}
          />
          <Metric
            label="First-response SLA missed"
            value={integerFormatter.format(summary.slaAnalytics.firstResponseSlaMissedCount)}
            hint={`${summary.slaAnalytics.firstResponseSlaMissedRate.toFixed(1)}% of applicants`}
          />
          <Metric
            label="Overdue follow-ups"
            value={integerFormatter.format(summary.taskAnalytics.overdueCount)}
          />
        </Box>
      ) : null}

      {currentReport && comparisonReport ? (
        <Paper variant="outlined" sx={{ borderRadius: 1, overflow: 'hidden' }}>
          <Box sx={{ px: 1.5, pt: 1.5 }}>
            <Typography variant="subtitle2">Cross-cycle comparison</Typography>
            <Typography variant="caption" color="text.secondary">
              Current cycle compared with {comparisonName || 'the selected cycle'} for the same date filter.
            </Typography>
          </Box>
          <TableContainer>
            <Table size="small" aria-label="Cross-cycle enrollment comparison">
              <TableHead>
                <TableRow>
                  <TableCell>Measure</TableCell>
                  <TableCell align="right">Current</TableCell>
                  <TableCell align="right">Comparison</TableCell>
                  <TableCell align="right">Change</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {comparisonRows.map(([label, key]) => {
                  const current = currentReport[key] as number;
                  const comparison = comparisonReport[key] as number;
                  const change = current - comparison;
                  return (
                    <TableRow key={key}>
                      <TableCell>{label}</TableCell>
                      <TableCell align="right">{integerFormatter.format(current)}</TableCell>
                      <TableCell align="right">{integerFormatter.format(comparison)}</TableCell>
                      <TableCell align="right">
                        {change > 0 ? '+' : ''}
                        {integerFormatter.format(change)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ) : null}
    </Stack>
  );
}
