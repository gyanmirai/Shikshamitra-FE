// --- existing imports ---
import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import React, { useState, useCallback } from 'react';

import { Box, MenuItem, MenuList } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import seatAllocationTableData from '../../../../json/examination/seatAllocationTableData.json';

import type { IExamAllocation } from '../type';

interface SeatAllocationTableProps {
  openSeatAllocation: UseBooleanReturn;
  examData?: IExamAllocation[];
}

const SeatAllocationTable = ({ openSeatAllocation, examData }: SeatAllocationTableProps) => {
  const [data, setData] = useState(seatAllocationTableData);

  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <MenuList>
        <MenuItem
          onClick={() => {
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
    [openSeatAllocation]
  );

  return (
    <CustomizableTable
      tableId="schedule-exam-table"
      noDataText={<>Exam Data Not Found </>}
      columns={[
        { id: 'examName', label: 'Exam Name', align: 'left', minWidth: 120 },
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
              />
            );
          },
        },
      ]}
      data={data}
    />
  );
};

export default SeatAllocationTable;
