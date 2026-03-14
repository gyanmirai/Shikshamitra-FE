'use client';

import type { LabelColor } from 'src/components/label';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import CustomTooltip from 'src/components/custom-tooltip';
import CustomizableTable from 'src/components/customizabaleTable';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
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
  percentage,
  color,
}: {
  title: string;
  count: number;
  percentage: number;
  color: string;
}) => (
  <Card
    variant="outlined"
    sx={{
      height: '100%',
      borderRadius: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
    }}
  >
    <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Box sx={{ width: 4, height: 24, bgcolor: color, borderRadius: 1 }} />
        <Box>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="body2" fontWeight="bold">
            {count}
          </Typography>
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

// -----------------------------------------------------------------------

const requests = [
  {
    id: 1,
    name: 'Kanwar Rajan',
    type: 'Sick Leave',
    duration: '2 Days',
    avatar: '',
    pending: true,
    status: 'Pending',
  },
  {
    id: 2,
    name: 'Kumar Rajes',
    type: 'Casual Leave',
    duration: '1 Day',
    avatar: '',
    pending: true,
    status: 'Pending',
  },
  {
    id: 3,
    name: 'Jinjala Dharmik',
    type: 'Paid Leave',
    duration: '3 Days',
    avatar: '',
    pending: true,
    status: 'Pending',
  },
  {
    id: 4,
    name: 'Priya Sharma',
    type: 'Sick Leave',
    duration: '1 Day',
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

  const leaveColumns: any[] = [
    { id: 'name', label: 'Employee Name', align: 'left' },
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
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Typography variant="h6" fontWeight="bold">
            Leave Management
          </Typography>
          <CustomTooltip title="Manage and track employee leave requests" placement="top">
            <IconButton size="small" sx={{ p: 0 }}>
              <Iconify icon="solar:info-circle-linear" width={18} sx={{ color: 'text.disabled' }} />
            </IconButton>
          </CustomTooltip>
        </Stack>
        <Stack direction="row" spacing={1}>
          <Label color="warning">Pending : 5</Label>
          <Label color="success">Approved : 12</Label>
        </Stack>
      </Stack>

      {/* Summary Cards */}
      <Grid container spacing={1} mb={1}>
        <Grid size={{ xs: 12, md: 4 }}>
          <LeaveCard title="Sick Leave" count={12} percentage={52.2} color="#D81B60" />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <LeaveCard title="Casual Leave" count={8} percentage={34.8} color="#1E88E5" />
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <LeaveCard title="Paid Leave" count={3} percentage={13.0} color="#43A047" />
        </Grid>
      </Grid>

      {/* Recent Requests */}
      <Typography variant="subtitle2" fontWeight={700} mb={1}>
        Recent Requests
      </Typography>

      <Scrollbar sx={{ flexGrow: 1, maxHeight: 320 }}>
        <List disablePadding>
          {requests.map((req) => (
            <ListItem
              key={req.id}
              disableGutters
              sx={{
                py: 1,
                px: 1.5,
                mb: 1,
                borderRadius: 1.5,
                bgcolor: 'background.neutral',
                alignItems: 'flex-start',
              }}
            >
              <ListItemAvatar>
                <Avatar sx={{ width: 36, height: 36, fontSize: '0.875rem' }}>
                  {req.name.charAt(0)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="body2" fontWeight={600}>
                      {req.name}
                    </Typography>
                    <Label
                      color={leaveTypeColor(req.type)}
                      variant="soft"
                      sx={{ fontSize: '0.65rem' }}
                    >
                      {req.type}
                    </Label>
                  </Stack>
                }
                secondary={
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    Duration: {req.duration}
                  </Typography>
                }
              />
              {/* Quick Actions */}
              {req.pending ? (
                <Stack direction="row" spacing={1} sx={{ ml: 1, flexShrink: 0 }}>
                  <CustomTooltip title="Approve">
                    <IconButton
                      size="small"
                      color="success"
                      onClick={() => {
                        setIsRejectAction(false);
                        setSelectedRequest({ ...req, type: 'approve' });
                        isConfirmDialog.onTrue();
                      }}
                    >
                      <Iconify icon="eva:checkmark-outline" width={20} />
                    </IconButton>
                  </CustomTooltip>
                  <CustomTooltip title="Reject">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        setIsRejectAction(true);
                        setSelectedRequest({ ...req, type: 'reject' });
                        isConfirmDialog.onTrue();
                      }}
                    >
                      <Iconify icon="eva:close-outline" width={20} />
                    </IconButton>
                  </CustomTooltip>
                  <CustomTooltip title="View Details">
                    <IconButton
                      size="small"
                      color="default"
                      onClick={(event) => {
                        setSelectedRequest(req);
                        viewPopover.onOpen(event);
                      }}
                    >
                      <Iconify icon="eva:eye-outline" width={20} />
                    </IconButton>
                  </CustomTooltip>
                </Stack>
              ) : (
                <Label color="success" variant="soft" sx={{ ml: 1, flexShrink: 0 }}>
                  Approved
                </Label>
              )}
            </ListItem>
          ))}
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
          data={requests}
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
        // TODO: Add API call for approve/reject
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
          loading={false}
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
