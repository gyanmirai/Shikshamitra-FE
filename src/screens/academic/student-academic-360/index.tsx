'use client';

import type { RootState } from 'src/redux/store';
import type { Division, Standards, Organization } from 'src/types/school';

import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { useRef, useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import { useGetStudentsByDivisionQuery } from 'src/redux/student';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Card, Stack, Button, TextField, Typography, InputAdornment } from '@mui/material';

import {
  studentMatchesSearch,
  matchesAcademicFilter,
  normalizeAcademicStudent,
} from './listUtils';

import { StudentAcademic360Table } from './components/StudentAcademic360Table';
import { StudentAcademic360Drawer } from './components/StudentAcademic360Drawer';
import { StudentAcademicSummaryCards } from './components/StudentAcademicSummaryCards';

import type { AcademicSortKey, AcademicSmartFilter } from './listUtils';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<AcademicSmartFilter>('all');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [sortKey, setSortKey] = useState<AcademicSortKey>('priority');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [selectedStudent, setSelectedStudent] = useState<Academic360StudentRow | null>(null);
  const lastFocusedStudentId = useRef('');
  const searchInputRef = useRef<HTMLInputElement | null>(null);

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
    const timeoutId = window.setTimeout(() => setDebouncedSearchTerm(searchTerm.trim()), 350);
    return () => window.clearTimeout(timeoutId);
  }, [searchTerm]);

  useEffect(() => {
    setPage(0);
  }, [selectedClass, selectedDivision, debouncedSearchTerm, activeFilter]);

  useEffect(() => {
    if (selectedStudent || !lastFocusedStudentId.current) return;

    const selector = `[data-student-id="${lastFocusedStudentId.current}"]`;
    window.requestAnimationFrame(() => document.querySelector<HTMLElement>(selector)?.focus());
  }, [selectedStudent]);

  useEffect(() => {
    const handleSearchShortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping = ['INPUT', 'TEXTAREA'].includes(target?.tagName || '');
      if (event.key !== '/' || isTyping) return;

      event.preventDefault();
      searchInputRef.current?.focus();
    };

    window.addEventListener('keydown', handleSearchShortcut);
    return () => window.removeEventListener('keydown', handleSearchShortcut);
  }, []);

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
      searchTerm: debouncedSearchTerm,
    },
    { skip: !selectedDivision }
  );

  const students = readStudents(studentsData);
  const academicItems = students.map(normalizeAcademicStudent);
  const searchedItems = academicItems.filter((item) => studentMatchesSearch(item, searchTerm));
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

  const handleSortChange = (nextSortKey: AcademicSortKey) => {
    if (sortKey === nextSortKey) {
      setSortDirection((current) => (current === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortKey(nextSortKey);
    setSortDirection(nextSortKey === 'priority' ? 'asc' : 'desc');
  };

  const handleRowsPerPageChange = (nextRowsPerPage: number) => {
    setRowsPerPage(nextRowsPerPage);
    setPage(0);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 2 }}>
      <CustomBreadcrumbs
        heading="Student Academic 360"
        description="Review academic health, identify concerns and open the full student view."
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Student Academic 360' },
        ]}
      />

      <Card sx={{ p: 2 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
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
          <TextField
            fullWidth
            size="small"
            label="Search Student"
            inputRef={searchInputRef}
            placeholder="Search by student name, GR number or roll number"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="mdi:magnify" />
                </InputAdornment>
              ),
              endAdornment: searchTerm ? (
                <InputAdornment position="end">
                  <Button size="small" onClick={() => setSearchTerm('')}>
                    Clear
                  </Button>
                </InputAdornment>
              ) : null,
            }}
          />
        </Stack>
      </Card>

      <StudentAcademicSummaryCards
        items={searchedItems}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      <Card sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle1">Academic Monitoring List</Typography>
          <Typography variant="caption" color="text.secondary">
            {filteredStudents.length} of {searchedItems.length} students shown · {activeFilterLabel}
          </Typography>
        </Box>
        <StudentAcademic360Table
          students={filteredStudents}
          isLoading={isStudentsLoading}
          isError={isStudentsError}
          hasDivision={!!selectedDivision}
          searchTerm={searchTerm}
          activeFilterLabel={activeFilterLabel}
          page={page}
          rowsPerPage={rowsPerPage}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onPageChange={setPage}
          onRowsPerPageChange={handleRowsPerPageChange}
          onSortChange={handleSortChange}
          onOpenStudent={openStudent}
          onClearSearch={() => setSearchTerm('')}
          onRetry={refetchStudents}
        />
      </Card>

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
