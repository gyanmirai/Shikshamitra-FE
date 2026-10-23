'use client';

import type { RootState } from 'src/redux/store';
import type { Standards, Organization } from 'src/types/school';

import { Box } from '@mui/material';
import { useSelector } from 'react-redux';
import { useRef, useState, useEffect } from 'react';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { AcademicContextContent } from 'src/screens/academic/components/AcademicContextContent';

import { useStudentAcademic360List } from './hooks/useStudentAcademic360List';
import { StudentAcademic360Table } from './components/StudentAcademic360Table';
import { StudentAcademic360Drawer } from './components/StudentAcademic360Drawer';
import { StudentAcademic360Filters } from './components/StudentAcademic360Filters';

import type { Academic360StudentRow } from './types';

const ALL_OPTION_ID = 'ALL';

type DrawerPageState = {
  students: Academic360StudentRow[];
  page: number;
  rowsPerPage: number;
  totalCount: number;
};

type PendingDrawerNavigation = {
  page: number;
  previousPage: number;
  direction: 'previous' | 'next';
};

const StudentAcademic360Screen = () => {
  const {
    currentYear,
    currentBoard,
    currentMedium: medium,
  } = useSelector((state: RootState) => state.globalState);
  const [selectedClass, setSelectedClass] = useState(ALL_OPTION_ID);
  const [selectedDivision, setSelectedDivision] = useState(ALL_OPTION_ID);
  const [selectedStudent, setSelectedStudent] = useState<Academic360StudentRow | null>(null);
  const [drawerPage, setDrawerPage] = useState<DrawerPageState | null>(null);
  const [pendingDrawerNavigation, setPendingDrawerNavigation] =
    useState<PendingDrawerNavigation | null>(null);
  const lastFocusedStudentId = useRef('');

  const allClass: Standards[] =
    medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];
  const effectiveClass =
    selectedClass !== ALL_OPTION_ID && allClass.some((standard) => standard.id === selectedClass)
      ? selectedClass
      : ALL_OPTION_ID;
  const currentClassObj = allClass.find((standard) => standard.id === effectiveClass);
  const availableDivisions = currentClassObj?.divisions || [];
  const effectiveDivision =
    effectiveClass !== ALL_OPTION_ID &&
    availableDivisions.some((division) => division.id === selectedDivision)
      ? selectedDivision
      : ALL_OPTION_ID;

  const list = useStudentAcademic360List({
    academicYearId: currentYear?.id || '',
    boardId: currentBoard?.id || '',
    educationMediumId: medium?.id || '',
    standardId: effectiveClass === ALL_OPTION_ID ? undefined : effectiveClass,
    divisionId: effectiveDivision === ALL_OPTION_ID ? undefined : effectiveDivision,
  });
  const students = list.data?.items || [];
  const { data: listData, isError: isListError, page: listPage, changePagination } = list;

  useEffect(() => {
    if (selectedStudent || !lastFocusedStudentId.current) return;
    const selector = `[data-student-id="${lastFocusedStudentId.current}"]`;
    window.requestAnimationFrame(() => document.querySelector<HTMLElement>(selector)?.focus());
  }, [selectedStudent]);

  useEffect(() => {
    if (!pendingDrawerNavigation || !drawerPage) return;
    if (isListError) {
      changePagination(pendingDrawerNavigation.previousPage + 1, drawerPage.rowsPerPage);
      setPendingDrawerNavigation(null);
      return;
    }
    if (listPage !== pendingDrawerNavigation.page || !listData) return;

    const nextStudents = listData.items;
    const nextStudent =
      pendingDrawerNavigation.direction === 'next'
        ? nextStudents[0]
        : nextStudents[nextStudents.length - 1];
    if (nextStudent) {
      lastFocusedStudentId.current = nextStudent.studentId || nextStudent.id || '';
      setDrawerPage({
        students: nextStudents,
        page: listPage,
        rowsPerPage: drawerPage.rowsPerPage,
        totalCount: listData.totalCount,
      });
      setSelectedStudent(nextStudent);
    }
    setPendingDrawerNavigation(null);
  }, [drawerPage, changePagination, listData, isListError, listPage, pendingDrawerNavigation]);

  const handleClassChange = (newClass: string) => {
    setSelectedClass(newClass);
    setSelectedDivision(ALL_OPTION_ID);
  };

  const openStudent = (student: Academic360StudentRow) => {
    lastFocusedStudentId.current = student.studentId || student.id || '';
    setDrawerPage({
      students,
      page: list.page,
      rowsPerPage: list.rowsPerPage,
      totalCount: list.data?.totalCount || students.length,
    });
    setSelectedStudent(student);
  };

  const changeDrawerStudent = (student: Academic360StudentRow | null) => {
    if (student) lastFocusedStudentId.current = student.studentId || student.id || '';
    setSelectedStudent(student);
  };

  const navigateDrawerPage = (direction: 'previous' | 'next') => {
    if (!drawerPage || pendingDrawerNavigation) return;
    const page = drawerPage.page + (direction === 'next' ? 1 : -1);
    if (page < 0 || page * drawerPage.rowsPerPage >= drawerPage.totalCount) return;
    setPendingDrawerNavigation({ page, previousPage: drawerPage.page, direction });
    list.changePagination(page + 1, drawerPage.rowsPerPage);
  };

  const closeDrawer = () => {
    setPendingDrawerNavigation(null);
    setSelectedStudent(null);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CustomBreadcrumbs
        heading="Student Academic 360"
        description="Review academic health, identify concerns and open the full student view."
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Student Academic 360' },
        ]}
      />
      <AcademicContextContent loading={false}>
        <StudentAcademic360Filters
          classes={allClass}
          divisions={availableDivisions}
          selectedClass={effectiveClass}
          selectedDivision={effectiveDivision}
          onClassChange={handleClassChange}
          onDivisionChange={setSelectedDivision}
          summary={list.data?.summary}
          activeFilter={list.activeFilter}
          onFilterChange={list.changeFilter}
        />

        <StudentAcademic360Table
          students={students}
          totalCount={list.data?.totalCount || 0}
          page={list.page}
          rowsPerPage={list.rowsPerPage}
          searchTerm={list.searchTerm}
          isLoading={list.isFetching}
          isError={list.isError}
          isReady={list.isReady}
          activeFilterLabel={list.activeFilter.replace(/([A-Z])/g, ' $1').toLowerCase()}
          onOpenStudent={openStudent}
          onRetry={list.refetch}
          onPagination={list.changePagination}
          onSearch={list.changeSearch}
          onSort={list.changeSort}
        />

        <StudentAcademic360Drawer
          open={!!selectedStudent}
          student={selectedStudent}
          students={drawerPage?.students || students}
          pageStartIndex={(drawerPage?.page || 0) * (drawerPage?.rowsPerPage || 10)}
          totalStudents={drawerPage?.totalCount || 0}
          isPageLoading={!!pendingDrawerNavigation}
          onAdjacentPage={navigateDrawerPage}
          standardId={effectiveClass}
          divisionId={effectiveDivision}
          onStudentChange={changeDrawerStudent}
          onClose={closeDrawer}
        />
      </AcademicContextContent>
    </Box>
  );
};

export default StudentAcademic360Screen;
