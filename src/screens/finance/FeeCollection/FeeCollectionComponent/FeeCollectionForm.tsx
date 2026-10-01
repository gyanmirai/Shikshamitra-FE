'use client';

import type React from 'react';
import type { RootState } from 'src/redux/store';
import type { DragEndEvent } from '@dnd-kit/core';
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
import { LoadingButton } from '@mui/lab';
import { CSS } from '@dnd-kit/utilities';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { alpha, useTheme } from '@mui/material/styles';
import CustomDialog from 'src/components/customDialog';
import { formatNumber } from 'src/utils/formate_number';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { useRef, useMemo, useState, useEffect } from 'react';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { dateFormat, dateConvertor } from 'src/utils/dateConvertor';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { PaymentMethodLabels } from 'src/enums/finance-payment-method';
import { FeeMonth } from 'src/enums/fee-collection-type';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { useGetBankAccountQuery } from 'src/redux/finance/BankAccountManage/bankAccountApi';
import { useSensor, DndContext, useSensors, closestCenter, PointerSensor } from '@dnd-kit/core';
import {
  arrayMove,
  useSortable,
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import FeeStructureAssignmentForm from 'src/screens/finance/FeeStructureAssign/Components/StudentFeeStructureAssignmentForm';
import {
  useCollectFeeMutation,
  useGetCollectFormQuery,
  useDownloadReceiptPdfMutation,
} from 'src/redux/feeCollection/feeCollection';
import {
  Box,
  Card,
  Grid,
  Button,
  Divider,
  MenuItem,
  TextField,
  IconButton,
  Typography,
  DialogActions,
} from '@mui/material';

import FeeLedgerList from './FeeLedgerList';
import { normalizeLedgerStatus } from './feeLedgerStatus';
import { toPeriod } from './FeeLedgerShared';
import UnifiedReceiptDisplay from './UnifiedReceiptDisplay';
import {
  allocatePayment,
  roundUpToRupee,
  safeRoundingDifference,
} from './preview/paymentAllocationUtils';
import FeeCollectionFormSkeleton from './FeeCollectionFormSkeleton';
import FeeCollectionOutcomePanel from './FeeCollectionOutcomePanel';
import { paymentMethodsConfig } from '../Components/paymentConfigMethods';
import FinalPaymentReviewDialog from './preview/FinalPaymentReviewDialog';
import { StudentFeeSummaryCard } from '../Components/StudentFeesSummaryCard';
import FeeCollectionPreviewDialog from './preview/FeeCollectionPreviewDialog';
import FeeLedgerFilterBar, { FEE_LEDGER_INITIAL_FILTERS } from './FeeLedgerFilterBar';

import type { FeeLedgerFilters } from './FeeLedgerFilterBar';
import type { AllocatedFeeRow, AllocatedChargeRow } from './preview/paymentAllocationUtils';
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
};

type ReceiptPreviewState = {
  feeReceipt: GeneratedReceipt | null;
  chargeReceipt: GeneratedReceipt | null;
};

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
  charges: Yup.array().when('selectedItems', {
    is: (selectedItems: any[]) => !selectedItems || selectedItems.length === 0,
    then: (schema) => schema.min(1, 'Select at least one fee item or charge to collect'),
    otherwise: (schema) => schema,
  }),
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

const SummaryRow = ({
  label,
  value,
  color,
  bold = false,
  large = false,
}: {
  label: string;
  value: string;
  color?: string;
  bold?: boolean;
  large?: boolean;
}) => (
  <Box display="flex" alignItems="center" justifyContent="space-between" py={0.375}>
    <Typography
      variant={large ? 'subtitle2' : 'body2'}
      color="text.secondary"
      fontWeight={bold ? 600 : 400}
    >
      {label}
    </Typography>
    <Typography
      variant={large ? 'subtitle1' : 'body2'}
      fontWeight={bold ? 700 : 500}
      color={color ?? 'text.primary'}
    >
      {value}
    </Typography>
  </Box>
);

// ─── SortableFeeRow ────────────────────────────────────────────────────────────

const SortableFeeRow = ({
  id,
  label,
  sub,
  amount,
  isCharge = false,
  onRemove,
}: {
  id: string;
  label: string;
  sub?: string;
  amount: number;
  isCharge?: boolean;
  onRemove: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative',
    zIndex: isDragging ? 10 : 'auto',
  } as React.CSSProperties;

  return (
    <Box
      ref={setNodeRef}
      style={style}
      sx={{
        display: 'flex',
        alignItems: 'center',
        px: 1,
        py: 1,
        gap: 1,
        cursor: isDragging ? 'grabbing' : 'default',
      }}
    >
      {/* drag handle */}
      <Box
        {...attributes}
        {...listeners}
        sx={{
          cursor: 'grab',
          display: 'flex',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <Iconify icon="mdi:drag" width={16} />
      </Box>

      {/* label + period */}
      <Box flex={1} minWidth={0}>
        <Typography variant="body2" fontWeight={600} noWrap>
          {label} - ({sub})
        </Typography>
      </Box>

      {/* amount + remove */}
      <Box display="flex" alignItems="center" gap={1} flexShrink={0}>
        <Typography
          variant="body2"
          sx={{
            fontVariantNumeric: 'tabular-nums',
            fontWeight: 700,
          }}
        >
          {formatNumber(amount, 'INR')}
        </Typography>
        <IconButton
          size="small"
          onClick={onRemove}
          sx={{
            p: 0.4,
            color: 'text.disabled',
            '&:hover': { color: 'text.secondary' },
          }}
        >
          <Iconify icon={GlobalIcons.cancel} width={18} />
        </IconButton>
      </Box>
    </Box>
  );
};

// Normalize month from API (may be string name like "June" or number like 5)
const normalizeMonth = (month: string | number): FeeMonth =>
  typeof month === 'number'
    ? month
    : ((FeeMonth[month as keyof typeof FeeMonth] as unknown as FeeMonth) ?? 0);

const isChargeSelectable = (charge: IFeeCharge): boolean => charge.amount > 0;

// ─── Main Component ────────────────────────────────────────────────────────────

const FeeCollectComponentForm = ({
  student,
  onCancel,
}: {
  student: IStudentFee | null;
  onCancel?: (e: any, isSubmit: boolean) => void;
}) => {
  const theme = useTheme();
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const [filters, setFilters] = useState<FeeLedgerFilters>(FEE_LEDGER_INITIAL_FILTERS);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [finalReviewOpen, setFinalReviewOpen] = useState(false);
  const [feeStructureDialogOpen, setFeeStructureDialogOpen] = useState(false);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [receiptPreviewState, setReceiptPreviewState] = useState<ReceiptPreviewState>({
    feeReceipt: null,
    chargeReceipt: null,
  });
  const [feeReceiptBlobUrl, setFeeReceiptBlobUrl] = useState<string | null>(null);
  const [chargeReceiptBlobUrl, setChargeReceiptBlobUrl] = useState<string | null>(null);
  const [lastCollectResponse, setLastCollectResponse] = useState<CollectFeeOutput | null>(null);
  const [outcomeDialogOpen, setOutcomeDialogOpen] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const resolvedStudentName =
    lastCollectResponse?.studentName?.trim() || student?.name?.trim() || '';

  // ── Fetch collect form data from V2 API ────────────────────────────────────
  const {
    data: collectFormData,
    isLoading: collectFormLoading,
    isFetching: collectFormFetching,
    refetch: refetchCollectForm,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetCollectFormQuery,
    params: {
      studentId: String(student?.id ?? ''),
      academicYearId: currentYear?.id ?? '',
    },
    options: { skip: !student?.id || !currentYear?.id },
  });

  const {
    data: bankAccountsData,
    isLoading: bankAccountsLoading,
    isFetching: bankAccountsFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBankAccountQuery,
    params: { academicYearId: currentYear?.id ?? '' },
    options: { skip: !currentYear?.id },
  });

  const [collectFee, { isLoading: collectLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCollectFeeMutation,
  });

  const submissionRef = useRef<{ fingerprint: string; key: string } | null>(null);
  const withIdempotencyKey = (
    payload: Omit<CollectFeeInput, 'idempotencyKey'>
  ): CollectFeeInput => {
    const fingerprint = JSON.stringify(payload);
    if (!submissionRef.current || submissionRef.current.fingerprint !== fingerprint) {
      submissionRef.current = { fingerprint, key: crypto.randomUUID() };
    }
    return { ...payload, idempotencyKey: submissionRef.current.key };
  };

  const [downloadReceiptPdf] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDownloadReceiptPdfMutation,
    popupConfig: {
      error: true,
      errorMessage: 'Unable to load receipt preview',
      success: false,
    },
  });

  // Build receipt data from CollectFeeOutput response
  const feeReceiptData =
    lastCollectResponse && receiptPreviewState.feeReceipt
      ? {
          id: lastCollectResponse.feeReceiptId ?? receiptPreviewState.feeReceipt.id,
          receiptNumber: lastCollectResponse.feeReceiptNumber ?? '',
          studentId: lastCollectResponse.studentId,
          studentName: resolvedStudentName,
          academicYearId: lastCollectResponse.academicYearId,
          totalAmount: lastCollectResponse.paidFeeHeads.reduce((sum, h) => sum + h.amountPaid, 0),
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
          studentId: lastCollectResponse.studentId,
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

  const formData = collectFormData;

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
          dueDate: item.dueDate,
          total: item.total,
          scheduledTotal: item.scheduledTotal,
          prorationPolicyVersionId: item.prorationPolicyVersionId,
          prorationPolicyName: item.prorationPolicyName,
          prorationPolicyVersionNumber: item.prorationPolicyVersionNumber,
          prorationExplanation: item.prorationExplanation,
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
      bankAccountsData?.items.map(
        (account: { bankName: string; accountNumber: string; id: string }) => ({
          name: `${account.bankName} - ${account.accountNumber}`,
          id: account.id,
        })
      ) ?? [],
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

  // ── Formik ─────────────────────────────────────────────────────────────────
  const formik = useFormik<FeeCollectionFormValues>({
    initialValues: buildInitialValues(student),
    validationSchema,
    enableReinitialize: true,
    validateOnChange: true,
    validate: (values) => {
      const errors: any = {};
      const itemsTotal = values.selectedItems.reduce(
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

      activeMethodFields.forEach((field: IPaymentFieldConfig) => {
        const rawValue = values.payment.details?.[field.name];

        if (field.type === 'date') {
          if (!rawValue) {
            detailErrors[field.name] = `${field.label} is required`;
            return;
          }
          const dateValue = dayjs(rawValue);
          if (!dateValue.isValid()) {
            detailErrors[field.name] = `Invalid ${field.label}`;
            return;
          }
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
    onSubmit: () => {
      setPreviewOpen(true);
    },
  });
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

  const finalAmount = subtotal;
  const overallOutstanding =
    (formData?.summary?.pendingFee ?? 0) +
    (formData?.charges ?? []).reduce(
      (sum: number, charge: ChargeDetail) => sum + charge.pendingAmount,
      0
    );

  const resolveAllocatedDueFeeId = (row: AllocatedFeeRow): string => {
    if (row.dueFeeId) return row.dueFeeId;
    const matchingItem = formik.values.selectedItems.find(
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
  const balance = balancePaise / 100;

  useEffect(() => {
    formik.setFieldValue('payment.amount', subtotal > 0 ? String(subtotal) : '', false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subtotal]);

  const showOverAllocationWarning =
    balancePaise < 0 && (Boolean(formik.touched.payment?.amount) || formik.submitCount > 0);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleSelectionChange = (items: SelectedItem[]) =>
    formik.setFieldValue('selectedItems', items, false);

  const handleChargesChange = (chargeIds: string[]) =>
    formik.setFieldValue('charges', chargeIds, false);

  const handlePaymentMethodChange = (method: string) => {
    formik.setFieldValue('payment', {
      paymentMethod: method,
      amount: formik.values.payment.amount,
      details: buildDetailsForMethod(method),
    });
  };

  const updatePayment = (field: keyof FeeCollectionPayment, value: any) =>
    formik.setFieldValue('payment', { ...formik.values.payment, [field]: value });

  const buildPaymentPayload = (paymentMethodNum: number, receivedAmount: number) => [
    {
      paymentMethod: paymentMethodNum,
      amount: receivedAmount,
      details: Object.fromEntries(
        Object.entries(formik.values.payment.details)
          .filter(([, v]) => v != null && v !== '')
          .map(([k, v]) => [
            k,
            dayjs.isDayjs(v) ? dateConvertor(v.format(dateFormat) || '') || '' : String(v),
          ])
      ),
    },
  ];

  const loadFeeReceiptPdf = async (receiptId: string) => {
    try {
      const blob = await downloadReceiptPdf({
        receiptId,
      }).unwrap();
      const objectUrl = URL.createObjectURL(blob);
      setFeeReceiptBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return objectUrl;
      });
    } catch {
      setFeeReceiptBlobUrl(null);
    }
  };

  const loadChargeReceiptPdf = async (receiptId: string) => {
    try {
      const blob = await downloadReceiptPdf({
        receiptId,
      }).unwrap();
      const objectUrl = URL.createObjectURL(blob);
      setChargeReceiptBlobUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return objectUrl;
      });
    } catch {
      setChargeReceiptBlobUrl(null);
    }
  };

  // Opens the FinalPaymentReviewDialog from the preview dialog
  const handlePreviewConfirm = () => {
    setPreviewOpen(false);
    setFinalReviewOpen(true);
  };

  // Final submission: collects fee and generates receipt immediately
  const handleFinalCollect = async () => {
    try {
      const receivedAmount = Number(
        String(formik.values.payment.amount || 0).replace(/[₹,\s]/g, '')
      );

      const paymentMethodNum = Number(
        Object.entries(PaymentMethodLabels).find(
          ([, label]) => label === formik.values.payment.paymentMethod
        )?.[0] ?? 0
      );

      const isCashierDecided =
        paymentMethodNum !== 0 && paymentMethodNum !== 1 && paymentMethodNum !== 2;

      const allocation = allocatePayment(
        formik.values.selectedItems,
        chargesData.filter((c) => formik.values.charges.includes(c.chargeId)),
        feeHeadMap,
        receivedAmount
      );

      const dueFeePayments = allocation.allocatedRows
        .filter((r): r is AllocatedFeeRow => r.type === 'fee' && r.principalPaidAmount > 0)
        .map((r) => {
          const matchingItem = formik.values.selectedItems.find(
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

      const collectResponse = await collectFee(
        withIdempotencyKey({
          studentId: String(student?.id ?? ''),
          academicYearId: currentYear?.id ?? '',
          notes: formik.values.remarks ?? undefined,
          paymentConfirmed: isCashierDecided ? true : undefined,
          dueFeePayments,
          lateFeePayments,
          chargePayments,
          payments: buildPaymentPayload(paymentMethodNum, receivedAmount),
        })
      ).unwrap();

      shikshaMitraToast.success({
        message: collectResponse.auditSummary?.headline || 'Fee collected successfully',
      });
      setFinalReviewOpen(false);
      submissionRef.current = null;
      setLastCollectResponse(collectResponse);
      if (!(await showGeneratedReceiptDialog(collectResponse))) {
        if (collectResponse.auditSummary) {
          setOutcomeDialogOpen(true);
        } else {
          onCancel?.(null, true);
        }
      }
    } catch (err) {
      console.error(err);
      shikshaMitraToast.error({ message: 'Failed to collect fee. Please try again.' });
      setFinalReviewOpen(false);
    }
  };

  // Save as pending verification (non-cash): calls API with pending status
  const handleSavePending = async () => {
    try {
      const receivedAmount = Number(
        String(formik.values.payment.amount || 0).replace(/[₹,\s]/g, '')
      );

      const paymentMethodNum = Number(
        Object.entries(PaymentMethodLabels).find(
          ([, label]) => label === formik.values.payment.paymentMethod
        )?.[0] ?? 0
      );

      const isCashierDecided =
        paymentMethodNum !== 0 && paymentMethodNum !== 1 && paymentMethodNum !== 2;

      const allocation = allocatePayment(
        formik.values.selectedItems,
        chargesData.filter((c) => formik.values.charges.includes(c.chargeId)),
        feeHeadMap,
        receivedAmount
      );

      const dueFeePayments = allocation.allocatedRows
        .filter((r): r is AllocatedFeeRow => r.type === 'fee' && r.principalPaidAmount > 0)
        .map((r) => {
          const matchingItem = formik.values.selectedItems.find(
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

      const collectResponse = await collectFee(
        withIdempotencyKey({
          studentId: String(student?.id ?? ''),
          academicYearId: currentYear?.id ?? '',
          notes: formik.values.remarks ?? undefined,
          paymentConfirmed: isCashierDecided ? false : undefined,
          dueFeePayments,
          lateFeePayments,
          chargePayments,
          payments: buildPaymentPayload(paymentMethodNum, receivedAmount),
        })
      ).unwrap();

      shikshaMitraToast.success({
        message: collectResponse.auditSummary?.headline || 'Payment saved as pending verification',
      });
      setFinalReviewOpen(false);
      submissionRef.current = null;
      setLastCollectResponse(collectResponse);
      if (!(await showGeneratedReceiptDialog(collectResponse))) {
        if (collectResponse.auditSummary) {
          setOutcomeDialogOpen(true);
        } else {
          onCancel?.(null, true);
        }
      }
    } catch (err) {
      console.error(err);
      shikshaMitraToast.error({ message: 'Failed to save payment. Please try again.' });
      setFinalReviewOpen(false);
    }
  };

  const handleRemoveAll = () => {
    formik.setFieldValue('selectedItems', [], false);
    formik.setFieldValue('charges', [], false);
  };

  const entryCount = useMemo(
    () =>
      (filteredLedgerData.monthWise ?? []).reduce((s, g) => s + g.items.length, 0) +
      filteredChargesData.length,
    [filteredLedgerData, filteredChargesData]
  );

  const orderedFilteredPeriods = useMemo(() => {
    const uniquePeriods = new Map<string, number>();

    (filteredLedgerData.monthWise ?? []).forEach((group) => {
      if (!group.items.some((item) => item.due > 0 || (item.lateFeeAmount ?? 0) > 0)) {
        return;
      }

      const period = toPeriod(
        FeeMonth[group.month] as string,
        group.year ?? currentYear?.year ?? new Date().getFullYear()
      );

      uniquePeriods.set(period, (group.year ?? 0) * 12 + Number(group.month));
    });

    return [...uniquePeriods.entries()].sort((a, b) => a[1] - b[1]).map(([period]) => period);
  }, [filteredLedgerData, currentYear]);

  const { selectionFilters } = filters;
  const hasSelectionFilters = Object.values(selectionFilters).some(Boolean);

  const firstSixPeriodSet = useMemo(
    () => new Set(orderedFilteredPeriods.slice(0, 6)),
    [orderedFilteredPeriods]
  );

  const lastSixPeriodSet = useMemo(
    () => new Set(orderedFilteredPeriods.slice(-6)),
    [orderedFilteredPeriods]
  );

  // ── Select-All helpers (based on filtered ledger + charges) ────────────────
  const allSelectableItems = useMemo((): SelectedItem[] => {
    const items: SelectedItem[] = [];
    (filteredLedgerData.monthWise ?? []).forEach((g) => {
      const period = toPeriod(
        FeeMonth[g.month] as string,
        g.year ?? currentYear?.year ?? new Date().getFullYear()
      );
      g.items
        .filter((i) => i.due > 0 || (i.lateFeeAmount ?? 0) > 0)
        .forEach((i) => {
          if (
            hasSelectionFilters &&
            !(
              selectionFilters.allPending ||
              (selectionFilters.firstSixMonths && firstSixPeriodSet.has(period)) ||
              (selectionFilters.lastSixMonths && lastSixPeriodSet.has(period))
            )
          ) {
            return;
          }

          const roundedDue = roundUpToRupee(i.due);
          items.push({
            dueFeeId: i.dueFeeId,
            feeHeadId: i.feeHeadId,
            period,
            dueAmount: roundedDue,
            originalDueAmount: i.due,
            roundingAdjustment: safeRoundingDifference(i.due, roundedDue),
            lateFeeAmount: i.lateFeeAmount,
            installmentLabel: i.installmentLabel,
          });
        });
    });
    return items;
  }, [
    filteredLedgerData,
    currentYear,
    hasSelectionFilters,
    selectionFilters,
    firstSixPeriodSet,
    lastSixPeriodSet,
  ]);

  const allSelectableChargeIds = useMemo(() => {
    const selectableCharges = filteredChargesData
      .filter((charge) => isChargeSelectable(charge))
      .map((charge) => charge.chargeId);

    if (!hasSelectionFilters) {
      return selectableCharges;
    }

    return selectionFilters.allCharges ? selectableCharges : [];
  }, [filteredChargesData, hasSelectionFilters, selectionFilters.allCharges]);

  const totalSelectableCount = allSelectableItems.length + allSelectableChargeIds.length;

  const isAllSelected =
    totalSelectableCount > 0 &&
    allSelectableItems.every((si) =>
      formik.values.selectedItems.some(
        (s) => s.feeHeadId === si.feeHeadId && s.period === si.period
      )
    ) &&
    allSelectableChargeIds.every((id) => formik.values.charges.includes(id));

  const prevSelectionFilters = useRef(selectionFilters);
  // ── Auto-apply selection when filter checkboxes are toggled ───────────────
  useEffect(() => {
    if (prevSelectionFilters.current === selectionFilters) {
      return;
    }
    prevSelectionFilters.current = selectionFilters;

    // Items to add (not already selected)
    const existingKeys = new Set(
      formik.values.selectedItems.map((s) => `${s.feeHeadId}|${s.period}`)
    );
    const itemsToAdd = hasSelectionFilters
      ? allSelectableItems.filter((i) => !existingKeys.has(`${i.feeHeadId}|${i.period}`))
      : [];

    // Charges to add (not already selected)
    const existingChargeIds = new Set(formik.values.charges);
    const chargesToAdd = hasSelectionFilters
      ? allSelectableChargeIds.filter((id) => !existingChargeIds.has(id))
      : [];

    // Items to remove: any item that was in a now-unchecked filter scope
    const shouldKeepItem = (item: SelectedItem): boolean => {
      if (selectionFilters.allPending) return true;
      if (selectionFilters.firstSixMonths && firstSixPeriodSet.has(item.period)) return true;
      if (selectionFilters.lastSixMonths && lastSixPeriodSet.has(item.period)) return true;
      return false;
    };

    const nextItems = hasSelectionFilters
      ? [...formik.values.selectedItems.filter(shouldKeepItem), ...itemsToAdd]
      : [];

    const shouldKeepCharge = selectionFilters.allCharges;
    const nextCharges = hasSelectionFilters
      ? shouldKeepCharge
        ? [...new Set([...formik.values.charges, ...chargesToAdd])]
        : formik.values.charges.filter((id) => !allSelectableChargeIds.includes(id))
      : [];

    formik.setFieldValue('selectedItems', nextItems, false);
    formik.setFieldValue('charges', nextCharges, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectionFilters]);

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

  useEffect(
    () => () => {
      if (feeReceiptBlobUrl) URL.revokeObjectURL(feeReceiptBlobUrl);
      if (chargeReceiptBlobUrl) URL.revokeObjectURL(chargeReceiptBlobUrl);
    },
    [feeReceiptBlobUrl, chargeReceiptBlobUrl]
  );

  // ── Show skeleton while loading ─────────────────────────────────────────────
  if (collectFormLoading || collectFormFetching) {
    return <FeeCollectionFormSkeleton />;
  }

  // ── Fee Structure Not Assigned: show empty state ───────────────────────────
  const isFeeStructureAssigned = formData?.student?.isFeeStructureAssigned;

  const handleFeeStructureDialogClose = (_e: any, isSubmit: boolean) => {
    setFeeStructureDialogOpen(false);
    if (isSubmit) {
      refetchCollectForm();
    }
  };

  const showGeneratedReceiptDialog = async (collectResponse: CollectFeeOutput) => {
    setLastCollectResponse(collectResponse);
    const hasFeeReceipt = collectResponse.feeReceiptId;
    const hasChargeReceipt = collectResponse.chargeReceiptId;

    if (!hasFeeReceipt && !hasChargeReceipt) return false;

    // Set receipt preview state with fee and/or charge receipts
    setReceiptPreviewState({
      feeReceipt: hasFeeReceipt
        ? {
            id: collectResponse.feeReceiptId!,
            receiptNumber: collectResponse.feeReceiptNumber,
          }
        : null,
      chargeReceipt: hasChargeReceipt
        ? {
            id: collectResponse.chargeReceiptId!,
            receiptNumber: collectResponse.chargeReceiptNumber,
          }
        : null,
    });

    setFeeReceiptBlobUrl(null);
    setChargeReceiptBlobUrl(null);
    setReceiptDialogOpen(true);

    // Load PDFs for both receipts (if they exist)
    if (hasFeeReceipt) {
      await loadFeeReceiptPdf(collectResponse.feeReceiptId!);
    }
    if (hasChargeReceipt) {
      await loadChargeReceiptPdf(collectResponse.chargeReceiptId!);
    }

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
    anchor.download = `receipt-${receipt.receiptNumber ?? receipt.id}.pdf`;
    anchor.target = '_blank';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const handleReceiptDialogClose = () => {
    setReceiptDialogOpen(false);
    setReceiptPreviewState({ feeReceipt: null, chargeReceipt: null });
    setLastCollectResponse(null);
    if (feeReceiptBlobUrl) {
      URL.revokeObjectURL(feeReceiptBlobUrl);
      setFeeReceiptBlobUrl(null);
    }
    if (chargeReceiptBlobUrl) {
      URL.revokeObjectURL(chargeReceiptBlobUrl);
      setChargeReceiptBlobUrl(null);
    }
    // Return to parent table/list view after receipt flow is completed.
    onCancel?.(null, true);
  };

  if (isFeeStructureAssigned === false) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          minHeight: 400,
          gap: 2,
          textAlign: 'center',
          px: 3,
        }}
      >
        <Iconify
          icon="solar:document-add-bold-duotone"
          width={72}
          sx={{ color: 'text.disabled', mb: 1 }}
        />
        <Typography variant="h6" color="text.secondary">
          No Fee Structure Assigned
        </Typography>
        <Typography variant="body2" color="text.secondary" maxWidth={400}>
          A fee structure must be assigned to this student before collecting fees. Please assign a
          fee structure first.
        </Typography>
        <Button
          variant="contained"
          startIcon={<Iconify icon="solar:add-circle-bold" />}
          onClick={() => setFeeStructureDialogOpen(true)}
          sx={{ mt: 1 }}
        >
          Assign Fee Structure
        </Button>

        {/* Fee Structure Assignment Dialog */}
        <CustomDialog
          open={feeStructureDialogOpen}
          handleClose={() => setFeeStructureDialogOpen(false)}
          title={
            <Box display="flex" flexDirection="row" gap={1} alignItems="center">
              <Typography variant="h5">Assign Fee Structure</Typography>
              <CustomTooltip
                arrow
                placement="right"
                sx={{ textAlign: 'justify' }}
                title="Assign a fee structure to the student based on their selected class for accurate fee management and billing."
              >
                <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
              </CustomTooltip>
            </Box>
          }
          maxWidth="md"
        >
          <FeeStructureAssignmentForm
            student={
              formData?.student
                ? ({
                    studentId: formData.student.studentId,
                    standardId: formData.student.standardId,
                  } as any)
                : null
            }
            handleClose={handleFeeStructureDialogClose}
          />
        </CustomDialog>
      </Box>
    );
  }

  return (
    <Box
      component={motion.div}
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
      }}
    >
      <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
        {/* ── Main Content Area: 2-column grid ── */}
        <Box
          sx={{
            overflow: 'hidden',
            flex: 1,
            minHeight: 0,
            px: { xs: 1, md: 1.5 },
            pt: 1,
            display: 'grid',
            gap: { xs: 1.5, md: 1.5, lg: 0 },
            gridTemplateColumns: { xs: '1fr', md: '1fr', lg: '3fr 2fr' },
            gridTemplateRows: { xs: 'auto 1fr', md: 'auto 1fr', lg: 'auto' },
            alignItems: 'start',
          }}
        >
          {/* ═══════════ LEFT HALF: Student Card + Fee Timeline ═══════════ */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              minHeight: 0,
              height: '100%',
              pr: { lg: 0.75 },
              borderRight: (t) => ({ lg: `1px solid ${alpha(t.palette.divider, 0.3)}` }),
              width: '100%',
              overflow: 'hidden',
            }}
          >
            {/* Student Summary Card */}
            <Box mb={1}>
              <StudentFeeSummaryCard student={student} studentInfo={formData?.student} />
            </Box>

            <FeeLedgerFilterBar
              filters={filters}
              onFilterChange={setFilters}
              entryCount={entryCount}
              studentId={String(student?.id ?? '')}
            />

            {/* <Box mt={0.85}>
            <QuickActionToolbar
              ledgerData={ledgerData}
              chargesData={chargesData ?? []}
              selectedItems={formik.values.selectedItems}
              charges={formik.values.charges}
              currentYear={currentYear?.year ?? new Date().getFullYear()}
              onSelectionChange={handleSelectionChange}
              onChargesChange={handleChargesChange}
            />
          </Box> */}

            {formik.submitCount > 0 &&
              formik.values.selectedItems.length === 0 &&
              formik.values.charges.length === 0 && (
                <Typography variant="caption" color="error" sx={{ px: 0.5 }}>
                  Select at least one fee item or charge to collect
                </Typography>
              )}

            <Box mt={0.85} sx={{ flex: 1, minHeight: 0 }}>
              <Scrollbar sx={{ height: '100%', pr: 0.3 }}>
                <FeeLedgerList
                  data={filteredLedgerData}
                  activeTab={filters.activeTab}
                  selectedItems={formik.values.selectedItems}
                  charges={formik.values.charges}
                  chargesData={filteredChargesData}
                  hasActiveFilters={
                    filters.status !== 'All' || filters.month !== 'All' || filters.feeHead !== 'All'
                  }
                  onSelectionChange={handleSelectionChange}
                  onChargesChange={handleChargesChange}
                  year={currentYear?.year ?? new Date().getFullYear()}
                />
              </Scrollbar>
            </Box>
          </Box>

          {/* ═══════════ RIGHT HALF: Selected Fees (top) + Checkout (bottom) ═══════════ */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateRows: { xs: '1fr 1fr', md: '1fr 1fr', lg: '1fr 1fr' },
              minHeight: { xs: 'auto', md: 'auto', lg: '100%' },
              height: { lg: '100%' },
              pl: { lg: 0.75 },
              gap: 1.5,
              width: '100%',
              overflow: 'hidden',
            }}
          >
            {/* ── Selected Fees ── */}
            <Card
              component={motion.div}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              sx={{
                borderRadius: 1.5,
                bgcolor: 'background.paper',
                display: 'flex',
                flexDirection: 'column',
                p: { xs: 1.25, md: 1.5 },
                boxShadow: (t) => `var(--shadows-4)`,
                border: (t) => `1px solid ${alpha(t.palette.divider, 0.75)}`,
                minHeight: { xs: 200, md: 200, lg: 0 },
                maxHeight: { xs: '100%', md: '100%', lg: 'none' },
                overflow: 'hidden',
                width: '100%',
              }}
            >
              {/* Selected Fees header */}
              <Box
                display="flex"
                alignItems="center"
                justifyContent="space-between"
                px={0.5}
                pb={0.75}
                mb={1}
                sx={{ borderBottom: (t) => `1px solid ${alpha(t.palette.divider, 0.4)}` }}
              >
                <Typography
                  variant="overline"
                  color="text.secondary"
                  fontWeight={700}
                  letterSpacing={1.2}
                >
                  Selected Fees & Adjustments
                </Typography>
                {(formik.values.selectedItems.length > 0 || formik.values.charges.length > 0) && (
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={handleRemoveAll}
                    sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.75rem' }}
                  >
                    Clear all
                  </Button>
                )}
              </Box>

              {/* ── Staged for collection panel content ── */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  minHeight: 0,
                  overflow: 'hidden',
                }}
              >
                <Scrollbar sx={{ flex: 1, minHeight: 0, pr: 0.3 }}>
                  <Box>
                    {formik.values.selectedItems.length === 0 &&
                    formik.values.charges.length === 0 ? (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', textAlign: 'center', py: 1.5 }}
                      >
                        No fee items selected
                      </Typography>
                    ) : (
                      <>
                        {/* ── Sortable fee items ── */}
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={(event: DragEndEvent) => {
                            const { active, over } = event;
                            if (over && active.id !== over.id) {
                              const oldIdx = formik.values.selectedItems.findIndex(
                                (i) => `${i.feeHeadId}-${i.period}` === active.id
                              );
                              const newIdx = formik.values.selectedItems.findIndex(
                                (i) => `${i.feeHeadId}-${i.period}` === over.id
                              );
                              formik.setFieldValue(
                                'selectedItems',
                                arrayMove(formik.values.selectedItems, oldIdx, newIdx),
                                false
                              );
                            }
                          }}
                        >
                          <SortableContext
                            items={formik.values.selectedItems.map(
                              (i) => `${i.feeHeadId}-${i.period}`
                            )}
                            strategy={verticalListSortingStrategy}
                          >
                            {formik.values.selectedItems.map((item, idx) => (
                              <>
                                <SortableFeeRow
                                  key={`${item.feeHeadId}-${item.period}`}
                                  id={`${item.feeHeadId}-${item.period}`}
                                  label={feeHeadMap[item.feeHeadId] ?? item.feeHeadId}
                                  sub={dayjs(`${item.period}-01`).format('MMM YYYY')}
                                  amount={
                                    roundUpToRupee(item.dueAmount) + (item.lateFeeAmount ?? 0)
                                  }
                                  onRemove={() => {
                                    formik.setFieldValue(
                                      'selectedItems',
                                      formik.values.selectedItems.filter((_, i) => i !== idx),
                                      false
                                    );
                                  }}
                                />
                                {idx < formik.values.selectedItems.length - 1 && (
                                  <Divider sx={{ mx: 0.5 }} />
                                )}
                              </>
                            ))}
                          </SortableContext>
                        </DndContext>

                        {/* ── Sortable charges ── */}
                        {formik.values.charges.length > 0 && (
                          <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={(event: DragEndEvent) => {
                              const { active, over } = event;
                              if (over && active.id !== over.id) {
                                const oldIdx = formik.values.charges.indexOf(active.id as string);
                                const newIdx = formik.values.charges.indexOf(over.id as string);
                                formik.setFieldValue(
                                  'charges',
                                  arrayMove(formik.values.charges, oldIdx, newIdx),
                                  false
                                );
                              }
                            }}
                          >
                            <SortableContext
                              items={formik.values.charges}
                              strategy={verticalListSortingStrategy}
                            >
                              {(chargesData ?? [])
                                .filter((c) => formik.values.charges.includes(c.chargeId))
                                .map((charge, idx, arr) => (
                                  <>
                                    <SortableFeeRow
                                      key={charge.chargeId}
                                      id={charge.chargeId}
                                      label={charge.chargeName}
                                      amount={charge.amount}
                                      isCharge
                                      onRemove={() =>
                                        formik.setFieldValue(
                                          'charges',
                                          formik.values.charges.filter(
                                            (id) => id !== charge.chargeId
                                          ),
                                          false
                                        )
                                      }
                                    />
                                    {idx < arr.length - 1 && <Divider sx={{ mx: 0.5 }} />}
                                  </>
                                ))}
                            </SortableContext>
                          </DndContext>
                        )}
                      </>
                    )}
                  </Box>
                </Scrollbar>

                <Divider sx={{ my: 0.75 }} />
                <Box
                  px={0.5}
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  py={0.5}
                >
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700} color="primary.main">
                      Working Total
                    </Typography>
                    <Typography variant="caption" color="primary.main">
                      {formik.values.selectedItems.length + formik.values.charges.length} items
                      selected
                    </Typography>
                  </Box>
                  <Typography variant="subtitle1" fontWeight={700}>
                    ₹{formatNumber(subtotal)}
                  </Typography>
                </Box>
              </Box>
            </Card>
            {/* end Selected Fees */}

            {/* ── Checkout ── */}
            <Card
              component={motion.div}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              sx={{
                borderRadius: 1.5,
                bgcolor: 'background.paper',
                display: 'flex',
                flexDirection: 'column',
                p: { xs: 1.25, md: 1.5 },
                boxShadow: (t) => `var(--shadows-4)`,
                border: (t) => `1px solid ${alpha(t.palette.divider, 0.75)}`,
                flex: { xs: 'none', md: 'none', lg: 1 },
                minHeight: { xs: 'auto', md: 'auto', lg: 0 },
                maxHeight: { xs: '100%', md: '100%', lg: 'none' },
                overflow: 'hidden',
                width: '100%',
                mb: { xs: 0, md: 0, lg: 1 },
              }}
            >
              {/* Checkout header */}
              <Box
                pb={0.75}
                mb={1.5}
                sx={{ borderBottom: (t) => `1px solid ${alpha(t.palette.divider, 0.4)}` }}
              >
                <Typography
                  variant="overline"
                  color="text.secondary"
                  fontWeight={700}
                  letterSpacing={1.2}
                >
                  Checkout
                </Typography>
              </Box>

              <Box sx={{ flex: 1, minHeight: 0 }}>
                <Scrollbar sx={{ height: '100%', pr: 0.35 }}>
                  <Box>
                    {/* ── Payment Summary Header ── */}
                    <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                      <Iconify
                        icon="solar:shield-check-bold"
                        sx={{ color: 'success.main', width: 22 }}
                      />
                      <Typography variant="subtitle2" fontWeight={700}>
                        Payment Summary
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary" mb={1} display="block">
                      Receipt will be generated on collection
                    </Typography>
                    <Divider sx={{ mb: 1.25 }} />

                    {/* ── Summary Rows ── */}
                    <SummaryRow
                      label="Items selected"
                      value={`${formik.values.selectedItems.length + formik.values.charges.length} items`}
                    />
                    <SummaryRow label="Subtotal" value={`₹ ${formatNumber(subtotal)}`} />
                    <Divider sx={{ my: 1 }} />
                    <SummaryRow
                      label="Total Payable"
                      value={`₹ ${formatNumber(finalAmount)}`}
                      bold
                      large
                      color="text.primary"
                    />

                    <Divider sx={{ my: 1.5 }} />

                    {/* ── Payment Method Dropdown (config-driven, matches refund form) ── */}
                    <ShakingTextField
                      error={
                        !!(
                          (formik.touched.payment?.paymentMethod || formik.submitCount > 0) &&
                          formik.errors.payment?.paymentMethod
                        )
                      }
                    >
                      <TextField
                        select
                        fullWidth
                        size="small"
                        label="Payment Method *"
                        name="payment.paymentMethod"
                        value={formik.values.payment.paymentMethod}
                        disabled={finalAmount === 0}
                        onChange={(e) => {
                          handlePaymentMethodChange(e.target.value);
                          formik.setFieldTouched('payment.paymentMethod', true);
                        }}
                        onBlur={formik.handleBlur}
                        error={
                          !!(
                            (formik.touched.payment?.paymentMethod || formik.submitCount > 0) &&
                            formik.errors.payment?.paymentMethod
                          )
                        }
                        helperText={
                          ((formik.touched.payment?.paymentMethod || formik.submitCount > 0) &&
                            (formik.errors.payment?.paymentMethod as string)) ||
                          ''
                        }
                        sx={{ mb: 1.5 }}
                      >
                        {availablePaymentMethods.map((method) => (
                          <MenuItem key={method} value={method}>
                            {method.charAt(0).toUpperCase() + method.slice(1)}
                          </MenuItem>
                        ))}
                      </TextField>
                    </ShakingTextField>

                    {/* ── Amount Tendered ── */}
                    {formik.values.payment.paymentMethod && (
                      <Box
                        component={motion.div}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.22 }}
                        mt={1}
                      >
                        <Typography
                          variant="overline"
                          fontWeight={700}
                          color="text.secondary"
                          mb={2}
                          display="block"
                        >
                          Amount Tendered
                        </Typography>
                        <ShakingTextField
                          error={Boolean(
                            (formik.touched.payment?.amount || formik.submitCount > 0) &&
                            formik.errors.payment?.amount
                          )}
                        >
                          <NumericFormatCustom
                            fullWidth
                            size="small"
                            label="Amount *"
                            value={formik.values.payment.amount ?? ''}
                            onChange={(e: any) => {
                              const raw = e.target.value.replace(/[₹,\s]/g, '');
                              updatePayment('amount', raw);
                            }}
                            error={Boolean(
                              (formik.touched.payment?.amount || formik.submitCount > 0) &&
                              formik.errors.payment?.amount
                            )}
                            helperText={
                              formik.touched.payment?.amount || formik.submitCount > 0
                                ? (formik.errors.payment?.amount as string)
                                : ''
                            }
                          />
                        </ShakingTextField>
                        <Grid container spacing={3} mt={3}>
                          {/* Extra payment details (cheque, upi, etc.) */}
                          {(
                            paymentMethodsConfig[
                              formik.values.payment
                                .paymentMethod as keyof typeof paymentMethodsConfig
                            ] ?? []
                          )
                            .filter((field: IPaymentFieldConfig) => field.name !== 'amount')
                            .map((field: IPaymentFieldConfig) => {
                              const fieldPath = `payment.details.${field.name}`;
                              const isBankAccountField = field.name === 'bankAccount';
                              const selectOptions = isBankAccountField
                                ? bankAccountOptions
                                : (field.options ?? []);
                              const value = formik.values.payment.details[field.name];
                              const error = (formik.errors.payment?.details as any)?.[field.name];
                              const touched = (formik.touched.payment?.details as any)?.[
                                field.name
                              ];

                              return (
                                <Grid
                                  size={{ xs: 12, sm: 6 }}
                                  key={`${formik.values.payment.paymentMethod}-${field.name}`}
                                >
                                  <ShakingTextField
                                    error={Boolean((touched || formik.submitCount > 0) && error)}
                                  >
                                    {field.type === 'date' ? (
                                      <DatePicker
                                        label={`${field.label} *`}
                                        format="DD/MM/YYYY"
                                        value={value ? dayjs(value) : null}
                                        onChange={(date) => formik.setFieldValue(fieldPath, date)}
                                        sx={{ width: '100%' }}
                                        slotProps={{
                                          textField: {
                                            size: 'small',
                                            fullWidth: true,
                                            error: Boolean(
                                              (touched || formik.submitCount > 0) && error
                                            ),
                                            helperText:
                                              (touched || formik.submitCount > 0) &&
                                              typeof error === 'string'
                                                ? error
                                                : '',
                                          },
                                        }}
                                        disablePast
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
                                        error={Boolean(
                                          (touched || formik.submitCount > 0) && error
                                        )}
                                        helperText={
                                          (touched || formik.submitCount > 0) &&
                                          typeof error === 'string'
                                            ? error
                                            : isBankAccountField && isBankAccountsBusy
                                              ? 'Loading bank accounts...'
                                              : isBankAccountField && selectOptions.length === 0
                                                ? 'No bank accounts available'
                                                : ''
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
                                        error={Boolean(
                                          (touched || formik.submitCount > 0) && error
                                        )}
                                        helperText={
                                          (touched || formik.submitCount > 0) &&
                                          typeof error === 'string'
                                            ? error
                                            : ''
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
                                        error={Boolean(
                                          (touched || formik.submitCount > 0) && error
                                        )}
                                        helperText={
                                          (touched || formik.submitCount > 0) &&
                                          typeof error === 'string'
                                            ? error
                                            : ''
                                        }
                                        inputProps={
                                          field.type === 'number'
                                            ? { min: field.min, max: field.max }
                                            : {}
                                        }
                                      />
                                    )}
                                  </ShakingTextField>
                                </Grid>
                              );
                            })}
                        </Grid>
                      </Box>
                    )}

                    {/* ── Change / Balance Box ── */}
                    {formik.values.payment.paymentMethod && (
                      <Box
                        mt={1.5}
                        p={1.1}
                        sx={{
                          borderRadius: 1.25,
                          border: (t) => `1px solid ${alpha(t.palette.divider, 0.7)}`,
                          bgcolor:
                            balancePaise === 0
                              ? alpha(theme.palette.success.main, 0.08)
                              : balancePaise > 0
                                ? alpha(theme.palette.warning.main, 0.08)
                                : alpha(theme.palette.error.main, 0.08),
                        }}
                      >
                        <Box display="flex" justifyContent="space-between">
                          <Typography variant="caption" color="text.secondary">
                            Change / Balance
                          </Typography>
                          <Typography
                            variant="caption"
                            fontWeight={700}
                            sx={{ fontVariantNumeric: 'tabular-nums' }}
                            color={
                              balancePaise === 0
                                ? 'success.main'
                                : balancePaise > 0
                                  ? 'warning.main'
                                  : 'error.main'
                            }
                          >
                            ₹ {formatNumber(Math.abs(balance))}
                          </Typography>
                        </Box>
                        <Box display="flex" justifyContent="space-between" mt={0.25}>
                          <Typography variant="caption" color="text.secondary">
                            Overall Outstanding
                          </Typography>
                          <Typography
                            variant="caption"
                            fontWeight={600}
                            sx={{ fontVariantNumeric: 'tabular-nums' }}
                          >
                            ₹ {formatNumber(overallOutstanding)}
                          </Typography>
                        </Box>
                      </Box>
                    )}
                  </Box>
                </Scrollbar>
              </Box>
            </Card>
            {/* end Checkout */}
          </Box>
          {/* end Right Half */}
        </Box>
        {/* end 2-col grid */}
      </BackPopUpChecked>
      {/* ── Bottom Actions ── */}
      <DialogActions
        sx={{
          px: { xs: 1, md: 1.5 },
          py: 0.9,
          mt: 0,
          borderTop: (t) => `1px solid ${alpha(t.palette.grey[500], 0.16)}`,
          flexShrink: 0,
          backdropFilter: 'blur(6px)',
        }}
      >
        <Box display="flex" justifyContent="flex-end" gap={1} alignItems="center" width="100%">
          {showOverAllocationWarning && (
            <Box flex={2} display="flex" justifyContent="center" ml={4}>
              <Typography variant="caption" color="error" textAlign="center">
                Total allocated <strong>(₹ {formatNumber(totalAllocated)})</strong> exceeds the
                payable amount <strong>(₹{formatNumber(finalAmount)})</strong>. Please reduce
                payment amounts.
              </Typography>
            </Box>
          )}

          <Button
            variant="outlined"
            color="inherit"
            onClick={() => onCancel?.(null, false)}
            disabled={collectLoading}
            size="small"
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
            sx={{ minWidth: 88 }}
          >
            Cancel
          </Button>
          <LoadingButton
            variant="contained"
            size="small"
            loading={collectLoading}
            onClick={(e: any) => formik.handleSubmit(e)}
            startIcon={<Iconify icon="solar:check-circle-bold" width={18} />}
            sx={{
              fontWeight: 700,
              bgcolor: 'success.dark',
              color: 'common.white',
              '&:hover': { bgcolor: 'success.darker' },
              textTransform: 'none',
              minWidth: 150,
            }}
          >
            Collect Payment
          </LoadingButton>
        </Box>
      </DialogActions>

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
              <Card sx={{ p: 2, bgcolor: alpha(theme.palette.info.main, 0.08) }}>
                <Box display="flex" justifyContent="space-between" alignItems="start">
                  <Box>
                    <Typography variant="subtitle2" fontWeight={700} mb={0.5}>
                      Payment Summary
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Student : <strong>{resolvedStudentName}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Collected at :{' '}
                      <strong>
                        {new Date(lastCollectResponse.collectedAt).toLocaleString('en-IN')}
                      </strong>
                    </Typography>
                  </Box>
                  <Box textAlign="right">
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      sx={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      ₹{formatNumber(lastCollectResponse.totalAmount)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                      Total Received
                    </Typography>
                  </Box>
                </Box>
              </Card>
            )}

            {/* Unified Receipt Display */}
            <UnifiedReceiptDisplay
              feeReceipt={feeReceiptData}
              chargeReceipt={chargeReceiptData}
              feeIsLoading={false}
              chargeIsLoading={false}
              feeBlobUrl={feeReceiptBlobUrl}
              chargeBlobUrl={chargeReceiptBlobUrl}
              onOpenFeeInNewTab={() => handleOpenReceiptInNewTab(feeReceiptBlobUrl)}
              onDownloadFee={() =>
                handleDownloadReceipt(receiptPreviewState.feeReceipt, feeReceiptBlobUrl)
              }
              onOpenChargeInNewTab={() => handleOpenReceiptInNewTab(chargeReceiptBlobUrl)}
              onDownloadCharge={() =>
                handleDownloadReceipt(receiptPreviewState.chargeReceipt, chargeReceiptBlobUrl)
              }
            />

            {/* Outcome Panel (if available) */}
            {lastCollectResponse?.auditSummary && (
              <FeeCollectionOutcomePanel collectResponse={lastCollectResponse} />
            )}
          </Box>
        </Scrollbar>
        <DialogActions sx={{ borderTop: (t) => `1px solid ${alpha(t.palette.divider, 0.45)}` }}>
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
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onConfirm={handlePreviewConfirm}
        loading={false}
        formValues={formik.values}
        student={student}
        chargesData={chargesData ?? []}
        feeHeadMap={feeHeadMap}
        academicYear={
          currentYear?.name || (currentYear?.year ? String(currentYear.year) : undefined)
        }
        bankAccounts={bankAccountOptions}
      />

      {/* ── Final Payment Review Dialog ── */}
      <FinalPaymentReviewDialog
        open={finalReviewOpen}
        onClose={() => setFinalReviewOpen(false)}
        onConfirmCollect={handleFinalCollect}
        onSavePending={handleSavePending}
        loading={collectLoading}
        formValues={formik.values}
        student={student}
        bankAccounts={bankAccountOptions}
      />
    </Box>
  );
};

export default FeeCollectComponentForm;
