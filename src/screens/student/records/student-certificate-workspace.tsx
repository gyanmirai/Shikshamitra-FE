'use client';

import type { RootState } from 'src/redux/store';
import type { StudentDirectoryItem } from 'src/redux/student/records/student-records-types';

import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { studentPaths } from 'src/constants/student-menu';
import { hasGrantedPermission } from 'src/utils/permissions';
import { StudentFeedback } from 'src/components/student-feedback';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Box, Stack, Paper, Button, Skeleton, Typography } from '@mui/material';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import { useGetStudentRecordsDirectoryQuery } from 'src/redux/student/records/student-records-api';

import { recordsQueryUrl } from './records-url-state';
import { directoryStudentName } from './student-directory-columns';
import CertificateStudentRoster from './certificate-student-roster';
import CertificateHistoryTable from './components/certificate-history-table';
import CertificateGenerationDrawer from './components/certificate-generation-drawer';

export default function StudentCertificateWorkspace() {
  const year = useSelector((state: RootState) => state.globalState.currentYear?.id);
  return <CertificateWorkspace key={year ?? 'no-year'} academicYearId={year} />;
}

function CertificateWorkspace({ academicYearId }: { academicYearId?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canView = hasGrantedPermission(permissions, 'Students.Records.Certificates.View');
  const canIssue =
    canView && hasGrantedPermission(permissions, 'Students.Records.Certificates.Add');
  const currentQuery = params.toString();
  const [generation, setGeneration] = useState<{
    query: string;
    student: StudentDirectoryItem;
  } | null>(null);
  useEffect(() => {
    if (generation && generation.query !== currentQuery) setGeneration(null);
  }, [currentQuery, generation]);

  const selectedId = params.get('year') === academicYearId ? (params.get('student') ?? '') : '';
  const selected = useGetStudentRecordsDirectoryQuery(
    {
      studentId: selectedId,
      academicYearId,
      population: 'All',
      includeActiveStudentList: true,
      maxResultCount: 1,
    },
    { skip: !canView || !selectedId || !academicYearId }
  );
  const student =
    selectedId && !selected.isError
      ? selected.currentData?.items.find(
          (item) => item.studentId === selectedId && !item.maskedFields.includes('Identity')
        )
      : undefined;

  const historyHref = (studentId?: string) =>
    recordsQueryUrl(pathname, currentQuery, {
      student: studentId,
      year: studentId ? academicYearId : undefined,
      certificate: undefined,
      type: undefined,
    });
  const viewHistory = (studentId: string) => {
    setGeneration(null);
    if (studentId !== selectedId) router.push(historyHref(studentId), { scroll: false });
  };

  const canGenerateForStudent = (row: StudentDirectoryItem) =>
    canIssue &&
    Boolean(academicYearId) &&
    row.isCurrentAcademicYear !== false &&
    !row.maskedFields.includes('Identity');

  const openGeneration = (row: StudentDirectoryItem) => {
    if (canGenerateForStudent(row)) {
      setGeneration({ query: currentQuery, student: row });
    }
  };

  return (
    <Box
      sx={{
        height: 1,
        minHeight: 0,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
      }}
    >
      <CustomBreadcrumbs
        heading="Certificates"
        description="Filter students by academic placement, generate certificates, and view student history."
        links={[
          { name: 'Student', href: studentPaths.dashboard },
          { name: 'Student Records', href: studentPaths.records.studentList },
          { name: 'Certificates' },
        ]}
        action={
          canView &&
          selectedId && (
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              startIcon={<Iconify icon={GlobalIcons.back} />}
              onClick={() => router.replace(historyHref(), { scroll: false })}
            >
              Back to students
            </Button>
          )
        }
      />
      {!canView ? (
        <Typography role="status" sx={{ px: 1 }}>
          You do not have access to certificates.
        </Typography>
      ) : !academicYearId ? (
        <Typography role="status" sx={{ px: 1 }}>
          Select an academic year in the header to view students.
        </Typography>
      ) : !selectedId ? (
        <CertificateStudentRoster
          academicYearId={academicYearId}
          canGenerateForStudent={canGenerateForStudent}
          onGenerate={openGeneration}
          historyHref={historyHref}
        />
      ) : student ? (
        <>
          <Paper variant="outlined" sx={{ p: 1.5, flexShrink: 0 }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
              <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
                  {directoryStudentName(student)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {student.grNumber || student.grNo || '—'} ·{' '}
                  {[student.standardName, student.divisionName].filter(Boolean).join(' / ') || '—'}
                </Typography>
              </Stack>
              {canGenerateForStudent(student) && (
                <AdaptiveThreeDotsActions
                  actions={[
                    {
                      id: 'generate-certificate',
                      label: `Generate certificate for ${directoryStudentName(student)}`,
                      icon: GlobalIcons.documentIcon,
                      onClick: () => openGeneration(student),
                    },
                  ]}
                />
              )}
            </Stack>
          </Paper>
          <CertificateHistoryTable
            key={`${academicYearId}-${student.studentId}`}
            studentId={student.studentId}
          />
        </>
      ) : selected.isError ? (
        <StudentFeedback
          notificationKey="certificate-student-read-failed"
          presentation="toast"
          severity="error"
          toastAction={
            <Button size="small" color="inherit" onClick={() => selected.refetch()}>
              Retry student
            </Button>
          }
        >
          The selected student could not be loaded.
        </StudentFeedback>
      ) : selected.isFetching ? (
        <Box role="status" aria-label="Loading selected student" sx={{ px: 1 }}>
          <Skeleton width={180} />
          <Skeleton width={120} />
        </Box>
      ) : (
        <Typography role="status" color="text.secondary" sx={{ px: 1 }}>
          The selected student is unavailable in this academic year.
        </Typography>
      )}
      {generation?.query === currentQuery && canIssue && academicYearId && (
        <CertificateGenerationDrawer
          students={[generation.student]}
          academicYearId={academicYearId}
          onClose={() => setGeneration(null)}
          onViewHistory={viewHistory}
        />
      )}
    </Box>
  );
}
