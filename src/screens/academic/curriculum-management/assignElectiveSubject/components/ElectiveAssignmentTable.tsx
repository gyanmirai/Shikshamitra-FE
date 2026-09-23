'use client';

import CustomizableTable from 'src/components/customizabaleTable';

import type { AssignmentStatus, PreferenceMatchStatus, StudentElectiveRow } from '../types';

import { getElectiveAssignmentColumns } from './electiveAssignmentColumns';

interface ElectiveAssignmentTableProps {
  students: StudentElectiveRow[];
  isLoading: boolean;
  isLocked: boolean;
  searchTerm: string;
  selectedRowIds: Set<string>;
  studentSelections: Record<string, string>;
  onSearchChange: (value: string) => void;
  onToggleRow: (studentId: string) => void;
  onToggleAllRows: (studentIds: string[], checked: boolean) => void;
  onToggleSubject: (studentId: string, subjectId: string) => void;
  getPreferenceMatch: (row: StudentElectiveRow) => PreferenceMatchStatus;
  getRowStatus: (row: StudentElectiveRow) => AssignmentStatus;
}

export default function ElectiveAssignmentTable({
  students,
  isLoading,
  isLocked,
  searchTerm,
  selectedRowIds,
  studentSelections,
  onSearchChange,
  onToggleRow,
  onToggleAllRows,
  onToggleSubject,
  getPreferenceMatch,
  getRowStatus,
}: ElectiveAssignmentTableProps) {
  const columns = getElectiveAssignmentColumns({
    isLocked,
    students,
    selectedRowIds,
    studentSelections,
    onToggleRow,
    onToggleAllRows,
    onToggleSubject,
    getPreferenceMatch,
    getRowStatus,
  });

  return (
    <CustomizableTable
      tableId="elective-table"
      tableTitle="Elective assignments"
      data={students}
      columns={columns}
      isLoading={isLoading}
      isSearch
      serverSideSearch
      searchTerm={searchTerm}
      onSearchInputChange={onSearchChange}
      searchFieldProps={{
        label: 'Search students',
        placeholder: 'Name, roll no. or GR no.',
        inputProps: { 'aria-label': 'Search students' },
      }}
      noDataText={<>No students found</>}
      wrapperProps={{ sx: { flex: 1, minHeight: { xs: 420, md: 0 } } }}
      tableContainerProps={{ sx: { minHeight: { xs: 340, md: 0 } } }}
    />
  );
}
