import type { ReactNode } from 'react';
import type { StudentRecordProfile } from 'src/redux/student/student-profile-types';

import { RouterLink } from 'src/routes/components';
import { studentPaths } from 'src/constants/student-menu';
import { useGetStudentByIdQuery } from 'src/redux/student';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Alert, Stack, Button, Typography, LinearProgress } from '@mui/material';

type Props = {
  studentId: string;
  children: (student: StudentRecordProfile, refetch: () => unknown) => ReactNode;
};

export function StudentProfileDataBoundary({ studentId, children }: Props) {
  const query = useGetStudentByIdQuery(studentId, {
    skip: !studentId,
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    refetchOnReconnect: true,
  });
  const student = query.currentData;
  if (query.isLoading || (query.isFetching && !student)) {
    return (
      <Stack spacing={2} sx={{ p: 3 }} role="status">
        <Typography>Loading student profile…</Typography>
        <LinearProgress aria-label="Loading student profile" />
      </Stack>
    );
  }
  if (query.isError || !student || student.id.toLowerCase() !== studentId.toLowerCase()) {
    return (
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
        Unable to load this student profile. Please try again. If the problem continues, check your
        student record access.
      </Alert>
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
        <Button
          component={RouterLink}
          href={studentPaths.onboarding.setup}
          sx={{ alignSelf: 'flex-start' }}
        >
          Open Student Onboarding
        </Button>
      </Stack>
    );
  }
  return (
    <>
      {children(student, query.refetch)}
      {student.maskedFields?.length ? (
        <Alert severity="info" sx={{ my: 1.5 }}>
          Some sensitive fields are restricted by school policy.
        </Alert>
      ) : null}
      {student.enrollmentHistory?.length ? (
        <CustomizableTable
          tableId={`student-enrollment-history-${student.id}`}
          tableTitle="Enrollment history"
          columns={[
            { id: 'academicYearName', label: 'Academic year' },
            { id: 'standardName', label: 'Class' },
            { id: 'divisionName', label: 'Division' },
            { id: 'rollNumber', label: 'Roll number' },
            {
              id: 'isActive',
              label: 'Enrollment',
              render: (value) => (value ? 'Active' : 'Historical'),
            },
          ]}
          data={student.enrollmentHistory}
          isSearch={false}
          isFilter={false}
        />
      ) : null}
    </>
  );
}
