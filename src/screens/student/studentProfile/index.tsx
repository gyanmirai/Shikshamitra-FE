'use client';

import type { RootState } from 'src/redux/store';
import type { UseTabsReturn } from 'src/hooks/use-tabs';
import type { StudentRecordProfile } from 'src/redux/student/student-profile-types';
import type { StudentDirectoryItem } from 'src/redux/student/records/student-records-types';

import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { RouterLink } from 'src/routes/components';
import { Box, MenuList, MenuItem } from '@mui/material';
import { studentPaths } from 'src/constants/student-menu';
import { useRouter, useSearchParams } from 'next/navigation';
import { hasGrantedPermission } from 'src/utils/permissions';
import { financePermissions } from 'src/constants/finance-menu';
import { useRef, useState, useEffect, useCallback } from 'react';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import StudentDirectory from 'src/screens/student/records/student-directory';
import { recordsQueryUrl } from 'src/screens/student/records/records-url-state';
import AssignmentDrawer from 'src/screens/finance/FeeStructureAssign/Components/AssignmentDrawer';

import Finance from './finance';
import Library from './libraray';
import Academic from './academic';
import Document from './document';
import Attendance from './attendance';
import Communication from './communication';
import StudentCalendar from './StudentCalendar';
import StudentDashboard from './studentDashboard';
import StudentTransportProfile from './transport';
import { StudentProfileView } from './student-profile-view';
import { StudentProfileDataBoundary } from './student-profile-data-boundary';

import type { ProfileAcademicYearContext } from './student-profile-data-boundary';

export interface StudentTabsComponentType {
  tabs?: UseTabsReturn;
  student: StudentRecordProfile;
  refetch?: () => unknown;
}

const RELATED_SECTIONS = [
  {
    value: 'activity',
    label: 'School activity',
    icon: <Iconify icon="mdi:view-dashboard-outline" />,
    component: StudentDashboard,
  },
  {
    value: 'attendance',
    label: 'Attendance',
    icon: <Iconify icon="mdi:calendar-check-outline" />,
    component: Attendance,
  },
  {
    value: 'academic',
    label: 'Academic',
    icon: <Iconify icon="mdi:school-outline" />,
    component: Academic,
  },
  {
    value: 'finance',
    label: 'Finance',
    icon: <Iconify icon="mdi:bank-outline" />,
    component: Finance,
  },
  {
    value: 'communications',
    label: 'Communications',
    icon: <Iconify icon="mdi:message-outline" />,
    component: Communication,
  },
  {
    value: 'transportation',
    label: 'Transportation',
    icon: <Iconify icon="mdi:bus" />,
    component: StudentTransportProfile,
  },
  {
    value: 'library',
    label: 'Library',
    icon: <Iconify icon="mdi:book-open-outline" />,
    component: Library,
  },
  {
    value: 'calendar',
    label: 'Calendar',
    icon: <Iconify icon="mdi:calendar-outline" />,
    component: StudentCalendar,
  },
];

export function StudentProfile() {
  const params = useSearchParams();
  const router = useRouter();
  const studentId = params.get('student') ?? '';
  const permissions = useSelector((state: RootState) => state.auth.permissions);
  const currentYear = useSelector((state: RootState) => state.globalState.currentYear);
  const currentYearRef = useRef(currentYear);
  useEffect(() => {
    currentYearRef.current = currentYear;
  }, [currentYear]);
  const [editingYear, setEditingYear] = useState<ProfileAcademicYearContext | undefined>();
  const requestProfileNavigation = useRef<(proceed: () => void) => void>((proceed) => proceed());
  const registerNavigationGuard = useCallback((guard: ((proceed: () => void) => void) | null) => {
    requestProfileNavigation.current = guard ?? ((proceed) => proceed());
  }, []);
  const onFormEditingChange = useCallback((editing: boolean) => {
    setEditingYear((previous) =>
      editing
        ? (previous ?? { id: currentYearRef.current?.id, name: currentYearRef.current?.name })
        : undefined
    );
  }, []);
  const [feeStudent, setFeeStudent] = useState<StudentDirectoryItem | null>(null);
  const canChange =
    hasGrantedPermission(permissions, 'Students.Records.Changes.View') &&
    hasGrantedPermission(permissions, 'Students.Records.Changes.Create');
  const canAssignFees =
    hasGrantedPermission(permissions, `${financePermissions.fees.structureAssign}.View`) &&
    hasGrantedPermission(permissions, `${financePermissions.fees.structureAssign}.Add`);
  const listHref = recordsQueryUrl(studentPaths.records.studentList, params.toString(), {
    student: undefined,
    view: undefined,
    section: undefined,
    tab: undefined,
  });
  if (studentId)
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: 1, minHeight: 0, gap: 1 }}>
        <StudentProfileDataBoundary
          studentId={studentId}
          academicYearContext={editingYear}
          header={
            <CustomBreadcrumbs
              heading="Student Profile"
              description="Review the student record and its admission history."
              links={[
                { name: 'Student', href: studentPaths.dashboard },
                { name: 'Student Records', href: listHref },
                { name: 'Student List', href: listHref },
                { name: 'Student Profile' },
              ]}
              isBack
              onBack={() => requestProfileNavigation.current(() => router.push(listHref))}
            />
          }
        >
          {(student, refetch) => (
            <StudentProfileView
              student={student}
              refetch={refetch}
              sections={RELATED_SECTIONS}
              documents={Document}
              academicYearContext={editingYear}
              onFormEditingChange={onFormEditingChange}
              onNavigationGuardChange={registerNavigationGuard}
            />
          )}
        </StudentProfileDataBoundary>
      </Box>
    );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 1, minHeight: 0 }}>
      <StudentDirectory
        rowActions={
          canChange || canAssignFees
            ? (row, { popover }) => (
                <MenuList>
                  {canChange && (
                    <MenuItem
                      component={RouterLink}
                      href={`${studentPaths.records.changes}?mode=new&student=${encodeURIComponent(
                        row.studentId
                      )}&section=status`}
                      onClick={popover.onClose}
                    >
                      <Iconify icon="mdi:account-edit-outline" sx={{ mr: 1 }} />
                      Change status
                    </MenuItem>
                  )}
                  {canAssignFees && (
                    <MenuItem
                      onClick={() => {
                        popover.onClose();
                        setFeeStudent(row);
                      }}
                    >
                      <Iconify icon="mdi:cash-multiple" sx={{ mr: 1 }} />
                      Assign fee structure
                    </MenuItem>
                  )}
                </MenuList>
              )
            : undefined
        }
      />
      {feeStudent && currentYear?.id && (
        <AssignmentDrawer
          students={[
            {
              id: feeStudent.studentId,
              studentId: feeStudent.studentId,
              studentName: [feeStudent.firstName, feeStudent.middleName, feeStudent.lastName]
                .filter(Boolean)
                .join(' '),
            },
          ]}
          academicYearId={currentYear.id}
          academicYearName={currentYear.name}
          onClose={() => setFeeStudent(null)}
        />
      )}
    </Box>
  );
}
