// --- existing imports ---
import type { RootState } from 'src/redux/store';
import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import React from 'react';
import { useSelector } from 'react-redux';
import { Box, Button } from '@mui/material';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { hasGrantedPermission } from 'src/utils/permissions';
import { academicPermissions } from 'src/constants/academic-menu';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetSeatAllocationTableDataQuery } from 'src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocationApi';

import type { IExamAllocation } from '../type';

// status: 0=pending, 1=partial, 2=allocated
const statusConfig: Record<number, { label: string; color: 'warning' | 'info' | 'success' }> = {
  0: { label: 'Pending', color: 'warning' },
  1: { label: 'Partial', color: 'info' },
  2: { label: 'Allocated', color: 'success' },
};

interface SeatAllocationTableProps {
  openSeatAllocation: UseBooleanReturn;
  onSeatAllocate: (examData: IExamAllocation) => void;
  classId: string;
}

const SeatAllocationTable = ({
  openSeatAllocation,
  onSeatAllocate,
  classId,
}: SeatAllocationTableProps) => {
  const { permissions } = useSelector((state: RootState) => state.auth);
  const canAdd = hasGrantedPermission(
    permissions,
    `${academicPermissions.examination.seatAllocation}.Add`
  );

  const {
    data: seatAllocationData,
    isLoading,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSeatAllocationTableDataQuery,
    params: { standardId: classId },
    options: {
      skip: !classId, // Skip the query if classId is not provided
    },
  });

  return (
    // <Box
    //   component={motion.div}
    //   initial={{ opacity: 0, y: 20 }}
    //   animate={{ opacity: 1, y: 0 }}
    //   transition={{ duration: 0.4 }}
    //   sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%' }}
    // >
    <CustomizableTable
      tableId="seat-allocation-table"
      noDataText={<>Exam Data Not Found </>}
      isLoading={isLoading || isFetching}
      columns={[
        { id: 'examName', label: 'Exam Name', align: 'left', minWidth: 120, sticky: true },
        { id: 'examTypeName', label: 'Exam Type', align: 'left', minWidth: 110 },
        {
          id: 'standardName',
          label: 'Class',
          align: 'left',
        },
        {
          id: 'divisions',
          label: 'Divisions',
          align: 'left',
          render: (value) => <Box>{(value as string[]).join(', ')}</Box>,
        },
        {
          id: 'totalStudents',
          label: 'Total Students',
          align: 'left',
          minWidth: 140,
          filterType: 'number',
        },
        {
          id: 'allocatedStudents',
          label: 'Allocated Student',
          align: 'left',
          minWidth: 170,
          filterType: 'number',
        },
        {
          id: 'pendingStudents',
          label: 'Pending Allocation Students',
          align: 'left',
          minWidth: 240,
          filterType: 'number',
        },
        {
          id: 'status',
          label: 'Status',
          align: 'left',
          sticky: true,
          render: (value) => {
            const cfg = statusConfig[value as number] ?? {
              label: String(value),
              color: 'default' as any,
            };
            return <Label color={cfg.color}>{cfg.label}</Label>;
          },
        },
        {
          id: 'actions',
          label: 'Actions',
          align: 'left',
          isSort: false,
          sticky: true,
          isFilter: false,
          minWidth: '150px',
          render(value, row: any) {
            return canAdd ? (
              <Button
                size="small"
                variant="outlined"
                sx={{ minWidth: '100px' }}
                startIcon={
                  <Iconify
                    icon={row.status === 0 ? 'clarity:form-line' : GlobalIcons.edit}
                    sx={{ height: '16px', width: '16px' }}
                  />
                }
                onClick={() => {
                  onSeatAllocate(row);
                  openSeatAllocation.onTrue();
                }}
              >
                {row.status === 0 ? 'Allocate Seats' : 'Update Seats'}
              </Button>
            ) : null;
          },
        },
      ]}
      data={seatAllocationData?.items || []}
      wrapperProps={{
        sx: {
          height: '100%',
        },
      }}
    />
    // </Box>
  );
};

export default SeatAllocationTable;
