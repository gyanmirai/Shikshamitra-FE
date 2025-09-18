import React from 'react';
import { Iconify } from 'src/components/iconify';
import { Box, Chip, MenuItem, MenuList } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import {
  MemberStatusOptions,
  MemberStatusTypeColors,
} from 'src/enums/member-management-statusType';

import type { IMemberTableProps } from './type';

const MemberManagementTable: React.FC<IMemberTableProps> = ({
  data,
  onView,
  onMakeReservation,
  onChangeStatus,
}) => (
  <Box>
    <CustomizableTable
      tableId="member-table"
      noDataText="No Members Found"
      columns={[
        { id: 'memberId', label: 'Member ID', align: 'left', minWidth: '120px' },
        { id: 'role', label: 'Role', align: 'left' },
        { id: 'name', label: 'Name', align: 'left' },
        { id: 'currentIssue', label: 'Current Issue', align: 'left', minWidth: '130px' },
        { id: 'overdueReturn', label: 'Overdue Return', align: 'left' },
        {
          id: 'memberStatus',
          label: 'Member Status',
          align: 'left',
          render(value, row) {
            // Find the status type based on the label
            const statusType = MemberStatusOptions.find((option) => option.label === value)?.value;
            const color = statusType !== undefined ? MemberStatusTypeColors[statusType] : 'default';

            return <Chip label={value} color={color as any} size="small" variant="soft" />;
          },
        },
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
                actions={({ popover }) => (
                  <MenuList>
                    <MenuItem
                      onClick={() => {
                        onMakeReservation?.(row as any);
                        popover.onClose();
                      }}
                    >
                      {/* <Iconify icon="solar:calendar-bold" /> */}
                      {/* Make Reservation */}
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        onChangeStatus?.(row as any);
                        popover.onClose();
                      }}
                    >
                      <Iconify icon="solar:refresh-bold" />
                      Change Status
                    </MenuItem>
                  </MenuList>
                )}
              />
            );
          },
        },
      ]}
      data={data || []}
    />
  </Box>
);

export default MemberManagementTable;
