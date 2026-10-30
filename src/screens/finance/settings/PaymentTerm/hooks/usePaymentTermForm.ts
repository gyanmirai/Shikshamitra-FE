'use client';

import { financeNameSchema } from 'src/utils/finance-name';

import type { FormikTouched } from 'formik';
import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import { shikshaMitraToast } from 'src/components/toast';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { useGetBoardsQuery } from 'src/redux/board/boardApi';
import { useMemo, useState, useEffect, useCallback } from 'react';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useRefreshFinancePrerequisites } from 'src/screens/finance/hooks/useRefreshFinancePrerequisites';
import {
  type PaymentTermUsage,
  useCreateRevisionMutation,
  useGetPaymentTermUsageQuery,
  useCreatePaymentTermMutation,
  type PaymentTermDefaultImpact,
  type CreateInstallmentRequest,
  useLazyGetPaymentTermByIdQuery,
  type PaymentTermDetailResponse,
  useUpdatePaymentTermDraftMutation,
  type UpdatePaymentTermDraftRequest,
  useGetPaymentTermDefaultImpactQuery,
  type PaymentTermInstallmentResponse,
  useLazyGetPaymentTermDefaultImpactQuery,
} from 'src/redux/finance/paymentTerm';

import { toPaymentTermApiDate } from '../paymentTermApiDate';
import { normalizePaymentTermName } from '../paymentTermName';
import { getAllocationSummary } from '../allocationValidation';
import { getInitialPaymentTermData } from '../Components/PaymentTermInitialValues';
import { paymentTermCalendarMissing } from '../../components/financeSetupPrerequisites';
import { paymentTermValidationSchema } from '../Components/PaymentTermValidationSchema';
import { getInvoiceDateError, getInvoiceOffsetLimit } from '../invoiceScheduleValidation';

import type { IInstallment, IPaymentTerm, DemandGenerationRule } from '../type';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

// ---------------------------------------------------------------------------
// Public board shape — eliminates `any` throughout consumers
// ---------------------------------------------------------------------------
export interface IBoard {
  id: string;
  name: string;
  academicYearId: string;
  startDate: string;
  endDate: string;
}

// ---------------------------------------------------------------------------
// Computed publish-readiness checks shared between the sidebar and footer
// ---------------------------------------------------------------------------
export interface IPaymentTermChecks {
  boardValid: boolean;
  nameValid: boolean;
  codeValid: boolean;
  hasInstallments: boolean;
  allDueDates: boolean;
  allNames: boolean;
  uniqueNames: boolean;
  allocationValid: boolean;
  periodsValid: boolean;
  periodsNonOverlapping: boolean;
  periodsWithinBoard: boolean;
  datesSequential: boolean;
  demandSet: boolean;
  demandOffsetValid: boolean;
  specificDatesValid: boolean;
  isReadyToPublish: boolean;
  validationMessage: string;
}

// ---------------------------------------------------------------------------
// Full return contract exposed to consuming components
// ---------------------------------------------------------------------------
export interface UsePaymentTermFormReturn {
  formik: ReturnType<typeof useFormik<IPaymentTerm>>;
  boards: IBoard[];
  checks: IPaymentTermChecks;
  calendarMissing: boolean;
  refreshPrerequisites: () => void;
  demandLabel: string;
  isSubmitting: boolean;
  isLoadingDetail: boolean;
  isLoadingOptions: boolean;
  handleSubmit: (confirmed?: boolean) => Promise<void>;
  defaultImpact?: PaymentTermDefaultImpact;
  termUsage?: PaymentTermUsage;
  confirmationImpact: PaymentTermDefaultImpact | null;
  cancelDefaultConfirmation: () => void;
  isLoadingImpact: boolean;
  impactError: boolean;
  addInstallment: () => void;
  removeInstallment: (index: number) => void;
}

// ---------------------------------------------------------------------------
// API ↔ UI mappers
// ---------------------------------------------------------------------------
const mapApiInstallmentToUi = (inst: PaymentTermInstallmentResponse): IInstallment => ({
  id: inst.id,
  installmentName: inst.name,
  sequence: inst.sequence,
  startDate: inst.coverageStartDate,
  endDate: inst.coverageEndDate,
  demandDate: inst.demandDate,
  dueDate: inst.dueDate,
  description: '',
  allocationPercentage: inst.allocationPercentage,
  reminderDate: inst.reminderDate ?? null,
  allowPartialOverride: inst.allowPartialOverride ?? null,
  gracePeriod: inst.gracePeriodDaysOverride ?? null,
  demandEnabled: inst.demandEnabled,
  reminderEnabled: inst.reminderEnabled,
});

const mapDetailToForm = (detail: PaymentTermDetailResponse): IPaymentTerm => {
  const draft = detail.versions?.find((v) => v.status === 'Draft');
  const current =
    draft ??
    detail.versions?.find((v) => v.id === detail.currentVersionId) ??
    detail.versions?.find((v) => v.status === 'Published') ??
    detail.versions?.[0];
  const installments = (current?.installments ?? []).map(mapApiInstallmentToUi);

  return {
    id: detail.id,
    paymentTermName: detail.name,
    paymentTermCode: detail.code,
    boardId: detail.boardId,
    description: detail.description ?? '',
    status: detail.status,
    academicYearId: detail.academicYearId,
    totalInstallments: detail.totalInstallments,
    installments,
    invoiceCreationEnabled:
      installments.length === 0 || installments.every((installment) => installment.demandEnabled),
    isDefaultTerm: detail.isDefault,
    holidayShiftingMethod: current?.holidayShiftingMethod ?? detail.holidayShiftingMethod,
    demandGenerationRule: current?.demandGenerationRule ?? detail.demandGenerationRule,
    demandOffsetDays: current?.demandOffsetDays ?? detail.demandOffsetDays ?? null,
    initialDemandStatus: detail.initialDemandStatus,
    currentVersionId: current?.id ?? detail.currentVersionId,
    currentVersionNumber: current?.versionNumber,
    currentVersionStatus: current?.status,
    isUsedInDownstream: detail.isUsedInFeeStructures,
    canDirectEdit: detail.canDirectEdit,
  };
};

const mapUiInstallmentToApi = (
  inst: IInstallment,
  index: number,
  demandGenerationRule: DemandGenerationRule,
  invoiceCreationEnabled: boolean
): CreateInstallmentRequest => ({
  sequence: inst.sequence || index + 1,
  name: inst.installmentName,
  coverageStartDate: toPaymentTermApiDate(inst.startDate),
  coverageEndDate: toPaymentTermApiDate(inst.endDate),
  demandDate:
    demandGenerationRule === 'SpecificDate'
      ? toPaymentTermApiDate(
          invoiceCreationEnabled
            ? inst.demandDate
            : inst.demandDate || inst.dueDate || inst.startDate
        )
      : undefined,
  dueDate: toPaymentTermApiDate(inst.dueDate),
  allocationPercentage: Number(inst.allocationPercentage) || 0,
  demandEnabled: invoiceCreationEnabled,
  reminderEnabled: inst.reminderEnabled ?? true,
  reminderDate: inst.reminderDate ? toPaymentTermApiDate(inst.reminderDate) : undefined,
  allowPartialOverride: inst.allowPartialOverride ?? null,
  gracePeriodDaysOverride: inst.gracePeriod ?? null,
});

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function usePaymentTermForm(
  editData: IPaymentTerm | null,
  onClose: (e?: React.SyntheticEvent | null, isSubmit?: boolean) => void
): UsePaymentTermFormReturn {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationImpact, setConfirmationImpact] = useState<PaymentTermDefaultImpact | null>(
    null
  );
  const [getDefaultImpact] = useLazyGetPaymentTermDefaultImpactQuery();
  // ── Data queries ──────────────────────────────────────────────────────────
  const boardQuery = useGetBoardsQuery('');
  const { data: boardData } = boardQuery;
  const refreshPrerequisites = () => {
    if (!boardQuery.isUninitialized) boardQuery.refetch?.();
  };
  useRefreshFinancePrerequisites(refreshPrerequisites);

  /**
   * Memoization Justification:
   * Filters the full board list by academicYearId on every render. Without memoization,
   * a new array reference is created every render cycle, causing downstream Select and
   * GeneralInfoSection to re-render even when board data hasn't changed.
   * Profiling signal: boardData updates infrequently; currentYear.id only changes on
   * year-switcher action — both are stable across form interactions.
   */
  const boards = useMemo<IBoard[]>(() => {
    if (!boardData?.items || !currentYear?.id) return [];
    return boardData.items.filter((b: IBoard) => b.academicYearId === currentYear.id);
  }, [boardData?.items, currentYear?.id]);

  // ── Mutations ─────────────────────────────────────────────────────────────
  const [createTerm] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCreatePaymentTermMutation,
    popupConfig: { error: false },
  });
  const [updateDraft] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdatePaymentTermDraftMutation,
    popupConfig: { error: false },
  });
  const [createRevision] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCreateRevisionMutation,
    popupConfig: { error: false },
  });
  const [getPaymentTermDetail, { isFetching: isLoadingDetail }] = useLazyGetPaymentTermByIdQuery();

  // ── Formik ────────────────────────────────────────────────────────────────
  const initialValues = useMemo(
    () => getInitialPaymentTermData(editData, currentYear?.id),
    [editData, currentYear?.id]
  );

  const validationSchema = useMemo(() => paymentTermValidationSchema(boards), [boards]);

  const formik = useFormik<IPaymentTerm>({
    initialValues,
    validationSchema,
    validateOnMount: true,
    enableReinitialize: true,
    onSubmit: async () => {},
  });

  const calendarMissing = paymentTermCalendarMissing(
    boardQuery,
    currentYear?.id,
    formik.values.boardId
  );

  const impactParams = useMemo(
    () => ({
      academicYearId: currentYear?.id ?? formik.values.academicYearId,
      boardId: formik.values.boardId,
      paymentTermId: editData?.id,
    }),
    [currentYear?.id, formik.values.academicYearId, formik.values.boardId, editData?.id]
  );
  const {
    currentData: defaultImpact,
    isFetching: isLoadingImpact,
    isError: impactError,
  } = useGetPaymentTermDefaultImpactQuery(impactParams, {
    skip: !formik.values.isDefaultTerm || !impactParams.academicYearId || !impactParams.boardId,
  });
  const { currentData: termUsage } = useGetPaymentTermUsageQuery(
    { paymentTermId: editData?.id ?? '' },
    { skip: !editData?.id }
  );

  useEffect(() => {
    if (!editData?.id) return undefined;
    let active = true;
    getPaymentTermDetail(editData.id)
      .unwrap()
      .then((detail) => {
        if (active) formik.resetForm({ values: mapDetailToForm(detail) });
      })
      .catch(() => {
        shikshaMitraToast.error({ message: 'Unable to load the payment term details.' });
      });
    return () => {
      active = false;
    };
    // Run only when the selected record changes; Formik is intentionally excluded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData?.id, getPaymentTermDetail]);

  // ── Auto-generate code from name ──────────────────────────────────────────
  useEffect(() => {
    if (!editData?.id && formik.values.paymentTermName) {
      const slug = formik.values.paymentTermName
        .trim()
        .toUpperCase()
        .replace(/\s+/g, '-')
        .replace(/[^A-Z0-9-]/g, '')
        .slice(0, 16);
      formik.setFieldValue('paymentTermCode', `PT-${slug}`);
    }
    // formik.setFieldValue is stable; no suppression needed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData?.id, formik.values.paymentTermName]);

  // ── Build API payload ─────────────────────────────────────────────────────
  const buildDraftBody = useCallback(
    (values: IPaymentTerm): UpdatePaymentTermDraftRequest => ({
      name: values.paymentTermName.trim(),
      code: values.paymentTermCode,
      description: values.description || undefined,
      isDefault: values.status === 'Active' && values.isDefaultTerm,
      status: values.status === 'Active' ? 'Active' : 'Draft',
      holidayShiftingMethod: values.holidayShiftingMethod,
      demandGenerationRule: values.demandGenerationRule,
      demandOffsetDays: values.demandOffsetDays,
      installments: values.installments.map((item, index) =>
        mapUiInstallmentToApi(
          item,
          index,
          values.demandGenerationRule,
          values.invoiceCreationEnabled
        )
      ),
    }),
    []
  );

  // ── Submit to API ─────────────────────────────────────────────────────────
  const submitToAPI = useCallback(async () => {
    const { values } = formik;
    const academicYearId = currentYear?.id ?? values.academicYearId;

    if (editData?.id) {
      const needsRevision =
        editData.canDirectEdit === false || editData.isUsedInDownstream === true;

      if (needsRevision) {
        await createRevision({
          paymentTermId: editData.id,
          body: { changeReason: 'Updated via Payment Term editor' },
        }).unwrap();
      }

      await updateDraft({
        paymentTermId: editData.id,
        body: buildDraftBody(values),
      }).unwrap();

      shikshaMitraToast.success({
        message: needsRevision
          ? values.status === 'Active'
            ? `"${values.paymentTermName}" published as a new revision.`
            : `"${values.paymentTermName}" saved as a new draft revision.`
          : `"${values.paymentTermName}" updated successfully.`,
      });
    } else {
      await createTerm({
        academicYearId,
        boardId: values.boardId,
        name: values.paymentTermName.trim(),
        code: values.paymentTermCode,
        description: values.description || undefined,
        isDefault: values.status === 'Active' && values.isDefaultTerm,
        status: values.status === 'Active' ? 'Active' : 'Draft',
        holidayShiftingMethod: values.holidayShiftingMethod,
        demandGenerationRule: values.demandGenerationRule,
        demandOffsetDays: values.demandOffsetDays,
        installments: values.installments.map((item, index) =>
          mapUiInstallmentToApi(
            item,
            index,
            values.demandGenerationRule,
            values.invoiceCreationEnabled
          )
        ),
      }).unwrap();
      shikshaMitraToast.success({
        message: `"${values.paymentTermName}" created successfully.`,
      });
    }
    onClose(null, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    buildDraftBody,
    createRevision,
    createTerm,
    currentYear?.id,
    editData,
    formik.values,
    onClose,
    updateDraft,
  ]);

  // ── Submit ────────────────────────────────────────────────────────────────
  /**
   * Memoization Justification:
   * handleSubmit is passed as a prop to the FormFooter component.
   * Stable reference prevents FormFooter re-renders during fast form typing.
   */
  const handleSubmit = useCallback(
    async (confirmed = false) => {
      if (isSubmitting || isLoadingDetail || calendarMissing) return;
      if (
        formik.status?.nameConflict &&
        normalizePaymentTermName(formik.status.nameConflict.name) ===
          normalizePaymentTermName(formik.values.paymentTermName)
      )
        return;
      const errors = await formik.validateForm({
        ...formik.values,
        paymentTermName: formik.values.paymentTermName.trim(),
      });
      const hasErrors = Object.keys(errors).length > 0;
      if (hasErrors) {
        const instTouched = formik.values.installments.map(() => ({
          installmentName: true,
          dueDate: true,
          startDate: true,
          endDate: true,
          demandDate: true,
          allocationPercentage: true,
        }));
        formik.setTouched({
          boardId: true,
          paymentTermName: true,
          status: true,
          demandGenerationRule: true,
          demandOffsetDays: true,
          installments: instTouched,
        } as FormikTouched<IPaymentTerm>);
        shikshaMitraToast.error({ message: 'Fix all errors before submitting.' });
        return;
      }
      setIsSubmitting(true);
      try {
        if (formik.values.isDefaultTerm && formik.values.status === 'Active') {
          // Fetch immediately before saving so confirmation reflects the latest default.
          const impact = await getDefaultImpact(impactParams, false).unwrap();
          if (
            impact.replacesExistingDefault &&
            (!confirmed ||
              impact.currentDefaultId !== confirmationImpact?.currentDefaultId ||
              impact.currentDefaultVersionNumber !==
                confirmationImpact?.currentDefaultVersionNumber)
          ) {
            setConfirmationImpact(impact);
            return;
          }
        }
        setConfirmationImpact(null);
        await submitToAPI();
      } catch (error) {
        const problem = parseApiProblemDetail(error);
        if (
          problem.errorCode === 'Finance:PaymentTerm:000023' ||
          problem.errorCode === 'Finance:PaymentTerm:000042'
        ) {
          formik.setStatus({
            nameConflict: {
              name: formik.values.paymentTermName,
              message:
                problem.errorCode === 'Finance:PaymentTerm:000042'
                  ? `A payment term named “${formik.values.paymentTermName.trim()}” already exists in this academic year. Use a different name.`
                  : `A payment term already uses the code generated from “${formik.values.paymentTermName.trim()}” in this academic year. Use a different name.`,
            },
          });
          formik.setFieldTouched('paymentTermName', true, false);
        } else {
          shikshaMitraToast.error({
            message: problem.detail || 'Unable to save the payment term. Please try again.',
          });
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      formik,
      submitToAPI,
      isSubmitting,
      isLoadingDetail,
      getDefaultImpact,
      impactParams,
      confirmationImpact,
      calendarMissing,
    ]
  );

  // ── Installment CRUD ──────────────────────────────────────────────────────
  /**
   * Memoization Justification:
   * addInstallment is passed as a prop to InstallmentSection (which wraps the
   * empty-state button and the "Add Another" button). Without useCallback, the
   * prop changes reference every render, preventing effective React.memo bailout
   * on InstallmentSection during typing in unrelated fields.
   */
  const addInstallment = useCallback(() => {
    const seq = formik.values.installments.length + 1;
    const newInst: IInstallment = {
      installmentName: `Installment ${seq}`,
      sequence: seq,
      startDate: null,
      endDate: null,
      demandDate: null,
      dueDate: null,
      description: '',
      allocationPercentage: 0,
      reminderDate: null,
      gracePeriod: null,
      allowPartialOverride: null,
      demandEnabled: formik.values.invoiceCreationEnabled,
      reminderEnabled: false,
    };
    const next = [...formik.values.installments, newInst];
    // Convenience: evenly redistribute percentages across installments.
    const base = Math.floor(10000 / next.length) / 100;
    let remainder = Math.round((100 - base * next.length) * 100) / 100;
    next.forEach((inst, idx) => {
      const extra = remainder > 0 ? 0.01 : 0;
      remainder = Math.round((remainder - extra) * 100) / 100;
      next[idx] = { ...inst, allocationPercentage: Math.round((base + extra) * 100) / 100 };
    });
    formik.setFieldValue('installments', next);
  }, [formik]);

  /**
   * Memoization Justification:
   * removeInstallment is passed as a prop to each InstallmentCard within the
   * list. A stable reference avoids re-rendering all cards when one field
   * changes in the parent form.
   */
  const removeInstallment = useCallback(
    (index: number) => {
      const updated = formik.values.installments
        .filter((_, i) => i !== index)
        .map((inst, i) => ({ ...inst, sequence: i + 1 }));
      formik.setFieldValue('installments', updated);
    },
    [formik]
  );

  // ── Live validation checks (used by sidebar & footer) ────────────────────
  /**
   * Memoization Justification:
   * checks iterates the entire installments array on every keystroke (O(n)
   * per render). It also produces an object — a new reference every time —
   * which would cascade re-renders to both SummaryPanel and FormFooter.
   * useMemo gates re-computation to changes in formik.values only, preventing
   * redundant work during unrelated state updates (e.g. isSavingDraft flip).
   */
  const checks = useMemo<IPaymentTermChecks>(() => {
    const v = formik.values;
    const boardValid = Boolean(v.boardId);
    const nameConflict = formik.status?.nameConflict;
    const hasNameConflict =
      Boolean(nameConflict) &&
      normalizePaymentTermName(nameConflict.name) === normalizePaymentTermName(v.paymentTermName);
    const nameValid =
      v.paymentTermName.trim().length >= 3 &&
      financeNameSchema('Payment term name').isValidSync(v.paymentTermName) &&
      !hasNameConflict;
    const codeValid = /^[A-Z0-9-]{3,24}$/.test(v.paymentTermCode.trim());
    const hasInstallments = v.installments.length >= 1;
    const allDueDates =
      hasInstallments &&
      v.installments.every((i) => Boolean(i.startDate && i.endDate && i.dueDate));
    const allNames = v.installments.every((i) => i.installmentName.trim().length > 0);
    const nameSet = new Set(v.installments.map((i) => i.installmentName.toLowerCase().trim()));
    const uniqueNames = v.installments.length === nameSet.size;
    const allocationValid =
      v.installments.every((item) => Number(item.allocationPercentage) > 0) &&
      getAllocationSummary(v.installments).valid;
    const periodsValid =
      hasInstallments &&
      v.installments.every((item) => {
        if (!item.startDate || !item.endDate || !item.dueDate) return false;
        const start = dayjs(item.startDate as string);
        const end = dayjs(item.endDate as string);
        const due = dayjs(item.dueDate as string);
        return !end.isBefore(start, 'day') && !due.isBefore(start, 'day');
      });
    const installmentsBySequence = [...v.installments].sort(
      (a, b) => (a.sequence || 0) - (b.sequence || 0)
    );
    const periodsNonOverlapping = installmentsBySequence.every((item, index) => {
      if (index === 0) return true;
      const previousEnd = installmentsBySequence[index - 1].endDate;
      return Boolean(
        previousEnd &&
        item.startDate &&
        dayjs(item.startDate as string).isAfter(dayjs(previousEnd as string), 'day')
      );
    });
    const selectedBoard = boards.find((board) => board.id === v.boardId);
    const periodsWithinBoard = v.installments.every((item) => {
      if (
        !selectedBoard?.startDate ||
        !selectedBoard?.endDate ||
        !item.startDate ||
        !item.endDate
      ) {
        return true;
      }
      return (
        !dayjs(item.startDate as string).isBefore(dayjs(selectedBoard.startDate), 'day') &&
        !dayjs(item.endDate as string).isAfter(dayjs(selectedBoard.endDate), 'day')
      );
    });

    let datesSequential = true;
    if (v.installments.length > 1) {
      const sorted = [...v.installments].sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
      // eslint-disable-next-line no-plusplus
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i - 1].dueDate && sorted[i].dueDate) {
          if (!dayjs(sorted[i].dueDate as string).isAfter(dayjs(sorted[i - 1].dueDate as string))) {
            datesSequential = false;
            break;
          }
        }
      }
    }

    const demandSet = Boolean(v.demandGenerationRule);
    const offsetLimit = getInvoiceOffsetLimit(v, selectedBoard?.startDate);
    const demandOffsetValid =
      v.demandGenerationRule !== 'XDaysBeforeDue' ||
      (v.demandOffsetDays !== null &&
        Number.isInteger(Number(v.demandOffsetDays)) &&
        v.demandOffsetDays >= 1 &&
        v.demandOffsetDays <= 365 &&
        (!offsetLimit || v.demandOffsetDays <= offsetLimit.days));
    const specificDatesValid = v.installments.every(
      (item) => !getInvoiceDateError(v, item, selectedBoard?.startDate)
    );
    let validationMessage = '';
    try {
      validationSchema.validateSync(v, { abortEarly: true });
    } catch (error) {
      validationMessage =
        error instanceof Error ? error.message : 'Fix all validation errors before submitting.';
    }
    if (hasNameConflict) validationMessage = nameConflict.message;
    const isReadyToPublish =
      boardValid &&
      nameValid &&
      codeValid &&
      hasInstallments &&
      allDueDates &&
      allNames &&
      uniqueNames &&
      allocationValid &&
      periodsValid &&
      periodsNonOverlapping &&
      periodsWithinBoard &&
      datesSequential &&
      demandSet &&
      demandOffsetValid;

    return {
      boardValid,
      nameValid,
      codeValid,
      hasInstallments,
      allDueDates,
      allNames,
      uniqueNames,
      allocationValid,
      periodsValid,
      periodsNonOverlapping,
      periodsWithinBoard,
      datesSequential,
      demandSet,
      demandOffsetValid,
      specificDatesValid,
      isReadyToPublish: isReadyToPublish && specificDatesValid && !validationMessage,
      validationMessage,
    };
  }, [boards, formik.values, formik.status, validationSchema]);

  // ── Demand label for the summary sidebar ──────────────────────────────────
  /**
   * Memoization Justification:
   * demandLabel is a derived string consumed by SummaryPanel. Without memoization,
   * the string is reconstructed on every render of the parent; the useMemo narrows
   * recomputation to changes in the three relevant form values only, preventing
   * SummaryPanel from re-rendering when unrelated fields (e.g. description) change.
   */
  const demandLabel = useMemo<string>(() => {
    const r = formik.values.demandGenerationRule;
    if (!r) return '—';
    if (r === 'XDaysBeforeDue') {
      return `${formik.values.demandOffsetDays ?? '?'} days before due`;
    }
    const map: Record<string, string> = {
      OnInstallmentStartDate: 'On installment start date',
      OnDueDate: 'On due date',
      SpecificDate: 'On each specified date',
    };
    return map[r] ?? r;
  }, [formik.values.demandGenerationRule, formik.values.demandOffsetDays]);

  return {
    defaultImpact,
    termUsage,
    confirmationImpact,
    cancelDefaultConfirmation: () => setConfirmationImpact(null),
    isLoadingImpact,
    impactError,
    formik,
    boards,
    checks,
    calendarMissing,
    refreshPrerequisites,
    demandLabel,
    isSubmitting,
    isLoadingDetail,
    isLoadingOptions: boardQuery.isLoading || (boardQuery.isFetching && !boardQuery.currentData),
    handleSubmit,
    addInstallment,
    removeInstallment,
  };
}
