'use client';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { varAlpha } from 'src/theme/styles';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import React, { useMemo, useEffect } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { shikshaMitraToast } from 'src/components/toast';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useGetPaymentTermByIdQuery } from 'src/redux/finance/paymentTerm';
import {
  Box,
  Chip,
  Stack,
  Alert,
  Button,
  Drawer,
  Tooltip,
  Divider,
  TextField,
  Typography,
} from '@mui/material';

import type { IInstallmentOverride, IFeeHeadPaymentTermOverride } from '../type';

// Extend dayjs with comparison plugins
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

// ---------------------------------------------------------------------------
// Validation schema
// ---------------------------------------------------------------------------
const installmentSchema = Yup.array(
  Yup.object({
    installmentName: Yup.string().trim().required('Name is required'),
    startDate: Yup.string().nullable().required('Start date is required'),
    endDate: Yup.string()
      .nullable()
      .required('End date is required')
      .test('end-after-start', 'Must be after start date', function (endDate) {
        const { startDate } = this.parent;
        if (!startDate || !endDate) return true;
        return dayjs(endDate).isAfter(dayjs(startDate));
      }),
    demandDate: Yup.string().nullable(),
    dueDate: Yup.string()
      .nullable()
      .required('Due date is required')
      .test('demand-before-due', 'Demand date must be on or before due date', function (dueDate) {
        const { demandDate } = this.parent;
        if (!demandDate || !dueDate) return true;
        return !dayjs(demandDate).isAfter(dayjs(dueDate), 'day');
      }),
  })
)
  .min(1, 'At least one installment is required')
  .test('unique-names', 'Installment names must be unique', (items) => {
    if (!items) return true;
    const names = items.map((i) => (i.installmentName ?? '').trim().toLowerCase()).filter(Boolean);
    return names.length === new Set(names).size;
  })
  .test('due-order', 'Due dates must be in chronological order', (items) => {
    if (!items || items.length < 2) return true;
    for (let i = 1; i < items.length; i += 1) {
      const prev = items[i - 1]?.dueDate;
      const curr = items[i]?.dueDate;
      if (prev && curr && !dayjs(curr).isAfter(dayjs(prev))) return false;
    }
    return true;
  });

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface PaymentTermScheduleDrawerProps {
  open: boolean;
  onClose: () => void;
  feeHeadName: string;
  paymentTermId: string;
  paymentTermName: string;
  /** Current override state for this fee head (undefined = inherited) */
  override?: IFeeHeadPaymentTermOverride;
  /** True when financial transactions exist — disables editing */
  isLocked?: boolean;
  onSave: (override: IFeeHeadPaymentTermOverride) => void;
}

// ---------------------------------------------------------------------------
// Modified row badge
// ---------------------------------------------------------------------------
const ModifiedBadge = () => (
  <Chip
    label="Modified"
    size="small"
    sx={{
      height: 18,
      fontSize: 10,
      fontWeight: 700,
      borderRadius: 0.75,
      color: 'warning.dark',
      border: '1px solid',
      borderColor: 'warning.light',
      bgcolor: (t) => varAlpha(t.palette.warning.mainChannel, 0.12),
    }}
  />
);

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------
const PaymentTermScheduleDrawer: React.FC<PaymentTermScheduleDrawerProps> = ({
  open,
  onClose,
  feeHeadName,
  paymentTermId,
  paymentTermName,
  override,
  isLocked = false,
  onSave,
}) => {
  const theme = useTheme();

  // ── Load canonical installment schedule from Payment Term detail ─────
  const { data: paymentTermDetail, isLoading: isMasterLoading } = useGetPaymentTermByIdQuery(
    paymentTermId,
    { skip: !open || !paymentTermId }
  );

  const masterInstallments: IInstallmentOverride[] = useMemo(() => {
    if (!paymentTermDetail) return [];

    const current =
      paymentTermDetail.versions?.find((v) => v.status === 'Published') ??
      paymentTermDetail.versions?.find((v) => v.id === paymentTermDetail.currentVersionId);

    return (current?.installments ?? []).map((inst, idx) => ({
      id: inst.id ?? String(idx),
      installmentName: inst.name ?? `Installment ${idx + 1}`,
      sequence: inst.sequence ?? idx + 1,
      startDate: inst.coverageStartDate ?? null,
      endDate: inst.coverageEndDate ?? null,
      demandDate: inst.demandDate ?? null,
      dueDate: inst.dueDate ?? null,
      isModified: false,
    }));
  }, [paymentTermDetail]);

  const initialInstallments: IInstallmentOverride[] = useMemo(() => {
    if (override?.isCustomized && override.installments?.length) {
      return override.installments.map((inst) => ({ ...inst, isModified: false }));
    }
    return masterInstallments;
  }, [override, masterInstallments]);

  // ── Formik ───────────────────────────────────────────────────────────────
  const formik = useFormik<{ installments: IInstallmentOverride[] }>({
    initialValues: { installments: initialInstallments },
    enableReinitialize: true,
    validationSchema: Yup.object({ installments: installmentSchema }),
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: () => {},
  });

  useEffect(() => {
    if (open) {
      formik.resetForm({ values: { installments: initialInstallments } });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initialInstallments]);

  const hasAnyChange = formik.values.installments.some((inst) => inst.isModified);

  // ── Row helpers ──────────────────────────────────────────────────────────
  const updateRow = (idx: number, field: keyof IInstallmentOverride, value: any) => {
    const updated = formik.values.installments.map((inst, i) =>
      i === idx ? { ...inst, [field]: value, isModified: true } : inst
    );
    formik.setFieldValue('installments', updated);
  };

  const getInstError = (idx: number, field: string): string | undefined => {
    const errs = formik.errors.installments;
    if (!Array.isArray(errs)) return undefined;
    const rowErr = errs[idx] as any;
    return rowErr?.[field];
  };

  const getArrayLevelError = (): string | undefined => {
    const errs = formik.errors.installments;
    return typeof errs === 'string' ? errs : undefined;
  };

  // ── Actions ──────────────────────────────────────────────────────────────
  const handleResetToMaster = () => {
    formik.resetForm({
      values: {
        installments: masterInstallments.map((inst) => ({ ...inst, isModified: false })),
      },
    });
  };

  const handleSave = async () => {
    const errors = await formik.validateForm();
    if (Object.keys(errors).length > 0) {
      formik.setTouched({
        installments: formik.values.installments.map(() => ({
          installmentName: true,
          startDate: true,
          endDate: true,
          dueDate: true,
        })) as any,
      });
      return;
    }

    const savedInstallments = formik.values.installments.map((inst) => ({
      ...inst,
      isModified: false,
    }));

    const newOverride: IFeeHeadPaymentTermOverride = {
      paymentTermId,
      paymentTermName,
      installmentCount: savedInstallments.length,
      isCustomized: true,
      isLocked,
      installments: savedInstallments,
    };

    onSave(newOverride);
    shikshaMitraToast.success({ message: 'Payment Term schedule updated successfully.' });
    onClose();
  };

  // ── Styling ──────────────────────────────────────────────────────────────
  const COL = { seq: 32, name: '26%', start: '21%', end: '21%', due: '21%' };
  const cellHeaderSx = {
    fontSize: 11,
    fontWeight: 700,
    textTransform: 'uppercase' as const,
    letterSpacing: 0.4,
    color: 'text.disabled',
  };

  // ── Render ────────────────────────────────────────────────────────────────
  if (!open) return null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', md: 'min(700px, 45vw)' },
          maxWidth: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        },
      }}
    >
      {/* ── Sticky Header ───────────────────────────────────────────────── */}
      <Box
        sx={{
          px: 3,
          py: 2,
          borderBottom: `1px solid ${varAlpha(theme.palette.grey['500Channel'], 0.12)}`,
          flexShrink: 0,
          bgcolor: 'background.paper',
        }}
      >
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
          <Stack spacing={0.5}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1.5,
                  bgcolor: varAlpha(theme.palette.primary.mainChannel, 0.12),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Iconify
                  icon="solar:calendar-date-bold"
                  width={18}
                  sx={{ color: 'primary.main' }}
                />
              </Box>
              <Typography variant="h6" fontWeight={700}>
                Payment Term Schedule
              </Typography>
            </Stack>

            <Stack spacing={0.3} sx={{ pl: 5 }}>
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <Typography
                  variant="caption"
                  color="text.disabled"
                  fontWeight={600}
                  sx={{ minWidth: 90 }}
                >
                  Fee Head
                </Typography>
                <Typography variant="caption" fontWeight={700} color="text.primary">
                  {feeHeadName}
                </Typography>
              </Stack>
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <Typography
                  variant="caption"
                  color="text.disabled"
                  fontWeight={600}
                  sx={{ minWidth: 90 }}
                >
                  Payment Term
                </Typography>
                <Typography variant="caption" fontWeight={700} color="text.primary">
                  {paymentTermName}
                </Typography>
                <Chip
                  label={`${formik.values.installments.length} Installments`}
                  size="small"
                  variant="soft"
                  color="primary"
                  sx={{ height: 18, fontSize: 10, fontWeight: 600, borderRadius: 0.75 }}
                />
              </Stack>
            </Stack>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            {override?.isCustomized && (
              <Chip
                label="Customized"
                size="small"
                variant="soft"
                color="warning"
                sx={{ height: 20, fontSize: 10, fontWeight: 700 }}
              />
            )}
            <Button
              size="small"
              onClick={onClose}
              startIcon={<Iconify icon="mdi:close" />}
              color="inherit"
            >
              Close
            </Button>
          </Stack>
        </Stack>
      </Box>

      {/* ── Lock Banner ─────────────────────────────────────────────────── */}
      {isLocked && (
        <Box
          sx={{
            px: 3,
            py: 1.25,
            display: 'flex',
            alignItems: 'center',
            gap: 1.5,
            bgcolor: varAlpha(theme.palette.error.mainChannel, 0.05),
            borderBottom: `1px solid ${varAlpha(theme.palette.error.mainChannel, 0.15)}`,
            flexShrink: 0,
          }}
        >
          <Iconify icon="solar:lock-bold" width={18} sx={{ color: 'error.main', flexShrink: 0 }} />
          <Typography variant="caption" color="error.main" fontWeight={600}>
            This Payment Term schedule cannot be edited because financial transactions already exist
            for this Fee Head.
          </Typography>
        </Box>
      )}

      {/* ── Scrollable Body ─────────────────────────────────────────────── */}
      <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
        <Box sx={{ p: 2, pb: 5 }}>
          {/* Array-level validation errors */}
          {getArrayLevelError() && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 1.5 }}>
              {getArrayLevelError()}
            </Alert>
          )}

          {/* ── Sticky Table Header ─────────────────────────────────────── */}
          <Box
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: 2,
              bgcolor: varAlpha(theme.palette.grey['500Channel'], 0.04),
              border: `1px solid ${varAlpha(theme.palette.grey['500Channel'], 0.1)}`,
              borderRadius: '8px 8px 0 0',
              px: 2,
              py: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <Box sx={{ width: COL.seq, flexShrink: 0 }} />
            <Typography sx={{ ...cellHeaderSx, width: COL.name, flexShrink: 0 }}>
              Installment Name
            </Typography>
            <Typography sx={{ ...cellHeaderSx, width: COL.start, flexShrink: 0 }}>
              Start Date
            </Typography>
            <Typography sx={{ ...cellHeaderSx, width: COL.end, flexShrink: 0 }}>
              End Date
            </Typography>
            <Typography sx={{ ...cellHeaderSx, width: COL.due, flexShrink: 0 }}>
              Due Date
            </Typography>
            <Box sx={{ flex: 1 }} />
          </Box>

          {/* ── Table Rows ─────────────────────────────────────────────── */}
          {isMasterLoading ? (
            <Box
              sx={{
                border: `1px solid ${varAlpha(theme.palette.grey['500Channel'], 0.1)}`,
                borderTop: 'none',
                borderRadius: '0 0 8px 8px',
                p: 5,
                textAlign: 'center',
              }}
            >
              <Typography variant="body2" color="text.disabled">
                Loading installment schedule…
              </Typography>
            </Box>
          ) : formik.values.installments.length === 0 ? (
            <Box
              sx={{
                border: `1px solid ${varAlpha(theme.palette.grey['500Channel'], 0.1)}`,
                borderTop: 'none',
                borderRadius: '0 0 8px 8px',
                p: 5,
                textAlign: 'center',
              }}
            >
              <Iconify
                icon="solar:calendar-bold-duotone"
                width={40}
                sx={{ color: 'text.disabled', mb: 1 }}
              />
              <Typography variant="body2" color="text.disabled">
                No installments found for this Payment Term.
              </Typography>
            </Box>
          ) : (
            <Stack
              divider={
                <Divider sx={{ borderColor: varAlpha(theme.palette.grey['500Channel'], 0.08) }} />
              }
              sx={{
                border: `1px solid ${varAlpha(theme.palette.grey['500Channel'], 0.1)}`,
                borderTop: 'none',
                borderRadius: '0 0 8px 8px',
                overflow: 'hidden',
              }}
            >
              {formik.values.installments.map((inst, idx) => {
                const nameErr = getInstError(idx, 'installmentName');
                const startErr = getInstError(idx, 'startDate');
                const endErr = getInstError(idx, 'endDate');
                const dueErr = getInstError(idx, 'dueDate');
                const rowBg = inst.isModified
                  ? varAlpha(theme.palette.warning.mainChannel, 0.05)
                  : 'transparent';

                return (
                  <Box
                    key={inst.id ?? idx}
                    sx={{
                      px: 2,
                      pt: 1.5,
                      pb: 1.5,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1,
                      bgcolor: rowBg,
                      transition: 'background-color 0.2s',
                      position: 'relative',
                    }}
                  >
                    {/* Modified left accent bar */}
                    {inst.isModified && (
                      <Box
                        sx={{
                          position: 'absolute',
                          left: 0,
                          top: 0,
                          bottom: 0,
                          width: 3,
                          bgcolor: 'warning.main',
                          borderRadius: '0 2px 2px 0',
                        }}
                      />
                    )}

                    {/* Sequence badge */}
                    <Box
                      sx={{
                        width: COL.seq,
                        height: 22,
                        borderRadius: '50%',
                        bgcolor: varAlpha(theme.palette.primary.mainChannel, 0.1),
                        color: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        fontWeight: 700,
                        flexShrink: 0,
                        mt: 0.7,
                      }}
                    >
                      {idx + 1}
                    </Box>

                    {/* Installment Name */}
                    <Box sx={{ width: COL.name, flexShrink: 0 }}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Name *"
                        value={inst.installmentName}
                        disabled={isLocked}
                        onChange={(e) => updateRow(idx, 'installmentName', e.target.value)}
                        onBlur={() =>
                          formik.setFieldTouched(`installments[${idx}].installmentName`, true)
                        }
                        error={Boolean(nameErr)}
                        helperText={nameErr}
                        sx={{
                          '& .MuiOutlinedInput-root': { borderRadius: 1.5 },
                          '& .MuiFormHelperText-root': { mx: 0 },
                        }}
                      />
                    </Box>

                    {/* Start Date */}
                    <Box sx={{ width: COL.start, flexShrink: 0 }}>
                      <DatePicker
                        label="Start Date *"
                        format="DD/MM/YYYY"
                        value={inst.startDate ? dayjs(inst.startDate) : null}
                        disabled={isLocked}
                        onChange={(d) => updateRow(idx, 'startDate', d ? d.toISOString() : null)}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: 'small',
                            error: Boolean(startErr),
                            helperText: startErr,
                            onBlur: () =>
                              formik.setFieldTouched(`installments[${idx}].startDate`, true),
                            sx: {
                              '& .MuiOutlinedInput-root': { borderRadius: 1.5 },
                              '& .MuiFormHelperText-root': { mx: 0 },
                            },
                          },
                        }}
                      />
                    </Box>

                    {/* End Date */}
                    <Box sx={{ width: COL.end, flexShrink: 0 }}>
                      <DatePicker
                        label="End Date *"
                        format="DD/MM/YYYY"
                        value={inst.endDate ? dayjs(inst.endDate) : null}
                        disabled={isLocked}
                        minDate={inst.startDate ? dayjs(inst.startDate) : undefined}
                        onChange={(d) => updateRow(idx, 'endDate', d ? d.toISOString() : null)}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: 'small',
                            error: Boolean(endErr),
                            helperText: endErr,
                            onBlur: () =>
                              formik.setFieldTouched(`installments[${idx}].endDate`, true),
                            sx: {
                              '& .MuiOutlinedInput-root': { borderRadius: 1.5 },
                              '& .MuiFormHelperText-root': { mx: 0 },
                            },
                          },
                        }}
                      />
                    </Box>

                    {/* Due Date */}
                    <Box sx={{ width: COL.due, flexShrink: 0 }}>
                      <DatePicker
                        label="Due Date *"
                        format="DD/MM/YYYY"
                        value={inst.dueDate ? dayjs(inst.dueDate) : null}
                        disabled={isLocked}
                        onChange={(d) => updateRow(idx, 'dueDate', d ? d.toISOString() : null)}
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: 'small',
                            error: Boolean(dueErr),
                            helperText: dueErr,
                            onBlur: () =>
                              formik.setFieldTouched(`installments[${idx}].dueDate`, true),
                            sx: {
                              '& .MuiOutlinedInput-root': { borderRadius: 1.5 },
                              '& .MuiFormHelperText-root': { mx: 0 },
                            },
                          },
                        }}
                      />
                    </Box>

                    {/* Modified badge */}
                    <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', pt: 0.8 }}>
                      {inst.isModified && <ModifiedBadge />}
                    </Box>
                  </Box>
                );
              })}
            </Stack>
          )}

          {/* Locked info box */}
          {isLocked && (
            <Box
              sx={{
                mt: 2,
                p: 2,
                borderRadius: 1.5,
                bgcolor: varAlpha(theme.palette.error.mainChannel, 0.04),
                border: `1px solid ${varAlpha(theme.palette.error.mainChannel, 0.12)}`,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
              }}
            >
              <Iconify
                icon="solar:lock-bold"
                width={16}
                sx={{ color: 'error.main', flexShrink: 0, mt: 0.1 }}
              />
              <Typography variant="caption" color="error.main" fontWeight={500}>
                Schedule is read-only. Financial transactions (Demand Generated, Payment Received,
                Receipt Generated, Refund Processed, or Concession Applied) already exist for this
                Fee Head.
              </Typography>
            </Box>
          )}
        </Box>
      </Scrollbar>

      {/* ── Sticky Footer ───────────────────────────────────────────────── */}
      <Box
        sx={{
          px: 3,
          py: 2,
          borderTop: `1px solid ${varAlpha(theme.palette.grey['500Channel'], 0.12)}`,
          bgcolor: 'background.paper',
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Typography variant="caption" color="text.disabled">
          {hasAnyChange
            ? 'Unsaved changes — review dates before saving.'
            : 'Edit any cell to customise this schedule.'}
        </Typography>

        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            onClick={onClose}
            sx={{ borderRadius: 1.5 }}
          >
            Cancel
          </Button>

          <Tooltip title="Restore the original installment schedule from the master Payment Term">
            <span>
              <Button
                size="small"
                variant="outlined"
                color="warning"
                startIcon={<Iconify icon="ix:reset" width={14} />}
                onClick={handleResetToMaster}
                disabled={isLocked || isMasterLoading}
                sx={{ borderRadius: 1.5 }}
              >
                Reset to Master
              </Button>
            </span>
          </Tooltip>

          <Tooltip title={!hasAnyChange ? 'No changes to save' : ''}>
            <span>
              <LoadingButton
                size="small"
                variant="contained"
                color="primary"
                startIcon={<Iconify icon="material-symbols-light:save" width={16} />}
                onClick={handleSave}
                disabled={isLocked || !hasAnyChange}
                sx={{ borderRadius: 1.5 }}
              >
                Save Changes
              </LoadingButton>
            </span>
          </Tooltip>
        </Stack>
      </Box>
    </Drawer>
  );
};

export default PaymentTermScheduleDrawer;
