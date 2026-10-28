'use client';

import type { RootState } from 'src/redux/store';

import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import React, { useRef, useMemo, useEffect } from 'react';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  useGetLeavePoliciesQuery,
  useCreateLeavePolicyMutation,
  useUpdateLeavePolicyMutation,
} from 'src/redux/hr/leaveApi';
import {
  Box,
  Grid,
  Chip,
  Stack,
  Paper,
  Button,
  Switch,
  Select,
  MenuItem,
  Checkbox,
  TextField,
  InputLabel,
  Typography,
  FormControl,
  FormControlLabel,
} from '@mui/material';

import { leaveImpactScope } from '../leave-impact.types';
import { getErrorMessage } from '../hr-policy-workspace-utils';
import { getCurrentLeavePolicyTitleSet } from '../leave-policy-workspace-utils';
import { useLeavePolicyImpactReview } from '../hooks/useLeavePolicyImpactReview';

import type { LeaveReviewApproval } from '../leave-impact.types';
import type { ILeavePolicy, LeavePaidType, ILeavePolicyRule } from '../leave-policy-types';

type EntitlementMode = 'Limited' | 'Unlimited';

export const LEAVE_POLICY_FORM_STATUS_OPTIONS = ['Active', 'Draft'] as const;

type LeavePolicyFormStatus = (typeof LEAVE_POLICY_FORM_STATUS_OPTIONS)[number];

export const toLeavePolicyFormStatus = (value?: string | null): LeavePolicyFormStatus =>
  value === 'Draft' ? 'Draft' : 'Active';

type LeavePolicyRuleFormValue = {
  paidType: LeavePaidType;
  payrollCategory: 'PAID' | 'CL' | 'UNPAID';
  entitlementMode: EntitlementMode;
  accrualPolicyType: 'Monthly' | 'Yearly';
  leaveCount: number | string;
  carryForward: boolean;
  carryForwardLimit: number | string;
  encashmentAllowed: boolean;
  encashmentTiming: '' | 'next_payroll' | 'end_of_year';
  requiresApproval: boolean;
  minNoticeDays: number | string;
  maxDaysPerRequest: number | string;
  allowHalfDay: boolean;
  attachmentRequiredAfterDays: number | string;
  allowNegativeBalance: boolean;
};

type LeavePolicyFormValues = {
  policyTitle: string;
  status: LeavePolicyFormStatus;
  effectiveFrom: string;
  effectiveTo: string;
  isDefault: boolean;
  description: string;
  paid: LeavePolicyRuleFormValue;
  unpaid: LeavePolicyRuleFormValue;
};

const baseRule = (paidType: LeavePaidType): LeavePolicyRuleFormValue => ({
  paidType,
  payrollCategory: paidType === 'Unpaid' ? 'UNPAID' : 'PAID',
  entitlementMode: paidType === 'Unpaid' ? 'Unlimited' : 'Limited',
  accrualPolicyType: 'Yearly',
  leaveCount: paidType === 'Paid' ? 12 : '',
  carryForward: false,
  carryForwardLimit: '',
  encashmentAllowed: false,
  encashmentTiming: '',
  requiresApproval: true,
  minNoticeDays: 0,
  maxDaysPerRequest: 30,
  allowHalfDay: true,
  attachmentRequiredAfterDays: '',
  allowNegativeBalance: paidType === 'Unpaid',
});

const toDateInput = (value?: string | Date | null) => {
  if (!value) return '';
  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().slice(0, 10);
};

const toNullableNumber = (value: string | number) => {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizePaidType = (value: unknown): LeavePaidType =>
  String(value || '').toLowerCase() === 'unpaid' ? 'Unpaid' : 'Paid';

const buildRuleValue = (
  paidType: LeavePaidType,
  source?: ILeavePolicyRule | null
): LeavePolicyRuleFormValue => {
  const fallback = baseRule(paidType);
  if (!source) {
    return fallback;
  }

  const entitlementMode =
    source.entitlementMode === 'Unlimited' || source.isUnlimited ? 'Unlimited' : 'Limited';

  return {
    paidType,
    payrollCategory:
      paidType === 'Unpaid' ? 'UNPAID' : source.payrollCategory === 'CL' ? 'CL' : 'PAID',
    entitlementMode,
    accrualPolicyType: source.accrualPolicyType === 'Monthly' ? 'Monthly' : 'Yearly',
    leaveCount: entitlementMode === 'Unlimited' ? '' : (source.leaveCount ?? fallback.leaveCount),
    carryForward: paidType === 'Paid' ? Boolean(source.carryForward) : false,
    carryForwardLimit: paidType === 'Paid' ? (source.carryForwardLimit ?? '') : '',
    encashmentAllowed: paidType === 'Paid' ? Boolean(source.encashmentAllowed) : false,
    encashmentTiming:
      paidType === 'Paid' &&
      (source.encashmentTiming === 'next_payroll' || source.encashmentTiming === 'end_of_year')
        ? source.encashmentTiming
        : '',
    requiresApproval: source.requiresApproval ?? true,
    minNoticeDays: source.minNoticeDays ?? 0,
    maxDaysPerRequest: source.maxDaysPerRequest ?? 30,
    allowHalfDay: source.allowHalfDay ?? true,
    attachmentRequiredAfterDays: source.attachmentRequiredAfterDays ?? '',
    allowNegativeBalance: Boolean(source.allowNegativeBalance),
  };
};

const getRuleFromPolicy = (policy: ILeavePolicy | null | undefined, paidType: LeavePaidType) =>
  (policy?.rules || []).find(
    (rule) => rule?.isActive !== false && normalizePaidType(rule?.paidType) === paidType
  );

const ruleCheckboxSx = {
  m: 0,
  width: '100%',
  minHeight: 40,
  alignItems: 'center',
  '& .MuiFormControlLabel-label': {
    fontSize: 14,
    lineHeight: 1.25,
    overflowWrap: 'anywhere',
  },
};

const validateRule = (rule: LeavePolicyRuleFormValue) => {
  const label = rule.paidType;
  if (rule.entitlementMode === 'Limited' && Number(rule.leaveCount) < 0) {
    return `${label}: leave count cannot be negative.`;
  }
  if (rule.entitlementMode === 'Limited' && toNullableNumber(rule.leaveCount) === null) {
    return `${label}: leave count is required.`;
  }
  if (Number(rule.maxDaysPerRequest) <= 0) {
    return `${label}: max days per request must be greater than zero.`;
  }
  if (Number(rule.minNoticeDays) < 0) {
    return `${label}: minimum notice days cannot be negative.`;
  }
  if (rule.encashmentAllowed && !rule.encashmentTiming) {
    return `${label}: select encashment timing.`;
  }
  return null;
};

const validatePolicy = (
  values: LeavePolicyFormValues,
  hasAcademicYear: boolean,
  existingTitlesRef: React.MutableRefObject<Set<string>>,
  editData?: ILeavePolicy | null
) => {
  if (!hasAcademicYear) return 'Select an academic year before saving a leave policy.';
  if (!values.policyTitle.trim()) return 'Policy name is required.';
  if (!values.effectiveFrom) return 'Effective from date is required.';
  if (values.effectiveTo && values.effectiveTo < values.effectiveFrom) {
    return 'Effective to cannot be before effective from.';
  }

  return validateRule(values.paid) || validateRule(values.unpaid);
};

const toRulePayload = (rule: LeavePolicyRuleFormValue) => {
  const isUnlimited = rule.paidType === 'Unpaid' && rule.entitlementMode === 'Unlimited';
  const paidOnly = rule.paidType === 'Paid';

  return {
    paidType: rule.paidType,
    payrollCategory: rule.payrollCategory,
    entitlementMode: paidOnly ? 'Limited' : rule.entitlementMode,
    accrualPolicyType: rule.accrualPolicyType,
    leaveCount: isUnlimited ? null : Number(rule.leaveCount) || 0,
    carryForward: paidOnly ? rule.carryForward : false,
    carryForwardLimit:
      paidOnly && rule.carryForward ? toNullableNumber(rule.carryForwardLimit) : null,
    encashmentAllowed: paidOnly ? rule.encashmentAllowed : false,
    encashmentTiming: paidOnly && rule.encashmentAllowed ? rule.encashmentTiming : null,
    requiresApproval: rule.requiresApproval,
    minNoticeDays: Number(rule.minNoticeDays) || 0,
    maxDaysPerRequest: Number(rule.maxDaysPerRequest) || 1,
    allowHalfDay: rule.allowHalfDay,
    attachmentRequiredAfterDays: toNullableNumber(rule.attachmentRequiredAfterDays),
    allowNegativeBalance: rule.allowNegativeBalance,
    isActive: true,
  };
};

export function LeavePolicyForm({
  handleClose,
  editData,
  onCloseStateChange,
}: {
  handleClose: (e?: unknown, isSubmit?: boolean) => void;
  editData?: ILeavePolicy | null;
  onCloseStateChange?: (state: { dirty: boolean; busy: boolean }) => void;
}) {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const impactReview = useLeavePolicyImpactReview(currentYear?.id);

  const [createLeavePolicy, { isLoading: isCreateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCreateLeavePolicyMutation,
  });

  const [updateLeavePolicy, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateLeavePolicyMutation,
  });

  // Fetch existing policies to validate unique name on the FE (same pattern as FeeHeadForm)
  const { data: leavePoliciesData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetLeavePoliciesQuery,
    params: {
      academicYearId: currentYear?.id,
      page: 1,
      pageSize: 500,
      archivedOnly: false,
    },
    options: { skip: !currentYear?.id },
  });

  const existingTitles = useMemo<Set<string>>(
    () => getCurrentLeavePolicyTitleSet(leavePoliciesData?.items),
    [leavePoliciesData]
  );
  // Stable ref so the formik onSubmit closure always reads the latest Set
  const existingTitlesRef = useRef<Set<string>>(new Set());
  existingTitlesRef.current = existingTitles;

  const initialValues = useMemo<LeavePolicyFormValues>(
    () => ({
      policyTitle: editData?.policyTitle || editData?.title || '',
      status: toLeavePolicyFormStatus(editData?.status),
      effectiveFrom: toDateInput(editData?.effectiveFrom || (currentYear as any)?.startDate),
      effectiveTo: toDateInput(editData?.effectiveTo || (currentYear as any)?.endDate),
      isDefault: Boolean(editData?.isDefault),
      description: editData?.description || '',
      paid: buildRuleValue('Paid', getRuleFromPolicy(editData, 'Paid')),
      unpaid: buildRuleValue('Unpaid', getRuleFromPolicy(editData, 'Unpaid')),
    }),
    [currentYear, editData]
  );

  const formik = useFormik<LeavePolicyFormValues>({
    enableReinitialize: true,
    initialValues,
    validate: (values) => {
      const errors: Partial<Record<keyof LeavePolicyFormValues, string>> = {};
      const titleTrimmed = values.policyTitle.trim().toLowerCase();
      const editTitle = (editData?.policyTitle || editData?.title || '').trim().toLowerCase();
      // Flag duplicate only if the name differs from the original (allow keeping same name on edit)
      if (
        titleTrimmed &&
        titleTrimmed !== editTitle &&
        existingTitlesRef.current.has(titleTrimmed)
      ) {
        errors.policyTitle = 'This policy name already exists';
      }
      return errors;
    },
    onSubmit: async (values) => {
      const validationError = validatePolicy(
        values,
        Boolean(currentYear?.id),
        existingTitlesRef,
        editData
      );
      if (validationError) {
        shikshaMitraToast.error({ message: validationError });
        return;
      }

      const payload = {
        policyTitle: values.policyTitle.trim(),
        status: values.status,
        effectiveFrom: values.effectiveFrom,
        effectiveTo: values.effectiveTo || null,
        description: values.description?.trim() || null,
        isDefault: values.isDefault,
        rules: [toRulePayload(values.paid), toRulePayload(values.unpaid)],
      };

      try {
        const needsReview = Boolean(
          (editData?.id &&
            (editData.status === 'Active' || payload.status === 'Active' || payload.isDefault)) ||
          (payload.isDefault &&
            leavePoliciesData?.items?.some((policy: ILeavePolicy) => policy.isDefault))
        );
        const reviewProposal = () =>
          impactReview.requestReview({
            academicYearId: currentYear!.id,
            policyId: editData?.id,
            action: editData?.id ? 'update' : 'create',
            ...leaveImpactScope(currentYear!, editData?.id ? editData.version : undefined),
            proposal: payload,
          });
        let approval = needsReview ? await reviewProposal() : undefined;
        if (needsReview && !approval) return;
        const save = (reviewed?: LeaveReviewApproval | null) => {
          const body = {
            ...payload,
            expectedVersion: editData?.id ? editData.version : undefined,
            impactScope: reviewed?.impactScope,
          };
          return editData?.id
            ? updateLeavePolicy({ id: editData.id, body, impactToken: reviewed?.impactToken })
            : createLeavePolicy({
                academicYearId: currentYear?.id,
                body,
                impactToken: reviewed?.impactToken,
              });
        };
        let result = await save(approval);
        // A default can appear while the initial list is loading. Obtain a review
        // after the server rejects the unreviewed write; never retry a stale token.
        const code =
          (result as any)?.error?.data?.error?.code || (result as any)?.error?.data?.code;
        if (!approval && code === 'ShikshaMitra:HrPolicyImpactConfirmationRequired') {
          approval = await reviewProposal();
          if (!approval) return;
          result = await save(approval);
        }

        if ((result as any)?.error) {
          throw (result as any).error;
        }

        shikshaMitraToast.success({
          message: editData?.id
            ? 'Leave policy updated successfully'
            : 'Leave policy added successfully',
        });
        handleClose(null, true);
        formik.resetForm();
      } catch (error: any) {
        console.error('Failed to save leave policy:', error);
        const fallback = editData?.id
          ? 'Failed to update leave policy'
          : 'Failed to add leave policy';
        shikshaMitraToast.error({ message: getErrorMessage(error, fallback) });
      }
    },
  });

  const setRuleValue = <K extends keyof LeavePolicyRuleFormValue>(
    bucket: 'paid' | 'unpaid',
    key: K,
    value: LeavePolicyRuleFormValue[K]
  ) => {
    formik.setFieldValue(bucket, { ...formik.values[bucket], [key]: value });
  };

  useEffect(() => {
    onCloseStateChange?.({
      dirty: formik.dirty,
      busy: isCreateLoading || isUpdateLoading || formik.isSubmitting,
    });
  }, [formik.dirty, formik.isSubmitting, isCreateLoading, isUpdateLoading, onCloseStateChange]);

  const busy = isCreateLoading || isUpdateLoading || formik.isSubmitting;

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      {impactReview.drawer}
      <Box
        component="form"
        onSubmit={formik.handleSubmit}
        sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}
      >
        <Box
          component="fieldset"
          disabled={busy}
          inert={busy}
          sx={{ flex: 1, minHeight: 0, minWidth: 0, overflow: 'auto', border: 0, m: 0, p: 2 }}
        >
          <Stack spacing={2}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  name="policyTitle"
                  label="Policy Name *"
                  value={formik.values.policyTitle}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  size="small"
                  fullWidth
                  error={formik.touched.policyTitle && Boolean(formik.errors.policyTitle)}
                  helperText={
                    formik.touched.policyTitle && formik.errors.policyTitle
                      ? formik.errors.policyTitle
                      : undefined
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  name="effectiveFrom"
                  label="Effective From *"
                  value={formik.values.effectiveFrom}
                  onChange={formik.handleChange}
                  type="date"
                  size="small"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  name="effectiveTo"
                  label="Effective To"
                  value={formik.values.effectiveTo}
                  onChange={formik.handleChange}
                  type="date"
                  size="small"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    label="Status"
                    value={formik.values.status}
                    onChange={(event) => formik.setFieldValue('status', event.target.value)}
                  >
                    {LEAVE_POLICY_FORM_STATUS_OPTIONS.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formik.values.isDefault}
                      onChange={(event) => formik.setFieldValue('isDefault', event.target.checked)}
                    />
                  }
                  label="Default policy"
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  name="description"
                  label="Description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  size="small"
                  multiline
                  rows={2}
                  fullWidth
                />
              </Grid>
            </Grid>

            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
              <Typography variant="subtitle2">Rule Buckets</Typography>
              <Chip size="small" label="Paid" color="success" variant="outlined" />
              <Chip size="small" label="Unpaid" color="warning" variant="outlined" />
            </Stack>

            <RuleSection
              title="Paid"
              bucket="paid"
              rule={formik.values.paid}
              setRuleValue={setRuleValue}
            />
            <RuleSection
              title="Unpaid"
              bucket="unpaid"
              rule={formik.values.unpaid}
              setRuleValue={setRuleValue}
            />
          </Stack>
        </Box>

        <Stack
          direction="row"
          spacing={1.5}
          justifyContent="flex-end"
          sx={{
            px: { xs: 2, sm: 3 },
            py: 1.5,
            flexShrink: 0,
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Button
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
            onClick={() => handleClose()}
            variant="outlined"
            size="small"
            type="button"
            disabled={busy}
          >
            Cancel
          </Button>
          <LoadingButton
            startIcon={<Iconify icon={GlobalIcons.submit} />}
            type="submit"
            variant="contained"
            size="small"
            loading={busy}
          >
            Submit
          </LoadingButton>
        </Stack>
      </Box>
    </BackPopUpChecked>
  );
}

function RuleSection({
  title,
  bucket,
  rule,
  setRuleValue,
}: {
  title: LeavePaidType;
  bucket: 'paid' | 'unpaid';
  rule: LeavePolicyRuleFormValue;
  setRuleValue: <K extends keyof LeavePolicyRuleFormValue>(
    bucket: 'paid' | 'unpaid',
    key: K,
    value: LeavePolicyRuleFormValue[K]
  ) => void;
}) {
  const isPaid = title === 'Paid';

  return (
    <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="subtitle2">{title} leave rule</Typography>
          <Label color={isPaid ? 'success' : 'warning'} variant="soft">
            {title}
          </Label>
        </Stack>

        {isPaid && (
          <TextField
            select
            label="Payroll leave label"
            value={rule.payrollCategory}
            size="small"
            onChange={(event) =>
              setRuleValue(bucket, 'payrollCategory', event.target.value as 'PAID' | 'CL')
            }
            helperText="Use Casual leave only when this paid-leave rule represents CL."
          >
            <MenuItem value="PAID">Paid leave</MenuItem>
            <MenuItem value="CL">Casual leave (CL)</MenuItem>
          </TextField>
        )}
        <Grid container spacing={1.5} alignItems="stretch">
          {!isPaid ? (
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Entitlement</InputLabel>
                <Select
                  label="Entitlement"
                  value={rule.entitlementMode}
                  onChange={(event) =>
                    setRuleValue(bucket, 'entitlementMode', event.target.value as EntitlementMode)
                  }
                >
                  <MenuItem value="Limited">Limited</MenuItem>
                  <MenuItem value="Unlimited">Unlimited</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          ) : null}

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              label={rule.entitlementMode === 'Unlimited' ? 'Days' : 'Days *'}
              type="number"
              size="small"
              fullWidth
              disabled={rule.entitlementMode === 'Unlimited'}
              value={rule.entitlementMode === 'Unlimited' ? '' : rule.leaveCount}
              onChange={(event) => setRuleValue(bucket, 'leaveCount', event.target.value)}
              inputProps={{ min: 0 }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel>Accrual</InputLabel>
              <Select
                label="Accrual"
                value={rule.accrualPolicyType}
                onChange={(event) =>
                  setRuleValue(
                    bucket,
                    'accrualPolicyType',
                    event.target.value as LeavePolicyRuleFormValue['accrualPolicyType']
                  )
                }
              >
                <MenuItem value="Yearly">Yearly</MenuItem>
                <MenuItem value="Monthly">Monthly</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              label="Max Per Request"
              type="number"
              size="small"
              fullWidth
              value={rule.maxDaysPerRequest}
              onChange={(event) => setRuleValue(bucket, 'maxDaysPerRequest', event.target.value)}
              inputProps={{ min: 1 }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              label="Min Notice"
              type="number"
              size="small"
              fullWidth
              value={rule.minNoticeDays}
              onChange={(event) => setRuleValue(bucket, 'minNoticeDays', event.target.value)}
              inputProps={{ min: 0 }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <TextField
              label="Attachment After"
              type="number"
              size="small"
              fullWidth
              value={rule.attachmentRequiredAfterDays}
              onChange={(event) =>
                setRuleValue(bucket, 'attachmentRequiredAfterDays', event.target.value)
              }
              inputProps={{ min: 0 }}
            />
          </Grid>

          {isPaid ? (
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                label="Carry Limit"
                type="number"
                size="small"
                fullWidth
                disabled={!rule.carryForward}
                value={rule.carryForwardLimit}
                onChange={(event) => setRuleValue(bucket, 'carryForwardLimit', event.target.value)}
                inputProps={{ min: 0 }}
              />
            </Grid>
          ) : null}

          {isPaid ? (
            <Grid size={{ xs: 12, md: 3 }}>
              <FormControl fullWidth size="small" disabled={!rule.encashmentAllowed}>
                <InputLabel>Encashment Timing</InputLabel>
                <Select
                  label="Encashment Timing"
                  value={rule.encashmentTiming}
                  onChange={(event) =>
                    setRuleValue(
                      bucket,
                      'encashmentTiming',
                      event.target.value as LeavePolicyRuleFormValue['encashmentTiming']
                    )
                  }
                >
                  <MenuItem value="next_payroll">Next payroll</MenuItem>
                  <MenuItem value="end_of_year">End of year</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          ) : null}

          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControlLabel
              sx={ruleCheckboxSx}
              control={
                <Checkbox
                  checked={rule.requiresApproval}
                  onChange={(event) =>
                    setRuleValue(bucket, 'requiresApproval', event.target.checked)
                  }
                />
              }
              label="Approval"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControlLabel
              sx={ruleCheckboxSx}
              control={
                <Checkbox
                  checked={rule.allowHalfDay}
                  onChange={(event) => setRuleValue(bucket, 'allowHalfDay', event.target.checked)}
                />
              }
              label="Half day"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControlLabel
              sx={ruleCheckboxSx}
              control={
                <Checkbox
                  checked={rule.allowNegativeBalance}
                  onChange={(event) =>
                    setRuleValue(bucket, 'allowNegativeBalance', event.target.checked)
                  }
                />
              }
              label="Negative balance"
            />
          </Grid>

          {isPaid ? (
            <>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControlLabel
                  sx={ruleCheckboxSx}
                  control={
                    <Checkbox
                      checked={rule.carryForward}
                      onChange={(event) =>
                        setRuleValue(bucket, 'carryForward', event.target.checked)
                      }
                    />
                  }
                  label="Carry forward"
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <FormControlLabel
                  sx={ruleCheckboxSx}
                  control={
                    <Checkbox
                      checked={rule.encashmentAllowed}
                      onChange={(event) =>
                        setRuleValue(bucket, 'encashmentAllowed', event.target.checked)
                      }
                    />
                  }
                  label="Encashable"
                />
              </Grid>
            </>
          ) : null}
        </Grid>
      </Stack>
    </Paper>
  );
}
