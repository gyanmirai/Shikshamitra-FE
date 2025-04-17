import type { LabelColor } from 'src/components/label';
import type { UsePopoverReturn } from 'src/components/custom-popover';

import dayjs from 'dayjs';
import React, { useMemo, useState, useCallback } from 'react';

import { Add } from '@mui/icons-material';
import { Box, Button, Tooltip, Checkbox, MenuItem, MenuList, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useGetEmployeeLeaveQuery,
  useEmployeeLeaveRequestStatusMutation,
} from 'src/redux/employee/employeeApi';
import {
  EmployeeLeaveStatusType,
  EmployeeLeaveStatusOptions,
  EmployeeLeaveStatusTypeColor,
} from 'src/enums/employee-leave-status';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';

import AddLeaveRequest from './leave-requst';

import type { TabComponentType } from '.';
import type { LeaveRequestType } from './type';

const LeaveHistory = (props: TabComponentType) => {
  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEmployeeLeaveQuery,
  });
  const [changeStatus, { isLoading: isChangeStatusLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useEmployeeLeaveRequestStatusMutation,
  });

  const modal = useBoolean();
  const [editData, setEditData] = useState<any>(null);
  const actions = useCallback(
    // eslint-disable-next-line react/no-unused-prop-types
    ({ popover }: { popover: UsePopoverReturn }, row: any) => (
      <MenuList>
        <MenuItem
          onClick={async () => {
            setEditData(row);
            if (row.status === EmployeeLeaveStatusType.Pending) {
              await changeStatus({
                id: row?.id,
                body: {
                  status: EmployeeLeaveStatusType.Reviewed,
                  rejectionReason: '',
                },
              });
            }
            modal.onTrue();
            popover.onClose();
          }}
        >
          <Iconify icon="carbon:view-filled" sx={{ height: '16px', width: '16px' }} />
          Review
        </MenuItem>
      </MenuList>
    ),
    [changeStatus, modal]
  );
  const tableData = useMemo(
    () =>
      data?.items?.map((item: LeaveRequestType) => ({
        ...item,
        start: dayjs(item.startDate).format('DD/MM/YYYY'),
        end: dayjs(item.endDate).format('DD/MM/YYYY'),
        statusValue: item.status,
        description: item.description.replace(/<[^>]+>/g, ''),
      })) || [],
    [data]
  );

  const handleClose = () => {
    setEditData(null);
    modal.onFalse();
  };

  const [selectedStudents, setSelectedStudents] = useState<any>([]);
  const sendInstantNotificationDialogValue = useBoolean();

  const handlerSendNotification = () => {
    if (!sendInstantNotificationDialogValue.value) {
      sendInstantNotificationDialogValue.onTrue();
    }
  };
  return (
    <>
      <Box display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          size="small"
          startIcon={<Add />}
          onClick={() => {
            modal.onTrue();
          }}
        >
          Leave Request
        </Button>
      </Box>
      <CustomizableTable
        noDataText={
          <>
            No Leave Request Found{' '}
            <Box
              onClick={() => {
                modal.onTrue();
              }}
              color="primary.main"
              fontWeight={600}
              sx={{
                '&:hover': {
                  cursor: 'pointer',
                  color: 'primary.main',
                  textDecoration: 'underline',
                },
              }}
            >
              Leave Request
            </Box>
          </>
        }
        onSendNotification={handlerSendNotification}
        showCheckbox={selectedStudents.length !== 0}
        isLoading={isLoading}
        tableId="leave-history-table"
        searchFieldProps={{
          placeholder: 'Search by Name, Status..',
          label: 'Search by Name, Status...',
          sx: {
            maxWidth: '400px',
            width: '100%',
          },
        }}
        columns={[
          {
            id: 'checkBox',
            align: 'left',
            minWidth: '60px',
            isSort: false,
            isFilter: false,
            label: '',
            renderColumn() {
              return (
                <Checkbox
                  checked={tableData?.length && selectedStudents?.length === tableData?.length}
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
            render(value, row) {
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
          {
            label: 'Name',
            id: 'employee.firstName',
            render(value, row) {
              return `${value} ${row.employee.lastName}`;
            },
          },
          {
            label: 'Start Date',
            id: 'start',
            filterType: 'date',
          },
          {
            label: 'End Date',
            id: 'end',
            filterType: 'date',
          },
          {
            label: 'Half Day',
            id: 'isHalfDay',
            render(value, row) {
              return value ? 'Yes' : 'No';
            },
          },
          {
            label: 'Description',
            id: 'description',
          },
          {
            label: 'Rejection Reason',
            id: 'rejectionReason',
            render(value, row) {
              return value || '-';
            },
          },
          {
            label: 'Status',
            id: 'statusValue',
            filterType: 'enum',
            enumOptions: EmployeeLeaveStatusOptions,

            render(value, row) {
              const color = EmployeeLeaveStatusTypeColor[
                value as EmployeeLeaveStatusType
              ] as LabelColor;

              return <Label color={color}>{EmployeeLeaveStatusType[value]}</Label>;
            },
          },
          {
            label: 'Action',
            id: 'action',
            isFilter: false,
            sticky: true,
            isSort: false,
            minWidth: 50,
            render(value, row) {
              return (
                <ThreeDotsActions placement="right-top" actions={(prop) => actions(prop, row)} />
              );
            },
          },
        ]}
        data={tableData}
      />
      {sendInstantNotificationDialogValue.value && (
        <SendInstantNotificationDialog
          open={sendInstantNotificationDialogValue.value}
          onClose={sendInstantNotificationDialogValue.onFalse}
          data={[]}
          userList={selectedStudents}
        />
      )}
      <CustomDialog
        maxWidth="md"
        open={modal.value}
        handleClose={handleClose}
        title={
          <Box display="flex" flexDirection="row" gap={2} alignItems="center">
            <Typography variant="h5">
              {editData ? 'Review Leave Request' : 'Add Leave Request'}
            </Typography>
            <Tooltip
              arrow
              placement="right"
              title=" you can create a new leave request by selecting the employee, leave type, start and end dates, and providing any additional notes or reasons for the leave."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </Tooltip>
          </Box>
        }
      >
        <Box p={2}>
          <AddLeaveRequest {...props} editData={editData} handleClose={handleClose} />
        </Box>
      </CustomDialog>
    </>
  );
};

export default LeaveHistory;
