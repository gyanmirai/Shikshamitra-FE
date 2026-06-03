import type { RootState } from 'src/redux/store';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { motion } from 'framer-motion';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { varAlpha } from 'src/theme/styles';
import { GlobalIcons } from 'src/utils/icons';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import React, { useState, useEffect } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import { formatNumber } from 'src/utils/formate_number';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { FeeMonth } from 'src/enums/fee-collection-type';
import CustomTooltip from 'src/components/custom-tooltip';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { FeeStructureLockStatusType } from 'src/enums/finance-fee-structure-status';
import { useGetAcademicYearMonthsQuery } from 'src/redux/finance/financeFeeStructure';
import {
  Box,
  Chip,
  Grid,
  Stack,
  Button,
  Tooltip,
  Accordion,
  TextField,
  IconButton,
  Typography,
  Autocomplete,
  AccordionDetails,
  AccordionSummary,
} from '@mui/material';

import AddFeeHeadToCardDialog from './AddFeeHeadToCardDialog';
import {
  useLockClassWiseFeeStructure,
  useCreateClassWiseFeeStructure,
  useDeleteClassWiseFeeStructure,
  useUpdateClassWiseFeeStructure,
} from '../hooks/useClassWiseFeeStructureHooks';

import type { IClassWiseFeeItem, IClassWiseFeeStructureCard } from '../type';

// ---------------------------------------------------------------------------
// Validation schema
// ---------------------------------------------------------------------------
const feeStructureSchema = Yup.object({
  name: Yup.string().trim().required('Fee Structure name is required'),
  feeHeads: Yup.array().of(
    Yup.object({
      paybleMonth: Yup.string().when('isOneTime', {
        is: true,
        then: (schema) => schema.required('Payable month is required'),
        otherwise: (schema) => schema.optional().nullable(),
      }),
      amount: Yup.number()
        .transform((value) => (value === 0 || Number.isNaN(value) ? undefined : value))
        .required('Required'),
    })
  ),
});

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface IndependentFeeStructureCardProps {
  initialData: IClassWiseFeeStructureCard;
  index: number;
  onSaved?: (saved: IClassWiseFeeStructureCard) => void;
  onDeleted?: () => void;
  onDirtyChange?: (dirty: boolean) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
const IndependentFeeStructureCard: React.FC<IndependentFeeStructureCardProps> = ({
  initialData,
  index,
  onSaved,
  onDeleted,
  onDirtyChange,
}) => {
  const theme = useTheme();
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const [cardId, setCardId] = useState<string | undefined>(initialData._id);
  const [status, setStatus] = useState(initialData.status);
  const [isEditing, setIsEditing] = useState(!initialData._id);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLocking, setIsLocking] = useState(false);

  const isNew = !cardId;
  const isLocked = status === FeeStructureLockStatusType.Locked;

  const formik = useFormik({
    initialValues: {
      name: initialData.name,
      feeHeads: initialData.feeHeads.map((fh) => ({
        ...fh,
        // API returns `payableMonth`; the form field is `paybleMonth` (legacy typo) — normalise here
        paybleMonth: fh.paybleMonth ?? (fh as any).payableMonth,
        payableYear: fh.payableYear ?? (fh as any).payableYear,
      })),
    },
    validationSchema: feeStructureSchema,
    validateOnChange: true,
    validateOnBlur: true,
    onSubmit: () => {},
  });
  const addFeeHeadDialog = useBoolean();
  const deleteDlg = useBoolean();
  const lockDlg = useBoolean();

  const createStructure = useCreateClassWiseFeeStructure();
  const updateStructure = useUpdateClassWiseFeeStructure();
  const deleteStructure = useDeleteClassWiseFeeStructure();
  const lockStructure = useLockClassWiseFeeStructure();

  const {
    data: academicYearMonthsData,
    isLoading: isMonthsLoading,
    isFetching: isMonthsFetching,
  } = useGetAcademicYearMonthsQuery(
    { academicYearId: currentYear?.id },
    { skip: !currentYear?.id }
  );

  const monthOptions = [
    ...(academicYearMonthsData?.map((item: { month: number; year: number }) => ({
      label: `${FeeMonth[item.month]}-${item.year}`,
      value: `${item.month}-${item.year}`,
    })) || []),
  ];

  const totalAmount = formik.values.feeHeads.reduce((sum, fh) => sum + (fh.amount || 0), 0);

  const COLUMNS = [
    { label: '#', size: 0.5, align: 'left' },
    { label: 'Fee Head', size: 1.5, align: 'left' },
    { label: 'Amount', size: 1.3, align: 'left' },
    { label: 'One Time', size: 1.5, align: 'center' },
    { label: 'Payable Month', size: 2, align: 'left' },
    {
      label: 'Optional',
      size: 1.5,
      align: 'center',
      desc: 'This is an optional fee head, it may or may not be applicable to all students. Select applicable students accordingly when you assign fee structures.',
    },
    { label: 'Payment Term', size: 1.5, align: 'left' },
    {
      label: 'Refundable',
      size: 1.5,
      align: 'center',
      desc: 'This fees can be refunded under certain conditions.',
    },
    { label: '', size: 0.5, align: 'left' },
  ];

  const PAYMENT_TERM_OPTIONS = [
    { label: 'Monthly', value: 'monthly' },
    { label: 'Quarterly', value: 'quarterly' },
    { label: 'Yearly', value: 'yearly' },
  ];

  useEffect(() => {
    onDirtyChange?.(isEditing && (isNew || formik.dirty));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, formik.dirty, isNew]);

  const enterEdit = () => setIsEditing(true);

  const discardEdit = () => {
    formik.resetForm();
    setIsEditing(false);
  };

  const updateFeeHead = (idx: number, field: keyof IClassWiseFeeItem, value: any) => {
    const updated = formik.values.feeHeads.map((fh, i) =>
      i === idx ? { ...fh, [field]: value } : fh
    );
    formik.setFieldValue('feeHeads', updated);
  };

  const updateFeeHeadFields = (idx: number, fields: Partial<IClassWiseFeeItem>) => {
    const updated = formik.values.feeHeads.map((fh, i) => (i === idx ? { ...fh, ...fields } : fh));
    formik.setFieldValue('feeHeads', updated);
  };

  const addFeeHeads = (items: IClassWiseFeeItem[]) => {
    formik.setFieldValue('feeHeads', [...formik.values.feeHeads, ...items]);
  };

  const removeFeeHead = (idx: number) => {
    formik.setFieldValue(
      'feeHeads',
      formik.values.feeHeads.filter((_, i) => i !== idx)
    );
  };

  const getFeeHeadError = (idx: number, field: string): string | undefined => {
    const errors = formik.errors.feeHeads as any;
    const touched = formik.touched.feeHeads as any;
    return touched?.[idx]?.[field] && errors?.[idx]?.[field] ? errors[idx][field] : undefined;
  };

  const handleSave = async () => {
    formik.setTouched({
      name: true,
      feeHeads: formik.values.feeHeads.map(() => ({ paybleMonth: true, amount: true })) as any,
    });
    const errors = await formik.validateForm();
    if (Object.keys(errors).length > 0) return;

    setIsSaving(true);
    try {
      const feeHeadsPayload = formik.values.feeHeads.map((fh) => ({
        feeHeadId: fh.feeHeadId,
        amount: fh.amount,
        isOneTime: fh.isOneTime,
        isOptional: fh.isOptional,
        isRefundable: fh.isRefundable,
        ...(fh.isOneTime && fh.paybleMonth !== undefined && fh.payableYear !== undefined
          ? { payableMonth: Number(fh.paybleMonth), payableYear: Number(fh.payableYear) }
          : {}),
      }));
      if (isNew) {
        const saved = await createStructure({
          feeStructureMetaDataId: initialData.feeStructureMetaDataId,
          standardId: initialData.classId,
          name: formik.values.name,
          feeHeads: feeHeadsPayload, // sent inside standardFeeStructures by the mutation
        });
        const newId = saved._id ?? saved.id;
        setCardId(newId);
        const savedFeeHeads = (saved.feeHeads ?? formik.values.feeHeads).map((fh: any) => ({
          ...fh,
          paybleMonth: fh.paybleMonth ?? fh.payableMonth,
        }));
        formik.resetForm({
          values: {
            name: saved.name ?? formik.values.name,
            feeHeads: savedFeeHeads,
          },
        });
        setIsEditing(false);
        setIsSaving(false);
        onSaved?.({ ...initialData, ...saved, _id: newId });
        shikshaMitraToast.success({ message: 'Fee structure created successfully' });
      } else {
        const saved = await updateStructure({
          structureId: cardId!,
          classId: initialData.classId,
          body: { name: formik.values.name, feeHeads: feeHeadsPayload },
        });
        const updatedFeeHeads = (saved?.feeHeads ?? formik.values.feeHeads).map((fh: any) => ({
          ...fh,
          paybleMonth: fh.paybleMonth ?? fh.payableMonth,
        }));
        formik.resetForm({
          values: {
            name: saved?.name ?? formik.values.name,
            feeHeads: updatedFeeHeads,
          },
        });
        setIsEditing(false);
        setIsSaving(false);
        onSaved?.({ ...initialData, ...saved, _id: cardId });
        shikshaMitraToast.success({ message: 'Fee structure updated successfully' });
      }
    } catch {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (isNew) {
      onDeleted?.();
      return;
    }
    setIsDeleting(true);
    try {
      await deleteStructure({ structureId: cardId!, classId: initialData.classId });
      onDeleted?.();
      shikshaMitraToast.success({ message: 'Fee structure deleted' });
    } catch {
      setIsDeleting(false);
    }
  };

  const handleLockToggle = () => {
    if (!cardId) return;
    lockDlg.onTrue();
  };

  const handleLockConfirm = async () => {
    if (!cardId) return;
    lockDlg.onFalse();
    setIsLocking(true);
    try {
      await lockStructure({ structureId: cardId, classId: initialData.classId });
      setStatus(FeeStructureLockStatusType.Locked);
      shikshaMitraToast.success({ message: 'Fee structure locked' });
    } catch {
      // lock status unchanged
    } finally {
      setIsLocking(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
    >
      <Accordion
        elevation={0}
        defaultExpanded={isNew}
        sx={{
          border: `1px solid ${varAlpha(theme.palette.grey['500Channel'], isLocked ? 0.2 : 0.12)}`,
          borderRadius: '10px !important',
          opacity: isLocked ? 0.9 : 1,
          '&::before': { display: 'none' },
          '&.Mui-expanded': { mb: 1.5 },
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            px: 2,
            minHeight: 52,
            borderRadius: '10px',
            bgcolor: varAlpha(theme.palette.grey['500Channel'], 0.03),
            '&.Mui-expanded': {
              borderBottom: `1px solid ${varAlpha(theme.palette.grey['500Channel'], 0.08)}`,
              borderRadius: '10px 10px 0 0',
            },
            '& .MuiAccordionSummary-content': {
              alignItems: 'center',
              gap: 1.5,
              my: 0.75,
              overflow: 'visible',
            },
          }}
        >
          <Box display="flex" alignItems="center" gap={1.5} flex={1} minWidth={0} overflow="hidden">
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: 1,
                bgcolor: varAlpha(theme.palette.primary.mainChannel, 0.1),
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 12,
                flexShrink: 0,
              }}
            >
              {index + 1}
            </Box>

            {isEditing && !isLocked ? (
              <Box sx={{ overflow: 'visible', pt: '6px' }}>
                <TextField
                  size="small"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  onClick={(e) => e.stopPropagation()}
                  label="Fee Structure Name *"
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                  sx={{ maxWidth: 240 }}
                  autoFocus={isNew}
                />
              </Box>
            ) : (
              <Typography variant="subtitle2" fontWeight={700} noWrap>
                {formik.values.name || `Fee Structure ${index + 1}`}
              </Typography>
            )}

            <Chip
              label={`Total: ${formatNumber(totalAmount, 'INR')}`}
              color="success"
              size="small"
              variant="soft"
              sx={{ fontWeight: 600, borderRadius: 1, fontSize: 11, flexShrink: 0 }}
            />

            {formik.values.feeHeads.length > 0 && (
              <Chip
                label={`${formik.values.feeHeads.length} fee head${formik.values.feeHeads.length !== 1 ? 's' : ''}`}
                size="small"
                variant="soft"
                color="default"
                sx={{ fontWeight: 500, borderRadius: 1, fontSize: 11, flexShrink: 0 }}
              />
            )}

            {isLocked && (
              <Chip
                icon={<Iconify icon="mdi:lock" width={12} />}
                label="Locked"
                color="error"
                size="small"
                variant="soft"
                sx={{ fontWeight: 600, borderRadius: 1, fontSize: 11, flexShrink: 0 }}
              />
            )}
            {isLocked ? (
              <Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor: varAlpha(theme.palette.warning.mainChannel, 0.05),
                    border: `1px solid ${varAlpha(theme.palette.warning.mainChannel, 0.25)}`,
                    borderRadius: 1,
                    px: 1,
                    py: 1.2,
                    gap: 1.2,
                  }}
                >
                  <Iconify icon="mdi:lock" color={theme.palette.warning.main} width={15} />
                  <Typography variant="caption" color="warning.main" fontWeight="bold">
                    This fee structure is locked. Changes are restricted.
                  </Typography>
                </Box>
              </Box>
            ) : (
              <Box>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    bgcolor: varAlpha(theme.palette.info.mainChannel, 0.01),
                    border: `1px solid ${varAlpha(theme.palette.info.mainChannel, 0.18)}`,
                    borderRadius: 1,
                    px: 1,
                    py: 1.2,
                    gap: 1.2,
                  }}
                >
                  <Iconify
                    icon="solar:info-circle-bold"
                    color={theme.palette.info.main}
                    width={15}
                  />
                  <Typography variant="caption" color="info.main" fontWeight="bold">
                    Lock this fee structure for assigning it to students. Changes will be restricted
                    after locking.
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>

          <Box
            display="flex"
            alignItems="center"
            gap={0.7}
            flexShrink={0}
            onClick={(e) => e.stopPropagation()}
          >
            {isEditing && !isLocked && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<Iconify icon="lucide:plus" width={14} />}
                onClick={addFeeHeadDialog.onTrue}
                sx={{ fontSize: 12 }}
              >
                Fee Head
              </Button>
            )}

            {!isNew && !isLocked && !isEditing && (
              <Tooltip title="Edit Fee Structure">
                <IconButton size="small" onClick={enterEdit} sx={{ borderRadius: 1 }}>
                  <Iconify icon={GlobalIcons.edit} width={16} />
                </IconButton>
              </Tooltip>
            )}

            {isEditing && !isLocked && (
              <>
                {!isNew && (
                  <Tooltip title="Discard Changes">
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={discardEdit}
                      sx={{ borderRadius: 1 }}
                      startIcon={<Iconify icon={GlobalIcons.cancel} width={14} />}
                    >
                      Cancel
                    </Button>
                  </Tooltip>
                )}
                <LoadingButton
                  variant="contained"
                  size="small"
                  loading={isSaving}
                  startIcon={<Iconify icon={GlobalIcons.submit} width={14} />}
                  onClick={handleSave}
                  disabled={!isNew && !formik.dirty}
                  sx={{ fontSize: 12 }}
                >
                  {isNew ? 'Save' : 'Update'}
                </LoadingButton>
              </>
            )}

            <Tooltip title="Delete Fee Structure">
              <span>
                <LoadingButton
                  size="small"
                  color="error"
                  loading={isDeleting}
                  onClick={() => (isNew ? handleDelete() : deleteDlg.onTrue())}
                  disabled={isLocked}
                  sx={{
                    minWidth: 0,
                    p: 0.6,
                    borderRadius: 1,
                    '&:hover': {
                      bgcolor: varAlpha(theme.palette.error.mainChannel, 0.08),
                    },
                  }}
                >
                  <Iconify icon={GlobalIcons.delete} width={16} />
                </LoadingButton>
              </span>
            </Tooltip>

            {!isNew && (
              <Tooltip title={isLocked ? 'Cannot Unlock Fee Structure' : 'Lock Fee Structure'}>
                <span style={{ marginRight: 1 }}>
                  <LoadingButton
                    loading={isLocking}
                    onClick={handleLockToggle}
                    size="small"
                    sx={{
                      minWidth: 0,
                      p: 0.6,
                      borderRadius: '50%',
                      bgcolor: isLocked ? theme.palette.grey[500] : theme.vars.palette.success.main,
                      '&:hover': {
                        bgcolor: isLocked
                          ? theme.palette.grey[600]
                          : theme.vars.palette.success.dark,
                      },
                    }}
                    disabled={isLocked}
                  >
                    <Iconify
                      icon={isLocked ? 'mdi:lock-open-outline' : 'mdi:lock-outline'}
                      sx={{ width: 18, height: 18, color: '#fff' }}
                    />
                  </LoadingButton>
                </span>
              </Tooltip>
            )}
          </Box>
        </AccordionSummary>

        <AccordionDetails sx={{ p: 0 }}>
          {formik.values.feeHeads.length === 0 ? (
            <EmptyContent
              title="No Fee Heads Added"
              description="Click 'Fee Head' in the header to add fee heads to this structure."
              filled
              sx={{ py: 5 }}
              action={
                isEditing && !isLocked ? (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<Iconify icon="lucide:plus" />}
                    onClick={addFeeHeadDialog.onTrue}
                  >
                    Fee Head
                  </Button>
                ) : null
              }
            />
          ) : (
            <Scrollbar sx={{ maxHeight: 320, px: 2, pt: 1, pb: 1 }}>
              <Stack spacing={0.5}>
                <Grid
                  container
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    bgcolor: varAlpha(theme.palette.grey['500Channel'], 0.05),
                    borderRadius: 1,
                  }}
                >
                  {COLUMNS.map((col) => (
                    <Grid key={col.label} size={col.size as any} sx={{ textAlign: col.align }}>
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent={col.align === 'center' ? 'center' : 'flex-start'}
                        gap={0.5}
                      >
                        <Typography variant="caption" color="text.disabled" fontWeight={600}>
                          {col.label}
                        </Typography>
                        {col.desc && (
                          <CustomTooltip title={col.desc} placement="top">
                            <Iconify
                              icon="lucide:info"
                              sx={{ cursor: 'pointer', width: 16, height: 16 }}
                              color="info.main"
                            />
                          </CustomTooltip>
                        )}
                      </Box>
                    </Grid>
                  ))}
                </Grid>

                {formik.values.feeHeads.map((item, idx) => {
                  const paybleMonthError = getFeeHeadError(idx, 'paybleMonth');
                  const amountError = getFeeHeadError(idx, 'amount');
                  return (
                    <Grid
                      container
                      key={`${item.feeHeadId}-${idx}`}
                      sx={{
                        border: '1px dashed',
                        borderColor: paybleMonthError ? 'error.main' : 'text.disabled',
                        borderRadius: 1,
                        alignItems: 'center',
                        px: 1.5,
                        py: 0.5,
                        pb: paybleMonthError || amountError ? 1.5 : 0.5,
                        transition: 'border-color 0.2s, background-color 0.2s',
                        '&:hover': {
                          bgcolor: 'action.hover',
                          borderColor: paybleMonthError ? 'error.dark' : 'primary.main',
                        },
                      }}
                    >
                      <Grid size={0.5} sx={{ pt: 0.75 }}>
                        <Typography variant="body2" color="text.secondary">
                          {idx + 1}.
                        </Typography>
                      </Grid>

                      <Grid size={1.5} sx={{ pr: 1, pt: 0.75 }}>
                        <Typography variant="body2" noWrap>
                          {item.feeHeadName}
                        </Typography>
                      </Grid>

                      <Grid size={1.3} sx={{ pr: 1 }}>
                        <NumericFormatCustom
                          size="small"
                          fullWidth
                          placeholder="0.00"
                          value={item.amount || ''}
                          disabled={!isEditing || isLocked}
                          onValueChange={(values) => {
                            updateFeeHead(idx, 'amount', values.floatValue ?? 0);
                            formik.setFieldTouched(`feeHeads[${idx}].amount`, true, false);
                          }}
                          error={Boolean(amountError)}
                          helperText={amountError}
                          sx={{
                            '& .MuiInputBase-root': { height: 36 },
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
                          }}
                        />
                      </Grid>

                      <Grid size={1.5} display="flex" justifyContent="center" sx={{ pt: 0.5 }}>
                        <Box
                          component="div"
                          onClick={() => {
                            if (!isEditing || isLocked) return;
                            const newVal = !item.isOneTime;
                            updateFeeHeadFields(idx, {
                              isOneTime: newVal,
                              paybleMonth: newVal ? item.paybleMonth : undefined,
                              payableYear: newVal ? item.payableYear : undefined,
                            });
                          }}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            cursor: isEditing && !isLocked ? 'pointer' : 'default',
                            color: item.isOneTime ? 'primary.main' : 'text.disabled',
                            bgcolor: item.isOneTime
                              ? varAlpha(theme.palette.primary.mainChannel, 0.08)
                              : 'transparent',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: item.isOneTime
                              ? varAlpha(theme.palette.primary.mainChannel, 0.2)
                              : 'transparent',
                            transition: 'all 0.2s',
                          }}
                        >
                          <Iconify
                            icon={
                              item.isOneTime
                                ? 'solar:calendar-date-bold'
                                : 'solar:calendar-date-outline'
                            }
                            width={16}
                          />
                          <Typography variant="caption" fontWeight={600}>
                            One Time
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid size={2} sx={{ pr: 1, display: 'flex', flexDirection: 'column' }}>
                        <CustomSelect
                          label="Month"
                          options={monthOptions}
                          disabled={!isEditing || isLocked || !item.isOneTime}
                          isLoading={isMonthsLoading || isMonthsFetching}
                          labelKey="label"
                          valueKey="value"
                          value={
                            item.paybleMonth !== undefined && item.payableYear !== undefined
                              ? `${item.paybleMonth}-${item.payableYear}`
                              : ''
                          }
                          onChange={(value) => {
                            const [month, year] = (value as string).split('-');
                            updateFeeHeadFields(idx, {
                              paybleMonth: Number(month) as any,
                              payableYear: Number(year),
                            });
                            formik.setFieldTouched(`feeHeads[${idx}].paybleMonth`, true, false);
                          }}
                          formControlProps={{
                            error: Boolean(paybleMonthError),
                            sx: { width: '100%' },
                          }}
                          error={Boolean(paybleMonthError)}
                          helperText={paybleMonthError}
                          size="small"
                        />
                      </Grid>

                      <Grid size={1.5} display="flex" justifyContent="center" sx={{ pt: 0.5 }}>
                        <Box
                          component="div"
                          onClick={() =>
                            isEditing &&
                            !isLocked &&
                            updateFeeHead(idx, 'isOptional', !item.isOptional)
                          }
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.5,
                            cursor: isEditing && !isLocked ? 'pointer' : 'default',
                            color: item.isOptional ? 'info.main' : 'text.disabled',
                            bgcolor: item.isOptional
                              ? varAlpha(theme.palette.info.mainChannel, 0.08)
                              : 'transparent',
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                            border: '1px solid',
                            borderColor: item.isOptional
                              ? varAlpha(theme.palette.info.mainChannel, 0.2)
                              : 'transparent',
                            transition: 'all 0.2s',
                          }}
                        >
                          <Iconify
                            icon={
                              item.isOptional
                                ? 'solar:check-circle-bold'
                                : 'solar:check-circle-outline'
                            }
                            width={16}
                          />
                          <Typography variant="caption" fontWeight={600}>
                            Optional
                          </Typography>
                        </Box>
                      </Grid>

                      <Grid size={1.5}>
                        <Autocomplete
                          size="small"
                          fullWidth
                          options={PAYMENT_TERM_OPTIONS}
                          getOptionLabel={(option) => option.label}
                          isOptionEqualToValue={(option, value) => option.value === value.value}
                          value={
                            PAYMENT_TERM_OPTIONS.find(
                              (option) => option.value === item.paymentTermId
                            ) ?? null
                          }
                          onChange={(_, selectedOption) =>
                            updateFeeHead(idx, 'paymentTermId', selectedOption?.value ?? '')
                          }
                          disabled={!isEditing || isLocked}
                          clearIcon={<Iconify icon={GlobalIcons.cancel} width={16} />}
                          renderInput={(params) => <TextField {...params} />}
                        />
                      </Grid>

                      <Grid size={1.5} display="flex" justifyContent="center" sx={{ pt: 0.5 }}>
                        <CustomTooltip title="Refundable" arrow placement="top">
                          <Box
                            component="div"
                            onClick={() =>
                              isEditing &&
                              !isLocked &&
                              updateFeeHead(idx, 'isRefundable', !item.isRefundable)
                            }
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5,
                              cursor: isEditing && !isLocked ? 'pointer' : 'default',
                              color: item.isRefundable ? 'success.main' : 'text.disabled',
                              bgcolor: item.isRefundable
                                ? varAlpha(theme.palette.success.mainChannel, 0.08)
                                : 'transparent',
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              border: '1px solid',
                              borderColor: item.isRefundable
                                ? varAlpha(theme.palette.success.mainChannel, 0.2)
                                : 'transparent',
                              transition: 'all 0.2s',
                            }}
                          >
                            <Iconify
                              icon={
                                item.isRefundable
                                  ? 'solar:check-circle-bold'
                                  : 'solar:check-circle-outline'
                              }
                              width={16}
                            />
                            <Typography variant="caption" fontWeight={600}>
                              Refundable
                            </Typography>
                          </Box>
                        </CustomTooltip>
                      </Grid>

                      <Grid size={0.5} display="flex" justifyContent="flex-end" sx={{ pt: 0.25 }}>
                        {isEditing && !isLocked && (
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => removeFeeHead(idx)}
                            sx={{
                              opacity: 0.6,
                              '&:hover': {
                                opacity: 1,
                                bgcolor: varAlpha(theme.palette.error.mainChannel, 0.08),
                              },
                            }}
                          >
                            <Iconify icon={GlobalIcons.delete} width={16} />
                          </IconButton>
                        )}
                      </Grid>
                    </Grid>
                  );
                })}
              </Stack>
            </Scrollbar>
          )}
        </AccordionDetails>
      </Accordion>

      <CustomDialog
        open={addFeeHeadDialog.value}
        handleClose={addFeeHeadDialog.onFalse}
        title="Add Fee Head"
      >
        <AddFeeHeadToCardDialog
          existingFeeHeadIds={new Set(formik.values.feeHeads.map((fh) => fh.feeHeadId))}
          onAdd={(items) => addFeeHeads(items)}
          onClose={addFeeHeadDialog.onFalse}
        />
      </CustomDialog>

      <ConfirmDialog
        open={deleteDlg.value}
        icon="error"
        onClose={deleteDlg.onFalse}
        title="Delete Fee Structure"
        content={
          <>
            Are you sure you want to delete <strong>{formik.values.name}</strong>? This cannot be
            undone.
          </>
        }
        action={
          <LoadingButton
            variant="contained"
            color="error"
            size="small"
            loading={isDeleting}
            onClick={() => {
              deleteDlg.onFalse();
              handleDelete();
            }}
          >
            Delete
          </LoadingButton>
        }
      />

      <ConfirmDialog
        open={lockDlg.value}
        icon={isLocked ? 'warning' : 'info'}
        onClose={lockDlg.onFalse}
        title={isLocked ? 'Cannot Unlock Fee Structure' : 'Lock Fee Structure'}
        content={
          <>
            Are you sure you want to <strong>lock</strong> <strong>{formik.values.name}</strong>? It
            will no longer be editable until unlocked.
          </>
        }
        action={
          <LoadingButton
            variant="contained"
            color={isLocked ? 'warning' : 'success'}
            size="small"
            loading={isLocking}
            disabled={status === FeeStructureLockStatusType.Locked}
            onClick={handleLockConfirm}
          >
            Lock
          </LoadingButton>
        }
      />
    </motion.div>
  );
};

export default IndependentFeeStructureCard;
