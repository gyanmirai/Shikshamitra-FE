import type { Dayjs } from 'dayjs';
import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import React, { useMemo, useState, useEffect, useCallback } from 'react';

import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { Box, Button, Tooltip, MenuItem, MenuList, TextField, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

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
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';

import AddLeaveRequest from './leave-requst';
import { LeaveRequestForm } from './leave-calender';

const LeaveHistory = (props: any) => {
  const [date, setDate] = useState<Dayjs | null>(dayjs());

  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEmployeeLeaveQuery,
  });
  const [changeStatus, { isLoading: isChangeStatusLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useEmployeeLeaveRequestStatusMutation,
  });

  const { modal } = props;

  const approveConfirmation = useBoolean();
  const approveOrRejectConfirmation = useBoolean();

  const [editData, setEditData] = useState<any>(null);
  const actions = useCallback(
    ({ popover }: any, row: any) => (
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
            modal?.onTrue?.();
            popover.onClose();
          }}
        >
          <Iconify icon="carbon:view-filled" sx={{ height: '16px', width: '16px' }} />
          Review
        </MenuItem>
        <MenuItem
          onClick={async () => {
            setEditData({ ...row, type: EmployeeLeaveStatusType.Approved });

            approveOrRejectConfirmation.onTrue();

            popover.onClose();
          }}
          sx={{ color: 'success.main' }}
        >
          <Iconify icon="mdi:approve" sx={{ height: '16px', width: '16px' }} />
          Approve
        </MenuItem>
        <MenuItem
          onClick={async () => {
            setEditData({ ...row, type: EmployeeLeaveStatusType.Rejected });
            approveOrRejectConfirmation.onTrue();

            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="mdi:close-circle" sx={{ height: '16px', width: '16px' }} />
          Reject
        </MenuItem>
      </MenuList>
    ),
    [changeStatus, modal, approveOrRejectConfirmation]
  );

  const tableData = useMemo(
    () =>
      data?.items?.map((item: any) => ({
        ...item,
        start: dayjs(item.startDate).format('DD/MM/YYYY'),
        end: dayjs(item.endDate).format('DD/MM/YYYY'),
        statusValue: item.status,
        viewStartDate: item.startDate,
        color: item.leavePolicy.color,
        viewEndDate: item.endDate,
        allDay: false,
        textColor: item.leavePolicy.color,
        title: `${item.leavePolicy.leaveType} [${item.employee.firstName} ${item.employee.lastName}]`,
        description: item.description.replace(/<[^>]+>/g, ''),
        totalDays: item.isHalfDay
          ? 0.5
          : dayjs(item.endDate).diff(dayjs(item.startDate), 'day') + 1 < 0
            ? 0
            : dayjs(item.endDate).diff(dayjs(item.startDate), 'day') + 1,
      })) || [],
    [data]
  );

  const handleClose = () => {
    setEditData(null);
    modal?.onFalse?.();
    setRejectionReason('');
  };

  const [selectedStudents, setSelectedStudents] = useState<any>([]);
  const sendInstantNotificationDialogValue = useBoolean();

  const handlerSendNotification = () => {
    if (!sendInstantNotificationDialogValue.value) {
      sendInstantNotificationDialogValue.onTrue();
    }
  };

  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    setRejectionReason(editData?.rejectionReason || '');
  }, [editData?.rejectionReason]);

  return (
    <>
      <Box sx={{ display: 'flex', gap: 2, my: 2, pl: 1, justifyContent: 'space-between' }}>
        <DatePicker
          label="Date"
          format="MMM-YYYY"
          value={date}
          views={['month', 'year']}
          slotProps={{
            textField: {
              fullWidth: true,
              size: 'small',
            },
          }}
          sx={{
            maxWidth: '400px',
            width: '100%',
          }}
          onChange={(newDate) => {
            setDate(newDate);
          }}
        />
        <Button
          variant="contained"
          size="small"
          startIcon={<Add />}
          onClick={() => {
            modal?.onTrue?.();
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
                modal?.onTrue?.();
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
          // {
          //   id: 'checkBox',
          //   align: 'left',
          //   minWidth: '60px',
          //   sticky: true,
          //   isSort: false,
          //   isFilter: false,
          //   label: '',
          //   renderColumn() {
          //     return (
          //       <Checkbox
          //         checked={tableData?.length && selectedStudents?.length === tableData?.length}
          //         onChange={(e) => {
          //           if (e.target.checked) {
          //             setSelectedStudents(tableData || []);
          //           } else {
          //             setSelectedStudents([]);
          //           }
          //         }}
          //       />
          //     );
          //   },
          //   render(value, row) {
          //     return (
          //       <Checkbox
          //         checked={!!selectedStudents.some((i: any) => i.id === row.id)}
          //         onChange={(e) => {
          //           if (e.target.checked) {
          //             setSelectedStudents([...selectedStudents, row]);
          //           } else {
          //             setSelectedStudents(selectedStudents.filter((i: any) => i.id !== row.id));
          //           }
          //         }}
          //       />
          //     );
          //   },
          // },
          {
            label: 'Name',
            sticky: true,
            id: 'employee.firstName',
            minWidth: '8vw',
            align: 'left',
            render(value, row) {
              return `${value} ${row.employee.lastName}`;
            },
          },
          {
            label: 'Start Date',
            id: 'start',
            filterType: 'date',
            minWidth: '120px',
            align: 'left',
            isDateFilter: true,
          },
          {
            label: 'End Date',
            id: 'end',
            filterType: 'date',
            minWidth: '100px',
            align: 'left',
            isDateFilter: true,
          },
          {
            label: 'Total Days',
            id: 'totalDays',
            minWidth: '6vw',
            align: 'left',
          },
          {
            label: 'Half Day',
            id: 'isHalfDay',
            minWidth: '100px',
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
            minWidth: '200px',
            render(value, row) {
              return value || '-';
            },
          },
          {
            label: 'Status',
            id: 'statusValue',
            filterType: 'enum',
            enumOptions: EmployeeLeaveStatusOptions,
            sticky: true,
            minWidth: '100px',
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
            render(value, row) {
              return (
                <ThreeDotsActions placement="right-top" actions={(prop) => actions(prop, row)} />
              );
            },
          },
        ]}
        data={tableData}
      />
      <ConfirmDialog
        open={approveConfirmation.value}
        onClose={() => {
          setEditData(null);
          approveConfirmation.onFalse();
        }}
        title="Approve"
        content="Are you sure you want to Approve?"
        action={
          <LoadingButton
            variant="contained"
            loading={isChangeStatusLoading}
            onClick={async () => {
              await changeStatus({
                id: editData?.id,
                body: {
                  status: EmployeeLeaveStatusType.Approved,
                  rejectionReason: '',
                },
              });

              approveConfirmation.onFalse();
              setEditData(null);
            }}
          >
            Approve
          </LoadingButton>
        }
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
        open={modal?.value}
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
        {editData ? (
          <LeaveRequestForm editData={editData} />
        ) : (
          <Box>
            <AddLeaveRequest {...props} editData={editData} handleClose={handleClose} />
          </Box>
        )}
      </CustomDialog>
      {editData?.type && (
        <CustomDialog
          open={approveOrRejectConfirmation?.value}
          handleClose={() => {
            approveOrRejectConfirmation?.onFalse();
            setRejectionReason('');
            setEditData(null);
          }}
          title={
            editData.type === EmployeeLeaveStatusType.Rejected
              ? 'Reject Leave Request'
              : 'Approve Leave Request'
          }
        >
          <Box sx={{ p: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Remarks"
              placeholder="Remarks"
              onChange={(e) => {
                setRejectionReason(e.target.value);
              }}
              value={rejectionReason}
              sx={{ mb: 2 }}
            />
            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button
                variant="outlined"
                onClick={handleClose}
                startIcon={<Iconify icon={GlobalIcons.cancel} />}
              >
                Cancel
              </Button>
              <LoadingButton
                variant="contained"
                loading={isChangeStatusLoading}
                startIcon={
                  <Iconify
                    icon={
                      editData.type === EmployeeLeaveStatusType.Rejected
                        ? GlobalIcons.reject
                        : GlobalIcons.approvedIcon
                    }
                  />
                }
                onClick={async () => {
                  await changeStatus({
                    id: editData?.id,
                    body: {
                      status: editData.type,
                      rejectionReason,
                    },
                  });
                  approveOrRejectConfirmation?.onFalse();
                  setRejectionReason('');
                  setEditData(null);
                }}
              >
                {editData.type === EmployeeLeaveStatusType.Rejected ? 'Reject' : 'Approve'}
              </LoadingButton>
            </Box>
          </Box>
        </CustomDialog>
      )}
    </>
  );
};

export default LeaveHistory;
