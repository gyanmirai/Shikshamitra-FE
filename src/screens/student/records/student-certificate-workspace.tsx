'use client';

import type { RootState } from 'src/redux/store';
import type { StudentDirectoryItem } from 'src/redux/student/records/student-records-types';

import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { studentPaths } from 'src/constants/student-menu';
import { hasGrantedPermission } from 'src/utils/permissions';
import { Box, Stack, Paper, Button, Typography } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useGetStudentRecordsDirectoryQuery } from 'src/redux/student/records/student-records-api';

import { recordsQueryUrl } from './records-url-state';
import RecordsStudentPicker from './records-student-picker';
import CertificateHistoryTable from './components/certificate-history-table';
import CertificateGenerationDrawer from './components/certificate-generation-drawer';

export default function StudentCertificateWorkspace() {
  const year = useSelector((state: RootState) => state.globalState.currentYear?.id);
  return <CertificateSearchWorkspace key={year ?? 'no-year'} academicYearId={year} />;
}

function CertificateSearchWorkspace({ academicYearId }: { academicYearId?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const canView = hasGrantedPermission(permissions, 'Students.Records.Certificates.View');
  const canIssue =
    canView && hasGrantedPermission(permissions, 'Students.Records.Certificates.Add');
  const currentQuery = params.toString();
  const [pendingSelection, setPendingSelection] = useState<{
    from: string;
    studentId: string;
  } | null>(null);
  useEffect(() => {
    if (pendingSelection && pendingSelection.from !== currentQuery) setPendingSelection(null);
  }, [currentQuery, pendingSelection]);
  const [generation, setGeneration] = useState<StudentDirectoryItem | null>(null);
  const selectedId =
    pendingSelection?.from === currentQuery
      ? pendingSelection.studentId
      : params.get('year') === academicYearId
        ? (params.get('student') ?? '')
        : '';
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
  const changeStudent = (value: StudentDirectoryItem | null) => {
    setGeneration(null);
    setPendingSelection({ from: currentQuery, studentId: value?.studentId ?? '' });
    router.replace(
      recordsQueryUrl(pathname, params.toString(), {
        student: value?.studentId,
        year: value ? academicYearId : undefined,
        certificate: undefined,
        type: undefined,
      }),
      { scroll: false }
    );
  };
  return (
    <Box sx={{ height: 1, minHeight: 0, display: 'flex', flexDirection: 'column', gap: 1 }}>
      <CustomBreadcrumbs
        heading="Certificates"
        description="Find a student, review all certificate history, or generate a certificate for that student."
        links={[
          { name: 'Student', href: studentPaths.dashboard },
          { name: 'Student Records', href: studentPaths.records.studentList },
          { name: 'Certificates' },
        ]}
        action={
          canIssue &&
          student && (
            <Button
              size="small"
              variant="contained"
              color="inherit"
              startIcon={<Iconify icon={GlobalIcons.addIcon} />}
              aria-label={`Generate certificate for ${[student.firstName, student.middleName, student.lastName].filter(Boolean).join(' ')}`}
              onClick={() => setGeneration(student)}
            >
              Generate certificate
            </Button>
          )
        }
      />
      {!canView ? (
        <Typography role="status">You do not have access to certificates.</Typography>
      ) : !academicYearId ? (
        <Typography role="status">
          Select an academic year in the header to find students.
        </Typography>
      ) : (
        <>
          <Box sx={{ maxWidth: 560, width: 1, flexShrink: 0 }}>
            <RecordsStudentPicker
              selectedId={selectedId}
              academicYearId={academicYearId}
              includeActiveStudentList
              toastRecovery
              size="small"
              label="Find student"
              placeholder="Search name, GR or admission number"
              helperText={null}
              onSelect={changeStudent}
              onSearchInput={() => {
                if (selectedId) changeStudent(null);
                else setGeneration(null);
              }}
            />
          </Box>
          {student ? (
            <>
              <Paper variant="outlined" sx={{ p: 1.5, flexShrink: 0 }}>
                <Stack spacing={0.5}>
                  <Typography variant="subtitle2">
                    {[student.firstName, student.middleName, student.lastName]
                      .filter(Boolean)
                      .join(' ')}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {student.grNumber || student.grNo || '—'} ·{' '}
                    {[student.standardName, student.divisionName].filter(Boolean).join(' / ') ||
                      '—'}
                  </Typography>
                </Stack>
              </Paper>
              <CertificateHistoryTable
                key={`${academicYearId}-${student.studentId}`}
                studentId={student.studentId}
              />
            </>
          ) : (
            <Typography variant="body2" color="text.secondary" role="status">
              {selectedId && selected.isFetching
                ? 'Loading the selected student…'
                : 'Search and select a student to view certificate history.'}
            </Typography>
          )}
        </>
      )}
      {generation && canIssue && academicYearId && student?.studentId === generation.studentId && (
        <CertificateGenerationDrawer
          students={[generation]}
          academicYearId={academicYearId}
          onClose={() => setGeneration(null)}
          onViewHistory={() => setGeneration(null)}
        />
      )}
    </Box>
  );
}
