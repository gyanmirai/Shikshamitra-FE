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
  Stack,
  Tooltip,
  Divider,
  Accordion,
  TextField,
  IconButton,
  Typography,
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
  feeHeads: Yup.array()
    .of(
      Yup.object({
        isOptional: Yup.boolean().optional(),
        isOneTime: Yup.boolean().optional(),
        paybleMonth: Yup.string().when(['isOneTime'], {
          is: (isOneTime: boolean) => isOneTime,
          then: (schema) => schema.required('Payable month is required'),
          otherwise: (schema) => schema.optional().nullable(),
        }),
        amount: Yup.number()
          .transform((value) => (value === 0 || Number.isNaN(value) ? undefined : value))
          .required('Required'),
      })
    )
    .min(1, 'At least one fee head is required'),
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
  const [submitAttempted, setSubmitAttempted] = useState(false);

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
        isOptional: fh.isOptional ?? false,
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

  useEffect(() => {
    onDirtyChange?.(isEditing && (isNew || formik.dirty));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, formik.dirty, isNew]);

  const enterEdit = () => setIsEditing(true);

  const discardEdit = () => {
    formik.resetForm();
    setSubmitAttempted(false);
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
    if (!errors?.[idx]?.[field]) return undefined;
    if (submitAttempted) return errors[idx][field];
    const touched = formik.touched.feeHeads as any;
    return touched?.[idx]?.[field] ? errors[idx][field] : undefined;
  };

  const handleSave = async () => {
    setSubmitAttempted(true);
    formik.setTouched({
      name: true,
      feeHeads: formik.values.feeHeads.map(() => ({ paybleMonth: true, amount: true })) as any,
    });
    // Ensure feeHeads array is touched to trigger min validation error when empty
    formik.setFieldTouched('feeHeads', true, false);
    const errors = await formik.validateForm();
    if (Object.keys(errors).length > 0) return;

    setIsSaving(true);
    try {
      const feeHeadsPayload = formik.values.feeHeads.map((fh) => ({
        feeHeadId: fh.feeHeadId,
        amount: fh.amount,
        isOneTime: fh.isOneTime,
        isOptional: fh.isOptional,
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
          isOptional: fh.isOptional ?? false,
        }));
        formik.resetForm({
          values: {
            name: saved.name ?? formik.values.name,
            feeHeads: savedFeeHeads,
          },
        });
        setIsEditing(false);
        setIsSaving(false);
        setSubmitAttempted(false);
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
          isOptional: fh.isOptional ?? false,
        }));
        formik.resetForm({
          values: {
            name: saved?.name ?? formik.values.name,
            feeHeads: updatedFeeHeads,
          },
        });
        setIsEditing(false);
        setIsSaving(false);
        setSubmitAttempted(false);
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

  // ── Column definitions for the fee heads table ─────────────────────────────
  // widths as flex proportions (total ≈ 12 units)
  const COL_WIDTHS = {
    serial: 36, // #
    feeHead: '22%', // Fee Head
    category: '17%', // Category
    amount: '14%', // Amount
    type: '13%', // Type (Recurring / One-Time toggle)
    optional: '13%', // Optional/Compulsory toggle
    actions: 40, // remove button
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
        {/* ── Accordion Header ─────────────────────────────────────────────── */}
        <AccordionSummary
          component="div"
          expandIcon={<ExpandMoreIcon />}
          sx={{
            px: 2,
            minHeight: 56,
            borderRadius: '10px',
            bgcolor: varAlpha(theme.palette.grey['500Channel'], 0.03),
            '&.Mui-expanded': {
              borderBottom: `1px solid ${varAlpha(theme.palette.grey['500Channel'], 0.08)}`,
              borderRadius: '10px 10px 0 0',
            },
            '& .MuiAccordionSummary-content': {
              alignItems: 'center',
              my: 0,
              overflow: 'visible',
            },
          }}
        >
          {/* Left side: index badge + name + chips */}
          <Box display="flex" alignItems="center" gap={1.5} flex={1} minWidth={0}>
            {/* Index badge */}
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                bgcolor: 'primary.main',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: 13,
                flexShrink: 0,
              }}
            >
              {index + 1}
            </Box>

            {/* Name – editable text field OR static text */}
            {isEditing && !isLocked ? (
              <Box sx={{ width: 220, flexShrink: 0, overflow: 'visible' }}>
                <TextField
                  size="small"
                  name="name"
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => e.stopPropagation()}
                  label="Fee Structure Name *"
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={formik.touched.name && formik.errors.name}
                  sx={{
                    width: '100%',
                    '& .MuiFormHelperText-root': { mr: 0, ml: 0 },
                  }}
                  autoFocus={isNew}
                />
              </Box>
            ) : (
              <Typography
                variant="subtitle2"
                fontWeight={700}
                noWrap
                sx={{ maxWidth: 240, flexShrink: 0 }}
              >
                {formik.values.name || `Fee Structure ${index + 1}`}
              </Typography>
            )}

            {/* Total chip */}
            <Chip
              label={`Total: ${formatNumber(totalAmount, 'INR')}`}
              color="success"
              size="small"
              variant="soft"
              sx={{ fontWeight: 600, borderRadius: 1, fontSize: 11, flexShrink: 0 }}
            />

            {/* Fee heads count chip */}
            {formik.values.feeHeads.length > 0 && (
              <Chip
                label={`${formik.values.feeHeads.length} fee head${formik.values.feeHeads.length !== 1 ? 's' : ''}`}
                size="small"
                variant="soft"
                color="default"
                sx={{ fontWeight: 500, borderRadius: 1, fontSize: 11, flexShrink: 0 }}
              />
            )}

            {/* Fee heads array validation error */}
            {formik.touched.feeHeads && typeof formik.errors.feeHeads === 'string' && (
              <Tooltip title={formik.errors.feeHeads}>
                <Iconify
                  icon="mdi:alert-circle-outline"
                  color={theme.palette.error.main}
                  width={16}
                  sx={{ flexShrink: 0 }}
                />
              </Tooltip>
            )}

            {/* Lock status chip */}
            {isLocked && (
              <Chip
                icon={<Iconify icon="mdi:lock" width={12} />}
                label="Locked"
                color="error"
                size="small"
                variant="soft"
                sx={{ fontWeight: 500, borderRadius: 1, fontSize: 11, flexShrink: 0 }}
              />
            )}
          </Box>

          {/* Right side: info banner + action buttons */}
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            flexShrink={0}
            onClick={(e) => e.stopPropagation()}
            mr={1}
          >
            {/* Info banner */}
            {isLocked ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  bgcolor: varAlpha(theme.palette.warning.mainChannel, 0.05),
                  border: `1px solid ${varAlpha(theme.palette.warning.mainChannel, 0.25)}`,
                  borderRadius: 1,
                  px: 1,
                  py: 0.6,
                  gap: 0.75,
                  maxWidth: 240,
                }}
              >
                <Iconify
                  icon="solar:info-circle-bold"
                  color={theme.palette.warning.main}
                  width={14}
                  sx={{ flexShrink: 0 }}
                />
                <Typography variant="caption" color="warning.main" fontWeight={600} noWrap>
                  Changes restricted after locking
                </Typography>
              </Box>
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  bgcolor: varAlpha(theme.palette.info.mainChannel, 0.04),
                  border: `1px solid ${varAlpha(theme.palette.info.mainChannel, 0.18)}`,
                  borderRadius: 1,
                  px: 1,
                  py: 0.6,
                  gap: 0.75,
                  maxWidth: 240,
                }}
              >
                <Iconify
                  icon="solar:info-circle-bold"
                  color={theme.palette.info.main}
                  width={14}
                  sx={{ flexShrink: 0 }}
                />
                <Typography variant="caption" color="info.main" fontWeight={600} noWrap>
                  Changes restricted after locking
                </Typography>
              </Box>
            )}

            {/* Edit button (view mode only) */}
            {!isNew && !isLocked && !isEditing && (
              <Tooltip title="Edit Fee Structure">
                <IconButton
                  size="small"
                  onClick={enterEdit}
                  sx={{
                    borderRadius: 1,
                    border: `1px solid ${varAlpha(theme.palette.grey['500Channel'], 0.2)}`,
                    '&:hover': { bgcolor: varAlpha(theme.palette.grey['500Channel'], 0.08) },
                  }}
                >
                  <Iconify icon={GlobalIcons.edit} width={16} />
                </IconButton>
              </Tooltip>
            )}

            {/* Discard button (edit mode) */}
            {isEditing && !isLocked && !isNew && (
              <Tooltip title="Discard Changes">
                <IconButton
                  size="small"
                  color="warning"
                  onClick={discardEdit}
                  sx={{
                    borderRadius: 1,
                    border: `1px solid ${varAlpha(theme.palette.warning.mainChannel, 0.2)}`,
                    '&:hover': { bgcolor: varAlpha(theme.palette.warning.mainChannel, 0.12) },
                  }}
                >
                  <Iconify icon={GlobalIcons.cancel} width={16} />
                </IconButton>
              </Tooltip>
            )}

            {/* Save / Update button (edit mode) */}
            {isEditing && !isLocked && (
              <Tooltip title={isNew ? 'Save' : 'Update'}>
                <span>
                  <LoadingButton
                    size="small"
                    color="success"
                    loading={isSaving}
                    onClick={handleSave}
                    disabled={!isNew && !formik.dirty}
                    sx={{
                      minWidth: 0,
                      p: 0.6,
                      borderRadius: 1,
                      border: `1px solid ${varAlpha(theme.palette.success.mainChannel, 0.2)}`,
                      '&:hover': {
                        border: `1px solid ${varAlpha(theme.palette.success.mainChannel, 0.5)}`,
                      },
                    }}
                  >
                    <Iconify icon={GlobalIcons.submit} width={16} />
                  </LoadingButton>
                </span>
              </Tooltip>
            )}

            {/* Delete button */}
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
                    border: `1px solid ${varAlpha(theme.palette.error.mainChannel, 0.15)}`,
                    '&:hover': {
                      bgcolor: varAlpha(theme.palette.error.mainChannel, 0.08),
                    },
                  }}
                >
                  <Iconify icon={GlobalIcons.delete} width={16} />
                </LoadingButton>
              </span>
            </Tooltip>

            {/* Lock button */}
            {!isNew && (
              <Tooltip title={isLocked ? 'Cannot Unlock Fee Structure' : 'Lock Fee Structure'}>
                <span>
                  <LoadingButton
                    loading={isLocking}
                    onClick={handleLockToggle}
                    size="small"
                    disabled={isLocked}
                    sx={{
                      minWidth: 0,
                      p: 0.8,
                      borderRadius: '50%',
                      bgcolor: isLocked ? theme.palette.grey[500] : theme.vars.palette.success.main,
                      '&:hover': {
                        bgcolor: isLocked
                          ? theme.palette.grey[600]
                          : theme.vars.palette.success.dark,
                      },
                    }}
                  >
                    <Iconify
                      icon={isLocked ? 'mdi:lock-open-outline' : 'mdi:lock-outline'}
                      sx={{ width: 16, height: 16, color: '#fff' }}
                    />
                  </LoadingButton>
                </span>
              </Tooltip>
            )}
          </Box>
        </AccordionSummary>

        {/* ── Accordion Details ─────────────────────────────────────────────── */}
        <AccordionDetails sx={{ p: 0 }}>
          {formik.values.feeHeads && formik.values.feeHeads.length > 0 ? (
            <Box sx={{ overflowX: 'auto' }}>
              {/* ── Table header row ─────────────────────────────────────── */}
              <Box
                display="flex"
                alignItems="center"
                sx={{
                  px: 2,
                  py: 1,
                  bgcolor: varAlpha(theme.palette.grey['500Channel'], 0.04),
                  borderBottom: `1px solid ${varAlpha(theme.palette.grey['500Channel'], 0.1)}`,
                  minWidth: 640,
                }}
              >
                <Box sx={{ width: COL_WIDTHS.serial, flexShrink: 0 }}>
                  <Typography variant="caption" color="text.disabled" fontWeight={600}>
                    #
                  </Typography>
                </Box>
                <Box sx={{ width: COL_WIDTHS.feeHead, flexShrink: 0 }}>
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    fontWeight={600}
                    textTransform="uppercase"
                    letterSpacing={0.4}
                  >
                    Fee Head
                  </Typography>
                </Box>
                <Box sx={{ width: COL_WIDTHS.category, flexShrink: 0 }}>
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    fontWeight={600}
                    textTransform="uppercase"
                    letterSpacing={0.4}
                  >
                    Category
                  </Typography>
                </Box>
                <Box sx={{ width: COL_WIDTHS.amount, flexShrink: 0 }}>
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    fontWeight={600}
                    textTransform="uppercase"
                    letterSpacing={0.4}
                  >
                    Amount
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: COL_WIDTHS.type,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    fontWeight={600}
                    textTransform="uppercase"
                    letterSpacing={0.4}
                  >
                    Type
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: COL_WIDTHS.optional,
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    fontWeight={600}
                    textTransform="uppercase"
                    letterSpacing={0.4}
                  >
                    Optional
                  </Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    fontWeight={600}
                    textTransform="uppercase"
                    letterSpacing={0.4}
                  >
                    Payable Month
                  </Typography>
                </Box>
                <Box sx={{ width: COL_WIDTHS.actions, flexShrink: 0 }} />
              </Box>

              {/* ── Table body rows ──────────────────────────────────────── */}
              <Stack
                divider={
                  <Divider sx={{ borderColor: varAlpha(theme.palette.grey['500Channel'], 0.08) }} />
                }
                sx={{ maxHeight: 340, overflowY: 'auto', minWidth: 640 }}
              >
                {formik.values.feeHeads.map((item, idx) => {
                  const paybleMonthError = getFeeHeadError(idx, 'paybleMonth');
                  const amountError = getFeeHeadError(idx, 'amount');
                  return (
                    <Box
                      key={`${item.feeHeadId}-${idx}`}
                      display="flex"
                      alignItems="center"
                      sx={{
                        px: 2,
                        py: 0.75,
                        transition: 'background-color 0.15s',
                        '&:hover': { bgcolor: varAlpha(theme.palette.grey['500Channel'], 0.04) },
                      }}
                    >
                      {/* Serial */}
                      <Box sx={{ width: COL_WIDTHS.serial, flexShrink: 0 }}>
                        <Typography variant="body2" color="text.secondary" fontWeight={500}>
                          {String(idx + 1).padStart(2, '0')}
                        </Typography>
                      </Box>

                      {/* Fee Head name */}
                      <Box sx={{ width: COL_WIDTHS.feeHead, flexShrink: 0, pr: 1 }}>
                        <Typography variant="body2" fontWeight={600} noWrap>
                          {item.feeHeadName}
                        </Typography>
                      </Box>

                      {/* Category */}
                      <Box sx={{ width: COL_WIDTHS.category, flexShrink: 0, pr: 1 }}>
                        <Typography variant="body2" color="text.secondary" noWrap>
                          {item.feeCategoryName || (item as any).categoryName || '-'}
                        </Typography>
                      </Box>

                      {/* Amount input */}
                      <Box sx={{ width: COL_WIDTHS.amount, flexShrink: 0, pr: 1 }}>
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
                            '& .MuiInputBase-root': { height: 34 },
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
                          }}
                        />
                      </Box>

                      {/* Type toggle: Recurring / One-Time */}
                      <Box sx={{ width: COL_WIDTHS.type, flexShrink: 0, pr: 1 }}>
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
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.5,
                            cursor: isEditing && !isLocked ? 'pointer' : 'default',
                            px: 1,
                            py: 0.4,
                            borderRadius: 1,
                            border: '1px solid',
                            ...(item.isOneTime
                              ? {
                                  color: 'primary.main',
                                  bgcolor: varAlpha(theme.palette.primary.mainChannel, 0.08),
                                  borderColor: varAlpha(theme.palette.primary.mainChannel, 0.25),
                                }
                              : {
                                  color: 'success.main',
                                  bgcolor: varAlpha(theme.palette.success.mainChannel, 0.08),
                                  borderColor: varAlpha(theme.palette.success.mainChannel, 0.25),
                                }),
                            transition: 'all 0.18s',
                          }}
                        >
                          <Iconify
                            icon={
                              item.isOneTime
                                ? 'solar:calendar-date-bold'
                                : 'solar:refresh-circle-bold'
                            }
                            width={14}
                          />
                          <Typography variant="caption" fontWeight={600} noWrap>
                            {item.isOneTime ? 'One-Time' : 'Recurring'}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Optional toggle: Optional / Compulsory */}
                      <Box sx={{ width: COL_WIDTHS.optional, flexShrink: 0, pr: 1 }}>
                        <Box
                          component="div"
                          onClick={() => {
                            if (!isEditing || isLocked) return;
                            const newVal = !item.isOptional;
                            updateFeeHeadFields(idx, {
                              isOptional: newVal,
                            });
                          }}
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 0.5,
                            cursor: isEditing && !isLocked ? 'pointer' : 'default',
                            px: 1,
                            py: 0.4,
                            borderRadius: 1,
                            border: '1px solid',
                            ...(item.isOptional
                              ? {
                                  color: 'info.main',
                                  bgcolor: varAlpha(theme.palette.info.mainChannel, 0.08),
                                  borderColor: varAlpha(theme.palette.info.mainChannel, 0.25),
                                }
                              : {
                                  color: 'text.disabled',
                                  borderColor: varAlpha(theme.palette.grey['500Channel'], 0.2),
                                }),
                            transition: 'all 0.18s',
                          }}
                        >
                          <Iconify
                            icon={
                              item.isOptional
                                ? 'solar:check-circle-bold'
                                : 'solar:check-circle-outline'
                            }
                            width={14}
                          />
                          <Typography variant="caption" fontWeight={600} noWrap>
                            {item.isOptional ? 'Optional' : 'Compulsory'}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Payable Month select */}
                      <Box sx={{ flex: 1, pr: 1 }}>
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
                      </Box>

                      {/* Remove row action */}
                      <Box
                        sx={{
                          width: COL_WIDTHS.actions,
                          flexShrink: 0,
                          display: 'flex',
                          justifyContent: 'flex-end',
                        }}
                      >
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
                      </Box>
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          ) : (
            <Box>
              {formik.touched.feeHeads && typeof formik.errors.feeHeads === 'string' && (
                <Typography
                  variant="caption"
                  color="error"
                  sx={{ display: 'flex', justifyContent: 'center', fontWeight: 600, pt: 1 }}
                >
                  {formik.errors.feeHeads}
                </Typography>
              )}
              <EmptyContent
                title="No Fee Heads Found"
                description="There are no fee heads assigned to this fee structure."
              />
            </Box>
          )}

          {/* ── Add Fee Head row ─────────────────────────────────────────── */}
          {isEditing && !isLocked && (
            <Box
              sx={{
                borderTop: `1px dashed ${varAlpha(theme.palette.grey['500Channel'], 0.18)}`,
                px: 2,
                py: 1,
              }}
            >
              <Box
                component="button"
                type="button"
                onClick={addFeeHeadDialog.onTrue}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.75,
                  border: 'none',
                  bgcolor: 'transparent',
                  cursor: 'pointer',
                  color: 'primary.main',
                  fontFamily: 'inherit',
                  '&:hover': {
                    opacity: 0.75,
                  },
                }}
              >
                <Iconify icon="solar:add-circle-bold-duotone" width={20} color="primary.main" />
                <Typography variant="body2" color="primary.main" fontWeight={600}>
                  Add Fee Head
                </Typography>
              </Box>
            </Box>
          )}
        </AccordionDetails>
      </Accordion>

      {/* ── Dialogs ──────────────────────────────────────────────────────────── */}
      <CustomDialog
        open={addFeeHeadDialog.value}
        handleClose={addFeeHeadDialog.onFalse}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Add Fee Head</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="You can add existing fee heads to this fee structure."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
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
