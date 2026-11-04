import type { IColumn } from 'src/components/customizabaleTable/types';
import type { ClassTeacherEligibleTeacher } from 'src/redux/classManagementApi/classTeacherAssignmentApi/classTeacherAssignmentApi';

import { Label } from 'src/components/label';

import { TeacherAssignmentCell } from './TeacherAssignmentCell';
import { getDraftTeacherWorkload } from './classTeacherDraftWorkload';
import { getClassTeacherAssignmentStatusColor } from './classTeacherAssignmentStatus';
import {
  assignmentEnumOptions,
  classTeacherParameterColumns,
} from './classTeacherParameterColumns';

import type { AssignmentTableRow } from './classTeacherAssignmentModel';

type Props = {
  rows: AssignmentTableRow[];
  teachers: ClassTeacherEligibleTeacher[];
  disabled: boolean;
  updateRow: (key: string, patch: Partial<AssignmentTableRow>) => void;
  changeTeacher: (row: AssignmentTableRow, teacher: ClassTeacherEligibleTeacher | null) => void;
};

export function classTeacherAssignmentColumns({
  rows,
  teachers,
  disabled,
  updateRow,
  changeTeacher,
}: Props): IColumn[] {
  const workload = (row: AssignmentTableRow) =>
    getDraftTeacherWorkload(teachers, row.classTeacher, row.assignedTeacher);
  const workloadText = (row: AssignmentTableRow) => {
    const value = workload(row);
    return value
      ? `${value.currentClassTeacherCount}/${value.maximumClassTeacherCount} classes`
      : 'Unassigned';
  };
  const availability = (row: AssignmentTableRow) =>
    row.assignedTeacher?.availabilityStatus || 'Unassigned';
  return [
    {
      id: 'className',
      label: 'Class',
      minWidth: 120,
      sticky: true,
      rowHeader: true,
      isFilter: true,
      filterType: 'string',
    },
    {
      id: 'divisionName',
      label: 'Division',
      minWidth: 120,
      sticky: true,
      isFilter: true,
      filterType: 'string',
    },
    { id: 'studentCount', label: 'Students', minWidth: 100, isFilter: true, filterType: 'number' },
    {
      id: 'classTeacher',
      label: 'Current class teacher',
      minWidth: 340,
      isSort: false,
      isFilter: true,
      filterType: 'string',
      filterValue: (_, row) => row.classTeacherName || 'Unassigned',
      searchValue: (_, row) => row.classTeacherName || 'Unassigned',
      exportValue: (_, row) => row.classTeacherName || 'Unassigned',
      render: (_, row) => (
        <TeacherAssignmentCell
          row={row as AssignmentTableRow}
          teachers={teachers}
          disabled={disabled}
          onChange={(teacher) => changeTeacher(row as AssignmentTableRow, teacher)}
        />
      ),
    },
    {
      id: 'workload',
      label: 'Workload',
      minWidth: 140,
      isSort: false,
      isFilter: true,
      filterType: 'string',
      filterValue: (_, row) => workloadText(row as AssignmentTableRow),
      searchValue: (_, row) => workloadText(row as AssignmentTableRow),
      exportValue: (_, row) => workloadText(row as AssignmentTableRow),
      render: (_, row) => {
        const value = workload(row as AssignmentTableRow);
        const color = !value
          ? 'default'
          : value.workloadStatus === 'Exceeded'
            ? 'error'
            : value.workloadStatus === 'High'
              ? 'warning'
              : 'info';
        return <Label color={color}>{workloadText(row as AssignmentTableRow)}</Label>;
      },
    },
    {
      id: 'availability',
      label: 'Availability',
      minWidth: 140,
      isSort: false,
      isFilter: true,
      filterType: 'enum',
      enumOptions: assignmentEnumOptions(rows.map(availability)),
      filterValue: (_, row) => availability(row as AssignmentTableRow),
      searchValue: (_, row) => availability(row as AssignmentTableRow),
      exportValue: (_, row) => availability(row as AssignmentTableRow),
      render: (_, row) => (
        <Label color={row.assignedTeacher?.isActive ? 'success' : 'default'}>
          {availability(row as AssignmentTableRow)}
        </Label>
      ),
    },
    ...classTeacherParameterColumns({ disabled, updateRow }),
    {
      id: 'assignmentStatus',
      label: 'Status',
      minWidth: 130,
      isFilter: true,
      filterType: 'enum',
      enumOptions: assignmentEnumOptions([
        'Active',
        'Draft',
        'Assigned',
        'Unassigned',
        'Changed',
        ...rows.map((row) => row.assignmentStatus),
      ]),
      render: (_, row) => (
        <Label color={getClassTeacherAssignmentStatusColor(row.assignmentStatus)}>
          {row.assignmentStatus}
        </Label>
      ),
    },
  ];
}
