'use client';

import type { LabelColor } from 'src/components/label';
import type { IData, IColumn } from 'src/components/customizabaleTable/types';

import { Checkbox } from '@mui/material';
import { Label } from 'src/components/label';

import type { AssignmentStatus, StudentElectiveRow } from '../types';

export const compactHeader = { py: 1, px: 1.25 };
export const compactCell = { py: 0.75, px: 1.25 };

interface SelectionColumnOptions {
  students: StudentElectiveRow[];
  selectedRowIds: Set<string>;
  onToggleRow: (studentId: string) => void;
  onToggleAllRows: (studentIds: string[], checked: boolean) => void;
}

export function getSelectionColumn({
  students,
  selectedRowIds,
  onToggleRow,
  onToggleAllRows,
}: SelectionColumnOptions): IColumn {
  const editableStudents = students.filter((student) => !student.isLocked);
  return {
    id: 'rowSelect',
    label: (
      <Checkbox
        size="small"
        inputProps={{ 'aria-label': 'Select all visible students' }}
        disabled={editableStudents.length === 0}
        checked={
          editableStudents.length > 0 &&
          editableStudents.every((row) => selectedRowIds.has(row.studentId))
        }
        indeterminate={
          editableStudents.some((row) => selectedRowIds.has(row.studentId)) &&
          !editableStudents.every((row) => selectedRowIds.has(row.studentId))
        }
        onChange={(event) =>
          onToggleAllRows(
            editableStudents.map((row) => row.studentId),
            event.target.checked
          )
        }
      />
    ),
    width: '32px',
    isFilter: false,
    isSort: false,
    sticky: true,
    stickyOnMobile: false,
    stickyPosition: 'left',
    // headerSx: { ...compactHeader, px: 0.75 },
    // cellSx: { ...compactCell, px: 0.75 },
    render: (_, data: IData) => {
      const row = data as StudentElectiveRow;
      return (
        <Checkbox
          size="small"
          inputProps={{ 'aria-label': `Select ${row.studentName}` }}
          checked={selectedRowIds.has(row.studentId)}
          disabled={row.isLocked}
          onChange={() => onToggleRow(row.studentId)}
        />
      );
    },
  };
}

const statusColors: Record<AssignmentStatus, LabelColor> = {
  assigned: 'success',
  unassigned: 'error',
  changed: 'info',
};
const statusLabels: Record<AssignmentStatus, string> = {
  assigned: 'Assigned',
  unassigned: 'Unassigned',
  changed: 'Changed',
};

export function getStatusColumn(
  getRowStatus: (row: StudentElectiveRow) => AssignmentStatus
): IColumn {
  return {
    id: 'status',
    label: 'Status',
    minWidth: '105px',
    sticky: true,
    stickyOnMobile: false,
    stickyPosition: 'right',
    filterType: 'enum',
    enumOptions: [
      { label: 'Assigned', value: 'assigned' },
      { label: 'Unassigned', value: 'unassigned' },
      { label: 'Changed', value: 'changed' },
    ],
    headerSx: compactHeader,
    cellSx: compactCell,
    render: (_, data) => {
      if ((data as StudentElectiveRow).isLocked) {
        return (
          <Label color="default" variant="soft">
            Locked
          </Label>
        );
      }
      const status = getRowStatus(data as StudentElectiveRow);
      return (
        <Label color={statusColors[status]} variant="soft">
          {statusLabels[status]}
        </Label>
      );
    },
  };
}
