'use client';

import type { RootState } from 'src/redux/store';

import * as Yup from 'yup';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import { useFormik, setNestedObjectValues } from 'formik';
import { roundUpWithinAmount } from 'src/utils/whole-rupee-amount';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetActiveFeeHeadsQuery } from 'src/redux/feeHeadManage/feeHeadManageApi';
import {
  useGetCollectionPoliciesQuery,
  useCreateCollectionPolicyMutation,
  useUpdateCollectionPolicyMutation,
} from 'src/redux/finance/collectionPolicy';

import {
  normalizePolicyName,
  isDuplicatePolicyNameError,
  DUPLICATE_POLICY_NAME_MESSAGE,
} from '../utils/policy-name';

import { computeSlabIssues } from '../components/collection/CollectionCommon';
import { acceptsNumericDraft, validCollectionNumber } from '../collectionNumericLimits';

import type {
  IFinancePolicyRow,
  ILateFeeEscalationRule,
  ICollectionPolicyFormValues,
} from '../types/finance-policy.types';

// Helper to get initial values
const getInitialValues = (
  editData: IFinancePolicyRow | null | undefined,
  academicYearId: string
): ICollectionPolicyFormValues => {
  const data = editData as any;
  // Legacy responses use zero for unused formula fields. Keep the selected
  // formula's zero visible for correction; absent formulas are optional.
  const formulaValue = (value: number | null | undefined, types: string[]) =>
    value === 0 && (!data?.enableLateFee || !types.includes(data?.lateFeeType))
      ? null
      : (value ?? null);
  return {
    policyName: data?.policyName || '',
    policyCode: data?.policyCode || '',
    description: data?.description || '',
    status: data?.status || 'Draft',
    academicYearId: data?.academicYearId || academicYearId || '',
    isDefault: data?.isDefault || false,
    policyType: 'collection',
    changeReason: '',

    receiptGrouping: data?.receiptGrouping ?? 'Separate',
    allocationBasis: data?.allocationBasis ?? (data?.id ? 'Legacy' : 'Installment'),

    enableLateFee: data?.enableLateFee ?? false,
    gracePeriodDays: data?.gracePeriodDays ?? 0,
    lateFeeApplyOnFeeHeads: data?.lateFeeApplyOnFeeHeads || [],
    lateFeeType: data?.lateFeeType || 'Flat',
    flatAmount: formulaValue(data?.flatAmount, ['Flat']),
    percentage: formulaValue(data?.percentage, ['Percentage', 'Compound']),
    percentageBase: data?.percentageBase || 'OutstandingAmount',
    amountPerDay: formulaValue(data?.amountPerDay, ['PerDay']),
    amountPerWeek: formulaValue(data?.amountPerWeek, ['PerWeek']),
    amountPerMonth: formulaValue(data?.amountPerMonth, ['PerMonth']),
    compoundFrequency: data?.compoundFrequency || 'Daily',
    escalationRules: data?.escalationRules || [],
    feeHeadOverrides: data?.feeHeadOverrides || [],
    roundingMethod: 'RoundUp',
    maximumLateFeeAmount: data?.maximumLateFeeAmount ?? null,
    maximumChargingDays: data?.maximumChargingDays ?? null,
    considerAsIncome: true,
    lateFeeIncomeCategoryId: data?.lateFeeIncomeCategoryId ?? null,

    allowOnlineCollection: data?.allowOnlineCollection ?? true,
  };
};

const boundedNumber = (kind: 'days' | 'amount' | 'percentage', minimum: number) =>
  Yup.number()
    .nullable()
    .transform((value, originalValue) =>
      originalValue === ''
        ? null
        : typeof originalValue === 'string' && !acceptsNumericDraft(originalValue, kind)
          ? Number.NaN
          : value
    )
    .typeError(
      kind === 'days'
        ? 'Enter whole days between 0 and 365'
        : kind === 'percentage'
          ? 'Enter a percentage between 0.01 and 100'
          : 'Enter an amount between 0.01 and 9,99,999'
    )
    .test(
      'bounded-number',
      kind === 'days'
        ? `Enter whole days between ${minimum} and 365`
        : kind === 'percentage'
          ? 'Enter a percentage between 0.01 and 100 with up to 2 decimals'
          : 'Enter an amount between 0.01 and 9,99,999 with up to 2 decimals',
      (value) => value == null || validCollectionNumber(value, kind, minimum)
    );

// Validation schema
const validationSchema = Yup.object().shape({
  receiptGrouping: Yup.string()
    .oneOf(['Separate', 'Combined'])
    .required('Choose how to generate receipts'),
  allocationBasis: Yup.string()
    .oneOf(['Legacy', 'Installment', 'FeeHead'])
    .required('Choose an allocation basis'),
  policyName: Yup.string()
    .trim()
    .required('Collection Policy Name is required')
    .min(3, 'Must be at least 3 characters')
    .max(100, 'Cannot exceed 100 characters'),
  description: Yup.string().max(500, 'Cannot exceed 500 characters').nullable(),
  status: Yup.string()
    .oneOf(['Draft', 'Active'], 'Status must be Draft or Active')
    .required('Status is required'),
  changeReason: Yup.string().trim().max(500, 'Cannot exceed 500 characters').nullable(),
  isDefault: Yup.boolean(),

  enableLateFee: Yup.boolean(),
  gracePeriodDays: boundedNumber('days', 0).when('enableLateFee', {
    is: true,
    then: (s) => s.required('Grace Period is required'),
  }),
  lateFeeApplyOnFeeHeads: Yup.array()
    .of(Yup.string())
    .when('enableLateFee', {
      is: true,
      then: (s) => s.min(1, 'Select at least one Fee Head'),
    }),
  lateFeeType: Yup.string().when('enableLateFee', {
    is: true,
    then: (s) => s.required('Calculation Type is required'),
  }),
  flatAmount: boundedNumber('amount', 0.01).when(['enableLateFee', 'lateFeeType'], {
    is: (enableLateFee: boolean, lateFeeType: string) => enableLateFee && lateFeeType === 'Flat',
    then: (s) => s.required('Amount is required'),
  }),
  percentage: boundedNumber('percentage', 0.01).when(['enableLateFee', 'lateFeeType'], {
    is: (enableLateFee: boolean, lateFeeType: string) =>
      enableLateFee && (lateFeeType === 'Percentage' || lateFeeType === 'Compound'),
    then: (s) => s.required('Percentage is required'),
  }),
  amountPerDay: boundedNumber('amount', 0.01).when(['enableLateFee', 'lateFeeType'], {
    is: (enableLateFee: boolean, lateFeeType: string) => enableLateFee && lateFeeType === 'PerDay',
    then: (s) => s.required('Amount Per Day is required'),
  }),
  amountPerWeek: boundedNumber('amount', 0.01).when(['enableLateFee', 'lateFeeType'], {
    is: (enableLateFee: boolean, lateFeeType: string) => enableLateFee && lateFeeType === 'PerWeek',
    then: (s) => s.required('Amount Per Week is required'),
  }),
  amountPerMonth: boundedNumber('amount', 0.01).when(['enableLateFee', 'lateFeeType'], {
    is: (enableLateFee: boolean, lateFeeType: string) =>
      enableLateFee && lateFeeType === 'PerMonth',
    then: (s) => s.required('Amount Per Month is required'),
  }),
  escalationRules: Yup.array()
    .of(
      Yup.object({
        startDay: boundedNumber('days', 1).required('Start day is required'),
        endDay: boundedNumber('days', 1).test(
          'after-start-day',
          'Must be on or after the start day',
          function validateEndDay(value) {
            return value === null || value === undefined || value >= this.parent.startDay;
          }
        ),
        calculationType: Yup.string()
          .oneOf(['Flat', 'Percentage'])
          .required('Calculation type is required'),
        value: boundedNumber('amount', 0.01)
          .required('Value is required')
          .when('calculationType', {
            is: 'Percentage',
            then: () => boundedNumber('percentage', 0.01).required('Value is required'),
          }),
        maxFee: boundedNumber('amount', 0.01),
      })
    )
    .when(['enableLateFee', 'lateFeeType'], {
      is: (enableLateFee: boolean, lateFeeType: string) => enableLateFee && lateFeeType === 'Slab',
      then: (schema) =>
        schema
          .min(1, 'Add at least one late-fee slab')
          .test(
            'continuous-non-overlapping-ranges',
            'Use valid contiguous slabs from day 1, within the charging cutoff',
            function validateSlabCoverage(rules) {
              return (
                !rules?.length ||
                !computeSlabIssues(
                  rules as ILateFeeEscalationRule[],
                  this.parent.maximumChargingDays
                ).hasIssues
              );
            }
          ),
    }),

  maximumLateFeeAmount: boundedNumber('amount', 0.01),
  maximumChargingDays: boundedNumber('days', 1),

  compoundFrequency: Yup.string().oneOf(
    ['Daily', 'Weekly', 'Monthly'],
    'Select a valid compound frequency'
  ),
  allowOnlineCollection: Yup.boolean(),
  considerAsIncome: Yup.boolean(),
  lateFeeIncomeCategoryId: Yup.string()
    .nullable()
    .when(['enableLateFee', 'status'], {
      is: (enableLateFee: boolean, status: string) => enableLateFee && status === 'Active',
      then: (s) => s.required('Select the Income Category for late fees'),
    }),
});

interface UseCollectionPolicyFormProps {
  open: boolean;
  onClose: () => void;
  editData?: IFinancePolicyRow | null;
  academicYearId?: string;
}

export function useCollectionPolicyForm({
  open,
  onClose,
  editData,
  academicYearId = '',
}: UseCollectionPolicyFormProps) {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const unsavedChangesDialog = useBoolean();
  const effectiveAcademicYearId = academicYearId || currentYear?.id || '';

  // Collection policies are academic-year scoped, so selectors must use the complete,
  // unpaginated active lookup rather than the fee-head administration list.
  const { data: feeHeadsData } = useGetActiveFeeHeadsQuery(effectiveAcademicYearId, {
    skip: !effectiveAcademicYearId,
  });
  const feeHeads = useMemo(() => feeHeadsData || [], [feeHeadsData]);

  // Load the current academic-year default so the form can explain that saving
  // this selection will transfer the default designation to the new policy.
  const { data: existingPoliciesData } = useGetCollectionPoliciesQuery(
    { academicYearId: effectiveAcademicYearId, status: 'Active' },
    { skip: !effectiveAcademicYearId }
  );
  const otherDefaultPolicyName = useMemo(() => {
    const items = existingPoliciesData?.items || [];
    const currentDefault = items.find(
      (p: any) =>
        p.isDefault && p.id !== editData?.id && p.academicYearId === effectiveAcademicYearId
    );
    return currentDefault?.policyName as string | undefined;
  }, [existingPoliciesData, editData?.id, effectiveAcademicYearId]);

  const [createPolicy, { isLoading: isCreating }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCreateCollectionPolicyMutation,
    popupConfig: { error: false },
  });

  const [updatePolicy, { isLoading: isUpdating }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateCollectionPolicyMutation,
    popupConfig: { error: false },
  });

  const isSaving = isCreating || isUpdating;

  const formik = useFormik<ICollectionPolicyFormValues>({
    initialValues: getInitialValues(editData, academicYearId || currentYear?.id || ''),
    validationSchema,
    enableReinitialize: true,
    onSubmit: async () => {
      // Custom handler is used instead
    },
  });

  // Live Calculator State
  const [calcAmount, setCalcAmount] = useState(1000);
  const [calcDaysLate, setCalcDaysLate] = useState(10);
  const [calcPayment, setCalcPayment] = useState(500);

  /**
   * Memoization Justification:
   * Memoizes validation status checks computed dynamically from form values,
   * minimizing re-computations of state rules on simple text typing changes.
   */
  const checks = useMemo(() => {
    const v = formik.values;
    const nameValid = v.policyName.trim().length >= 3 && v.policyName.trim().length <= 100;
    const graceValid = !v.enableLateFee || validCollectionNumber(v.gracePeriodDays, 'days');
    const headsValid = !v.enableLateFee || v.lateFeeApplyOnFeeHeads.length >= 1;

    let lateFeeValid = true;
    if (v.enableLateFee) {
      if (v.lateFeeType === 'Flat')
        lateFeeValid = validCollectionNumber(v.flatAmount, 'amount', 0.01);
      else if (v.lateFeeType === 'Percentage' || v.lateFeeType === 'Compound') {
        lateFeeValid =
          validCollectionNumber(v.percentage, 'percentage', 0.01) &&
          (v.lateFeeType !== 'Compound' ||
            ['Daily', 'Weekly', 'Monthly'].includes(v.compoundFrequency));
      } else if (v.lateFeeType === 'PerDay')
        lateFeeValid = validCollectionNumber(v.amountPerDay, 'amount', 0.01);
      else if (v.lateFeeType === 'PerWeek')
        lateFeeValid = validCollectionNumber(v.amountPerWeek, 'amount', 0.01);
      else if (v.lateFeeType === 'PerMonth')
        lateFeeValid = validCollectionNumber(v.amountPerMonth, 'amount', 0.01);
      else if (v.lateFeeType === 'Slab') {
        const slabIssues = computeSlabIssues(v.escalationRules, v.maximumChargingDays);
        lateFeeValid =
          v.escalationRules.length > 0 &&
          v.escalationRules.every((s) =>
            validCollectionNumber(
              s.value,
              s.calculationType === 'Percentage' ? 'percentage' : 'amount',
              0.01
            )
          ) &&
          !slabIssues.hasIssues;
      }
    }

    const slabValid =
      v.lateFeeType !== 'Slab' ||
      !v.enableLateFee ||
      (v.escalationRules.length > 0 &&
        !computeSlabIssues(v.escalationRules, v.maximumChargingDays).hasIssues);

    const capsValid =
      (v.maximumLateFeeAmount === null ||
        validCollectionNumber(v.maximumLateFeeAmount, 'amount', 0.01)) &&
      (v.maximumChargingDays === null || validCollectionNumber(v.maximumChargingDays, 'days', 1));
    const numericValid = graceValid && lateFeeValid && slabValid && capsValid;
    const incomeHeadValid = !v.enableLateFee || Boolean(v.lateFeeIncomeCategoryId);
    const isDefaultConflict = false;

    // Phase 4b: Compound and Percentage can grow unbounded with days-late — warn (don't
    // block) when neither cap is set, since an uncapped Flat/PerDay/PerWeek/PerMonth policy
    // is bounded by its own arithmetic and doesn't carry the same runaway risk.
    const uncappedRunawayRisk =
      v.enableLateFee &&
      (v.lateFeeType === 'Compound' || v.lateFeeType === 'Percentage') &&
      v.maximumLateFeeAmount === null &&
      v.maximumChargingDays === null;

    const isReadyToPublish =
      nameValid &&
      graceValid &&
      headsValid &&
      capsValid &&
      lateFeeValid &&
      incomeHeadValid &&
      slabValid;

    return {
      numericValid,
      capsValid,
      nameValid,
      graceValid,
      headsValid,
      lateFeeValid,
      incomeHeadValid,
      slabValid,
      isDefaultConflict,
      uncappedRunawayRisk,
      isReadyToPublish,
    };
  }, [formik.values]);

  const handleCustomSubmit = async (overrideStatus: 'Draft' | 'Active') => {
    if (isSaving) return;

    const isDraft = overrideStatus === 'Draft';
    const errors = await formik.validateForm();
    const hasErrors = Object.keys(errors).length > 0;

    if (hasErrors) {
      await formik.setTouched(setNestedObjectValues(errors, true), false);

      const firstInvalidField = Object.keys(errors)[0];
      if (firstInvalidField) {
        requestAnimationFrame(() => {
          const field = document.querySelector<HTMLElement>(`[name="${firstInvalidField}"]`);
          field?.focus();
          field?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
      }
      return;
    }

    try {
      const payload = {
        ...formik.values,
        policyName: normalizePolicyName(formik.values.policyName),
        status: overrideStatus,
        isDefault: overrideStatus === 'Active' ? formik.values.isDefault : false,
        policyCode: formik.values.policyCode || `CP-${Date.now()}`,
      };

      if (editData?.id) {
        await updatePolicy({ id: editData.id, body: payload }).unwrap();
        shikshaMitraToast.success({
          message: `Collection policy "${payload.policyName}" ${isDraft ? 'saved as draft' : 'activated'}.`,
        });
      } else {
        await createPolicy(payload).unwrap();
        shikshaMitraToast.success({
          message: `Collection policy "${payload.policyName}" ${isDraft ? 'saved as draft' : 'activated'}.`,
        });
      }
      formik.resetForm();
      onClose();
    } catch (error) {
      const parsed = parseApiProblemDetail(error);
      if (isDuplicatePolicyNameError(parsed.errorCode)) {
        await formik.setFieldTouched('policyName', true, false);
        formik.setFieldError('policyName', DUPLICATE_POLICY_NAME_MESSAGE);
        return;
      }
      shikshaMitraToast.error({ message: parsed.detail });
    }
  };

  const handleCloseAttempt = () => {
    if (formik.dirty) {
      unsavedChangesDialog.onTrue();
    } else {
      onClose();
    }
  };

  const addSlab = () => {
    if (
      formik.values.escalationRules.some(
        (rule) => rule.endDay === null || rule.endDay >= (formik.values.maximumChargingDays ?? 365)
      )
    )
      return;
    const nextStart =
      formik.values.escalationRules.length > 0
        ? (formik.values.escalationRules[formik.values.escalationRules.length - 1].endDay || 0) + 1
        : 1;

    const newSlab: ILateFeeEscalationRule = {
      startDay: nextStart,
      endDay: Math.min(nextStart + 9, formik.values.maximumChargingDays ?? 365),
      calculationType: 'Flat',
      value: 10,
      maxFee: null,
    };
    formik.setFieldValue('escalationRules', [...formik.values.escalationRules, newSlab]);
  };

  const removeSlab = (index: number) => {
    const updated = formik.values.escalationRules.filter((_, i) => i !== index);
    formik.setFieldValue('escalationRules', updated);
  };

  /**
   * Memoization Justification:
   * Prevents heavy interest or compound computation loops from executing on every render
   * unless calculation variables or policy settings change.
   */
  const calculatedLateFee = useMemo(() => {
    const v = formik.values;
    if (!v.enableLateFee) return 0;
    if (
      !checks.numericValid ||
      !validCollectionNumber(calcAmount, 'amount') ||
      !validCollectionNumber(calcDaysLate, 'days')
    )
      return Number.NaN;
    if (calcDaysLate <= v.gracePeriodDays) return 0;
    const effectiveDays = Math.min(
      calcDaysLate - v.gracePeriodDays,
      v.maximumChargingDays ?? Number.MAX_SAFE_INTEGER
    );

    let rawFee = 0;
    if (v.lateFeeType === 'Flat') {
      rawFee = v.flatAmount || 0;
    } else if (v.lateFeeType === 'Percentage') {
      const pct = v.percentage || 0;
      rawFee = (pct / 100) * calcAmount;
    } else if (v.lateFeeType === 'PerDay') {
      rawFee = (v.amountPerDay || 0) * effectiveDays;
    } else if (v.lateFeeType === 'PerWeek') {
      rawFee = (v.amountPerWeek || 0) * Math.ceil(effectiveDays / 7);
    } else if (v.lateFeeType === 'PerMonth') {
      rawFee = (v.amountPerMonth || 0) * Math.ceil(effectiveDays / 30);
    } else if (v.lateFeeType === 'Compound') {
      const pct = v.percentage || 0;
      let compounded = calcAmount;
      const freq = v.compoundFrequency;
      const compoundPeriods =
        freq === 'Daily'
          ? effectiveDays
          : freq === 'Weekly'
            ? Math.floor(effectiveDays / 7)
            : Math.floor(effectiveDays / 30);
      for (let i = 0; i < compoundPeriods; i += 1) {
        compounded += compounded * (pct / 100);
      }
      rawFee = compounded - calcAmount;
    } else if (v.lateFeeType === 'Slab') {
      v.escalationRules.forEach((slab) => {
        if (effectiveDays >= slab.startDay) {
          const limitDay =
            slab.endDay === null ? effectiveDays : Math.min(effectiveDays, slab.endDay);
          const activeDays = limitDay - slab.startDay + 1;
          if (activeDays > 0) {
            const slabVal = slab.value || 0;
            if (slab.calculationType === 'Flat') {
              rawFee += slabVal * activeDays;
            } else {
              rawFee += (slabVal / 100) * calcAmount * activeDays;
            }
          }
        }
      });
    }

    if (v.maximumLateFeeAmount !== null) rawFee = Math.min(rawFee, v.maximumLateFeeAmount);
    if (!Number.isFinite(rawFee) || rawFee > Number.MAX_SAFE_INTEGER - calcAmount)
      return Number.NaN;
    return roundUpWithinAmount(rawFee, v.maximumLateFeeAmount ?? Number.MAX_SAFE_INTEGER);
  }, [formik.values, calcAmount, calcDaysLate, checks.numericValid]);

  /**
   * Memoization Justification:
   * Keeps numeric allocations safe and avoids re-computing payment math on irrelevant changes.
   */
  const allocatedPayment = useMemo(
    () =>
      validCollectionNumber(calcPayment, 'amount')
        ? Math.min(calcPayment, calcAmount + calculatedLateFee)
        : Number.NaN,
    [calcPayment, calcAmount, calculatedLateFee]
  );

  /**
   * Memoization Justification:
   * Simple arithmetic memoization to align referential state with other components.
   */
  const remainingBalance = useMemo(
    () => calcAmount + calculatedLateFee - allocatedPayment,
    [calcAmount, calculatedLateFee, allocatedPayment]
  );

  return {
    formik,
    feeHeads,
    isSaving,
    unsavedChangesDialog,
    checks,
    otherDefaultPolicyName,
    calcAmount,
    setCalcAmount,
    calcDaysLate,
    setCalcDaysLate,
    calcPayment,
    setCalcPayment,
    calculatedLateFee,
    allocatedPayment,
    remainingBalance,
    handleCustomSubmit,
    handleCloseAttempt,
    addSlab,
    removeSlab,
  };
}
