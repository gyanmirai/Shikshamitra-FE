import type { LabelColor } from 'src/components/label';

import React, { useState } from 'react';
import { Label } from 'src/components/label';
import { useBoolean } from 'src/hooks/useBoolean';
import { Iconify } from 'src/components/iconify/iconify';
import { Box, Tab, Tabs, Divider, Checkbox } from '@mui/material';
import CustomizableTable from 'src/components/customizable-table';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';

import { assignments, assignmentsForStaff } from './data/transport-notification-list-data';

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

const TransportNotifiedPersonlistScreen = () => {
  // const [selectedIds, setSelectedIds] = useState<number[]>([]);
  // const [selectedIdsforStaff, setSelectedIdsForStaff] = useState<number[]>([]);

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

  const handleTabChange = (e: React.SyntheticEvent<Element, Event>, value: any) => {
    setSelectedStudents([]);
    setSearchParams({ tab: value });
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
  ];

  const [tableData] = useState<StudentAssignment[]>(assignments);
  const [tableDataForStaff] = useState<StaffAssignment[]>(assignmentsForStaff);
  const [searchParams, setSearchParams] = useState({ tab: 'student' });

  return (
    <>
      <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Tabs
            value={searchParams.tab}
            onChange={(e, value) => handleTabChange(e, value)}
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
          onSendNotification={handlerSendNotification}
          showCheckbox={selectedStudents.length !== 0}
          data={tableData}
          columns={columnData}
          tableId="student-transport-notification-list-screen"
        />
      )}
      {searchParams.tab === 'staff' && (
        <CustomizableTable
          onSendNotification={handlerSendNotificationForStaff}
          showCheckbox={selectedStudents.length !== 0}
          data={tableDataForStaff}
          columns={columnDataForStaff}
          tableId="staff-transport-notification-list-screen"
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
    </>
  );
};

export default TransportNotifiedPersonlistScreen;
