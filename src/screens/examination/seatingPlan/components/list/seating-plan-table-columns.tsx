import type { IData, IColumn } from 'src/components/customizabaleTable/types';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { Iconify } from 'src/components/iconify';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';

import AllocationStatusBadge from '../common/AllocationStatusBadge';
import { getSeatingPlanPrimaryAction } from './seating-plan-actions';

import type { SeatingPlanListRow } from '../../types';

function seatingPlanRow(row: IData) {
  return row as SeatingPlanListRow;
}

function ExamCell({ row }: { row: SeatingPlanListRow }) {
  return (
    <Stack spacing={0.25}>
      <Typography variant="subtitle2">{row.examName}</Typography>
      <Typography variant="caption" color="text.secondary">
        {row.standardName} · {row.examTypeName}
      </Typography>
    </Stack>
  );
}

function ProgressCell({ row }: { row: SeatingPlanListRow }) {
  return (
    <Stack spacing={0.75} sx={{ minWidth: 190, pr: 1 }}>
      <Typography variant="body2" noWrap>
        {row.allocatedStudents} of {row.totalStudents} seated
      </Typography>
      <LinearProgress
        variant="determinate"
        value={row.progress}
        aria-label={`${row.examName} seating progress`}
        sx={{ height: 6, borderRadius: 1 }}
      />
    </Stack>
  );
}

function SubjectCoverageCell({ row }: { row: SeatingPlanListRow }) {
  return (
    <Stack spacing={0.25}>
      <Typography variant="body2">
        {row.subjectNames.join(', ') || 'No subjects scheduled'}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {row.plannedSubjectCount} of {row.subjectCount} subjects assigned to plans
      </Typography>
    </Stack>
  );
}

export function buildSeatingPlanColumns(
  canAdd: boolean,
  onPrimaryAction: (row: SeatingPlanListRow) => void
): IColumn[] {
  return [
    {
      id: 'examName',
      label: 'Examination',
      minWidth: 260,
      sticky: true,
      stickyPosition: 'left',
      filterType: 'string' as const,
      render: (_value, row) => <ExamCell row={seatingPlanRow(row)} />,
    },
    {
      id: 'subjectNames',
      label: 'Subjects',
      minWidth: 260,
      filterType: 'string' as const,
      render: (_value, row) => <SubjectCoverageCell row={seatingPlanRow(row)} />,
    },
    {
      id: 'seatingPlanCount',
      label: 'Plan groups',
      minWidth: 120,
      filterType: 'number' as const,
      render: (value) => `${value as number} plan${value === 1 ? '' : 's'}`,
    },
    {
      id: 'progress',
      label: 'Students',
      filterType: 'string' as const,
      minWidth: 220,
      isSort: false,
      isFilter: true,
      render: (_value, row) => <ProgressCell row={seatingPlanRow(row)} />,
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 130,
      sticky: true,
      stickyPosition: 'right',
      filterType: 'enum' as const,
      render: (value) => <AllocationStatusBadge status={value as SeatingPlanListRow['status']} />,
    },
    {
      id: 'actions',
      label: 'Action',
      minWidth: 190,
      sticky: true,
      stickyPosition: 'right',
      isSort: false,
      isFilter: false,
      excludeFromExport: true,
      render: (_value, dataRow) => {
        if (!canAdd) return null;
        const row = seatingPlanRow(dataRow);
        const action = getSeatingPlanPrimaryAction(row.status);
        return (
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            aria-label={`${action.label} for ${row.examName}`}
            startIcon={<Iconify icon={action.icon} width={18} />}
            onClick={(event) => {
              event.stopPropagation();
              onPrimaryAction(row);
            }}
          >
            {action.label}
          </Button>
        );
      },
    },
  ];
}
