// --- existing imports ---
import type { Medium } from 'src/types/school';
import type { RootState } from 'src/redux/store';
import type { UseBooleanReturn } from 'src/hooks/useBoolean';

import { useSelector } from 'react-redux';
import React, { useCallback } from 'react';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Box, MenuItem, MenuList } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizable-table';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetSeatAllocationTableDataQuery } from 'src/redux/academic-api/examination-api/schedule-exam-api/seat-allocationApi';

import type { IExamAllocation } from '../type';

const tableData = [
  {
    examName: 'Mid Term Exam',
    examType: 'Mid',
    className: 1,
    divisions: ['A', 'B'],
    totalStudents: 500,
    allocatedStudents: 300,
    pendingStudents: 200,
    status: 'pending',
  },
  {
    examName: 'Final Exam',
    examType: 'Final',
    className: 3,
    divisions: ['A', 'B', 'C'],
    totalStudents: 500,
    allocatedStudents: 250,
    pendingStudents: 250,
    status: 'pending',
  },
  {
    examName: 'Final Exam',
    examType: 'Final',
    className: 7,
    divisions: ['C', 'D'],
    totalStudents: 500,
    allocatedStudents: 350,
    pendingStudents: 150,
    status: 'update',
  },
  {
    examName: 'Mid Term Exam',
    examType: 'Mid',
    className: 10,
    divisions: ['A', 'C'],
    totalStudents: 500,
    allocatedStudents: 400,
    pendingStudents: 100,
    status: 'update',
  },
  {
    examName: 'Mid Term Exam',
    examType: 'Mid',
    className: 12,
    divisions: ['A', 'D'],
    totalStudents: 500,
    allocatedStudents: 500,
    pendingStudents: 0,
    status: 'allocated',
  },
];

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
  const { currentMedium } = useSelector((state: RootState) => state.globalState);

  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    data: seatAllocationData,
    isLoading,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSeatAllocationTableDataQuery,
    params: { academicMediumId: (currentMedium as Medium)?.id, classId },
  });

  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <MenuList>
        <MenuItem
          onClick={() => {
            onSeatAllocate(row);
            openSeatAllocation.onTrue();
            pop.onClose();
          }}
        >
          <>
            <Iconify
              icon={row.status === 'pending' ? 'clarity:form-line' : GlobalIcons.edit}
              sx={{ mr: 1 }}
            />
            {row.status === 'pending' ? 'Allocate Seats' : 'Update Seats'}
          </>
        </MenuItem>
      </MenuList>
    ),
    [onSeatAllocate, openSeatAllocation]
  );

  return (
    <CustomizableTable
      tableId="schedule-exam-table"
      noDataText={<>Exam Data Not Found </>}
      isLoading={isLoading || isFetching}
      columns={[
        { id: 'examName', label: 'Exam Name', align: 'left', minWidth: 120, sticky: true },
        { id: 'examType', label: 'Exam Type', align: 'left', minWidth: 110 },
        {
          id: 'className',
          label: 'Class',
          align: 'left',
          filterType: 'number',
        },
        {
          id: 'divisions',
          label: 'Divisions',
          align: 'left',
          render: (value) => <Box>{value.join(', ')}</Box>,
        },
        { id: 'totalStudents', label: 'Total Students', align: 'left', minWidth: 140 },
        { id: 'allocatedStudents', label: 'Allocated Student', align: 'left', minWidth: 170 },
        {
          id: 'pendingStudents',
          label: 'Pending Allocation Students',
          align: 'left',
          minWidth: 240,
        },
        {
          id: 'status',
          label: 'Status',
          align: 'left',
          render: (value, row) => (
            <Label color={value === 'pending' ? 'warning' : 'primary'}>{value}</Label>
          ),
        },
        {
          id: 'actions',
          label: 'Actions',
          align: 'left',
          isSort: false,
          sticky: true,
          isFilter: false,
          render(value, row) {
            return (
              <ThreeDotsActions
                actions={(prop) => actions({ ...prop, row })}
                placement="right-top"
                // showViewIcon

                // handleViewClick={() => {
                //   onViewTimetable(row as IExamFormValues);
                // }}
              />
            );
          },
        },
      ]}
      data={tableData || []}
    />
  );
};

export default SeatAllocationTable;
