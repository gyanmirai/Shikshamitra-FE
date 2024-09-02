import type { UsePopoverReturn } from 'src/components/custom-popover';

import React, { useState, useCallback } from 'react';

import { Box, MenuItem, MenuList } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import AddLeaveRequest from './leave-requst';

import type { TabComponentType } from '.';

const LeaveHistory = (props: TabComponentType) => {
  const modal = useBoolean();
  const [editData, setEditData] = useState<any>(null);
  const actions = useCallback(
    // eslint-disable-next-line react/no-unused-prop-types
    ({ popover }: { popover: UsePopoverReturn }) => (
      <MenuList>
        <MenuItem
          onClick={() => {
            modal.onTrue();
            popover.onClose();
          }}
        >
          <Iconify icon="carbon:view-filled" sx={{ height: '16px', width: '16px' }} />
          Review
        </MenuItem>
      </MenuList>
    ),
    [modal]
  );
  return (
    <>
      <CustomizableTable
        columns={[
          {
            label: 'Name',
            id: 'name',
          },
          {
            label: 'Start Date',
            id: 'startDate',
          },
          {
            label: 'End Date',
            id: 'endDate',
          },
          {
            label: 'Half Day',
            id: 'isHalfDay',
          },
          {
            label: 'Description',
            id: 'description',
          },
          {
            label: 'Status',
            id: 'status',
            render(value, row) {
              return (
                <Label
                  variant="soft"
                  color={
                    value === 'pending'
                      ? 'warning'
                      : value === 'reject'
                        ? 'error'
                        : value === 'approved'
                          ? 'success'
                          : 'default'
                  }
                >
                  {value}
                </Label>
              );
            },
          },
          {
            label: 'Action',
            id: 'action',
            render(value, row) {
              return (
                <ThreeDotsActions
                  onClickThreeDots={() => setEditData(row)}
                  placement="right-top"
                  actions={actions}
                />
              );
            },
          },
        ]}
        data={[
          {
            name: 'John Doe',
            startDate: '2023-06-01',
            endDate: '2023-06-05',
            isHalfDay: 'No',
            description: 'Annual leave',
            status: 'approved',
          },
          {
            name: 'Jane Smith',
            startDate: '2023-06-10',
            endDate: '2023-06-10',
            isHalfDay: 'Yes',
            description: 'Doctor appointment',
            status: 'pending',
          },
          {
            name: 'Mike Johnson',
            startDate: '2023-06-15',
            endDate: '2023-06-16',
            isHalfDay: 'No',
            description: 'Family emergency',
            status: 'approved',
          },
          {
            name: 'Emily Brown',
            startDate: '2023-06-20',
            endDate: '2023-06-24',
            isHalfDay: 'No',
            description: 'Vacation',
            status: 'reject',
          },
          {
            name: 'Chris Wilson',
            startDate: '2023-06-30',
            endDate: '2023-06-30',
            isHalfDay: 'Yes',
            description: 'Personal errand',
            status: 'pending',
          },
        ]}
      />
      <CustomDialog
        maxWidth="md"
        open={modal.value}
        handleClose={modal.onFalse}
        title="View Leave Request"
      >
        <Box p={2}>
          <AddLeaveRequest {...props} editData={editData} />
        </Box>
      </CustomDialog>
    </>
  );
};

export default LeaveHistory;
