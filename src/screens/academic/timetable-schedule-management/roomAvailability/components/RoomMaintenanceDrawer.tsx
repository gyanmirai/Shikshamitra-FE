'use client';

import dayjs from 'dayjs';
import { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { AcademicDateTimePicker as DateTimePicker } from 'src/components/academic-date-picker';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import {
  Box,
  Alert,
  Stack,
  Drawer,
  Button,
  Divider,
  TextField,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material';

import { useCreateMaintenanceBlock } from '../roomAvailability.hooks';
import { TEACHER_OPTIONS, MAINTENANCE_SEVERITY_OPTIONS } from '../roomAvailability.constants';

import type { MaintenanceBlock, RoomAvailabilityItem } from '../types';

interface RoomMaintenanceDrawerProps {
  open: boolean;
  room?: RoomAvailabilityItem | null;
  onClose: () => void;
  onSuccess?: (block: MaintenanceBlock) => void;
}

const defaultForm: MaintenanceBlock = {
  roomId: '',
  title: '',
  reason: '',
  severity: 'medium',
  startDateTime: `${dayjs().format('YYYY-MM-DD')}T09:00`,
  endDateTime: `${dayjs().format('YYYY-MM-DD')}T17:00`,
  assignedStaff: '',
  expectedCompletion: '',
  remarks: '',
};

export const RoomMaintenanceDrawer = ({
  open,
  room,
  onClose,
  onSuccess,
}: RoomMaintenanceDrawerProps) => {
  const [form, setForm] = useState<MaintenanceBlock>({
    ...defaultForm,
    roomId: room?.roomId || '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof MaintenanceBlock, string>>>({});

  const { isLoading, create } = useCreateMaintenanceBlock();

  const patch = (updates: Partial<MaintenanceBlock>) => setForm((f) => ({ ...f, ...updates }));

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.title) e.title = 'Title is required.';
    if (!form.reason) e.reason = 'Reason is required.';
    if (!form.startDateTime) e.startDateTime = 'Start date/time is required.';
    if (!form.endDateTime) e.endDateTime = 'End date/time is required.';
    if (form.endDateTime <= form.startDateTime) e.endDateTime = 'End must be after start.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    const payload: MaintenanceBlock = {
      ...form,
      roomId: room?.roomId || form.roomId,
      roomName: room?.roomName,
    };
    const result = await create(payload);
    if (result) {
      shikshaMitraToast.success({
        message: `Maintenance block created for ${room?.roomName || 'room'}.`,
      });
      onSuccess?.(result);
      handleClose();
    }
  };

  const handleClose = () => {
    setForm({ ...defaultForm });
    setErrors({});
    onClose();
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: { width: { xs: '100%', sm: 480 }, display: 'flex', flexDirection: 'column' },
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 2.5, py: 2, borderBottom: 1, borderColor: 'divider' }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <Iconify icon="mdi:wrench" width={22} color="warning.main" />
          <Box>
            <Typography variant="h6">Mark Maintenance</Typography>
            {room && (
              <Typography variant="caption" color="text.secondary">
                {room.roomName} · {room.buildingName}
              </Typography>
            )}
          </Box>
        </Stack>
        <IconButton onClick={handleClose}>
          <Iconify icon="mdi:close" />
        </IconButton>
      </Stack>

      {/* Body */}
      <Box sx={{ flex: 1, overflow: 'auto', px: 2.5, py: 2 }}>
        <Stack spacing={1}>
          <Alert severity="warning" icon={<Iconify icon="mdi:alert" />}>
            Maintenance will block all reservations for the selected period. Affected reservations
            will be notified.
          </Alert>

          <TextField
            size="small"
            label="Maintenance Title *"
            value={form.title}
            onChange={(e) => patch({ title: e.target.value })}
            fullWidth
            error={!!errors.title}
            helperText={errors.title}
            placeholder="e.g. Sound system overhaul"
          />

          <TextField
            size="small"
            label="Reason *"
            value={form.reason}
            onChange={(e) => patch({ reason: e.target.value })}
            fullWidth
            multiline
            rows={2}
            error={!!errors.reason}
            helperText={errors.reason}
          />

          <CustomSelect
            label="Severity"
            options={MAINTENANCE_SEVERITY_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
            value={form.severity}
            onChange={(v) => patch({ severity: v as any })}
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <DateTimePicker
              label="Start Date & Time *"
              value={dayjs(form.startDateTime)}
              onChange={(v) => {
                if (v) patch({ startDateTime: v.format('YYYY-MM-DDTHH:mm') });
              }}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  error: !!errors.startDateTime,
                  helperText: errors.startDateTime,
                },
              }}
            />
            <DateTimePicker
              label="End Date & Time *"
              value={dayjs(form.endDateTime)}
              onChange={(v) => {
                if (v) patch({ endDateTime: v.format('YYYY-MM-DDTHH:mm') });
              }}
              slotProps={{
                textField: {
                  size: 'small',
                  fullWidth: true,
                  error: !!errors.endDateTime,
                  helperText: errors.endDateTime,
                },
              }}
            />
          </Stack>

          <CustomSelect
            label="Assigned Staff"
            options={[{ value: '', label: '— Select —' }, ...TEACHER_OPTIONS]}
            value={form.assignedStaff || ''}
            onChange={(v) => patch({ assignedStaff: v as string })}
          />

          <TextField
            size="small"
            label="Remarks"
            value={form.remarks || ''}
            onChange={(e) => patch({ remarks: e.target.value })}
            fullWidth
            multiline
            rows={2}
            placeholder="Additional notes for maintenance staff"
          />

          <Box
            sx={{
              p: 1.5,
              borderRadius: 1,
              border: '1px dashed',
              borderColor: 'grey.400',
              bgcolor: 'grey.50',
            }}
          >
            <Typography variant="caption" color="text.secondary">
              Attachment support (work order PDF / image) coming soon.
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* Footer */}
      <Divider />
      <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ px: 2.5, py: 2 }}>
        <Button variant="outlined" color="inherit" onClick={handleClose}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="warning"
          startIcon={
            isLoading ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <Iconify icon="mdi:wrench" />
            )
          }
          onClick={handleSubmit}
          disabled={isLoading}
        >
          Create Maintenance Block
        </Button>
      </Stack>
    </Drawer>
  );
};
