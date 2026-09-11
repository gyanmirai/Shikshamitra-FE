import type { RootState } from 'src/redux/store';

import { useSelector } from 'react-redux';
import { hasGrantedPermission } from 'src/utils/permissions';
import { AdmissionQueryError } from 'src/screens/student/admissions/admission-query-error';
import { Card, Alert, Stack, Button, Skeleton, Typography, LinearProgress } from '@mui/material';
import { useGetStudentAdmissionEvidenceQuery } from 'src/redux/student/admissions/student-admission-evidence-api';
import { useDocumentPermissions } from 'src/screens/student/admissions/document-verification/use-document-permissions';

import { StudentAdmissionEvidenceGroups } from './student-admission-evidence-groups';

export function StudentAdmissionEvidencePanel({ studentId }: { studentId?: string }) {
  const permissions = useDocumentPermissions();
  const grants = useSelector((state: RootState) => state.auth.permissions);
  const canView =
    permissions.view && hasGrantedPermission(grants, 'Students.Records.StudentList.View');
  const query = useGetStudentAdmissionEvidenceQuery(studentId ?? '', {
    skip: !studentId || !canView,
  });
  if (!studentId) return null;
  return (
    <Card sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Admission evidence</Typography>
          {canView && (
            <Button size="small" onClick={query.refetch} disabled={query.isFetching}>
              Refresh
            </Button>
          )}
        </Stack>
        <Typography variant="body2" color="text.secondary">
          Documents, original checks, and review history retained when this applicant became a
          student.
        </Typography>
        {!canView ? (
          <Alert severity="info">
            Student record and admission document access are required to view this evidence.
          </Alert>
        ) : query.isLoading ? (
          <Skeleton variant="rounded" height={120} />
        ) : query.isError || !query.currentData ? (
          <AdmissionQueryError onRetry={query.refetch} />
        ) : query.currentData.length === 0 ? (
          <Alert severity="info">No admission evidence is linked to this student.</Alert>
        ) : (
          <>
            {query.isFetching && <LinearProgress aria-label="Refreshing admission evidence" />}
            <StudentAdmissionEvidenceGroups
              evidence={query.currentData}
              studentId={studentId}
              allowDownload={permissions.download}
            />
          </>
        )}
      </Stack>
    </Card>
  );
}
