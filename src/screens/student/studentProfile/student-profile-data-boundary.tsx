import type { ReactNode } from 'react';
import type { StudentRecordProfile } from 'src/redux/student/student-profile-types';

import { useGetStudentByIdQuery } from 'src/redux/student';
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
  return <>{children(student, query.refetch)}</>;
}
