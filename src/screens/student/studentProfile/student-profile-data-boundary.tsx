import type { ReactNode } from 'react';
import type { RootState } from 'src/redux/store';
import type { StudentRecordProfile } from 'src/redux/student/student-profile-types';

import { useSelector } from 'react-redux';
import { RouterLink } from 'src/routes/components';
import { studentPaths } from 'src/constants/student-menu';
import { useGetStudentByIdQuery } from 'src/redux/student';
import { hasGrantedPermission } from 'src/utils/permissions';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Grid, Alert, Stack, Button, Skeleton, Typography } from '@mui/material';

export type ProfileAcademicYearContext = { id?: string; name?: string };
type Props = {
  studentId: string;
  children: (student: StudentRecordProfile, refetch: () => unknown) => ReactNode;
  header?: ReactNode;
  academicYearContext?: ProfileAcademicYearContext;
};

export function StudentProfileDataBoundary({
  studentId,
  children,
  header,
  academicYearContext,
}: Props) {
  const currentYear = useSelector((state: RootState) => state.globalState.currentYear);
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canOnboarding = hasGrantedPermission(permissions, 'Students.Onboarding.View');
  const query = useGetStudentByIdQuery(
    { studentId, academicYearId: academicYearContext ? academicYearContext.id : currentYear?.id },
    {
      skip: !studentId,
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    }
  );
  const student = query.currentData;
  const errorStatus =
    query.error && typeof query.error === 'object' && 'status' in query.error
      ? query.error.status
      : undefined;
  const accessDenied = errorStatus === 401 || errorStatus === 403;
  const identityMatches =
    typeof student?.id === 'string' && student.id.toLowerCase() === studentId.toLowerCase();
  if (query.isLoading || (query.isFetching && !student)) {
    return (
      <>
        {header}
        <Stack spacing={2} sx={{ p: 2 }} role="status">
          <Typography>Loading student profile…</Typography>
          <Skeleton variant="rounded" height={84} />
          <Skeleton variant="rounded" height={44} />
          <Grid container spacing={1.5}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Skeleton variant="rounded" height={200} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Skeleton variant="rounded" height={200} />
            </Grid>
          </Grid>
        </Stack>
      </>
    );
  }
  if ((query.isError && (accessDenied || !identityMatches)) || !student || !identityMatches) {
    return (
      <>
        {header}
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              onClick={() => query.refetch()}
              disabled={query.isFetching || !studentId}
            >
              Retry
            </Button>
          }
        >
          Unable to load this student profile. Please try again. If the problem continues, check
          your student record access.
        </Alert>
      </>
    );
  }
  if (student.recordsAccess === 'Summary') {
    return (
      <Stack spacing={2}>
        <CustomBreadcrumbs
          heading="Student summary"
          description="This student is activated and still completing onboarding."
          links={[
            { name: 'Students', href: studentPaths.dashboard },
            { name: 'Student Records', href: studentPaths.records.root },
            { name: 'Student summary' },
          ]}
        />
        <Alert severity="info">
          School rules allow a read-only summary during provisioning. Complete onboarding to open
          the full permanent profile.
        </Alert>
        <Typography variant="h6">
          {[student.firstName, student.middleName, student.lastName].filter(Boolean).join(' ') ||
            'Restricted student identity'}
        </Typography>
        <Typography variant="body2">
          {student.standardName ?? 'Class not available'} ·{' '}
          {student.divisionName ?? 'Division not available'} · GR:{' '}
          {student.grNumber ?? student.grNo ?? '—'}
        </Typography>
        {canOnboarding && (
          <Button
            component={RouterLink}
            href={studentPaths.onboarding.setup}
            sx={{ alignSelf: 'flex-start' }}
          >
            Open Student Onboarding
          </Button>
        )}
      </Stack>
    );
  }
  return (
    <>
      {header}
      {query.isError && (
        <Alert
          severity="error"
          action={
            <Button onClick={() => query.refetch()} disabled={query.isFetching}>
              Retry profile
            </Button>
          }
        >
          The profile could not be refreshed. Your current view and draft have been kept.
        </Alert>
      )}
      {children(student, query.refetch)}
      {student.maskedFields?.length ? (
        <Alert severity="info" sx={{ my: 1.5 }}>
          Some sensitive fields are restricted by school policy.
        </Alert>
      ) : null}
    </>
  );
}
