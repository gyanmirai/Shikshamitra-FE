'use client';

import type { RootState } from 'src/redux/store';
import type { HrSetupReviewSection } from 'src/redux/hr/hr-setup-review-api';

import Link from 'next/link';
import { useSelector } from 'react-redux';
import { useId, useRef, useState } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CustomAccordion from 'src/components/custom-accordian';
import { hrPaths, hrPermissions } from 'src/constants/hr-menus';
import { hasGrantedPermission, hasNavigationPermission } from 'src/utils/permissions';
import {
  useGetHrSetupReviewQuery,
  useRecordHrSetupReviewMutation,
} from 'src/redux/hr/hr-setup-review-api';
import {
  Box,
  Chip,
  Alert,
  Stack,
  Button,
  Skeleton,
  Typography,
  LinearProgress,
  Link as MuiLink,
  AccordionSummary,
} from '@mui/material';

const assignments = {
  title: 'Policy Assignments',
  href: hrPaths.policies.assignments,
  description: 'Use optional staff or group assignments when the default policies should differ.',
};

const sections = [
  {
    id: 'calendar',
    label: 'Calendar and workweek',
    navigation: hrPermissions.policies.calendars,
    guide: {
      title: 'Work Calendars',
      href: hrPaths.policies.calendars,
      description:
        'Start here to review working days, weekly days off, and holidays. Attendance and payroll can use different calendars.',
    },
  },
  {
    id: 'attendance',
    label: 'Attendance thresholds and capture',
    navigation: hrPermissions.policies.attendance,
    guide: {
      title: 'Attendance Policies',
      href: hrPaths.policies.attendance,
      description: 'Choose a work calendar and set attendance expectations and holiday work rules.',
    },
  },
  {
    id: 'payroll',
    label: 'Payroll basis',
    navigation: hrPermissions.policies.payroll,
    guide: {
      title: 'Payroll Policies',
      href: hrPaths.policies.payroll,
      description:
        'Choose a work calendar and set how working days and holidays count for payroll.',
    },
  },
  {
    id: 'leave',
    label: 'Leave allocations',
    navigation: hrPermissions.policies.leavePolicies,
    guide: {
      title: 'Leave Policies',
      href: hrPaths.policies.leavePolicies,
      description:
        'Set leave entitlements and approvals. The staff member’s payroll calendar and workday rules determine how many days a request uses.',
    },
  },
  {
    id: 'sample',
    label: 'Sample staff and date check',
    navigation: hrPermissions.policies.assignments,
    guide: null,
  },
] as const;

const reviewLabels = {
  record_not_present: 'Review needed · no record',
  stale: 'Review needed · settings changed',
  reviewed: 'Reviewed for this school',
};
const configurationLabels = {
  valid: 'Defaults available',
  missing: 'Defaults missing',
  invalid: 'Configuration needs correction',
  no_staff: 'Not applicable yet · no staff',
  deferred: 'Sample check deferred',
};
const validConfigurationLabels: Partial<Record<HrSetupReviewSection, string>> = {
  calendar: 'Active calendars available',
  sample: 'Sample resolved',
};

function ReviewSection({
  academicYearId,
  section,
}: {
  academicYearId: string;
  section: (typeof sections)[number];
}) {
  const [newSample, setNewSample] = useState(false);
  const {
    currentData: data,
    isFetching,
    isError,
    refetch,
  } = useGetHrSetupReviewQuery(
    { academicYearId, section: section.id, newSample: newSample || undefined },
    { refetchOnMountOrArgChange: true }
  );
  const [record, { isLoading: saving }] = useRecordHrSetupReviewMutation();
  const [saveError, setSaveError] = useState(false);
  const [saved, setSaved] = useState(false);
  const recording = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const headingId = `setup-review-${section.id}`;
  const acknowledge = async () => {
    if (!data || saving || isFetching || recording.current) return;
    recording.current = true;
    setSaveError(false);
    setSaved(false);
    try {
      await record({
        academicYearId,
        section: section.id,
        fingerprint: data.fingerprint,
        concurrencyStamp: data.concurrencyStamp,
        employeeId: data.employeeId,
        date: data.date,
      }).unwrap();
      setSaved(true);
      heading.current?.focus();
    } catch {
      setSaveError(true);
      // Never retry a rejected acknowledgement automatically with a new fingerprint.
      refetch();
    } finally {
      recording.current = false;
    }
  };
  return (
    <Box
      component="section"
      aria-labelledby={headingId}
      aria-busy={isFetching || saving}
      sx={{
        py: 1.5,
        borderTop: 1,
        borderColor: 'divider',
        minWidth: 0,
        '& .MuiButton-root': { minHeight: 44 },
      }}
    >
      <Typography ref={heading} tabIndex={-1} id={headingId} variant="subtitle2" component="h4">
        {section.label}
      </Typography>
      {section.id === 'sample' ? (
        <Typography variant="body2" color="text.secondary">
          See which policies apply to one staff member on the displayed date.
        </Typography>
      ) : null}
      {isFetching && data ? (
        <LinearProgress aria-label={`Refreshing ${section.label}`} sx={{ my: 1 }} />
      ) : null}
      {isError ? (
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              onClick={() => {
                refetch();
              }}
            >
              Retry
            </Button>
          }
        >
          Unable to load {section.label.toLowerCase()} review. Your access or settings may have
          changed.
        </Alert>
      ) : !data ? (
        <Box role="status" aria-label={`Loading ${section.label}`}>
          <Skeleton />
          <Skeleton width="70%" />
        </Box>
      ) : (
        <Stack spacing={1} sx={{ mt: 1 }}>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Chip
              size="small"
              variant="outlined"
              label={
                data.configurationState === 'valid'
                  ? (validConfigurationLabels[section.id] ?? configurationLabels.valid)
                  : configurationLabels[data.configurationState]
              }
            />
            <Chip
              size="small"
              variant="outlined"
              color={data.reviewState === 'reviewed' ? 'success' : 'default'}
              label={reviewLabels[data.reviewState]}
            />
          </Stack>
          <Typography variant="caption" color="text.secondary">
            {data.starterInitialized
              ? 'Starter setup recorded for this academic year.'
              : 'Starter provenance not recorded for this academic year.'}{' '}
            {data.tenantStarterEnabled
              ? 'School starter setup is enabled.'
              : 'School starter setup is not enabled.'}
          </Typography>
          {data.details.map((detail, index) => (
            <Typography
              key={`${index}-${detail}`}
              variant="body2"
              sx={{ overflowWrap: 'anywhere' }}
            >
              {detail}
            </Typography>
          ))}
          {data.notices.map((notice) => (
            <Typography key={notice} variant="body2" color="text.secondary">
              {notice}
            </Typography>
          ))}
          {data.reviewedAt && data.reviewedBy ? (
            <Typography variant="caption" color="text.secondary">
              Last reviewed {new Date(data.reviewedAt).toLocaleString()} ·{' '}
              {data.reviewedByName || 'School account'}
              {data.reviewState === 'stale'
                ? ' · Previous review no longer matches current settings.'
                : ''}
            </Typography>
          ) : null}
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {data.canReview && data.reviewState !== 'reviewed' ? (
              <Button
                size="small"
                variant="outlined"
                loading={saving}
                disabled={saving || isFetching}
                onClick={acknowledge}
              >
                Record {section.label.toLowerCase()} review
              </Button>
            ) : null}
            {section.id === 'sample' ? (
              <Button
                size="small"
                disabled={saving || isFetching}
                onClick={() => {
                  setNewSample(true);
                  if (newSample) refetch();
                }}
              >
                Run sample again
              </Button>
            ) : null}
            <Button
              size="small"
              disabled={isFetching || saving}
              onClick={() => {
                setSaved(false);
                refetch();
              }}
            >
              Refresh review
            </Button>
          </Stack>
        </Stack>
      )}
      {saveError ? (
        <Alert severity="error" sx={{ mt: 1 }}>
          Review was not recorded. Review the refreshed settings and try again. Another reviewer or
          configuration edit may have changed them.
        </Alert>
      ) : null}
      {saved && !saveError ? (
        <Typography role="status" variant="body2" sx={{ mt: 1 }}>
          Review recorded.
        </Typography>
      ) : null}
    </Box>
  );
}

/** Mount outside policy drawers. No dependency on the workspace hook or draft state. */
export function HRSetupReviewChecklist({ academicYearId }: { academicYearId?: string }) {
  const disclosureId = useId();
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canViewPolicies = hasGrantedPermission(permissions, 'HR.Policies.View');
  const canViewLeave = hasGrantedPermission(
    permissions,
    'HR.LeaveManagement.Setting.LeavePolicy.View'
  );
  const canRead = (section: HrSetupReviewSection) =>
    section === 'leave' ? canViewLeave : canViewPolicies && (section !== 'sample' || canViewLeave);
  const visible = sections.filter(
    (section) => canRead(section.id) && hasNavigationPermission(permissions, section.navigation)
  );
  if (!academicYearId || !visible.length) return null;

  const guideItems = visible.flatMap(({ guide }) => (guide ? [guide] : []));
  if (canViewPolicies && hasNavigationPermission(permissions, hrPermissions.policies.assignments)) {
    guideItems.push(assignments);
  }

  return (
    <Box
      sx={{
        mb: 1,
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        bgcolor: 'background.paper',
      }}
    >
      <CustomAccordion
        title="Policy Setup Guide"
        summary={
          <AccordionSummary
            id={`${disclosureId}-summary`}
            aria-controls={`${disclosureId}-content`}
            expandIcon={<ExpandMoreIcon fontSize="small" />}
            sx={{
              minHeight: 44,
              px: 1.5,
              '&.Mui-expanded': { minHeight: 44 },
              '& .MuiAccordionSummary-content.Mui-expanded': { my: 1 },
            }}
          >
            <Typography component="span" variant="subtitle2" color="text.primary">
              Policy Setup Guide
            </Typography>
          </AccordionSummary>
        }
        content={
          <Box
            role="region"
            aria-label="Policy guidance and review evidence"
            tabIndex={0}
            sx={{ maxHeight: { sm: '45vh' }, overflowY: { sm: 'auto' }, minWidth: 0, px: 1 }}
          >
            <Typography variant="body2" color="text.secondary">
              Optional guidance for the selected academic year. Open any available policy to review
              or update its settings.
            </Typography>
            <Box
              component="ul"
              sx={{
                display: 'grid',
                gridTemplateColumns: { sm: 'repeat(2, minmax(0, 1fr))' },
                gap: 1,
                listStyle: 'none',
                p: 0,
                mt: 1.5,
                mb: 2,
              }}
            >
              {guideItems.map((item) => (
                <Box
                  component="li"
                  key={item.href}
                  sx={{
                    p: 1.25,
                    minWidth: 0,
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    gridColumn: item.href === hrPaths.policies.calendars ? '1 / -1' : undefined,
                  }}
                >
                  <MuiLink
                    component={Link}
                    href={item.href}
                    variant="subtitle2"
                    color="text.primary"
                    sx={{ textDecoration: 'underline', textUnderlineOffset: '0.2em' }}
                  >
                    {item.title}
                  </MuiLink>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                    {item.description}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Typography component="h3" variant="subtitle1">
              Review Evidence
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Recording a review confirms you checked the displayed settings for this year.
            </Typography>
            {visible.map((section) => (
              <ReviewSection
                key={`${academicYearId}-${section.id}`}
                academicYearId={academicYearId}
                section={section}
              />
            ))}
          </Box>
        }
      />
    </Box>
  );
}
