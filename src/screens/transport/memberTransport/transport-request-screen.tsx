import type { LabelColor } from 'src/components/label';

import React, { useMemo, useState } from 'react';

import { Box, Tab, Tabs, Button, Divider, MenuItem, MenuList } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import TransportRequestDialog from './component/transport-request-dialog';
import TransportRouteAssignedDialog from './component/assigned-route-dialog';
import TransportAddNewRequestDialog from './component/add-new-request-dialog';

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
const TransportRequestScreen = () => {
  const [selectedEntry, setSelectedEntry] = useState<any>();
  const dialogForRequest = useBoolean();
  const addNewRequestDialog = useBoolean();
  const assignedRouteDialog = useBoolean();
  const assignments: any = [
    {
      name: 'Aarav Patel',
      grade: '1',
      id: 1,
      assignedRoute: 'R101',
      pickupPoint: 'School',
      dropoffPoint: 'Dindoli',
      preferable: '-',
      role: 'Student',
      grNo: '570',
    },
    {
      name: 'Meera Shah',
      grade: '2',
      id: 3,
      assignedRoute: 'R102',
      pickupPoint: 'School',
      dropoffPoint: '-',
      preferable: 'Godadara',
      role: 'Student',
      grNo: '571',
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
      preferable: '-',
      role: 'Teacher',
      employeeNo: '567',
    },
    {
      name: 'Mr. Rahul Gandhi',
      grade: '-',
      id: 11,
      assignedRoute: 'R109',
      pickupPoint: 'School',
      dropoffPoint: 'Dindoli',
      preferable: '-',
      role: 'Teacher',
      employeeNo: '568',
    },
    {
      name: 'Ms. Kavita Desai',
      grade: '-',
      id: 10,
      assignedRoute: 'R110',
      pickupPoint: 'School',
      dropoffPoint: '-',
      preferable: 'Godadara',
      role: 'Teacher',
      employeeNo: '569',
    },
  ];

  const columnData = [
    { id: 'grNo', label: 'Gr No' },
    { id: 'name', label: 'Name' },
    { id: 'grade', label: 'Standard' },

    // { id: 'assignedRoute', label: 'Assigned Route' },
    { id: 'dropoffPoint', label: 'Avaialbe Stop' },
    { id: 'preferable', label: 'Preferable Stop' },

    {
      id: 'action',
      label: 'Action',
      render(value: any, row: any) {
        return (
          <ThreeDotsActions
            actions={({ popover }: any) => (
              <MenuList>
                <MenuItem
                  onClick={() => {
                    setIsStaff(false);
                    assignedRouteDialog.onTrue();
                  }}
                >
                  <Iconify icon="solar:pen-bold" />
                  Assigned Route
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setSelectedEntry(row);
                    dialogForRequest.onTrue();
                  }}
                >
                  <Iconify icon="fluent-mdl2:event-declined" />
                  Declined
                </MenuItem>
              </MenuList>
            )}
          />
        );
      },
    },
  ];

  const columnDataForStaff = [
    { id: 'employeeNo', label: 'Employee No' },
    { id: 'name', label: 'Name' },

    // { id: 'assignedRoute', label: 'Assigned Route' },
    { id: 'dropoffPoint', label: 'Avaialbe Stop' },
    { id: 'preferable', label: 'Preferable Stop' },

    {
      id: 'action',
      label: 'Action',
      render(value: any, row: any) {
        return (
          <ThreeDotsActions
            actions={({ popover }: any) => (
              <MenuList>
                <MenuItem
                  onClick={() => {
                    setIsStaff(true);

                    assignedRouteDialog.onTrue();
                  }}
                >
                  <Iconify icon="solar:pen-bold" />
                  Assigned Route
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setSelectedEntry(row);

                    dialogForRequest.onTrue();
                  }}
                >
                  <Iconify icon="fluent-mdl2:event-declined" />
                  Declined
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

        <Box>
          <Button
            onClick={() => {
              addNewRequestDialog.onTrue();
            }}
            variant="contained"
            size="small"
          >
            Add New Request
          </Button>
        </Box>
      </Box>

      <Divider />
      {searchParams.tab === 'student' && (
        <CustomizableTable data={tableData} columns={columnData} tableId="student" />
      )}
      {searchParams.tab === 'staff' && (
        <CustomizableTable data={tableDataForStaff} columns={columnDataForStaff} tableId="staff" />
      )}
      {assignedRouteDialog.value && (
        <TransportRouteAssignedDialog
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

      {dialogForRequest.value && (
        <TransportRequestDialog
          dialogValue={dialogForRequest.value}
          onClose={() => {
            dialogForRequest.onFalse();
          }}
          selectedEntry={selectedEntry}
        />
      )}
      {addNewRequestDialog.value && (
        <TransportAddNewRequestDialog
          dialogValue={addNewRequestDialog.value}
          onClose={() => {
            addNewRequestDialog.onFalse();
          }}
          selectedEntry={selectedEntry}
        />
      )}
    </>
  );
};

export default TransportRequestScreen;
