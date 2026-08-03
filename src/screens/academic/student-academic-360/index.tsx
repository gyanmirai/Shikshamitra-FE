'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import { useRef, useState, useEffect, useCallback } from 'react';
import CustomSelect from 'src/components/custom-select';
import { useLazyGetStudentsByDivisionQuery } from 'src/redux/student';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Card, Stack } from '@mui/material';

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

const ALL_OPTION_ID = 'ALL';

const StudentAcademic360Screen = () => {
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [selectedClass, setSelectedClass] = useState(ALL_OPTION_ID);
  const [selectedDivision, setSelectedDivision] = useState(ALL_OPTION_ID);
  const [students, setStudents] = useState<Academic360StudentRow[]>([]);
  const [isStudentsLoading, setIsStudentsLoading] = useState(false);
  const [isStudentsError, setIsStudentsError] = useState(false);
  const [activeFilter, setActiveFilter] = useState<AcademicSmartFilter>('all');
  const [selectedStudent, setSelectedStudent] = useState<Academic360StudentRow | null>(null);
  const lastFocusedStudentId = useRef('');

  const [getStudentsByDivision] = useLazyGetStudentsByDivisionQuery();

  useEffect(() => {
    const classes =
      medium?.educationMediumStages?.flatMap((stage: Organization) => stage.standards || []) || [];

    setAllClass(classes);
    setSelectedClass(ALL_OPTION_ID);
    setSelectedDivision(ALL_OPTION_ID);
  }, [medium]);

  useEffect(() => {
    if (selectedStudent || !lastFocusedStudentId.current) return;

    const selector = `[data-student-id="${lastFocusedStudentId.current}"]`;
    window.requestAnimationFrame(() => document.querySelector<HTMLElement>(selector)?.focus());
  }, [selectedStudent]);

  const classOptions = [
    { id: ALL_OPTION_ID, name: 'All Classes' },
    ...allClass,
  ];

  const currentClassObj = allClass.find((standard) => standard.id === selectedClass);
  const availableDivisions = selectedClass === ALL_OPTION_ID ? [] : currentClassObj?.divisions || [];

  const divisionOptions = [
    { id: ALL_OPTION_ID, name: 'All Divisions' },
    ...availableDivisions,
  ];

  const handleClassChange = (newClass: string) => {
    setSelectedClass(newClass);
    setSelectedDivision(ALL_OPTION_ID);
  };

  const fetchStudentRecords = useCallback(async () => {
    let targetDivisionIds: string[] = [];

    if (selectedClass === ALL_OPTION_ID || !selectedClass) {
      targetDivisionIds = allClass
        .flatMap((standard) => standard.divisions || [])
        .map((d) => d.id)
        .filter(Boolean);
    } else if (selectedDivision === ALL_OPTION_ID || !selectedDivision) {
      targetDivisionIds = (currentClassObj?.divisions || [])
        .map((d) => d.id)
        .filter(Boolean);
    } else {
      targetDivisionIds = [selectedDivision];
    }

    if (targetDivisionIds.length === 0) {
      setStudents([]);
      setIsStudentsLoading(false);
      setIsStudentsError(false);
      return;
    }

    setIsStudentsLoading(true);
    setIsStudentsError(false);

    try {
      const responses = await Promise.all(
        targetDivisionIds.map((divId) =>
          getStudentsByDivision({
            divisionId: divId,
            skipCount: 0,
            maxResultCount: 200,
            searchTerm: '',
          }).unwrap()
        )
      );

      const combined: Academic360StudentRow[] = [];
      const seenIds = new Set<string>();

      responses.forEach((res) => {
        const items = readStudents(res);
        items.forEach((item) => {
          const uniqueId = item.studentId || item.id || `${item.grNo}-${item.rollNo}-${item.studentName}`;
          if (uniqueId && !seenIds.has(uniqueId)) {
            seenIds.add(uniqueId);
            combined.push(item);
          }
        });
      });

      setStudents(combined);
    } catch (err) {
      console.error('Failed to load 360 students:', err);
      setIsStudentsError(true);
    } finally {
      setIsStudentsLoading(false);
    }
  }, [allClass, currentClassObj, selectedClass, selectedDivision, getStudentsByDivision]);

  useEffect(() => {
    fetchStudentRecords();
  }, [fetchStudentRecords]);

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
            options={classOptions}
            label="Class"
            value={selectedClass}
            onChange={(value) => handleClassChange(value as string)}
            labelKey="name"
            valueKey="id"
            formControlProps={{ sx: { minWidth: { md: 240 } } }}
          />
          <CustomSelect
            options={divisionOptions}
            label="Division"
            value={selectedDivision}
            onChange={(value) => setSelectedDivision(value as string)}
            labelKey="name"
            valueKey="id"
            disabled={selectedClass !== ALL_OPTION_ID && availableDivisions.length === 0}
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
        hasDivision={true}
        activeFilterLabel={activeFilterLabel}
        onOpenStudent={openStudent}
        onRetry={fetchStudentRecords}
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
