'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import {
  Box,
  Chip,
  Stack,
  Button,
  Divider,
  TextField,
  Typography,
  IconButton,
} from '@mui/material';
import {
  useGetExceptionWindowsQuery,
  useCreateExceptionWindowMutation,
  useDeleteExceptionWindowMutation,
} from 'src/redux/finance/collectionPolicy';

// ── options ──────────────────────────────────────────────────────────────────

const SCOPE_OPTIONS = [
  { label: 'School-wide', value: 'SchoolWide' },
  { label: 'This academic year', value: 'AcademicYear' },
  { label: 'A specific Fee Structure', value: 'FeeStructure' },
];

const EFFECT_OPTIONS = [
  { label: 'Suspend late fee accrual', value: 'SuspendLateFeeAccrual' },
  { label: 'Extend grace period', value: 'ExtendGracePeriod' },
  { label: 'Disable online collection', value: 'DisableOnlineCollection' },
  { label: 'Custom', value: 'Custom' },
];

interface ExceptionWindowsDialogProps {
  open: boolean;
  onClose: () => void;
}

const emptyForm = {
  scope: 'SchoolWide',
  scopeId: '',
  startDate: '',
  endDate: '',
  effect: 'SuspendLateFeeAccrual',
  extensionDays: '',
  reasonCode: '',
  reason: '',
};

export default function ExceptionWindowsDialog({ open, onClose }: ExceptionWindowsDialogProps) {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);

  const { data: windows, isLoading } = useGetExceptionWindowsQuery({}, { skip: !open });
  const [createWindow, { isLoading: isCreating }] = useCreateExceptionWindowMutation();
  const [deleteWindow] = useDeleteExceptionWindowMutation();

  const resetForm = () => {
    setForm(emptyForm);
    setShowForm(false);
  };

  const handleCreate = async () => {
    if (!form.startDate || !form.endDate) {
      shikshaMitraToast.error({ message: 'Start date and end date are required' });
      return;
    }
    if (!form.reason.trim()) {
      shikshaMitraToast.error({ message: 'A reason is required' });
      return;
    }
    if (form.effect === 'ExtendGracePeriod' && !form.extensionDays) {
      shikshaMitraToast.error({ message: 'Extension days is required for Extend Grace Period' });
      return;
    }
    if (form.scope !== 'SchoolWide' && !form.scopeId) {
      shikshaMitraToast.error({ message: 'Select what this window applies to' });
      return;
    }

    try {
      await createWindow({
        scope: form.scope,
        scopeId: form.scope === 'SchoolWide' ? null : form.scopeId,
        startDate: form.startDate,
        endDate: form.endDate,
        effect: form.effect,
        extensionDays: form.effect === 'ExtendGracePeriod' ? Number(form.extensionDays) : null,
        reasonCode: form.reasonCode || 'OTHER',
        reason: form.reason,
      }).unwrap();
      shikshaMitraToast.success({ message: 'Exception window created' });
      resetForm();
    } catch {
      // toast handled by RTK Query error middleware
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteWindow(id).unwrap();
      shikshaMitraToast.success({ message: 'Exception window deleted' });
    } catch {
      // toast handled by RTK Query error middleware
    }
  };

  return (
    <CustomDialog open={open} handleClose={onClose} maxWidth="sm" title="Exception Windows">
      <Box sx={{ minWidth: { sm: 520 } }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
          Suspend late-fee accrual, extend the grace period, or disable online collection for a
          defined date range — a gateway outage, natural disaster, or bank strike. Unlike Bulk
          Waiver, this prevents charging in the first place instead of forgiving what was already
          charged.
        </Typography>

        {isLoading ? (
          <Typography variant="body2" color="text.secondary">
            Loading...
          </Typography>
        ) : (
          <Stack spacing={1} sx={{ maxHeight: 260, overflowY: 'auto', mb: 2 }}>
            {(windows ?? []).length === 0 && (
              <Typography variant="caption" color="text.disabled">
                No exception windows configured.
              </Typography>
            )}
            {(windows ?? []).map((w: any) => (
              <Box
                key={w.id}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  px: 1.5,
                  py: 1,
                }}
              >
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2" fontWeight={600}>
                      {w.scope}
                    </Typography>
                    <Chip
                      label={w.effect}
                      size="small"
                      color={w.effect === 'SuspendLateFeeAccrual' ? 'error' : 'info'}
                      variant="soft"
                      sx={{ height: 18, fontSize: 10 }}
                    />
                    {w.isActive && (
                      <Chip
                        label="Active"
                        size="small"
                        color="success"
                        sx={{ height: 18, fontSize: 10 }}
                      />
                    )}
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(w.startDate).toLocaleDateString()} –{' '}
                    {new Date(w.endDate).toLocaleDateString()} · {w.reason}
                  </Typography>
                </Box>
                <IconButton size="small" color="error" onClick={() => handleDelete(w.id)}>
                  <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                </IconButton>
              </Box>
            ))}
          </Stack>
        )}

        <Divider sx={{ mb: 2 }} />

        {!showForm ? (
          <Button
            size="small"
            variant="outlined"
            startIcon={<Iconify icon="solar:add-circle-bold" width={18} />}
            onClick={() => setShowForm(true)}
          >
            New Exception Window
          </Button>
        ) : (
          <Stack spacing={1.5}>
            <CustomSelect
              label="Scope"
              options={SCOPE_OPTIONS}
              labelKey="label"
              valueKey="value"
              value={form.scope}
              onChange={(val) =>
                setForm((f) => ({
                  ...f,
                  scope: val as string,
                  scopeId: val === 'AcademicYear' ? currentYear?.id || '' : '',
                }))
              }
              size="small"
              formControlProps={{ sx: { width: '100%' } }}
            />

            {form.scope === 'FeeStructure' && (
              <TextField
                fullWidth
                size="small"
                label="Fee Structure ID"
                value={form.scopeId}
                onChange={(e) => setForm((f) => ({ ...f, scopeId: e.target.value }))}
                helperText="Paste the Fee Structure's ID"
              />
            )}

            <Stack direction="row" spacing={1.5}>
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Start Date"
                InputLabelProps={{ shrink: true }}
                value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
              />
              <TextField
                fullWidth
                size="small"
                type="date"
                label="End Date"
                InputLabelProps={{ shrink: true }}
                value={form.endDate}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
              />
            </Stack>

            <CustomSelect
              label="Effect"
              options={EFFECT_OPTIONS}
              labelKey="label"
              valueKey="value"
              value={form.effect}
              onChange={(val) => setForm((f) => ({ ...f, effect: val as string }))}
              size="small"
              formControlProps={{ sx: { width: '100%' } }}
            />

            {form.effect === 'ExtendGracePeriod' && (
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Extension Days"
                value={form.extensionDays}
                onChange={(e) => setForm((f) => ({ ...f, extensionDays: e.target.value }))}
              />
            )}

            <TextField
              fullWidth
              size="small"
              label="Reason Code"
              placeholder="e.g. GATEWAY_OUTAGE"
              value={form.reasonCode}
              onChange={(e) => setForm((f) => ({ ...f, reasonCode: e.target.value }))}
            />

            <TextField
              fullWidth
              size="small"
              multiline
              minRows={2}
              label="Reason"
              value={form.reason}
              onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
            />

            <Stack direction="row" justifyContent="flex-end" gap={1}>
              <Button size="small" onClick={resetForm}>
                Cancel
              </Button>
              <LoadingButton
                size="small"
                variant="contained"
                loading={isCreating}
                onClick={handleCreate}
              >
                Create Window
              </LoadingButton>
            </Stack>
          </Stack>
        )}
      </Box>
    </CustomDialog>
  );
}
