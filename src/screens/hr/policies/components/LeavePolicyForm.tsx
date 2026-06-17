'use client';

import type { RootState } from 'src/redux/store';

import { useFormik } from 'formik';
import React, { useMemo } from 'react';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { useCreateLeavePolicyMutation, useUpdateLeavePolicyMutation } from 'src/redux/hr/leaveApi';
import {
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
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import type { ILeavePolicy, LeavePaidType, ILeavePolicyRule } from '../leave-policy-types';

type EntitlementMode = 'Limited' | 'Unlimited';

type LeavePolicyRuleFormValue = {
  paidType: LeavePaidType;
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
  status: 'Draft' | 'Active' | 'Archived';
  effectiveFrom: string;
  effectiveTo: string;
  isDefault: boolean;
  description: string;
  paid: LeavePolicyRuleFormValue;
  unpaid: LeavePolicyRuleFormValue;
};

const baseRule = (paidType: LeavePaidType): LeavePolicyRuleFormValue => ({
  paidType,
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

const validatePolicy = (values: LeavePolicyFormValues, hasAcademicYear: boolean) => {
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
}: {
  handleClose: (e?: unknown, isSubmit?: boolean) => void;
  editData?: ILeavePolicy | null;
}) {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const [createLeavePolicy, { isLoading: isCreateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCreateLeavePolicyMutation,
  });

  const [updateLeavePolicy, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateLeavePolicyMutation,
  });

  const initialValues = useMemo<LeavePolicyFormValues>(
    () => ({
      policyTitle: editData?.policyTitle || editData?.title || '',
      status: (editData?.status as LeavePolicyFormValues['status']) || 'Active',
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
    onSubmit: async (values) => {
      const validationError = validatePolicy(values, Boolean(currentYear?.id));
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
        const result = editData?.id
          ? await updateLeavePolicy({ id: editData.id, body: payload })
          : await createLeavePolicy({ academicYearId: currentYear?.id, body: payload });

        if ((result as any)?.error) {
          throw (result as any).error;
        }

        shikshaMitraToast.success({
          message: editData
            ? 'Leave policy updated successfully'
            : 'Leave policy added successfully',
        });
        handleClose(null, true);
        formik.resetForm();
      } catch (error) {
        console.error('Failed to save leave policy:', error);
        shikshaMitraToast.error({
          message: editData ? 'Failed to update leave policy' : 'Failed to add leave policy',
        });
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

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Stack spacing={2}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                name="policyTitle"
                label="Policy Name *"
                value={formik.values.policyTitle}
                onChange={formik.handleChange}
                size="small"
                fullWidth
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
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Draft">Draft</MenuItem>
                  <MenuItem value="Archived">Archived</MenuItem>
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
      </DialogScrollContent>

      <DialogActions>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={() => handleClose()}
          variant="outlined"
          size="small"
          type="button"
        >
          Cancel
        </Button>
        <LoadingButton
          startIcon={<Iconify icon={GlobalIcons.submit} />}
          type="submit"
          variant="contained"
          size="small"
          loading={isCreateLoading || isUpdateLoading}
          onClick={() => formik.handleSubmit()}
        >
          {editData ? 'Update' : 'Submit'}
        </LoadingButton>
      </DialogActions>
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
          <Chip
            size="small"
            label={title}
            color={isPaid ? 'success' : 'warning'}
            variant="outlined"
          />
          <Typography variant="subtitle2">{title} leave rule</Typography>
        </Stack>

        <Grid container spacing={1.5}>
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

          <Grid size={{ xs: 12, md: 3 }}>
            <FormControlLabel
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
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={rule.allowHalfDay}
                  onChange={(event) => setRuleValue(bucket, 'allowHalfDay', event.target.checked)}
                />
              }
              label="Half day"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 3 }}>
            <FormControlLabel
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
              <Grid size={{ xs: 12, md: 3 }}>
                <FormControlLabel
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
              <Grid size={{ xs: 12, md: 3 }}>
                <FormControlLabel
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
