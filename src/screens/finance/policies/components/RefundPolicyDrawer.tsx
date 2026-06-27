'use client';

import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import { shikshaMitraToast } from 'src/components/toast';
import React, { useMemo, useState, useEffect } from 'react';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import CustomAccordion from 'src/components/custom-accordian';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetFeeHeadsQuery } from 'src/redux/feeHeadManage/feeHeadManageApi';
import {
  useCreateFinancePolicyMutation,
  useUpdateFinancePolicyMutation,
} from 'src/redux/finance/financePolicy';
import {
  Box,
  Card,
  Grid,
  Chip,
  Stack,
  Paper,
  Button,
  Select,
  Switch,
  Divider,
  MenuItem,
  Checkbox,
  TextField,
  Typography,
  InputLabel,
  FormControl,
  Autocomplete,
  FormHelperText,
  InputAdornment,
  FormControlLabel,
} from '@mui/material';

import type { IFinancePolicyRow, IRefundPolicyFormValues } from '../types/finance-policy.types';

// ─── Status Row Helper ────────────────────────────────────────────────────────
function SummaryRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontSize: '0.7rem', flexShrink: 0 }}
      >
        {label}
      </Typography>
      {value}
    </Stack>
  );
}

// ─── ValidationCheck helper ──────────────────────────────────────────────────
function ValidationCheck({ label, valid }: { label: string; valid: boolean }) {
  return (
    <Stack direction="row" spacing={0.75} alignItems="center" sx={{ py: 0.2 }}>
      <Box
        sx={{
          width: 14,
          height: 14,
          borderRadius: '50%',
          bgcolor: valid ? 'success.main' : 'action.disabled',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          transition: 'background-color 0.3s',
        }}
      >
        {valid && (
          <Typography sx={{ fontSize: '0.5rem', color: 'white', lineHeight: 1, fontWeight: 900 }}>
            ✓
          </Typography>
        )}
      </Box>
      <Typography
        variant="caption"
        sx={{ fontSize: '0.7rem', color: valid ? 'text.primary' : 'text.disabled' }}
      >
        {label}
      </Typography>
    </Stack>
  );
}

// ─── Initial values ───────────────────────────────────────────────────────────
const getInitialValues = (
  editData: IFinancePolicyRow | null | undefined,
  academicYearId: string
): IRefundPolicyFormValues => {
  const data = editData as any;
  return {
    policyName: data?.policyName || '',
    policyCode: data?.policyCode || '',
    description: data?.description || '',
    status: data?.status || 'Draft',
    academicYearId: data?.academicYearId || academicYearId || '',
    effectiveFrom: data?.effectiveFrom || null,
    effectiveTo: data?.effectiveTo || null,
    isDefault: data?.isDefault || false,
    policyType: 'refund',

    // Eligibility
    applicableFeeHeads: data?.applicableFeeHeads || [],
    refundOn: data?.refundOn || 'FullPayment',
    enableRefundForCharge: data?.enableRefundForCharge ?? false,
    refundOnWithdrawal: data?.refundOnWithdrawal ?? true,
    refundOnTransfer: data?.refundOnTransfer ?? true,

    // Payment Processing
    refundDueWithin: data?.refundDueWithin ?? 7,
    bankDetailsRequired: data?.bankDetailsRequired ?? true,

    // Accounting
    considerAsExpense: data?.considerAsExpense ?? false,
    governmentComplianceCode: data?.governmentComplianceCode || '',

    // Keep compatibility for unused fields
    refundMethod: data?.refundMethod || 'BankTransfer',
    processingDays: data?.processingDays ?? 7,
    allowPartialRefund: data?.allowPartialRefund ?? false,
    requireApproval: data?.requireApproval ?? false,
    approvalRoleIds: data?.approvalRoleIds || [],
    deductionRules: data?.deductionRules || [],
  };
};

// ─── Validation Schema ────────────────────────────────────────────────────────
const validationSchema = Yup.object().shape({
  policyName: Yup.string()
    .trim()
    .required('Policy name is required')
    .min(3, 'Must be at least 3 characters')
    .max(100, 'Cannot exceed 100 characters'),
  academicYearId: Yup.string().required('Academic year is required'),
  refundDueWithin: Yup.number()
    .typeError('Refund due within must be a number')
    .min(0, 'Must be 0 or greater')
    .required('Refund due within is required'),
  applicableFeeHeads: Yup.array().of(Yup.string()).min(1, 'Select at least one Fee Head'),
});

// ─── Sections ────────────────────────────────────────────────────────────────
const SectionGeneral = ({ formik, academicYears }: { formik: any; academicYears: any[] }) => (
  <Grid container spacing={2.5} p={2}>
    <Grid size={{ xs: 12, sm: 8 }}>
      <TextField
        fullWidth
        size="small"
        label="Policy Name *"
        name="policyName"
        value={formik.values.policyName}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.policyName && Boolean(formik.errors.policyName)}
        helperText={formik.touched.policyName && formik.errors.policyName}
      />
    </Grid>
    <Grid size={{ xs: 12, sm: 4 }}>
      <FormControl fullWidth size="small" error={Boolean(formik.errors.academicYearId)}>
        <InputLabel>Academic Year *</InputLabel>
        <Select
          label="Academic Year *"
          name="academicYearId"
          value={formik.values.academicYearId}
          onChange={formik.handleChange}
        >
          {academicYears.map((y: any) => (
            <MenuItem key={y.id} value={y.id}>
              {y.name}
            </MenuItem>
          ))}
        </Select>
        {formik.errors.academicYearId && (
          <FormHelperText>{formik.errors.academicYearId}</FormHelperText>
        )}
      </FormControl>
    </Grid>
    <Grid size={{ xs: 12, sm: 6 }}>
      <FormControl fullWidth size="small">
        <InputLabel>Status *</InputLabel>
        <Select
          label="Status *"
          name="status"
          value={formik.values.status}
          onChange={formik.handleChange}
        >
          <MenuItem value="Draft">Draft</MenuItem>
          <MenuItem value="Active">Active</MenuItem>
          <MenuItem value="Archived">Archived</MenuItem>
        </Select>
      </FormControl>
    </Grid>
    <Grid size={{ xs: 12, sm: 6 }}>
      <DatePicker
        label="Effective From"
        value={formik.values.effectiveFrom ? dayjs(formik.values.effectiveFrom) : null}
        onChange={(d) => formik.setFieldValue('effectiveFrom', d ? d.toISOString() : null)}
        slotProps={{ textField: { fullWidth: true, size: 'small' } }}
      />
    </Grid>
    <Grid size={{ xs: 12, sm: 6 }}>
      <DatePicker
        label="Effective To"
        value={formik.values.effectiveTo ? dayjs(formik.values.effectiveTo) : null}
        onChange={(d) => formik.setFieldValue('effectiveTo', d ? d.toISOString() : null)}
        minDate={formik.values.effectiveFrom ? dayjs(formik.values.effectiveFrom) : undefined}
        slotProps={{
          textField: {
            fullWidth: true,
            size: 'small',
            error: Boolean(formik.errors.effectiveTo),
            helperText: formik.errors.effectiveTo as string,
          },
        }}
      />
    </Grid>
    <Grid size={{ xs: 12 }}>
      <TextField
        fullWidth
        size="small"
        multiline
        rows={2}
        label="Description"
        name="description"
        value={formik.values.description}
        onChange={formik.handleChange}
        error={Boolean(formik.errors.description)}
        helperText={formik.errors.description || `${(formik.values.description || '').length}/500`}
        inputProps={{ maxLength: 500 }}
      />
    </Grid>
    <Grid size={{ xs: 12 }}>
      <Card
        variant="outlined"
        sx={{
          px: 2,
          py: 1.25,
          display: 'flex',
          alignItems: 'center',
          bgcolor: formik.values.isDefault ? 'primary.lighter' : 'transparent',
          borderColor: formik.values.isDefault ? 'primary.main' : 'divider',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
        }}
        onClick={() => formik.setFieldValue('isDefault', !formik.values.isDefault)}
      >
        <FormControlLabel
          sx={{ m: 0, pointerEvents: 'none' }}
          control={<Switch size="small" checked={formik.values.isDefault} />}
          label={
            <Box ml={0.5}>
              <Typography variant="body2" fontWeight={600}>
                Default Refund Policy
              </Typography>
              <Typography variant="caption" color="text.secondary" display="block">
                Use this policy automatically when no refund policy is selected in the Fee
                Structure.
              </Typography>
            </Box>
          }
        />
      </Card>
    </Grid>
  </Grid>
);

const SectionEligibility = ({ formik, feeHeads }: { formik: any; feeHeads: any[] }) => (
  <Grid container spacing={2.5} p={2}>
    {/* Applicable Fee Heads */}
    <Grid size={{ xs: 12 }}>
      <Autocomplete
        multiple
        size="small"
        options={feeHeads}
        getOptionLabel={(option) => option.name}
        value={feeHeads.filter((h) => formik.values.applicableFeeHeads?.includes(h.id))}
        onChange={(_, newValue) => {
          formik.setFieldValue(
            'applicableFeeHeads',
            newValue.map((v) => v.id)
          );
        }}
        disableCloseOnSelect
        renderOption={(props, option, { selected }) => (
          <li {...props}>
            <Checkbox size="small" style={{ marginRight: 8 }} checked={selected} />
            {option.name}
          </li>
        )}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Applicable Fee Heads *"
            error={formik.touched.applicableFeeHeads && Boolean(formik.errors.applicableFeeHeads)}
            helperText={
              formik.touched.applicableFeeHeads && (formik.errors.applicableFeeHeads as any)
            }
          />
        )}
      />
    </Grid>

    {/* Refund On */}
    <Grid size={{ xs: 12, sm: 6 }}>
      <FormControl fullWidth size="small">
        <InputLabel>Refund On *</InputLabel>
        <Select
          label="Refund On *"
          name="refundOn"
          value={formik.values.refundOn}
          onChange={formik.handleChange}
        >
          <MenuItem value="FullPayment">Full Payment</MenuItem>
          <MenuItem value="PartialAndFullPayment">Partial Payment + Full Payment</MenuItem>
        </Select>
      </FormControl>
    </Grid>

    {/* Enable Refund for Charge Switch */}
    <Grid size={{ xs: 12, sm: 6 }}>
      <Card
        variant="outlined"
        sx={{
          px: 2,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          bgcolor: formik.values.enableRefundForCharge ? 'primary.lighter' : 'transparent',
          borderColor: formik.values.enableRefundForCharge ? 'primary.main' : 'divider',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
        }}
        onClick={() =>
          formik.setFieldValue('enableRefundForCharge', !formik.values.enableRefundForCharge)
        }
      >
        <FormControlLabel
          sx={{ m: 0, pointerEvents: 'none' }}
          control={<Switch size="small" checked={formik.values.enableRefundForCharge} />}
          label={
            <Box ml={0.5}>
              <Typography variant="body2" fontWeight={600} fontSize="0.8rem">
                Enable Refund for Charge
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                fontSize="0.68rem"
              >
                Allow refunding of structural fine/late-fee charges
              </Typography>
            </Box>
          }
        />
      </Card>
    </Grid>

    {/* Switches for Withdrawal and Transfer */}
    <Grid size={{ xs: 12, sm: 6 }}>
      <FormControlLabel
        control={
          <Switch
            checked={formik.values.refundOnWithdrawal}
            onChange={(e) => formik.setFieldValue('refundOnWithdrawal', e.target.checked)}
            size="small"
          />
        }
        label={<Typography variant="body2">Refund on Withdrawal</Typography>}
      />
    </Grid>
    <Grid size={{ xs: 12, sm: 6 }}>
      <FormControlLabel
        control={
          <Switch
            checked={formik.values.refundOnTransfer}
            onChange={(e) => formik.setFieldValue('refundOnTransfer', e.target.checked)}
            size="small"
          />
        }
        label={<Typography variant="body2">Refund on Transfer</Typography>}
      />
    </Grid>
  </Grid>
);

const SectionProcessing = ({ formik }: { formik: any }) => (
  <Grid container spacing={2.5} p={2}>
    {/* Refund Due Within */}
    <Grid size={{ xs: 12, sm: 6 }}>
      <TextField
        fullWidth
        size="small"
        type="number"
        label="Refund Due Within (Days) *"
        name="refundDueWithin"
        value={formik.values.refundDueWithin}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.refundDueWithin && Boolean(formik.errors.refundDueWithin)}
        helperText={
          (formik.touched.refundDueWithin && formik.errors.refundDueWithin) ||
          'Days to complete refund payments after policy triggers'
        }
        InputProps={{
          endAdornment: <InputAdornment position="end">days</InputAdornment>,
        }}
      />
    </Grid>

    {/* Bank Details Required */}
    <Grid size={{ xs: 12, sm: 6 }}>
      <Card
        variant="outlined"
        sx={{
          px: 2,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          bgcolor: formik.values.bankDetailsRequired ? 'info.lighter' : 'transparent',
          borderColor: formik.values.bankDetailsRequired ? 'info.light' : 'divider',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
        }}
        onClick={() =>
          formik.setFieldValue('bankDetailsRequired', !formik.values.bankDetailsRequired)
        }
      >
        <FormControlLabel
          sx={{ m: 0, pointerEvents: 'none' }}
          control={<Switch size="small" checked={formik.values.bankDetailsRequired} />}
          label={
            <Box ml={0.5}>
              <Typography variant="body2" fontWeight={600} fontSize="0.8rem">
                Bank Details Required
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                fontSize="0.68rem"
              >
                Mandate parents/students bank info for transactions
              </Typography>
            </Box>
          }
        />
      </Card>
    </Grid>
  </Grid>
);

const SectionAccounting = ({ formik }: { formik: any }) => (
  <Grid container spacing={2.5} p={2}>
    {/* Consider as Expense */}
    <Grid size={{ xs: 12, sm: 6 }}>
      <Card
        variant="outlined"
        sx={{
          px: 2,
          py: 1,
          display: 'flex',
          alignItems: 'center',
          bgcolor: formik.values.considerAsExpense ? 'warning.lighter' : 'transparent',
          borderColor: formik.values.considerAsExpense ? 'warning.light' : 'divider',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
        }}
        onClick={() => formik.setFieldValue('considerAsExpense', !formik.values.considerAsExpense)}
      >
        <FormControlLabel
          sx={{ m: 0, pointerEvents: 'none' }}
          control={<Switch size="small" checked={formik.values.considerAsExpense} />}
          label={
            <Box ml={0.5}>
              <Typography variant="body2" fontWeight={600} fontSize="0.8rem">
                Consider as Expense
              </Typography>
              <Typography
                variant="caption"
                color="text.secondary"
                display="block"
                fontSize="0.68rem"
              >
                Account refund pay-out as operational school expense
              </Typography>
            </Box>
          }
        />
      </Card>
    </Grid>

    {/* Government Compliance Code */}
    <Grid size={{ xs: 12, sm: 6 }}>
      <TextField
        fullWidth
        size="small"
        label="Compliance Code"
        name="governmentComplianceCode"
        value={formik.values.governmentComplianceCode}
        onChange={formik.handleChange}
        placeholder="e.g. RTE-2009, State Rule"
        helperText="Link compliance standard code reference"
      />
    </Grid>
  </Grid>
);

// ─── Main Drawer Component ───────────────────────────────────────────────────
type SectionKey = 'general' | 'eligibility' | 'processing' | 'accounting';

interface RefundPolicyDrawerProps {
  open: boolean;
  onClose: () => void;
  editData?: IFinancePolicyRow | null;
  academicYearId?: string;
}

const RefundPolicyDrawer: React.FC<RefundPolicyDrawerProps> = ({
  open,
  onClose,
  editData,
  academicYearId = '',
}) => {
  const { currentYear, academicYears } = useSelector((state: RootState) => state.globalState);
  const [expandedSections, setExpandedSections] = useState<Set<SectionKey>>(new Set(['general']));
  const unsavedChangesDialog = useBoolean();

  const handleCloseAttempt = () => {
    if (formik.dirty) {
      unsavedChangesDialog.onTrue();
    } else {
      onClose();
    }
  };

  const toggleSection = (key: SectionKey) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  // Fetch fee heads list
  const { data: feeHeadsData } = useGetFeeHeadsQuery('');
  const feeHeads = feeHeadsData?.items || [];

  const [createPolicy, { isLoading: isCreating }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCreateFinancePolicyMutation,
  });

  const [updatePolicy, { isLoading: isUpdating }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateFinancePolicyMutation,
  });

  const isSaving = isCreating || isUpdating;

  const formik = useFormik<IRefundPolicyFormValues>({
    initialValues: getInitialValues(editData, academicYearId || currentYear?.id || ''),
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      // Handled manually by footer buttons to save and publish with right status
    },
  });

  useEffect(() => {
    if (!editData && formik.values.policyName) {
      formik.setFieldValue(
        'policyCode',
        `RP-${formik.values.policyName.toUpperCase().replace(/\s+/g, '-').slice(0, 12)}-${Date.now().toString().slice(-4)}`
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.policyName, editData]);

  // Live validation checks
  const checks = useMemo(() => {
    const v = formik.values;
    const nameValid = v.policyName.trim().length >= 3;
    const yearValid = !!v.academicYearId;
    const headsValid = v.applicableFeeHeads.length >= 1;
    const dueValid = typeof v?.refundDueWithin === 'number' && v.refundDueWithin >= 0;

    const isReadyToPublish = nameValid && yearValid && headsValid && dueValid;

    return {
      nameValid,
      yearValid,
      headsValid,
      dueValid,
      isReadyToPublish,
    };
  }, [formik.values]);

  const handleCustomSubmit = async (overrideStatus?: 'Draft' | 'Active' | 'Archived') => {
    const errors = await formik.validateForm();
    const hasErrors = Object.keys(errors).length > 0;
    if (hasErrors) {
      formik.setTouched({
        policyName: true,
        academicYearId: true,
        refundDueWithin: true,
        applicableFeeHeads: true,
      });
      shikshaMitraToast.error({ message: 'Fix all errors before saving.' });
      return;
    }

    try {
      const payload = {
        ...formik.values,
        status: overrideStatus || formik.values.status,
        policyCode: formik.values.policyCode || `RP-${Date.now()}`,
      };

      if (editData?.id) {
        await updatePolicy({ id: editData.id, body: payload });
        shikshaMitraToast.success({ message: `Refund policy "${payload.policyName}" updated.` });
      } else {
        await createPolicy(payload);
        shikshaMitraToast.success({ message: `Refund policy "${payload.policyName}" created.` });
      }
      formik.resetForm();
      onClose();
    } catch {
      shikshaMitraToast.error({ message: 'Failed to save refund policy.' });
    }
  };

  // Live Calculator Logic
  const [calcAmount, setCalcAmount] = useState(5000);
  const calculatedRefund = useMemo(() => calcAmount, [calcAmount]);

  if (!open) return null;

  const sections: { key: SectionKey; label: string; content: React.ReactNode }[] = [
    {
      key: 'general',
      label: 'General Information',
      content: <SectionGeneral formik={formik} academicYears={academicYears || []} />,
    },
    {
      key: 'eligibility',
      label: 'Eligibility Rules',
      content: <SectionEligibility formik={formik} feeHeads={feeHeads} />,
    },
    {
      key: 'processing',
      label: 'Payment Processing',
      content: <SectionProcessing formik={formik} />,
    },
    {
      key: 'accounting',
      label: 'Accounting & Compliance',
      content: <SectionAccounting formik={formik} />,
    },
  ];

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.paper' }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 3,
          py: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid',
          borderColor: 'divider',
          flexShrink: 0,
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={700}>
            {editData ? 'Edit Refund Policy' : 'Create Refund Policy'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Configure reusable refund criteria, eligibility requirements, compliance, and payment
            rules.
          </Typography>
        </Box>
        <Button
          size="small"
          onClick={handleCloseAttempt}
          startIcon={<Iconify icon="mdi:close" />}
          color="inherit"
        >
          Close
        </Button>
      </Box>

      {/* Main Body */}
      <Box sx={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {/* Scrollable Form */}
        <Scrollbar sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ p: 3, pb: 6 }}>
            {sections.map((s) => (
              <CustomAccordion
                key={s.key}
                title={s.label}
                expanded={expandedSections.has(s.key)}
                onChange={() => toggleSection(s.key)}
                isActive={expandedSections.has(s.key)}
                content={s.content}
              />
            ))}
          </Box>
        </Scrollbar>

        {/* Sticky Right Summary Panel */}
        <Box
          sx={{
            width: 300,
            flexShrink: 0,
            display: { xs: 'none', lg: 'flex' },
            flexDirection: 'column',
            borderLeft: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
            bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'background.neutral' : 'grey.50'),
          }}
        >
          <Scrollbar sx={{ flex: 1 }}>
            <Box sx={{ p: 2 }}>
              {/* Summary */}
              <Typography
                variant="overline"
                sx={{
                  fontSize: '0.6rem',
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  color: 'text.secondary',
                }}
              >
                Live Summary
              </Typography>
              <Stack spacing={0.75} mt={1} mb={2.5}>
                <SummaryRow
                  label="Policy Name"
                  value={
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      sx={{
                        maxWidth: 140,
                        textAlign: 'right',
                        wordBreak: 'break-word',
                        fontSize: '0.7rem',
                      }}
                    >
                      {formik.values.policyName || '—'}
                    </Typography>
                  }
                />
                <SummaryRow
                  label="Status"
                  value={
                    <Chip
                      label={formik.values.status}
                      size="small"
                      color={formik.values.status === 'Active' ? 'success' : 'default'}
                      sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700 }}
                    />
                  }
                />
                <SummaryRow
                  label="Refund On"
                  value={
                    <Typography variant="caption" fontWeight={600} fontSize="0.7rem">
                      {formik.values.refundOn === 'FullPayment'
                        ? 'Full Payment'
                        : 'Partial + Full Payment'}
                    </Typography>
                  }
                />
                <SummaryRow
                  label="Refund for Charges"
                  value={
                    <Chip
                      label={formik.values.enableRefundForCharge ? 'Yes' : 'No'}
                      size="small"
                      color={formik.values.enableRefundForCharge ? 'primary' : 'default'}
                      variant={formik.values.enableRefundForCharge ? 'filled' : 'outlined'}
                      sx={{ height: 18, fontSize: '0.6rem' }}
                    />
                  }
                />
                <SummaryRow
                  label="Due Within"
                  value={
                    <Typography variant="caption" fontWeight={600} fontSize="0.7rem">
                      {formik.values.refundDueWithin} days
                    </Typography>
                  }
                />
                <SummaryRow
                  label="Consider as Expense"
                  value={
                    <Chip
                      label={formik.values.considerAsExpense ? 'Yes' : 'No'}
                      size="small"
                      color={formik.values.considerAsExpense ? 'warning' : 'default'}
                      variant={formik.values.considerAsExpense ? 'filled' : 'outlined'}
                      sx={{ height: 18, fontSize: '0.6rem' }}
                    />
                  }
                />
              </Stack>

              <Divider sx={{ my: 1.5 }} />

              {/* Live Calculator */}
              <Typography
                variant="overline"
                sx={{
                  fontSize: '0.6rem',
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  color: 'text.secondary',
                }}
              >
                Refund Simulation
              </Typography>
              <Stack spacing={1.5} mt={1} mb={2.5}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Paid Amount (₹)"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(Math.max(0, +e.target.value))}
                  inputProps={{ style: { fontSize: '11px', padding: '6px 8px' } }}
                />

                <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'action.hover' }}>
                  <Stack spacing={0.5}>
                    <Box display="flex" justifyContent="space-between">
                      <Typography sx={{ fontSize: '11px' }}>Paid Amount:</Typography>
                      <Typography sx={{ fontSize: '11px' }} fontWeight={700}>
                        ₹{calcAmount}
                      </Typography>
                    </Box>
                    <Box display="flex" justifyContent="space-between">
                      <Typography sx={{ fontSize: '11px' }}>Refunding Fee Heads:</Typography>
                      <Typography sx={{ fontSize: '11px' }} fontWeight={700}>
                        {formik.values.applicableFeeHeads.length} item(s)
                      </Typography>
                    </Box>
                    <Divider sx={{ my: 0.5 }} />
                    <Box display="flex" justifyContent="space-between">
                      <Typography sx={{ fontSize: '11px' }} fontWeight={600}>
                        Estimated Refund:
                      </Typography>
                      <Typography sx={{ fontSize: '11px' }} fontWeight={700} color="success.main">
                        ₹{calculatedRefund}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Stack>

              <Divider sx={{ my: 1.5 }} />

              {/* Validation panel */}
              <Typography
                variant="overline"
                sx={{
                  fontSize: '0.6rem',
                  fontWeight: 800,
                  letterSpacing: '0.1em',
                  color: 'text.secondary',
                }}
              >
                Validation Panel
              </Typography>
              <Stack spacing={0.5} mt={1}>
                <ValidationCheck
                  label="General Info Completed"
                  valid={checks.nameValid && checks.yearValid}
                />
                <ValidationCheck label="Applicable Fee Heads Selected" valid={checks.headsValid} />
                <ValidationCheck label="Payment Process Configured" valid={checks.dueValid} />
                {checks.isReadyToPublish ? (
                  <Chip
                    label="Ready to Publish"
                    size="small"
                    color="success"
                    sx={{ mt: 1, height: 20, fontSize: '10px' }}
                  />
                ) : (
                  <Chip
                    label="Requires Fields Completion"
                    size="small"
                    color="warning"
                    sx={{ mt: 1, height: 20, fontSize: '10px' }}
                  />
                )}
              </Stack>
            </Box>
          </Scrollbar>
        </Box>
      </Box>

      {/* Sticky Footer */}
      <Stack
        direction="row"
        justifyContent="flex-end"
        spacing={1.5}
        sx={{
          px: { xs: 2, sm: 3 },
          py: 1.5,
          bgcolor: 'background.paper',
          position: 'sticky',
          bottom: 0,
          zIndex: 1,
        }}
      >
        <Button
          variant="outlined"
          color="inherit"
          onClick={handleCloseAttempt}
          size="small"
          startIcon={<Iconify icon="basil:cross-solid" />}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <LoadingButton
          variant="contained"
          color="primary"
          loading={isSaving}
          onClick={() => handleCustomSubmit('Active')}
          size="small"
          startIcon={<Iconify icon="material-symbols-light:save" width={20} height={20} />}
          disabled={!checks.isReadyToPublish}
          sx={{ minWidth: 90 }}
        >
          Submit
        </LoadingButton>
      </Stack>

      {/* Unsaved changes confirmation dialog */}
      <ConfirmDialog
        open={unsavedChangesDialog.value}
        icon="warning"
        onClose={unsavedChangesDialog.onFalse}
        title="Unsaved Changes"
        content="You have unsaved changes in this policy form. Are you sure you want to discard them?"
        action={
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => {
              unsavedChangesDialog.onFalse();
              onClose();
            }}
          >
            Discard
          </Button>
        }
      />
    </Box>
  );
};

export default RefundPolicyDrawer;
