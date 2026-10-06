'use client';

import type { RootState } from 'src/redux/store';

import * as Yup from 'yup';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import { useFormik, setNestedObjectValues } from 'formik';
import { roundUpWithinAmount } from 'src/utils/whole-rupee-amount';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetActiveFeeHeadsQuery } from 'src/redux/feeHeadManage/feeHeadManageApi';
import {
  useGetCollectionPoliciesQuery,
  useCreateCollectionPolicyMutation,
  useUpdateCollectionPolicyMutation,
} from 'src/redux/finance/collectionPolicy';

import { computeSlabIssues } from '../components/collection/CollectionCommon';

import type {
  IFinancePolicyRow,
  ILateFeeEscalationRule,
  ICollectionPolicyFormValues,
} from '../types/finance-policy.types';

const emptyStringToNull = (value: number, originalValue: unknown) =>
  originalValue === '' ? null : value;

// Helper to get initial values
const getInitialValues = (
  editData: IFinancePolicyRow | null | undefined,
  academicYearId: string
): ICollectionPolicyFormValues => {
  const data = editData as any;
  return {
    policyName: data?.policyName || '',
    policyCode: data?.policyCode || '',
    description: data?.description || '',
    status: data?.status || 'Draft',
    academicYearId: data?.academicYearId || academicYearId || '',
    isDefault: data?.isDefault || false,
    policyType: 'collection',
    changeReason: '',

    enableLateFee: data?.enableLateFee ?? false,
    gracePeriodDays: data?.gracePeriodDays ?? 0,
    gracePeriodType: data?.gracePeriodType || 'Calendar',
    lateFeeApplyOnFeeHeads: data?.lateFeeApplyOnFeeHeads || [],
    lateFeeType: data?.lateFeeType || 'Flat',
    flatAmount: data?.flatAmount ?? null,
    percentage: data?.percentage ?? null,
    percentageBase: data?.percentageBase || 'OutstandingAmount',
    amountPerDay: data?.amountPerDay ?? null,
    amountPerWeek: data?.amountPerWeek ?? null,
    amountPerMonth: data?.amountPerMonth ?? null,
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

// Validation schema
const validationSchema = Yup.object().shape({
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
  gracePeriodDays: Yup.number()
    .nullable()
    .transform(emptyStringToNull)
    .typeError('Grace Period must be a number')
    .min(0, 'Must be 0 or greater')
    .max(365, 'Cannot exceed 365 days')
    .when('enableLateFee', {
      is: true,
      then: (s) => s.required('Grace Period is required'),
    }),
  gracePeriodType: Yup.string().when('enableLateFee', {
    is: true,
    then: (schema) =>
      schema
        .oneOf(['Calendar'], 'Only calendar-day grace periods are currently supported')
        .required('Grace Day Type is required'),
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
  flatAmount: Yup.number()
    .nullable()
    .transform(emptyStringToNull)
    .when(['enableLateFee', 'lateFeeType'], {
      is: (enableLateFee: boolean, lateFeeType: string) => enableLateFee && lateFeeType === 'Flat',
      then: (s) => s.required('Amount is required').moreThan(0, 'Must be greater than 0'),
    }),
  percentage: Yup.number()
    .nullable()
    .transform(emptyStringToNull)
    .when(['enableLateFee', 'lateFeeType'], {
      is: (enableLateFee: boolean, lateFeeType: string) =>
        enableLateFee && (lateFeeType === 'Percentage' || lateFeeType === 'Compound'),
      then: (s) =>
        s
          .required('Percentage is required')
          .moreThan(0, 'Must be greater than 0')
          .max(100, 'Cannot exceed 100%'),
    }),
  amountPerDay: Yup.number()
    .nullable()
    .transform(emptyStringToNull)
    .when(['enableLateFee', 'lateFeeType'], {
      is: (enableLateFee: boolean, lateFeeType: string) =>
        enableLateFee && lateFeeType === 'PerDay',
      then: (s) => s.required('Amount Per Day is required').moreThan(0, 'Must be greater than 0'),
    }),
  amountPerWeek: Yup.number()
    .nullable()
    .transform(emptyStringToNull)
    .when(['enableLateFee', 'lateFeeType'], {
      is: (enableLateFee: boolean, lateFeeType: string) =>
        enableLateFee && lateFeeType === 'PerWeek',
      then: (s) => s.required('Amount Per Week is required').moreThan(0, 'Must be greater than 0'),
    }),
  amountPerMonth: Yup.number()
    .nullable()
    .transform(emptyStringToNull)
    .when(['enableLateFee', 'lateFeeType'], {
      is: (enableLateFee: boolean, lateFeeType: string) =>
        enableLateFee && lateFeeType === 'PerMonth',
      then: (s) => s.required('Amount Per Month is required').moreThan(0, 'Must be greater than 0'),
    }),
  escalationRules: Yup.array()
    .of(
      Yup.object({
        startDay: Yup.number()
          .required('Start day is required')
          .integer('Use a whole day')
          .min(0, 'Must be 0 or greater'),
        endDay: Yup.number()
          .nullable()
          .integer('Use a whole day')
          .test(
            'after-start-day',
            'Must be on or after the start day',
            function validateEndDay(value) {
              return value === null || value === undefined || value >= this.parent.startDay;
            }
          ),
        calculationType: Yup.string()
          .oneOf(['Flat', 'Percentage'])
          .required('Calculation type is required'),
        value: Yup.number().required('Value is required').moreThan(0, 'Must be greater than 0'),
        maxFee: Yup.number().nullable().min(0, 'Must be 0 or greater'),
      })
    )
    .when(['enableLateFee', 'lateFeeType'], {
      is: (enableLateFee: boolean, lateFeeType: string) => enableLateFee && lateFeeType === 'Slab',
      then: (schema) =>
        schema
          .min(1, 'Add at least one late-fee slab')
          .test(
            'continuous-non-overlapping-ranges',
            'Fix overlapping or missing-day-range slabs',
            (rules) =>
              !rules?.length || !computeSlabIssues(rules as ILateFeeEscalationRule[]).hasIssues
          ),
    }),

  maximumLateFeeAmount: Yup.number()
    .nullable()
    .transform(emptyStringToNull)
    .min(0, 'Must be 0 or greater'),
  maximumChargingDays: Yup.number()
    .nullable()
    .transform(emptyStringToNull)
    .integer('Must be a whole number')
    .min(1, 'Must be at least 1 day'),

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
    const nameValid = v.policyName.trim().length >= 3;
    const graceValid = !v.enableLateFee || (v.gracePeriodDays >= 0 && v.gracePeriodDays <= 365);
    const graceTypeValid = !v.enableLateFee || v.gracePeriodType === 'Calendar';
    const headsValid = !v.enableLateFee || v.lateFeeApplyOnFeeHeads.length >= 1;

    let lateFeeValid = true;
    if (v.enableLateFee) {
      if (v.lateFeeType === 'Flat') lateFeeValid = v.flatAmount !== null && v.flatAmount > 0;
      else if (v.lateFeeType === 'Percentage' || v.lateFeeType === 'Compound') {
        lateFeeValid = v.percentage !== null && v.percentage > 0 && v.percentage <= 100;
      } else if (v.lateFeeType === 'PerDay')
        lateFeeValid = v.amountPerDay !== null && v.amountPerDay > 0;
      else if (v.lateFeeType === 'PerWeek')
        lateFeeValid = v.amountPerWeek !== null && v.amountPerWeek > 0;
      else if (v.lateFeeType === 'PerMonth')
        lateFeeValid = v.amountPerMonth !== null && v.amountPerMonth > 0;
      else if (v.lateFeeType === 'Slab') {
        const slabIssues = computeSlabIssues(v.escalationRules);
        lateFeeValid =
          v.escalationRules.length > 0 &&
          v.escalationRules.every(
            (s) => s.startDay >= 0 && (s.endDay === null || s.endDay >= s.startDay) && s.value > 0
          ) &&
          !slabIssues.hasIssues;
      }
    }

    const slabValid =
      v.lateFeeType !== 'Slab' ||
      !v.enableLateFee ||
      !computeSlabIssues(v.escalationRules).hasIssues;

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
      graceTypeValid &&
      headsValid &&
      lateFeeValid &&
      incomeHeadValid &&
      slabValid;

    return {
      nameValid,
      graceValid,
      graceTypeValid,
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
    } catch {
      shikshaMitraToast.error({ message: 'Failed to save collection policy.' });
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
    const nextStart =
      formik.values.escalationRules.length > 0
        ? (formik.values.escalationRules[formik.values.escalationRules.length - 1].endDay || 0) + 1
        : 1;

    const newSlab: ILateFeeEscalationRule = {
      startDay: nextStart,
      endDay: nextStart + 9,
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
    if (!v.enableLateFee || calcDaysLate <= v.gracePeriodDays) return 0;
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
    return roundUpWithinAmount(rawFee, v.maximumLateFeeAmount ?? Number.MAX_SAFE_INTEGER);
  }, [formik.values, calcAmount, calcDaysLate]);

  /**
   * Memoization Justification:
   * Keeps numeric allocations safe and avoids re-computing payment math on irrelevant changes.
   */
  const allocatedPayment = useMemo(
    () => Math.min(calcPayment, calcAmount + calculatedLateFee),
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
