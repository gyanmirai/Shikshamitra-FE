'use client';

/**
 * ConcessionPolicyDrawer
 * Sections: General · Eligibility · Discount Rules · Applicable Fee Heads ·
 *           Approval Workflow · Stacking Rules · Government Rules · Validity
 */

import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import React, { useState, useEffect } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { shikshaMitraToast } from 'src/components/toast';
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
  Select,
  Switch,
  Divider,
  MenuItem,
  TextField,
  Typography,
  InputLabel,
  FormControl,
  DialogActions,
  FormHelperText,
  InputAdornment,
  FormControlLabel,
} from '@mui/material';

import type { IFinancePolicyRow, IConcessionPolicyFormValues } from '../types/finance-policy.types';

// ─── Constants ────────────────────────────────────────────────────────────────

const ELIGIBILITY_OPTIONS = [
  { value: 'Sibling', label: 'Sibling Concession' },
  { value: 'Staff', label: 'Staff Concession' },
  { value: 'MeritBased', label: 'Merit Based' },
  { value: 'NeedBased', label: 'Need Based' },
  { value: 'GovernmentScheme', label: 'Government Scheme' },
  { value: 'Custom', label: 'Custom' },
];

const DISCOUNT_TYPE_OPTIONS = [
  { value: 'Percentage', label: 'Percentage (%)' },
  { value: 'FlatAmount', label: 'Flat Amount (₹)' },
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
): IConcessionPolicyFormValues => ({
  policyName: '',
  policyCode: '',
  description: '',
  status: 'Draft',
  academicYearId: academicYearId || '',
  effectiveFrom: null,
  effectiveTo: null,
  isDefault: false,
  policyType: 'concession',
  eligibilityType: 'Custom',
  eligibilityCriteria: '',
  discountType: 'Percentage',
  discountValue: 0,
  maximumDiscountAmount: null,
  discountRules: [],
  applicableFeeHeads: [],
  requireApproval: true,
  approvalRoleIds: [],
  allowStacking: false,
  maximumStackingCount: null,
  governmentSchemeCode: '',
  governmentSchemeDetails: '',
  validFrom: null,
  validTo: null,
});

// ─── Validation ───────────────────────────────────────────────────────────────

const validationSchema = Yup.object({
  policyName: Yup.string().required('Policy name is required'),
  academicYearId: Yup.string().required('Academic year is required'),
  discountValue: Yup.number().min(0, 'Must be ≥ 0').required('Discount value is required'),
  effectiveTo: Yup.mixed().test(
    'date-order',
    'Effective To must be on or after Effective From',
    function (value) {
      const { effectiveFrom } = this.parent;
      if (!effectiveFrom || !value) return true;
      return dayjs(value as string).isSameOrAfter(dayjs(effectiveFrom as string), 'day');
    }
  ),
});

// ─── Summary Panel ────────────────────────────────────────────────────────────

const ConcessionSummaryPanel = ({ values }: { values: IConcessionPolicyFormValues }) => {
  const exampleAmount = 10000;
  const discount =
    values.discountType === 'Percentage'
      ? (exampleAmount * values.discountValue) / 100
      : values.discountValue;
  const capped = values.maximumDiscountAmount
    ? Math.min(discount, values.maximumDiscountAmount)
    : discount;

  return (
    <Card variant="outlined" sx={{ p: 2, borderRadius: 2, position: 'sticky', top: 0 }}>
      <Typography variant="subtitle2" mb={1.5} color="primary">
        Concession Summary
      </Typography>
      <Typography variant="caption" color="text.secondary" display="block" mb={1}>
        Example: ₹10,000 fee
      </Typography>
      <Stack spacing={0.75}>
        <SRow label="Eligibility" value={values.eligibilityType} />
        <SRow label="Discount Type" value={values.discountType} />
        <SRow
          label="Discount Value"
          value={`${values.discountValue}${values.discountType === 'Percentage' ? '%' : ' ₹'}`}
        />
        <SRow
          label="Discount Amount"
          value={`₹${discount.toLocaleString('en-IN')}`}
          color="warning.main"
        />
        {values.maximumDiscountAmount && (
          <SRow label="Capped At" value={`₹${capped.toLocaleString('en-IN')}`} />
        )}
        <Divider />
        <SRow
          label="Final Amount"
          value={`₹${(exampleAmount - capped).toLocaleString('en-IN')}`}
          color="success.main"
        />
        <SRow
          label="Approval Required"
          value={values.requireApproval ? 'Yes' : 'No'}
          color={values.requireApproval ? 'warning.main' : 'text.secondary'}
        />
        <SRow label="Stacking" value={values.allowStacking ? 'Allowed' : 'Not Allowed'} />
      </Stack>
    </Card>
  );
};

const SRow = ({
  label,
  value,
  color = 'text.primary',
}: {
  label: string;
  value: string;
  color?: string;
}) => (
  <Box display="flex" justifyContent="space-between" gap={1}>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="caption" fontWeight={600} color={color}>
      {value}
    </Typography>
  </Box>
);

// ─── Section Components ───────────────────────────────────────────────────────

const SectionGeneral = ({ formik, academicYears }: { formik: any; academicYears: any[] }) => (
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
        label="Policy Code (Auto)"
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
  </Grid>
);

const SectionEligibility = ({ formik }: { formik: any }) => (
  <Grid container spacing={2} p={2}>
    <Grid size={{ xs: 12, sm: 6 }}>
      <FormControl fullWidth size="small">
        <InputLabel>Eligibility Type</InputLabel>
        <Select
          label="Eligibility Type"
          name="eligibilityType"
          value={formik.values.eligibilityType}
          onChange={formik.handleChange}
        >
          {ELIGIBILITY_OPTIONS.map((o) => (
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
        label="Eligibility Criteria / Notes"
        name="eligibilityCriteria"
        value={formik.values.eligibilityCriteria}
        onChange={formik.handleChange}
        placeholder="Describe who qualifies for this concession..."
      />
    </Grid>
  </Grid>
);

const SectionDiscountRules = ({ formik }: { formik: any }) => (
  <Grid container spacing={2} p={2}>
    <Grid size={{ xs: 12, sm: 6 }}>
      <FormControl fullWidth size="small">
        <InputLabel>Discount Type</InputLabel>
        <Select
          label="Discount Type"
          name="discountType"
          value={formik.values.discountType}
          onChange={formik.handleChange}
        >
          {DISCOUNT_TYPE_OPTIONS.map((o) => (
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
        label={formik.values.discountType === 'Percentage' ? 'Discount (%)' : 'Discount Amount (₹)'}
        name="discountValue"
        value={formik.values.discountValue}
        onChange={formik.handleChange}
        error={Boolean(formik.errors.discountValue)}
        helperText={formik.errors.discountValue as string}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              {formik.values.discountType === 'Percentage' ? '%' : '₹'}
            </InputAdornment>
          ),
        }}
      />
    </Grid>
    <Grid size={{ xs: 12, sm: 6 }}>
      <TextField
        fullWidth
        size="small"
        type="number"
        label="Maximum Discount Amount (₹)"
        name="maximumDiscountAmount"
        value={formik.values.maximumDiscountAmount ?? ''}
        onChange={formik.handleChange}
        InputProps={{ startAdornment: <InputAdornment position="start">₹</InputAdornment> }}
        helperText="Leave blank for no cap"
      />
    </Grid>
  </Grid>
);

const SectionApprovalWorkflow = ({ formik }: { formik: any }) => (
  <Grid container spacing={2} p={2}>
    <Grid size={{ xs: 12 }}>
      <FormControlLabel
        control={
          <Switch
            checked={formik.values.requireApproval}
            onChange={(e) => formik.setFieldValue('requireApproval', e.target.checked)}
            size="small"
          />
        }
        label="Require Approval Before Applying Concession"
      />
    </Grid>
    {formik.values.requireApproval && (
      <Grid size={{ xs: 12 }}>
        <Typography variant="caption" color="text.secondary">
          Approval roles are configured in the Roles & Permissions module.
        </Typography>
      </Grid>
    )}
  </Grid>
);

const SectionStackingRules = ({ formik }: { formik: any }) => (
  <Grid container spacing={2} p={2}>
    <Grid size={{ xs: 12, sm: 6 }}>
      <FormControlLabel
        control={
          <Switch
            checked={formik.values.allowStacking}
            onChange={(e) => formik.setFieldValue('allowStacking', e.target.checked)}
            size="small"
          />
        }
        label="Allow Stacking Multiple Concessions"
      />
    </Grid>
    {formik.values.allowStacking && (
      <Grid size={{ xs: 12, sm: 6 }}>
        <TextField
          fullWidth
          size="small"
          type="number"
          label="Maximum Stacking Count"
          name="maximumStackingCount"
          value={formik.values.maximumStackingCount ?? ''}
          onChange={formik.handleChange}
          helperText="Max number of concessions that can be stacked"
        />
      </Grid>
    )}
  </Grid>
);

const SectionGovernmentRules = ({ formik }: { formik: any }) => (
  <Grid container spacing={2} p={2}>
    <Grid size={{ xs: 12, sm: 6 }}>
      <TextField
        fullWidth
        size="small"
        label="Government Scheme Code"
        name="governmentSchemeCode"
        value={formik.values.governmentSchemeCode}
        onChange={formik.handleChange}
        placeholder="e.g. RTE, EWS, SC/ST"
      />
    </Grid>
    <Grid size={{ xs: 12 }}>
      <TextField
        fullWidth
        size="small"
        multiline
        rows={2}
        label="Scheme Details"
        name="governmentSchemeDetails"
        value={formik.values.governmentSchemeDetails}
        onChange={formik.handleChange}
      />
    </Grid>
  </Grid>
);

const SectionValidity = ({ formik }: { formik: any }) => (
  <Grid container spacing={2} p={2}>
    <Grid size={{ xs: 12, sm: 6 }}>
      <DatePicker
        label="Valid From"
        value={formik.values.validFrom ? dayjs(formik.values.validFrom) : null}
        onChange={(d) => formik.setFieldValue('validFrom', d ? d.toISOString() : null)}
        slotProps={{ textField: { fullWidth: true, size: 'small' } }}
      />
    </Grid>
    <Grid size={{ xs: 12, sm: 6 }}>
      <DatePicker
        label="Valid To"
        value={formik.values.validTo ? dayjs(formik.values.validTo) : null}
        onChange={(d) => formik.setFieldValue('validTo', d ? d.toISOString() : null)}
        minDate={formik.values.validFrom ? dayjs(formik.values.validFrom) : undefined}
        slotProps={{ textField: { fullWidth: true, size: 'small' } }}
      />
    </Grid>
  </Grid>
);

// ─── Main Drawer ──────────────────────────────────────────────────────────────

type SectionKey =
  | 'general'
  | 'eligibility'
  | 'discount'
  | 'feeHeads'
  | 'approval'
  | 'stacking'
  | 'government'
  | 'validity';

interface ConcessionPolicyDrawerProps {
  open: boolean;
  onClose: () => void;
  editData?: IFinancePolicyRow | null;
  academicYearId?: string;
}

const ConcessionPolicyDrawer: React.FC<ConcessionPolicyDrawerProps> = ({
  open,
  onClose,
  editData,
  academicYearId = '',
}) => {
  const { currentYear, academicYears } = useSelector((state: RootState) => state.globalState);
  const [expandedSections, setExpandedSections] = useState<Set<SectionKey>>(new Set(['general']));

  const toggleSection = (key: SectionKey) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const [createPolicy, { isLoading: isCreating }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCreateFinancePolicyMutation,
  });
  const [updatePolicy, { isLoading: isUpdating }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateFinancePolicyMutation,
  });
  const isSaving = isCreating || isUpdating;

  const formik = useFormik<IConcessionPolicyFormValues>({
    initialValues: getInitialValues(editData, academicYearId || currentYear?.id || ''),
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      try {
        const payload = { ...values, policyType: 'concession' };
        if (editData?.id) {
          await updatePolicy({ id: editData.id, body: payload });
          shikshaMitraToast.success({
            message: `Policy "${values.policyName}" updated successfully.`,
          });
        } else {
          await createPolicy(payload);
          shikshaMitraToast.success({
            message: `Policy "${values.policyName}" created successfully.`,
          });
        }
        resetForm();
        onClose();
      } catch {
        shikshaMitraToast.error({ message: 'Failed to save policy.' });
      }
    },
  });

  useEffect(() => {
    if (!editData && formik.values.policyName) {
      formik.setFieldValue(
        'policyCode',
        `CP-${formik.values.policyName.toUpperCase().replace(/\s+/g, '-').slice(0, 12)}-${Date.now().toString().slice(-4)}`
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.policyName, editData]);

  if (!open) return null;

  const sections: { key: SectionKey; label: string; content: React.ReactNode }[] = [
    {
      key: 'general',
      label: 'General Information',
      content: <SectionGeneral formik={formik} academicYears={academicYears || []} />,
    },
    { key: 'eligibility', label: 'Eligibility', content: <SectionEligibility formik={formik} /> },
    { key: 'discount', label: 'Discount Rules', content: <SectionDiscountRules formik={formik} /> },
    {
      key: 'approval',
      label: 'Approval Workflow',
      content: <SectionApprovalWorkflow formik={formik} />,
    },
    { key: 'stacking', label: 'Stacking Rules', content: <SectionStackingRules formik={formik} /> },
    {
      key: 'government',
      label: 'Government Rules',
      content: <SectionGovernmentRules formik={formik} />,
    },
    { key: 'validity', label: 'Validity Period', content: <SectionValidity formik={formik} /> },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
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
            {editData ? 'Edit Concession Policy' : 'Create Concession Policy'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Define concession eligibility, discount rules, approval workflow, and government
            compliance.
          </Typography>
        </Box>
        <Button
          size="small"
          onClick={onClose}
          startIcon={<Iconify icon="mdi:close" />}
          color="inherit"
        >
          Close
        </Button>
      </Box>

      <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <Scrollbar sx={{ flex: 1, minWidth: 0 }}>
          <Box>
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
          <ConcessionSummaryPanel values={formik.values} />
        </Box>
      </Box>

      <DialogActions
        sx={{
          px: 3,
          py: 1.5,
          borderTop: '1px solid',
          borderColor: 'divider',
          flexShrink: 0,
          gap: 1,
        }}
      >
        <Button onClick={onClose} color="inherit" size="small">
          Cancel
        </Button>
        <Button
          size="small"
          variant="outlined"
          disabled={isSaving}
          onClick={() => {
            formik.setFieldValue('status', 'Draft');
            formik.handleSubmit();
          }}
          startIcon={<Iconify icon="mdi:content-save-outline" />}
        >
          Save Draft
        </Button>
        <LoadingButton
          size="small"
          variant="contained"
          color="primary"
          loading={isSaving}
          onClick={() => formik.handleSubmit()}
          startIcon={<Iconify icon="mdi:check" />}
        >
          Save
        </LoadingButton>
        <LoadingButton
          size="small"
          variant="contained"
          color="success"
          loading={isSaving}
          onClick={() => {
            formik.setFieldValue('status', 'Published');
            formik.handleSubmit();
          }}
          startIcon={<Iconify icon="mdi:publish" />}
        >
          Publish
        </LoadingButton>
      </DialogActions>
    </Box>
  );
};

export default ConcessionPolicyDrawer;
