import type { RootState } from 'src/redux/store';
import type { Board, Medium } from 'src/types/school';
import type { StudentRecordProfile } from 'src/redux/student/student-profile-types';
import type { RecordChange } from 'src/redux/student/records/student-record-changes-api';
import type { StudentRecordDetails } from 'src/redux/student/records/student-record-details-api';

import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { fDate } from 'src/utils/format-time';
import { GenderType } from 'src/enums/gender';
import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import calculateAge from 'src/utils/calculate-age';
import { studentPaths } from 'src/constants/student-menu';
import { hasGrantedPermission } from 'src/utils/permissions';
import { FormSectionCard } from 'src/components/form-section-card';
import { Box, Paper, Stack, Alert, Button, Divider, Skeleton, Typography } from '@mui/material';

import { profileOverviewContacts } from './student-profile-overview-model';

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
      <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
        <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
          No linked journey available.
        </Typography>
        <Label color="default">Not linked</Label>
      </Stack>
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
  detailsLoading = false,
  detailsError = false,
}: {
  student: StudentRecordProfile;
  details?: StudentRecordDetails;
  changes: RecordChange[];
  viewHref: (view: string) => string;
  changesLoading?: boolean;
  changesError?: boolean;
  canReadChanges?: boolean;
  detailsLoading?: boolean;
  detailsError?: boolean;
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
  const birthDate = student.dateOfBirth ? new Date(student.dateOfBirth) : null;
  const validBirthDate = birthDate && !Number.isNaN(birthDate.getTime());
  const entry = student.entrySource
    ? {
        ActivatedOnboarding: 'Enrollment activated',
        CompletedOnboarding: 'Onboarding completed',
        LegacyOverride: 'Approved historical entry',
        Provisioning: 'Provisioning',
      }[student.entrySource]
    : undefined;
  return (
    <Stack
      component={Paper}
      variant="outlined"
      spacing={1.5}
      sx={{ minWidth: 0, p: { xs: 1.5, sm: 2 }, bgcolor: 'background.paper', borderRadius: 2 }}
    >
      <Paper component="section" aria-label="Academic context" variant="outlined">
        <Box
          sx={{
            m: 0,
            display: 'grid',
            gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(3, minmax(0, 1fr))' },
          }}
        >
          {[
            { label: 'Academic year', value: yearName, icon: 'mdi:school-outline' },
            { label: 'Board', value: board?.name, icon: 'mdi:book-open-outline' },
            { label: 'Record source', value: entry, icon: 'mdi:file-document-outline' },
          ].map((field) => (
            <Stack
              key={field.label}
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{
                p: { xs: 1.5, sm: 2 },
                minWidth: 0,
                '&:not(:last-of-type)': {
                  borderStyle: 'solid',
                  borderWidth: 0,
                  borderBottomWidth: { xs: 1, sm: 0 },
                  borderRightWidth: { xs: 0, sm: 1 },
                  borderColor: 'divider',
                },
              }}
            >
              <Iconify
                icon={field.icon}
                width={24}
                sx={{ color: 'text.secondary', flexShrink: 0 }}
              />
              <Box component="dl" sx={{ m: 0, minWidth: 0 }}>
                <Typography component="dt" variant="caption" color="text.secondary">
                  {field.label}
                </Typography>
                <Typography component="dd" variant="body2" sx={{ m: 0, overflowWrap: 'anywhere' }}>
                  {field.value || '—'}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Box>
      </Paper>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' },
          gridAutoRows: '1fr',
          gap: 1.5,
          alignItems: 'stretch',
        }}
      >
        <FormSectionCard
          icon="mdi:account-outline"
          title="Student details"
          sx={{ minWidth: 0, height: 1 }}
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
                value: validBirthDate ? fDate(student.dateOfBirth) : null,
              },
              {
                label: 'Age',
                value:
                  validBirthDate && birthDate <= new Date()
                    ? calculateAge(student.dateOfBirth!)
                    : null,
              },
              {
                label: 'Gender',
                value: student.gender != null ? GenderType[student.gender] : null,
              },
            ]}
          />
        </FormSectionCard>
        <FormSectionCard
          icon="mdi:account-group-outline"
          title="Guardian & contact"
          sx={{ minWidth: 0, height: 1 }}
          action={
            <Button size="small" component={RouterLink} href={viewHref('details')}>
              View Details
            </Button>
          }
        >
          <Divider />
          {detailsLoading ? (
            <Stack aria-label="Loading guardian and contact details" spacing={1}>
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} height={24} />
              ))}
            </Stack>
          ) : detailsError && !details ? (
            <Typography variant="body2" color="text.secondary">
              Guardian and contact details could not be loaded. Use Retry details above to try
              again.
            </Typography>
          ) : (
            <ProfileValues values={profileOverviewContacts(details)} />
          )}
        </FormSectionCard>
      </Box>
      <FormSectionCard
        icon="mdi:history"
        title="Record activity"
        action={
          <Button size="small" component={RouterLink} href={viewHref('history')}>
            View History
          </Button>
        }
      >
        <Divider />
        <Stack spacing={2} divider={<Divider />}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'minmax(0, 1fr)',
                sm: 'minmax(160px, 1fr) minmax(0, 2fr)',
              },
              gap: 1.5,
            }}
          >
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <Iconify
                icon="mdi:account-school-outline"
                width={20}
                sx={{ color: 'text.secondary', flexShrink: 0 }}
              />
              <Typography component="h3" variant="subtitle2">
                Admission & Onboarding
              </Typography>
            </Stack>
            <EnrollmentMilestones student={student} />
          </Box>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'minmax(0, 1fr)',
                sm: 'minmax(160px, 1fr) minmax(0, 2fr)',
              },
              gap: 1.5,
            }}
          >
            <Stack direction="row" spacing={1} alignItems="flex-start">
              <Iconify
                icon="mdi:history"
                width={20}
                sx={{ color: 'text.secondary', flexShrink: 0 }}
              />
              <Typography component="h3" variant="subtitle2">
                Recent changes
              </Typography>
            </Stack>
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
          </Box>
        </Stack>
      </FormSectionCard>
    </Stack>
  );
}
