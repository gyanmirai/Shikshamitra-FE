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

import {
  isProratedRule,
  isConfiguredRule,
  configurationErrors,
} from '../components/proration/prorationRuleHelpers';

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

export function apiRuleToForm(rule: IProrationPolicyRule): IProrationFeeHeadRule {
  const toFormModel = (model?: IProrationPolicyRule['ruleType']) =>
    model === 'Daily' ? 'DailyProration' as const :
      model === 'MonthlyCutoff' ? 'MonthlyProration' as const :
        model === 'FullMonthCharge' ? 'FullMonthCharge' as const : 'NoProration' as const;
  const configuration = (model: IProrationFeeHeadRule['ruleType'], withdrawal = false): IProrationFeeHeadRule['configuration'] => {
    const minimum = withdrawal ? rule.earlyWithdrawalMinimumChargeDays : rule.minimumChargeDays;
    const cutoff = withdrawal ? rule.earlyWithdrawalCutoffDay : rule.cutoffDay;
    const action = withdrawal ? rule.earlyWithdrawalBeforeCutoffAction : rule.afterCutoffAction;
    if (model === 'DailyProration') return { calculationBasis: 'CalendarDays', minimumChargeDays: minimum ?? 0, ...(!withdrawal && { roundOff: 'RoundUp' as const }) };
    if (model === 'MonthlyProration') return { cutOffDay: cutoff ?? 15, monthlyRule: action === 'HalfCharge' ? 'HalfMonthRule' : 'ChargeNextMonth', ...(!withdrawal && { roundOff: 'RoundUp' as const }) };
    return {};
  };
  const ruleType = toFormModel(rule.ruleType);
  const earlyWithdrawalRuleType = toFormModel(rule.earlyWithdrawalRuleType ?? rule.ruleType);
  return {
    feeHeadId: rule.feeHeadId,
    feeHeadName: rule.feeHeadName ?? '',
    feeType: 'Recurring',
    ruleType,
    applyOnAdmission: rule.applyOnAdmission !== false,
    applyOnEarlyWithdrawal: rule.applyOnEarlyWithdrawal ?? false,
    configuration: configuration(ruleType),
    earlyWithdrawalRuleType,
    earlyWithdrawalConfiguration: configuration(earlyWithdrawalRuleType, true),
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
      applyOnAdmission: true,
      applyOnEarlyWithdrawal: false,
      earlyWithdrawalRuleType: 'NoProration',
      earlyWithdrawalConfiguration: {},
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
    feeHeadRules: values.feeHeadRules.filter(isConfiguredRule).map((rule) => {
      const { monthlyRule } = rule.configuration;
      const withdrawal = rule.earlyWithdrawalConfiguration ?? {};
      const withdrawalType = rule.earlyWithdrawalRuleType ?? 'NoProration';
      const toApiModel = (model: IProrationFeeHeadRule['ruleType']) =>
        model === 'DailyProration'
          ? ('Daily' as const)
          : model === 'MonthlyProration'
            ? ('MonthlyCutoff' as const)
            : model === 'FullMonthCharge'
              ? ('FullMonthCharge' as const)
              : ('FullCharge' as const);
      return {
        feeHeadId: rule.feeHeadId,
        ruleType: toApiModel(rule.ruleType),
        applyOnAdmission: rule.applyOnAdmission !== false,
        applyOnEarlyWithdrawal: rule.applyOnEarlyWithdrawal ?? false,
        earlyWithdrawalRuleType: toApiModel(withdrawalType),
        earlyWithdrawalMinimumChargeDays:
          withdrawalType === 'DailyProration' ? (withdrawal.minimumChargeDays ?? 0) : null,
        earlyWithdrawalCutoffDay:
          withdrawalType === 'MonthlyProration' ? (withdrawal.cutOffDay ?? null) : null,
        earlyWithdrawalBeforeCutoffAction:
          withdrawalType === 'MonthlyProration'
            ? withdrawal.monthlyRule === 'HalfMonthRule'
              ? 'HalfCharge'
              : 'NoCharge'
            : null,
        roundingMode: 'RoundUpRupee',
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
            .required(),
          applyOnAdmission: Yup.boolean(),
          applyOnEarlyWithdrawal: Yup.boolean(),
          earlyWithdrawalRuleType: Yup.string().oneOf([
            'NoProration',
            'DailyProration',
            'MonthlyProration',
            'FullMonthCharge',
          ]),
          configuration: Yup.mixed(),
          earlyWithdrawalConfiguration: Yup.mixed(),
        }).test('event-settings', function validateEventSettings(value) {
          const rule = value as IProrationFeeHeadRule;
          if (rule.feeType === 'OneTime' && isConfiguredRule(rule))
            return this.createError({ message: 'One-time fee heads cannot be prorated' });
          const eventErrors = [false, true].flatMap((withdrawal) => {
            const enabled = withdrawal
              ? rule.applyOnEarlyWithdrawal
              : rule.applyOnAdmission !== false;
            if (!enabled || rule.feeType === 'OneTime') return [];
            const model = withdrawal
              ? (rule.earlyWithdrawalRuleType ?? 'NoProration')
              : rule.ruleType;
            const configuration = withdrawal
              ? (rule.earlyWithdrawalConfiguration ?? {})
              : (rule.configuration ?? {});
            const errors = configurationErrors(model, {
              ...configuration,
              roundOff: rule.configuration?.roundOff,
            });
            return errors.map((error) => {
              const key =
                error.field === 'roundOff' || !withdrawal
                  ? 'configuration'
                  : 'earlyWithdrawalConfiguration';
              return this.createError({
                path: `${this.path}.${key}.${error.field}`,
                message: error.message,
              });
            });
          });

          if (eventErrors.length === 1) return eventErrors[0];
          return eventErrors.length ? new Yup.ValidationError(eventErrors) : true;
        })
      )
      .required('Fee head rules are required')
      .test(
        'has-enabled-rule',
        'Enable Daily or Monthly proration on at least one recurring fee head',
        (rules) => !!rules?.some((rule) => isProratedRule(rule as IProrationFeeHeadRule))
      ),
  });

const enabledModelsForValidation = (rule: IProrationFeeHeadRule) =>
  rule.feeType !== 'OneTime' && (rule.applyOnAdmission !== false || rule.applyOnEarlyWithdrawal);

// The checklist and submit validation use the same schema, including all enabled events.
export function getProrationFormChecks(
  values: IProrationPolicyFormValues,
  activeEdit = false,
  isFeeHeadsError = false
) {
  let errors: Yup.ValidationError[] = [];
  try {
    buildProrationValidationSchema(activeEdit).validateSync(values, { abortEarly: false });
  } catch (error) {
    if (!(error instanceof Yup.ValidationError)) throw error;
    errors = error.inner;
  }
  const proratedCount = values.feeHeadRules.filter(isProratedRule).length;
  const configuredCount = values.feeHeadRules.filter(isConfiguredRule).length;
  return {
    generalValid: !errors.some((error) => !error.path?.startsWith('feeHeadRules')),
    feeHeadsValid: proratedCount > 0,
    configuredCount,
    recurringEnabledCount: proratedCount,
    allRuleSettingsValid:
      configuredCount > 0 && !errors.some((error) => error.path?.startsWith('feeHeadRules[')),
    isDefaultConflict: false,
    isReadyToPublish: errors.length === 0 && !isFeeHeadsError,
  };
}

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
    if (isCreating || isUpdating || isFeeHeadsLoading || isPolicyLoading || formik.isSubmitting)
      return;
    if (formik.dirty) unsavedChangesDialog.onTrue();
    else onClose();
  };

  const handleCustomSubmit = async () => {
    if (
      isCreating ||
      isUpdating ||
      isFeeHeadsLoading ||
      isPolicyLoading ||
      isFeeHeadsError ||
      formik.isSubmitting
    )
      return;
    if (formik.values.status === 'Draft' && formik.values.isDefault) {
      await formik.setFieldValue('isDefault', false, false);
    }
    await formik.submitForm();
  };

  const checks = useMemo(
    () => getProrationFormChecks(formik.values, activeEdit, isFeeHeadsError),
    [activeEdit, formik.values, isFeeHeadsError]
  );

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
