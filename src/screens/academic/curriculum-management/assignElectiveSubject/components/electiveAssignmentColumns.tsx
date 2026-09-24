'use client';

import type { IData, IColumn } from 'src/components/customizabaleTable/types';

import { Box } from '@mui/material';
import { Label } from 'src/components/label';

import SubjectSelectionControl from './SubjectSelectionControl';
import {
  compactCell,
  compactHeader,
  getStatusColumn,
  getSelectionColumn,
} from './electiveAssignmentSupportColumns';

import type { AssignmentStatus, StudentElectiveRow, PreferenceMatchStatus } from '../types';

interface ColumnOptions {
  isLocked: boolean;
  students: StudentElectiveRow[];
  selectedRowIds: Set<string>;
  studentSelections: Record<string, string>;
  onToggleRow: (studentId: string) => void;
  onToggleAllRows: (studentIds: string[], checked: boolean) => void;
  onToggleSubject: (studentId: string, subjectId: string) => void;
  getPreferenceMatch: (row: StudentElectiveRow) => PreferenceMatchStatus;
  getRowStatus: (row: StudentElectiveRow) => AssignmentStatus;
}

const asStudent = (row: IData) => row as StudentElectiveRow;

export function getElectiveAssignmentColumns({
  isLocked,
  students,
  selectedRowIds,
  studentSelections,
  onToggleRow,
  onToggleAllRows,
  onToggleSubject,
  getPreferenceMatch,
  getRowStatus,
}: ColumnOptions): IColumn[] {
  const dataColumns: IColumn[] = [
    {
      id: 'studentName',
      label: 'Student Name',
      minWidth: '175px',
      sticky: true,
      stickyPosition: 'left',
      filterType: 'string',
      headerSx: compactHeader,
      cellSx: compactCell,
      render: (_, data) => {
        const row = asStudent(data);
        return (
          <Box component="span">
            {row.studentName}
            {row.grNo ? ` (${row.grNo})` : ''}
          </Box>
        );
      },
    },
    {
      id: 'rollNo',
      label: 'Roll No.',
      minWidth: '85px',
      filterType: 'number',
      headerSx: compactHeader,
      cellSx: compactCell,
    },
    {
      id: 'preference',
      label: 'Preference Match',
      minWidth: '140px',
      filterType: 'enum',
      enumOptions: [
        { label: 'Matched', value: 'matched' },
        { label: 'Mismatch', value: 'mismatched' },
        { label: 'No preference', value: 'noPreference' },
      ],
      headerSx: compactHeader,
      cellSx: compactCell,
      render: (_, data) => {
        const match = getPreferenceMatch(asStudent(data));
        return match === 'noPreference' ? (
          <Box component="span" sx={{ color: 'text.disabled', typography: 'caption' }}>
            No preference
          </Box>
        ) : (
          <Label color={match === 'matched' ? 'success' : 'warning'} variant="soft">
            {match === 'matched' ? 'Matched' : 'Mismatch'}
          </Label>
        );
      },
    },
    {
      id: 'electiveSubjects',
      label: isLocked ? 'Elective subject' : 'Choose elective subject',
      minWidth: '360px',
      isFilter: false,
      isSort: false,
      headerSx: compactHeader,
      cellSx: compactCell,
      render: (_, data) => {
        const row = asStudent(data);
        return (
          <SubjectSelectionControl
            subjects={row.selectableSubjects}
            selectedSubjectId={studentSelections[row.studentId]}
            onToggle={(subjectId) => onToggleSubject(row.studentId, subjectId)}
            disabled={isLocked}
            ariaLabelPrefix={row.studentName}
          />
        );
      },
    },
  ];

  if (isLocked) return dataColumns;

  return [
    getSelectionColumn({ students, selectedRowIds, onToggleRow, onToggleAllRows }),
    ...dataColumns,
    getStatusColumn(getRowStatus),
  ];
}
