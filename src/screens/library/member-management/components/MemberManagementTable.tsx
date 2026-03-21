import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizable-table/types';

import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Box, Avatar } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizable-table';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetMembersQuery } from 'src/redux/library/library-members/memberManagementApi';

import type { IMemberTableProps } from './type';

const MemberManagementTable: React.FC<IMemberTableProps> = ({ data, onView }) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: membersData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetMembersQuery,
    params: { academicYearId: currentYear?.id },
  });
  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'name',
        label: 'Name',
        align: 'left',
        sticky: true,
        minWidth: '150px',
        render(value, row) {
          return (
            <Box display="flex" alignItems="center" gap={1}>
              <Avatar src={row?.avatar} alt={value} sx={{ width: 32, height: 32 }} />
              {value}
            </Box>
          );
        },
      },
      { id: 'memberId', label: 'Member ID', align: 'left', minWidth: '120px' },
      { id: 'role', label: 'Role', align: 'left' },
      { id: 'rollNo', label: 'Roll No.', align: 'left', minWidth: 90 },
      { id: 'grNo', label: 'GR No.', align: 'left', minWidth: 90 },
      { id: 'class', label: 'Class', align: 'left', minWidth: '100px' },
      { id: 'division', label: 'Division', align: 'left', minWidth: '100px' },
      { id: 'currentIssue', label: 'Current Issue', align: 'left', minWidth: '130px' },
      { id: 'overdueReturn', label: 'Overdue Return', align: 'left', minWidth: '150px' },
      {
        id: 'actions',
        label: 'Actions',
        isFilter: false,
        isSort: false,
        sticky: true,
        render(value, row) {
          return (
            <ThreeDotsActions
              placement="right-center"
              showViewIcon
              handleViewClick={() => onView?.(row as any)}
              // actions={({ popover }) => (
              //   <MenuList>
              //     <MenuItem
              //       onClick={() => {
              //         onMakeReservation?.(row as any);
              //         popover.onClose();
              //       }}
              //     >
              //       {/* <Iconify icon="solar:calendar-bold" /> */}
              //       {/* Make Reservation */}
              //     </MenuItem>
              //     <MenuItem
              //       onClick={() => {
              //         onChangeStatus?.(row as any);
              //         popover.onClose();
              //       }}
              //     >
              //       <Iconify icon="solar:refresh-bold" />
              //       Change Status
              //     </MenuItem>
              //   </MenuList>
              // )}
              showThreeDots={false}
            />
          );
        },
      },
    ],
    [onView]
  );
  return (
    <CustomizableTable
      tableId="member-table"
      noDataText="No Members Data Found"
      columns={columns}
      data={membersData || []}
    />
  );
};

export default MemberManagementTable;
