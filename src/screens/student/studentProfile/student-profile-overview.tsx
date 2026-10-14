import type { RootState } from 'src/redux/store';
import type { Board, Medium } from 'src/types/school';
import type { StudentRecordProfile } from 'src/redux/student/student-profile-types';
import type { RecordChange } from 'src/redux/student/records/student-record-changes-api';
import type { StudentRecordDetails } from 'src/redux/student/records/student-record-details-api';

import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { fDate } from 'src/utils/format-time';
import { GenderType } from 'src/enums/gender';
import { RouterLink } from 'src/routes/components';
import { studentPaths } from 'src/constants/student-menu';
import { hasGrantedPermission } from 'src/utils/permissions';
import { FormSectionCard } from 'src/components/form-section-card';
import { Box, Stack, Alert, Button, Divider, Skeleton, Typography } from '@mui/material';

export function ProfileValues({ values }: { values: { label: string; value: unknown }[] }) {
  return (
    <Box
      component="dl"
      sx={{
        m: 0,
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: 'minmax(120px, 1fr) minmax(0, 1.3fr)' },
        gap: 1.25,
      }}
    >
      {values.map(({ label, value }) => (
        <Box key={label} sx={{ display: 'contents' }}>
          <Typography component="dt" variant="body2" color="text.secondary">
            {label}
          </Typography>
          <Typography component="dd" variant="body2" sx={{ m: 0, overflowWrap: 'anywhere' }}>
            {value == null || value === '' ? '—' : String(value)}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

export function EnrollmentMilestones({ student }: { student: StudentRecordProfile }) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const journey =
    student.admissionOnboarding?.find((item) => item.academicYearId === student.academicYearId) ??
    student.admissionOnboarding?.[0];
  if (!journey)
    return (
      <Typography variant="body2" color="text.secondary">
        No linked admission or onboarding history is available for this record.
      </Typography>
    );
  const credentialsReady = ['Completed', 'Ready', 'Provisioned'].includes(
    journey.credentialsStatus ?? ''
  );
  const credentialsLabel = credentialsReady
    ? 'Completed'
    : journey.credentialsStatus === 'NotRequired'
      ? 'Not required'
      : journey.credentialsStatus === 'Failed'
        ? 'Failed'
        : journey.credentialsStatus === 'Pending'
          ? 'Pending'
          : 'Unavailable';
  const canAdmission = hasGrantedPermission(permissions, 'Students.Admissions.Applications.View');
  const canOnboarding = hasGrantedPermission(permissions, 'Students.Onboarding.View');
  return (
    <Stack spacing={1.5}>
      {[
        {
          label: 'Admission finalized',
          ready: Boolean(journey.finalizedAt),
          date: journey.finalizedAt,
        },
        {
          label: 'Enrollment activated',
          ready: Boolean(journey.activatedAt),
          date: journey.activatedAt,
        },
        {
          label: 'Portal credentials',
          ready: credentialsReady,
          date: null,
          status: credentialsLabel,
        },
      ].map((item) => (
        <Stack
          key={item.label}
          direction="row"
          spacing={1}
          alignItems="center"
          useFlexGap
          flexWrap="wrap"
        >
          <Typography variant="body2" sx={{ flex: 1, minWidth: 145 }}>
            {item.label}
          </Typography>
          <Label
            color={
              item.status === 'Failed'
                ? 'error'
                : item.status === 'Not required' || item.status === 'Unavailable'
                  ? 'default'
                  : item.ready
                    ? 'success'
                    : 'warning'
            }
          >
            {item.status ?? (item.ready ? 'Completed' : 'Pending')}
          </Label>
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ minWidth: 86, textAlign: 'right' }}
          >
            {item.date ? fDate(item.date) : '—'}
          </Typography>
        </Stack>
      ))}
      <Divider />
      <ProfileValues values={[{ label: 'Application', value: journey.applicationNumber }]} />
      {journey.activatedAt && journey.credentialsStatus === 'Pending' && (
        <Alert severity="info">Enrollment is active. Portal credentials are still pending.</Alert>
      )}
      {journey.activatedAt && journey.credentialsStatus === 'Failed' && (
        <Alert severity="warning">
          Enrollment is active. Portal credentials need attention in Onboarding.
        </Alert>
      )}
      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" justifyContent="flex-end">
        {canAdmission && (
          <Button
            size="small"
            component={RouterLink}
            variant="outlined"
            href={studentPaths.enrollment.decisionWorkspace(journey.applicationId)}
          >
            View Admission
          </Button>
        )}
        {canOnboarding && (
          <Button
            size="small"
            component={RouterLink}
            variant="outlined"
            href={`${studentPaths.onboarding.setup}?case=${encodeURIComponent(
              journey.onboardingCaseId
            )}`}
          >
            {journey.completedAt ? 'View Onboarding' : 'Continue Onboarding'}
          </Button>
        )}
      </Stack>
    </Stack>
  );
}

export function StudentProfileOverview({
  student,
  details,
  changes,
  viewHref,
  changesLoading = false,
  changesError = false,
  canReadChanges = true,
}: {
  student: StudentRecordProfile;
  details?: StudentRecordDetails;
  changes: RecordChange[];
  viewHref: (view: string) => string;
  changesLoading?: boolean;
  changesError?: boolean;
  canReadChanges?: boolean;
}) {
  const currentYear = useSelector((state: RootState) => state.globalState.currentYear);
  const board = currentYear?.boards?.find((item: Board) =>
    item.educationMediums?.some((medium: Medium) => medium.id === student.academicMediumId)
  );
  const yearName =
    student.enrollmentHistory?.find((item) => item.academicYearId === student.academicYearId)
      ?.academicYearName ??
    (currentYear?.id === student.academicYearId || !student.academicYearId
      ? currentYear?.name
      : null);
  const general = details?.structuredSections.find(
    (item) => item.section === 'general' && !item.isMasked
  )?.data;
  const family = details?.structuredSections.find(
    (item) => item.section === 'family' && !item.isMasked
  )?.data;
  const guardian = family?.guardianDetails as { fullName?: string } | undefined;
  const entry = student.entrySource
    ? {
        ActivatedOnboarding: 'Enrollment activated',
        CompletedOnboarding: 'Onboarding completed',
        LegacyOverride: 'Approved historical entry',
        Provisioning: 'Provisioning',
      }[student.entrySource]
    : 'Historical record';
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' },
        gridAutoRows: { xs: 'auto', md: '1fr' },
        gap: 1.5,
        alignItems: 'stretch',
      }}
    >
      <FormSectionCard icon="mdi:school-outline" title="Academic context">
        <Divider />
        <ProfileValues
          values={[
            { label: 'Academic year', value: yearName },
            { label: 'Board', value: board?.name },
          ]}
        />
        <Divider />
        <ProfileValues values={[{ label: 'Record source', value: entry }]} />
      </FormSectionCard>
      <FormSectionCard icon="mdi:account-school-outline" title="Admission & Onboarding">
        <Divider />
        <EnrollmentMilestones student={student} />
      </FormSectionCard>
      <FormSectionCard
        icon="mdi:account-outline"
        title="Student details"
        action={
          <Button size="small" component={RouterLink} href={viewHref('details')}>
            View All Details
          </Button>
        }
      >
        <Divider />
        <ProfileValues
          values={[
            {
              label: 'Date of birth',
              value: student.dateOfBirth ? fDate(student.dateOfBirth) : null,
            },
            {
              label: 'Gender',
              value: student.gender != null ? GenderType[student.gender] : null,
            },
            ...(guardian?.fullName
              ? [{ label: 'Primary guardian', value: guardian.fullName }]
              : []),
            ...(general?.primaryContactNo
              ? [{ label: 'Contact', value: general.primaryContactNo }]
              : []),
          ]}
        />
      </FormSectionCard>
      <FormSectionCard
        icon="mdi:history"
        title="Recent changes"
        action={
          <Button size="small" component={RouterLink} href={viewHref('history')}>
            View History
          </Button>
        }
      >
        <Divider />
        {!canReadChanges ? (
          <Typography variant="body2" color="text.secondary">
            Record change history is not available with your current access.
          </Typography>
        ) : changesLoading ? (
          <Stack aria-label="Loading recent changes">
            <Skeleton height={40} />
            <Skeleton height={40} />
          </Stack>
        ) : changesError ? (
          <Typography variant="body2" color="text.secondary">
            Recent changes could not be loaded.
          </Typography>
        ) : changes.length ? (
          <Stack spacing={1.5}>
            {changes.slice(0, 3).map((change) => (
              <Stack key={change.id} spacing={0.5}>
                <Typography variant="body2">
                  {change.section === 'custom-details' || change.section === 'registration-form'
                    ? 'Student details'
                    : change.section.replace(/-/g, ' ')}{' '}
                  change
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Label color={change.status === 'Applied' ? 'success' : 'default'}>
                    {change.status}
                  </Label>
                  <Typography variant="caption" color="text.secondary">
                    {fDate(change.appliedAt ?? change.creationTime)}
                  </Typography>
                </Stack>
              </Stack>
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" color="text.secondary">
            No record changes are available.
          </Typography>
        )}
      </FormSectionCard>
    </Box>
  );
}
