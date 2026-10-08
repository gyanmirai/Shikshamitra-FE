'use client';

import type { RootState } from 'src/redux/store';

import * as Yup from 'yup';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useBoolean } from 'src/hooks/use-boolean';
import { capitalizeWords } from 'src/utils/input-format';
import { shikshaMitraToast } from 'src/components/toast';
import { useFormik, setNestedObjectValues } from 'formik';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { roundUpAmount, roundUpWithinAmount } from 'src/utils/whole-rupee-amount';
import {
  useCreateConcessionPolicyMutation,
  useGetConcessionPolicyImpactQuery,
  useUpdateConcessionPolicyMutation,
} from 'src/redux/finance/concessionPolicy';

import type { IFinancePolicyRow, IConcessionPolicyFormValues } from '../types/finance-policy.types';

const POLICY_ERROR_MESSAGES: Record<string, string> = {
  'Finance:ConcessionPolicy:010005':
    'A policy with this name already exists for the academic year.',
  'Finance:ConcessionPolicy:010006':
    'A policy with this code already exists for the academic year.',
  'Finance:ConcessionPolicy:010018':
    'This policy is used by concession requests and cannot be moved to Draft or archived.',
  'Finance:ConcessionPolicy:010025':
    'This policy does not apply to the selected concession request.',
  'Finance:ConcessionPolicy:010019': 'The policy was refreshed. Please review and submit again.',
  'Finance:ConcessionPolicy:010020':
    'This policy changed in another session. Refresh and try again.',
  'Finance:ConcessionPolicy:010021': 'A change reason is required when editing an Active policy.',
};

const emptyStringToNull = (value: number, originalValue: unknown) =>
  originalValue === '' ? null : value;

// ─── Initial Values ───────────────────────────────────────────────────────────

const getInitialValues = (
  editData: IFinancePolicyRow | null | undefined,
  academicYearId: string
): IConcessionPolicyFormValues => {
  const d = editData as any;
  return {
    policyName: d?.policyName || '',
    policyCode: d?.policyCode || '',
    description: d?.description || '',
    status: d?.status || 'Draft',
    isDefault: d?.isDefault ?? false,
    academicYearId: d?.academicYearId || academicYearId || '',
    policyType: 'concession',
    valueSource: d?.valueSource || 'RequestEnteredWithinLimits',
    calculationMethod: d?.calculationMethod || 'Percentage',
    percentageValue: d?.percentageValue ?? null,
    fixedAmount: d?.fixedAmount ?? null,
    maximumPercentage: d?.maximumPercentage ?? null,
    maximumFixedAmount: d?.maximumFixedAmount ?? null,
    roundOff: 'RoundUp',
    applyOn: d?.applyOn || 'AllOutstanding',
    autoCreateRefund: d?.applyOn === 'AllFees' ? (d?.autoCreateRefund ?? true) : false,
    concurrencyStamp: d?.concurrencyStamp || '',
    changeReason: '',
  };
};

// ─── Validation Schema ────────────────────────────────────────────────────────

const validationSchema = Yup.object().shape({
  policyName: Yup.string()
    .trim()
    .required('Policy name is required')
    .min(3, 'Must be at least 3 characters')
    .max(128, 'Cannot exceed 128 characters'),
  status: Yup.string()
    .oneOf(['Draft', 'Active'], 'Status must be Draft or Active')
    .required('Status is required'),
  isDefault: Yup.boolean(),
  autoCreateRefund: Yup.boolean().test(
    'paid-scope',
    'Automatic refunds require a scope that includes paid installments',
    function validatePaidScope(value) {
      return !value || this.parent.applyOn === 'AllFees';
    }
  ),
  description: Yup.string().max(500, 'Cannot exceed 500 characters').nullable(),
  valueSource: Yup.string()
    .oneOf(['PolicyFixed', 'RequestEnteredWithinLimits'])
    .required('Value source is required'),
  calculationMethod: Yup.string()
    .oneOf(['Percentage', 'FixedAmount', 'FullWaiver'])
    .required('Calculation method is required'),
  percentageValue: Yup.number()
    .nullable()
    .transform(emptyStringToNull)
    .when(['calculationMethod', 'valueSource'], {
      is: (method: string, source: string) => method === 'Percentage' && source === 'PolicyFixed',
      then: (s) =>
        s
          .typeError('Percentage must be a number')
          .required('Percentage value is required')
          .min(0.01, 'Percentage must be greater than 0%')
          .max(100, 'Cannot exceed 100%'),
    }),
  fixedAmount: Yup.number()
    .nullable()
    .transform(emptyStringToNull)
    .when(['calculationMethod', 'valueSource'], {
      is: (method: string, source: string) => method === 'FixedAmount' && source === 'PolicyFixed',
      then: (s) =>
        s
          .typeError('Fixed amount must be a number')
          .required('Fixed amount is required')
          .min(0.01, 'Fixed amount must be greater than 0'),
    }),
  applyOn: Yup.string()
    .oneOf(['AllOutstanding', 'CurrentInstallment', 'FutureInstallments', 'AllFees'])
    .required('Apply concession on is required'),
  maximumPercentage: Yup.number()
    .nullable()
    .transform(emptyStringToNull)
    .when(['calculationMethod', 'valueSource'], {
      is: (method: string, source: string) =>
        method === 'Percentage' && source === 'RequestEnteredWithinLimits',
      then: (schema) =>
        schema
          .typeError('Maximum percentage must be a number')
          .required('Maximum percentage is required')
          .min(0.01, 'Maximum percentage must be greater than 0%')
          .max(100, 'Cannot exceed 100%'),
    }),
  maximumFixedAmount: Yup.number()
    .nullable()
    .transform(emptyStringToNull)
    .when(['calculationMethod', 'valueSource'], {
      is: (method: string, source: string) =>
        method === 'FixedAmount' && source === 'RequestEnteredWithinLimits',
      then: (schema) =>
        schema
          .typeError('Maximum fixed amount must be a number')
          .required('Maximum fixed amount is required')
          .min(0.01, 'Maximum fixed amount must be greater than 0'),
    }),
  roundOff: Yup.string().nullable(),
  changeReason: Yup.string().trim().max(500, 'Cannot exceed 500 characters'),
});

// ─── Hook ────────────────────────────────────────────────────────────────────

interface UseConcessionPolicyFormOptions {
  open: boolean;
  onClose: () => void;
  editData?: IFinancePolicyRow | null;
  academicYearId?: string;
}

export function useConcessionPolicyForm({
  open,
  onClose,
  editData,
  academicYearId = '',
}: UseConcessionPolicyFormOptions) {
  const { currentYear, academicYears } = useSelector((state: RootState) => state.globalState);
  const unsavedChangesDialog = useBoolean();
  const activeEdit = editData?.status === 'Active';
  const impactQuery = useGetConcessionPolicyImpactQuery(editData?.id || '', {
    skip: !open || !editData?.id || !activeEdit,
  });

  // ─── Simulation State ─────────────────────────────────────────────────────
  const [simFeeAmount, setSimFeeAmount] = useState(10000);
  const [simAlreadyPaid, setSimAlreadyPaid] = useState(0);
  const [simLateFee, setSimLateFee] = useState(0);

  // ─── API Mutations ────────────────────────────────────────────────────────
  const [createPolicy, { isLoading: isCreating }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCreateConcessionPolicyMutation,
    popupConfig: { error: false },
  });
  const [updatePolicy, { isLoading: isUpdating }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateConcessionPolicyMutation,
    popupConfig: { error: false },
  });
  const isSaving = isCreating || isUpdating;

  // ─── Formik ───────────────────────────────────────────────────────────────
  const formik = useFormik<IConcessionPolicyFormValues>({
    initialValues: getInitialValues(editData, academicYearId || currentYear?.id || ''),
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      try {
        const payload = {
          academicYearId: values.academicYearId,
          policyName: values.policyName,
          policyCode: values.policyCode || null,
          description: values.description,
          status: values.status,
          isDefault: values.status === 'Active' ? Boolean(values.isDefault) : false,
          valueSource: values.valueSource,
          calculationMethod: values.calculationMethod,
          percentageValue: values.valueSource === 'PolicyFixed' ? values.percentageValue : null,
          fixedAmount: values.valueSource === 'PolicyFixed' ? values.fixedAmount : null,
          maximumPercentage: values.maximumPercentage,
          maximumFixedAmount: values.maximumFixedAmount,
          applyOn: values.applyOn,
          autoCreateRefund: values.applyOn === 'AllFees' && Boolean(values.autoCreateRefund),
          roundingMethod: 'RoundUp',
          changeReason: values.changeReason?.trim() || null,
          concurrencyStamp: editData?.id ? values.concurrencyStamp : null,
        };
        if (editData?.id) {
          await updatePolicy({ id: editData.id, body: payload }).unwrap();
          shikshaMitraToast.success({ message: `Policy "${values.policyName}" updated.` });
        } else {
          await createPolicy(payload).unwrap();
          shikshaMitraToast.success({ message: `Policy "${values.policyName}" created.` });
        }
        resetForm();
        onClose();
      } catch (error: any) {
        const parsed = parseApiProblemDetail(error);
        shikshaMitraToast.error({
          message: POLICY_ERROR_MESSAGES[parsed.errorCode ?? ''] || parsed.detail,
        });
      }
    },
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    formik.setFieldValue('policyName', capitalizeWords(e.target.value));
  };

  // ─── Close Handler ─────────────────────────────────────────────────────────
  const handleCloseAttempt = () => {
    if (formik.dirty) {
      unsavedChangesDialog.onTrue();
    } else {
      onClose();
    }
  };

  // ─── Single submit action; the selected Draft/Active status is preserved ──
  const handleCustomSubmit = async () => {
    if (isSaving) return;

    if (activeEdit && !formik.values.changeReason?.trim()) {
      await formik.setFieldTouched('changeReason', true, false);
      formik.setFieldError('changeReason', 'Change reason is required for an Active policy');
      requestAnimationFrame(() => {
        const field = document.querySelector<HTMLElement>('[name="changeReason"]');
        field?.focus();
        field?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      return;
    }

    const errors = await formik.validateForm();
    if (Object.keys(errors).length > 0) {
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

    await formik.submitForm();
  };

  // ─── Validation Checks ─────────────────────────────────────────────────────
  const checks = useMemo(() => {
    const { values, errors } = formik;
    const generalValid =
      !!values.policyName &&
      values.policyName.trim().length >= 3 &&
      !errors.policyName &&
      !errors.status &&
      !errors.description;

    const calcValid =
      !errors.valueSource &&
      !errors.calculationMethod &&
      !errors.percentageValue &&
      !errors.fixedAmount &&
      !errors.maximumPercentage &&
      !errors.maximumFixedAmount &&
      (values.valueSource === 'RequestEnteredWithinLimits'
        ? (values.calculationMethod === 'Percentage' && (values.maximumPercentage ?? 0) > 0) ||
          (values.calculationMethod === 'FixedAmount' && (values.maximumFixedAmount ?? 0) > 0)
        : values.calculationMethod === 'FullWaiver' ||
          (values.calculationMethod === 'Percentage' &&
            values.percentageValue !== null &&
            values.percentageValue > 0) ||
          (values.calculationMethod === 'FixedAmount' &&
            values.fixedAmount !== null &&
            values.fixedAmount > 0));

    const applicationValid = !!values.applyOn && !errors.applyOn;

    const isReadyToPublish = generalValid && calcValid && applicationValid;

    return {
      generalValid,
      calcValid,
      applicationValid,
      isReadyToPublish,
    };
  }, [formik]);

  // ─── Live Simulation ───────────────────────────────────────────────────────
  const simulation = useMemo(() => {
    const { values } = formik;
    const pending = Math.max(0, simFeeAmount - simAlreadyPaid);
    const eligibleBase = values.applyOn === 'AllFees' ? simFeeAmount : pending;

    let concessionAmount = 0;
    const simulatedValue =
      values.valueSource === 'PolicyFixed'
        ? values.calculationMethod === 'Percentage'
          ? values.percentageValue
          : values.fixedAmount
        : values.calculationMethod === 'Percentage'
          ? values.maximumPercentage
          : values.maximumFixedAmount;
    if (values.calculationMethod === 'Percentage' && simulatedValue) {
      concessionAmount = (eligibleBase * simulatedValue) / 100;
    } else if (values.calculationMethod === 'FixedAmount' && simulatedValue) {
      concessionAmount = simulatedValue;
    } else if (values.calculationMethod === 'FullWaiver') {
      concessionAmount = eligibleBase;
    }

    const maximum =
      values.valueSource === 'RequestEnteredWithinLimits' &&
      values.calculationMethod === 'FixedAmount'
        ? Math.min(eligibleBase, values.maximumFixedAmount ?? eligibleBase)
        : eligibleBase;
    concessionAmount =
      values.calculationMethod === 'FullWaiver'
        ? eligibleBase
        : roundUpWithinAmount(concessionAmount, maximum);

    const newOutstanding = Math.max(0, pending - concessionAmount);

    return {
      concessionAmount,
      refundRequired: Math.max(0, concessionAmount - pending),
      newOutstanding: roundUpAmount(newOutstanding),
      lateFeeImpact: roundUpAmount(simLateFee),
    };
  }, [formik, simFeeAmount, simAlreadyPaid, simLateFee]);

  return {
    formik,
    academicYears: academicYears || [],
    activeEdit,
    impact: impactQuery.data,
    isImpactLoading: impactQuery.isLoading || impactQuery.isFetching,
    isSaving,
    unsavedChangesDialog,
    checks,
    simulation,
    simFeeAmount,
    setSimFeeAmount,
    simAlreadyPaid,
    setSimAlreadyPaid,
    simLateFee,
    setSimLateFee,
    handleNameChange,
    handleCloseAttempt,
    handleCustomSubmit,
  };
}
