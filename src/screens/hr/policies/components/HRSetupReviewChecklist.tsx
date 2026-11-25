'use client';

import type { ReactNode } from 'react';
import type { RootState } from 'src/redux/store';
import type { HrSetupReviewSection } from 'src/redux/hr/hr-setup-review-api';

import { useSelector } from 'react-redux';
import { useId, useRef, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { hrPermissions } from 'src/constants/hr-menus';
import CustomAccordion from 'src/components/custom-accordian';
import { hasNavigationPermission } from 'src/utils/permissions';
import { hrLeavePolicyPermissions } from 'src/constants/hr-policy-permissions';
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
  AccordionSummary,
} from '@mui/material';

const sections = [
  { id: 'calendar', label: 'Work Calendars', navigation: hrPermissions.policies.calendars },
  { id: 'attendance', label: 'Attendance Policies', navigation: hrPermissions.policies.attendance },
  { id: 'payroll', label: 'Payroll Policies', navigation: hrPermissions.policies.payroll },
  { id: 'leave', label: 'Leave Policies', navigation: hrPermissions.policies.leavePolicies },
  {
    id: 'sample',
    label: 'Automatic staff and date sample',
    navigation: hrPermissions.policies.assignments,
  },
] as const;

const reviewLabels = {
  record_not_present: 'No review recorded',
  stale: 'Previous review is out of date',
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
      const sectionHeading = heading.current;
      if (!sectionHeading) return;
      setSaved(true);
      if (sectionHeading.parentElement?.contains(document.activeElement)) sectionHeading.focus();
    } catch {
      if (!heading.current) return;
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
      {section.id === 'sample' ? (
        <Typography variant="body2" color="text.secondary">
          This check opens the recorded sample when available or selects an authorized staff member
          at the start of the academic year.
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
                ? ' · The previous review no longer matches the displayed evidence.'
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

function ReviewDisclosure({ title, children }: { title: string; children: ReactNode }) {
  const id = useId();
  const [opened, setOpened] = useState(false);

  return (
    <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, bgcolor: 'background.paper' }}>
      <CustomAccordion
        title={title}
        onChange={() => setOpened(true)}
        summary={
          <AccordionSummary
            id={`${id}-summary`}
            aria-controls={`${id}-content`}
            expandIcon={<Iconify icon="mdi:chevron-down" width={18} aria-hidden />}
            sx={{
              minHeight: 44,
              px: 1.5,
              '&.Mui-expanded': { minHeight: 44 },
              '& .MuiAccordionSummary-content.Mui-expanded': { my: 1 },
            }}
          >
            <Typography component="span" variant="subtitle2" color="text.primary">
              {title}
            </Typography>
          </AccordionSummary>
        }
        content={opened ? <Box sx={{ px: 1 }}>{children}</Box> : null}
      />
    </Box>
  );
}

export function HRSetupReviewChecklist({ academicYearId }: { academicYearId?: string }) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  if (!academicYearId) return null;

  const visible = sections.filter(({ id, navigation }) =>
    hasNavigationPermission(
      permissions,
      navigation,
      id === 'sample'
        ? [hrPermissions.policyActions.view, hrLeavePolicyPermissions.view]
        : [id === 'leave' ? hrLeavePolicyPermissions.view : hrPermissions.policyActions.view]
    )
  );
  const schoolSections = visible.filter(({ id }) => id !== 'sample');
  const sampleSection = visible.find(({ id }) => id === 'sample');
  if (!visible.length) return null;

  return (
    <Stack key={academicYearId} spacing={1}>
      {schoolSections.length > 0 && (
        <ReviewDisclosure title="Review School Policies">
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Recording a review is optional. It confirms you checked the displayed settings for this
            year.
          </Typography>
          {schoolSections.map((section) => (
            <ReviewSection key={section.id} academicYearId={academicYearId} section={section} />
          ))}
        </ReviewDisclosure>
      )}
      {sampleSection && (
        <ReviewDisclosure title="Check Policies for One Staff Member">
          <ReviewSection academicYearId={academicYearId} section={sampleSection} />
        </ReviewDisclosure>
      )}
    </Stack>
  );
}
