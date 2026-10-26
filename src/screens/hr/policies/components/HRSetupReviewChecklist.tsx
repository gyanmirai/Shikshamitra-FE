'use client';

import type { RootState } from 'src/redux/store';
import type { HrSetupReviewSection } from 'src/redux/hr/hr-setup-review-api';

import Link from 'next/link';
import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
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
} from '@mui/material';

const sections = [
  {
    id: 'calendar',
    label: 'Calendar and workweek',
    href: hrPaths.policies.calendars,
    navigation: hrPermissions.policies.calendars,
  },
  {
    id: 'attendance',
    label: 'Attendance thresholds and capture',
    href: hrPaths.policies.attendance,
    navigation: hrPermissions.policies.attendance,
  },
  {
    id: 'leave',
    label: 'Leave allocations',
    href: hrPaths.policies.leavePolicies,
    navigation: hrPermissions.policies.leavePolicies,
  },
  {
    id: 'payroll',
    label: 'Payroll basis',
    href: hrPaths.policies.payroll,
    navigation: hrPermissions.policies.payroll,
  },
  {
    id: 'sample',
    label: 'Sample staff and date check',
    href: hrPaths.policies.assignments,
    navigation: hrPermissions.policies.assignments,
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
      <Typography ref={heading} tabIndex={-1} id={headingId} variant="subtitle2" component="h3">
        {section.label}
      </Typography>
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
                section.id === 'sample' && data.configurationState === 'valid'
                  ? 'Sample resolved'
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
            <Button
              component={Link}
              href={section.href}
              size="small"
              variant="outlined"
              disabled={saving}
            >
              Open {section.label.toLowerCase()} settings
            </Button>
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
                Run new sample
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
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canRead = (section: HrSetupReviewSection) =>
    hasGrantedPermission(
      permissions,
      section === 'leave' ? 'HR.LeaveManagement.Setting.LeavePolicy.View' : 'HR.Policies.View'
    ) &&
    (section !== 'sample' ||
      hasGrantedPermission(permissions, 'HR.LeaveManagement.Setting.LeavePolicy.View'));
  const visible = sections.filter(
    (section) => canRead(section.id) && hasNavigationPermission(permissions, section.navigation)
  );
  if (!academicYearId || !visible.length) return null;
  return (
    <Box
      component="details"
      sx={{
        mb: 1,
        p: 1.5,
        border: 1,
        borderColor: 'divider',
        borderRadius: 1,
        bgcolor: 'background.paper',
      }}
    >
      <Typography
        component="summary"
        variant="subtitle2"
        sx={{ cursor: 'pointer', minHeight: 44, alignContent: 'center' }}
      >
        School HR setup review
      </Typography>
      <Box
        role="region"
        aria-label="School setup review sections"
        tabIndex={0}
        sx={{ maxHeight: { sm: '45vh' }, overflowY: 'auto', minWidth: 0 }}
      >
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Review these settings for this school. This checklist is advisory; recording a review does
          not change policies, allocations or payroll availability.
        </Typography>
        {visible.map((section) => (
          <ReviewSection
            key={`${academicYearId}-${section.id}`}
            academicYearId={academicYearId}
            section={section}
          />
        ))}
      </Box>
    </Box>
  );
}
