'use client';

import type { RootState } from 'src/redux/store';
import type {
  ChargeDetail,
  FeeLedgerLine,
  FeeLedgerMonth,
  CollectFeeInput,
  CollectFeeOutput,
} from 'src/redux/feeCollection/feeCollection';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { arrayMove } from '@dnd-kit/sortable';
import { Iconify } from 'src/components/iconify';
import { fDateTime } from 'src/utils/format-time';
import { Scrollbar } from 'src/components/scrollbar';
import { alpha, useTheme } from '@mui/material/styles';
import CustomDialog from 'src/components/customDialog';
import { formatNumber } from 'src/utils/formate_number';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { useRef, useMemo, useState, useEffect } from 'react';
import { LoadingButton } from 'src/components/loading-button';
import { financePermissions } from 'src/constants/finance-menu';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { FormSectionCard } from 'src/components/form-section-card';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { PaymentMethodLabels } from 'src/enums/finance-payment-method';
import { FormPrerequisiteState } from 'src/components/form-prerequisites';
import { FeeMonth, FeeCollectionStatusType } from 'src/enums/fee-collection-type';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { DetailGrid, DetailField, DetailSection } from 'src/components/detail-view';
import { useGetAcademicYearMonthsQuery } from 'src/redux/finance/financeFeeStructure';
import { useGetFinanceRoutingOptionsQuery } from 'src/redux/finance/financeRoutingApi';
import {
  useCollectFeeMutation,
  useGetCollectFormQuery,
  useDownloadReceiptPdfMutation,
} from 'src/redux/feeCollection/feeCollection';
import {
  Box,
  Paper,
  Stack,
  Alert,
  Avatar,
  Button,
  Divider,
  MenuItem,
  TextField,
  Typography,
  DialogActions,
  CircularProgress,
} from '@mui/material';

import { toPeriod } from './FeeLedgerShared';
import { normalizeLedgerStatus } from './feeLedgerStatus';
import UnifiedReceiptDisplay from './UnifiedReceiptDisplay';
import CollectionLedgerTable from './CollectionLedgerTable';
import SelectedCollectionItems from './SelectedCollectionItems';
import FeeCollectionFormSkeleton from './FeeCollectionFormSkeleton';
import FeeCollectionOutcomePanel from './FeeCollectionOutcomePanel';
import { resolveCollectionItems } from './collectionAllocationOrder';
import { collectionPaymentDetails } from './collectionPaymentDetails';
import { useFinancePermissions } from '../../hooks/useFinancePermissions';
import { paymentMethodsConfig } from '../Components/paymentConfigMethods';
import FinalPaymentReviewDialog from './preview/FinalPaymentReviewDialog';
import FeeCollectionPreviewDialog from './preview/FeeCollectionPreviewDialog';
import FinancePrerequisiteState from '../../components/FinancePrerequisiteState';
import CollectionPaymentDateField from '../Components/CollectionPaymentDateField';
import { getCollectionPaymentDateError } from '../Components/collectionPaymentDate';
import { isFinancePrerequisiteMissing } from '../../components/financePrerequisites';
import FeeLedgerFilterBar, { FEE_LEDGER_INITIAL_FILTERS } from './FeeLedgerFilterBar';
import { useRefreshFinancePrerequisites } from '../../hooks/useRefreshFinancePrerequisites';
import {
  collectionDisplayStudent,
  FeeCollectionWaiverContext,
  isCollectionOutcomeUncertain,
} from './feeCollectionContext';
import {
  roundUpToRupee,
  allocatePayment,
  selectedChargesInOrder,
  safeRoundingDifference,
} from './preview/paymentAllocationUtils';
import {
  selectionItemKey,
  applySelectionFilter,
  selectionFilterState,
  recordManualSelection,
  isLedgerItemCollectible,
  createSelectionOwnership,
  reconcileLedgerSelection,
  academicYearMonthsFromDates,
} from './feeLedgerSelection';

import type { FeeLedgerFilters } from './FeeLedgerFilterBar';
import type { LedgerSelection, SelectionFilterKey } from './feeLedgerSelection';
import type { AllocatedFeeRow, AllocatedChargeRow } from './preview/paymentAllocationUtils';
import type { FeeCollectionAdapter, FeeCollectionAcademicYear } from './feeCollectionContext';
import type {
  IFeeCharge,
  IStudentFee,
  SelectedItem,
  FeeLedgerData,
  IPaymentFieldConfig,
  FeeCollectionPayment,
  FeeCollectionFormValues,
} from '../Components/type';

// Methods a cashier keys in on behalf of the parent, gated by the resolved Collection
// Policy's allowOnlineCollection flag (Phase 3) — physical instruments (Cash/Cheque/DD)
// are never gated, matching collection-policy-flow.md §7.9's intent.
const ONLINE_PAYMENT_METHOD_KEYS = new Set([
  'UPI',
  'Credit Card',
  'Debit Card',
  'Bank Transfer (NEFT/RTGS/IMPS)',
]);

type GeneratedReceipt = {
  id: string;
  receiptNumber?: string;
  pdfFileName?: string;
};

type ReceiptPreviewState = {
  feeReceipt: GeneratedReceipt | null;
  chargeReceipt: GeneratedReceipt | null;
};

const RECEIPT_PDF_ERROR =
  'Payment was collected, but the receipt could not be generated. Please retry or contact support.';

const toPaise = (amount: number): number => Math.round((amount + Number.EPSILON) * 100);

const buildDetailsForMethod = (method: string): Record<string, any> => {
  const config = paymentMethodsConfig[method as keyof typeof paymentMethodsConfig] ?? [];
  const details: Record<string, any> = {};
  config.forEach((field) => {
    if (field.name !== 'amount') {
      if (field.type === 'date') {
        // Set default to today if isDefaultToday is true, otherwise null
        details[field.name] = (field as any).isDefaultToday ? dayjs() : null;
      } else {
        details[field.name] = '';
      }
    }
  });
  return details;
};

const normalizeDetailValue = (value: unknown): string => {
  if (value == null) return '';
  if (typeof value === 'string') return value.trim();
  return String(value).trim();
};

// ─── Validation ────────────────────────────────────────────────────────────────

const validationSchema = Yup.object({
  selectedItems: Yup.array(),
  charges: Yup.array(),
  payment: Yup.object({
    paymentMethod: Yup.string().required('Payment method is required'),
    amount: Yup.number()
      .typeError('Amount must be a number')
      .required('Amount is required')
      .positive('Amount must be positive')
      .test(
        'is-valid-amount',
        'Enter a valid amount. Example: 1000',
        (value) => value == null || /^[0-9]+(\.[0-9]{1,2})?$/.test(String(value))
      )
      .min(0.01, 'Amount must be at least 0.01'),
  }),
});

// ─── Initial Values ────────────────────────────────────────────────────────────

const buildInitialValues = (student: IStudentFee | null): FeeCollectionFormValues => ({
  studentId: String(student?.id ?? ''),
  studentName: student?.name ?? '',
  selectedItems: [],
  charges: [],
  subtotal: 0,
  finalAmount: 0,
  payment: { paymentMethod: 'Cash', amount: '', details: {} },
  remarks: '',
});

// ─── Sub-components ────────────────────────────────────────────────────────────

// Normalize month from API (may be string name like "June" or number like 5)
const normalizeMonth = (month: string | number): FeeMonth =>
  typeof month === 'number'
    ? month
    : ((FeeMonth[month as keyof typeof FeeMonth] as unknown as FeeMonth) ?? 0);

const isChargeSelectable = (charge: IFeeCharge): boolean =>
  isLedgerItemCollectible({ due: charge.amount, status: charge.status });

// ─── Main Component ────────────────────────────────────────────────────────────

export type { FeeCollectionAdapter, FeeCollectionAcademicYear } from './feeCollectionContext';

const FeeCollectComponentForm = ({
  student: studentRecord = null,
  onCancel,
  academicYear,
  collectionAdapter,
  onBusyChange,
  onDirtyChange,
}: {
  student?: IStudentFee | null;
  onCancel?: (e: any, isSubmit: boolean) => void;
  academicYear?: FeeCollectionAcademicYear;
  collectionAdapter?: FeeCollectionAdapter;
  onBusyChange?: (busy: boolean) => void;
  onDirtyChange?: (dirty: boolean) => void;
}) => {
  const theme = useTheme();
  const { currentYear: selectedAcademicYear } = useSelector(
    (state: RootState) => state.globalState
  );
  const currentYear = academicYear ?? selectedAcademicYear;
  const isAdaptedContext = Boolean(collectionAdapter);
  const financeAccess = useFinancePermissions(financePermissions.fees.collections);
  // Admission collection adapters enforce their owning workflow's action permission.
  const canCollect = isAdaptedContext || financeAccess.canAdd;
  const [filters, setFilters] = useState<FeeLedgerFilters>(FEE_LEDGER_INITIAL_FILTERS);
  const selectionOwnership = useRef(createSelectionOwnership());
  const [previewOpen, setPreviewOpen] = useState(false);
  const [finalReviewOpen, setFinalReviewOpen] = useState(false);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [receiptPreviewState, setReceiptPreviewState] = useState<ReceiptPreviewState>({
    feeReceipt: null,
    chargeReceipt: null,
  });
  const [feeReceiptBlobUrl, setFeeReceiptBlobUrl] = useState<string | null>(null);
  const [chargeReceiptBlobUrl, setChargeReceiptBlobUrl] = useState<string | null>(null);
  const [receiptPdfStatus, setReceiptPdfStatus] = useState<
    Record<'fee' | 'charge', 'idle' | 'loading' | 'ready' | 'error'>
  >({ fee: 'idle', charge: 'idle' });
  const receiptPreviewRequest = useRef(0);
  const [lastCollectResponse, setLastCollectResponse] = useState<CollectFeeOutput | null>(null);
  const [outcomeDialogOpen, setOutcomeDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [collectionError, setCollectionError] = useState<string | null>(null);
  const [collectionOutcomeUncertain, setCollectionOutcomeUncertain] = useState(false);
  const [collectionRefreshFailed, setCollectionRefreshFailed] = useState(false);
  const [collectionRefreshing, setCollectionRefreshing] = useState(false);
  const collectionRefreshRequest = useRef(0);
  const lifecycleCallbacks = useRef({ onBusyChange, onDirtyChange });
  lifecycleCallbacks.current = { onBusyChange, onDirtyChange };

  // ── Fetch collect form data from V2 API ────────────────────────────────────
  const {
    data: studentCollectFormData,
    isLoading: studentCollectFormLoading,
    isFetching: studentCollectFormFetching,
    error: studentCollectFormError,
    refetch: refetchStudentCollectForm,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetCollectFormQuery,
    popupConfig: { error: false },
    params: {
      studentId: String(studentRecord?.id ?? ''),
      academicYearId: currentYear?.id ?? '',
    },
    options: {
      skip:
        Boolean(collectionAdapter) ||
        !studentRecord?.id ||
        !currentYear?.id ||
        !financeAccess.canView,
    },
  });

  const formData = collectionAdapter ? collectionAdapter.data : studentCollectFormData;
  const allocationBasis = formData?.allocationBasis ?? 'Legacy';
  const usesAutomaticAllocation =
    allocationBasis === 'FeeHead' || allocationBasis === 'Installment';
  const collectFormLoading = collectionAdapter
    ? collectionAdapter.isLoading
    : studentCollectFormLoading;
  const collectFormFetching = collectionAdapter
    ? collectionAdapter.isFetching
    : studentCollectFormFetching;
  const collectFormError = collectionAdapter ? collectionAdapter.error : studentCollectFormError;
  const refetchCollectForm = collectionAdapter?.refetch ?? refetchStudentCollectForm;
  const student = useMemo(
    () => (isAdaptedContext ? collectionDisplayStudent(formData) : studentRecord),
    [isAdaptedContext, formData, studentRecord]
  );
  const resolvedStudentName: string =
    lastCollectResponse?.studentName?.trim() ||
    formData?.student?.studentName?.trim() ||
    student?.name?.trim() ||
    '';
  const contextKey = `${collectionAdapter?.contextKey ?? studentRecord?.id ?? ''}:${currentYear?.id ?? ''}`;

  const {
    data: bankAccountsData,
    isLoading: bankAccountsLoading,
    isFetching: bankAccountsFetching,
    isError: bankAccountsError,
    refetch: refetchBankAccounts,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFinanceRoutingOptionsQuery,
    params: { academicYearId: currentYear?.id ?? '', operation: 'collection' },
    options: { skip: !currentYear?.id },
  });

  const [collectFee, { isLoading: studentCollectLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCollectFeeMutation,
    popupConfig: { error: false },
  });
  const collectLoading =
    submitting || (collectionAdapter ? collectionAdapter.isCollecting : studentCollectLoading);
  const adaptedOutcomeUnresolved = Boolean(collectionAdapter && collectionOutcomeUncertain);
  const collectionReadBlocked = Boolean(
    !canCollect ||
    collectFormError ||
    collectFormFetching ||
    collectionRefreshFailed ||
    collectionRefreshing ||
    (usesAutomaticAllocation && (!formData?.allocationRevision || !formData?.allocationDueFeeOrder))
  );

  const submissionRef = useRef<{
    contextKey: string;
    command: Omit<CollectFeeInput, 'studentId'>;
  } | null>(null);
  const submissionInFlight = useRef(false);
  const withIdempotencyKey = (
    payload: Omit<CollectFeeInput, 'idempotencyKey' | 'studentId'>
  ): Omit<CollectFeeInput, 'studentId'> => {
    // Freeze the wire command. A response may be lost after Finance commits,
    // so refreshed balances must never recalculate the same payment on retry.
    const command = JSON.parse(
      JSON.stringify({ ...payload, idempotencyKey: crypto.randomUUID() })
    ) as Omit<CollectFeeInput, 'studentId'>;
    submissionRef.current = { contextKey, command };
    return command;
  };
  const submitCollection = (
    input: Omit<CollectFeeInput, 'studentId'>
  ): Promise<CollectFeeOutput> => {
    if (!canCollect)
      return Promise.reject(new Error('You do not have permission to collect fees.'));
    return collectionAdapter
      ? collectionAdapter.collect(input)
      : collectFee({ ...input, studentId: String(studentRecord?.id ?? '') }).unwrap();
  };

  const [downloadReceiptPdf] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDownloadReceiptPdfMutation,
    popupConfig: {
      error: false,
      success: false,
    },
  });

  // Build receipt data from CollectFeeOutput response
  const feeReceiptData =
    lastCollectResponse && receiptPreviewState.feeReceipt
      ? {
          id: lastCollectResponse.feeReceiptId ?? receiptPreviewState.feeReceipt.id,
          receiptNumber: lastCollectResponse.feeReceiptNumber ?? '',
          studentId: lastCollectResponse.studentId ?? '',
          studentName: resolvedStudentName,
          academicYearId: lastCollectResponse.academicYearId,
          totalAmount:
            lastCollectResponse.receiptGrouping === 'Combined' &&
            !!lastCollectResponse.paidCharges?.length
              ? lastCollectResponse.receivedAmount
              : lastCollectResponse.paidFeeHeads.reduce((sum, h) => sum + h.amountPaid, 0) +
                (lastCollectResponse.paidLateFees ?? []).reduce(
                  (sum, line) => sum + line.amountPaid,
                  0
                ),
          lateFeeAmount: (lastCollectResponse.paidLateFees ?? []).reduce(
            (sum, line) => sum + line.amountPaid,
            0
          ),
          combined:
            lastCollectResponse.receiptGrouping === 'Combined' &&
            !!lastCollectResponse.paidCharges?.length,
          paidCharges:
            lastCollectResponse.receiptGrouping === 'Combined'
              ? lastCollectResponse.paidCharges
              : [],
          collectedAt: lastCollectResponse.collectedAt,
          collectedBy: lastCollectResponse.collectedBy,
          paidFeeHeads: lastCollectResponse.paidFeeHeads,
          auditSummary: lastCollectResponse.auditSummary,
        }
      : undefined;

  const chargeReceiptData =
    lastCollectResponse && receiptPreviewState.chargeReceipt
      ? {
          id: lastCollectResponse.chargeReceiptId ?? receiptPreviewState.chargeReceipt.id,
          receiptNumber: lastCollectResponse.chargeReceiptNumber ?? '',
          studentId: lastCollectResponse.studentId ?? '',
          studentName: resolvedStudentName,
          academicYearId: lastCollectResponse.academicYearId,
          totalAmount: (lastCollectResponse.paidCharges ?? []).reduce(
            (sum, c) => sum + c.amountPaid,
            0
          ),
          collectedAt: lastCollectResponse.collectedAt,
          collectedBy: lastCollectResponse.collectedBy,
          paidCharges: lastCollectResponse.paidCharges ?? [],
          auditSummary: lastCollectResponse.auditSummary,
        }
      : undefined;

  const academicMonthsFromContext = useMemo(
    () =>
      academicYearMonthsFromDates({
        startDate: currentYear?.startDate,
        endDate: currentYear?.endDate,
      }),
    [currentYear?.startDate, currentYear?.endDate]
  );

  const {
    data: academicMonthsFromQuery,
    isLoading: academicMonthsLoading,
    isFetching: academicMonthsFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetAcademicYearMonthsQuery,
    params: { academicYearId: currentYear?.id },
    options: { skip: !currentYear?.id || Boolean(academicMonthsFromContext) },
  });
  const academicYearMonths = academicMonthsFromContext ?? academicMonthsFromQuery;
  const isAcademicCalendarLoading =
    !academicMonthsFromContext && (academicMonthsLoading || academicMonthsFetching);

  // Map V2 API ledger → FeeLedgerData shape used by existing UI components
  const ledgerData = useMemo((): FeeLedgerData => {
    const months: FeeLedgerMonth[] = formData?.ledger ?? [];
    return {
      monthWise: months.map((m: FeeLedgerMonth) => ({
        month: normalizeMonth(m.month as unknown as string | number),
        year: m.year,
        totalDue: m.totalDue,
        items: m.items.map((item: FeeLedgerLine) => ({
          dueFeeId: item.dueFeeId,
          feeHeadId: item.feeHeadId,
          feeHeadName: item.feeHeadName,
          installmentLabel: item.installmentLabel,
          installmentId: item.installmentId,
          dueDate: item.dueDate,
          total: item.total,
          scheduledTotal: item.scheduledTotal,
          prorationPolicyVersionId: item.prorationPolicyVersionId,
          prorationPolicyName: item.prorationPolicyName,
          prorationPolicyVersionNumber: item.prorationPolicyVersionNumber,
          prorationExplanation: item.prorationExplanation,
          withdrawalProrationCredit: item.withdrawalProrationCredit,
          withdrawalProrationExplanation: item.withdrawalProrationExplanation,
          paid: item.paid,
          due: item.due,
          reconciliationAmount: item.reconciliationAmount,
          concessionAmount: item.concessionAmount,
          refundAmount: item.refundAmount,
          refundDescription: item.refundDescription,
          lateFeeAmount: item.lateFeeAmount,
          lateFeeExplanation: item.lateFeeExplanation,
          lateFeeWaivedAmount: item.lateFeeWaivedAmount,
          canWaive: item.canWaive,
          status: normalizeLedgerStatus(item.status, item.paid, item.due),
        })),
      })) as FeeLedgerData['monthWise'],
      feeHeadWise: Object.values(
        months
          .flatMap((m: FeeLedgerMonth) =>
            m.items.map((item: FeeLedgerLine) => ({
              dueFeeId: item.dueFeeId,
              feeHeadId: item.feeHeadId,
              feeHeadName: item.feeHeadName,
              installmentLabel: item.installmentLabel,
              dueDate: item.dueDate,
              month: normalizeMonth(m.month as unknown as string | number),
              year: m.year,
              total: item.total,
              scheduledTotal: item.scheduledTotal,
              prorationPolicyVersionId: item.prorationPolicyVersionId,
              prorationPolicyName: item.prorationPolicyName,
              prorationPolicyVersionNumber: item.prorationPolicyVersionNumber,
              prorationExplanation: item.prorationExplanation,
              withdrawalProrationCredit: item.withdrawalProrationCredit,
              withdrawalProrationExplanation: item.withdrawalProrationExplanation,
              paid: item.paid,
              due: item.due,
              reconciliationAmount: item.reconciliationAmount,
              concessionAmount: item.concessionAmount,
              refundAmount: item.refundAmount,
              refundDescription: item.refundDescription,
              lateFeeAmount: item.lateFeeAmount,
              lateFeeExplanation: item.lateFeeExplanation,
              lateFeeWaivedAmount: item.lateFeeWaivedAmount,
              canWaive: item.canWaive,
              status: normalizeLedgerStatus(item.status, item.paid, item.due),
            }))
          )
          .reduce((acc: Record<string, any>, line) => {
            if (!acc[line.feeHeadId]) {
              acc[line.feeHeadId] = {
                feeHeadId: line.feeHeadId,
                feeHeadName: line.feeHeadName,
                months: 0,
                totalDue: 0,
                items: [],
              };
            }
            acc[line.feeHeadId].months += 1;
            acc[line.feeHeadId].totalDue += line.due;
            acc[line.feeHeadId].items.push({
              dueFeeId: line.dueFeeId,
              month: line.month,
              year: line.year,
              installmentLabel: line.installmentLabel,
              dueDate: line.dueDate,
              total: line.total,
              paid: line.paid,
              due: line.due,
              reconciliationAmount: line.reconciliationAmount,
              concessionAmount: line.concessionAmount,
              refundAmount: line.refundAmount,
              refundDescription: line.refundDescription,
              lateFeeAmount: line.lateFeeAmount,
              lateFeeExplanation: line.lateFeeExplanation,
              lateFeeWaivedAmount: line.lateFeeWaivedAmount,
              canWaive: line.canWaive,
              status: line.status,
            });
            return acc;
          }, {})
      ),
    };
  }, [formData]);

  // ── Payment methods available for this student, gated by allowOnlineCollection ──
  const availablePaymentMethods = useMemo(() => {
    const allowOnline = formData?.allowOnlineCollection ?? true;
    const allKeys = Object.keys(paymentMethodsConfig);
    return allowOnline ? allKeys : allKeys.filter((key) => !ONLINE_PAYMENT_METHOD_KEYS.has(key));
  }, [formData?.allowOnlineCollection]);

  // ── Apply frontend filters to ledger data ──────────────────────────────────
  const filteredLedgerData: FeeLedgerData = useMemo(() => {
    if (filters.month === 'All' && filters.feeHead === 'All' && filters.status === 'All') {
      return ledgerData;
    }
    let { monthWise, feeHeadWise } = ledgerData;

    if (filters.month && filters.month !== 'All') {
      const [filterMonth, filterYear] = filters.month.split('-');

      monthWise = monthWise.filter(
        (group) =>
          String(group.month) === filterMonth && (!filterYear || String(group.year) === filterYear)
      );

      feeHeadWise = feeHeadWise
        .map((fh: any) => ({
          ...fh,
          items: fh.items.filter(
            (item: any) =>
              String(item.month) === filterMonth &&
              (!filterYear || String(item.year) === filterYear)
          ),
        }))
        .filter((fh: any) => fh.items.length > 0);
    }

    if (filters.feeHead && filters.feeHead !== 'All') {
      monthWise = monthWise
        .map((group) => ({
          ...group,
          items: group.items.filter((item) => item.feeHeadId === filters.feeHead),
        }))
        .filter((group) => group.items.length > 0);
      feeHeadWise = feeHeadWise.filter((fh: any) => fh.feeHeadId === filters.feeHead);
    }

    if (filters.status && filters.status !== 'All') {
      const statusNum = Number(filters.status);
      monthWise = monthWise
        .map((group) => ({
          ...group,
          items: group.items.filter((item) => item.status === statusNum),
        }))
        .filter((group) => group.items.length > 0);

      feeHeadWise = feeHeadWise
        .map((fh: any) => ({
          ...fh,
          items: fh.items.filter((item: any) => item.status === statusNum),
        }))
        .filter((fh: any) => fh.items.length > 0);
    }

    return {
      monthWise: monthWise.map((group) => ({
        ...group,
        totalDue: group.items.reduce((sum, item) => sum + item.due, 0),
      })),
      feeHeadWise: feeHeadWise.map((group) => ({
        ...group,
        months: group.items.length,
        totalDue: group.items.reduce((sum, item) => sum + item.due, 0),
      })),
    };
  }, [ledgerData, filters]);

  const chargesData: IFeeCharge[] = useMemo(
    () =>
      (formData?.charges ?? []).map((c: ChargeDetail) => ({
        chargeId: c.chargeId,
        sourceType: c.sourceType ?? 'Charge',
        sourceId: c.sourceId ?? c.chargeId,
        isSystemGenerated: c.isSystemGenerated,
        chargeName: c.name,
        amount: c.pendingAmount,
        total: c.amount,
        paid: c.paidAmount,
        waivedAmount: c.waivedAmount,
        canWaive: c.canWaive,
        explanation: c.explanation,
        reconciliationAmount: c.reconciliationAmount,
        status: normalizeLedgerStatus(c.status, c.paidAmount, c.pendingAmount),
      })),
    [formData]
  );

  // Filtering changes the visible ledger, while payment totals retain selected hidden items.
  const filteredChargesData = useMemo(() => {
    const sourcePeriods = new Map(
      ledgerData.monthWise.flatMap((group) =>
        group.items.map(
          (item) =>
            [
              item.dueFeeId,
              {
                month: group.month,
                year: group.year,
                feeHeadId: item.feeHeadId,
              },
            ] as const
        )
      )
    );
    return chargesData.filter((charge) => {
      if (filters.status !== 'All' && charge.status !== Number(filters.status)) return false;
      if (filters.month === 'All' && filters.feeHead === 'All') return true;
      const source =
        charge.sourceType === 'LateFee' ? sourcePeriods.get(charge.sourceId) : undefined;
      if (!source) return false;
      if (filters.feeHead !== 'All' && source.feeHeadId !== filters.feeHead) return false;
      if (filters.month !== 'All') {
        const [month, year] = filters.month.split('-');
        if (String(source.month) !== month || (year && String(source.year) !== year)) return false;
      }
      return true;
    });
  }, [chargesData, ledgerData, filters.status, filters.month, filters.feeHead]);

  const bankAccountOptions = useMemo(
    () =>
      bankAccountsData?.bankAccounts.map((account: { label: string; id: string }) => ({
        name: account.label,
        id: account.id,
      })) ?? [],
    [bankAccountsData]
  );

  const isBankAccountsBusy = bankAccountsLoading || bankAccountsFetching;

  const dueFeeIdMap = useMemo(() => {
    const map: Record<string, string> = {};
    (formData?.ledger ?? []).forEach((m: FeeLedgerMonth) => {
      const monthNum = normalizeMonth(m.month as unknown as string | number);
      m.items.forEach((item: FeeLedgerLine) => {
        map[`${item.feeHeadId}|${monthNum}|${m.year}`] = item.dueFeeId;
      });
    });
    return map;
  }, [formData]);

  const collectibleLedgerItems = useMemo(
    () =>
      ledgerData.monthWise.flatMap((group) => {
        const period = toPeriod(
          FeeMonth[group.month] as string,
          group.year ?? currentYear?.year ?? new Date().getFullYear()
        );
        return group.items
          .filter((item) => isLedgerItemCollectible(item))
          .map((item) => {
            const roundedDue = roundUpToRupee(item.due);
            return {
              status: item.status,
              reconciliationAmount: item.reconciliationAmount ?? 0,
              selection: {
                dueFeeId: item.dueFeeId,
                feeHeadId: item.feeHeadId,
                period,
                dueAmount: roundedDue,
                originalDueAmount: item.due,
                roundingAdjustment: safeRoundingDifference(item.due, roundedDue),
                lateFeeAmount: item.lateFeeAmount,
                installmentLabel: item.installmentLabel,
              },
            };
          });
      }),
    [ledgerData, currentYear?.year]
  );
  // Amount-only entry uses eligible fees from the complete, unfiltered ledger.
  const automaticFeeItems = collectibleLedgerItems
    .filter(
      ({ status, selection, reconciliationAmount }) =>
        [
          FeeCollectionStatusType.Pending,
          FeeCollectionStatusType.Overdue,
          FeeCollectionStatusType.Partial,
        ].includes(status) &&
        reconciliationAmount <= 0 &&
        (formData?.allocationDueFeeOrder ?? []).includes(selection.dueFeeId ?? '')
    )
    .map(({ selection }) => selection);
  const resolveItems = (items: SelectedItem[], charges: string[]) =>
    resolveCollectionItems(
      items,
      charges,
      automaticFeeItems,
      usesAutomaticAllocation,
      formData?.allocationDueFeeOrder ?? []
    );
  const hasInstallments = ledgerData.monthWise.some((group) =>
    group.items.some((item) => Boolean(item.installmentId || item.installmentLabel))
  );
  const hasCollectibleItems =
    collectibleLedgerItems.length > 0 || chargesData.some(isChargeSelectable);

  // ── Formik ─────────────────────────────────────────────────────────────────
  const formik = useFormik<FeeCollectionFormValues>({
    initialValues: buildInitialValues(student),
    validationSchema,
    enableReinitialize: true,
    validateOnChange: true,
    validate: (values) => {
      const errors: any = {};
      const resolvedItems = resolveItems(values.selectedItems, values.charges);
      if (hasCollectibleItems && !resolvedItems.length && !values.charges.length)
        errors.charges = 'Select at least one fee item or charge to collect';
      const itemsTotal = resolvedItems.reduce(
        (s, i) => s + roundUpToRupee(i.dueAmount) + (i.lateFeeAmount ?? 0),
        0
      );
      const chargesTotal = (chargesData ?? [])
        .filter((c) => values.charges.includes(c.chargeId))
        .reduce((s, c) => s + c.amount, 0);
      const total = itemsTotal + chargesTotal;
      const paid = Number(String(values.payment.amount).replace(/[₹,\s]/g, ''));
      const totalPaise = toPaise(total);
      const paidPaise = toPaise(Number.isNaN(paid) ? 0 : paid);
      if (totalPaise > 0 && paidPaise > totalPaise) {
        errors.payment = { amount: `Amount cannot exceed ₹${formatNumber(totalPaise / 100)}` };
      }

      const activeMethodFields =
        paymentMethodsConfig[
          values.payment.paymentMethod as keyof typeof paymentMethodsConfig
        ]?.filter((field: IPaymentFieldConfig) => field.name !== 'amount') ?? [];

      const detailErrors: Record<string, string> = {};
      if (values.payment.paymentMethod !== 'Cash' && !values.payment.details?.bankAccount)
        detailErrors.bankAccount = 'Select the receiving school bank account';

      activeMethodFields.forEach((field: IPaymentFieldConfig) => {
        const rawValue = values.payment.details?.[field.name];

        if (field.type === 'date') {
          const message = getCollectionPaymentDateError(rawValue, field.label, true);
          if (message) detailErrors[field.name] = message;
          return;
        }

        const stringValue = normalizeDetailValue(rawValue);
        if (!stringValue) {
          detailErrors[field.name] = `${field.label} is required`;
          return;
        }

        if (field.pattern) {
          const regex = new RegExp(field.pattern);
          if (!regex.test(stringValue)) {
            detailErrors[field.name] = field.patternMessage || `Invalid ${field.label}`;
          }
        }
      });

      if (Object.keys(detailErrors).length > 0) {
        errors.payment = {
          ...(errors.payment ?? {}),
          details: detailErrors,
        };
      }

      return errors;
    },
    onReset: () => {
      selectionOwnership.current = createSelectionOwnership();
      setFilters((previous) => ({
        ...previous,
        selectionFilters: FEE_LEDGER_INITIAL_FILTERS.selectionFilters,
      }));
    },
    onSubmit: () => {
      if (
        adaptedOutcomeUnresolved ||
        collectLoading ||
        collectionReadBlocked ||
        missingCollectionBank
      )
        return;
      setPreviewOpen(true);
    },
  });

  const missingCollectionBank = isFinancePrerequisiteMissing({
    options: bankAccountsData?.bankAccounts,
    required: formik.values.payment.paymentMethod !== 'Cash' && !collectionOutcomeUncertain,
    isLoading: bankAccountsLoading,
    isFetching: bankAccountsFetching,
    isError: bankAccountsError,
  });
  const refreshPrerequisites = () => {
    refetchCollectForm?.();
    refetchBankAccounts?.();
  };
  useRefreshFinancePrerequisites(
    refreshPrerequisites,
    canCollect && !collectLoading && !collectionOutcomeUncertain
  );

  const previousContextKey = useRef(contextKey);
  const { resetForm: resetCollectionForm } = formik;
  useEffect(() => {
    if (previousContextKey.current !== contextKey) {
      previousContextKey.current = contextKey;
      selectionOwnership.current = createSelectionOwnership();
      submissionRef.current = null;
      setFilters(FEE_LEDGER_INITIAL_FILTERS);
      setCollectionError(null);
      setCollectionOutcomeUncertain(false);
      collectionRefreshRequest.current += 1;
      setCollectionRefreshFailed(false);
      setCollectionRefreshing(false);
      resetCollectionForm({ values: buildInitialValues(student) });
    }
  }, [contextKey, resetCollectionForm, student]);
  useEffect(() => {
    onBusyChange?.(Boolean(collectLoading || adaptedOutcomeUnresolved));
  }, [collectLoading, adaptedOutcomeUnresolved, onBusyChange]);
  useEffect(() => {
    onDirtyChange?.(formik.dirty && !lastCollectResponse);
  }, [formik.dirty, lastCollectResponse, onDirtyChange]);
  useEffect(
    () => () => {
      receiptPreviewRequest.current += 1;
      collectionRefreshRequest.current += 1;
      lifecycleCallbacks.current.onBusyChange?.(false);
      lifecycleCallbacks.current.onDirtyChange?.(false);
    },
    []
  );
  // ── Derived amounts ────────────────────────────────────────────────────────
  const subtotal = useMemo(() => {
    const itemsTotal = formik.values.selectedItems.reduce(
      (s, i) => s + roundUpToRupee(i.dueAmount) + (i.lateFeeAmount ?? 0),
      0
    );
    const chargesTotal = (chargesData ?? [])
      .filter((c) => formik.values.charges.includes(c.chargeId))
      .reduce((s, c) => s + c.amount, 0);
    return itemsTotal + chargesTotal;
  }, [formik.values.selectedItems, formik.values.charges, chargesData]);

  const orderedSelectedItems = resolveItems(formik.values.selectedItems, formik.values.charges);
  const isAmountOnly =
    usesAutomaticAllocation && !formik.values.selectedItems.length && !formik.values.charges.length;
  const finalAmount =
    orderedSelectedItems.reduce(
      (sum, item) => sum + roundUpToRupee(item.dueAmount) + (item.lateFeeAmount ?? 0),
      0
    ) +
    selectedChargesInOrder(chargesData, formik.values.charges).reduce(
      (sum, charge) => sum + charge.amount,
      0
    );
  const allocationFormValues = { ...formik.values, selectedItems: orderedSelectedItems };
  const showLiveAllocation =
    usesAutomaticAllocation &&
    Number(formik.values.payment.amount) > 0 &&
    Number(formik.values.payment.amount) <= finalAmount;
  const previousAllocationRevision = useRef<string | null | undefined>(
    formData?.allocationRevision
  );
  useEffect(() => {
    const previous = previousAllocationRevision.current;
    previousAllocationRevision.current = formData?.allocationRevision;
    if (
      previous &&
      previous !== formData?.allocationRevision &&
      !submissionInFlight.current &&
      !collectionOutcomeUncertain
    ) {
      submissionRef.current = null;
      setPreviewOpen(false);
      setFinalReviewOpen(false);
    }
  }, [formData?.allocationRevision, collectionOutcomeUncertain]);
  const overallOutstanding =
    (formData?.summary?.pendingFee ?? 0) +
    (formData?.charges ?? []).reduce(
      (sum: number, charge: ChargeDetail) => sum + charge.pendingAmount,
      0
    );

  const resolveAllocatedDueFeeId = (row: AllocatedFeeRow): string => {
    if (row.dueFeeId) return row.dueFeeId;
    const matchingItem = orderedSelectedItems.find(
      (item) => `${item.feeHeadId}-${item.period}` === row.key
    );
    if (!matchingItem) throw new Error(`Matching item not found for key ${row.key}`);
    const [yearStr, monthStr] = matchingItem.period.split('-');
    const dueFeeId = dueFeeIdMap[`${matchingItem.feeHeadId}|${Number(monthStr) - 1}|${yearStr}`];
    if (!dueFeeId) throw new Error(`Due fee id not found for key ${row.key}`);
    return dueFeeId;
  };

  const totalAllocated = useMemo(() => {
    const n = Number(String(formik.values.payment.amount || 0).replace(/[₹,\s]/g, ''));
    return Number.isNaN(n) ? 0 : n;
  }, [formik.values.payment.amount]);

  const balancePaise = toPaise(finalAmount) - toPaise(totalAllocated);

  useEffect(() => {
    if (submissionRef.current) return;
    formik.setFieldValue('payment.amount', subtotal > 0 ? String(subtotal) : '', false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal]);

  const showOverAllocationWarning =
    balancePaise < 0 && (Boolean(formik.touched.payment?.amount) || formik.submitCount > 0);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSelectionChange = (items: SelectedItem[]) => {
    if (adaptedOutcomeUnresolved) return;
    submissionRef.current = null;
    recordManualSelection(
      selectionOwnership.current,
      { items: formik.values.selectedItems, charges: formik.values.charges },
      { items, charges: formik.values.charges }
    );
    formik.setFieldValue('selectedItems', items, false);
  };

  const handleChargesChange = (chargeIds: string[]) => {
    if (adaptedOutcomeUnresolved) return;
    submissionRef.current = null;
    recordManualSelection(
      selectionOwnership.current,
      { items: formik.values.selectedItems, charges: formik.values.charges },
      { items: formik.values.selectedItems, charges: chargeIds }
    );
    formik.setFieldValue('charges', chargeIds, false);
  };

  const handlePaymentMethodChange = (method: string) => {
    if (adaptedOutcomeUnresolved) return;
    submissionRef.current = null;
    formik.setFieldValue('payment', {
      paymentMethod: method,
      amount: formik.values.payment.amount,
      details: collectionPaymentDetails(method, {
        ...buildDetailsForMethod(method),
        bankAccount: formik.values.payment.details.bankAccount || '',
      }),
    });
  };

  const updatePayment = (field: keyof FeeCollectionPayment, value: any) => {
    if (adaptedOutcomeUnresolved) return;
    submissionRef.current = null;
    formik.setFieldValue('payment', { ...formik.values.payment, [field]: value });
  };

  const buildPaymentPayload = (paymentMethodNum: number, receivedAmount: number) => [
    {
      paymentMethod: paymentMethodNum,
      bankAccountId:
        formik.values.payment.paymentMethod === 'Cash'
          ? undefined
          : String(formik.values.payment.details.bankAccount || '') || undefined,
      amount: receivedAmount,
      details: Object.fromEntries(
        Object.entries(
          collectionPaymentDetails(
            formik.values.payment.paymentMethod,
            formik.values.payment.details
          )
        )
          .filter(([, v]) => v != null && v !== '')
          .map(([k, v]) => [
            k,
            dayjs.isDayjs(v) ? dateConvertor(v.format(dateFormat) || '') || '' : String(v),
          ])
      ),
    },
  ];

  const loadReceiptPdf = async (receiptId: string, scope: 'fee' | 'charge') => {
    const request = receiptPreviewRequest.current;
    const setBlobUrl = scope === 'fee' ? setFeeReceiptBlobUrl : setChargeReceiptBlobUrl;
    setReceiptPdfStatus((previous) => ({ ...previous, [scope]: 'loading' }));
    try {
      const blob = collectionAdapter
        ? await collectionAdapter.downloadReceiptPdf(receiptId, scope)
        : await downloadReceiptPdf({
            receiptId,
            ...(scope === 'charge' ? { receiptType: scope } : {}),
          }).unwrap();
      if (request !== receiptPreviewRequest.current) return;
      setBlobUrl(URL.createObjectURL(blob));
      setReceiptPdfStatus((previous) => ({ ...previous, [scope]: 'ready' }));
    } catch {
      if (request !== receiptPreviewRequest.current) return;
      setBlobUrl(null);
      setReceiptPdfStatus((previous) => ({ ...previous, [scope]: 'error' }));
    }
  };

  // Refresh failures do not change the outcome of an already accepted payment.
  const refreshCollectionSummary = async () => {
    collectionRefreshRequest.current += 1;
    const request = collectionRefreshRequest.current;
    setCollectionRefreshing(true);
    setCollectionRefreshFailed(false);
    try {
      const result = await refetchCollectForm?.();
      if (request !== collectionRefreshRequest.current) return;
      if (result && typeof result === 'object' && 'error' in result && result.error)
        setCollectionRefreshFailed(true);
    } catch {
      if (request === collectionRefreshRequest.current) setCollectionRefreshFailed(true);
    } finally {
      if (request === collectionRefreshRequest.current) setCollectionRefreshing(false);
    }
  };

  const resetCollectedDraft = () => {
    formik.resetForm();
    refreshCollectionSummary();
  };

  // Opens the FinalPaymentReviewDialog from the preview dialog
  const handlePreviewConfirm = () => {
    setPreviewOpen(false);
    setFinalReviewOpen(true);
  };

  // Cash settles immediately; every non-cash collection awaits finance verification.
  const prepareCollectionCommand = (
    confirmNonCash: boolean
  ): Omit<CollectFeeInput, 'studentId'> => {
    if (submissionRef.current?.contextKey === contextKey) return submissionRef.current.command;
    const receivedAmount = Number(String(formik.values.payment.amount || 0).replace(/[₹,\s]/g, ''));

    const paymentMethodNum = Number(
      Object.entries(PaymentMethodLabels).find(
        ([, label]) => label === formik.values.payment.paymentMethod
      )?.[0] ?? 0
    );

    const isCashierDecided =
      paymentMethodNum !== 0 && paymentMethodNum !== 1 && paymentMethodNum !== 2;

    const allocation = allocatePayment(
      orderedSelectedItems,
      selectedChargesInOrder(chargesData, formik.values.charges),
      feeHeadMap,
      receivedAmount
    );

    const dueFeePayments = allocation.allocatedRows
      .filter((r): r is AllocatedFeeRow => r.type === 'fee' && r.principalPaidAmount > 0)
      .map((r) => {
        const matchingItem = orderedSelectedItems.find(
          (item) =>
            (r.dueFeeId && item.dueFeeId === r.dueFeeId) ||
            (!r.dueFeeId && `${item.feeHeadId}-${item.period}` === r.key)
        );
        if (!matchingItem) {
          throw new Error(`Matching item not found for key ${r.key}`);
        }
        const [yearStr, monthStr] = matchingItem.period.split('-');
        const feeMonthIdx = Number(monthStr) - 1;
        const dueFeeId =
          r.dueFeeId ??
          matchingItem.dueFeeId ??
          dueFeeIdMap[`${matchingItem.feeHeadId}|${feeMonthIdx}|${yearStr}`];

        return {
          dueFeeId,
          feeHeadId: matchingItem.feeHeadId,
          amount: r.principalPaidAmount,
        };
      });

    const lateFeePayments = allocation.allocatedRows
      .filter(
        (r): r is AllocatedFeeRow | AllocatedChargeRow =>
          (r.type === 'fee' && r.lateFeePaidAmount > 0) ||
          (r.type === 'charge' && r.sourceType === 'LateFee' && r.paidAmount > 0)
      )
      .map((r) => ({
        dueFeeId: r.type === 'fee' ? resolveAllocatedDueFeeId(r) : r.sourceId,
        amount: r.type === 'fee' ? r.lateFeePaidAmount : r.paidAmount,
      }));

    const chargePayments = allocation.allocatedRows
      .filter(
        (r): r is AllocatedChargeRow =>
          r.type === 'charge' && r.sourceType === 'Charge' && r.paidAmount > 0
      )
      .map((r) => ({
        chargeId: r.key,
        amount: r.paidAmount,
      }));

    return withIdempotencyKey({
      academicYearId: currentYear?.id ?? '',
      notes: formik.values.remarks ?? undefined,
      paymentConfirmed: isCashierDecided ? confirmNonCash : undefined,
      ...(usesAutomaticAllocation
        ? {
            automaticAllocation: {
              revision: formData?.allocationRevision ?? '',
              dueFeeIds: orderedSelectedItems.map((item) => item.dueFeeId ?? ''),
              chargeIds: formik.values.charges,
            },
          }
        : {}),
      dueFeePayments,
      lateFeePayments,
      chargePayments,
      payments: buildPaymentPayload(paymentMethodNum, receivedAmount),
    });
  };

  const handleFinalCollect = async () => {
    if (!canCollect || submissionInFlight.current || collectLoading) return;
    submissionInFlight.current = true;
    setSubmitting(true);
    setCollectionError(null);
    try {
      const collectResponse = await submitCollection(prepareCollectionCommand(true));

      shikshaMitraToast.success({
        message:
          formik.values.payment.paymentMethod === 'Cash'
            ? 'Payment collected and fees settled. Cash Income awaits independent Cash Management approval.'
            : collectResponse.auditSummary?.headline || 'Fee collected successfully',
      });
      setFinalReviewOpen(false);
      submissionRef.current = null;
      setLastCollectResponse(collectResponse);
      setCollectionOutcomeUncertain(false);
      resetCollectedDraft();
      if (!(await showGeneratedReceiptDialog(collectResponse))) {
        if (collectResponse.auditSummary || collectionAdapter) {
          setOutcomeDialogOpen(true);
        } else {
          onCancel?.(null, true);
        }
      }
    } catch (err) {
      if (parseApiProblemDetail(err).errorCode === 'ShikshaMitra:FeeCollection:AllocationChanged') {
        submissionRef.current = null;
        await refetchCollectForm?.();
      }
      const message =
        parseApiProblemDetail(err).detail || 'Failed to collect fee. Please try again.';
      setCollectionError(message);
      setCollectionOutcomeUncertain(
        Boolean(submissionRef.current) && isCollectionOutcomeUncertain(err)
      );
      shikshaMitraToast.error({ message });
      setFinalReviewOpen(false);
    } finally {
      submissionInFlight.current = false;
      setSubmitting(false);
    }
  };

  // Save as pending verification (non-cash): calls API with pending status
  const handleSavePending = async () => {
    if (!canCollect || submissionInFlight.current || collectLoading) return;
    submissionInFlight.current = true;
    setSubmitting(true);
    setCollectionError(null);
    try {
      const collectResponse = await submitCollection(prepareCollectionCommand(false));

      shikshaMitraToast.success({
        message: collectResponse.auditSummary?.headline || 'Payment saved as pending verification',
      });
      setFinalReviewOpen(false);
      submissionRef.current = null;
      setLastCollectResponse(collectResponse);
      setCollectionOutcomeUncertain(false);
      resetCollectedDraft();
      if (!(await showGeneratedReceiptDialog(collectResponse))) {
        if (collectResponse.auditSummary || collectionAdapter) {
          setOutcomeDialogOpen(true);
        } else {
          onCancel?.(null, true);
        }
      }
    } catch (err) {
      if (parseApiProblemDetail(err).errorCode === 'ShikshaMitra:FeeCollection:AllocationChanged') {
        submissionRef.current = null;
        await refetchCollectForm?.();
      }
      const message =
        parseApiProblemDetail(err).detail || 'Failed to save payment. Please try again.';
      setCollectionError(message);
      setCollectionOutcomeUncertain(
        Boolean(submissionRef.current) && isCollectionOutcomeUncertain(err)
      );
      shikshaMitraToast.error({ message });
      setFinalReviewOpen(false);
    } finally {
      submissionInFlight.current = false;
      setSubmitting(false);
    }
  };

  const handleRemoveAll = () => {
    if (adaptedOutcomeUnresolved) return;
    submissionRef.current = null;
    selectionOwnership.current = createSelectionOwnership();
    setFilters((previous) => ({
      ...previous,
      selectionFilters: FEE_LEDGER_INITIAL_FILTERS.selectionFilters,
    }));
    formik.setValues(
      (values) => ({
        ...values,
        selectedItems: [],
        charges: [],
        payment: { ...values.payment, amount: '' },
      }),
      false
    );
  };

  const entryCount = useMemo(
    () =>
      (filteredLedgerData.monthWise ?? []).reduce((s, g) => s + g.items.length, 0) +
      filteredChargesData.length,
    [filteredLedgerData, filteredChargesData]
  );

  // Academic halves include paid and absent ledger months. Display filters
  // never redefine which half a month belongs to.
  const orderedAcademicPeriods = useMemo(
    () =>
      [...(academicYearMonths ?? [])]
        .sort((a, b) => a.year * 12 + a.month - (b.year * 12 + b.month))
        .map((month) => toPeriod(FeeMonth[month.month] as string, month.year)),
    [academicYearMonths]
  );
  const firstSixPeriodSet = new Set(orderedAcademicPeriods.slice(0, 6));
  const lastSixPeriodSet = new Set(orderedAcademicPeriods.slice(-6));

  const pendingItems = collectibleLedgerItems
    .filter(({ status }) =>
      [
        FeeCollectionStatusType.Pending,
        FeeCollectionStatusType.Overdue,
        FeeCollectionStatusType.Partial,
      ].includes(status)
    )
    .map(({ selection }) => selection);
  const selectableChargeIds = useMemo(
    () => chargesData.filter(isChargeSelectable).map((charge) => charge.chargeId),
    [chargesData]
  );
  const collectibleSelection = useMemo(
    () => ({
      items: collectibleLedgerItems.map(({ selection }) => selection),
      charges: selectableChargeIds,
    }),
    [collectibleLedgerItems, selectableChargeIds]
  );
  const selectedFeeItems = formik.values.selectedItems;
  const selectedChargeIds = formik.values.charges;
  const setCollectionValues = formik.setValues;

  useEffect(() => {
    if (!formData || collectFormLoading || collectFormFetching || submissionRef.current) return;
    const next = reconcileLedgerSelection(
      selectionOwnership.current,
      { items: selectedFeeItems, charges: selectedChargeIds },
      collectibleSelection
    );
    if (
      next.items.length !== selectedFeeItems.length ||
      next.items.some((item, index) => item !== selectedFeeItems[index]) ||
      next.charges.length !== selectedChargeIds.length
    ) {
      setCollectionValues(
        (values) => ({ ...values, selectedItems: next.items, charges: next.charges }),
        false
      );
    }
  }, [
    formData,
    collectFormLoading,
    collectFormFetching,
    collectibleSelection,
    selectedFeeItems,
    selectedChargeIds,
    setCollectionValues,
  ]);
  const filterMatches: Record<SelectionFilterKey, LedgerSelection> = {
    allPending: { items: pendingItems, charges: [] },
    allCharges: { items: [], charges: selectableChargeIds },
    firstSixMonths: {
      items: pendingItems.filter((item) => firstSixPeriodSet.has(item.period)),
      charges: [],
    },
    lastSixMonths: {
      items: pendingItems.filter((item) => lastSixPeriodSet.has(item.period)),
      charges: [],
    },
  };
  const currentSelection = { items: formik.values.selectedItems, charges: formik.values.charges };
  const selectionStates = Object.fromEntries(
    Object.entries(filterMatches).map(([key, matches]) => [
      key,
      filters.selectionFilters[key as SelectionFilterKey]
        ? selectionFilterState(matches, currentSelection)
        : { checked: false, indeterminate: false },
    ])
  );

  const handleSelectionFilterChange = (key: SelectionFilterKey, checked: boolean) => {
    if (adaptedOutcomeUnresolved) return;
    submissionRef.current = null;
    const next = applySelectionFilter(
      selectionOwnership.current,
      currentSelection,
      key,
      checked,
      filterMatches[key]
    );
    setFilters((previous) => ({
      ...previous,
      selectionFilters: { ...previous.selectionFilters, [key]: checked },
    }));
    // One Formik update keeps fee and charge selections consistent with totals.
    formik.setValues(
      (values) => ({ ...values, selectedItems: next.items, charges: next.charges }),
      false
    );
  };
  const handleFilterChange = (nextFilters: FeeLedgerFilters) => {
    if (adaptedOutcomeUnresolved) return;
    const changedKey = (Object.keys(nextFilters.selectionFilters) as SelectionFilterKey[]).find(
      (key) => nextFilters.selectionFilters[key] !== filters.selectionFilters[key]
    );
    if (changedKey) {
      handleSelectionFilterChange(changedKey, nextFilters.selectionFilters[changedKey]);
    } else {
      setFilters(nextFilters);
    }
  };

  const feeHeadMap = useMemo(() => {
    const map: Record<string, string> = {};
    (ledgerData.feeHeadWise ?? []).forEach((fh) => {
      map[fh.feeHeadId] = fh.feeHeadName;
    });
    (ledgerData.monthWise ?? []).forEach((m) =>
      m.items.forEach((item) => {
        map[item.feeHeadId] = item.feeHeadName;
      })
    );
    return map;
  }, [ledgerData]);

  const adapterFeeHeads = useMemo(
    () =>
      Object.entries(feeHeadMap).map(([feeHeadId, feeHeadName]) => ({ feeHeadId, feeHeadName })),
    [feeHeadMap]
  );

  const liveAllocation = useMemo(
    () =>
      allocatePayment(
        orderedSelectedItems,
        selectedChargesInOrder(chargesData, formik.values.charges),
        feeHeadMap,
        Number(formik.values.payment.amount) || 0
      ),
    [
      orderedSelectedItems,
      chargesData,
      formik.values.charges,
      feeHeadMap,
      formik.values.payment.amount,
    ]
  );
  const feeAllocationById = new Map(
    liveAllocation.allocatedRows
      .filter((row): row is AllocatedFeeRow => row.type === 'fee')
      .map((row) => [row.dueFeeId, row])
  );

  // Highlight the funded rows without narrowing the automatic allocation candidate set.
  const ledgerSelectedItems = isAmountOnly
    ? orderedSelectedItems.filter(
        (item) => (feeAllocationById.get(item.dueFeeId)?.paidAmount ?? 0) > 0
      )
    : formik.values.selectedItems;
  const handleLedgerSelectionChange = (items: SelectedItem[]) => {
    handleSelectionChange(items);
    // Removing the last automatic highlight must not immediately allocate it again.
    if (isAmountOnly && !items.length) updatePayment('amount', '');
  };

  useEffect(
    () => () => {
      if (feeReceiptBlobUrl) URL.revokeObjectURL(feeReceiptBlobUrl);
    },
    [feeReceiptBlobUrl]
  );
  useEffect(
    () => () => {
      if (chargeReceiptBlobUrl) URL.revokeObjectURL(chargeReceiptBlobUrl);
    },
    [chargeReceiptBlobUrl]
  );

  // ── Show skeleton while loading ─────────────────────────────────────────────
  if (collectFormLoading || (!formData && collectFormFetching)) {
    return <FeeCollectionFormSkeleton />;
  }
  const collectFormAccessDenied =
    typeof collectFormError === 'object' &&
    collectFormError !== null &&
    'status' in collectFormError &&
    (collectFormError.status === 401 || collectFormError.status === 403);
  if (collectFormAccessDenied || !currentYear?.id || !formData) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert
          severity="error"
          action={
            currentYear?.id && (
              <Button size="small" onClick={() => refetchCollectForm?.()}>
                Retry
              </Button>
            )
          }
        >
          {collectFormError
            ? parseApiProblemDetail(collectFormError).detail ||
              'Unable to load fees. Please try again.'
            : !currentYear?.id
              ? 'Academic year is required to collect fees.'
              : 'Fee collection details are unavailable. Please try again.'}
        </Alert>
      </Box>
    );
  }

  // ── Fee Structure Not Assigned: show empty state ───────────────────────────
  const isFeeStructureAssigned = formData?.student?.isFeeStructureAssigned;

  const showGeneratedReceiptDialog = async (collectResponse: CollectFeeOutput) => {
    setLastCollectResponse(collectResponse);
    if (collectionAdapter && !collectionAdapter.canViewReceipts) return false;
    const hasFeeReceipt = collectResponse.feeReceiptId;
    const hasChargeReceipt = collectResponse.chargeReceiptId;

    if (!hasFeeReceipt && !hasChargeReceipt) return false;

    // Set receipt preview state with fee and/or charge receipts
    setReceiptPreviewState({
      feeReceipt: hasFeeReceipt
        ? {
            id: collectResponse.feeReceiptId!,
            receiptNumber: collectResponse.feeReceiptNumber,
            pdfFileName: collectResponse.feeReceiptPdfFileName,
          }
        : null,
      chargeReceipt: hasChargeReceipt
        ? {
            id: collectResponse.chargeReceiptId!,
            receiptNumber: collectResponse.chargeReceiptNumber,
            pdfFileName: collectResponse.chargeReceiptPdfFileName,
          }
        : null,
    });

    setFeeReceiptBlobUrl(null);
    setChargeReceiptBlobUrl(null);
    receiptPreviewRequest.current += 1;
    setReceiptPdfStatus({
      fee: hasFeeReceipt ? 'loading' : 'idle',
      charge: hasChargeReceipt ? 'loading' : 'idle',
    });
    setReceiptDialogOpen(true);

    // Each receipt owns its progress and failure; one unavailable PDF does not hide the other.
    await Promise.all([
      hasFeeReceipt && loadReceiptPdf(collectResponse.feeReceiptId!, 'fee'),
      hasChargeReceipt && loadReceiptPdf(collectResponse.chargeReceiptId!, 'charge'),
    ]);

    return true;
  };

  const handleOpenReceiptInNewTab = (blobUrl: string | null) => {
    if (!blobUrl) return;
    window.open(blobUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDownloadReceipt = (receipt: GeneratedReceipt | null, blobUrl: string | null) => {
    if (!receipt || !blobUrl) return;
    const anchor = document.createElement('a');
    anchor.href = blobUrl;
    anchor.download = receipt.pdfFileName || `Receipt-${receipt.receiptNumber ?? receipt.id}.pdf`;
    anchor.target = '_blank';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const handleReceiptDialogClose = () => {
    receiptPreviewRequest.current += 1;
    setReceiptDialogOpen(false);
    setReceiptPreviewState({ feeReceipt: null, chargeReceipt: null });
    setLastCollectResponse(null);
    setFeeReceiptBlobUrl(null);
    setChargeReceiptBlobUrl(null);
    // Return to parent table/list view after receipt flow is completed.
    onCancel?.(null, true);
  };

  const noAssignedObligations =
    isFeeStructureAssigned === false &&
    !collectFormFetching &&
    !collectFormError &&
    !formData?.ledger?.length &&
    !(formData?.charges ?? []).some((charge: ChargeDetail) => Number(charge.pendingAmount) > 0);
  if (noAssignedObligations) {
    return (
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          width: 1,
          overflow: 'auto',
        }}
      >
        {collectionAdapter ? (
          <FormPrerequisiteState
            title="No Fee Structure Assigned"
            description="Confirm the applicable fee structure in the admission journey before collecting fees."
            actions={[]}
            onRefresh={refreshPrerequisites}
          />
        ) : (
          <FinancePrerequisiteState
            requirements={[{ key: 'fee-assignment', title: 'No Fee Structure Assigned' }]}
            onRefresh={refreshPrerequisites}
          />
        )}
        {onCancel && (
          <DialogActions>
            <Button
              type="button"
              color="inherit"
              size="small"
              variant="outlined"
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              onClick={() => onCancel(null, false)}
            >
              Cancel
            </Button>
          </DialogActions>
        )}
      </Box>
    );
  }

  return (
    <Box
      component={motion.div}
      onChangeCapture={(event) => {
        if (adaptedOutcomeUnresolved) {
          event.stopPropagation();
          return;
        }
        const { name } = event.target as HTMLInputElement;
        if (name === 'remarks' || name?.startsWith('payment.')) submissionRef.current = null;
      }}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
        bgcolor: 'background.default',
        position: 'relative',
      }}
    >
      {formData && (collectFormError || collectionRefreshFailed) && (
        <Alert
          severity="error"
          sx={{ mx: 1.5, mt: 1 }}
          action={
            <Button
              size="small"
              disabled={collectLoading || collectionRefreshing}
              onClick={() => {
                refreshCollectionSummary();
              }}
            >
              Refresh fees
            </Button>
          }
        >
          Fee details could not be refreshed. Retry before recording a new payment. Any previous
          payment can be retried safely using the same request.
        </Alert>
      )}
      {collectionError && (
        <Alert
          severity="error"
          sx={{ mx: 1.5, mt: 1 }}
          action={
            submissionRef.current ? (
              <Button
                type="button"
                size="small"
                disabled={collectLoading}
                onClick={async () => {
                  if (submissionRef.current?.command.paymentConfirmed === false)
                    await handleSavePending();
                  else await handleFinalCollect();
                }}
              >
                Retry payment
              </Button>
            ) : undefined
          }
        >
          {collectionError}
          {collectionOutcomeUncertain ? (
            <Typography variant="caption" display="block">
              {submissionRef.current
                ? collectionAdapter
                  ? 'Payment may already have been recorded. Editing and closing are blocked until you retry the previous payment safely using the same request.'
                  : 'Payment outcome is not confirmed; it may already have been recorded. Retry the previous payment or check receipts before collecting again.'
                : 'The previous payment outcome is not confirmed; it may already have been recorded. Payment details have changed. Check receipts before starting another payment.'}
            </Typography>
          ) : (
            submissionRef.current && (
              <Typography variant="caption" display="block">
                Retry checks the previous payment using the same request.
              </Typography>
            )
          )}
        </Alert>
      )}
      <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
        <Stack
          spacing={1}
          sx={{ flex: 1, minHeight: 0, p: 1, overflow: { xs: 'auto', md: 'hidden' } }}
        >
          <Paper variant="outlined" sx={{ px: 1.5, py: 1, borderRadius: 2, flexShrink: 0 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              alignItems={{ sm: 'center' }}
              justifyContent="space-between"
            >
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
                <Avatar
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: (t) => alpha(t.palette.success.main, 0.1),
                    color: 'success.main',
                    fontWeight: 700,
                  }}
                >
                  {(resolvedStudentName || 'Student')
                    .split(/\s+/)
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((part) => part[0])
                    .join('')}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="subtitle1" sx={{ overflowWrap: 'anywhere' }}>
                    {resolvedStudentName}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ overflowWrap: 'anywhere' }}
                  >
                    {[
                      `GR ${formData?.student?.grNo || student?.grNumber || '—'}`,
                      [
                        formData?.student?.standardName || student?.className,
                        formData?.student?.divisionName || student?.division,
                      ]
                        .filter(Boolean)
                        .join(' '),
                      currentYear?.name,
                      formData?.student?.rollNo || student?.rollNumber
                        ? `Roll ${formData?.student?.rollNo || student?.rollNumber}`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </Typography>
                </Box>
              </Stack>
              <Box
                sx={{
                  borderLeft: { sm: 1 },
                  borderColor: { sm: 'divider' },
                  pl: { sm: 2 },
                  flexShrink: 0,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  Total outstanding
                </Typography>
                <Typography variant="h6" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                  {formatNumber(overallOutstanding, 'INR')}
                </Typography>
              </Box>
            </Stack>
          </Paper>
          <Box
            id="collection-layout-panel"
            aria-busy={collectLoading}
            sx={{
              m: 0,
              p: 0,
              border: 0,
              minWidth: 0,
              flex: { xs: 'none', md: 1 },
              minHeight: 0,
              display: 'grid',
              gap: 1.5,
              alignItems: 'stretch',
              gridTemplateColumns: {
                xs: 'minmax(0, 1fr)',
                md: 'minmax(0, 1.8fr) minmax(300px, 1fr)',
              },
            }}
          >
            <Stack
              component="fieldset"
              disabled={collectLoading || adaptedOutcomeUnresolved || collectionReadBlocked}
              inert={
                collectLoading || adaptedOutcomeUnresolved || collectionReadBlocked || undefined
              }
              spacing={1}
              sx={{ minHeight: 0, minWidth: 0, m: 0, p: 0, border: 0 }}
            >
              <FeeLedgerFilterBar
                groupByInstallment={hasInstallments}
                filters={filters}
                onFilterChange={handleFilterChange}
                academicYearMonths={academicYearMonths}
                isMonthsLoading={isAcademicCalendarLoading}
                selectionStates={selectionStates}
                onSelectionFilterChange={handleSelectionFilterChange}
                entryCount={entryCount}
                studentId={collectionAdapter ? undefined : String(student?.id ?? '')}
                academicYearId={currentYear?.id}
                feeHeads={collectionAdapter ? adapterFeeHeads : undefined}
              />
              {formData && !collectionReadBlocked && !hasCollectibleItems && (
                <Alert severity="info" role="status">
                  No outstanding fees or charges to collect. Items with no outstanding balance
                  cannot be selected.
                </Alert>
              )}
              {hasCollectibleItems && formik.submitCount > 0 && finalAmount <= 0 && (
                <Typography variant="caption" color="error">
                  Select at least one fee item or charge to collect
                </Typography>
              )}

              <Box
                sx={{
                  flex: 1,
                  minHeight: { xs: 360, md: 0 },
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <FeeCollectionWaiverContext.Provider value={!collectionAdapter}>
                  <CollectionLedgerTable
                    groupByInstallment={hasInstallments}
                    data={filteredLedgerData}
                    activeTab={filters.activeTab}
                    layout="ledger"
                    onPeriodFocus={(period) => {
                      const [periodYear, periodMonth] = period.split('-');
                      handleFilterChange({
                        ...filters,
                        month: `${Number(periodMonth) - 1}-${periodYear}`,
                      });
                    }}
                    selectedItems={ledgerSelectedItems}
                    charges={formik.values.charges}
                    chargesData={filteredChargesData}
                    hasActiveFilters={
                      filters.status !== 'All' ||
                      filters.month !== 'All' ||
                      filters.feeHead !== 'All'
                    }
                    onSelectionChange={handleLedgerSelectionChange}
                    onChargesChange={handleChargesChange}
                    year={currentYear?.year ?? new Date().getFullYear()}
                  />
                </FeeCollectionWaiverContext.Provider>
              </Box>
            </Stack>
            <Box
              sx={{
                minWidth: 0,
                minHeight: 0,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
              }}
            >
              <FormSectionCard
                descriptionTooltip="Enter an amount to apply automatic payment priority, or select specific fees or charges. Review the allocation before collecting."
                title="Payment summary"
                icon="solar:wallet-money-linear"
                contentSpacing={1}
                contentSx={{ flex: 1, minHeight: 0, '& > :first-of-type': { flexShrink: 0 } }}
                action={
                  <Button
                    type="button"
                    size="small"
                    variant="outlined"
                    color="inherit"
                    startIcon={<Iconify icon={GlobalIcons.cancel} width={18} />}
                    disabled={
                      collectLoading ||
                      adaptedOutcomeUnresolved ||
                      collectionReadBlocked ||
                      (!formik.values.selectedItems.length &&
                        !formik.values.charges.length &&
                        !formik.values.payment.amount)
                    }
                    onClick={handleRemoveAll}
                  >
                    Clear All
                  </Button>
                }

                sx={{
                  p: { xs: 1.5, sm: 2 },
                  flex: 1,
                  minHeight: 0,
                  maxHeight: {
                    xs: 'calc(100dvh - 160px)',
                    sm: 'calc(100dvh - 128px)',
                    md: 'none',
                  },
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  containerType: 'inline-size',
                  containerName: 'payment-summary',
                }}
              >
                <Divider sx={{ flexShrink: 0 }} />
                <Scrollbar
                  role="region"
                  aria-label="Payment details"
                  sx={{ flex: 1, minHeight: 0 }}
                  slotProps={{ contentWrapper: { overscrollBehaviorY: 'contain' } }}
                >
                  <Stack
                    component="fieldset"
                    disabled={collectLoading || adaptedOutcomeUnresolved || collectionReadBlocked}
                    inert={
                      collectLoading ||
                      adaptedOutcomeUnresolved ||
                      collectionReadBlocked ||
                      undefined
                    }
                    spacing={2}
                    sx={{ m: 0, px: 0.5, py: 1, border: 0, minWidth: 0 }}
                  >
                    <SelectedCollectionItems
                      emptyText={
                        !hasCollectibleItems
                          ? 'No payment is needed. There is no outstanding amount to collect.'
                          : usesAutomaticAllocation
                            ? 'Enter an amount to preview automatic fee allocation, or select specific items from the ledger.'
                            : undefined
                      }
                      fixedFeeOrder={usesAutomaticAllocation}
                      showAllocation={showLiveAllocation}
                      disabled={collectLoading || adaptedOutcomeUnresolved || collectionReadBlocked}
                      fees={orderedSelectedItems
                        .filter(
                          (item) =>
                            !isAmountOnly ||
                            (feeAllocationById.get(item.dueFeeId)?.paidAmount ?? 0) > 0
                        )
                        .map((item) => ({
                          id: selectionItemKey(item),
                          label: feeHeadMap[item.feeHeadId] ?? item.feeHeadId,
                          term:
                            (usesAutomaticAllocation && item.installmentLabel) ||
                            dayjs(`${item.period}-01`).format('MMM YYYY'),
                          amount: showLiveAllocation
                            ? (feeAllocationById.get(item.dueFeeId)?.paidAmount ?? 0)
                            : roundUpToRupee(item.dueAmount) + (item.lateFeeAmount ?? 0),
                          remainingAmount: showLiveAllocation
                            ? feeAllocationById.get(item.dueFeeId)?.remainingAmount
                            : undefined,
                          onRemove: isAmountOnly
                            ? undefined
                            : () =>
                                handleSelectionChange(
                                  formik.values.selectedItems.filter(
                                    (selected) =>
                                      selectionItemKey(selected) !== selectionItemKey(item)
                                  )
                                ),
                        }))}
                      charges={selectedChargesInOrder(chargesData ?? [], formik.values.charges).map(
                        (charge) => ({
                          id: charge.chargeId,
                          label: charge.chargeName,
                          term: charge.dueDate ? dayjs(charge.dueDate).format('MMM YYYY') : '—',
                          amount: showLiveAllocation
                            ? (liveAllocation.allocatedRows.find(
                                (row) => row.type === 'charge' && row.key === charge.chargeId
                              )?.paidAmount ?? 0)
                            : charge.amount,
                          remainingAmount: showLiveAllocation
                            ? liveAllocation.allocatedRows.find(
                                (row) => row.type === 'charge' && row.key === charge.chargeId
                              )?.remainingAmount
                            : undefined,
                          onRemove: () =>
                            handleChargesChange(
                              formik.values.charges.filter((id) => id !== charge.chargeId)
                            ),
                        })
                      )}
                      onMoveFee={(from, to) => {
                        submissionRef.current = null;
                        formik.setFieldValue(
                          'selectedItems',
                          arrayMove(formik.values.selectedItems, from, to),
                          false
                        );
                      }}
                      onMoveCharge={(from, to) => {
                        submissionRef.current = null;
                        formik.setFieldValue(
                          'charges',
                          arrayMove(formik.values.charges, from, to),
                          false
                        );
                      }}
                    />
                    <Box
                      sx={{
                        display: 'grid',
                        gap: 2,
                        gridTemplateColumns: 'minmax(0,1fr)',
                      }}
                    >
                      <Box
                        sx={{
                          display: 'grid',
                          gap: 2,
                          alignItems: 'start',
                          gridTemplateColumns: 'minmax(0, 1fr)',
                          '@container payment-summary (min-width: 420px)': {
                            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                          },
                        }}
                      >
                        <Box>
                          <ShakingTextField
                            error={Boolean(
                              (formik.touched.payment?.amount || formik.submitCount > 0) &&
                              formik.errors.payment?.amount
                            )}
                          >
                            <NumericFormatCustom
                              fullWidth
                              size="small"
                              label="Amount to collect"
                              InputLabelProps={{ shrink: true }}
                              name="payment.amount"
                              required
                              value={formik.values.payment.amount ?? ''}
                              roundToWholeRupees={false}
                              decimalScale={2}
                              onValueChange={(values, source) => {
                                if (source.source === 'event')
                                  updatePayment('amount', values.value);
                              }}
                              onBlur={formik.handleBlur}
                              error={Boolean(
                                (formik.touched.payment?.amount || formik.submitCount > 0) &&
                                formik.errors.payment?.amount
                              )}
                              helperText={
                                formik.touched.payment?.amount || formik.submitCount > 0
                                  ? (formik.errors.payment?.amount as string)
                                  : undefined
                              }
                            />
                          </ShakingTextField>
                        </Box>
                        <ShakingTextField
                          error={Boolean(
                            (formik.touched.payment?.paymentMethod || formik.submitCount > 0) &&
                            formik.errors.payment?.paymentMethod
                          )}
                        >
                          <CustomSelect
                            label="Payment Method"
                            fullWidth
                            required
                            size="small"
                            name="payment.paymentMethod"
                            value={formik.values.payment.paymentMethod}
                            renderValue={(value) =>
                              value === 'Bank Transfer (NEFT/RTGS/IMPS)'
                                ? 'Bank Transfer'
                                : String(value)
                            }
                            options={availablePaymentMethods.map((method) => ({
                              label: method,
                              value: method,
                            }))}
                            disabled={finalAmount === 0}
                            onChange={(value) => {
                              handlePaymentMethodChange(String(value));
                              formik.setFieldTouched('payment.paymentMethod', true);
                            }}
                            onBlur={formik.handleBlur}
                            error={Boolean(
                              (formik.touched.payment?.paymentMethod || formik.submitCount > 0) &&
                              formik.errors.payment?.paymentMethod
                            )}
                            helperText={
                              formik.touched.payment?.paymentMethod || formik.submitCount > 0
                                ? (formik.errors.payment?.paymentMethod as string)
                                : undefined
                            }
                          />
                        </ShakingTextField>
                      </Box>
                      {formik.values.payment.paymentMethod !== 'Cash' &&
                        (missingCollectionBank ? (
                          <FinancePrerequisiteState
                            requirements={[{ key: 'bank-account' }]}
                            compact
                            onRefresh={refreshPrerequisites}
                          />
                        ) : (
                          <CustomSelect
                            fullWidth
                            size="small"
                            label="Receiving School Bank Account"
                            required
                            value={formik.values.payment.details.bankAccount || ''}
                            name="payment.details.bankAccount"
                            options={bankAccountOptions.map(
                              (account: { id: string; name: string }) => ({
                                label: account.name,
                                value: account.id,
                              })
                            )}
                            isLoading={isBankAccountsBusy}
                            onChange={(value) =>
                              formik.setFieldValue('payment.details.bankAccount', value)
                            }
                            error={Boolean(
                              formik.touched.payment?.details?.bankAccount &&
                              formik.errors.payment?.details?.bankAccount
                            )}
                            helperText={
                              formik.touched.payment?.details?.bankAccount
                                ? String(formik.errors.payment?.details?.bankAccount || '')
                                : undefined
                            }
                          />
                        ))}
                    </Box>
                    {formik.values.payment.paymentMethod && (
                      <Box
                        sx={{
                          display: 'grid',
                          gap: 2,
                          gridTemplateColumns: 'minmax(0, 1fr)',
                          '@container payment-summary (min-width: 420px)': {
                            gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                          },
                        }}
                      >
                        {/* Extra payment details (cheque, upi, etc.) */}
                        {(
                          paymentMethodsConfig[
                            formik.values.payment.paymentMethod as keyof typeof paymentMethodsConfig
                          ] ?? []
                        )
                          .filter((field: IPaymentFieldConfig) => field.name !== 'amount')
                          .map((field: IPaymentFieldConfig) => {
                            const fieldPath = `payment.details.${field.name}`;
                            const isBankAccountField = field.name === 'bankAccount';
                            if (isBankAccountField) return null;
                            const selectOptions = isBankAccountField
                              ? bankAccountOptions
                              : (field.options ?? []);
                            const value = formik.values.payment.details[field.name];
                            const error = (formik.errors.payment?.details as any)?.[field.name];
                            const touched = (formik.touched.payment?.details as any)?.[field.name];

                            return (
                              <Box
                                key={`${formik.values.payment.paymentMethod}-${field.name}`}
                                sx={{
                                  minWidth: 0,
                                  gridColumn:
                                    field.name === 'accountHolderName' || field.type === 'multiline'
                                      ? '1 / -1'
                                      : undefined,
                                }}
                              >
                                <ShakingTextField
                                  error={Boolean((touched || formik.submitCount > 0) && error)}
                                >
                                  {field.type === 'date' ? (
                                    <CollectionPaymentDateField
                                      label={field.label}
                                      name={fieldPath}
                                      required
                                      value={value}
                                      onChange={(date) => formik.setFieldValue(fieldPath, date)}
                                      onBlur={() => {
                                        formik.setFieldTouched(fieldPath, true);
                                      }}
                                      error={
                                        (touched || formik.submitCount > 0) &&
                                        typeof error === 'string'
                                          ? error
                                          : undefined
                                      }
                                    />
                                  ) : field.type === 'select' ? (
                                    <TextField
                                      select
                                      fullWidth
                                      label={`${field.label} *`}
                                      name={fieldPath}
                                      value={value || ''}
                                      onChange={formik.handleChange}
                                      onBlur={formik.handleBlur}
                                      disabled={isBankAccountField && isBankAccountsBusy}
                                      size="small"
                                      error={Boolean((touched || formik.submitCount > 0) && error)}
                                      helperText={
                                        ((touched || formik.submitCount > 0) &&
                                        typeof error === 'string'
                                          ? error
                                          : isBankAccountField && isBankAccountsBusy
                                            ? 'Loading bank accounts...'
                                            : isBankAccountField && selectOptions.length === 0
                                              ? 'No bank accounts available'
                                              : '') || undefined
                                      }
                                    >
                                      {isBankAccountField && isBankAccountsBusy ? (
                                        <MenuItem disabled value="">
                                          Loading bank accounts...
                                        </MenuItem>
                                      ) : selectOptions.length === 0 ? (
                                        <MenuItem disabled value="">
                                          No options available
                                        </MenuItem>
                                      ) : (
                                        selectOptions.map((opt: any) => (
                                          <MenuItem key={opt.id} value={opt.id}>
                                            {opt.name}
                                          </MenuItem>
                                        ))
                                      )}
                                    </TextField>
                                  ) : field.type === 'multiline' ? (
                                    <TextField
                                      fullWidth
                                      multiline
                                      minRows={2}
                                      size="small"
                                      label={`${field.label} *`}
                                      name={fieldPath}
                                      value={value || ''}
                                      onChange={(e) => {
                                        let val = e.target.value.replace(/[<>]/g, '');
                                        if (
                                          (field as any).maxLength &&
                                          val.length > (field as any).maxLength
                                        ) {
                                          val = val.slice(0, (field as any).maxLength);
                                        }
                                        formik.setFieldValue(fieldPath, val);
                                      }}
                                      onBlur={(e) => {
                                        const val = e.target.value;
                                        const trimmed = val.trim().replace(/\s+/g, ' ');
                                        if (trimmed !== val) {
                                          formik.setFieldValue(fieldPath, trimmed);
                                        }
                                        formik.handleBlur(e);
                                      }}
                                      error={Boolean((touched || formik.submitCount > 0) && error)}
                                      helperText={
                                        ((touched || formik.submitCount > 0) &&
                                        typeof error === 'string'
                                          ? error
                                          : undefined) || undefined
                                      }
                                    />
                                  ) : (
                                    <TextField
                                      fullWidth
                                      type={
                                        field.type === 'text' ||
                                        field.type === 'numbers' ||
                                        field.type === 'last4digits' ||
                                        field.type === 'uppercase' ||
                                        field.type === 'anytext'
                                          ? 'text'
                                          : field.type
                                      }
                                      size="small"
                                      label={`${field.label} *`}
                                      name={fieldPath}
                                      value={value || ''}
                                      onChange={(e) => {
                                        let newValue = e.target.value;

                                        // Handle text-only fields (letters and spaces only)
                                        if (field.type === 'text') {
                                          newValue = newValue.replace(/[^a-zA-Z\s]/g, '');
                                        }

                                        if (field.type === 'uppercase') {
                                          newValue = newValue
                                            .toUpperCase()
                                            .replace(/[^A-Z0-9]/g, '');
                                        }

                                        // Handle numbers-only fields (digits only)
                                        if (field.type === 'numbers') {
                                          newValue = newValue.replace(/\D/g, '');
                                        }

                                        // Handle last 4 digits field (4 digits max)
                                        if (field.type === 'last4digits') {
                                          newValue = newValue.replace(/\D/g, '');
                                          if (newValue.length > 4) {
                                            newValue = newValue.slice(0, 4);
                                          }
                                        }

                                        // Apply maxLength if specified
                                        if (
                                          (field as any).maxLength &&
                                          newValue.length > (field as any).maxLength
                                        ) {
                                          newValue = newValue.slice(0, (field as any).maxLength);
                                        }

                                        formik.setFieldValue(fieldPath, newValue);
                                      }}
                                      onBlur={(e) => {
                                        const val = e.target.value;
                                        if (typeof val === 'string') {
                                          const trimmed = val.trim().replace(/\s+/g, ' ');
                                          if (trimmed !== val) {
                                            formik.setFieldValue(fieldPath, trimmed);
                                          }
                                        }
                                        formik.handleBlur(e);
                                      }}
                                      error={Boolean((touched || formik.submitCount > 0) && error)}
                                      helperText={
                                        ((touched || formik.submitCount > 0) &&
                                        typeof error === 'string'
                                          ? error
                                          : undefined) || undefined
                                      }
                                      inputProps={
                                        field.type === 'number'
                                          ? { min: field.min, max: field.max }
                                          : {}
                                      }
                                    />
                                  )}
                                </ShakingTextField>
                              </Box>
                            );
                          })}
                      </Box>
                    )}
                  </Stack>
                </Scrollbar>
              </FormSectionCard>
            </Box>
          </Box>
        </Stack>
      </BackPopUpChecked>
      <DialogActions
        aria-label="Collection actions"
        sx={{
          p: 2,
          bgcolor: 'background.paper',
          borderTop: (t) => `1px solid ${alpha(t.palette.grey[500], 0.16)}`,
          flexShrink: 0,
        }}
      >
        <Stack
          direction="row"
          spacing={1}
          justifyContent="flex-end"
          alignItems="center"
          useFlexGap
          flexWrap="wrap"
          width="100%"
        >
          {showOverAllocationWarning && (
            <Box sx={{ width: 1 }}>
              <Typography variant="caption" color="error" textAlign="center">
                Total allocated <strong>(₹ {formatNumber(totalAllocated)})</strong> exceeds the
                payable amount <strong>(₹{formatNumber(finalAmount)})</strong>. Please reduce
                payment amounts.
              </Typography>
            </Box>
          )}

          <Box aria-live="polite" sx={{ mr: 'auto', minWidth: 0 }}>
            <Typography variant="caption" color="text.secondary">
              Collecting now
            </Typography>
            <Typography variant="subtitle1" sx={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatNumber(Number(formik.values.payment.amount || 0), 'INR')}
            </Typography>
          </Box>
          <Button
            type="button"
            variant="outlined"
            color="inherit"
            onClick={() => onCancel?.(null, false)}
            disabled={collectLoading || adaptedOutcomeUnresolved}
            size="small"
            startIcon={<Iconify icon={GlobalIcons.cancel} width={18} />}
          >
            Cancel
          </Button>
          <LoadingButton
            aria-label="Collect Payment"
            disabled={
              collectLoading ||
              adaptedOutcomeUnresolved ||
              collectionReadBlocked ||
              missingCollectionBank ||
              finalAmount <= 0 ||
              Number(formik.values.payment.amount) <= 0
            }
            type="button"
            color="inherit"
            variant="contained"
            size="small"
            loading={collectLoading && !finalReviewOpen}
            loadingPosition="start"
            onClick={(e: any) => formik.handleSubmit(e)}
            startIcon={<Iconify icon={GlobalIcons.submit} width={18} />}
          >
            Collect {formatNumber(Number(formik.values.payment.amount || 0), 'INR')}
          </LoadingButton>
        </Stack>
      </DialogActions>
      {collectLoading && !finalReviewOpen && (
        <Box
          role="status"
          aria-live="polite"
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 1,
            bgcolor: (t) => alpha(t.palette.background.paper, 0.72),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          <CircularProgress size={24} />
          <Typography variant="body2">Recording payment…</Typography>
        </Box>
      )}

      <CustomDialog
        open={receiptDialogOpen}
        handleClose={handleReceiptDialogClose}
        title={
          <Box display="flex" alignItems="center" gap={1}>
            <Typography variant="h6" fontWeight={700}>
              Payment Receipts
            </Typography>
            <CustomTooltip title="View or download the fee and charge receipts generated for this payment collection.">
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        maxWidth="md"
        hasForm={false}
      >
        <Scrollbar sx={{ maxHeight: 'calc(100dvh - 260px)', p: 2 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* Payment Summary Header */}
            {lastCollectResponse && (
              <DetailSection title="Payment Summary" icon="mdi:cash-check">
                <DetailGrid desktopColumns={4} desktopMinWidth={680}>
                  <DetailField label="Student" value={resolvedStudentName} />
                  <DetailField
                    label={
                      lastCollectResponse.feeReceiptNumber &&
                      lastCollectResponse.chargeReceiptNumber
                        ? 'Receipt numbers'
                        : 'Receipt number'
                    }
                    value={[
                      lastCollectResponse.feeReceiptNumber,
                      lastCollectResponse.chargeReceiptNumber,
                    ]
                      .filter(Boolean)
                      .join('\n')}
                  />
                  <DetailField
                    label="Collected at"
                    value={fDateTime(lastCollectResponse.collectedAt, 'DD MMM YYYY h:mm:ss a')}
                  />
                  <DetailField
                    label="Total received"
                    value={formatNumber(lastCollectResponse.totalAmount, 'INR')}
                  />
                </DetailGrid>
              </DetailSection>
            )}

            {/* Unified Receipt Display */}
            <UnifiedReceiptDisplay
              feeReceipt={feeReceiptData}
              chargeReceipt={chargeReceiptData}
              feeIsLoading={receiptPdfStatus.fee === 'loading'}
              chargeIsLoading={receiptPdfStatus.charge === 'loading'}
              feeBlobUrl={feeReceiptBlobUrl}
              chargeBlobUrl={chargeReceiptBlobUrl}
              feeError={receiptPdfStatus.fee === 'error' ? RECEIPT_PDF_ERROR : null}
              chargeError={receiptPdfStatus.charge === 'error' ? RECEIPT_PDF_ERROR : null}
              onRetryFee={() => {
                if (receiptPreviewState.feeReceipt)
                  loadReceiptPdf(receiptPreviewState.feeReceipt.id, 'fee');
              }}
              onRetryCharge={() => {
                if (receiptPreviewState.chargeReceipt)
                  loadReceiptPdf(receiptPreviewState.chargeReceipt.id, 'charge');
              }}
            />
          </Box>
        </Scrollbar>
        <DialogActions
          sx={{
            borderTop: (t) => `1px solid ${alpha(t.palette.divider, 0.45)}`,
            flexWrap: 'wrap',
            rowGap: 1,
          }}
        >
          {(
            [
              {
                scope: 'fee',
                receipt: receiptPreviewState.feeReceipt,
                blobUrl: feeReceiptBlobUrl,
              },
              {
                scope: 'charge',
                receipt: receiptPreviewState.chargeReceipt,
                blobUrl: chargeReceiptBlobUrl,
              },
            ] as const
          ).map(({ scope, receipt, blobUrl }) =>
            receipt && blobUrl && receiptPdfStatus[scope] === 'ready' ? (
              <Stack key={scope} direction="row" spacing={1}>
                <Button
                  size="small"
                  startIcon={<Iconify icon="mdi:open-in-new" />}
                  onClick={() => handleOpenReceiptInNewTab(blobUrl)}
                >
                  {feeReceiptData && chargeReceiptData ? `Open ${scope}` : 'Open'}
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<Iconify icon="mdi:download" />}
                  onClick={() => handleDownloadReceipt(receipt, blobUrl)}
                >
                  {feeReceiptData && chargeReceiptData ? `Download ${scope}` : 'Download'}
                </Button>
              </Stack>
            ) : null
          )}
          <Button
            variant="contained"
            size="small"
            onClick={handleReceiptDialogClose}
            startIcon={<Iconify icon={GlobalIcons.submit} />}
          >
            Done
          </Button>
        </DialogActions>
      </CustomDialog>

      <CustomDialog
        open={outcomeDialogOpen}
        handleClose={() => {
          setOutcomeDialogOpen(false);
          setLastCollectResponse(null);
          // Reset form for next fee collection instead of closing
          formik.resetForm();
        }}
        title="Payment summary"
        maxWidth="sm"
        hasForm={false}
      >
        {lastCollectResponse && (
          <FeeCollectionOutcomePanel
            collectResponse={lastCollectResponse}
            showAuditTrail={!collectionAdapter}
            receiptAccessUnavailable={Boolean(
              collectionAdapter && !collectionAdapter.canViewReceipts
            )}
            onClose={() => {
              setOutcomeDialogOpen(false);
              setLastCollectResponse(null);
              onCancel?.(null, true);
            }}
          />
        )}
      </CustomDialog>

      {/* ── Fee Collection Preview Dialog ── */}
      <FeeCollectionPreviewDialog
        bankAccounts={bankAccountOptions}
        preserveAllocationOrder={usesAutomaticAllocation}
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onConfirm={handlePreviewConfirm}
        loading={false}
        formValues={allocationFormValues}
        student={collectionDisplayStudent(formData) ?? student}
        chargesData={chargesData ?? []}
        feeHeadMap={feeHeadMap}
        academicYear={
          currentYear?.name || (currentYear?.year ? String(currentYear.year) : undefined)
        }
      />

      {/* ── Final Payment Review Dialog ── */}
      <FinalPaymentReviewDialog
        open={finalReviewOpen}
        onClose={() => setFinalReviewOpen(false)}
        onConfirmCollect={handleFinalCollect}
        onSavePending={handleSavePending}
        loading={collectLoading}
        formValues={allocationFormValues}
        student={student}
        chargesData={chargesData ?? []}
        feeHeadMap={feeHeadMap}
        bankAccounts={bankAccountOptions}
      />
    </Box>
  );
};

export default FeeCollectComponentForm;
