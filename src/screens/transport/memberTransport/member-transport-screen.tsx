'use client';

import type { LabelColor } from 'src/components/label';

import React, { useState } from 'react';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { useBoolean } from 'src/hooks/use-boolean';
import { Iconify } from 'src/components/iconify/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';
import { Box, Tab, Tabs, Button, Divider, MenuItem, MenuList, Checkbox } from '@mui/material';

import TransportRouteAssignedDialog from './component/assigned-route-dialog';
import { assignments, assignmentsForStaff } from './data/member-transport-screen-data';
import TransportNotifyParentsDialog from '../starffTransport/component/transport-notify-parents.dialog';

import type { StaffAssignment, StudentAssignment } from './data/member-transport-screen-data';

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

const handleSaveNotify = (e: any) => {};

const MemberTransportScreen = () => {
  const sendInstantNotificationDialogValueForStudent = useBoolean();
  const sendInstantNotificationDialogValueForStaff = useBoolean();
  const [selectedStudents, setSelectedStudents] = useState<any>([]);

  const handlerSendNotification = () => {
    if (!sendInstantNotificationDialogValueForStudent.value) {
      sendInstantNotificationDialogValueForStudent.onTrue();
    }
  };

  const handlerSendNotificationForStaff = () => {
    if (!sendInstantNotificationDialogValueForStaff.value) {
      sendInstantNotificationDialogValueForStaff.onTrue();
    }
  };
  const columnData = [
    {
      id: 'checkBox',
      align: 'left' as 'left',
      minWidth: '60px',
      isSort: false,
      isFilter: false,
      label: '',
      renderColumn() {
        return (
          <Checkbox
            checked={!!tableData?.length && selectedStudents?.length === tableData?.length}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedStudents(tableData || []);
              } else {
                setSelectedStudents([]);
              }
            }}
          />
        );
      },
      render(value: any, row: any) {
        return (
          <Checkbox
            checked={!!selectedStudents.some((i: any) => i.id === row.id)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedStudents([...selectedStudents, row]);
              } else {
                setSelectedStudents(selectedStudents.filter((i: any) => i.id !== row.id));
              }
            }}
          />
        );
      },
    },
    { id: 'grNo', label: 'Gr No' },
    { id: 'name', label: 'Name' },
    { id: 'grade', label: 'Standard' },

    { id: 'assignedRoute', label: 'Assigned Route' },
    { id: 'dropoffPoint', label: 'Stop' },

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
                    setIsEdit(true);
                    setSelectedEntry(row);
                    setIsStaff(false);
                    setClickFromTable(true);

                    dialog.onTrue();
                  }}
                >
                  <Iconify icon="solar:pen-bold" />
                  Change Route
                </MenuItem>

                {/* <MenuItem
                  onClick={() => {
                    setSelectedEntry(row);
                    dialogNotify.onTrue();
                  }}
                >
                  <Iconify icon="mingcute:notification-fill" />
                  Notify Parents
                </MenuItem> */}
              </MenuList>
            )}
          />
        );
      },
    },
  ];

  const columnDataForStaff = [
    {
      id: 'checkBox',
      align: 'left' as 'left',
      minWidth: '60px',
      isSort: false,
      isFilter: false,
      label: '',
      renderColumn() {
        return (
          <Checkbox
            checked={
              !!tableDataForStaff?.length && selectedStudents?.length === tableDataForStaff?.length
            }
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedStudents(tableDataForStaff || []);
              } else {
                setSelectedStudents([]);
              }
            }}
          />
        );
      },
      render(value: any, row: any) {
        return (
          <Checkbox
            checked={!!selectedStudents.some((i: any) => i.id === row.id)}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedStudents([...selectedStudents, row]);
              } else {
                setSelectedStudents(selectedStudents.filter((i: any) => i.id !== row.id));
              }
            }}
          />
        );
      },
    },
    { id: 'employeeNo', label: 'Employee No' },
    { id: 'name', label: 'Name' },

    { id: 'assignedRoute', label: 'Assigned Route' },
    { id: 'dropoffPoint', label: 'Pickup/DropOff Point' },

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
                    setSelectedEntry(row);
                    setClickFromTable(true);
                    dialog.onTrue();
                  }}
                >
                  <Iconify icon="solar:pen-bold" />
                  Assign/Change Route
                </MenuItem>
              </MenuList>
            )}
          />
        );
      },
    },
  ];
  const dialog = useBoolean();
  // const dialogForBulkEdit = useBoolean();
  const dialogNotify = useBoolean();
  const [selectedEntry, setSelectedEntry] = useState();
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [isStaff, setIsStaff] = useState<boolean>(false);
  const [clickFromTable, setClickFromTable] = useState<boolean>(false);
  const [tableData] = useState<StudentAssignment[]>(assignments);
  const [tableDataForStaff] = useState<StaffAssignment[]>(assignmentsForStaff);
  const closeDialog = () => {
    setClickFromTable(false);
    setIsStaff(false);
    setIsEdit(false);
    dialog.onFalse();
  };

  const closeDialogForNotify = () => {
    dialogNotify.onFalse();
  };

  const handleSave = (e: any) => {
    // const { id, name, grade, assignedRoute, pickupPoint, dropoffPoint } = e;
    // if (isEdit) {
    //   const existingIndex = tableData.findIndex((val: any) => val.id === id);
    //   if (existingIndex !== -1) {
    //     const updatedData = tableData.map((val: any, index: any) =>
    //       index === existingIndex ? { ...val, assignedRoute, pickupPoint, dropoffPoint } : val
    //     );
    //     setTableData(updatedData);
    //     closeDialog();
    //     return;
    //   }
    // }
    // const studentRouteData = {
    //   id,
    //   name,
    //   grade,
    //   assignedRoute,
    //   pickupPoint,
    //   dropoffPoint,
    // };
    // const updatedData = [...tableData, studentRouteData];
    // setTableData(updatedData);
    // closeDialog();
  };

  const [searchParams, setSearchParams] = useState({ tab: 'student' });

  const handleTabChange = (e: React.SyntheticEvent<Element, Event>, value: any) => {
    setSelectedStudents([]);
    setSearchParams({ tab: value });
  };

  return (
    <>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
        {/* Tabs aligned to the left */}
        <Tabs
          value={searchParams.tab}
          onChange={(e, value) => handleTabChange(e, value)}
          sx={{
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
                  <Label variant="soft" color={(tab?.color as LabelColor) || 'default'}>
                    {tab.count}
                  </Label>
                </Box>
              }
              value={tab.value}
            />
          ))}
        </Tabs>

        {/* CTA buttons aligned to the right */}
        <Box display="flex" gap={3}>
          {/* <Button onClick={dialogForBulkEdit.onTrue} variant="contained" size="small">
                        Bulk Assign
                    </Button> */}
          <Button
            startIcon={<Iconify icon={GlobalIcons.assignedRoute} />}
            onClick={dialog.onTrue}
            variant="contained"
            size="small"
          >
            Assign Route
          </Button>
        </Box>
      </Box>

      <Divider />
      {searchParams.tab === 'student' && (
        <CustomizableTable
          onSendNotification={handlerSendNotification}
          showCheckbox={selectedStudents.length !== 0}
          data={tableData}
          columns={columnData}
          tableId="student-transport-table"
        />
      )}

      {searchParams.tab === 'staff' && (
        <CustomizableTable
          onSendNotification={handlerSendNotificationForStaff}
          showCheckbox={selectedStudents.length !== 0}
          data={tableDataForStaff}
          columns={columnDataForStaff}
          tableId="staff-transport-table"
        />
      )}

      {sendInstantNotificationDialogValueForStudent.value && (
        <SendInstantNotificationDialog
          open={sendInstantNotificationDialogValueForStudent.value}
          onClose={sendInstantNotificationDialogValueForStudent.onFalse}
          data={[]}
          userList={selectedStudents}
        />
      )}

      {sendInstantNotificationDialogValueForStaff.value && (
        <SendInstantNotificationDialog
          open={sendInstantNotificationDialogValueForStaff.value}
          onClose={sendInstantNotificationDialogValueForStaff.onFalse}
          data={[]}
          userList={selectedStudents}
        />
      )}
      {dialog.value && (
        <TransportRouteAssignedDialog
          onSave={handleSave}
          dialogValue={dialog.value}
          onClose={closeDialog}
          data={selectedEntry}
          isEdit={isEdit}
          allData={tableData}
          isStaff={isStaff}
          clickFromTable={clickFromTable}
        />
      )}
      {/* {dialogForBulkEdit.value && (
        <TransportBulkRouteDialog
          onSave={handleSaveForBulk}
          dialogValue={dialogForBulkEdit.value}
          onClose={closeDialogForBulk}
          data={selectedEntry}
          isEdit={isEdit}
          allData={tableData}
        />
      )} */}
      {dialogNotify.value && (
        <TransportNotifyParentsDialog
          onSave={handleSaveNotify}
          dialogValue={dialogNotify.value}
          onClose={closeDialogForNotify}
          data={selectedEntry}
          allData={tableData}
        />
      )}
    </>
  );
};

export default MemberTransportScreen;
