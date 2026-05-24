'use client';

import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import React, { useMemo, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import CustomTooltip from 'src/components/custom-tooltip';
import CustomizableTable from 'src/components/customizabaleTable';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  useGetLeaveRequestsQuery,
  useRejectLeaveRequestMutation,
  useApproveLeaveRequestMutation,
} from 'src/redux/hr/leaveApi';
import {
  Box,
  Card,
  List,
  Grid,
  Stack,
  Avatar,
  Button,
  Divider,
  ListItem,
  TextField,
  IconButton,
  Typography,
  CardContent,
  ListItemText,
  DialogActions,
  ListItemAvatar,
} from '@mui/material';

// -----------------------------------------------------------------------

const leaveTypeColor = (type: string): LabelColor => {
  if (type === 'Sick Leave') return 'error';
  if (type === 'Casual Leave') return 'warning';
  return 'success';
};

const LeaveCard = ({
  title,
  count,
  color,
  icon,
}: {
  title: string;
  count: number;
  color: string;
  icon: string;
}) => (
  <Card
    variant="outlined"
    sx={{
      height: '100%',
      borderRadius: 2,
      border: 'none',
      bgcolor: 'background.neutral',
    }}
  >
    <CardContent sx={{ p: 1, '&:last-child': { pb: 2 } }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ display: 'block', mb: 0.25 }}>
        {title}
      </Typography>
      <Typography variant="h4" fontWeight="bold">
        {String(count).padStart(2, '0')}
      </Typography>
    </CardContent>
  </Card>
);

// -----------------------------------------------------------------------

const requests = [
  {
    id: 1,
    name: 'Kanwar Rajan',
    role: 'Design Lead',
    type: 'Sick Leave',
    duration: '3 Days',
    dateRange: '24 Oct - 26 Oct',
    avatar: '',
    pending: true,
    status: 'Pending',
  },
  {
    id: 2,
    name: 'Kumar Rajes',
    role: 'Frontend Dev',
    type: 'Casual Leave',
    duration: '2 Days',
    dateRange: '28 Oct - 29 Oct',
    avatar: '',
    pending: true,
    status: 'Pending',
  },
  {
    id: 3,
    name: 'Jinjala Dharmik',
    role: 'Product Manager',
    type: 'Paid Leave',
    duration: '4 Days',
    dateRange: '02 Nov - 05 Nov',
    avatar: '',
    pending: true,
    status: 'Pending',
  },
  {
    id: 4,
    name: 'Priya Sharma',
    role: 'HR Manager',
    type: 'Sick Leave',
    duration: '1 Day',
    dateRange: '10 Nov - 10 Nov',
    avatar: '',
    pending: false,
    status: 'Approved',
  },
];

export enum LeaveStatusType {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
}

export const LeaveStatusOptions = [
  { label: 'Pending', value: LeaveStatusType.Pending },
  { label: 'Approved', value: LeaveStatusType.Approved },
  { label: 'Rejected', value: LeaveStatusType.Rejected },
];

export const LeaveTypeOptions = [
  { label: 'Sick Leave', value: 'Sick Leave' },
  { label: 'Casual Leave', value: 'Casual Leave' },
  { label: 'Paid Leave', value: 'Paid Leave' },
];

const LeaveManagement = () => {
  const [openViewAll, setOpenViewAll] = useState(false);
  const [isRejectAction, setIsRejectAction] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const isConfirmDialog = useBoolean(false);
  const viewPopover = usePopover();
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const { data, isLoading } = useGetLeaveRequestsQuery(
    { academicYearId: currentYear?.id, page: 1, pageSize: 20 },
    { skip: !currentYear?.id }
  );

  const leaveRequests = useMemo(
    () =>
      (data?.items || []).map((item: any) => {
        const start = dayjs(item.startDate);
        const end = dayjs(item.endDate);
        const status =
          typeof item.status === 'string'
            ? item.status
            : ['Pending', 'Approved', 'Rejected'][item.status] || 'Pending';
        return {
          id: item.id,
          name: item.name || item.employeeName || '-',
          role: item.roleName || item.designation || '-',
          type: item.leaveType || item.leaveTypeName || 'Leave',
          duration: `${item.totalDays || 0} Day${Number(item.totalDays || 0) === 1 ? '' : 's'}`,
          dateRange: `${start.isValid() ? start.format('DD MMM') : '-'} - ${end.isValid() ? end.format('DD MMM') : '-'}`,
          status,
          pending: status.toLowerCase() === 'pending',
        };
      }),
    [data?.items]
  );

  const summary = useMemo(
    () => ({
      pending: leaveRequests.filter((item: any) => item.status.toLowerCase() === 'pending').length,
      approved: leaveRequests.filter((item: any) => item.status.toLowerCase() === 'approved')
        .length,
      sick: leaveRequests.filter((item: any) => item.type === 'Sick Leave').length,
      casual: leaveRequests.filter((item: any) => item.type === 'Casual Leave').length,
      paid: leaveRequests.filter((item: any) => item.type === 'Paid Leave').length,
    }),
    [leaveRequests]
  );

  const leaveColumns: any[] = [
    { id: 'name', label: 'Employee Name', align: 'left', sticky: true },
    {
      id: 'type',
      label: 'Leave Type',
      align: 'left',
      filterType: 'enum',
      enumOptions: LeaveTypeOptions,
      render: (value: string) => (
        <Label variant="soft" color={leaveTypeColor(value)}>
          {value}
        </Label>
      ),
    },
    { id: 'duration', label: 'Duration', align: 'left' },
    {
      id: 'status',
      label: 'Status',
      align: 'left',
      filterType: 'enum',
      sticky: true,
      enumOptions: LeaveStatusOptions,
      render: (value: string) => (
        <Label
          variant="soft"
          color={value === 'Approved' ? 'success' : value === 'Rejected' ? 'error' : 'warning'}
        >
          {value}
        </Label>
      ),
    },
  ];

  return (
    <Card
      sx={{
        p: 2,
        borderRadius: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h6" fontWeight="bold">
            Leave Management
          </Typography>
          <CustomTooltip title="Manage and track employee leave requests" placement="top">
            <IconButton size="small" sx={{ p: 0 }}>
              <Iconify icon="solar:info-circle-linear" width={18} sx={{ color: 'text.disabled' }} />
            </IconButton>
          </CustomTooltip>
        </Stack>
        <Stack direction="row" spacing={2} alignItems="center">
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'warning.main' }} />
            <Typography variant="caption" color="warning.main" fontWeight={600}>
              Pending: {summary.pending}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main' }} />
            <Typography variant="caption" color="success.main" fontWeight={600}>
              Approved: {summary.approved}
            </Typography>
          </Stack>
        </Stack>
      </Stack>

      {/* Summary Cards */}
      <Grid container spacing={1.5}>
        <Grid size={{ xs: 12, md: 4 }}>
          <LeaveCard
            title="Sick Leave"
            count={summary.sick}
            color="#D81B60"
            icon="solar:stethoscope-bold"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <LeaveCard
            title="Casual Leave"
            count={summary.casual}
            color="#1E88E5"
            icon="solar:calendar-mark-bold"
          />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <LeaveCard
            title="Paid Leave"
            count={summary.paid}
            color="#43A047"
            icon="solar:wallet-money-bold"
          />
        </Grid>
      </Grid>

      {/* Recent Requests */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="subtitle2" fontWeight={700}>
          Recent Requests
        </Typography>
        <Button
          size="small"
          startIcon={<Iconify icon="solar:filter-linear" width={16} />}
          sx={{
            textTransform: 'none',
            color: 'text.secondary',
            fontWeight: 500,
            fontSize: '0.75rem',
          }}
        >
          Filter
        </Button>
      </Stack>

      <Scrollbar sx={{ flexGrow: 1, maxHeight: 320 }}>
        <List disablePadding>
          {leaveRequests.map((req: any) => (
            <ListItem
              key={req.id}
              disableGutters
              sx={{
                py: 1.25,
                px: 1.5,
                mb: 1,
                borderRadius: 1.5,
                bgcolor: 'background.neutral',
                alignItems: 'center',
              }}
            >
              <ListItemAvatar sx={{ minWidth: 52 }}>
                <Avatar sx={{ width: 40, height: 40, fontSize: '0.95rem' }}>
                  {req.name.charAt(0)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                sx={{ flex: '0 0 auto', minWidth: 110, mr: 1.5 }}
                primary={
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {req.name}
                  </Typography>
                }
                secondary={
                  <Typography variant="caption" color="text.disabled" noWrap>
                    {(req as any).role}
                  </Typography>
                }
              />
              <Box sx={{ flex: 1, minWidth: 0, mr: 1.5 }}>
                <Label
                  color={leaveTypeColor(req.type)}
                  variant="soft"
                  sx={{ fontSize: '0.7rem', mb: 0.25, display: 'inline-flex' }}
                >
                  {req.type}
                </Label>
                <Typography
                  variant="caption"
                  color="text.disabled"
                  sx={{ display: 'block' }}
                  noWrap
                >
                  {(req as any).dateRange}
                </Typography>
              </Box>
              <Typography
                variant="body2"
                fontWeight={600}
                sx={{ mr: 1.5, flexShrink: 0, minWidth: 40, textAlign: 'right' }}
              >
                {req.duration}
              </Typography>
              {/* Quick Actions */}
              {req.pending ? (
                <Stack direction="row" spacing={0.75} sx={{ flexShrink: 0 }}>
                  <CustomTooltip title="Approve">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setIsRejectAction(false);
                        setSelectedRequest({ ...req, type: 'approve' });
                        isConfirmDialog.onTrue();
                      }}
                      sx={{
                        border: '1.5px solid',
                        borderColor: 'success.main',
                        color: 'success.main',
                        borderRadius: 1,
                        p: 0.4,
                        '&:hover': { bgcolor: 'success.lighter' },
                      }}
                    >
                      <Iconify icon="eva:checkmark-outline" width={16} />
                    </IconButton>
                  </CustomTooltip>
                  <CustomTooltip title="Reject">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setIsRejectAction(true);
                        setSelectedRequest({ ...req, type: 'reject' });
                        isConfirmDialog.onTrue();
                      }}
                      sx={{
                        border: '1.5px solid',
                        borderColor: 'error.main',
                        color: 'error.main',
                        borderRadius: 1,
                        p: 0.4,
                        '&:hover': { bgcolor: 'error.lighter' },
                      }}
                    >
                      <Iconify icon="eva:close-outline" width={16} />
                    </IconButton>
                  </CustomTooltip>
                  <CustomTooltip title="View Details">
                    <IconButton
                      size="small"
                      onClick={(event) => {
                        setSelectedRequest(req);
                        viewPopover.onOpen(event);
                      }}
                      sx={{
                        border: '1.5px solid',
                        borderColor: 'divider',
                        color: 'text.secondary',
                        borderRadius: 1,
                        p: 0.4,
                        '&:hover': { bgcolor: 'action.hover' },
                      }}
                    >
                      <Iconify icon="eva:eye-outline" width={16} />
                    </IconButton>
                  </CustomTooltip>
                </Stack>
              ) : (
                <Label color="success" variant="soft" sx={{ flexShrink: 0 }}>
                  Approved
                </Label>
              )}
            </ListItem>
          ))}
          {!leaveRequests.length && (
            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              {currentYear?.id
                ? 'No leave requests found.'
                : 'Select an academic year to view leave requests.'}
            </Typography>
          )}
        </List>
      </Scrollbar>

      <Divider sx={{ my: 1.5 }} />

      <Box display="flex" justifyContent="flex-end">
        <Button
          onClick={() => setOpenViewAll(true)}
          endIcon={<ArrowForwardIosIcon sx={{ fontSize: '12px !important' }} />}
          sx={{ textTransform: 'none', color: 'text.primary', fontWeight: 600 }}
        >
          View All Requests
        </Button>
      </Box>

      <CustomDialog
        open={openViewAll}
        handleClose={() => setOpenViewAll(false)}
        title="Leave Requests"
        maxWidth="lg"
      >
        <CustomizableTable
          columns={leaveColumns}
          data={leaveRequests}
          isLoading={isLoading}
          tableId="leave-requests-table"
          isSearch={false}
          isFilter
          isPagination={false}
          wrapperProps={{ sx: { height: '60vh' }, padding: 1 }}
        />
      </CustomDialog>

      <CustomDialog
        open={isConfirmDialog.value}
        handleClose={isConfirmDialog.onFalse}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {isRejectAction ? 'Reject Leave Request' : 'Approve Leave Request'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title={
                isRejectAction
                  ? 'Remarks are required to reject the leave request.'
                  : 'Review the leave request and click Approve. Add remarks if you wish to include any additional info.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <LeaveApproveRejectForm handleClose={isConfirmDialog.onFalse} editData={selectedRequest} />
      </CustomDialog>

      <CustomPopover
        open={viewPopover.open}
        anchorEl={viewPopover.anchorEl}
        onClose={viewPopover.onClose}
        slotProps={{
          paper: { sx: { p: 0, width: 280 } },
          arrow: { placement: 'top-right' },
        }}
      >
        <LeaveDetailsPopover data={selectedRequest} />
      </CustomPopover>
    </Card>
  );
};

export default LeaveManagement;

export const LeaveDetailsPopover = ({ data }: { data: any }) => (
  <Box sx={{ p: 2 }}>
    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
      <Avatar sx={{ width: 40, height: 40 }}>{data?.name?.charAt(0)}</Avatar>
      <Box>
        <Typography variant="subtitle2" fontWeight={600}>
          {data?.name}
        </Typography>
        <Label variant="soft" color={leaveTypeColor(data?.type)} sx={{ fontSize: '0.65rem' }}>
          {data?.type}
        </Label>
      </Box>
    </Stack>

    <Divider sx={{ mb: 1.5 }} />

    <Stack spacing={1}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="caption" color="text.secondary">
          Duration
        </Typography>
        <Typography variant="caption" fontWeight={500}>
          {data?.duration}
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="caption" color="text.secondary">
          Status
        </Typography>
        <Label
          variant="soft"
          sx={{ fontSize: '0.65rem' }}
          color={
            data?.status === 'Approved'
              ? 'success'
              : data?.status === 'Rejected'
                ? 'error'
                : 'warning'
          }
        >
          {data?.status}
        </Label>
      </Box>
    </Stack>
  </Box>
);

export const LeaveApproveRejectForm = ({
  handleClose,
  editData,
}: {
  handleClose: (e?: any, isSubmit?: boolean) => void;
  editData: any;
}) => {
  const [approveLeaveRequest, { isLoading: isApproveLoading }] = useApproveLeaveRequestMutation();
  const [rejectLeaveRequest, { isLoading: isRejectLoading }] = useRejectLeaveRequestMutation();
  const { values, handleChange, errors, touched, handleSubmit } = useFormik({
    initialValues: {
      remarks: '',
    },
    validationSchema: Yup.object({
      remarks:
        editData?.type === 'reject' ? Yup.string().required('Remarks is required') : Yup.string(),
    }),
    onSubmit: async () => {
      try {
        if (editData?.type === 'reject') {
          await rejectLeaveRequest({ id: editData.id, body: { remarks: values.remarks } }).unwrap();
        } else {
          await approveLeaveRequest({
            id: editData.id,
            body: { remarks: values.remarks },
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
          label={editData?.type === 'reject' ? 'Remarks *' : 'Remarks'}
          onChange={handleChange}
          name="remarks"
          value={values.remarks}
          error={touched.remarks && !!errors.remarks}
          helperText={touched.remarks && errors.remarks}
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
          loading={isApproveLoading || isRejectLoading}
          onClick={(e: any) => handleSubmit(e)}
          size="small"
          startIcon={
            <Iconify
              icon={editData?.type === 'reject' ? GlobalIcons.reject : GlobalIcons.approvedIcon}
            />
          }
        >
          {editData?.type === 'reject' ? 'Reject' : 'Approve'}
        </LoadingButton>
      </DialogActions>
    </>
  );
};
