'use client';

/**
 * PaymentPolicyDrawer
 *
 * Large right-side drawer for creating / editing a Payment Policy.
 * Architecture mirrors AttendancePolicyDrawer.tsx from HR module.
 *
 * Sections (all collapsible via existing CustomAccordion):
 *  1. General Information
 *  2. Payment Behaviour
 *  3. Partial Payment Rules
 *  4. Allocation Rules
 *  5. Advance Payment
 *  6. Receipt Rules
 *  7. Demand Generation
 *  8. Reminder Rules
 *  9. Payment Modes
 * 10. Approval Rules
 * 11. Security
 * 12. Audit
 */

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
import {
  useCreateFinancePolicyMutation,
  useUpdateFinancePolicyMutation,
} from 'src/redux/finance/financePolicy';
import {
  Box,
  Card,
  Grid,
  Stack,
  Button,
  Switch,
  Select,
  Divider,
  MenuItem,
  Checkbox,
  TextField,
  Typography,
  InputLabel,
  FormControl,
  FormHelperText,
  InputAdornment,
  FormControlLabel,
} from '@mui/material';

import type { IFinancePolicyRow, IPaymentPolicyFormValues } from '../types/finance-policy.types';

// ─── helpers ─────────────────────────────────────────────────────────────────

const ALLOCATION_OPTIONS = [
  { value: 'FeeHeadPriority', label: 'Fee Head Priority' },
  { value: 'Proportional', label: 'Proportional' },
  { value: 'FIFO', label: 'FIFO (First-In First-Out)' },
  { value: 'Manual', label: 'Manual' },
];

const MIN_PAYMENT_TYPE_OPTIONS = [
  { value: 'FixedAmount', label: 'Fixed Amount (₹)' },
  { value: 'Percentage', label: 'Percentage (%)' },
  { value: 'InstallmentAmount', label: 'Full Installment Amount' },
];

const RECEIPT_MODE_OPTIONS = [
  { value: 'Immediate', label: 'Immediate' },
  { value: 'OnApproval', label: 'On Approval' },
  { value: 'OnSettlement', label: 'On Settlement' },
];

const STATUS_OPTIONS = [
  { value: 'Draft', label: 'Draft' },
  { value: 'Active', label: 'Active' },
  { value: 'Inactive', label: 'Inactive' },
];

// ─── Initial values ───────────────────────────────────────────────────────────

const getInitialValues = (
  editData: IFinancePolicyRow | null | undefined,
  academicYearId: string
): IPaymentPolicyFormValues => ({
  policyName: '',
  policyCode: '',
  description: '',
  status: 'Draft',
  academicYearId: academicYearId || '',
  effectiveFrom: null,
  effectiveTo: null,
  isDefault: false,
  policyType: 'payment',
  allowPartialPayment: false,
  minimumPaymentType: 'FixedAmount',
  minimumPaymentValue: null,
  allocationMethod: 'FeeHeadPriority',
  advancePaymentAllowed: false,
  receiptGeneration: 'Immediate',
  autoDemand: false,
  autoReminder: false,
  partialPaymentMinimumAmount: null,
  partialPaymentMinimumPercentage: null,
  advancePaymentMaxAmount: null,
  advancePaymentCarryForward: false,
  receiptPrefix: 'RCP',
  receiptStartNumber: 1,
  separateReceiptPerFeeHead: false,
  demandGenerationDaysBefore: 7,
  demandAutoApprove: false,
  reminderDaysBefore: 3,
  reminderFrequencyDays: 7,
  reminderMaxCount: 3,
  paymentModes: {
    cash: true,
    cheque: false,
    upi: true,
    card: false,
    neft: false,
    onlineGateway: false,
    cashLimit: null,
  },
  requireApprovalAboveAmount: null,
  approvalRoleIds: [],
  allowRefund: true,
  allowAdjustment: true,
  allowWriteOff: false,
});

// ─── Validation schema ────────────────────────────────────────────────────────

const validationSchema = Yup.object({
  policyName: Yup.string().required('Policy name is required'),
  academicYearId: Yup.string().required('Academic year is required'),
  effectiveTo: Yup.mixed().test(
    'date-order',
    'Effective To must be on or after Effective From',
    function (value) {
      const { effectiveFrom } = this.parent;
      if (!effectiveFrom || !value) return true;
      return dayjs(value as string).isSameOrAfter(dayjs(effectiveFrom as string), 'day');
    }
  ),
  minimumPaymentValue: Yup.number()
    .nullable()
    .when('allowPartialPayment', {
      is: true,
      then: (s) =>
        s
          .required('Minimum payment value is required when partial payment is enabled')
          .min(1, 'Must be greater than 0'),
    }),
});

// ─── Live Summary Panel ───────────────────────────────────────────────────────

const LiveSummaryPanel = ({ values }: { values: IPaymentPolicyFormValues }) => (
  <Card
    variant="outlined"
    sx={{ p: 2, borderRadius: 2, position: 'sticky', top: 0, minWidth: 220 }}
  >
    <Typography variant="subtitle2" mb={1.5} color="primary">
      Live Summary
    </Typography>
    <Stack spacing={1}>
      <SummaryRow
        label="Partial Payment"
        value={values.allowPartialPayment ? 'Allowed' : 'Not Allowed'}
        color={values.allowPartialPayment ? 'success.main' : 'text.secondary'}
      />
      <SummaryRow label="Allocation Rule" value={values.allocationMethod || '-'} />
      <SummaryRow label="Receipt Type" value={values.receiptGeneration || '-'} />
      <SummaryRow
        label="Auto Demand"
        value={values.autoDemand ? 'Enabled' : 'Disabled'}
        color={values.autoDemand ? 'success.main' : 'text.secondary'}
      />
      <SummaryRow
        label="Auto Reminder"
        value={values.autoReminder ? 'Enabled' : 'Disabled'}
        color={values.autoReminder ? 'success.main' : 'text.secondary'}
      />
      <Divider />
      <SummaryRow
        label="Payment Modes"
        value={
          [
            values.paymentModes.cash && 'Cash',
            values.paymentModes.upi && 'UPI',
            values.paymentModes.card && 'Card',
            values.paymentModes.cheque && 'Cheque',
            values.paymentModes.neft && 'NEFT',
            values.paymentModes.onlineGateway && 'Gateway',
          ]
            .filter(Boolean)
            .join(', ') || 'None'
        }
      />
      <Divider />
      <SummaryRow
        label="Policy Status"
        value={values.status}
        color={
          values.status === 'Published' || values.status === 'Active'
            ? 'success.main'
            : values.status === 'Draft'
              ? 'warning.main'
              : 'text.secondary'
        }
      />
    </Stack>
  </Card>
);

const SummaryRow = ({
  label,
  value,
  color = 'text.primary',
}: {
  label: string;
  value: string;
  color?: string;
}) => (
  <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={1}>
    <Typography variant="caption" color="text.secondary" noWrap>
      {label}
    </Typography>
    <Typography variant="caption" fontWeight={600} color={color} textAlign="right">
      {value}
    </Typography>
  </Box>
);

// ─── Section: General Information ────────────────────────────────────────────

const SectionGeneral = ({
  formik,
  academicYears,
}: {
  formik: ReturnType<typeof useFormik<IPaymentPolicyFormValues>>;
  academicYears: any[];
}) => (
  <Grid container spacing={2} p={2}>
    <Grid size={{ xs: 12, sm: 6 }}>
      <FormControl fullWidth size="small" error={Boolean(formik.errors.academicYearId)}>
        <InputLabel>Academic Year *</InputLabel>
        <Select
          label="Academic Year *"
          name="academicYearId"
          value={formik.values.academicYearId}
          onChange={formik.handleChange}
        >
          {academicYears.map((y) => (
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

    <Grid size={{ xs: 12, sm: 6 }}>
      <TextField
        fullWidth
        size="small"
        label="Policy Code (Auto-generated)"
        name="policyCode"
        value={formik.values.policyCode}
        InputProps={{ readOnly: true }}
        sx={{ '& input': { color: 'text.secondary' } }}
      />
    </Grid>

    <Grid size={{ xs: 12, sm: 6 }}>
      <FormControl fullWidth size="small">
        <InputLabel>Status</InputLabel>
        <Select
          label="Status"
          name="status"
          value={formik.values.status}
          onChange={formik.handleChange}
        >
          {STATUS_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
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
      />
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
      <FormControlLabel
        control={
          <Switch
            checked={formik.values.isDefault}
            onChange={(e) => formik.setFieldValue('isDefault', e.target.checked)}
            size="small"
          />
        }
        label={
          <Typography variant="body2">
            Set as Default Policy{' '}
            <Typography component="span" variant="caption" color="text.secondary">
              (Only one default per academic year)
            </Typography>
          </Typography>
        }
      />
    </Grid>
  </Grid>
);

// ─── Section: Payment Behaviour ──────────────────────────────────────────────

const SectionPaymentBehaviour = ({
  formik,
}: {
  formik: ReturnType<typeof useFormik<IPaymentPolicyFormValues>>;
}) => (
  <Grid container spacing={2} p={2}>
    <Grid size={{ xs: 12, sm: 6 }}>
      <FormControlLabel
        control={
          <Switch
            checked={formik.values.allowPartialPayment}
            onChange={(e) => formik.setFieldValue('allowPartialPayment', e.target.checked)}
            size="small"
          />
        }
        label="Allow Partial Payment"
      />
    </Grid>

    {formik.values.allowPartialPayment && (
      <>
        <Grid size={{ xs: 12, sm: 6 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Minimum Payment Type</InputLabel>
            <Select
              label="Minimum Payment Type"
              name="minimumPaymentType"
              value={formik.values.minimumPaymentType}
              onChange={formik.handleChange}
            >
              {MIN_PAYMENT_TYPE_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label={
              formik.values.minimumPaymentType === 'Percentage'
                ? 'Minimum Payment (%)'
                : 'Minimum Payment (₹)'
            }
            name="minimumPaymentValue"
            value={formik.values.minimumPaymentValue ?? ''}
            onChange={formik.handleChange}
            error={Boolean(formik.errors.minimumPaymentValue)}
            helperText={formik.errors.minimumPaymentValue as string}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  {formik.values.minimumPaymentType === 'Percentage' ? '%' : '₹'}
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </>
    )}

    <Grid size={{ xs: 12, sm: 6 }}>
      <FormControl fullWidth size="small">
        <InputLabel>Allocation Method</InputLabel>
        <Select
          label="Allocation Method"
          name="allocationMethod"
          value={formik.values.allocationMethod}
          onChange={formik.handleChange}
        >
          {ALLOCATION_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Grid>

    <Grid size={{ xs: 12, sm: 6 }}>
      <FormControl fullWidth size="small">
        <InputLabel>Receipt Generation</InputLabel>
        <Select
          label="Receipt Generation"
          name="receiptGeneration"
          value={formik.values.receiptGeneration}
          onChange={formik.handleChange}
        >
          {RECEIPT_MODE_OPTIONS.map((o) => (
            <MenuItem key={o.value} value={o.value}>
              {o.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Grid>

    <Grid size={{ xs: 12, sm: 4 }}>
      <FormControlLabel
        control={
          <Switch
            checked={formik.values.advancePaymentAllowed}
            onChange={(e) => formik.setFieldValue('advancePaymentAllowed', e.target.checked)}
            size="small"
          />
        }
        label="Advance Payment Allowed"
      />
    </Grid>

    <Grid size={{ xs: 12, sm: 4 }}>
      <FormControlLabel
        control={
          <Switch
            checked={formik.values.autoDemand}
            onChange={(e) => formik.setFieldValue('autoDemand', e.target.checked)}
            size="small"
          />
        }
        label="Auto Demand Generation"
      />
    </Grid>

    <Grid size={{ xs: 12, sm: 4 }}>
      <FormControlLabel
        control={
          <Switch
            checked={formik.values.autoReminder}
            onChange={(e) => formik.setFieldValue('autoReminder', e.target.checked)}
            size="small"
          />
        }
        label="Auto Reminder"
      />
    </Grid>
  </Grid>
);

// ─── Section: Partial Payment Rules ──────────────────────────────────────────

const SectionPartialPayment = ({
  formik,
}: {
  formik: ReturnType<typeof useFormik<IPaymentPolicyFormValues>>;
}) => (
  <Grid container spacing={2} p={2}>
    {!formik.values.allowPartialPayment && (
      <Grid size={{ xs: 12 }}>
        <Typography variant="caption" color="text.secondary">
          Enable &quot;Allow Partial Payment&quot; in Payment Behaviour to configure these rules.
        </Typography>
      </Grid>
    )}
    <Grid size={{ xs: 12, sm: 6 }}>
      <TextField
        fullWidth
        size="small"
        type="number"
        label="Minimum Amount (₹)"
        name="partialPaymentMinimumAmount"
        value={formik.values.partialPaymentMinimumAmount ?? ''}
        onChange={formik.handleChange}
        disabled={!formik.values.allowPartialPayment}
        InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
      />
    </Grid>
    <Grid size={{ xs: 12, sm: 6 }}>
      <TextField
        fullWidth
        size="small"
        type="number"
        label="Minimum Percentage (%)"
        name="partialPaymentMinimumPercentage"
        value={formik.values.partialPaymentMinimumPercentage ?? ''}
        onChange={formik.handleChange}
        disabled={!formik.values.allowPartialPayment}
        InputProps={{ startAdornment: <InputAdornment position="start">%</InputAdornment> }}
      />
    </Grid>
  </Grid>
);

// ─── Section: Advance Payment ─────────────────────────────────────────────────

const SectionAdvancePayment = ({
  formik,
}: {
  formik: ReturnType<typeof useFormik<IPaymentPolicyFormValues>>;
}) => (
  <Grid container spacing={2} p={2}>
    <Grid size={{ xs: 12, sm: 6 }}>
      <TextField
        fullWidth
        size="small"
        type="number"
        label="Maximum Advance Amount (₹)"
        name="advancePaymentMaxAmount"
        value={formik.values.advancePaymentMaxAmount ?? ''}
        onChange={formik.handleChange}
        disabled={!formik.values.advancePaymentAllowed}
        InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
      />
    </Grid>
    <Grid size={{ xs: 12, sm: 6 }}>
      <FormControlLabel
        control={
          <Switch
            checked={formik.values.advancePaymentCarryForward}
            onChange={(e) => formik.setFieldValue('advancePaymentCarryForward', e.target.checked)}
            disabled={!formik.values.advancePaymentAllowed}
            size="small"
          />
        }
        label="Carry Forward to Next Year"
      />
    </Grid>
  </Grid>
);

// ─── Section: Receipt Rules ───────────────────────────────────────────────────

const SectionReceiptRules = ({
  formik,
}: {
  formik: ReturnType<typeof useFormik<IPaymentPolicyFormValues>>;
}) => (
  <Grid container spacing={2} p={2}>
    <Grid size={{ xs: 12, sm: 4 }}>
      <TextField
        fullWidth
        size="small"
        label="Receipt Prefix"
        name="receiptPrefix"
        value={formik.values.receiptPrefix}
        onChange={formik.handleChange}
      />
    </Grid>
    <Grid size={{ xs: 12, sm: 4 }}>
      <TextField
        fullWidth
        size="small"
        type="number"
        label="Starting Number"
        name="receiptStartNumber"
        value={formik.values.receiptStartNumber ?? ''}
        onChange={formik.handleChange}
      />
    </Grid>
    <Grid size={{ xs: 12, sm: 4 }}>
      <FormControlLabel
        control={
          <Switch
            checked={formik.values.separateReceiptPerFeeHead}
            onChange={(e) => formik.setFieldValue('separateReceiptPerFeeHead', e.target.checked)}
            size="small"
          />
        }
        label="Separate Receipt per Fee Head"
      />
    </Grid>
  </Grid>
);

// ─── Section: Demand Generation ───────────────────────────────────────────────

const SectionDemandGeneration = ({
  formik,
}: {
  formik: ReturnType<typeof useFormik<IPaymentPolicyFormValues>>;
}) => (
  <Grid container spacing={2} p={2}>
    <Grid size={{ xs: 12, sm: 6 }}>
      <TextField
        fullWidth
        size="small"
        type="number"
        label="Generate Demand (days before due)"
        name="demandGenerationDaysBefore"
        value={formik.values.demandGenerationDaysBefore ?? ''}
        onChange={formik.handleChange}
        disabled={!formik.values.autoDemand}
        InputProps={{ endAdornment: <InputAdornment position="end">days</InputAdornment> }}
      />
    </Grid>
    <Grid size={{ xs: 12, sm: 6 }}>
      <FormControlLabel
        control={
          <Switch
            checked={formik.values.demandAutoApprove}
            onChange={(e) => formik.setFieldValue('demandAutoApprove', e.target.checked)}
            disabled={!formik.values.autoDemand}
            size="small"
          />
        }
        label="Auto-Approve Demand"
      />
    </Grid>
  </Grid>
);

// ─── Section: Reminder Rules ──────────────────────────────────────────────────

const SectionReminderRules = ({
  formik,
}: {
  formik: ReturnType<typeof useFormik<IPaymentPolicyFormValues>>;
}) => (
  <Grid container spacing={2} p={2}>
    <Grid size={{ xs: 12, sm: 4 }}>
      <TextField
        fullWidth
        size="small"
        type="number"
        label="First Reminder (days before due)"
        name="reminderDaysBefore"
        value={formik.values.reminderDaysBefore ?? ''}
        onChange={formik.handleChange}
        disabled={!formik.values.autoReminder}
        InputProps={{ endAdornment: <InputAdornment position="end">days</InputAdornment> }}
      />
    </Grid>
    <Grid size={{ xs: 12, sm: 4 }}>
      <TextField
        fullWidth
        size="small"
        type="number"
        label="Reminder Frequency"
        name="reminderFrequencyDays"
        value={formik.values.reminderFrequencyDays ?? ''}
        onChange={formik.handleChange}
        disabled={!formik.values.autoReminder}
        InputProps={{ endAdornment: <InputAdornment position="end">days</InputAdornment> }}
      />
    </Grid>
    <Grid size={{ xs: 12, sm: 4 }}>
      <TextField
        fullWidth
        size="small"
        type="number"
        label="Max Reminder Count"
        name="reminderMaxCount"
        value={formik.values.reminderMaxCount ?? ''}
        onChange={formik.handleChange}
        disabled={!formik.values.autoReminder}
      />
    </Grid>
  </Grid>
);

// ─── Section: Payment Modes ───────────────────────────────────────────────────

const SectionPaymentModes = ({
  formik,
}: {
  formik: ReturnType<typeof useFormik<IPaymentPolicyFormValues>>;
}) => {
  const modeField = (key: keyof typeof formik.values.paymentModes, label: string) => (
    <Grid size={{ xs: 6, sm: 4 }} key={key}>
      <FormControlLabel
        control={
          <Checkbox
            size="small"
            checked={Boolean(formik.values.paymentModes[key])}
            onChange={(e) => formik.setFieldValue(`paymentModes.${key}`, e.target.checked)}
          />
        }
        label={label}
      />
    </Grid>
  );

  return (
    <Grid container spacing={1} p={2}>
      {modeField('cash', 'Cash')}
      {modeField('cheque', 'Cheque')}
      {modeField('upi', 'UPI')}
      {modeField('card', 'Card')}
      {modeField('neft', 'NEFT / RTGS')}
      {modeField('onlineGateway', 'Online Gateway')}

      {formik.values.paymentModes.cash && (
        <Grid size={{ xs: 12, sm: 6 }}>
          <TextField
            fullWidth
            size="small"
            type="number"
            label="Cash Limit per Transaction (₹)"
            name="paymentModes.cashLimit"
            value={formik.values.paymentModes.cashLimit ?? ''}
            onChange={formik.handleChange}
            InputProps={{
              startAdornment: <InputAdornment position="start">₹</InputAdornment>,
            }}
          />
        </Grid>
      )}
    </Grid>
  );
};

// ─── Section: Approval Rules ──────────────────────────────────────────────────

const SectionApprovalRules = ({
  formik,
}: {
  formik: ReturnType<typeof useFormik<IPaymentPolicyFormValues>>;
}) => (
  <Grid container spacing={2} p={2}>
    <Grid size={{ xs: 12, sm: 6 }}>
      <TextField
        fullWidth
        size="small"
        type="number"
        label="Require Approval above Amount (₹)"
        name="requireApprovalAboveAmount"
        value={formik.values.requireApprovalAboveAmount ?? ''}
        onChange={formik.handleChange}
        InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
        helperText="Leave blank to skip approval"
      />
    </Grid>
  </Grid>
);

// ─── Section: Security ────────────────────────────────────────────────────────

const SectionSecurity = ({
  formik,
}: {
  formik: ReturnType<typeof useFormik<IPaymentPolicyFormValues>>;
}) => (
  <Grid container spacing={2} p={2}>
    <Grid size={{ xs: 12, sm: 4 }}>
      <FormControlLabel
        control={
          <Switch
            checked={formik.values.allowRefund}
            onChange={(e) => formik.setFieldValue('allowRefund', e.target.checked)}
            size="small"
          />
        }
        label="Allow Refund"
      />
    </Grid>
    <Grid size={{ xs: 12, sm: 4 }}>
      <FormControlLabel
        control={
          <Switch
            checked={formik.values.allowAdjustment}
            onChange={(e) => formik.setFieldValue('allowAdjustment', e.target.checked)}
            size="small"
          />
        }
        label="Allow Adjustment"
      />
    </Grid>
    <Grid size={{ xs: 12, sm: 4 }}>
      <FormControlLabel
        control={
          <Switch
            checked={formik.values.allowWriteOff}
            onChange={(e) => formik.setFieldValue('allowWriteOff', e.target.checked)}
            size="small"
          />
        }
        label="Allow Write-Off"
      />
    </Grid>
  </Grid>
);

// ─── Main Drawer Component ────────────────────────────────────────────────────

interface PaymentPolicyDrawerProps {
  open: boolean;
  onClose: () => void;
  editData?: IFinancePolicyRow | null;
  academicYearId?: string;
}

type SectionKey =
  | 'general'
  | 'behaviour'
  | 'partial'
  | 'allocation'
  | 'advance'
  | 'receipt'
  | 'demand'
  | 'reminder'
  | 'modes'
  | 'approval'
  | 'security';

const SECTION_KEYS: SectionKey[] = [
  'general',
  'behaviour',
  'partial',
  'allocation',
  'advance',
  'receipt',
  'demand',
  'reminder',
  'modes',
  'approval',
  'security',
];

const SECTION_LABELS: Record<SectionKey, string> = {
  general: 'General Information',
  behaviour: 'Payment Behaviour',
  partial: 'Partial Payment Rules',
  allocation: 'Allocation Rules',
  advance: 'Advance Payment',
  receipt: 'Receipt Rules',
  demand: 'Demand Generation',
  reminder: 'Reminder Rules',
  modes: 'Payment Modes',
  approval: 'Approval Rules',
  security: 'Security',
};

const PaymentPolicyDrawer: React.FC<PaymentPolicyDrawerProps> = ({
  open,
  onClose,
  editData,
  academicYearId = '',
}) => {
  const { currentYear, academicYears } = useSelector((state: RootState) => state.globalState);

  // Track which sections are expanded
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
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  // ── Mutations ──────────────────────────────────────────────────────────────

  const [createPolicy, { isLoading: isCreating }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCreateFinancePolicyMutation,
  });

  const [updatePolicy, { isLoading: isUpdating }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateFinancePolicyMutation,
  });

  const isSaving = isCreating || isUpdating;

  // ── Formik ─────────────────────────────────────────────────────────────────

  const formik = useFormik<IPaymentPolicyFormValues>({
    initialValues: getInitialValues(editData, academicYearId || currentYear?.id || ''),
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      // Handled manually by footer buttons
    },
  });

  // Live validation checks
  const checks = useMemo(() => {
    const v = formik.values;
    const nameValid = v.policyName.trim().length > 0;
    const yearValid = !!v.academicYearId;
    const partialValid =
      !v.allowPartialPayment || (v.minimumPaymentValue !== null && v.minimumPaymentValue > 0);
    const dateValid =
      !v.effectiveFrom ||
      !v.effectiveTo ||
      dayjs(v.effectiveTo).isSameOrAfter(dayjs(v.effectiveFrom), 'day');

    const isReadyToPublish = nameValid && yearValid && partialValid && dateValid;

    return {
      nameValid,
      yearValid,
      partialValid,
      dateValid,
      isReadyToPublish,
    };
  }, [formik.values]);

  const handleCustomSubmit = async (overrideStatus?: 'Active' | 'Inactive' | 'Draft') => {
    const errors = await formik.validateForm();
    const hasErrors = Object.keys(errors).length > 0;
    if (hasErrors) {
      formik.setTouched({
        policyName: true,
        academicYearId: true,
        minimumPaymentValue: true,
        effectiveTo: true,
      });
      shikshaMitraToast.error({ message: 'Fix all errors before saving.' });
      return;
    }

    try {
      const payload = {
        ...formik.values,
        status: overrideStatus || formik.values.status,
        policyType: 'payment',
      };

      if (editData?.id) {
        await updatePolicy({ id: editData.id, body: payload });
        shikshaMitraToast.success({ message: `Payment policy "${payload.policyName}" updated.` });
      } else {
        await createPolicy(payload);
        shikshaMitraToast.success({ message: `Payment policy "${payload.policyName}" created.` });
      }
      formik.resetForm();
      onClose();
    } catch {
      shikshaMitraToast.error({ message: 'Failed to save payment policy.' });
    }
  };

  // Auto-generate policy code from name
  useEffect(() => {
    if (!editData && formik.values.policyName) {
      const code = `PP-${formik.values.policyName
        .toUpperCase()
        .replace(/\s+/g, '-')
        .slice(0, 12)}-${Date.now().toString().slice(-4)}`;
      formik.setFieldValue('policyCode', code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.policyName, editData]);

  if (!open) return null;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
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
            {editData ? 'Edit Payment Policy' : 'Create Payment Policy'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {editData
              ? 'Update the payment policy configuration.'
              : 'Define payment collection rules, allocation, modes, and approval workflows.'}
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

      {/* Body — scroll area split: sections (left) + live summary (right) */}
      <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Sections */}
        <Scrollbar sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ p: 0 }}>
            {/* 1. General */}
            <CustomAccordion
              title={SECTION_LABELS.general}
              expanded={expandedSections.has('general')}
              onChange={() => toggleSection('general')}
              isActive={expandedSections.has('general')}
              content={<SectionGeneral formik={formik} academicYears={academicYears || []} />}
            />

            {/* 2. Payment Behaviour */}
            <CustomAccordion
              title={SECTION_LABELS.behaviour}
              expanded={expandedSections.has('behaviour')}
              onChange={() => toggleSection('behaviour')}
              isActive={expandedSections.has('behaviour')}
              content={<SectionPaymentBehaviour formik={formik} />}
            />

            {/* 3. Partial Payment Rules */}
            <CustomAccordion
              title={SECTION_LABELS.partial}
              expanded={expandedSections.has('partial')}
              onChange={() => toggleSection('partial')}
              isActive={expandedSections.has('partial')}
              content={<SectionPartialPayment formik={formik} />}
            />

            {/* 4. Allocation Rules — info card */}
            <CustomAccordion
              title={SECTION_LABELS.allocation}
              expanded={expandedSections.has('allocation')}
              onChange={() => toggleSection('allocation')}
              isActive={expandedSections.has('allocation')}
              content={
                <Box p={2}>
                  <Typography variant="caption" color="text.secondary">
                    Allocation method is configured in Payment Behaviour above. Current:{' '}
                    <strong>{formik.values.allocationMethod}</strong>
                  </Typography>
                </Box>
              }
            />

            {/* 5. Advance Payment */}
            <CustomAccordion
              title={SECTION_LABELS.advance}
              expanded={expandedSections.has('advance')}
              onChange={() => toggleSection('advance')}
              isActive={expandedSections.has('advance')}
              content={<SectionAdvancePayment formik={formik} />}
            />

            {/* 6. Receipt Rules */}
            <CustomAccordion
              title={SECTION_LABELS.receipt}
              expanded={expandedSections.has('receipt')}
              onChange={() => toggleSection('receipt')}
              isActive={expandedSections.has('receipt')}
              content={<SectionReceiptRules formik={formik} />}
            />

            {/* 7. Demand Generation */}
            <CustomAccordion
              title={SECTION_LABELS.demand}
              expanded={expandedSections.has('demand')}
              onChange={() => toggleSection('demand')}
              isActive={expandedSections.has('demand')}
              content={<SectionDemandGeneration formik={formik} />}
            />

            {/* 8. Reminder Rules */}
            <CustomAccordion
              title={SECTION_LABELS.reminder}
              expanded={expandedSections.has('reminder')}
              onChange={() => toggleSection('reminder')}
              isActive={expandedSections.has('reminder')}
              content={<SectionReminderRules formik={formik} />}
            />

            {/* 9. Payment Modes */}
            <CustomAccordion
              title={SECTION_LABELS.modes}
              expanded={expandedSections.has('modes')}
              onChange={() => toggleSection('modes')}
              isActive={expandedSections.has('modes')}
              content={<SectionPaymentModes formik={formik} />}
            />

            {/* 10. Approval Rules */}
            <CustomAccordion
              title={SECTION_LABELS.approval}
              expanded={expandedSections.has('approval')}
              onChange={() => toggleSection('approval')}
              isActive={expandedSections.has('approval')}
              content={<SectionApprovalRules formik={formik} />}
            />

            {/* 11. Security */}
            <CustomAccordion
              title={SECTION_LABELS.security}
              expanded={expandedSections.has('security')}
              onChange={() => toggleSection('security')}
              isActive={expandedSections.has('security')}
              content={<SectionSecurity formik={formik} />}
            />
          </Box>
        </Scrollbar>

        {/* Live Summary Panel */}
        <Box
          sx={{
            width: 240,
            flexShrink: 0,
            p: 2,
            borderLeft: '1px solid',
            borderColor: 'divider',
            display: { xs: 'none', md: 'block' },
            overflowY: 'auto',
          }}
        >
          <LiveSummaryPanel values={formik.values} />
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

export default PaymentPolicyDrawer;
