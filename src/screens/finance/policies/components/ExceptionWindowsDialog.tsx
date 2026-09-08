'use client';

import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Box,
  Stack,
  Paper,
  Button,
  Divider,
  Tooltip,
  TextField,
  Typography,
  IconButton,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
  useGetExceptionWindowsQuery,
  useCreateExceptionWindowMutation,
  useDeleteExceptionWindowMutation,
} from 'src/redux/finance/collectionPolicy';

// ── options ──────────────────────────────────────────────────────────────────

const SCOPE_OPTIONS = [
  { label: 'School-wide (All Students & Structures)', value: 'SchoolWide' },
  { label: 'This Academic Year', value: 'AcademicYear' },
  { label: 'Specific Fee Structure', value: 'FeeStructure' },
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
      shikshaMitraToast.error({ message: 'Start date and end date are required.' });
      return;
    }
    if (!form.reason.trim()) {
      shikshaMitraToast.error({ message: 'A reason is required.' });
      return;
    }
    if (form.effect === 'ExtendGracePeriod' && !form.extensionDays) {
      shikshaMitraToast.error({ message: 'Extension days is required for Extend Grace Period.' });
      return;
    }
    if (form.scope !== 'SchoolWide' && !form.scopeId) {
      shikshaMitraToast.error({ message: 'Select what this window applies to.' });
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
      shikshaMitraToast.success({ message: 'Exception window created successfully.' });
      resetForm();
    } catch {
      // toast handled by middleware
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteWindow(id).unwrap();
      shikshaMitraToast.success({ message: 'Exception window deleted successfully.' });
    } catch {
      // toast handled by middleware
    }
  };

  return (
    <CustomDialog
      open={open}
      handleClose={onClose}
      maxWidth="md"
      title={
        <Stack direction="row" spacing={1} alignItems="center">
          <Iconify icon="solar:calendar-mark-bold" width={22} height={22} color="primary.main" />
          <Typography variant="h6" fontWeight={700}>
            Exception Windows
          </Typography>
        </Stack>
      }
    >
      <DialogScrollContent>
        <Box sx={{ p: 2.5 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Suspend late fee accruals, extend grace periods, or disable online payment collections during special events (e.g. natural disasters, banking strikes, or gateway maintenance).
          </Typography>

          {isLoading ? (
            <Stack alignItems="center" sx={{ py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                Loading exception windows...
              </Typography>
            </Stack>
          ) : (
            <Stack spacing={1.25} sx={{ maxHeight: 300, overflowY: 'auto', mb: 2.5, pr: 0.5 }}>
              {(windows ?? []).length === 0 && (
                <Paper
                  variant="outlined"
                  sx={{
                    p: 3,
                    textAlign: 'center',
                    borderStyle: 'dashed',
                    borderRadius: 1.5,
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    No active or upcoming exception windows configured.
                  </Typography>
                </Paper>
              )}
              {(windows ?? []).map((w: any) => {
                const startFormatted = dayjs(w.startDate).format('DD-MM-YYYY');
                const endFormatted = dayjs(w.endDate).format('DD-MM-YYYY');

                return (
                  <Paper
                    key={w.id}
                    variant="outlined"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      borderRadius: 1.5,
                      p: 1.5,
                      bgcolor: (theme) => alpha(theme.palette.background.paper, 0.95),
                      borderColor: 'divider',
                    }}
                  >
                    <Box sx={{ minWidth: 0 }}>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                        <Typography variant="subtitle2" fontWeight={700}>
                          {w.scope}
                        </Typography>
                        <Label
                          color={w.effect === 'SuspendLateFeeAccrual' ? 'error' : 'info'}
                          sx={{ height: 20, fontSize: '0.65rem' }}
                        >
                          {w.effect}
                        </Label>
                        {w.isActive && (
                          <Label color="success" sx={{ height: 20, fontSize: '0.65rem' }}>
                            Active Now
                          </Label>
                        )}
                      </Stack>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.25 }}>
                        {startFormatted} – {endFormatted} · {w.reason}
                      </Typography>
                    </Box>

                    <Tooltip title="Delete exception window">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleDelete(w.id)}
                        sx={{
                          ml: 1,
                          '&:hover': { bgcolor: (theme) => alpha(theme.palette.error.main, 0.1) },
                        }}
                      >
                        <Iconify icon={GlobalIcons.delete} width={18} height={18} />
                      </IconButton>
                    </Tooltip>
                  </Paper>
                );
              })}
            </Stack>
          )}

          <Divider sx={{ my: 2 }} />

          {!showForm ? (
            <Button
              size="small"
              variant="contained"
              startIcon={<Iconify icon={GlobalIcons.addIcon} />}
              onClick={() => setShowForm(true)}
            >
              New Exception Window
            </Button>
          ) : (
            <Paper
              variant="outlined"
              sx={{
                p: 2.25,
                borderRadius: 1.5,
                bgcolor: (theme) => alpha(theme.palette.background.default, 0.5),
              }}
            >
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5 }}>
                Create New Exception Window
              </Typography>

              <Stack spacing={2}>
                <CustomSelect
                  label="Applicable Scope"
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
                  formControlProps={{ sx: { width: '100%' } }}
                />

                {form.scope === 'FeeStructure' && (
                  <TextField
                    fullWidth
                    size="small"
                    label="Fee Structure ID *"
                    placeholder="Enter Fee Structure GUID"
                    value={form.scopeId}
                    onChange={(e) => setForm((f) => ({ ...f, scopeId: e.target.value }))}
                  />
                )}

                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="Start Date *"
                    slotProps={{ inputLabel: { shrink: true } }}
                    value={form.startDate}
                    onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    type="date"
                    label="End Date *"
                    slotProps={{ inputLabel: { shrink: true } }}
                    value={form.endDate}
                    onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                  />
                </Stack>

                <CustomSelect
                  label="Exception Effect"
                  options={EFFECT_OPTIONS}
                  labelKey="label"
                  valueKey="value"
                  value={form.effect}
                  onChange={(val) => setForm((f) => ({ ...f, effect: val as string }))}
                  formControlProps={{ sx: { width: '100%' } }}
                />

                {form.effect === 'ExtendGracePeriod' && (
                  <TextField
                    fullWidth
                    size="small"
                    type="number"
                    label="Grace Extension Days *"
                    placeholder="e.g. 5"
                    value={form.extensionDays}
                    onChange={(e) => setForm((f) => ({ ...f, extensionDays: e.target.value }))}
                  />
                )}

                <TextField
                  fullWidth
                  size="small"
                  label="Reason Code"
                  placeholder="e.g. GATEWAY_OUTAGE, FLOOD_ALERT"
                  value={form.reasonCode}
                  onChange={(e) => setForm((f) => ({ ...f, reasonCode: e.target.value }))}
                />

                <TextField
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  label="Reason / Remarks *"
                  placeholder="Explain why this exception is granted..."
                  value={form.reason}
                  onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                />

                <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ mt: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Iconify icon={GlobalIcons.cancel} />}
                    onClick={resetForm}
                  >
                    Cancel
                  </Button>
                  <LoadingButton
                    size="small"
                    variant="contained"
                    loading={isCreating}
                    startIcon={<Iconify icon={GlobalIcons.submit} />}
                    onClick={handleCreate}
                  >
                    Create Window
                  </LoadingButton>
                </Stack>
              </Stack>
            </Paper>
          )}
        </Box>
      </DialogScrollContent>
    </CustomDialog>
  );
}
