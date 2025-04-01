'use client';

import type { LabelColor } from 'src/components/label';

import React from 'react';

import { Box, MenuItem, MenuList } from '@mui/material';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const EventsAndHolidaysRequest = () => (
  <Box>
    <CustomBreadcrumbs
      heading="Request"
      links={[{ name: 'HR' }, { name: 'Events & Holidays' }, { name: 'Request' }]}
      sx={{ px: 1, mb: 2 }}
      description="The Request Screen allows you to handle various requests. You can approve or reject requests based on the details provided."
    />
    <CustomizableTable
      tableId="event-holiday-request"
      columns={[
        { id: 'createdBy', label: 'Created By' },
        { id: 'createdAt', label: 'Created At' },
        { id: 'startDate', label: 'Start Date' },
        { id: 'endDate', label: 'End Date' },
        { id: 'reason', label: 'Reason' },
        { id: 'approvedBy', label: 'Approved By' },
        {
          id: 'status',
          label: 'Status',
          render(value, row) {
            let color: LabelColor = 'info';
            if (row.status === 'Pending') {
              color = 'warning';
            } else if (row.status === 'Approved') {
              color = 'success';
            } else {
              color = 'error';
            }
            return <Label color={color}>{value}</Label>;
          },
        },
        {
          id: 'actions',
          label: 'Actions',
          isSort: false,
          render(value, row) {
            return (
              <ThreeDotsActions
                placement="right-top"
                actions={() => (
                  <MenuList>
                    <MenuItem onClick={() => {}}>
                      <Iconify icon="mdi:approve" sx={{ color: 'success.main' }} />
                      Approve
                    </MenuItem>
                    <MenuItem onClick={() => {}}>
                      <Iconify icon="entypo:cross" sx={{ color: 'error.main' }} />
                      Reject
                    </MenuItem>
                  </MenuList>
                )}
              />
            );
          },
        },
      ]}
      data={[
        {
          id: 1,
          createdBy: 'John Doe',
          createdAt: '2024-01-15',
          startDate: '2024-02-01',
          endDate: '2024-02-02',
          reason: 'Company Anniversary',
          approvedBy: '-',
          status: 'Pending',
        },
        {
          id: 2,
          createdBy: 'Alice Johnson',
          createdAt: '2024-01-16',
          startDate: '2024-02-14',
          endDate: '2024-02-14',
          reason: 'Valentine Day Celebration',
          approvedBy: 'Robert Wilson',
          status: 'Approved',
        },
        {
          id: 3,
          createdBy: 'Mike Brown',
          createdAt: '2024-01-17',
          startDate: '2024-03-15',
          endDate: '2024-03-15',
          reason: 'Team Building Event',
          approvedBy: 'Sarah Davis',
          status: 'Rejected',
        },
      ]}
    />
  </Box>
);

export default EventsAndHolidaysRequest;
