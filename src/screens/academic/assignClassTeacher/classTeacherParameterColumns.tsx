import type { IColumn } from 'src/components/customizabaleTable/types';

import { ClassTeacherEffectiveDateCell } from './ClassTeacherEffectiveDateCell';
import { getRowKey, changeReasons, assignmentTypes } from './classTeacherAssignmentModel';
import { ClassTeacherAssignmentParameterSelect } from './ClassTeacherAssignmentParameterSelect';

import type { AssignmentTableRow } from './classTeacherAssignmentModel';

type Props = {
  disabled: boolean;
  updateRow: (key: string, patch: Partial<AssignmentTableRow>) => void;
};
export const assignmentEnumOptions = (values: string[]) =>
  [...new Set(values)].map((value) => ({ label: value, value }));

export function classTeacherParameterColumns({ disabled, updateRow }: Props): IColumn[] {
  return [
    {
      id: 'effectiveFromDraft',
      label: 'Effective from',
      minWidth: 210,
      isSort: false,
      isFilter: true,
      filterType: 'date',
      valueType: 'date',
      render: (_, row) => (
        <ClassTeacherEffectiveDateCell
          value={row.effectiveFromDraft}
          identity={`${row.className} ${row.divisionName}`}
          disabled={disabled}
          onChange={(value) =>
            updateRow(getRowKey(row as AssignmentTableRow), { effectiveFromDraft: value })
          }
        />
      ),
    },
    {
      id: 'assignmentTypeDraft',
      label: 'Assignment type',
      minWidth: 190,
      isSort: false,
      isFilter: true,
      filterType: 'enum',
      enumOptions: assignmentEnumOptions(assignmentTypes),
      render: (_, row) => (
        <ClassTeacherAssignmentParameterSelect
          label="Assignment type"
          disabled={disabled}
          ariaLabel={`${row.className} ${row.divisionName} Assignment Type`}
          options={assignmentTypes}
          value={row.assignmentTypeDraft}
          onChange={(value) =>
            updateRow(getRowKey(row as AssignmentTableRow), { assignmentTypeDraft: value })
          }
        />
      ),
    },
    {
      id: 'changeReasonDraft',
      label: 'Change reason',
      minWidth: 240,
      isSort: false,
      isFilter: true,
      filterType: 'enum',
      enumOptions: assignmentEnumOptions(changeReasons),
      render: (_, row) => (
        <ClassTeacherAssignmentParameterSelect
          label="Change reason"
          disabled={disabled}
          ariaLabel={`${row.className} ${row.divisionName} Change Reason`}
          options={changeReasons}
          value={row.changeReasonDraft}
          onChange={(value) =>
            updateRow(getRowKey(row as AssignmentTableRow), { changeReasonDraft: value })
          }
        />
      ),
    },
  ];
}
