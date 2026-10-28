'use client';

import type { RootState } from 'src/redux/store';
import type { UseTabsReturn } from 'src/hooks/use-tabs';
import type { StudentRecordProfile } from 'src/redux/student/student-profile-types';
import type { StudentDirectoryItem } from 'src/redux/student/records/student-records-types';

import { Box } from '@mui/material';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useRouter, useSearchParams } from 'next/navigation';
import { hasGrantedPermission } from 'src/utils/permissions';
import { useRef, useState, useEffect, useCallback } from 'react';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import StudentDirectory from 'src/screens/student/records/student-directory';
import SchoolExitDrawer from 'src/screens/student/records/school-exit-drawer';
import { studentPaths, studentPermissions } from 'src/constants/student-menu';
import { recordsQueryUrl } from 'src/screens/student/records/records-url-state';
import { directoryStudentName } from 'src/screens/student/records/student-directory-columns';

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
  const [exitRequest, setExitRequest] = useState<{
    student: StudentDirectoryItem;
    academicYearId: string;
  } | null>(null);
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
  const canChange =
    hasGrantedPermission(permissions, 'Students.Records.Changes.View') &&
    hasGrantedPermission(permissions, 'Students.Records.Changes.Add');
  const canExit =
    hasGrantedPermission(permissions, 'Students.Records.Transitions.View') &&
    hasGrantedPermission(permissions, 'Students.Records.Transitions.Add');
  const canViewAttendance = hasGrantedPermission(
    permissions,
    studentPermissions.attendance.markAttendance
  );
  const profileActionHref = (id: string, view: 'details' | 'attendance') =>
    recordsQueryUrl(studentPaths.records.studentList, params.toString(), {
      student: id,
      view,
      edit: view === 'details' ? 'details' : undefined,
      section: undefined,
      tab: undefined,
    });
  const listHref = recordsQueryUrl(studentPaths.records.studentList, params.toString(), {
    student: undefined,
    view: undefined,
    section: undefined,
    tab: undefined,
    edit: undefined,
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
          canChange || canViewAttendance || canExit
            ? (row) => [
                ...(canChange
                  ? [
                      {
                        id: 'edit-details',
                        label: `Edit Details for ${directoryStudentName(row)}`,
                        icon: GlobalIcons.edit,
                        href: profileActionHref(row.studentId, 'details'),
                      },
                    ]
                  : []),
                ...(canViewAttendance
                  ? [
                      {
                        id: 'attendance-history',
                        label: `Attendance History for ${directoryStudentName(row)}`,
                        icon: 'mdi:calendar-check-outline',
                        href: profileActionHref(row.studentId, 'attendance'),
                      },
                    ]
                  : []),
                ...(canExit && currentYear?.id && [6, 'Enrolled', 'Active'].includes(row.status)
                  ? [
                      {
                        id: 'change-status',
                        label: 'School Exit',
                        icon: 'mdi:account-arrow-right-outline',
                        onClick: () =>
                          setExitRequest({ student: row, academicYearId: currentYear.id }),
                      },
                    ]
                  : []),
              ]
            : undefined
        }
      />
      {exitRequest && (
        <SchoolExitDrawer
          studentId={exitRequest.student.studentId}
          academicYearId={exitRequest.academicYearId}
          studentName={directoryStudentName(exitRequest.student)}
          grNumber={exitRequest.student.grNumber ?? String(exitRequest.student.grNo ?? '')}
          className={[exitRequest.student.standardName, exitRequest.student.divisionName]
            .filter(Boolean)
            .join(' / ')}
          status={exitRequest.student.status}
          onClose={() => setExitRequest(null)}
        />
      )}
    </Box>
  );
}
