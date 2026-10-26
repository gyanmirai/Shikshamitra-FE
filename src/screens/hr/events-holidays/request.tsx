'use client';

import type { LabelColor } from 'src/components/label';

import React from 'react';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Box, Alert, MenuItem, MenuList } from '@mui/material';
import { hrPaths } from 'src/constants/hr-menus';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  EmployeeLeaveStatusType,
  EmployeeLeaveStatusOptions,
  EmployeeLeaveStatusTypeColor,
} from 'src/enums/employee-leave-status';

const EventsAndHolidaysRequest = () => (
  <Box sx={{ height: 1, minHeight: 0, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
    <CustomBreadcrumbs
      heading="Request"
      links={[
        { name: 'HR/Staff', href: hrPaths.dashboard },
        { name: 'Events & Holidays', href: hrPaths.eventsHolidays },
        { name: 'Request' },
      ]}
      description="The Request Screen allows you to handle various requests. You can approve or reject requests based on the details provided."
    />
    <Alert severity="info" sx={{ mb: 1 }}>
      This legacy page contains demonstration requests. Approval and rejection are unavailable until
      a staff request API is connected.
    </Alert>
    <CustomizableTable
      noDataText="No event or holiday requests found."
      exportContext={['Demonstration requests only; not staff records.']}
      tableId="event-holiday-request"
      tableTitle="Event and holiday requests"
      columns={[
        { id: 'createdBy', label: 'Created By' },
        { id: 'createdAt', label: 'Created At', filterType: 'date' },
        { id: 'startDate', label: 'Start Date', filterType: 'date' },
        { id: 'endDate', label: 'End Date', filterType: 'date' },
        { id: 'reason', label: 'Reason' },
        { id: 'approvedBy', label: 'Approved By' },
        {
          id: 'status',
          label: 'Status',
          filterType: 'enum',
          enumOptions: EmployeeLeaveStatusOptions,
          render(value, row) {
            const color = EmployeeLeaveStatusTypeColor[
              row.status as EmployeeLeaveStatusType
            ] as LabelColor;
            return <Label color={color}>{EmployeeLeaveStatusType[value]}</Label>;
          },
        },
        {
          id: 'actions',
          label: 'Actions',
          isSort: false,
          isFilter: false,
          excludeFromExport: true,
          minWidth: 50,
          sticky: true,
          render(value, row) {
            return (
              <ThreeDotsActions
                placement="right-top"
                actions={() => (
                  <MenuList>
                    <MenuItem disabled>
                      <Iconify icon="mdi:approve" sx={{ color: 'success.main' }} />
                      Approve
                    </MenuItem>
                    <MenuItem disabled>
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
          status: 0,
        },
        {
          id: 2,
          createdBy: 'Alice Johnson',
          createdAt: '2024-01-16',
          startDate: '2024-02-14',
          endDate: '2024-02-14',
          reason: 'Valentine Day Celebration',
          approvedBy: 'Robert Wilson',
          status: 1,
        },
        {
          id: 3,
          createdBy: 'Mike Brown',
          createdAt: '2024-01-17',
          startDate: '2024-03-15',
          endDate: '2024-03-15',
          reason: 'Team Building Event',
          approvedBy: 'Sarah Davis',
          status: 2,
        },
      ]}
    />
  </Box>
);

export default EventsAndHolidaysRequest;
