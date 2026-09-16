'use client';

import type { RootState } from 'src/redux/store';
import type { Medium, Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import { Box, Card, Stack } from '@mui/material';
import { useRef, useState, useCallback } from 'react';
import CustomSelect from 'src/components/custom-select';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useStudentAcademic360List } from './hooks/useStudentAcademic360List';
import { StudentAcademic360Table } from './components/StudentAcademic360Table';
import { StudentAcademic360Drawer } from './components/StudentAcademic360Drawer';
import { StudentAcademicSummaryCards } from './components/StudentAcademicSummaryCards';

import type { Academic360StudentRow } from './types';
import type { AcademicSmartFilter } from './listUtils';

const ALL_OPTION_ID = 'ALL';

const getClasses = (medium?: Medium): Standards[] =>
  medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];

const StudentAcademic360Screen = () => {
  const medium = useSelector((state: RootState) => state.globalState.currentMedium) as Medium;
  const [selectedClass, setSelectedClass] = useState(ALL_OPTION_ID);
  const [selectedDivision, setSelectedDivision] = useState(ALL_OPTION_ID);
  const [activeFilter, setActiveFilter] = useState<AcademicSmartFilter>('all');
  const [selectedStudent, setSelectedStudent] = useState<Academic360StudentRow | null>(null);
  const lastFocusedStudentId = useRef('');
  const allClasses = getClasses(medium);
  const effectiveClass = allClasses.some((standard) => standard.id === selectedClass)
    ? selectedClass
    : ALL_OPTION_ID;
  const currentClass = allClasses.find((standard) => standard.id === effectiveClass);
  const availableDivisions = currentClass?.divisions || [];
  const effectiveDivision = availableDivisions.some((division) => division.id === selectedDivision)
    ? selectedDivision
    : ALL_OPTION_ID;
  const list = useStudentAcademic360List(effectiveClass, effectiveDivision, activeFilter);

  const restoreStudentFocus = useCallback(() => {
    if (!lastFocusedStudentId.current) return;
    const selector = `[data-student-id="${lastFocusedStudentId.current}"]`;
    window.requestAnimationFrame(() => document.querySelector<HTMLElement>(selector)?.focus());
  }, []);

  // Memoization Justification: the table's memoized columns depend on this callback.
  const openStudent = useCallback((student: Academic360StudentRow) => {
    lastFocusedStudentId.current = student.studentId || student.id || '';
    setSelectedStudent(student);
  }, []);

  // Memoization Justification: the drawer consumes this during list refetches.
  const changeDrawerStudent = useCallback(
    (student: Academic360StudentRow | null) => {
      if (student) lastFocusedStudentId.current = student.studentId || student.id || '';
      setSelectedStudent(student);
      if (!student) restoreStudentFocus();
    },
    [restoreStudentFocus]
  );

  const handleClassChange = (value: string) => {
    list.resetPage();
    setSelectedClass(value);
    setSelectedDivision(ALL_OPTION_ID);
  };
  const handleDivisionChange = (value: string) => {
    list.resetPage();
    setSelectedDivision(value);
  };
  const handleFilterChange = (filter: AcademicSmartFilter) => {
    list.resetPage();
    setActiveFilter(filter);
  };
  const activeFilterLabel = activeFilter.replace(/([A-Z])/g, ' $1').toLowerCase();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
      <CustomBreadcrumbs
        heading="Student Academic 360"
        description="Review academic health, identify concerns and open the full student view."
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Student Academic 360' },
        ]}
      />
      <Card sx={{ p: 1, mb: 1 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }}>
          <CustomSelect
            options={[{ id: ALL_OPTION_ID, name: 'All Classes' }, ...allClasses]}
            label="Class"
            value={effectiveClass}
            onChange={(value) => handleClassChange(value as string)}
            labelKey="name"
            valueKey="id"
            formControlProps={{ sx: { minWidth: { md: 240 } } }}
          />
          <CustomSelect
            options={[{ id: ALL_OPTION_ID, name: 'All Divisions' }, ...availableDivisions]}
            label="Division"
            value={effectiveDivision}
            onChange={(value) => handleDivisionChange(value as string)}
            labelKey="name"
            valueKey="id"
            disabled={effectiveClass !== ALL_OPTION_ID && availableDivisions.length === 0}
            formControlProps={{ sx: { minWidth: { md: 220 } } }}
          />
        </Stack>
      </Card>
      <StudentAcademicSummaryCards
        summary={list.summary}
        activeFilter={activeFilter}
        onFilterChange={handleFilterChange}
      />
      <StudentAcademic360Table
        students={list.rows}
        totalCount={list.totalCount}
        page={list.page}
        rowsPerPage={list.rowsPerPage}
        searchTerm={list.searchTerm}
        sorts={list.sorts}
        isLoading={list.isLoading}
        isError={list.isError}
        activeFilterLabel={activeFilterLabel}
        onOpenStudent={openStudent}
        onRetry={list.retry}
        onPagination={list.handlePagination}
        onSearch={list.handleSearch}
        onSort={list.handleSort}
      />
      <StudentAcademic360Drawer
        open={!!selectedStudent}
        student={selectedStudent}
        students={list.rows}
        standardId={effectiveClass}
        divisionId={effectiveDivision}
        onStudentChange={changeDrawerStudent}
        onClose={() => changeDrawerStudent(null)}
      />
    </Box>
  );
};

export default StudentAcademic360Screen;
