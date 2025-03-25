import type { LabelColor } from 'src/components/label';

import React, { useMemo, useState } from 'react';

import { Box, Tab, Tabs, Button, Divider, Checkbox } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify/iconify';
import CustomizableTable from 'src/components/customizabaleTable';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';

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

    { id: 'dropoffPoint', label: 'Stop' },
    { id: 'declinedReason', label: 'Declined Reason' },
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
    { id: 'declinedReason', label: 'Declined Reason' },
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
        <CustomizableTable
          onSendNotification={handlerSendNotification}
          showCheckbox={selectedStudents.length !== 0}
          data={tableData}
          columns={columnData}
          tableId="student"
        />
      )}
      {searchParams.tab === 'staff' && (
        <CustomizableTable
          onSendNotification={handlerSendNotificationForStaff}
          showCheckbox={selectedStudents.length !== 0}
          data={tableDataForStaff}
          columns={columnDataForStaff}
          tableId="staff"
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
