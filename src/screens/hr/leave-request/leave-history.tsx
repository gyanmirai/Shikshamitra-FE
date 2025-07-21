import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useSelector, useDispatch } from 'react-redux';
import React, { useMemo, useState, useEffect, useCallback } from 'react';

import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import {
  Box,
  Button,
  MenuItem,
  MenuList,
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { GlobalIcons } from 'src/utils/icons';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
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
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';

import AddLeaveRequest from './leave-requst';
import { LeaveRequestForm } from './leave-calender';

const LeaveHistory = (props: any) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const [date, setDate] = useState<Dayjs | null>(dayjs(currentYear?.startDate));

  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEmployeeLeaveQuery,
  });
  const [changeStatus, { isLoading: isChangeStatusLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useEmployeeLeaveRequestStatusMutation,
  });
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

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
                  status: EmployeeLeaveStatusType.Viewed,
                  rejectionReason: '',
                },
              });
            }
            modal?.onTrue?.();
            popover.onClose();
          }}
        >
          <Iconify icon="carbon:view-filled" sx={{ height: '16px', width: '16px' }} />
          View
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
        start: dayjs(item.startDate).format('DD-MM-YYYY'),
        end: dayjs(item.endDate).format('DD-MM-YYYY'),
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

  const handleClose = (_e?: any, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        setEditData(null);
        setRejectionReason('');
      }, 200); // Optional delay for modal/dialog animation
    };

    const confirmLeave = () =>
      isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'));

    if (confirmLeave()) {
      modal?.onFalse?.();
      resetState();
      dispatch(setIsChanges(false)); // Optional if used
    } else if (!isChanges) {
      modal?.onFalse?.();
      setTimeout(() => {
        setEditData(null);
        setRejectionReason('');
      }, 200);
    }
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
          label="Month-Year"
          format="MMM-YYYY"
          value={date}
          minDate={dayjs(currentYear?.startDate)}
          maxDate={dayjs(currentYear?.endDate)}
          views={['year', 'month']}
          slotProps={{
            textField: {
              size: 'small',
            },
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
            minWidth: '12vw',
            align: 'left',
            render(value, row) {
              return `${value} ${row.employee.lastName}`;
            },
          },
          {
            label: 'Employee Code',
            id: 'employee.employeeCode',
            minWidth: '9.5vw',
            align: 'left',
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
            minWidth: '7vw',
            align: 'left',
          },
          {
            label: 'Organization',
            id: 'employee.educationMediumStage.name',
            align: 'left',
            minWidth: '14vw',
          },
          {
            label: 'Description',
            id: 'description',
            align: 'left',
            minWidth: '14vw',
          },
          {
            label: 'Remarks',
            id: 'rejectionReason',
            align: 'left',
            minWidth: '12vw',
            render(value, row) {
              return value || '-';
            },
          },
          {
            label: 'Status',
            id: 'statusValue',
            filterType: 'enum',
            align: 'left',
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
        handleClose={() => {
          modal?.onFalse?.();
          setEditData(null);
          setRejectionReason('');
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {editData ? 'Review Leave Request' : 'Add Leave Request'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title={
                editData
                  ? 'Review and manage leave requests. You can view details and take actions like approve or reject.'
                  : 'Create a leave request by selecting the employee, leave type, dates, and adding notes.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        {editData ? (
          <LeaveRequestForm editData={editData} />
        ) : (
          <AddLeaveRequest {...props} editData={editData} handleClose={handleClose} />
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
            <Box display="flex" flexDirection="row" gap={1} alignItems="center">
              <Typography variant="h5">
                {editData.type === EmployeeLeaveStatusType.Rejected
                  ? 'Reject Leave Request'
                  : 'Approve Leave Request'}
              </Typography>
              <CustomTooltip
                arrow
                placement="right"
                sx={{ textAlign: 'justify' }}
                title={
                  editData.type === EmployeeLeaveStatusType.Rejected
                    ? 'When rejecting a leave request, you must provide remarks explaining the reason for rejection.'
                    : 'You can add optional remarks while approving this leave request.'
                }
              >
                <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
              </CustomTooltip>
            </Box>
          }
        >
          <ApproveRejectForm
            handleClose={() => {
              approveOrRejectConfirmation?.onFalse();
              setRejectionReason('');
              setEditData(null);
            }}
            editData={editData}
          />
        </CustomDialog>
      )}
    </>
  );
};

export default LeaveHistory;

const ApproveRejectForm = ({
  handleClose,
  editData,
}: {
  handleClose: (e: any, isSubmit: boolean) => void;
  editData: any;
}) => {
  const [changeStatus, { isLoading: isChangeStatusLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useEmployeeLeaveRequestStatusMutation,
  });
  const { values, handleChange, errors, touched, handleSubmit } = useFormik({
    initialValues: {
      rejectionReason: '',
    },
    validationSchema: Yup.object({
      rejectionReason:
        editData.type === EmployeeLeaveStatusType.Rejected
          ? Yup.string().required('Remarks is required')
          : Yup.string(),
    }),
    onSubmit: async (formikValues) => {
      try {
        await changeStatus({
          id: editData?.id,
          body: {
            status: editData.type,
            rejectionReason: formikValues.rejectionReason,
          },
        }).unwrap();
        handleClose(null, true);
      } catch (error) {
        console.log(error);
      }
    },
  });
  return (
    <>
      <DialogScrollContent>
        <TextField
          fullWidth
          multiline
          rows={4}
          label={editData.type === EmployeeLeaveStatusType.Rejected ? 'Remarks *' : 'Remarks'}
          onChange={handleChange}
          name="rejectionReason"
          value={values.rejectionReason}
          error={touched.rejectionReason && !!errors.rejectionReason}
          helperText={touched.rejectionReason && errors.rejectionReason}
          sx={{ mb: 2 }}
        />
      </DialogScrollContent>
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          variant="outlined"
          size="small"
          onClick={() => {
            handleClose(null, false);
          }}
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Cancel
        </Button>
        <LoadingButton
          variant="contained"
          loading={isChangeStatusLoading}
          onClick={(e: any) => handleSubmit(e)}
          size="small"
          startIcon={
            <Iconify
              icon={
                editData.type === EmployeeLeaveStatusType.Rejected
                  ? GlobalIcons.reject
                  : GlobalIcons.approvedIcon
              }
            />
          }
        >
          {editData.type === EmployeeLeaveStatusType.Rejected ? 'Reject' : 'Approve'}
        </LoadingButton>
      </DialogActions>
    </>
  );
};
