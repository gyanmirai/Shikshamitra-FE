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
import { useBoolean } from 'src/hooks/use-boolean';
import CustomDialog from 'src/components/customDialog';
import { formatNumber } from 'src/utils/formate_number';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import { FeeMonth } from 'src/enums/fee-collection-type';
import CustomTooltip from 'src/components/custom-tooltip';
import React, { useMemo, useState, useEffect } from 'react';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { EmptyContent } from 'src/components/empty-content';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { FeeStructureLockStatusType } from 'src/enums/finance-fee-structure-status';
import { useGetAcademicYearMonthsQuery } from 'src/redux/finance/financeFeeStructure';
import {
  useGetPaymentTermsQuery,
  useLazyGetPaymentTermByIdQuery,
} from 'src/redux/finance/paymentTerm';
import {
  Box,
  Tab,
  Chip,
  Tabs,
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

import FeePoliciesTab from './FeePoliciesTab';
import AddFeeHeadToCardDialog from './AddFeeHeadToCardDialog';
import PaymentTermScheduleDrawer from './PaymentTermScheduleDrawer';
import {
  useLockClassWiseFeeStructure,
  useCreateClassWiseFeeStructure,
  useDeleteClassWiseFeeStructure,
  useUpdateClassWiseFeeStructure,
} from '../hooks/useClassWiseFeeStructureHooks';

import type { PolicyValues } from './FeePoliciesTab';
import type {
  IClassWiseFeeItem,
  IClassWiseFeeStructureCard,
  IFeeHeadPaymentTermOverride,
} from '../type';

// ---------------------------------------------------------------------------
// Validation schema
// ---------------------------------------------------------------------------
const feeStructureSchema = Yup.object({
  name: Yup.string().trim().required('Fee Structure name is required'),
  concessionPolicyId: Yup.string().required('Concession Policy is required'),
  collectionPolicyId: Yup.string().required('Collection Policy is required'),
  concessionFeeHeadScope: Yup.string().oneOf(['EntireFeeStructure', 'SelectedFeeHeads']).required(),
  concessionApplicableFeeHeadIds: Yup.array(Yup.string()).when('concessionFeeHeadScope', {
    is: 'SelectedFeeHeads',
    then: (schema) => schema.min(1, 'Select at least one concession-enabled fee head'),
  }),
  feeHeads: Yup.array(
    Yup.object({
      isOptional: Yup.boolean().optional(),
      amount: Yup.number()
        .transform((value) => (value === 0 || Number.isNaN(value) ? undefined : value))
        .required('Required'),
    })
  ).min(1, 'At least one fee head is required'),
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
// History tab placeholder
// ---------------------------------------------------------------------------
const HistoryTab: React.FC = () => {
  const theme = useTheme();
  return (
    <Box sx={{ p: 2 }}>
      <EmptyContent
        title="History Coming Soon"
        description="A full audit timeline — creation, policy changes, fee head updates, lock/unlock — will appear here."
        sx={{ py: 4 }}
      />
    </Box>
  );
};

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
  const [activeTab, setActiveTab] = useState(0);

  // Payment Term Schedule drawer state
  const ptScheduleDrawer = useBoolean();
  const [selectedFeeHeadForSchedule, setSelectedFeeHeadForSchedule] = useState<{
    idx: number;
    feeHeadName: string;
    paymentTermId: string;
    paymentTermName: string;
    override?: IFeeHeadPaymentTermOverride;
    isLocked: boolean;
  } | null>(null);

  const isNew = !cardId;
  const isLocked = status === FeeStructureLockStatusType.Locked;

  const formik = useFormik({
    initialValues: {
      name: initialData.name,
      feeHeads: initialData.feeHeads.map((fh) => ({
        ...fh,
        isOptional: fh.isOptional ?? false,
      })),
      // Finance Policies
      paymentPolicyId: initialData.paymentPolicyId ?? '',
      collectionPolicyId: initialData.collectionPolicyId ?? '',
      refundPolicyId: initialData.refundPolicyId ?? '',
      prorationPolicyId: initialData.prorationPolicyId ?? '',
      concessionPolicyId: initialData.concessionPolicyId ?? '',
      concessionFeeHeadScope: initialData.concessionFeeHeadScope ?? 'EntireFeeStructure',
      concessionApplicableFeeHeadIds: initialData.concessionApplicableFeeHeadIds ?? [],
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

  // ── Payment Term options (live list for current academic year) ─────────────
  const {
    data: paymentTermsData,
    isLoading: isPaymentTermLoading,
    isFetching: isPaymentTermFetching,
  } = useGetPaymentTermsQuery(
    { academicYearId: currentYear?.id ?? '', status: 'Active', pageSize: 100 },
    { skip: !currentYear?.id }
  );
  const [fetchPaymentTermById] = useLazyGetPaymentTermByIdQuery();

  const paymentTermOptions = useMemo(
    () =>
      (paymentTermsData?.items ?? [])
        .filter((term) => term.hasPublishedVersion && term.status !== 'Archived')
        .map((t) => ({
          label: t.name,
          value: t.id,
          currentVersionNumber: t.currentVersionNumber,
        })),
    [paymentTermsData?.items]
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

  // ── Payment Term Schedule drawer helpers ────────────────────────────────────
  const openScheduleDrawer = (idx: number, item: IClassWiseFeeItem) => {
    setSelectedFeeHeadForSchedule({
      idx,
      feeHeadName: item.feeHeadName ?? 'Fee Head',
      paymentTermId: item.paymentTermId ?? '',
      paymentTermName: item.paymentTermName ?? 'Payment Term',
      override: item.paymentTermOverride,
      isLocked: item.paymentTermOverride?.isLocked ?? false,
    });
    ptScheduleDrawer.onTrue();
  };

  const handleScheduleSave = (override: IFeeHeadPaymentTermOverride) => {
    if (selectedFeeHeadForSchedule === null) return;
    updateFeeHeadFields(selectedFeeHeadForSchedule.idx, {
      paymentTermOverride: override,
      scheduleMode: override.isCustomized ? 'Customized' : 'Inherited',
      paymentTermId: override.paymentTermId,
      paymentTermName: override.paymentTermName,
    });
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

  const handlePolicyChange = (
    field: keyof PolicyValues,
    value: PolicyValues[keyof PolicyValues]
  ) => {
    formik.setFieldValue(field, value);
  };

  const handleSave = async () => {
    setSubmitAttempted(true);
    if (!formik.values.collectionPolicyId) {
      setActiveTab(1);
      shikshaMitraToast.error({ message: 'Select an active Collection Policy before saving.' });
      return;
    }
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
        isOptional: fh.isOptional,
        isOneTime: fh.isOneTime ?? false,
        payableMonth: fh.paybleMonth,
        payableYear: fh.payableYear,
        ...(fh.paymentTermId && {
          paymentTermId: fh.paymentTermId,
          ...(fh.paymentTermVersionId && { paymentTermVersionId: fh.paymentTermVersionId }),
          scheduleMode: fh.paymentTermOverride?.isCustomized ? 'Customized' : 'Inherited',
          ...(fh.paymentTermOverride?.isCustomized &&
            fh.paymentTermOverride.installments?.length && {
              installmentOverrides: fh.paymentTermOverride.installments
                .filter((inst) => Boolean(inst.id))
                .map((inst) => ({
                  sourcePaymentTermInstallmentId: inst.id,
                  sequence: inst.sequence,
                  name: inst.installmentName,
                  coverageStartDate: inst.startDate,
                  coverageEndDate: inst.endDate,
                  demandDate: inst.demandDate ?? inst.dueDate,
                  dueDate: inst.dueDate,
                })),
            }),
        }),
      }));

      // Collect non-empty policy IDs
      const policyPayload = {
        ...(formik.values.paymentPolicyId && {
          paymentPolicyId: formik.values.paymentPolicyId,
        }),
        ...(formik.values.collectionPolicyId && {
          collectionPolicyId: formik.values.collectionPolicyId,
        }),
        ...(formik.values.refundPolicyId && {
          refundPolicyId: formik.values.refundPolicyId,
        }),
        ...(formik.values.prorationPolicyId && {
          prorationPolicyId: formik.values.prorationPolicyId,
        }),
        ...(formik.values.concessionPolicyId && {
          concessionPolicyId: formik.values.concessionPolicyId,
          concessionFeeHeadScope: formik.values.concessionFeeHeadScope,
          concessionApplicableFeeHeadIds:
            formik.values.concessionFeeHeadScope === 'SelectedFeeHeads'
              ? formik.values.concessionApplicableFeeHeadIds
              : [],
        }),
      };

      if (isNew) {
        const saved = await createStructure({
          feeStructureMetaDataId: initialData.feeStructureMetaDataId,
          standardId: initialData.classId,
          name: formik.values.name,
          feeHeads: feeHeadsPayload,
          ...policyPayload,
        } as any);
        const newId = saved._id ?? saved.id;
        const savedFeeHeads = (saved.feeHeads ?? formik.values.feeHeads).map((fh: any) => ({
          ...fh,
          isOptional: fh.isOptional ?? false,
        }));
        formik.resetForm({
          values: {
            name: saved.name ?? formik.values.name,
            feeHeads: savedFeeHeads,
            paymentPolicyId: saved.paymentPolicyId ?? formik.values.paymentPolicyId,
            collectionPolicyId: saved.collectionPolicyId ?? formik.values.collectionPolicyId,
            refundPolicyId: saved.refundPolicyId ?? formik.values.refundPolicyId,
            prorationPolicyId: saved.prorationPolicyId ?? formik.values.prorationPolicyId,
            concessionPolicyId: saved.concessionPolicyId ?? formik.values.concessionPolicyId,
            concessionFeeHeadScope:
              saved.concessionFeeHeadScope ?? formik.values.concessionFeeHeadScope,
            concessionApplicableFeeHeadIds:
              saved.concessionApplicableFeeHeadIds ?? formik.values.concessionApplicableFeeHeadIds,
          },
        });
        setCardId(newId);
        setIsEditing(false);
        setIsSaving(false);
        setSubmitAttempted(false);
        onSaved?.({ ...initialData, ...saved, _id: newId });
        shikshaMitraToast.success({ message: 'Fee structure created successfully' });
      } else {
        const saved = await updateStructure({
          structureId: cardId!,
          classId: initialData.classId,
          body: {
            name: formik.values.name,
            feeHeads: feeHeadsPayload,
            ...policyPayload,
          },
        });
        const updatedFeeHeads = (saved?.feeHeads ?? formik.values.feeHeads).map((fh: any) => ({
          ...fh,
          isOptional: fh.isOptional ?? false,
        }));
        formik.resetForm({
          values: {
            name: saved?.name ?? formik.values.name,
            feeHeads: updatedFeeHeads,
            paymentPolicyId: saved?.paymentPolicyId ?? formik.values.paymentPolicyId,
            collectionPolicyId: saved?.collectionPolicyId ?? formik.values.collectionPolicyId,
            refundPolicyId: saved?.refundPolicyId ?? formik.values.refundPolicyId,
            prorationPolicyId: saved?.prorationPolicyId ?? formik.values.prorationPolicyId,
            concessionPolicyId: saved?.concessionPolicyId ?? formik.values.concessionPolicyId,
            concessionFeeHeadScope:
              saved?.concessionFeeHeadScope ?? formik.values.concessionFeeHeadScope,
            concessionApplicableFeeHeadIds:
              saved?.concessionApplicableFeeHeadIds ?? formik.values.concessionApplicableFeeHeadIds,
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

  // widths as flex proportions
  const COL_WIDTHS = {
    serial: 36, // #
    feeHead: '32%', // Fee Head
    category: '20%', // Category
    amount: '12%', // Amount
    paymentTerm: '24%', // Payment Term
    optional: '12%', // Optional/Compulsory toggle
    actions: 40, // remove button
  };

  // ── Policy summary chips for header ────────────────────────────────────────
  const hasPolicies =
    formik.values.paymentPolicyId ||
    formik.values.collectionPolicyId ||
    formik.values.refundPolicyId ||
    formik.values.prorationPolicyId ||
    formik.values.concessionPolicyId;

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
          <Box display="flex" alignItems="center" gap={1} flex={1} minWidth={0}>
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

            {/* Policy chip – only when at least one policy is set */}
            {!isEditing && hasPolicies && (
              <Chip
                icon={<Iconify icon="solar:shield-check-bold" width={12} />}
                label="Policies"
                size="small"
                variant="soft"
                color="primary"
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

        {/* ── Accordion Details with Tabs ──────────────────────────────────── */}
        <AccordionDetails sx={{ p: 0 }}>
          {/* Tab bar */}
          <Box
            sx={{
              borderBottom: `1px solid ${varAlpha(theme.palette.grey['500Channel'], 0.1)}`,
              bgcolor: varAlpha(theme.palette.grey['500Channel'], 0.02),
            }}
          >
            <Tabs
              value={activeTab}
              onChange={(_, val) => setActiveTab(val)}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                minHeight: 40,
                px: 1,
                '& .MuiTab-root': {
                  minHeight: 40,
                  py: 0,
                  fontSize: 12,
                  fontWeight: 600,
                  textTransform: 'none',
                  letterSpacing: 0,
                },
              }}
            >
              <Tab
                label="Fee Heads"
                icon={<Iconify icon="solar:document-bold-duotone" width={15} />}
                iconPosition="start"
                sx={{ gap: 0.5 }}
              />
              <Tab
                label="Policies"
                icon={<Iconify icon="solar:shield-check-bold-duotone" width={15} />}
                iconPosition="start"
                sx={{ gap: 0.5 }}
              />
              <Tab
                label="History"
                icon={<Iconify icon="solar:history-bold-duotone" width={15} />}
                iconPosition="start"
                sx={{ gap: 0.5 }}
              />
            </Tabs>
          </Box>

          {/* ── Tab 0: Fee Heads ──────────────────────────────────────── */}
          {activeTab === 0 && (
            <>
              {formik.values.feeHeads && formik.values.feeHeads.length > 0 ? (
                <Box sx={{ overflowX: 'auto' }}>
                  {/* ── Table header row ─────────────────────────────────── */}
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
                    {/* ── Payment Term column header (NEW) ──────────────── */}
                    <Box sx={{ width: COL_WIDTHS.paymentTerm, flexShrink: 0 }}>
                      <Typography
                        variant="caption"
                        color="text.disabled"
                        fontWeight={600}
                        textTransform="uppercase"
                        letterSpacing={0.4}
                      >
                        Payment Term
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
                    <Box sx={{ width: COL_WIDTHS.actions, flexShrink: 0 }} />
                  </Box>

                  {/* ── Table body rows ────────────────────────────────── */}
                  <Stack
                    divider={
                      <Divider
                        sx={{ borderColor: varAlpha(theme.palette.grey['500Channel'], 0.08) }}
                      />
                    }
                    sx={{ maxHeight: 340, overflowY: 'auto', minWidth: 640 }}
                  >
                    {formik.values.feeHeads.map((item, idx) => {
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
                            '&:hover': {
                              bgcolor: varAlpha(theme.palette.grey['500Channel'], 0.04),
                            },
                          }}
                        >
                          <Box sx={{ width: COL_WIDTHS.serial, flexShrink: 0 }}>
                            <Typography variant="body2" color="text.secondary" fontWeight={500}>
                              {String(idx + 1).padStart(2, '0')}
                            </Typography>
                          </Box>

                          <Box sx={{ width: COL_WIDTHS.feeHead, flexShrink: 0, pr: 1 }}>
                            <Typography variant="body2" fontWeight={600} noWrap>
                              {item.feeHeadName}
                            </Typography>
                          </Box>

                          <Box sx={{ width: COL_WIDTHS.category, flexShrink: 0, pr: 1 }}>
                            <Typography variant="body2" color="text.secondary" noWrap>
                              {item.feeCategoryName || (item as any).categoryName || '-'}
                            </Typography>
                          </Box>

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
                                '& .MuiOutlinedInput-notchedOutline': {
                                  borderColor: 'transparent',
                                },
                              }}
                            />
                          </Box>

                          {/* Payment Term cell */}
                          <Box
                            sx={{
                              width: COL_WIDTHS.paymentTerm,
                              flexShrink: 0,
                              pr: 1,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.75,
                            }}
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 0.5,
                                flex: 1,
                                minWidth: 0,
                              }}
                            >
                              {/* ── No payment term — show selector dropdown ── */}
                              <CustomSelect
                                label="Payment Term"
                                options={paymentTermOptions}
                                isLoading={isPaymentTermLoading || isPaymentTermFetching}
                                labelKey="label"
                                valueKey="value"
                                value={item.paymentTermId ?? ''}
                                disabled={!isEditing || isLocked}
                                onChange={async (val) => {
                                  const selected = paymentTermOptions.find((o) => o.value === val);
                                  if (!selected) return;
                                  let versionId: string | undefined;
                                  try {
                                    const detail = await fetchPaymentTermById(
                                      String(selected.value)
                                    ).unwrap();
                                    const published = detail.versions?.find(
                                      (v) => v.status === 'Published'
                                    );
                                    versionId = published?.id;
                                  } catch {
                                    versionId = undefined;
                                  }
                                  if (!versionId) {
                                    shikshaMitraToast.error({
                                      message:
                                        'This Payment Term has no published version available for assignment.',
                                    });
                                    return;
                                  }
                                  updateFeeHeadFields(idx, {
                                    paymentTermId: String(selected.value),
                                    paymentTermName: selected.label,
                                    paymentTermVersionId: versionId,
                                    scheduleMode: 'Inherited',
                                    paymentTermOverride: undefined,
                                  });
                                }}
                                size="small"
                                formControlProps={{ sx: { width: '100%', flex: 1 } }}
                                noOptionsMessage="No active payment terms"
                              />
                              {item.paymentTermId && (
                                <Tooltip title="Customize installment schedule for this Fee Head">
                                  <IconButton
                                    size="small"
                                    onClick={() => openScheduleDrawer(idx, item)}
                                    sx={{
                                      flexShrink: 0,
                                      p: 0.35,
                                      borderRadius: 1,
                                      border: `1px solid ${varAlpha(theme.palette.primary.mainChannel, 0.2)}`,
                                      color: 'primary.main',
                                      '&:hover': {
                                        bgcolor: varAlpha(theme.palette.primary.mainChannel, 0.08),
                                        borderColor: varAlpha(
                                          theme.palette.primary.mainChannel,
                                          0.4
                                        ),
                                      },
                                    }}
                                  >
                                    <Iconify icon={GlobalIcons.edit} width={12} />
                                  </IconButton>
                                </Tooltip>
                              )}
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

              {/* ── Add Fee Head row ──────────────────────────────────── */}
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
            </>
          )}

          {/* ── Tab 1: Policies ──────────────────────────────────────── */}
          {activeTab === 1 && (
            <FeePoliciesTab
              values={{
                paymentPolicyId: formik.values.paymentPolicyId,
                collectionPolicyId: formik.values.collectionPolicyId,
                refundPolicyId: formik.values.refundPolicyId,
                prorationPolicyId: formik.values.prorationPolicyId,
                concessionPolicyId: formik.values.concessionPolicyId,
                concessionFeeHeadScope: formik.values.concessionFeeHeadScope,
                concessionApplicableFeeHeadIds: formik.values.concessionApplicableFeeHeadIds,
              }}
              onChange={handlePolicyChange}
              isEditing={isEditing}
              isLocked={isLocked}
              feeStructureMetadataId={initialData.feeStructureMetaDataId}
			  feeStructureId={cardId ?? undefined}
              feeHeads={formik.values.feeHeads.map((fh) => ({
                feeHeadId: fh.feeHeadId,
                feeHeadName: fh.feeHeadName,
				isOneTime: fh.isOneTime,
              }))}
            />
          )}

          {/* ── Tab 2: History ───────────────────────────────────────── */}
          {activeTab === 2 && <HistoryTab />}
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

      {/* ── Payment Term Schedule Drawer ─────────────────────────────────────── */}
      {selectedFeeHeadForSchedule && (
        <PaymentTermScheduleDrawer
          open={ptScheduleDrawer.value}
          onClose={ptScheduleDrawer.onFalse}
          feeHeadName={selectedFeeHeadForSchedule.feeHeadName}
          paymentTermId={selectedFeeHeadForSchedule.paymentTermId}
          paymentTermName={selectedFeeHeadForSchedule.paymentTermName}
          override={selectedFeeHeadForSchedule.override}
          isLocked={selectedFeeHeadForSchedule.isLocked}
          onSave={handleScheduleSave}
        />
      )}
    </motion.div>
  );
};

export default IndependentFeeStructureCard;
