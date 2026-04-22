'use client';

import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';
import type { IColumn } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { hrPaths } from 'src/constants/hr-menus';
import { useBoolean } from 'src/hooks/use-boolean';
import CustomTooltip from 'src/components/custom-tooltip';
import React, { useMemo, useState, useCallback } from 'react';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Box,
  Card,
  Button,
  MenuItem,
  MenuList,
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';
import {
  useGetLeaveRequestsQuery,
  useRejectLeaveRequestMutation,
  useApproveLeaveRequestMutation,
} from 'src/redux/hr/leaveApi';
import {
  EmployeeLeaveStatusType,
  EmployeeLeaveStatusOptions,
  EmployeeLeaveStatusTypeColor,
} from 'src/enums/employee-leave-status';

import { LeaveRequestForm } from './leave-calender';

const LeaveApprovals = () => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const [date, setDate] = useState<Dayjs | null>(dayjs(currentYear?.startDate));

  const { data, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetLeaveRequestsQuery,
    params: {
      academicYearId: currentYear?.id,
      'month-year': date?.format('MMMM-YYYY')?.toUpperCase(),
    },
  });

  const viewDialog = useBoolean();
  const approveOrRejectConfirmation = useBoolean();
  const [editData, setEditData] = useState<any>(null);

  const actions = useCallback(
    ({ popover }: any, row: any) => (
      <MenuList>
        <MenuItem
          onClick={() => {
            setEditData(row);
            viewDialog.onTrue();
            popover.onClose();
          }}
        >
          <Iconify icon="carbon:view-filled" sx={{ height: '16px', width: '16px' }} />
          View
        </MenuItem>
        <MenuItem
          onClick={() => {
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
          onClick={() => {
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
    [viewDialog, approveOrRejectConfirmation]
  );

  const tableData = useMemo(() => {
    const apiData =
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
          organization: item.mediumStageName,
          description: item.description,
          remarks: item.remarks,
          status: item.status,
        };
      }) || [];

    return apiData;
  }, [data]);

  const columns: IColumn[] = useMemo(
    () => [
      {
        label: 'Name',
        id: 'name',
        sticky: true,
        minWidth: '12vw',
        align: 'left',
        render(value, row) {
          return (
            <Box display="flex" alignItems="center" gap={1}>
              {value} ({row.employeeIdentifier})
            </Box>
          );
        },
      },
      {
        label: 'Leave Type',
        id: 'leaveType',
        align: 'left',
        minWidth: '10vw',
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
        filterType: 'number',
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
          return <ThreeDotsActions placement="right-top" actions={(prop) => actions(prop, row)} />;
        },
      },
    ],
    [actions]
  );

  return (
    <Box sx={{ height: '100%', minHeight: '0', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Leave Approvals"
        links={[
          { name: 'HR/Staff', href: '/hr/dashboard/' },
          { name: 'Leave Management', href: hrPaths.leaveManagement.applyLeave },
          { name: 'Leave Approvals' },
        ]}
        description="Review and approve or reject employee leave requests."
      />
      <Card
        sx={{
          display: 'flex',
          p: 2,
          gap: 2,
          mt: 1,
          pl: 1,
          mb: 1,
          justifyContent: 'space-between',
        }}
      >
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
      </Card>

      <CustomizableTable
        noDataText="No Leave Requests Found"
        isLoading={isLoading}
        tableId="leave-approvals-table"
        data={tableData}
        columns={columns}
      />

      {/* View Dialog */}
      <CustomDialog
        open={viewDialog.value}
        handleClose={() => {
          viewDialog.onFalse();
          setEditData(null);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">View Leave Request</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="Review the request to see all leave information."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <LeaveRequestForm editData={editData} />
      </CustomDialog>

      {/* Approve / Reject Dialog */}
      {editData?.type && (
        <CustomDialog
          open={approveOrRejectConfirmation.value}
          handleClose={() => {
            approveOrRejectConfirmation.onFalse();
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
              approveOrRejectConfirmation.onFalse();
              setEditData(null);
            }}
            editData={editData}
          />
        </CustomDialog>
      )}
    </Box>
  );
};

export default LeaveApprovals;

export const ApproveRejectForm = ({
  handleClose,
  editData,
}: {
  handleClose: (e: any, isSubmit?: boolean) => void;
  editData: any;
}) => {
  const [approveLeaveRequest, { isLoading: isApproveLeaveRequestLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useApproveLeaveRequestMutation,
  });
  const [rejectLeaveRequest, { isLoading: isRejectLeaveRequestLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useRejectLeaveRequestMutation,
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
        if (editData.type === EmployeeLeaveStatusType.Approved) {
          await approveLeaveRequest({
            id: editData?.id,
            body: {
              remarks: formikValues.rejectionReason,
            },
          }).unwrap();
        } else if (editData.type === EmployeeLeaveStatusType.Rejected) {
          await rejectLeaveRequest({
            id: editData?.id,
            body: {
              remarks: formikValues.rejectionReason,
            },
          }).unwrap();
        }
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
          onClick={() => handleClose(null, false)}
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Cancel
        </Button>
        <LoadingButton
          variant="contained"
          loading={isApproveLeaveRequestLoading || isRejectLeaveRequestLoading}
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
