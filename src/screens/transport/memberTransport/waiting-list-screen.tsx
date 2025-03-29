import type { LabelColor } from 'src/components/label';

import React, { useMemo, useState } from 'react';

import { Box, Tab, Tabs, Button, Divider, Checkbox } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify/iconify';
import CustomizableTable from 'src/components/customizabaleTable';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';

import RouteAvailableNotifyDialog from './component/route_available_notify-dialog';
import { assignments, assignmentsForStaff } from './data/waiting-screen-list-data';
import TransportStudentAndStaffUpdateInfoDialog from '../starffTransport/component/transport-student-update-route-dialog';

import type {
  Assignment,
  StaffAssignment,
  StudentAssignment,
} from './data/member-transport-screen-data';

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

  const assignedRouteDialog = useBoolean();
  const notifyDialog = useBoolean();

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

  const [tableData, setTableData] = useState<StudentAssignment[]>(assignments);
  const [tableDataForStaff, setTableDataForStaff] =
    useState<StaffAssignment[]>(assignmentsForStaff);
  const [searchParams, setSearchParams] = useState({ tab: 'student' });
  const [isStaff, setIsStaff] = useState<boolean>(false);

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
  const [selectedStudents, setSelectedStudents] = useState<Assignment[]>([]);

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

  const handleTabChange = (e: React.SyntheticEvent<Element, Event>, value: string) => {
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
