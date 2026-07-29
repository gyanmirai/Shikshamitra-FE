'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { useRef, useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import { useGetStudentsByDivisionQuery } from 'src/redux/student';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Card, Stack, Typography } from '@mui/material';

import { matchesAcademicFilter, normalizeAcademicStudent } from './listUtils';

import { StudentAcademic360Table } from './components/StudentAcademic360Table';
import { StudentAcademic360Drawer } from './components/StudentAcademic360Drawer';
import { StudentAcademicSummaryCards } from './components/StudentAcademicSummaryCards';

import type { AcademicSmartFilter } from './listUtils';
import type { Academic360ApiList, Academic360StudentRow } from './types';

const readStudents = (payload: unknown): Academic360StudentRow[] => {
  if (Array.isArray(payload)) return payload as Academic360StudentRow[];
  if (!payload || typeof payload !== 'object') return [];

  const list = payload as Academic360ApiList<Academic360StudentRow>;
  return list.items || [];
};

const StudentAcademic360Screen = () => {
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  const [selectedDivision, setSelectedDivision] = useState('');
  const [activeFilter, setActiveFilter] = useState<AcademicSmartFilter>('all');
  const [selectedStudent, setSelectedStudent] = useState<Academic360StudentRow | null>(null);
  const lastFocusedStudentId = useRef('');

  useEffect(() => {
    const classes =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];

    setAllClass(classes);
    setSelectedClass(classes[0]?.id || '');
  }, [medium]);

  useEffect(() => {
    const divisions = allClass.find((standard) => standard.id === selectedClass)?.divisions || [];

    setAllDivision(divisions);
    setSelectedDivision(divisions[0]?.id || '');
  }, [allClass, selectedClass]);

  useEffect(() => {
    if (selectedStudent || !lastFocusedStudentId.current) return;

    const selector = `[data-student-id="${lastFocusedStudentId.current}"]`;
    window.requestAnimationFrame(() => document.querySelector<HTMLElement>(selector)?.focus());
  }, [selectedStudent]);

  const {
    data: studentsData,
    isError: isStudentsError,
    isFetching: isStudentsLoading,
    refetch: refetchStudents,
  } = useGetStudentsByDivisionQuery(
    {
      divisionId: selectedDivision,
      skipCount: 0,
      maxResultCount: 100,
      searchTerm: '',
    },
    { skip: !selectedDivision }
  );

  const students = readStudents(studentsData);
  const academicItems = students.map(normalizeAcademicStudent);
  const searchedItems = academicItems;
  const filteredItems = searchedItems.filter((item) => matchesAcademicFilter(item, activeFilter));
  const filteredStudents = filteredItems.map((item) => item.student);

  const activeFilterLabel = activeFilter.replace(/([A-Z])/g, ' $1').toLowerCase();

  const openStudent = (student: Academic360StudentRow) => {
    lastFocusedStudentId.current = student.studentId || student.id || '';
    setSelectedStudent(student);
  };

  const changeDrawerStudent = (student: Academic360StudentRow | null) => {
    if (student) lastFocusedStudentId.current = student.studentId || student.id || '';
    setSelectedStudent(student);
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

      <Card sx={{ p: 1, mb: 1 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }}>
          <CustomSelect
            options={allClass}
            label="Class"
            value={selectedClass}
            onChange={(value) => setSelectedClass(value as string)}
            labelKey="name"
            valueKey="id"
            formControlProps={{ sx: { minWidth: { md: 240 } } }}
          />
          <CustomSelect
            options={allDivision}
            label="Division"
            value={selectedDivision}
            onChange={(value) => setSelectedDivision(value as string)}
            labelKey="name"
            valueKey="id"
            disabled={!selectedClass}
            formControlProps={{ sx: { minWidth: { md: 220 } } }}
          />
        </Stack>
      </Card>

      <StudentAcademicSummaryCards
        items={searchedItems}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      <StudentAcademic360Table
        key={`${selectedClass}-${selectedDivision}-${activeFilter}`}
        students={filteredStudents}
        isLoading={isStudentsLoading}
        isError={isStudentsError}
        hasDivision={!!selectedDivision}
        activeFilterLabel={activeFilterLabel}
        onOpenStudent={openStudent}
        onRetry={refetchStudents}
      />

      <StudentAcademic360Drawer
        open={!!selectedStudent}
        student={selectedStudent}
        students={filteredStudents}
        standardId={selectedClass}
        divisionId={selectedDivision}
        onStudentChange={changeDrawerStudent}
        onClose={() => setSelectedStudent(null)}
      />
    </Box>
  );
};

export default StudentAcademic360Screen;
