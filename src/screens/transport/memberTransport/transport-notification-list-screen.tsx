import type { LabelColor } from 'src/components/label';

import React, { useMemo, useState } from 'react';

import { Box, Tab, Tabs, Divider, MenuItem, MenuList, Checkbox } from '@mui/material';

import IconEnum from 'src/utils/common-icon';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const TABS = [
  {
    value: 'student',
    label: 'Student',
    icon: <Iconify icon="stash:feed-duotone" width={20} />,
    color: 'default',
    count: 100,
    //   component: () => <FinanceFeeStructureOverview />,
  },
  {
    value: 'staff',
    label: 'Staff',
    icon: <Iconify icon="fluent-mdl2:account-management" width={20} />,
    color: 'success',
    count: 20,
    //   component: () => <FinanceStudentStructureOverview />,
  },
];

const TransportNotifiedPersonlistScreen = () => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedIdsforStaff, setSelectedIdsForStaff] = useState<number[]>([]);
  const assignments: any = [
    {
      name: 'Aarav Patel',
      grade: '1',
      id: 1,
      assignedRoute: 'R101',
      pickupPoint: 'School',
      dropoffPoint: 'Dindoli',
      role: 'Student',
      grNo: '570',
      declinedReason: 'Vehicle Capacity is Full',
      status: 'Intrested',
      reason: '-',
    },
    {
      name: 'Meera Shah',
      grade: '2',
      id: 3,
      assignedRoute: 'R102',
      pickupPoint: 'School',
      dropoffPoint: 'Godadara',
      role: 'Student',
      grNo: '571',
      declinedReason: 'Not Serving at This Stop',
      status: 'Not Intrested',
      reason: 'Use Own Vehicle',
    },
    {
      name: 'Meera Shah',
      grade: '2',
      id: 3,
      assignedRoute: 'R102',
      pickupPoint: 'School',
      dropoffPoint: 'Godadara',
      role: 'Student',
      grNo: '571',
      declinedReason: 'Not Serving at This Stop',
      status: 'Pending',
      reason: '-',
    },
  ];

  const assignmentsForStaff: any = [
    {
      name: 'Ms. Anjali Verma',
      grade: '-',
      id: 9,
      assignedRoute: 'R108',
      pickupPoint: 'School',
      dropoffPoint: 'Ved',
      role: 'Teacher',
      employeeNo: '567',
      declinedReason: 'Vehicle Capacity is Full',
    },
    {
      name: 'Mr. Rahul Gandhi',
      grade: '-',
      id: 11,
      assignedRoute: 'R109',
      pickupPoint: 'School',
      dropoffPoint: 'Dindoli',
      role: 'Teacher',
      employeeNo: '568',
      declinedReason: 'Vehicle Capacity is Full',
    },
    {
      name: 'Ms. Kavita Desai',
      grade: '-',
      id: 10,
      assignedRoute: 'R110',
      pickupPoint: 'School',
      dropoffPoint: 'Godadara',
      role: 'Teacher',
      employeeNo: '569',
      declinedReason: 'Not Serving at This Stop',
      status: 'pending',
    },
  ];

  const columnData = [
    {
      id: 'select',
      label: '',
      renderColumn() {
        return (
          <Checkbox
            checked={tableData.length > 0 && selectedIds.length === tableData.length}
            indeterminate={selectedIds.length > 0 && selectedIds.length < tableData.length}
            onChange={(e) => {
              const { checked } = e.target;
              if (checked) {
                // Select all rows
                const allIds = tableData.map((row: any) => row.id);
                setSelectedIds(allIds);
              } else {
                // Deselect all rows
                setSelectedIds([]);
              }
            }}
          />
        );
      },

      render(value: any, row: any) {
        const isChecked = selectedIds.includes(row.id);
        return (
          <Checkbox
            checked={isChecked}
            onChange={(e) => {
              const { checked } = e.target;
              setSelectedIds((prevSelected) => {
                if (checked) {
                  // Add row ID to selection
                  return [...prevSelected, row.id];
                }
                // Remove row ID from selection
                return prevSelected.filter((id) => id !== row.id);
              });
            }}
          />
        );
      },
    },
    { id: 'grNo', label: 'Gr No' },
    { id: 'name', label: 'Name' },
    { id: 'grade', label: 'Standard' },

    // { id: 'assignedRoute', label: 'Assigned Route' },
    { id: 'dropoffPoint', label: 'Stop' },
    { id: 'reason', label: 'Declined Reason' },
    {
      id: 'status',
      label: 'Status',
      render(value: any, row: any) {
        return (
          <Label
            variant="soft"
            color={
              value === 'Pending'
                ? 'warning'
                : value === 'Intrested'
                  ? 'success'
                  : value === 'Not Intrested'
                    ? 'error'
                    : 'default'
            }
          >
            {value}
          </Label>
        );
      },
    },

    {
      id: 'action',
      label: 'Action',
      render(value: any, row: any) {
        return (
          <ThreeDotsActions
            disabled={selectedIds.length === tableData.length}
            placement="right-top"
            actions={({ popover }: any) => (
              <MenuList>
                <MenuItem
                  onClick={() => {
                    // notifyDialog.onTrue();
                  }}
                >
                  <Iconify icon={IconEnum.NOTIFICATION} />?
                </MenuItem>
              </MenuList>
            )}
          />
        );
      },
    },
  ];

  const columnDataForStaff = [
    {
      id: 'select',
      label: '',
      renderColumn() {
        return (
          <Checkbox
            checked={
              tableData.length > 0 && selectedIdsforStaff.length === tableDataForStaff.length
            }
            indeterminate={
              selectedIdsforStaff.length > 0 &&
              selectedIdsforStaff.length < tableDataForStaff.length
            }
            onChange={(e) => {
              const { checked } = e.target;
              if (checked) {
                // Select all rows
                const allIds = tableDataForStaff.map((row: any) => row.id);
                setSelectedIdsForStaff(allIds);
              } else {
                // Deselect all rows
                setSelectedIdsForStaff([]);
              }
            }}
          />
        );
      },

      render(value: any, row: any) {
        const isChecked = selectedIdsforStaff.includes(row.id);
        return (
          <Checkbox
            checked={isChecked}
            onChange={(e) => {
              const { checked } = e.target;
              setSelectedIdsForStaff((prevSelected) => {
                if (checked) {
                  // Add row ID to selection
                  return [...prevSelected, row.id];
                }
                // Remove row ID from selection
                return prevSelected.filter((id) => id !== row.id);
              });
            }}
          />
        );
      },
    },
    { id: 'employeeNo', label: 'Employee No' },
    { id: 'name', label: 'Name' },

    { id: 'dropoffPoint', label: 'Stop' },
    {
      id: 'status',
      label: 'Status',
      render(value: any, row: any) {
        return (
          <Label
            variant="soft"
            color={
              value === 'Pending'
                ? 'warning'
                : value === 'Intrested'
                  ? 'success'
                  : value === 'Not Intrested'
                    ? 'error'
                    : 'default'
            }
          >
            {value}
          </Label>
        );
      },
    },

    {
      id: 'action',
      label: 'Action',
      render(value: any, row: any) {
        return (
          <ThreeDotsActions
            disabled={selectedIdsforStaff.length === tableDataForStaff.length}
            placement="right-top"
            actions={({ popover }: any) => (
              <MenuList>
                <MenuItem
                  onClick={() => {
                    // notifyDialog.onTrue();
                  }}
                >
                  <Iconify icon="mdi:bell-notification-outline" />?
                </MenuItem>
              </MenuList>
            )}
          />
        );
      },
    },
  ];

  const [tableData, setTableData] = useState(assignments);
  const [tableDataForStaff, setTableDataForStaff] = useState(assignmentsForStaff);
  const [searchParams, setSearchParams] = useState({ tab: 'student' });
  const [isStaff, setIsStaff] = useState(false);

  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );
  return (
    <>
      <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Tabs
            value={searchParams.tab}
            onChange={(e, value) => setSearchParams({ tab: value })}
            sx={{
              mb: 2,
              '& .MuiTabs-flexContainer': { gap: 2 },
              flexGrow: 1,
            }}
          >
            {TABS.map((tab) => (
              <Tab
                sx={{ fontSize: '12px' }}
                key={tab.value}
                label={
                  <Box display="flex" justifyContent="center" gap={1} alignItems="center">
                    {tab.label}{' '}
                    <Label
                      variant="soft"
                      //   variant={tab.value === EmployeeAttendanceStatus.All ? 'filled' : 'soft'}
                      color={(tab?.color as LabelColor) || 'default'}
                    >
                      {' '}
                      {tab.count}
                    </Label>
                  </Box>
                }
                // icon={tab.icon}
                value={tab.value}
              />
            ))}
          </Tabs>
        </Box>
        {/* {searchParams.tab === "student" && selectedIds.length === tableData.length && (
            <Box>
                <Button variant="contained" size="small">Send Notification</Button>
            </Box>
        )}

        {searchParams.tab === "staff" && selectedIdsforStaff.length === tableDataForStaff.length && (
            <Box>
                <Button variant="contained" size="small">Send Notification</Button>
            </Box>
        )} */}
      </Box>
      <Divider />
      {searchParams.tab === 'student' && (
        <CustomizableTable
          data={tableData}
          columns={columnData}
          tableId="student-transport-notification-list-screen"
        />
      )}
      {searchParams.tab === 'staff' && (
        <CustomizableTable
          data={tableDataForStaff}
          columns={columnDataForStaff}
          tableId="staff-transport-notification-list-screen"
        />
      )}
    </>
  );
};

export default TransportNotifiedPersonlistScreen;
