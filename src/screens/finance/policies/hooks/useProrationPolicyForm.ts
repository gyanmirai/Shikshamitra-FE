'use client';

import type { RootState } from 'src/redux/store';
import type { ProrationPolicySavePayload } from 'src/redux/finance/prorationPolicy';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { useMemo, useEffect } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useGetActiveFeeHeadsQuery } from 'src/redux/feeHeadManage/feeHeadManageApi';
import {
  useGetProrationPoliciesQuery,
  useGetProrationPolicyByIdQuery,
  useCreateProrationPolicyMutation,
  useUpdateProrationPolicyMutation,
} from 'src/redux/finance/prorationPolicy';

import type {
  IProrationPolicy,
  IFinancePolicyRow,
  IProrationPolicyRule,
  IProrationFeeHeadRule,
  IProrationPolicyFormValues,
} from '../types/finance-policy.types';

interface FeeHeadLookup {
  id: string;
  name: string;
  feeType?: 'Recurring' | 'OneTime';
}

const ROUNDING_TO_FORM = {
  Currency: 'NoRoundOff',
  NearestRupee: 'NoRoundOff',
  RoundUpRupee: 'RoundUp',
  RoundDownRupee: 'RoundDown',
} as const;

const ROUNDING_TO_API = {
  NoRoundOff: 'Currency',
  RoundUp: 'RoundUpRupee',
  RoundDown: 'RoundDownRupee',
} as const;

export function apiRuleToForm(rule: IProrationPolicyRule): IProrationFeeHeadRule {
  const ruleType =
    rule.ruleType === 'Daily'
      ? 'DailyProration'
      : rule.ruleType === 'MonthlyCutoff'
        ? 'MonthlyProration'
        : 'FullMonthCharge';

  return {
    feeHeadId: rule.feeHeadId,
    feeHeadName: rule.feeHeadName ?? undefined,
    feeType: 'Recurring',
    ruleType,
    configuration: {
      calculationBasis: rule.ruleType === 'Daily' ? 'CalendarDays' : undefined,
      roundOff: ROUNDING_TO_FORM[rule.roundingMode],
      minimumChargeDays: rule.minimumChargeDays,
      monthlyRule:
        rule.ruleType === 'MonthlyCutoff'
          ? rule.afterCutoffAction === 'HalfCharge'
            ? 'HalfMonthRule'
            : 'ChargeNextMonth'
          : undefined,
      cutOffDay: rule.cutoffDay,
    },
  };
}

function buildFeeHeadRules(
  feeHeads: FeeHeadLookup[],
  existingRules: IProrationFeeHeadRule[] = []
): IProrationFeeHeadRule[] {
  const rulesMap = new Map(existingRules.map((rule) => [rule.feeHeadId, rule]));
  return feeHeads.map((head) => {
    const existing = rulesMap.get(head.id);
    if (existing) {
      return {
        ...existing,
        feeHeadName: head.name,
        feeType: head.feeType ?? existing.feeType ?? 'Recurring',
        ruleType: head.feeType === 'OneTime' ? 'NoProration' : existing.ruleType,
        configuration: head.feeType === 'OneTime' ? {} : existing.configuration,
      };
    }
    return {
      feeHeadId: head.id,
      feeHeadName: head.name,
      feeType: head.feeType ?? 'Recurring',
      ruleType: 'NoProration',
      configuration: {},
    };
  });
}

function getInitialValues(
  policy: IProrationPolicy | undefined,
  editData: IFinancePolicyRow | null | undefined,
  academicYearId: string,
  feeHeads: FeeHeadLookup[]
): IProrationPolicyFormValues {
  const row = editData as (IFinancePolicyRow & Partial<IProrationPolicy>) | undefined;
  const source = policy ?? row;
  const existingRules =
    source?.feeHeadRules?.map((rule) =>
      'roundingMode' in rule
        ? apiRuleToForm(rule as IProrationPolicyRule)
        : (rule as IProrationFeeHeadRule)
    ) ?? [];

  return {
    policyName: source?.policyName ?? '',
    policyCode: source?.policyCode ?? '',
    description: source?.description ?? '',
    status: source?.status === 'Active' ? 'Active' : 'Draft',
    academicYearId: source?.academicYearId ?? academicYearId,
    isDefault: source?.isDefault ?? false,
    concurrencyStamp: policy?.concurrencyStamp ?? row?.concurrencyStamp ?? null,
    changeReason: '',
    policyType: 'proration',
    feeHeadRules: buildFeeHeadRules(feeHeads, existingRules),
  };
}

export function toProrationPolicyPayload(
  values: IProrationPolicyFormValues
): ProrationPolicySavePayload {
  return {
    academicYearId: values.academicYearId,
    policyName: values.policyName.trim(),
    policyCode: values.policyCode.trim() || null,
    description: values.description?.trim() || null,
    status: values.status,
    isDefault: values.status === 'Active' ? values.isDefault : false,
    concurrencyStamp: values.concurrencyStamp || null,
    changeReason: values.changeReason?.trim() || null,
    feeHeadRules: values.feeHeadRules
      .filter((rule) => rule.ruleType !== 'NoProration')
      .map((rule) => {
        const {monthlyRule} = rule.configuration;
        return {
          feeHeadId: rule.feeHeadId,
          ruleType:
            rule.ruleType === 'DailyProration'
              ? 'Daily'
              : rule.ruleType === 'MonthlyProration'
                ? 'MonthlyCutoff'
                : 'FullCharge',
          roundingMode: ROUNDING_TO_API[rule.configuration.roundOff ?? 'NoRoundOff'],
          minimumChargeDays:
            rule.ruleType === 'DailyProration' ? (rule.configuration.minimumChargeDays ?? 0) : null,
          cutoffDay:
            rule.ruleType === 'MonthlyProration' ? (rule.configuration.cutOffDay ?? null) : null,
          afterCutoffAction:
            rule.ruleType === 'MonthlyProration'
              ? monthlyRule === 'HalfMonthRule'
                ? 'HalfCharge'
                : 'NoCharge'
              : null,
        };
      }),
  };
}

export const buildProrationValidationSchema = (activeEdit: boolean) =>
  Yup.object({
    academicYearId: Yup.string().required('Academic year is required'),
    policyName: Yup.string()
      .trim()
      .required('Proration Policy Name is required')
      .min(3, 'Must be at least 3 characters')
      .max(128, 'Cannot exceed 128 characters'),
    policyCode: Yup.string()
      .trim()
      .max(32, 'Cannot exceed 32 characters')
      .matches(/^[A-Za-z0-9_-]*$/, 'Use only letters, numbers, hyphens, and underscores'),
    description: Yup.string().nullable().max(500, 'Cannot exceed 500 characters'),
    status: Yup.string()
      .oneOf(['Draft', 'Active'], 'Status must be Draft or Active')
      .required('Status is required'),
    isDefault: Yup.boolean(),
    changeReason: activeEdit
      ? Yup.string()
          .trim()
          .required('Change reason is required for an Active policy')
          .max(500, 'Cannot exceed 500 characters')
      : Yup.string().trim().nullable().max(500, 'Cannot exceed 500 characters'),
    feeHeadRules: Yup.array()
      .of(
        Yup.object({
          feeHeadId: Yup.string().required(),
          feeType: Yup.string().oneOf(['Recurring', 'OneTime']).required(),
          ruleType: Yup.string()
            .oneOf(['NoProration', 'DailyProration', 'MonthlyProration', 'FullMonthCharge'])
            .required('Proration model is required'),
          configuration: Yup.object({
            calculationBasis: Yup.string().nullable().oneOf(['CalendarDays']),
            roundOff: Yup.string().nullable().oneOf(['NoRoundOff', 'RoundUp', 'RoundDown']),
            minimumChargeDays: Yup.number()
              .nullable()
              .typeError('Minimum charge days must be a number')
              .integer('Minimum charge days must be a whole number')
              .min(0, 'Minimum charge days cannot be negative')
              .max(366, 'Minimum charge days cannot exceed 366'),
            monthlyRule: Yup.string().nullable().oneOf(['ChargeNextMonth', 'HalfMonthRule']),
            cutOffDay: Yup.number()
              .nullable()
              .typeError('Cut-off day must be a number')
              .integer('Cut-off day must be a whole number')
              .min(1, 'Cut-off day must be between 1 and 31')
              .max(31, 'Cut-off day must be between 1 and 31'),
          }),
        })
          .test(
            'one-time-not-prorated',
            'One-time fee heads cannot be prorated',
            (rule) => rule?.feeType !== 'OneTime' || rule.ruleType === 'NoProration'
          )
          .test('daily-settings', function validateDailySettings(rule) {
            if (rule?.ruleType !== 'DailyProration') return true;
            if (rule.configuration?.calculationBasis !== 'CalendarDays') {
              return this.createError({
                path: `${this.path}.configuration.calculationBasis`,
                message: 'Calculation basis is required',
              });
            }
            if (!rule.configuration?.roundOff) {
              return this.createError({
                path: `${this.path}.configuration.roundOff`,
                message: 'Rounding mode is required',
              });
            }
            return true;
          })
          .test('monthly-settings', function validateMonthlySettings(rule) {
            if (rule?.ruleType !== 'MonthlyProration') return true;
            if (!rule.configuration?.monthlyRule) {
              return this.createError({
                path: `${this.path}.configuration.monthlyRule`,
                message: 'Cut-off behavior strategy is required',
              });
            }
            if (!rule.configuration?.cutOffDay) {
              return this.createError({
                path: `${this.path}.configuration.cutOffDay`,
                message: 'Monthly cut-off day is required',
              });
            }
            return true;
          })
      )
      .required('Fee head rules are required')
      .test(
        'has-enabled-rule',
        'At least one fee head must have proration enabled',
        (rules) =>
          !!rules?.some(
            (rule) => rule.ruleType === 'DailyProration' || rule.ruleType === 'MonthlyProration'
          )
      ),
  });

interface UseProrationPolicyFormOptions {
  open: boolean;
  onClose: () => void;
  editData?: IFinancePolicyRow | null;
  academicYearId?: string;
}

export function useProrationPolicyForm({
  open,
  onClose,
  editData,
  academicYearId = '',
}: UseProrationPolicyFormOptions) {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const unsavedChangesDialog = useBoolean();
  const resolvedAcademicYearId = academicYearId || currentYear?.id || '';
  const { data: policyDetails, isFetching: isPolicyLoading } = useGetProrationPolicyByIdQuery(
    editData?.id ?? '',
    { skip: !open || !editData?.id }
  );
  const activeEdit = (policyDetails?.status ?? editData?.status) === 'Active';
  const formValidationSchema = useMemo(
    () => buildProrationValidationSchema(activeEdit),
    [activeEdit]
  );
  const { data: existingPoliciesData } = useGetProrationPoliciesQuery(
    {
      academicYearId: resolvedAcademicYearId,
      status: 'Active',
      page: 1,
      pageSize: 100,
    },
    { skip: !open || !resolvedAcademicYearId }
  );
  const otherDefaultPolicyName = useMemo(
    () =>
      existingPoliciesData?.items.find(
        (policy) =>
          policy.isDefault &&
          policy.id !== editData?.id &&
          policy.academicYearId === resolvedAcademicYearId
      )?.policyName,
    [editData?.id, existingPoliciesData?.items, resolvedAcademicYearId]
  );
  const {
    data: feeHeadsData = [],
    isLoading: isFeeHeadsLoading,
    isError: isFeeHeadsError,
  } = useGetActiveFeeHeadsQuery(resolvedAcademicYearId, {
    skip: !open || !resolvedAcademicYearId,
  });

  const feeHeads = useMemo<FeeHeadLookup[]>(
    () => feeHeadsData.map((head) => ({ id: head.id, name: head.name, feeType: 'Recurring' })),
    [feeHeadsData]
  );
  const [createPolicy, { isLoading: isCreating }] = useCreateProrationPolicyMutation();
  const [updatePolicy, { isLoading: isUpdating }] = useUpdateProrationPolicyMutation();

  const formik = useFormik<IProrationPolicyFormValues>({
    initialValues: getInitialValues(policyDetails, editData, resolvedAcademicYearId, feeHeads),
    validationSchema: formValidationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      try {
        const payload = toProrationPolicyPayload(values);
        if (editData?.id) {
          await updatePolicy({ id: editData.id, body: payload }).unwrap();
          shikshaMitraToast.success({ message: `Policy "${values.policyName}" updated.` });
        } else {
          await createPolicy(payload).unwrap();
          shikshaMitraToast.success({ message: `Policy "${values.policyName}" created.` });
        }
        resetForm();
        onClose();
      } catch (error) {
        shikshaMitraToast.error({ message: parseApiProblemDetail(error).detail });
      }
    },
  });

  useEffect(() => {
    if (!feeHeads.length || policyDetails || editData?.id) return;
    const rebuilt = buildFeeHeadRules(feeHeads, formik.values.feeHeadRules);
    const currentIds = formik.values.feeHeadRules.map((rule) => rule.feeHeadId).join(',');
    const rebuiltIds = rebuilt.map((rule) => rule.feeHeadId).join(',');
    if (currentIds !== rebuiltIds) formik.setFieldValue('feeHeadRules', rebuilt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feeHeads, policyDetails, editData?.id]);

  const handleCloseAttempt = () => {
    if (formik.dirty) unsavedChangesDialog.onTrue();
    else onClose();
  };

  const handleCustomSubmit = async () => {
    if (isCreating || isUpdating) return;
    if (formik.values.status === 'Draft' && formik.values.isDefault) {
      await formik.setFieldValue('isDefault', false, false);
    }
    await formik.submitForm();
  };

  const checks = useMemo(() => {
    const enabledRules = formik.values.feeHeadRules.filter(
      (rule) => rule.ruleType !== 'NoProration'
    );
    const proratedRules = enabledRules.filter(
      (rule) => rule.ruleType === 'DailyProration' || rule.ruleType === 'MonthlyProration'
    );
    const allRuleSettingsValid = enabledRules.every((rule) => {
      if (rule.ruleType === 'DailyProration') {
        const minimumDays = rule.configuration.minimumChargeDays;
        return (
          rule.configuration.calculationBasis === 'CalendarDays' &&
          Boolean(rule.configuration.roundOff) &&
          (minimumDays == null ||
            (Number.isInteger(minimumDays) && minimumDays >= 0 && minimumDays <= 366))
        );
      }
      if (rule.ruleType === 'MonthlyProration') {
        const cutoff = rule.configuration.cutOffDay;
        return (
          Boolean(rule.configuration.monthlyRule) &&
          Number.isInteger(cutoff) &&
          Number(cutoff) >= 1 &&
          Number(cutoff) <= 31
        );
      }
      return true;
    });
    const generalValid =
      !!formik.values.academicYearId &&
      formik.values.policyName.trim().length >= 3 &&
      formik.values.policyName.trim().length <= 128 &&
      formik.values.policyCode.length <= 32 &&
      /^[A-Za-z0-9_-]*$/.test(formik.values.policyCode) &&
      (formik.values.description?.length ?? 0) <= 500 &&
      (!activeEdit || Boolean(formik.values.changeReason?.trim()));
    return {
      generalValid,
      feeHeadsValid: proratedRules.length > 0,
      configuredCount: enabledRules.filter((rule) => Boolean(rule.ruleType)).length,
      recurringEnabledCount: enabledRules.length,
      allRuleSettingsValid,
      isDefaultConflict: false,
      isReadyToPublish:
        generalValid &&
        proratedRules.length > 0 &&
        allRuleSettingsValid &&
        !isFeeHeadsError,
    };
  }, [activeEdit, formik.values, isFeeHeadsError]);

  return {
    formik,
    feeHeads,
    isSaving: isCreating || isUpdating,
    isLoading: isFeeHeadsLoading || isPolicyLoading,
    isFeeHeadsError,
    activeEdit,
    otherDefaultPolicyName,
    unsavedChangesDialog,
    checks,
    handleCloseAttempt,
    handleCustomSubmit,
  };
}
