import { Iconify } from 'src/components/iconify';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Button, Typography, LinearProgress } from '@mui/material';

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
          minWidth: 160,
          render: (value, row: any) => (
            <Box sx={{ minWidth: 130 }}>
              <Typography variant="caption" color="text.secondary">
                {row.allocatedStudents} / {row.totalStudents} allocated
              </Typography>
              <LinearProgress
                variant="determinate"
                value={value as number}
                color={row.status === 'needs-attention' ? 'error' : 'success'}
                sx={{ height: 5, borderRadius: 3, mt: 0.25 }}
              />
            </Box>
          ),
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
          minWidth: 170,
          render: (_value, row: any) => {
            if (!canAdd) return null;
            const action = PRIMARY_ACTION[row.status as SeatingPlanListRow['status']];
            return (
              <Button
                size="small"
                variant="outlined"
                startIcon={<Iconify icon={action.icon} sx={{ height: 16, width: 16 }} />}
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
