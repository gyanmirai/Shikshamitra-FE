import { varAlpha } from 'src/theme/styles';
import { Iconify } from 'src/components/iconify';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Chip, Stack, Button, Tooltip, Typography, LinearProgress } from '@mui/material';

import CapacityBadge from '../common/CapacityBadge';
import AllocationStatusBadge from '../common/AllocationStatusBadge';

import type { SeatingPlanListRow } from '../../types';

const PRIMARY_ACTION: Record<SeatingPlanListRow['status'], { label: string; icon: string }> = {
  'not-started': { label: 'Create Seating Plan', icon: 'mdi:plus-circle-outline' },
  'in-progress': { label: 'Continue Allocation', icon: 'mdi:pencil-outline' },
  ready: { label: 'Review Plan', icon: 'mdi:clipboard-check-outline' },
  'needs-attention': { label: 'Fix Issues', icon: 'mdi:alert-outline' },
  completed: { label: 'View Plan', icon: 'mdi:eye-outline' },
  published: { label: 'View / Print', icon: 'mdi:printer-outline' },
};

function divisionLabel(name: string) {
  if (name === 'Total') return name;
  return /^div(ision)?\s+/i.test(name) ? name.replace(/^division\s+/i, 'Div ') : `Div ${name}`;
}

function DivisionProgressCell({ row }: { row: SeatingPlanListRow }) {
  const divisionProgress = row.divisionProgress ?? [];
  const divisions =
    divisionProgress.length > 0
      ? divisionProgress
      : [
        {
          divisionId: row.examId,
          divisionName: 'Total',
          totalStudents: row.totalStudents,
          allocatedStudents: row.allocatedStudents,
          pendingStudents: row.pendingStudents,
          progress: row.progress,
        },
      ];

  const totalProgress = row.totalStudents > 0 ? Math.round((row.allocatedStudents / row.totalStudents) * 100) : 0;
  const chipColor = totalProgress >= 100 ? 'success' : totalProgress > 0 ? 'warning' : 'default';

  return (
    <Stack spacing={0.75} sx={{ minWidth: 200, maxWidth: 260, py: 0.5 }}>
      <Chip
        size="small"
        variant="soft"
        color={chipColor}
        label={`Total: ${row.allocatedStudents}/${row.totalStudents} allocated (${totalProgress}%)`}
        sx={{
          alignSelf: 'flex-start',
          height: 22,
          fontSize: '0.7rem',
          fontWeight: 700,
        }}
      />
      {divisions.map((division) => {
        const divProgress = Math.min(100, Math.max(0, division.progress));
        return (
          <Tooltip
            key={division.divisionId}
            title={`${divisionLabel(division.divisionName)}: ${division.allocatedStudents}/${division.totalStudents} allocated`}
            arrow
          >
            <Box>
              <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
                <Typography variant="caption" color="text.primary" noWrap sx={{ maxWidth: 110, fontWeight: 700 }}>
                  {divisionLabel(division.divisionName)}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0, fontWeight: 600 }}>
                  {division.allocatedStudents}/{division.totalStudents} allocated
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={divProgress}
                color={divProgress >= 100 ? 'success' : divProgress > 0 ? 'warning' : 'inherit'}
                sx={{
                  mt: 0.35,
                  height: 5,
                  borderRadius: 3,
                  bgcolor: (t) => varAlpha(t.vars.palette.grey['500Channel'], 0.16),
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 3,
                  },
                }}
              />
            </Box>
          </Tooltip>
        );
      })}
    </Stack>
  );
}

interface Props {
  rows: SeatingPlanListRow[];
  isLoading?: boolean;
  canAdd: boolean;
  onRowClick: (row: SeatingPlanListRow) => void;
  onPrimaryAction: (row: SeatingPlanListRow) => void;
}

export default function SeatingPlanTable({ rows, isLoading, canAdd, onRowClick, onPrimaryAction }: Props) {
  return (
    <CustomizableTable
      tableId="seating-plan-table"
      noDataText={<>No exams found for seating allocation</>}
      isLoading={isLoading}
      handleRowClick={(row: any) => onRowClick(row)}
      columns={[
        { id: 'examName', label: 'Exam Name', align: 'left', minWidth: 160, sticky: true },
        { id: 'examTypeName', label: 'Exam Type', align: 'left', minWidth: 110 },
        { id: 'standardName', label: 'Class', align: 'left' },
        {
          id: 'divisions',
          label: 'Divisions',
          align: 'left',
          render: (value) => <Box>{(value as string[]).join(', ')}</Box>,
        },
        { id: 'totalStudents', label: 'Total Students', align: 'left', minWidth: 110, filterType: 'number' },
        { id: 'roomsUsed', label: 'Rooms Used', align: 'left', minWidth: 100, filterType: 'number' },
        {
          id: 'capacityStatus',
          label: 'Capacity Status',
          align: 'left',
          render: (value) => <CapacityBadge status={value as any} />,
        },
        {
          id: 'progress',
          label: 'Progress',
          align: 'left',
          minWidth: 240,
          render: (_value, row: any) => <DivisionProgressCell row={row} />,
        },
        {
          id: 'status',
          label: 'Status',
          align: 'left',
          sticky: true,
          render: (value) => <AllocationStatusBadge status={value as any} />,
        },
        {
          id: 'actions',
          label: 'Actions',
          align: 'left',
          isSort: false,
          isFilter: false,
          sticky: true,
          minWidth: 190,
          render: (_value, row: any) => {
            if (!canAdd) return null;
            const action = PRIMARY_ACTION[row.status as SeatingPlanListRow['status']];
            return (
              <Button
                size="small"
                variant="outlined"
                startIcon={<Iconify icon={action.icon} sx={{ height: 16, width: 18 }} />}
                onClick={(e) => {
                  e.stopPropagation();
                  onPrimaryAction(row);
                }}
              >
                {action.label}
              </Button>
            );
          },
        },
      ]}
      data={rows}
      wrapperProps={{ sx: { height: '100%' } }}
    />
  );
}
