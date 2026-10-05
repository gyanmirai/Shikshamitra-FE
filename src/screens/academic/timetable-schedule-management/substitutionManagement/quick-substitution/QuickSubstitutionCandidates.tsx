import type { IColumn } from 'src/components/customizabaleTable/types';
import type { ApiSuggestedTeacher } from 'src/redux/academicAPI/timetableApi/substitutionManagementApi';

import { Radio, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';

type Props = {
  teachers: ApiSuggestedTeacher[];
  selectedId: string;
  disabled: boolean;
  onSelect: (id: string) => void;
};

export function QuickSubstitutionCandidates({ teachers, selectedId, disabled, onSelect }: Props) {
  const columns: IColumn[] = [
    { id: 'teacherName', label: 'Teacher', minWidth: 160 },
    {
      id: 'recommendationReason',
      label: 'Availability',
      minWidth: 210,
      render: (value, row) => (
        <Typography variant="body2" color={row.hasConflict ? 'error.main' : 'text.secondary'}>
          {row.conflictReason || value}
        </Typography>
      ),
    },
    { id: 'todaySubstitutionCount', label: 'Today’s cover', minWidth: 100 },
    {
      id: 'select',
      label: 'Select',
      sticky: true,
      isFilter: false,
      isSort: false,
      excludeFromExport: true,
      render: (_, row) => (
        <Radio
          checked={selectedId === row.teacherId}
          onChange={() => onSelect(row.teacherId || '')}
          disabled={disabled || !row.teacherId || row.hasConflict || !row.isFullSlotCoverage}
          inputProps={{ 'aria-label': `Select ${row.teacherName}` }}
        />
      ),
    },
  ];
  return (
    <CustomizableTable
      tableId="quick-substitution-candidates"
      columns={columns}
      data={teachers}
      noDataText="No available substitute found for this period."
    />
  );
}
