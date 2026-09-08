'use client';

import type { RootState } from 'src/redux/store';

import * as Yup from 'yup';
import { useSelector } from 'react-redux';
import { useBoolean } from 'src/hooks/use-boolean';
import { useMemo, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { useFormik, setNestedObjectValues } from 'formik';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useGetActiveFeeHeadsQuery } from 'src/redux/feeHeadManage/feeHeadManageApi';
import {
  useGetRefundPolicyByIdQuery,
  useGetRefundPolicyImpactQuery,
  useCreateRefundPolicyMutation,
  useUpdateRefundPolicyMutation,
  useSimulateRefundPolicyMutation,
} from 'src/redux/finance/refundPolicy';

import type {
  IFinancePolicyRow,
  RefundPayoutMethod,
  IRefundPolicyFormValues,
} from '../types/finance-policy.types';

const POLICY_ERROR_MESSAGES: Record<string, string> = {
  'Finance:RefundPolicy:010005': 'A refund policy with this name already exists for the academic year.',
  'Finance:RefundPolicy:010006': 'A refund policy with this code already exists for the academic year.',
  'Finance:RefundPolicy:010018': 'This policy is attached to fee structures and cannot be moved to Draft or archived.',
  'Finance:RefundPolicy:010019': 'The policy was refreshed. Please review and submit again.',
  'Finance:RefundPolicy:010020': 'This policy was modified in another session. Please refresh and try again.',
  'Finance:RefundPolicy:010021': 'A change reason is required when editing an Active policy.',
};

export const emptyValues = (academicYearId: string): IRefundPolicyFormValues => ({
  policyType: 'refund',
  academicYearId,
  policyName: '',
  policyCode: '',
  description: '',
  status: 'Draft',
  isDefault: false,
  eligiblePaymentState: 'PartialAndFullPayment',
  feeHeadScope: 'AllFeeHeads',
  applicableFeeHeadIds: [],
  includePaidCharges: false,
  includePaidLateFee: false,
  requestDeadlineDays: null,
  allowPartialRefund: true,
  amountMode: 'ManualUpToEligible',
  percentageValue: null,
  fixedAmount: null,
  maximumPerRequest: null,
  maximumPerStudentYear: null,
  roundingMethod: 'None',
  deductionType: 'None',
  deductionValue: null,
  maximumDeduction: null,
  deductionExplanation: '',
  // Payout choice belongs to the refund transaction, not the policy setup screen.
  allowedPayoutMethods: ['Cash', 'Cheque', 'DemandDraft', 'BankTransfer', 'Upi'],
  processingTargetDays: null,
  concurrencyStamp: '',
  changeReason: '',
});

const emptyStringToNull = (value: number, originalValue: unknown) =>
  originalValue === '' ? null : value;

const validationSchema = Yup.object().shape({
  policyName: Yup.string()
    .trim()
    .min(3, 'Must be at least 3 characters')
    .max(128, 'Cannot exceed 128 characters')
    .required('Policy name is required'),
  status: Yup.string().oneOf(['Draft', 'Active'], 'Status must be Draft or Active').required(),
  isDefault: Yup.boolean(),
  description: Yup.string().max(500, 'Cannot exceed 500 characters').nullable(),
  feeHeadScope: Yup.string().oneOf(['AllFeeHeads', 'SelectedFeeHeads']).required(),
  applicableFeeHeadIds: Yup.array().when('feeHeadScope', {
    is: 'SelectedFeeHeads',
    then: (schema) => schema.min(1, 'Select at least one Fee Head'),
  }),
  percentageValue: Yup.number()
    .nullable()
    .transform(emptyStringToNull)
    .when('amountMode', {
      is: 'Percentage',
      then: (schema) =>
        schema
          .typeError('Percentage must be a number')
          .min(0.01, 'Percentage must be greater than 0%')
          .max(100, 'Cannot exceed 100%')
          .required('Percentage is required'),
    }),
  fixedAmount: Yup.number()
    .nullable()
    .transform(emptyStringToNull)
    .when('amountMode', {
      is: 'FixedAmount',
      then: (schema) =>
        schema
          .typeError('Fixed amount must be a number')
          .min(0.01, 'Fixed amount must be greater than 0')
          .required('Fixed amount is required'),
    }),
  deductionValue: Yup.number()
    .nullable()
    .transform(emptyStringToNull)
    .when('deductionType', {
      is: (value: string) => value && value !== 'None',
      then: (schema) =>
        schema
          .typeError('Deduction value must be a number')
          .min(0.01, 'Deduction value must be greater than 0')
          .required('Deduction value is required'),
    }),
  deductionExplanation: Yup.string().when('deductionType', {
    is: (value: string) => value && value !== 'None',
    then: (schema) =>
      schema
        .trim()
        .max(500, 'Cannot exceed 500 characters')
        .required('Explain why this deduction applies'),
  }),
  allowedPayoutMethods: Yup.array().min(1, 'Select at least one payout method'),
  maximumPerRequest: Yup.number()
    .nullable()
    .transform(emptyStringToNull)
    .min(0.01, 'Must be greater than 0'),
  maximumPerStudentYear: Yup.number()
    .nullable()
    .transform(emptyStringToNull)
    .min(0.01, 'Must be greater than 0')
    .test(
      'cap-order',
      'Student/year cumulative cap must be at least the per-request cap',
      function validateCap(value) {
        const perRequest = this.parent.maximumPerRequest;
        return value == null || perRequest == null || value >= perRequest;
      }
    ),
  changeReason: Yup.string().trim().max(500, 'Cannot exceed 500 characters'),
});

export const PAYOUT_METHODS: Array<{ value: RefundPayoutMethod; label: string; icon: string }> = [
  { value: 'Cash', label: 'Cash', icon: 'solar:dollar-bold-duotone' },
  { value: 'Cheque', label: 'Cheque', icon: 'solar:bill-check-bold-duotone' },
  { value: 'DemandDraft', label: 'Demand Draft', icon: 'solar:document-text-bold-duotone' },
  { value: 'BankTransfer', label: 'Bank Transfer', icon: 'solar:card-transfer-bold-duotone' },
  { value: 'Upi', label: 'UPI', icon: 'solar:smartphone-bold-duotone' },
];

interface UseRefundPolicyFormOptions {
  open: boolean;
  onClose: () => void;
  editData?: IFinancePolicyRow | null;
  academicYearId?: string;
}

export function useRefundPolicyForm({
  open,
  onClose,
  editData,
  academicYearId = '',
}: UseRefundPolicyFormOptions) {
  const policyId = editData?.id;
  const { currentYear, academicYears } = useSelector((state: RootState) => state.globalState);
  const activeAcademicYearId = academicYearId || currentYear?.id || '';

  const unsavedChangesDialog = useBoolean();

  // Queries
  const { data: detail, isLoading: isDetailLoading } = useGetRefundPolicyByIdQuery(policyId || '', {
    skip: !open || !policyId,
  });

  const { data: impact, isLoading: isImpactLoading } = useGetRefundPolicyImpactQuery(
    policyId || '',
    {
      skip: !open || !policyId || editData?.status !== 'Active',
    }
  );

  const { data: feeHeads = [], isLoading: isFeeHeadsLoading } = useGetActiveFeeHeadsQuery(
    activeAcademicYearId,
    { skip: !open || !activeAcademicYearId }
  );

  // Mutations
  const [createPolicy, { isLoading: isCreating }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCreateRefundPolicyMutation,
    popupConfig: { error: false },
  });

  const [updatePolicy, { isLoading: isUpdating }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateRefundPolicyMutation,
    popupConfig: { error: false },
  });

  const [simulatePolicy, { data: serverSimulation, isLoading: isSimulating }] =
    useSimulateRefundPolicyMutation();

  const isSaving = isCreating || isUpdating;
  const activeEdit = Boolean(policyId && (detail?.status === 'Active' || editData?.status === 'Active'));

  // Simulation parameters
  const [simulationInput, setSimulationInput] = useState({
    settledPaidAmount: 10000,
    priorProcessedRefund: 0,
    activeReservation: 0,
    studentYearRefundedOrReserved: 0,
    requestedAmount: 10000,
  });

  const initialValues = useMemo<IRefundPolicyFormValues>(() => {
    if (!detail) return emptyValues(activeAcademicYearId);
    return {
      ...emptyValues(detail.academicYearId || activeAcademicYearId),
      ...detail,
      policyType: 'refund',
      status: detail.status === 'Archived' ? 'Draft' : detail.status,
      changeReason: '',
    };
  }, [activeAcademicYearId, detail]);

  const formik = useFormik<IRefundPolicyFormValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      if (activeEdit && !values.changeReason?.trim()) {
        formik.setFieldError('changeReason', 'Change reason is required for an Active policy');
        return;
      }

      const body = {
        academicYearId: values.academicYearId || activeAcademicYearId,
        policyName: values.policyName.trim(),
        policyCode: values.policyCode?.trim() || null,
        description: values.description?.trim() || '',
        status: values.status,
        isDefault: values.status === 'Active' ? Boolean(values.isDefault) : false,
        eligiblePaymentState: values.eligiblePaymentState,
        feeHeadScope: values.feeHeadScope,
        applicableFeeHeadIds:
          values.feeHeadScope === 'SelectedFeeHeads' ? values.applicableFeeHeadIds : [],
        includePaidCharges: values.includePaidCharges,
        includePaidLateFee: values.includePaidLateFee,
        requestDeadlineDays: values.requestDeadlineDays,
        allowPartialRefund: values.allowPartialRefund,
        amountMode: values.amountMode,
        percentageValue: values.amountMode === 'Percentage' ? values.percentageValue : null,
        fixedAmount: values.amountMode === 'FixedAmount' ? values.fixedAmount : null,
        maximumPerRequest: values.maximumPerRequest,
        maximumPerStudentYear: values.maximumPerStudentYear,
        roundingMethod: values.roundingMethod,
        deductionType: values.deductionType,
        deductionValue: values.deductionType === 'None' ? null : values.deductionValue,
        maximumDeduction: values.deductionType === 'None' ? null : values.maximumDeduction,
        deductionExplanation:
          values.deductionType === 'None' ? '' : values.deductionExplanation?.trim() || '',
        allowedPayoutMethods: values.allowedPayoutMethods,
        processingTargetDays: values.processingTargetDays,
        changeReason: activeEdit ? values.changeReason?.trim() : null,
        concurrencyStamp: policyId ? (detail?.concurrencyStamp || values.concurrencyStamp) : null,
      };

      try {
        if (policyId) {
          await updatePolicy({ id: policyId, body }).unwrap();
          shikshaMitraToast.success({
            message: `Refund policy “${values.policyName}” updated successfully.`,
          });
        } else {
          await createPolicy(body).unwrap();
          shikshaMitraToast.success({
            message: `Refund policy “${values.policyName}” created successfully.`,
          });
        }
        resetForm();
        onClose();
      } catch (error) {
        const parsed = parseApiProblemDetail(error);
        shikshaMitraToast.error({
          message: POLICY_ERROR_MESSAGES[parsed.errorCode ?? ''] || parsed.detail,
        });
      }
    },
  });

  useEffect(() => {
    if (!open) {
      formik.resetForm({ values: emptyValues(activeAcademicYearId) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, activeAcademicYearId]);

  // Close handler with dirty check
  const handleCloseAttempt = () => {
    if (formik.dirty) {
      unsavedChangesDialog.onTrue();
    } else {
      onClose();
    }
  };

  // Custom submit (with optional status override: 'Draft' | 'Active')
  const handleCustomSubmit = async (targetStatus?: 'Draft' | 'Active') => {
    if (isSaving) return;

    if (targetStatus) {
      await formik.setFieldValue('status', targetStatus, false);
    }

    const willBeActive = (targetStatus || formik.values.status) === 'Active';
    if (policyId && willBeActive && activeEdit && !formik.values.changeReason?.trim()) {
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

  // Trigger server simulation
  const handleRunSimulation = async () => {
    if (!policyId) return;
    try {
      await simulatePolicy({
        id: policyId,
        body: {
          ...simulationInput,
          requestedAmount:
            formik.values.amountMode === 'ManualUpToEligible'
              ? simulationInput.requestedAmount
              : null,
        },
      }).unwrap();
    } catch (error) {
      const parsed = parseApiProblemDetail(error);
      shikshaMitraToast.error({
        message: parsed.detail || 'Simulation failed.',
      });
    }
  };

  // Live client-side calculation preview
  const liveSimulation = useMemo(() => {
    const { values } = formik;
    const settled = simulationInput.settledPaidAmount || 0;
    const prior = simulationInput.priorProcessedRefund || 0;
    const reserved = simulationInput.activeReservation || 0;
    const studentYearUsed = simulationInput.studentYearRefundedOrReserved || 0;

    const remainingEligible = Math.max(0, settled - prior - reserved);

    let rawAmount = 0;
    if (values.amountMode === 'RemainingPaidAmount') {
      rawAmount = remainingEligible;
    } else if (values.amountMode === 'ManualUpToEligible') {
      rawAmount = Math.min(simulationInput.requestedAmount || 0, remainingEligible);
    } else if (values.amountMode === 'FixedAmount') {
      rawAmount = Math.min(values.fixedAmount || 0, remainingEligible);
    } else if (values.amountMode === 'Percentage') {
      rawAmount = (remainingEligible * (values.percentageValue || 0)) / 100;
    }

    // Deduction
    let deduction = 0;
    if (values.deductionType === 'FixedAmount') {
      deduction = Math.min(rawAmount, values.deductionValue || 0);
    } else if (values.deductionType === 'Percentage') {
      deduction = (rawAmount * (values.deductionValue || 0)) / 100;
    }
    if (values.maximumDeduction != null && values.maximumDeduction > 0) {
      deduction = Math.min(deduction, values.maximumDeduction);
    }

    let netRefund = Math.max(0, rawAmount - deduction);

    // Caps
    let capAdjustment = 0;
    if (values.maximumPerRequest != null && values.maximumPerRequest > 0) {
      if (netRefund > values.maximumPerRequest) {
        capAdjustment += netRefund - values.maximumPerRequest;
        netRefund = values.maximumPerRequest;
      }
    }
    if (values.maximumPerStudentYear != null && values.maximumPerStudentYear > 0) {
      const availableStudentCap = Math.max(0, values.maximumPerStudentYear - studentYearUsed);
      if (netRefund > availableStudentCap) {
        capAdjustment += netRefund - availableStudentCap;
        netRefund = availableStudentCap;
      }
    }

    // Rounding
    if (values.roundingMethod === 'RoundUp') {
      netRefund = Math.ceil(netRefund);
    } else if (values.roundingMethod === 'RoundDown') {
      netRefund = Math.floor(netRefund);
    } else if (values.roundingMethod === 'NearestRupee') {
      netRefund = Math.round(netRefund);
    }

    return {
      remainingEligible,
      rawRefund: rawAmount,
      deductionAmount: deduction,
      capAdjustment,
      finalRefund: netRefund,
    };
  }, [formik, simulationInput]);

  // Validation Checks for summary checklist
  const checks = useMemo(() => {
    const { values, errors } = formik;

    const generalValid =
      !!values.policyName &&
      values.policyName.trim().length >= 3 &&
      !errors.policyName &&
      !errors.status;

    const eligibilityValid =
      !errors.eligiblePaymentState &&
      !errors.feeHeadScope &&
      (values.feeHeadScope === 'AllFeeHeads' || (values.applicableFeeHeadIds?.length ?? 0) > 0);

    const amountValid =
      !errors.amountMode &&
      !errors.percentageValue &&
      !errors.fixedAmount &&
      !errors.maximumPerRequest &&
      !errors.maximumPerStudentYear &&
      (values.amountMode === 'Percentage'
        ? (values.percentageValue ?? 0) > 0
        : values.amountMode === 'FixedAmount'
          ? (values.fixedAmount ?? 0) > 0
          : true);

    const deductionValid =
      !errors.deductionType &&
      !errors.deductionValue &&
      !errors.deductionExplanation &&
      !errors.allowedPayoutMethods &&
      (values.allowedPayoutMethods?.length ?? 0) > 0 &&
      (values.deductionType === 'None' ||
        ((values.deductionValue ?? 0) > 0 && !!values.deductionExplanation?.trim()));

    const isReadyToPublish = generalValid && eligibilityValid && amountValid && deductionValid;

    return {
      generalValid,
      eligibilityValid,
      amountValid,
      deductionValid,
      isReadyToPublish,
    };
  }, [formik]);

  return {
    formik,
    academicYears,
    policyId,
    activeEdit,
    detail,
    impact,
    isImpactLoading,
    feeHeads,
    isFeeHeadsLoading,
    isSaving,
    isDetailLoading,
    unsavedChangesDialog,
    simulationInput,
    setSimulationInput,
    serverSimulation,
    isSimulating,
    liveSimulation,
    checks,
    handleCloseAttempt,
    handleCustomSubmit,
    handleRunSimulation,
  };
}
