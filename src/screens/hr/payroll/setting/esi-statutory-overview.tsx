import type {
  EsiRule,
  EsiEstablishment,
  EsiImpactPreview,
  EsiComponentTreatment,
} from 'src/redux/hr/statutory-scheme-api';

import Link from 'next/link';
import { hrPaths } from 'src/constants/hr-menus';
import { CheckCircle, ChevronRight, RadioButtonUnchecked } from '@mui/icons-material';
import {
  Box,
  Chip,
  Alert,
  Button,
  Skeleton,
  Accordion,
  Typography,
  ButtonBase,
  AccordionDetails,
  AccordionSummary,
} from '@mui/material';

import { formatEsiCurrency, formatPreviewTime, formatPayrollMonth } from './esi-statutory-utils';

type EsiStatutoryOverviewProps = {
  month: string;
  rule?: EsiRule;
  establishment?: EsiEstablishment;
  treatments?: EsiComponentTreatment[];
  isTreatmentsLoading?: boolean;
  establishmentUnavailable?: boolean;
  treatmentsError?: boolean;
  preview?: EsiImpactPreview;
  isPreviewLoading: boolean;
  previewError: boolean;
  hrefFor: (updates: Record<string, string | number | null>) => string;
  onRetryPreview: () => void;
};

type ReadinessTask = {
  label: string;
  description: string;
  status: string;
  complete: boolean;
  affectedCount?: number;
  href: string;
};

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Box sx={{ minWidth: 0, p: 1.75, borderRight: { md: 1 }, borderColor: 'divider' }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="h6" sx={{ mt: 0.25, fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </Typography>
    </Box>
  );
}

export function EsiStatutoryOverview({
  month,
  rule,
  establishment,
  treatments,
  isTreatmentsLoading = false,
  treatmentsError = false,
  establishmentUnavailable = false,
  preview,
  isPreviewLoading,
  previewError,
  hrefFor,
  onRetryPreview,
}: EsiStatutoryOverviewProps) {
  const blockingIssues = preview?.summary.blockingIssues || [];
  const unclassifiedCount =
    treatments?.filter((item) => item.treatment === 'Unclassified').length ?? 0;
  const classificationsReady =
    Boolean(treatments) && !isTreatmentsLoading && !treatmentsError && unclassifiedCount === 0;
  const previewAvailable = Boolean(preview) && !previewError && !isPreviewLoading;
  const employeeAffectedCount = preview?.summary.employeesNeedingAttention;
  const establishmentReady =
    !establishmentUnavailable && (establishment?.status === 'Ready' || establishment?.status === 'Active');
  const tasks: ReadinessTask[] = [
    {
      label: 'Establishment details',
      description: establishmentReady
        ? 'Registration and coverage dates are ready.'
        : 'Complete registration, headcount, and coverage dates.',
      status: establishmentUnavailable ? 'Unavailable' : establishmentReady ? 'Complete' : 'Needs attention',
      complete: establishmentReady,
      href: `${hrefFor({ view: 'advanced' })}#establishment`,
    },
    {
      label: 'Earning classifications',
      description: isTreatmentsLoading
        ? 'Checking active earning treatments.'
        : treatmentsError
          ? 'Classification status could not be loaded.'
          : unclassifiedCount
            ? 'Classify earnings that still need a statutory treatment.'
            : 'Every active earning has an ESI treatment.',
      status: isTreatmentsLoading
        ? 'Checking'
        : treatmentsError
          ? 'Unavailable'
          : unclassifiedCount
            ? 'Needs attention'
            : 'Complete',
      complete: classificationsReady,
      affectedCount: treatments && !treatmentsError ? unclassifiedCount : undefined,
      href: `${hrefFor({ view: 'advanced' })}#earning-classifications`,
    },
    {
      label: 'Employee coverage',
      description: !previewAvailable
        ? 'Load the monthly impact to check employee coverage.'
        : employeeAffectedCount
        ? 'Review enrollment, evidence, or compensation revisions.'
        : 'Employee coverage records are ready for this month.',
      status: !previewAvailable ? (previewError ? 'Unavailable' : 'Checking') : employeeAffectedCount ? 'Needs attention' : 'Complete',
      complete: previewAvailable && employeeAffectedCount === 0,
      affectedCount: previewAvailable ? employeeAffectedCount : undefined,
      href: hrefFor({
        view: 'employees',
        readiness: employeeAffectedCount ? 'needsAttention' : 'all',
        page: 0,
      }),
    },
    {
      label: 'Payroll impact review',
      description: preview?.summary.canActivate
        ? `Impact generated ${formatPreviewTime(preview.generatedAtUtc)}.`
        : 'Resolve setup issues, then review the complete monthly impact.',
      status: !previewAvailable ? (previewError ? 'Unavailable' : 'Checking') : preview?.summary.canActivate ? (establishment?.status === 'Active' ? 'Ready to review' : 'Ready to approve') : 'Needs attention',
      complete: previewAvailable && Boolean(preview?.summary.canActivate),
      href: '#monthly-impact',
    },
  ];

  return (
    <Box sx={{ display: 'grid', gap: 2.5 }}>
      {rule ? (
        <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, minmax(0, 1fr))',
                md: 'repeat(4, minmax(0, 1fr))',
              },
            }}
          >
            <Metric label="Standard ceiling" value={formatEsiCurrency(rule.standardWageCeiling)} />
            <Metric label="PwD ceiling" value={formatEsiCurrency(rule.disabilityWageCeiling)} />
            <Metric label="Employee contribution" value={`${rule.employeePercentage}%`} />
            <Metric label="Employer contribution" value={`${rule.employerPercentage}%`} />
          </Box>
          <Accordion disableGutters elevation={0} sx={{ borderTop: 1, borderColor: 'divider' }}>
            <AccordionSummary expandIcon={<ChevronRight />} sx={{ minHeight: 44 }}>
              <Typography variant="body2" fontWeight={600}>
                Rule details
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="text.secondary">
                Rule version {rule.version}, effective {rule.effectiveFrom.slice(0, 10)}.
                Contributions use{' '}
                {rule.roundingPolicy === 'NextHigherRupee'
                  ? 'next-higher-rupee rounding'
                  : rule.roundingPolicy}
                . Source verified {rule.sourceVerifiedOn.slice(0, 10)}.
              </Typography>
              <Button
                component="a"
                href={rule.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                sx={{ mt: 1, minHeight: 44 }}
              >
                Open verified government source
              </Button>
            </AccordionDetails>
          </Accordion>
        </Box>
      ) : null}

      <Box id="setup-readiness">
        <Typography variant="h6">Setup readiness</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Complete these tasks in any order. Each row opens the place where the issue can be
          resolved.
        </Typography>
        <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 2, overflow: 'hidden' }}>
          {tasks.map((task, index) => (
            <ButtonBase
              key={task.label}
              component={Link}
              href={task.href}
              sx={{
                width: '100%',
                minHeight: 64,
                p: 1.5,
                gap: 1.5,
                justifyContent: 'flex-start',
                textAlign: 'left',
                '&:focus-visible': { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: -2 },
                borderBottom: index < tasks.length - 1 ? 1 : 0,
                borderColor: 'divider',
              }}
            >
              {task.complete ? (
                <CheckCircle color="success" />
              ) : (
                <RadioButtonUnchecked color="warning" />
              )}
              <Box minWidth={0} flex={1}>
                <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
                  <Typography variant="subtitle2">{task.label}</Typography>
                  <Chip
                    size="small"
                    color={task.complete ? 'success' : 'warning'}
                    label={task.status}
                  />
                  {task.affectedCount ? (
                    <Typography variant="caption" color="text.secondary">
                      {task.affectedCount} affected
                    </Typography>
                  ) : null}
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {task.description}
                </Typography>
              </Box>
              <ChevronRight color="action" />
            </ButtonBase>
          ))}
        </Box>
      </Box>

      <Box id="monthly-impact">
        <Typography variant="h6">{formatPayrollMonth(month)} impact</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Estimated ESI on approved monthly salary. Totals cover all employees in your scope,
          even when the employee table is filtered. Attendance-adjusted amounts appear in payroll.
        </Typography>
        <Button component={Link} href={`${hrPaths.payroll.runPayroll}?month=${month}`} sx={{ minHeight: 44, mb: 1 }}>
          Review attendance-adjusted payroll
        </Button>
        {previewError ? (
          <Alert severity="error" action={<Button onClick={onRetryPreview}>Retry</Button>}>
            The monthly ESI impact could not be loaded.
          </Alert>
        ) : null}
        {isPreviewLoading && !preview ? (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(4, 1fr)' },
              gap: 1,
            }}
          >
            {[1, 2, 3, 4].map((item) => (
              <Skeleton key={item} variant="rounded" height={76} />
            ))}
          </Box>
        ) : null}
        {preview ? (
          <>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(2, minmax(0, 1fr))',
                  md: 'repeat(4, minmax(0, 1fr))',
                },
                border: 1,
                borderColor: 'divider',
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <Metric label="Employees reviewed" value={String(preview.summary.employeeCount)} />
              <Metric
                label="Covered employees"
                value={String(preview.summary.coveredEmployeeCount)}
              />
              <Metric
                label="Employee deductions"
                value={formatEsiCurrency(preview.summary.employeeContributionTotal)}
              />
              <Metric
                label="Employer contribution"
                value={formatEsiCurrency(preview.summary.employerContributionTotal)}
              />
              {preview.summary.governmentContributionTotal > 0 ? (
                <Metric
                  label="Government contribution"
                  value={formatEsiCurrency(preview.summary.governmentContributionTotal)}
                />
              ) : null}
            </Box>

            {blockingIssues.length ? (
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="subtitle2">Resolve setup issues</Typography>
                <Box component="ul" sx={{ my: 0.5, pl: 2.5 }}>
                  {blockingIssues.map((issue) => (
                    <li key={issue.code}>
                      <Typography variant="body2">
                        <strong>{issue.title}:</strong> {issue.message}
                        {issue.affectedEmployeeCount
                          ? ` (${issue.affectedEmployeeCount} affected)`
                          : ''}
                      </Typography>
                    </li>
                  ))}
                </Box>
              </Alert>
            ) : previewAvailable && preview.summary.canActivate ? (
              <Alert severity="success" sx={{ mt: 2 }}>
                {establishment?.status === 'Active' ? 'ESI is active. Review this month before running payroll.' : 'This month is ready for HR review and activation.'}
              </Alert>
            ) : null}
          </>
        ) : null}
      </Box>
    </Box>
  );
}
