import type { RootState } from 'src/redux/store';
import type { StudentRecordProfile } from 'src/redux/student/student-profile-types';
import type { RecordChange } from 'src/redux/student/records/student-record-changes-api';
import type { StudentRecordDetails } from 'src/redux/student/records/student-record-details-api';

import { useState } from 'react';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { fDate } from 'src/utils/format-time';
import { GenderType } from 'src/enums/gender';
import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import calculateAge from 'src/utils/calculate-age';
import { studentPaths } from 'src/constants/student-menu';
import { hasGrantedPermission } from 'src/utils/permissions';
import { StudentFeedback } from 'src/components/student-feedback';
import { FormSectionCard } from 'src/components/form-section-card';
import { Box, Alert, Stack, Button, Divider, Skeleton, Typography } from '@mui/material';

import { profileOverviewContacts } from './student-profile-overview-model';
import { StudentParentsContactDialog } from './student-parents-contact-dialog';

export function ProfileValues({
  values,
  inlineLabels = false,
}: {
  values: { label: string; value: unknown }[];
  inlineLabels?: boolean;
}) {
  return (
    <Box
      component="dl"
      sx={{
        m: 0,
        display: 'grid',
        gridTemplateColumns: {
          xs: inlineLabels ? 'minmax(0, 1fr) minmax(0, 1.3fr)' : '1fr',
          sm: 'minmax(120px, 1fr) minmax(0, 1.3fr)',
        },
        gap: 1.25,
      }}
    >
      {values.map(({ label, value }) => (
        <Box key={label} sx={{ display: 'contents' }}>
          <Typography
            component="dt"
            variant="body2"
            color="text.secondary"
            sx={{ overflowWrap: 'anywhere' }}
          >
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
      <FormSectionCard
        aria-label="Admission & Onboarding"
        icon={GlobalIcons.admissionStudent}
        title="Admission & Onboarding"
        descriptionTooltip="Linked admission, enrollment activation and portal credential status for this student."
      >
        <Divider />
        <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
          <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
            No linked journey available.
          </Typography>
          <Label color="default">Not linked</Label>
        </Stack>
      </FormSectionCard>
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
    <FormSectionCard
      aria-label="Admission & Onboarding"
      icon={GlobalIcons.admissionStudent}
      title="Admission & Onboarding"
      descriptionTooltip="Linked admission, enrollment activation and portal credential status for this student."
      action={
        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          flexWrap="wrap"
          alignItems="baseline"
          sx={{ minWidth: 0 }}
        >
          <Typography variant="body2" color="text.secondary">
            Application
          </Typography>
          <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
            {journey.applicationNumber || '—'}
          </Typography>
        </Stack>
      }
    >
      <Divider />
      <Stack spacing={1} divider={<Divider />}>
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
          <Box
            key={item.label}
            sx={{
              minWidth: 0,
              display: 'grid',
              gridTemplateColumns: {
                xs: 'minmax(0, 1fr) auto',
                sm: 'minmax(0, 1fr) auto minmax(86px, auto)',
              },
              columnGap: 1,
              rowGap: 0.5,
              alignItems: 'center',
            }}
          >
            <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
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
              sx={{
                gridColumn: { xs: '1 / -1', sm: 'auto' },
                justifySelf: 'end',
                textAlign: 'right',
              }}
            >
              {item.date ? fDate(item.date) : '—'}
            </Typography>
          </Box>
        ))}
      </Stack>
      <Divider />
      <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2} alignItems={{ lg: 'center' }}>
        {journey.activatedAt && journey.credentialsStatus === 'Pending' && (
          <StudentFeedback
            notificationKey="STU-0761"
            presentation="inline"
            severity="info"
            sx={{ flex: 1, minWidth: 0 }}
          >
            Enrollment is active. Portal credentials are still pending.
          </StudentFeedback>
        )}
        {journey.activatedAt && journey.credentialsStatus === 'Failed' && (
          <StudentFeedback
            notificationKey="STU-0762"
            presentation="persistent"
            severity="warning"
            sx={{ flex: 1, minWidth: 0 }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Iconify
                icon={GlobalIcons.warning}
                width={20}
                sx={{ color: 'warning.main', flexShrink: 0 }}
              />
              <Box>Enrollment is active. Portal credentials need attention in Onboarding.</Box>
            </Stack>
          </StudentFeedback>
        )}
        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          flexWrap="wrap"
          justifyContent="flex-end"
          sx={{ ml: 'auto', flexShrink: 0 }}
        >
          {canAdmission && (
            <Button
              size="small"
              color="inherit"
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
              color="inherit"
              variant={journey.completedAt ? 'outlined' : 'contained'}
              href={`${studentPaths.onboarding.setup}?case=${encodeURIComponent(
                journey.onboardingCaseId
              )}`}
            >
              {journey.completedAt ? 'View Onboarding' : 'Continue Onboarding'}
            </Button>
          )}
        </Stack>
      </Stack>
    </FormSectionCard>
  );
}

export function StudentProfileOverview({
  student,
  details,
  changes,
  changesLoading = false,
  changesError = false,
  canReadChanges = true,
  detailsLoading = false,
  detailsError = false,
}: {
  student: StudentRecordProfile;
  details?: StudentRecordDetails;
  changes: RecordChange[];
  changesLoading?: boolean;
  changesError?: boolean;
  canReadChanges?: boolean;
  detailsLoading?: boolean;
  detailsError?: boolean;
}) {
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const [contactsOpen, setContactsOpen] = useState(false);
  const [contactResult, setContactResult] = useState<string | null>(null);
  const family = details?.structuredSections.find((section) => section.section === 'family');
  const canManageContacts =
    !detailsLoading &&
    !detailsError &&
    details?.recordsAccess === 'Full' &&
    family?.canEdit === true &&
    !family.isMasked &&
    hasGrantedPermission(permissions, 'Students.Records.Changes.View') &&
    hasGrantedPermission(permissions, 'Students.Records.Changes.Add');
  const birthDate = student.dateOfBirth ? new Date(student.dateOfBirth) : null;
  const validBirthDate = birthDate && !Number.isNaN(birthDate.getTime());
  return (
    <Stack spacing={2} sx={{ minWidth: 0 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', md: 'repeat(2, minmax(0, 1fr))' },
          gap: 2,
          alignItems: 'stretch',
        }}
      >
        <FormSectionCard
          aria-label="Student Details"
          icon={GlobalIcons.studentProfile}
          title="Student Details"
          descriptionTooltip="Saved date of birth, calculated age and gender for this student."
          sx={{ minWidth: 0 }}
        >
          <Divider />
          <ProfileValues
            inlineLabels
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
          aria-label="Parents & Contact"
          icon={GlobalIcons.family}
          title="Parents & Contact"
          descriptionTooltip="Saved parents, optional other guardian and the main school contact. App access is managed separately."
          sx={{ minWidth: 0 }}
          action={
            canManageContacts ? (
              <Button
                size="small"
                color="inherit"
                startIcon={<Iconify icon={GlobalIcons.edit} />}
                onClick={() => {
                  setContactResult(null);
                  setContactsOpen(true);
                }}
              >
                Manage contacts
              </Button>
            ) : undefined
          }
        >
          <Divider />
          {detailsLoading ? (
            <Stack role="status" aria-label="Loading parents and contact details" spacing={1}>
              {['80%', '60%', '50%'].map((width) => (
                <Skeleton key={width} width={width} height={24} />
              ))}
            </Stack>
          ) : detailsError && !details ? null : (
            <ProfileValues inlineLabels values={profileOverviewContacts(details)} />
          )}
          {contactResult && (
            <Alert severity={contactResult.endsWith('review.') ? 'info' : 'success'}>
              {contactResult}
            </Alert>
          )}
        </FormSectionCard>
      </Box>
      <EnrollmentMilestones student={student} />
      <FormSectionCard
        aria-label="Recent Changes"
        icon={GlobalIcons.history}
        title="Recent Changes"
        descriptionTooltip="The latest recorded changes. Open the History tab for the full change history."
        actionFullWidthOnMobile
        action={
          !canReadChanges || (!changesError && !changesLoading && !changes.length) ? (
            <Typography variant="body2" color="text.secondary">
              {!canReadChanges
                ? 'Record change history is not available with your current access.'
                : 'No record changes are available.'}
            </Typography>
          ) : undefined
        }
      >
        {canReadChanges && !changesError && (changesLoading || changes.length > 0) && (
          <>
            <Divider />
            {changesLoading ? (
              <Stack role="status" aria-label="Loading recent changes">
                <Skeleton height={40} />
                <Skeleton height={40} />
              </Stack>
            ) : (
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
            )}
          </>
        )}
      </FormSectionCard>
      {contactsOpen && details && (
        <StudentParentsContactDialog
          studentId={student.studentId}
          details={details}
          onClose={() => setContactsOpen(false)}
          onSubmitted={(message) => {
            setContactsOpen(false);
            setContactResult(message);
          }}
        />
      )}
    </Stack>
  );
}
