import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import SendInstantNotificationDialog from 'src/components/send-instant-notification-dialog';
import {
  Box,
  Button,
  MenuItem,
  MenuList,
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';
import {
  EmployeeLeaveStatusType,
  EmployeeLeaveStatusOptions,
  EmployeeLeaveStatusTypeColor,
} from 'src/enums/employee-leave-status';
import {
  useGetEmployeeLeaveQuery,
  useDeleteEmployeeLeaveMutation,
  useEmployeeLeaveRequestStatusMutation,
} from 'src/redux/employee/employeeApi';

import AddLeaveRequest from './leave-requst';
import { LeaveRequestForm } from './leave-calender';

const LeaveHistory = (props: any) => {
  const { currentYear, currentMedium: mediumStageId } = useSelector(
    (state: RootState) => state.globalState
  );
  const [date, setDate] = useState<Dayjs | null>(dayjs(currentYear?.startDate));

  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEmployeeLeaveQuery,
    params: mediumStageId?.id,
  });
  const [changeStatus, { isLoading: isChangeStatusLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useEmployeeLeaveRequestStatusMutation,
  });

  const [deleteLeave, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteEmployeeLeaveMutation,
  });

  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

  const { modal } = props;

  const approveConfirmation = useBoolean();
  const approveOrRejectConfirmation = useBoolean();
  const cancelConfirmation = useBoolean();

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
        <MenuItem
          onClick={() => {
            setEditData(row);
            cancelConfirmation.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'warning.main' }}
        >
          <Iconify icon="mdi:cancel" sx={{ height: '16px', width: '16px' }} />
          Cancel
        </MenuItem>
      </MenuList>
    ),
    [changeStatus, modal, approveOrRejectConfirmation, cancelConfirmation]
  );

  const tableData = useMemo(
    () =>
      data?.items?.map((item: any) => {
        const start = dayjs(item.startDate);
        const end = dayjs(item.endDate);

        return {
          id: item.id,
          name: item.name,
          employeeIdentifier: item.employeeIdentifier,
          leaveType: item.leaveType,
          startDate: start.format('DD-MM-YYYY'),
          endDate: end.format('DD-MM-YYYY'),
          totalDays: item.totalDays,
          organization: item.organization,
          description: item.description,
          remarks: item.remarks,
          status: item.status,
        };
      }) || [],
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

  const [selectedStudents] = useState<any>([]);
  const sendInstantNotificationDialogValue = useBoolean();

  const handlerSendNotification = () => {
    if (!sendInstantNotificationDialogValue.value) {
      sendInstantNotificationDialogValue.onTrue();
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    setRejectionReason(editData?.rejectionReason || '');
  }, [editData?.rejectionReason]);

  return (
    <Box sx={{ height: '100%', minHeight: '0', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', gap: 2, mt: 1.5, pl: 1, justifyContent: 'space-between' }}>
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
          sx={{ px: '32px' }}
        >
          Leave Request
        </Button>
      </Box>
      <CustomizableTable
        noDataText={
          <>
            No Leave Request Found{' '}
            <Box
              onClick={() => modal?.onTrue?.()}
              color="primary.main"
              fontWeight={600}
              sx={{
                '&:hover': {
                  cursor: 'pointer',
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
        data={tableData}
        columns={[
          {
            label: 'Name',
            id: 'name',
            sticky: true,
            minWidth: '12vw',
            align: 'left',
          },
          {
            label: 'Employee Code',
            id: 'employeeIdentifier',
            minWidth: '9.5vw',
            align: 'left',
          },
          {
            label: 'Start Date',
            id: 'startDate',
            filterType: 'date',
            minWidth: '120px',
            align: 'left',
            isDateFilter: true,
          },
          {
            label: 'End Date',
            id: 'endDate',
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
            id: 'organization',
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
            id: 'remarks',
            align: 'left',
            minWidth: '12vw',
            render(value) {
              return value || '-';
            },
          },
          {
            label: 'Status',
            id: 'status',
            filterType: 'enum',
            align: 'left',
            enumOptions: EmployeeLeaveStatusOptions,
            sticky: true,
            minWidth: '100px',
            render(value) {
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
            isSort: false,
            sticky: true,
            render(_value, row) {
              return (
                <ThreeDotsActions placement="right-top" actions={(prop) => actions(prop, row)} />
              );
            },
          },
        ]}
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

      <ConfirmDialog
        open={cancelConfirmation.value}
        onClose={() => {
          setEditData(null);
          cancelConfirmation.onFalse();
        }}
        title="Cancel Leave Request"
        content={
          <>
            Are you sure you want to cancel this leave request for <strong>{editData?.name}</strong>
            ?
          </>
        }
        action={
          <LoadingButton
            variant="contained"
            color="warning"
            loading={isDeleteLoading}
            onClick={async () => {
              await deleteLeave(editData?.id);
              cancelConfirmation.onFalse();
              setEditData(null);
            }}
          >
            Yes, Cancel
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
                  ? 'Review the request to see all leave information.'
                  : 'Create a leave request by entering all required fields.'
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
                    ? 'Remarks are required to reject the leave request.'
                    : 'Review the request and click Approve. Add remarks if you wish to include any additional info.'
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
    </Box>
  );
};

export default LeaveHistory;

export const ApproveRejectForm = ({
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
            remarks: formikValues.rejectionReason,
          },
        }).unwrap();
        handleClose(null, true);
      } catch (error) {
        console.error(error);
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
