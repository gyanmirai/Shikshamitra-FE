import type { LabelColor } from 'src/components/label';

import React, { useMemo, useState } from 'react';

import { Box, Tab, Tabs, Button, Divider, MenuItem, MenuList, Checkbox } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import RouteAvailableNotifyDialog from './component/route_available_notify-dialog';
import TransportStudentAndStaffUpdateInfoDialog from '../starffTransport/component/transport-student-update-route-dialog';

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
const TransportWaitingListScreen = () => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedIdsforStaff, setSelectedIdsForStaff] = useState<number[]>([]);

  const dialogForRequest = useBoolean();
  const assignedRouteDialog = useBoolean();
  const notifyDialog = useBoolean();
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
    { id: 'declinedReason', label: 'Declined Reason' },

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
                    notifyDialog.onTrue();
                  }}
                >
                  <Iconify icon="mdi:bell-notification-outline" />
                  Notify
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
    { id: 'declinedReason', label: 'Declined Reason' },

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
                    notifyDialog.onTrue();
                  }}
                >
                  <Iconify icon="mdi:bell-notification-outline" />
                  Notify
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

  const closeDialog = () => {
    setIsStaff(false);
    assignedRouteDialog.onFalse();
  };
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
        {searchParams.tab === 'student' && selectedIds.length === tableData.length && (
          <Box>
            <Button variant="contained" size="small">
              Send Notification
            </Button>
          </Box>
        )}

        {searchParams.tab === 'staff' &&
          selectedIdsforStaff.length === tableDataForStaff.length && (
            <Box>
              <Button variant="contained" size="small">
                Send Notification
              </Button>
            </Box>
          )}
      </Box>
      <Divider />
      {searchParams.tab === 'student' && (
        <CustomizableTable data={tableData} columns={columnData} tableId="student" />
      )}
      {searchParams.tab === 'staff' && (
        <CustomizableTable data={tableDataForStaff} columns={columnDataForStaff} tableId="staff" />
      )}
      {assignedRouteDialog.value && (
        <TransportStudentAndStaffUpdateInfoDialog
          onSave={() => {}}
          dialogValue={assignedRouteDialog.value}
          onClose={closeDialog}
          data={[]}
          isEdit={false}
          allData={tableData}
          isStaff={isStaff}
          clickFromTable
        />
      )}

      {notifyDialog.value && (
        <RouteAvailableNotifyDialog
          dialogValue={notifyDialog.value}
          onClose={() => {
            notifyDialog.onFalse();
          }}
          selectedEntry={selectedIds}
        />
      )}
    </>
  );
};

export default TransportWaitingListScreen;
