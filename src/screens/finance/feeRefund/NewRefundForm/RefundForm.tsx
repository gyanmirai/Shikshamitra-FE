import type { RootState } from 'src/redux/store';

import { useFormik } from 'formik';
import { motion } from 'framer-motion';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { useSession } from 'next-auth/react';
import { GlobalIcons } from 'src/utils/icons';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import React, { useMemo, useEffect } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { formatNumber } from 'src/utils/formate_number';
import { shikshaMitraToast } from 'src/components/toast';
import { FeeMonth } from 'src/enums/fee-collection-type';
import { hasGrantedPermission } from 'src/utils/permissions';
import { financePermissions } from 'src/constants/finance-menu';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { FormSectionCard } from 'src/components/form-section-card';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { isFinanceAdministratorSession } from 'src/utils/finance-admin-auto-approval';
import {
  Box,
  Chip,
  Alert,
  Stack,
  Button,
  Divider,
  Skeleton,
  Typography,
  DialogActions,
} from '@mui/material';
import {
  useGetFeeRefundByIdQuery,
  type FeeRefundRequestDto,
  type FeeRefundPreviewDto,
  type RefundEligibilityDto,
  useCreateFeeRefundMutation,
  useSubmitFeeRefundMutation,
  useUpdateFeeRefundMutation,
  usePreviewFeeRefundMutation,
  useGetRefundEligibilityQuery,
  useLazyGetRefundEligibilityQuery,
} from 'src/redux/finance/RefundManagement/feeRefundManage';

import RefundFormSkeleton from './RefundFormSkeleton';
import FeeRefundDetailsForm from './FeeRefundDetailForm';
import RefundGeneralInfoCard from './RefundGeneralInfoCard';
import { getRefundPrerequisite } from './refundPrerequisites';
import FinancePrerequisiteState from '../../components/FinancePrerequisiteState';
import { normalizeRefundMethod, isAllowedRefundMethod } from './refundPayoutMethods';
import { useRefreshFinancePrerequisites } from '../../hooks/useRefreshFinancePrerequisites';
import {
  isValidRefundAmount,
  refundAllocationLabel,
  buildRefundInitialValues,
  buildFeeRefundApiPayload,
  buildRefundValidationSchema,
} from './initialValuesAndValidation';

import type { IFeeHeadRefundItem } from './initialValuesAndValidation';

interface FeeRefundFormProps {
  onCancel?: (e: any, isSubmit: boolean) => void;
  onBusyChange?: (busy: boolean) => void;
  loading?: boolean;
  defaultBoardId?: string;
  defaultMediumId?: string;
  defaultStandardId?: string;
  defaultDivisionId?: string;
  isEdit?: boolean;
  editRefundId?: string;
  replacementRefundId?: string;
}

const FeeRefundFormComponent = ({
  onCancel,
  onBusyChange,
  loading = false,
  defaultBoardId = '',
  defaultMediumId = '',
  defaultStandardId = '',
  defaultDivisionId = '',
  isEdit = false,
  editRefundId,
  replacementRefundId,
}: FeeRefundFormProps): React.ReactElement => {
  const { data: session, status: sessionStatus } = useSession();
  const isAdminCreator = isFinanceAdministratorSession(session);
  const refundPermissions = useSelector((state: RootState) => state.auth.permissions);
  const adminCanApprove = hasGrantedPermission(
    refundPermissions,
    financePermissions.fees.refundActions.approve
  );
  const [adminConfirmation, setAdminConfirmation] = React.useState<{
    fingerprint: string;
    studentName: string;
    amount: number;
    method: string;
    receiptNumber: string;
  } | null>(null);
  const confirmedAdminFingerprint = React.useRef<string | null>(null);
  const [submissionPrerequisite, setSubmissionPrerequisite] = React.useState<{
    studentId: string;
    academicYearId: string;
    key: NonNullable<ReturnType<typeof getRefundPrerequisite>>;
  } | null>(null);
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  // List filters may refresh while the request is being edited.
  const [openingScope] = React.useState(() => ({
    defaultBoardId,
    defaultMediumId,
    defaultStandardId,
    defaultDivisionId,
  }));
  const theme = useTheme();
  const sourceRefundId = replacementRefundId || editRefundId;
  const hasSourceRefund = isEdit || Boolean(replacementRefundId);
  const requestKey = React.useRef(crypto.randomUUID());
  const [loadingEditData, setLoadingEditData] = React.useState(hasSourceRefund);
  const [hydratedEditKey, setHydratedEditKey] = React.useState('');
  const [editEligibilityError, setEditEligibilityError] = React.useState(false);
  const [editLoadAttempt, setEditLoadAttempt] = React.useState(0);
  const [reviewedPreview, setReviewedPreview] = React.useState<{
    fingerprint: string;
    result: FeeRefundPreviewDto;
  } | null>(null);
  const submitIntent = React.useRef<'draft' | 'submit'>('submit');
  const [createFeeRefund, { isLoading: isSubmitting }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCreateFeeRefundMutation,
    popupConfig: { error: false },
  });
  const [updateFeeRefund, { isLoading: isUpdating }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateFeeRefundMutation,
    popupConfig: { error: false },
  });
  const [previewFeeRefund, { isLoading: isPreviewing }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePreviewFeeRefundMutation,
    popupConfig: { error: false },
  });
  const [submitFeeRefund, { isLoading: isSubmittingDraft }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useSubmitFeeRefundMutation,
    popupConfig: { error: false },
  });
  const {
    currentData: editRefundDetail,
    isLoading: editLoading,
    isFetching: editFetching,
    isError: editError,
    refetch: refetchEdit,
  } = useGetFeeRefundByIdQuery(sourceRefundId ?? '', {
    skip: !hasSourceRefund || !sourceRefundId,
    refetchOnMountOrArgChange: true,
  });

  const [getRefundEligibility] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetRefundEligibilityQuery,
  });

  const [prefilledFeeHeadRefunds, setPrefilledFeeHeadRefunds] = React.useState<
    IFeeHeadRefundItem[]
  >([]);

  useEffect(() => {
    let cancelled = false;
    const loadEditMonths = async () => {
      if (!hasSourceRefund || !sourceRefundId) {
        setPrefilledFeeHeadRefunds([]);
        setLoadingEditData(false);
        return;
      }

      if (!currentYear?.id || !editRefundDetail?.studentId) {
        setPrefilledFeeHeadRefunds([]);
        setLoadingEditData(true);
        return;
      }

      setLoadingEditData(true);
      setEditEligibilityError(false);
      const detail = editRefundDetail as FeeRefundRequestDto;
      const lineAmountByAllocationId = new Map<string, number>(
        (detail.lines || []).map((line) => [
          line.sourceAllocationId || line.dueFeeId || line.chargeId || '',
          Number(line.amount) || 0,
        ])
      );

      try {
        const eligibility = (await getRefundEligibility({
          studentId: detail.studentId,
          academicYearId: currentYear.id,
        }).unwrap()) as RefundEligibilityDto;

        const mappedFeeHeads: IFeeHeadRefundItem[] = (eligibility?.feeHeads || [])
          .map((feeHead) => {
            const months = (feeHead.months || [])
              .filter((m) => lineAmountByAllocationId.has(m.sourceAllocationId))
              .map((m) => ({
                dueFeeId: m.dueFeeId ?? '',
                chargeId: m.chargeId ?? undefined,
                lateFeeDueFeeId: m.lateFeeDueFeeId ?? undefined,
                sourceAllocationId: m.sourceAllocationId,
                sourceReceiptId: m.sourceReceiptId,
                month: m.chargeName
                  ? `${m.chargeName} · ${m.receiptNumber}${feeHead.months.filter((other) => other.month === m.month && other.year === m.year && other.receiptNumber === m.receiptNumber).length > 1 ? ` · allocation ${m.sourceAllocationId.slice(0, 8)}` : ''}`
                  : refundAllocationLabel(
                      FeeMonth[m.month] ?? `Month ${m.month}`,
                      m.year,
                      m.receiptNumber,
                      m.sourceAllocationId,
                      feeHead.months.filter(
                        (other) =>
                          other.month === m.month &&
                          other.year === m.year &&
                          other.receiptNumber === m.receiptNumber
                      ).length > 1
                    ),
                amount: lineAmountByAllocationId.get(m.sourceAllocationId) ?? 0,
              }));

            return {
              feeHeadId:
                feeHead.feeHeadId ??
                (feeHead.months.some((m) => m.lateFeeDueFeeId) ? 'paid-late-fees' : 'paid-charges'),
              months,
            };
          })
          .filter((feeHead) => feeHead.months.length > 0);

        if (cancelled) return;
        setPrefilledFeeHeadRefunds(mappedFeeHeads);
      } catch (_err) {
        if (cancelled) return;
        if (replacementRefundId && detail.concessionRequestId) {
          const byHead = new Map<string, IFeeHeadRefundItem>();
          detail.lines.forEach((line) => {
            if (!line.sourceAllocationId || !line.sourceReceiptId) return;
            const item = byHead.get(
              line.feeHeadId ?? (line.lateFeeDueFeeId ? 'paid-late-fees' : 'paid-charges')
            ) ?? {
              feeHeadId:
                line.feeHeadId ?? (line.lateFeeDueFeeId ? 'paid-late-fees' : 'paid-charges'),
              months: [],
            };
            item.months.push({
              dueFeeId: line.dueFeeId ?? '',
              chargeId: line.chargeId ?? undefined,
              lateFeeDueFeeId: line.lateFeeDueFeeId ?? undefined,
              sourceAllocationId: line.sourceAllocationId,
              sourceReceiptId: line.sourceReceiptId,
              month: line.installmentLabel || line.feeHeadName || 'Paid fee',
              amount: line.approvedAmount,
            });
            byHead.set(
              line.feeHeadId ?? (line.lateFeeDueFeeId ? 'paid-late-fees' : 'paid-charges'),
              item
            );
          });
          setPrefilledFeeHeadRefunds(Array.from(byHead.values()));
        } else {
          setEditEligibilityError(true);
        }
      } finally {
        if (!cancelled) {
          setHydratedEditKey(`${sourceRefundId}:${currentYear.id}`);
          setLoadingEditData(false);
        }
      }
    };

    loadEditMonths();
    return () => {
      cancelled = true;
    };
  }, [
    editLoadAttempt,
    hasSourceRefund,
    sourceRefundId,
    replacementRefundId,
    currentYear?.id,
    editRefundDetail,
    getRefundEligibility,
  ]);

  const formInitialValues = useMemo(
    () =>
      buildRefundInitialValues({
        boardId: hasSourceRefund
          ? ((editRefundDetail as FeeRefundRequestDto | undefined)?.boardId ??
            openingScope.defaultBoardId)
          : openingScope.defaultBoardId,
        mediumId: hasSourceRefund
          ? ((editRefundDetail as FeeRefundRequestDto | undefined)?.educationMediumId ??
            openingScope.defaultMediumId)
          : openingScope.defaultMediumId,
        standardId: hasSourceRefund
          ? ((editRefundDetail as FeeRefundRequestDto | undefined)?.standardId ??
            openingScope.defaultStandardId)
          : openingScope.defaultStandardId,
        divisionId: hasSourceRefund
          ? ((editRefundDetail as FeeRefundRequestDto | undefined)?.divisionId ??
            openingScope.defaultDivisionId)
          : openingScope.defaultDivisionId,
        studentId: hasSourceRefund
          ? ((editRefundDetail as FeeRefundRequestDto | undefined)?.studentId ?? '')
          : '',
        studentName: hasSourceRefund
          ? ((editRefundDetail as FeeRefundRequestDto | undefined)?.studentName ?? '')
          : '',
        refundMethod: isEdit
          ? normalizeRefundMethod(
              (editRefundDetail as FeeRefundRequestDto | undefined)?.refundMethod ?? ''
            )
          : '',
        notes: hasSourceRefund
          ? ((editRefundDetail as FeeRefundRequestDto | undefined)?.reason ?? '')
          : '',
        paymentDetails: isEdit
          ? ((editRefundDetail as FeeRefundRequestDto | undefined)?.paymentDetails ?? {})
          : {},
        feeHeadRefunds: hasSourceRefund ? prefilledFeeHeadRefunds : [],
      }),
    [openingScope, isEdit, hasSourceRefund, editRefundDetail, prefilledFeeHeadRefunds]
  );

  const formik = useFormik({
    initialValues: formInitialValues,
    validationSchema: buildRefundValidationSchema(currentYear),
    enableReinitialize: true,
    validateOnBlur: true,
    validateOnChange: true,
    onSubmit: async (values, helpers) => {
      if (activeSubmissionPrerequisite) return;
      if (!hasSourceRefund && !refundCanSubmit) {
        shikshaMitraToast.error({
          message: 'Choose a student with refundable paid fees before submitting.',
        });
        return;
      }
      if (sessionStatus === 'loading') {
        shikshaMitraToast.error({ message: 'Wait for your role to finish loading.' });
        return;
      }
      if (!currentYear?.id) {
        shikshaMitraToast.error({ message: 'Academic year not set. Please reload and try again.' });
        return;
      }
      const allowedMethods =
        isEdit || (replacementRefundId && editRefundDetail?.concessionRequestId)
          ? editRefundDetail?.allowedPayoutMethods
          : refundEligibility.currentData?.allowedPayoutMethods;
      if (!isAllowedRefundMethod(values.refundMethod, allowedMethods)) {
        helpers.setFieldError(
          'refundMethod',
          'Choose a payment method allowed by the linked refund policy.'
        );
        return;
      }
      try {
        const payload = buildFeeRefundApiPayload(values, currentYear.id);
        if (payload.lines.length === 0) {
          shikshaMitraToast.error({ message: 'Enter a refund amount for at least one month.' });
          return;
        }
        if (!(replacementRefundId && editRefundDetail?.concessionRequestId)) {
          const fingerprint = JSON.stringify(payload);
          const latest = await previewFeeRefund({
            ...payload,
            idempotencyKey: requestKey.current,
          }).unwrap();
          if (!latest.isAllowed || latest.maximumAllowedAmount <= 0) {
            setReviewedPreview({ fingerprint, result: latest });
            shikshaMitraToast.error({
              message: 'This refund is not eligible under the assigned policy.',
            });
            return;
          }
          setReviewedPreview({ fingerprint, result: latest });
          if (isAdminCreator && confirmedAdminFingerprint.current !== fingerprint) {
            if (!adminCanApprove) {
              shikshaMitraToast.error({
                message:
                  'Approve permission is required to create an automatically approved refund.',
              });
              return;
            }
            setAdminConfirmation({
              fingerprint,
              studentName: values.studentName,
              amount: latest.maximumAllowedAmount,
              method: values.refundMethod,
              receiptNumber:
                values.feeHeadRefunds
                  .flatMap((feeHead) => feeHead.months)
                  .find((month) => Number(month.amount) > 0)?.receiptNumber ?? '',
            });
            return;
          }
        } else if (isAdminCreator) {
          const fingerprint = JSON.stringify(payload);
          if (confirmedAdminFingerprint.current !== fingerprint) {
            if (!adminCanApprove) {
              shikshaMitraToast.error({
                message:
                  'Approve permission is required to create an automatically approved refund.',
              });
              return;
            }
            setAdminConfirmation({
              fingerprint,
              studentName: values.studentName,
              amount: payload.lines.reduce((sum, line) => sum + line.amount, 0),
              method: values.refundMethod,
              receiptNumber: editRefundDetail?.originalReceiptNumber ?? '',
            });
            return;
          }
        }
        if (isEdit && editRefundId) {
          await updateFeeRefund({ id: editRefundId, body: payload }).unwrap();
          if (submitIntent.current === 'submit') {
            const submitted = await submitFeeRefund(editRefundId).unwrap();
            if (isAdminCreator && submitted.status !== 2) {
              shikshaMitraToast.warning({
                message: 'Refund request is Pending. Automatic approval did not occur.',
              });
            } else {
              shikshaMitraToast.success({
                message:
                  submitted.status === 2
                    ? 'Refund request approved. Record the payout separately.'
                    : 'Refund request submitted successfully.',
              });
            }
          } else {
            shikshaMitraToast.success({ message: 'Refund draft updated successfully.' });
          }
        } else {
          const created = await createFeeRefund({
            ...payload,
            idempotencyKey: requestKey.current,
            replacesRefundRequestId: replacementRefundId,
          }).unwrap();
          if (isAdminCreator && created.status !== 2) {
            shikshaMitraToast.warning({
              message: 'Refund request is Pending. Automatic approval did not occur.',
            });
          } else {
            shikshaMitraToast.success({
              message:
                created.status === 2
                  ? 'Refund request approved. Record the payout separately.'
                  : 'Refund request submitted successfully.',
            });
          }
        }

        confirmedAdminFingerprint.current = null;
        helpers.resetForm();
        requestKey.current = crypto.randomUUID();
        onCancel?.(null, true);
      } catch (err: any) {
        confirmedAdminFingerprint.current = null;
        const prerequisite = getRefundPrerequisite({ error: err });
        if (prerequisite)
          setSubmissionPrerequisite({
            studentId: values.studentId,
            academicYearId: currentYear.id,
            key: prerequisite,
          });
        const parsed = parseApiProblemDetail(err);
        const message =
          err?.status === 500 && parsed.detail === 'The request failed.'
            ? 'The refund request could not be checked. Please try again or contact support.'
            : parsed.detail;
        shikshaMitraToast.error({ message });
      }
    },
  });

  const refundEligibility = useGetRefundEligibilityQuery(
    { studentId: formik.values.studentId, academicYearId: currentYear?.id ?? '' },
    {
      refetchOnMountOrArgChange: true,
      skip:
        isEdit ||
        Boolean(replacementRefundId && editRefundDetail?.concessionRequestId) ||
        !formik.values.studentId ||
        !currentYear?.id,
    }
  );
  const refundCanSubmit = Boolean(
    refundEligibility.currentData &&
    !refundEligibility.isFetching &&
    !refundEligibility.isError &&
    refundEligibility.currentData.totalRefundable > 0 &&
    refundEligibility.currentData.feeHeads.some((head) =>
      head.months.some((month) => month.refundable > 0)
    )
  );
  const eligibilityPrerequisite =
    !hasSourceRefund && formik.values.studentId
      ? getRefundPrerequisite(refundEligibility)
      : undefined;
  const activeSubmissionPrerequisite =
    submissionPrerequisite?.studentId === formik.values.studentId &&
    submissionPrerequisite.academicYearId === currentYear?.id
      ? submissionPrerequisite.key
      : undefined;
  const prerequisite = activeSubmissionPrerequisite ?? eligibilityPrerequisite;
  const refreshPrerequisites = () => {
    setSubmissionPrerequisite(null);
    if (!refundEligibility.isUninitialized) refundEligibility.refetch();
  };
  useRefreshFinancePrerequisites(
    refreshPrerequisites,
    Boolean(formik.values.studentId && currentYear?.id)
  );
  useEffect(() => {
    formik.resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentYear?.id]);
  const currentFingerprint = currentYear?.id
    ? JSON.stringify(buildFeeRefundApiPayload(formik.values, currentYear.id))
    : '';
  const currentPreview =
    reviewedPreview?.fingerprint === currentFingerprint ? reviewedPreview.result : null;
  // ── Derived totals for sticky footer ────────────────────────────────────────
  const { totalSelectedMonths, totalRefundRequested, incompleteRefundMonths } = useMemo(() => {
    const refunds = formik.values.feeHeadRefunds as IFeeHeadRefundItem[];
    let months = 0;
    let total = 0;
    let incomplete = 0;
    refunds.forEach((fh) => {
      fh.months.forEach((m) => {
        months += 1;
        if (isValidRefundAmount(m.amount)) total += Number(m.amount);
        else incomplete += 1;
      });
    });
    return {
      totalSelectedMonths: months,
      totalRefundRequested: total,
      incompleteRefundMonths: incomplete,
    };
  }, [formik.values.feeHeadRefunds]);

  const editLoadError = hasSourceRefund && (editError || editEligibilityError);
  const showSkeleton =
    hasSourceRefund &&
    !editLoadError &&
    (editLoading ||
      editFetching ||
      loadingEditData ||
      !editRefundDetail ||
      hydratedEditKey !== `${sourceRefundId}:${currentYear?.id}`);
  const busy =
    loading ||
    isSubmitting ||
    isUpdating ||
    isPreviewing ||
    isSubmittingDraft ||
    formik.isSubmitting;

  useEffect(() => {
    onBusyChange?.(busy);
  }, [busy, onBusyChange]);
  useEffect(() => () => onBusyChange?.(false), [onBusyChange]);

  return (
    <Box
      component={motion.form}
      onSubmit={formik.handleSubmit}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      display="flex"
      flexDirection="column"
      height="100%"
    >
      {/* ── Scrollable content ── */}
      <Scrollbar fillContent sx={{ flex: 1, minHeight: 0 }}>
        <Box sx={{ p: { xs: 1, md: 2 }, pb: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
          <FormBusyRegion fillContent busy={busy} label="Checking and submitting refund…">
            <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
              {editLoadError ? (
                <Alert
                  severity="error"
                  action={
                    <Button
                      color="inherit"
                      size="small"
                      onClick={() => {
                        if (editError) refetchEdit();
                        else setEditLoadAttempt((attempt) => attempt + 1);
                      }}
                    >
                      Retry
                    </Button>
                  }
                >
                  Unable to load the refund request. Try again.
                </Alert>
              ) : showSkeleton ? (
                <RefundFormSkeleton />
              ) : (
                <Stack spacing={1} sx={{ flex: 1 }}>
                  {/* ── Student Information Card ── */}
                  <FormSectionCard
                    descriptionTooltip="Select the student's board, medium, class and division for the current academic year, then choose the student. Refund eligibility comes from paid fees and the linked refund policy."
                    title="Student information"
                    icon="solar:users-group-rounded-bold-duotone"
                  >
                    <RefundGeneralInfoCard formik={formik} disabled={hasSourceRefund} />
                  </FormSectionCard>

                  {/* ── Fee Refund Details ── */}
                  {prerequisite ? (
                    <FinancePrerequisiteState
                      requirements={[{ key: prerequisite }]}
                      onRefresh={refreshPrerequisites}
                    />
                  ) : (
                    <FeeRefundDetailsForm
                      formik={formik}
                      allowedPayoutMethods={
                        isEdit || (replacementRefundId && editRefundDetail?.concessionRequestId)
                          ? editRefundDetail?.allowedPayoutMethods
                          : undefined
                      }
                    />
                  )}
                </Stack>
              )}
            </BackPopUpChecked>
          </FormBusyRegion>
        </Box>
      </Scrollbar>

      {/* ── Sticky Finance Action Bar ── */}
      <Box
        sx={{
          flexShrink: 0,
          borderTop: `1px solid ${theme.palette.divider}`,
          backdropFilter: 'blur(12px)',
          px: { xs: 2, md: 3 },
          py: 1.5,
        }}
      >
        {currentPreview && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
            <strong>Calculated refund:</strong> {currentPreview.refundPolicyName} · Requested{' '}
            {formatNumber(currentPreview.requestedAmount, 'INR')} · Deduction{' '}
            {formatNumber(currentPreview.deductionAmount, 'INR')} · Cap adjustment{' '}
            {formatNumber(currentPreview.capAdjustment, 'INR')} · Final{' '}
            {formatNumber(currentPreview.maximumAllowedAmount, 'INR')}.
          </Typography>
        )}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          gap={1}
        >
          {/* Left: selection summary */}
          <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
            {showSkeleton ? (
              <Skeleton variant="rounded" width={240} height={28} />
            ) : editLoadError ? null : totalSelectedMonths > 0 ? (
              <>
                <Chip
                  size="small"
                  label={`${totalSelectedMonths} month${totalSelectedMonths !== 1 ? 's' : ''} selected`}
                  color={incompleteRefundMonths > 0 ? 'warning' : 'info'}
                  variant="soft"
                  icon={<Iconify icon="solar:calendar-bold" width={14} />}
                />
                {incompleteRefundMonths > 0 && (
                  <Typography variant="caption" color="error.main" role="status">
                    {incompleteRefundMonths} selected installment
                    {incompleteRefundMonths !== 1 ? 's need' : ' needs'} a refund amount.
                  </Typography>
                )}
                {totalRefundRequested > 0 && (
                  <Box display="flex" alignItems="center" gap={1}>
                    <Typography variant="caption" color="text.secondary">
                      Refund Amount:
                    </Typography>
                    <Typography variant="subtitle2" fontWeight={800} color="primary.main">
                      {formatNumber(totalRefundRequested, 'INR')}
                    </Typography>
                  </Box>
                )}
              </>
            ) : (
              <Typography variant="caption" color="text.disabled" sx={{ fontStyle: 'italic' }}>
                No months selected yet
              </Typography>
            )}
          </Box>

          {/* Right: actions */}
          <Box display="flex" alignItems="center" gap={1}>
            <Divider
              orientation="vertical"
              flexItem
              sx={{ display: { xs: 'none', sm: 'block' } }}
            />
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              disabled={busy}
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              onClick={(e) => onCancel?.(e, false)}
            >
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              variant="contained"
              size="small"
              disabled={
                busy ||
                showSkeleton ||
                editLoadError ||
                sessionStatus === 'loading' ||
                !formik.isValid ||
                totalSelectedMonths === 0 ||
                incompleteRefundMonths > 0 ||
                (!hasSourceRefund && !refundCanSubmit) ||
                Boolean(prerequisite)
              }
              loading={
                loading ||
                isSubmitting ||
                isUpdating ||
                isPreviewing ||
                isSubmittingDraft ||
                editLoading ||
                editFetching
              }
              loadingPosition="start"
              startIcon={<Iconify icon={isEdit ? GlobalIcons.edit : GlobalIcons.submit} />}
            >
              Submit
            </LoadingButton>
          </Box>
        </Box>
      </Box>
      <CustomDialog
        open={adminConfirmation !== null}
        title="Submit and Approve Refund?"
        maxWidth="xs"
        hasForm={false}
        guardUnsavedChanges={false}
        disableClose={busy}
        handleClose={() => setAdminConfirmation(null)}
      >
        <DialogScrollContent>
          <Stack spacing={1} sx={{ typography: 'body2' }}>
            <Typography variant="body2">
              {adminConfirmation?.studentName || 'Selected student'} · {currentYear?.name}
            </Typography>
            <Typography variant="body2">
              Refund: {formatNumber(adminConfirmation?.amount ?? 0, 'INR')} via{' '}
              {adminConfirmation?.method}
            </Typography>
            {adminConfirmation?.receiptNumber && (
              <Typography variant="body2">Receipt: {adminConfirmation.receiptNumber}</Typography>
            )}
            <Typography variant="body2">
              This request will be approved automatically when you confirm.
            </Typography>
            <Typography variant="body2">
              Approval does not send the payout; payout is recorded separately.
            </Typography>
          </Stack>
        </DialogScrollContent>
        <DialogActions>
          <Button
            type="button"
            variant="outlined"
            color="inherit"
            size="small"
            disabled={busy}
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
            onClick={() => setAdminConfirmation(null)}
          >
            Keep editing
          </Button>
          <LoadingButton
            startIcon={<Iconify icon="mdi:check-circle-outline" />}
            type="button"
            variant="contained"
            size="small"
            disabled={busy || !formik.isValid || incompleteRefundMonths > 0}
            loading={isSubmitting || isUpdating || isSubmittingDraft || isPreviewing}
            onClick={() => {
              confirmedAdminFingerprint.current = adminConfirmation?.fingerprint ?? null;
              setAdminConfirmation(null);
              formik.submitForm();
            }}
          >
            Submit and approve
          </LoadingButton>
        </DialogActions>
      </CustomDialog>
    </Box>
  );
};

export default FeeRefundFormComponent;
