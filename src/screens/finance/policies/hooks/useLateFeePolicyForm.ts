'use client';

import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { useBoolean } from 'src/hooks/use-boolean';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { shikshaMitraToast } from 'src/components/toast';
import { useMemo, useState, useEffect, useCallback } from 'react';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useCreateFinancePolicyMutation,
  useUpdateFinancePolicyMutation,
} from 'src/redux/finance/financePolicy';

import type { IFinancePolicyRow, ILateFeePolicyFormValues } from '../types/finance-policy.types';

dayjs.extend(isSameOrAfter);

type SectionKey =
  | 'general'
  | 'calculation'
  | 'escalation'
  | 'limits'
  | 'charge'
  | 'waiver'
  | 'preview';

// Helper to get initial values
const getInitialValues = (
  editData: IFinancePolicyRow | null | undefined,
  academicYearId: string
): ILateFeePolicyFormValues => {
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
    policyType: 'late-fee',
    priority: data?.priority ?? 1,

    gracePeriodDays: data?.gracePeriodDays ?? 0,
    gracePeriodType: data?.gracePeriodType || 'Calendar',
    calculationType: data?.calculationType || 'FlatAmount',
    calculationValue: data?.calculationValue || 0,

    lateFeeType: data?.lateFeeType || 'Flat',
    flatAmount: data?.flatAmount ?? null,
    percentage: data?.percentage ?? null,
    percentageBase: data?.percentageBase || 'OutstandingAmount',
    compoundFrequency: data?.compoundFrequency || 'Daily',
    escalationEnabled: data?.escalationEnabled ?? false,

    maximumLateFeeAmount: data?.maximumLateFeeAmount ?? null,
    maximumLateFeePercentage: data?.maximumLateFeePercentage ?? null,
    compoundLateFee: data?.compoundLateFee ?? false,
    roundOffMethod: data?.roundOffMethod || 'None',
    minimumCharge: data?.minimumCharge ?? null,
    maximumCharge: data?.maximumCharge ?? null,
    maximumFineCap: data?.maximumFineCap ?? null,

    willCreateCharge: data?.willCreateCharge ?? false,
    autoCalculate: data?.autoCalculate ?? true,
    separateChargeEntry: data?.separateChargeEntry ?? false,
    chargeCategoryId: data?.chargeCategoryId || '',
    chargeHeadId: data?.chargeHeadId || '',
    lateFeeIncomeHeadId: data?.lateFeeIncomeHeadId || '',
    ledgerMappingId: data?.ledgerMappingId || '',
    showOnReceipt: data?.showOnReceipt ?? true,
    showInParentPortal: data?.showInParentPortal ?? true,

    waiveOnApproval: data?.waiveOnApproval ?? false,
    waiveRoleIds: data?.waiveRoleIds || [],
    waiverAllowed: data?.waiverAllowed ?? false,
    maximumWaiverPercentage: data?.maximumWaiverPercentage ?? null,
    approvalRequired: data?.approvalRequired ?? false,
    reasonMandatory: data?.reasonMandatory ?? false,

    escalationRules: data?.escalationRules || [],
    applyOnFeeHeads: data?.applyOnFeeHeads || [],
  };
};

// Validation schema
const validationSchema = Yup.object().shape({
  policyName: Yup.string().required('Policy Name is required'),
  academicYearId: Yup.string().required('Academic Year is required'),
  effectiveFrom: Yup.mixed().required('Effective From date is required'),
  effectiveTo: Yup.mixed()
    .nullable()
    .test('date-order', 'Effective To must be on or after Effective From', function (value) {
      const { effectiveFrom } = this.parent;
      if (!effectiveFrom || !value) return true;
      return dayjs(value as string).isSameOrAfter(dayjs(effectiveFrom as string), 'day');
    }),
  gracePeriodDays: Yup.number()
    .typeError('Grace Days must be a number')
    .required('Grace Days is required')
    .min(0, 'Must be 0 or greater'),
  flatAmount: Yup.number()
    .nullable()
    .when('lateFeeType', {
      is: 'Flat',
      then: (s) => s.required('Flat Amount is required').min(0, 'Must be 0 or greater'),
    }),
  percentage: Yup.number()
    .nullable()
    .when('lateFeeType', {
      is: (val: string) => val === 'Percentage' || val === 'Compound',
      then: (s) =>
        s
          .required('Percentage is required')
          .min(0, 'Must be 0 or greater')
          .max(100, 'Cannot exceed 100%'),
    }),
  chargeHeadId: Yup.string()
    .nullable()
    .when('willCreateCharge', {
      is: true,
      then: (s) => s.required('Charge Head is required'),
    }),
});

interface UseLateFeePolicyFormProps {
  open: boolean;
  onClose: () => void;
  editData?: IFinancePolicyRow | null;
  academicYearId?: string;
}

export function useLateFeePolicyForm({
  open,
  onClose,
  editData,
  academicYearId = '',
}: UseLateFeePolicyFormProps) {
  const { currentYear, academicYears } = useSelector((state: RootState) => state.globalState);
  const unsavedChangesDialog = useBoolean();

  const [expandedSections, setExpandedSections] = useState<Set<SectionKey>>(
    new Set<SectionKey>(['general'])
  );

  /**
   * Memoization Justification:
   * Prevents creating a new toggle function on every single accordion interaction,
   * keeping internal accordion state logic stable.
   */
  const toggleSection = useCallback((key: SectionKey) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const [createPolicy, { isLoading: isCreating }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCreateFinancePolicyMutation,
  });

  const [updatePolicy, { isLoading: isUpdating }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateFinancePolicyMutation,
  });

  const isSaving = isCreating || isUpdating;

  const formik = useFormik<ILateFeePolicyFormValues>({
    initialValues: getInitialValues(editData, academicYearId || currentYear?.id || ''),
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      try {
        const payload = {
          ...values,
          policyType: 'late-fee' as const,
          effectiveFrom: values.effectiveFrom ? dayjs(values.effectiveFrom).toISOString() : null,
          effectiveTo: values.effectiveTo ? dayjs(values.effectiveTo).toISOString() : null,
        };

        if (editData?.id) {
          await updatePolicy({ id: editData.id, body: payload });
          shikshaMitraToast.success({ message: `Late fee policy "${values.policyName}" updated.` });
        } else {
          await createPolicy(payload);
          shikshaMitraToast.success({ message: `Late fee policy "${values.policyName}" created.` });
        }
        resetForm();
        onClose();
      } catch {
        shikshaMitraToast.error({ message: 'Failed to save policy.' });
      }
    },
  });

  // Code generator
  useEffect(() => {
    if (!editData && formik.values.policyName) {
      const code = `LFP-${formik.values.policyName
        .toUpperCase()
        .replace(/\s+/g, '-')
        .slice(0, 12)}-${Date.now().toString().slice(-4)}`;
      formik.setFieldValue('policyCode', code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.policyName, editData]);

  // Handle Escalation Enabled automatically when Slab is selected
  useEffect(() => {
    if (formik.values.lateFeeType === 'Slab') {
      formik.setFieldValue('escalationEnabled', true);
      if (formik.values.escalationRules.length === 0) {
        formik.setFieldValue('escalationRules', [
          { startDay: 1, endDay: 7, calculationType: 'Flat', value: 100 },
          { startDay: 8, endDay: 30, calculationType: 'Flat', value: 250 },
          { startDay: 31, endDay: null, calculationType: 'Percentage', value: 2 },
        ]);
      }
    } else {
      formik.setFieldValue('escalationEnabled', false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.lateFeeType]);

  const handleRequestClose = () => {
    if (formik.dirty) {
      unsavedChangesDialog.onTrue();
    } else {
      onClose();
    }
  };

  const handleDiscardChanges = () => {
    unsavedChangesDialog.onFalse();
    formik.resetForm();
    onClose();
  };

  const handleSaveAndClose = async () => {
    unsavedChangesDialog.onFalse();
    await formik.submitForm();
  };

  // Live Calculator inputs
  const [calcFeeDue, setCalcFeeDue] = useState(5000);
  const [calcPaidAfterDays, setCalcPaidAfterDays] = useState(12);

  /**
   * Memoization Justification:
   * Memoizes calculations for overdue fee in preview section to avoid complex
   * loop recalculations unless related pricing inputs change.
   */
  const calcLateFeeResult = useMemo(() => {
    const daysOverdue = Math.max(0, calcPaidAfterDays - formik.values.gracePeriodDays);
    if (daysOverdue <= 0) return 0;

    let fee = 0;
    if (formik.values.lateFeeType === 'Flat') {
      fee = formik.values.flatAmount || 0;
    } else if (formik.values.lateFeeType === 'Percentage') {
      const pct = (formik.values.percentage || 0) / 100;
      fee = calcFeeDue * pct;
    } else if (formik.values.lateFeeType === 'Compound') {
      const pct = (formik.values.percentage || 0) / 100;
      fee = calcFeeDue * (1 + pct) ** daysOverdue - calcFeeDue;
    } else if (formik.values.lateFeeType === 'Slab') {
      // Find matching slab
      // eslint-disable-next-line no-restricted-syntax
      for (const slab of formik.values.escalationRules) {
        if (daysOverdue >= slab.startDay && (slab.endDay === null || daysOverdue <= slab.endDay)) {
          if (slab.calculationType === 'Flat') {
            fee = slab.value;
          } else {
            fee = calcFeeDue * (slab.value / 100);
          }
          if (slab.maxFee) {
            fee = Math.min(fee, slab.maxFee);
          }
          break;
        }
      }
    }

    // Rounding off limits
    let result = fee;
    if (formik.values.roundOffMethod === 'RoundUp') {
      result = Math.ceil(result);
    } else if (formik.values.roundOffMethod === 'RoundDown') {
      result = Math.floor(result);
    } else if (formik.values.roundOffMethod === 'Nearest') {
      result = Math.round(result);
    }

    if (formik.values.minimumCharge != null && result < formik.values.minimumCharge) {
      result = formik.values.minimumCharge;
    }
    if (formik.values.maximumCharge != null && result > formik.values.maximumCharge) {
      result = formik.values.maximumCharge;
    }

    return result;
  }, [
    calcFeeDue,
    calcPaidAfterDays,
    formik.values.gracePeriodDays,
    formik.values.lateFeeType,
    formik.values.flatAmount,
    formik.values.percentage,
    formik.values.escalationRules,
    formik.values.roundOffMethod,
    formik.values.minimumCharge,
    formik.values.maximumCharge,
  ]);

  return {
    formik,
    academicYears,
    unsavedChangesDialog,
    expandedSections,
    toggleSection,
    isSaving,
    calcFeeDue,
    setCalcFeeDue,
    calcPaidAfterDays,
    setCalcPaidAfterDays,
    calcLateFeeResult,
    handleRequestClose,
    handleDiscardChanges,
    handleSaveAndClose,
  };
}
