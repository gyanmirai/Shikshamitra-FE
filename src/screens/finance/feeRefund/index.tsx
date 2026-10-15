'use client';

import type { RootState } from 'src/redux/store';

import { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { financeModuleType } from 'src/redux/tagTypes';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { financePermissions } from 'src/constants/finance-menu';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useGetFinanceRoutingOptionsQuery } from 'src/redux/finance/financeRoutingApi';
import { Box, Card, Stack, Button, MenuItem, TextField, Typography } from '@mui/material';
import { useFinanceAcademicFilters } from 'src/screens/finance/hooks/useFinanceAcademicFilters';
import {
  feeRefundApi,
  useDeleteFeeRefundMutation,
  useCancelFeeRefundMutation,
  useSubmitFeeRefundMutation,
  useRejectFeeRefundMutation,
  useApproveFeeRefundMutation,
  useFailRefundPayoutMutation,
  useRecordRefundPayoutMutation,
  useReturnRefundPayoutMutation,
  useConfirmRefundPayoutMutation,
  useStartReviewFeeRefundMutation,
} from 'src/redux/finance/RefundManagement/feeRefundManage';

import RefundWorklist from './Components/RefundWorklist';
import RefundRemarksForm from './Components/RefundRemarksForm';
import FeeRefundFormComponent from './NewRefundForm/RefundForm';
import FeeRefundReasonApprovalForm from './Components/FeeRefuncRejectApproveForm';
import {
  normalizeRefundMethod,
  getAllowedRefundMethodOptions,
} from './NewRefundForm/refundPayoutMethods';

import type { IStudentFeeData } from './type';

const FeeRefund = () => {
  const addRefundRequest = useBoolean();
  const viewRefundRequest = useBoolean();
  const onConfirmDialg = useBoolean();
  const deleteDialog = useBoolean();
  const processDialog = useBoolean();
  const reverseDialog = useBoolean();
  const verifyDialog = useBoolean();
  const { confirmWithUndo } = useConfirmWithUndo();
  const [selectedMode, setSelectedMode] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const { permissions } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const academicFilters = useFinanceAcademicFilters();
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const { data: bankAccountsData } = useGetFinanceRoutingOptionsQuery(
    { academicYearId: currentYear?.id ?? '', operation: 'refund' },
    { skip: !currentYear?.id || !processDialog.value }
  );

  const [approveRefund, { isLoading: isApproving }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useApproveFeeRefundMutation,
  });
  const [rejectRefund, { isLoading: isRejecting }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useRejectFeeRefundMutation,
  });
  const [startReview] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useStartReviewFeeRefundMutation,
  });
  const [submitRefund] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useSubmitFeeRefundMutation,
  });
  const [cancelRefund, { isLoading: isCancelling }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCancelFeeRefundMutation,
  });
  const [recordPayout, { isLoading: isProcessing }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useRecordRefundPayoutMutation,
  });
  const [confirmPayout, { isLoading: isConfirming }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useConfirmRefundPayoutMutation,
  });
  const [failPayout, { isLoading: isFailing }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useFailRefundPayoutMutation,
  });
  const [returnPayout, { isLoading: isReversing }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useReturnRefundPayoutMutation,
  });
  const [deleteRefund] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteFeeRefundMutation,
  });

  // State to store the selected student fee refund data
  // null when no student is selected
  const [selectedFeeRefund, setSelectedFeeRefund] = useState<IStudentFeeData | null>(null);
  const [externalReference, setExternalReference] = useState('');
  const [settlementMethod, setSettlementMethod] = useState('');
  const [settlementKey, setSettlementKey] = useState('');
  const [settlementDate, setSettlementDate] = useState('');
  const [reversalReason, setReversalReason] = useState('');
  const [evidenceReference, setEvidenceReference] = useState('');
  const [failureReason, setFailureReason] = useState('');
  const [bankAccountId, setBankAccountId] = useState('');
  const [replacementRefundId, setReplacementRefundId] = useState<string | undefined>();
  const [refundFormBusy, setRefundFormBusy] = useState(false);

  /**
   * Handles closing of the refund request form dialog
   * @param _e - Event object (unused)
   * @param isSubmit - Boolean indicating if form was submitted
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (refundFormBusy && !isSubmit) return;
    if (isSubmit || (isChanges && window.confirm('Are u sure to leave this page ?'))) {
      setSelectedFeeRefund(null);
      setReplacementRefundId(undefined);
      setIsEditMode(false);
      addRefundRequest.onFalse();
      viewRefundRequest.onFalse();
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      setSelectedFeeRefund(null);
      setReplacementRefundId(undefined);
      setIsEditMode(false);
      addRefundRequest.onFalse();
      viewRefundRequest.onFalse();
    }
  };

  const handleRequstClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are u sure to leave this page ?'))) {
      onConfirmDialg.onFalse();
      setSelectedMode('');
    } else if (!isChanges) {
      onConfirmDialg.onFalse();
      setSelectedMode('');
    }
  };
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {addRefundRequest.value ? (
        <Box inert={refundFormBusy || undefined} aria-busy={refundFormBusy}>
          <CustomBreadcrumbs
            heading={isEditMode ? 'Edit Refund Request' : 'Add Refund Request'}
            description={
              isEditMode
                ? 'Form to update and resubmit student fee refund requests.'
                : 'Form to record and request student fee refunds.'
            }
            links={[
              { name: 'Finance', href: '/finance/dashboard' },
              {
                name: 'Refunds',
                href: '/finance/fee-refund',
                onClick() {
                  addRefundRequest.onFalse();
                  setIsEditMode(false);
                },
              },
              { name: isEditMode ? 'Edit Refund Request' : 'Add Refund Request' },
            ]}
            isBack={addRefundRequest.value}
            onBack={() => {
              handleClose(null, false);
            }}
          />
        </Box>
      ) : viewRefundRequest.value ? (
        <CustomBreadcrumbs
          heading="View Refund Request"
          description="Review the details of the student's fee refund request and take appropriate action by approving or rejecting it."
          links={[
            { name: 'Finance', href: '/finance/dashboard' },
            {
              name: 'Refunds',
              href: '/finance/fee-refund',
              onClick() {
                viewRefundRequest.onFalse();
                setSelectedFeeRefund(null);
              },
            },
            { name: 'View Refund Request' },
          ]}
          isBack={viewRefundRequest.value}
          onBack={() => {
            viewRefundRequest.onFalse();
            setSelectedFeeRefund(null);
          }}
        />
      ) : (
        <CustomBreadcrumbs
          heading="Refunds"
          description="Search for a student and manage fee refund requests by initiating new refund requests."
          links={[
            { name: 'Finance', href: '/finance/dashboard' },
            { name: 'Refunds', href: '/finance/fee-refund' },
          ]}
          action={
            hasGrantedPermission(permissions, financePermissions.fees.refundActions.add) ? (
              <Button
                onClick={() => {
                  setSelectedFeeRefund(null);
                  setReplacementRefundId(undefined);
                  setIsEditMode(false);
                  addRefundRequest.onTrue();
                }}
                size="small"
                startIcon={<Add />}
                variant="contained"
                sx={{ px: '32px' }}
              >
                Fee Refund
              </Button>
            ) : undefined
          }
        />
      )}

      {!addRefundRequest.value && !viewRefundRequest.value && (
        <RefundWorklist
          filters={academicFilters}
          onView={(data) => {
            setSelectedFeeRefund(data);
            setIsEditMode(false);
            viewRefundRequest.onTrue();
          }}
          onApprove={(data) => {
            setSelectedFeeRefund(data);
            setSelectedMode('Approve');
            onConfirmDialg.onTrue();
          }}
          onReject={(data) => {
            setSelectedFeeRefund(data);
            setSelectedMode('Reject');
            onConfirmDialg.onTrue();
          }}
          onRecord={(data) => {
            setSelectedFeeRefund(data);
            setSettlementMethod(normalizeRefundMethod(data._refundMethod ?? ''));
            setExternalReference('');
            setEvidenceReference('');
            setBankAccountId(data._payingBankAccountId ?? '');
            setSettlementKey(crypto.randomUUID());
            setSettlementDate(new Date().toISOString());
            processDialog.onTrue();
          }}
          onVerify={(data) => {
            setSelectedFeeRefund(data);
            setEvidenceReference('');
            setFailureReason('');
            setSettlementKey(crypto.randomUUID());
            verifyDialog.onTrue();
          }}
          onReplace={(data) => {
            setSelectedFeeRefund(data);
            setReplacementRefundId(data._refundRequestId);
            setIsEditMode(false);
            addRefundRequest.onTrue();
          }}
          onReturn={(data) => {
            setSelectedFeeRefund(data);
            setReversalReason('');
            setEvidenceReference('');
            reverseDialog.onTrue();
          }}
        />
      )}

      {addRefundRequest.value && (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <FeeRefundFormComponent
            onCancel={handleClose}
            onBusyChange={setRefundFormBusy}
            defaultBoardId={academicFilters.selectedBoard}
            defaultMediumId={academicFilters.selectedMedium}
            defaultStandardId={
              academicFilters.selectedStandardId !== 'All Classes'
                ? academicFilters.selectedStandardId
                : ''
            }
            defaultDivisionId={
              academicFilters.selectedDivisionId !== 'All Divisions'
                ? academicFilters.selectedDivisionId
                : ''
            }
            isEdit={isEditMode}
            editRefundId={selectedFeeRefund?._refundRequestId}
            replacementRefundId={replacementRefundId}
          />
        </Card>
      )}

      {viewRefundRequest.value && selectedFeeRefund && (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <RefundRemarksForm
            open={viewRefundRequest}
            onClose={() => {
              viewRefundRequest.onFalse();
              setSelectedFeeRefund(null);
            }}
            student={selectedFeeRefund as IStudentFeeData}
            onApprove={() => {
              onConfirmDialg.onTrue();
              setSelectedMode('Approve');
              // Handle approve logic
            }}
            onReject={() => {
              onConfirmDialg.onTrue();
              setSelectedMode('Reject');
              // Handle reject logic
            }}
          />
        </Card>
      )}

      <CustomDialog
        open={onConfirmDialg.value}
        title={
          <Box
            sx={{
              width: '100%',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 1.5,
            }}
          >
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h5" sx={{ lineHeight: 1.25 }}>
                  {selectedMode === 'Approve'
                    ? 'Approve Request'
                    : selectedMode === 'Cancel'
                      ? 'Cancel Request'
                      : 'Reject Request'}
                </Typography>
                <CustomTooltip
                  arrow
                  placement="right"
                  sx={{ textAlign: 'justify' }}
                  title={
                    selectedMode === 'Approve'
                      ? 'This modal allows the admin to approve a student’s fee refund request by adding remarks and confirming the approval.'
                      : selectedMode === 'Cancel'
                        ? 'Cancel this request and release any amount reserved during approval.'
                        : 'This modal allows the admin to reject a student’s fee refund request by adding remarks and confirming the rejection.'
                  }
                >
                  <Iconify
                    icon="lucide:info"
                    sx={{ mt: 0.25, cursor: 'pointer', flexShrink: 0 }}
                    color="info.main"
                  />
                </CustomTooltip>
              </Box>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.75, lineHeight: 1.4, wordBreak: 'break-word' }}
              >
                <Box component="span" sx={{ color: 'text.primary', fontWeight: 600 }}>
                  {selectedFeeRefund?.name || '-'}{' '}
                  {selectedFeeRefund?.rollNo && `| Roll No: ${selectedFeeRefund.rollNo}`}
                </Box>{' '}
                {selectedFeeRefund?.grNo && `| GR No: ${selectedFeeRefund.grNo}`} | Class :{' '}
                {[selectedFeeRefund?.class, selectedFeeRefund?.division]
                  .filter(Boolean)
                  .join(' ') || '-'}
              </Typography>
            </Box>
          </Box>
        }
        handleClose={() => {
          onConfirmDialg.onFalse();
          setSelectedMode('');
        }}
        maxWidth="xs"
      >
        <FeeRefundReasonApprovalForm
          key={selectedFeeRefund?._refundRequestId}
          academicYearId={currentYear?.id || ''}
          defaultCategoryId={
            selectedFeeRefund?._expenseCategoryId || selectedFeeRefund?._defaultExpenseCategoryId
          }
          defaultBankId={
            selectedFeeRefund?._payingBankAccountId ||
            selectedFeeRefund?._defaultPayingBankAccountId
          }
          defaultMethod={selectedFeeRefund?._refundMethod}
          allowedPayoutMethods={selectedFeeRefund?._allowedPayoutMethods}
          onClose={async (e, isSubmit, notes, routing) => {
            if (isSubmit && selectedFeeRefund) {
              try {
                const refundId = (selectedFeeRefund as any)._refundRequestId;
                if (selectedMode === 'Approve') {
                  if (!routing) return;
                  await approveRefund({
                    id: refundId,
                    notes: notes ?? undefined,
                    ...routing,
                  }).unwrap();
                } else if (selectedMode === 'Reject') {
                  await rejectRefund({ id: refundId, notes: notes ?? '' }).unwrap();
                } else {
                  await cancelRefund({ id: refundId, notes: notes ?? '' }).unwrap();
                }
                shikshaMitraToast.success({
                  message:
                    selectedMode === 'Approve'
                      ? 'Refund request approved successfully.'
                      : selectedMode === 'Cancel'
                        ? 'Refund request cancelled successfully.'
                        : 'Refund request rejected successfully.',
                });
                handleRequstClose(e, true);
                viewRefundRequest.onFalse();
                setSelectedFeeRefund(null);
                setIsEditMode(false);
              } catch (err: any) {
                shikshaMitraToast.error({
                  message: err?.data?.error?.message ?? 'Status update failed.',
                });
              }
            } else {
              handleRequstClose(e, isSubmit);
            }
          }}
          mode={selectedMode}
          loading={isApproving || isRejecting || isCancelling}
        />
      </CustomDialog>

      <CustomDialog
        open={processDialog.value}
        title="Record refund payment"
        handleClose={processDialog.onFalse}
        maxWidth="xs"
      >
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Record the payment for <strong>{selectedFeeRefund?.name}</strong>. The refund remains
            Approved until its outcome is confirmed.
          </Typography>
          <TextField
            label="Approved amount"
            value={selectedFeeRefund?._approvedAmount ?? 0}
            size="small"
            disabled
          />
          <TextField
            label="Payout method"
            value={settlementMethod}
            onChange={(event) => setSettlementMethod(event.target.value)}
            size="small"
            select={!selectedFeeRefund?._refundMethod}
            disabled={!!selectedFeeRefund?._refundMethod}
            required
          >
            {getAllowedRefundMethodOptions(selectedFeeRefund?._allowedPayoutMethods).map(
              (method) => (
                <MenuItem key={method.value} value={method.value}>
                  {method.label}
                </MenuItem>
              )
            )}
          </TextField>
          {settlementMethod !== 'Cash' && (
            <TextField
              label={
                settlementMethod === 'Cheque'
                  ? 'Cheque number'
                  : settlementMethod === 'Demand Draft (DD)'
                    ? 'DD number'
                    : settlementMethod === 'UPI'
                      ? 'UPI transaction ID'
                      : 'Bank UTR / transaction reference'
              }
              value={externalReference}
              onChange={(e) => setExternalReference(e.target.value)}
              size="small"
              required
              inputProps={{ maxLength: 200 }}
            />
          )}
          {settlementMethod !== 'Cash' && (
            <TextField
              label="Source school bank account"
              select
              size="small"
              required
              value={bankAccountId}
              disabled={!!selectedFeeRefund?._payingBankAccountId}
              onChange={(event) => setBankAccountId(event.target.value)}
            >
              {(bankAccountsData?.bankAccounts ?? []).map((account: any) => (
                <MenuItem key={account.id} value={account.id}>
                  {account.label}
                </MenuItem>
              ))}
            </TextField>
          )}
          <TextField
            label={
              settlementMethod === 'Cash'
                ? 'Signed handover receipt or document reference'
                : 'Payment evidence reference'
            }
            value={evidenceReference}
            onChange={(event) => setEvidenceReference(event.target.value)}
            size="small"
            required
            inputProps={{ maxLength: 500 }}
          />
          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            <Button
              startIcon={<Iconify icon="mdi:close" />}
              onClick={processDialog.onFalse}
              color="inherit"
            >
              Cancel
            </Button>
            <Button
              startIcon={<Iconify icon="mdi:cash-check" />}
              variant="contained"
              disabled={
                isProcessing ||
                !selectedFeeRefund?._refundRequestId ||
                !settlementMethod ||
                !getAllowedRefundMethodOptions(selectedFeeRefund?._allowedPayoutMethods).some(
                  (method) => method.value === settlementMethod
                ) ||
                !evidenceReference.trim() ||
                (settlementMethod !== 'Cash' && !externalReference.trim()) ||
                (settlementMethod !== 'Cash' && !bankAccountId)
              }
              onClick={async () => {
                if (!selectedFeeRefund?._refundRequestId) return;
                try {
                  await recordPayout({
                    id: selectedFeeRefund._refundRequestId,
                    body: {
                      idempotencyKey: settlementKey,
                      method: settlementMethod,
                      amount: selectedFeeRefund._approvedAmount,
                      paymentDate: settlementDate,
                      bankAccountId: bankAccountId || undefined,
                      externalReference:
                        settlementMethod === 'Cash' ? undefined : externalReference.trim(),
                      evidenceReference: evidenceReference.trim(),
                    },
                  }).unwrap();
                  shikshaMitraToast.success({
                    message: 'Payment recorded. Confirm its outcome after verification.',
                  });
                  processDialog.onFalse();
                  setSelectedFeeRefund(null);
                } catch (err: any) {
                  shikshaMitraToast.error({
                    message: err?.data?.error?.message ?? 'Refund processing failed.',
                  });
                }
              }}
            >
              Record payment
            </Button>
          </Stack>
        </Stack>
      </CustomDialog>

      <CustomDialog
        open={verifyDialog.value}
        title="Confirm payment outcome"
        handleClose={verifyDialog.onFalse}
        maxWidth="xs"
      >
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Verify the payment for <strong>{selectedFeeRefund?.name}</strong> offline before
            choosing an outcome.
          </Typography>
          <TextField
            label="Verification evidence reference"
            size="small"
            required
            value={evidenceReference}
            onChange={(event) => setEvidenceReference(event.target.value)}
            inputProps={{ maxLength: 500 }}
          />
          <TextField
            label="Failure reason (required only if failed)"
            size="small"
            multiline
            minRows={2}
            value={failureReason}
            onChange={(event) => setFailureReason(event.target.value)}
            inputProps={{ maxLength: 1000 }}
          />
          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            <Button
              startIcon={<Iconify icon="mdi:close" />}
              onClick={verifyDialog.onFalse}
              color="inherit"
            >
              Close
            </Button>
            <Button
              startIcon={<Iconify icon="mdi:cancel" />}
              color="error"
              variant="outlined"
              disabled={
                isFailing ||
                !evidenceReference.trim() ||
                !failureReason.trim() ||
                !selectedFeeRefund?._settlementId
              }
              onClick={async () => {
                if (!selectedFeeRefund?._refundRequestId || !selectedFeeRefund._settlementId)
                  return;
                try {
                  await failPayout({
                    id: selectedFeeRefund._refundRequestId,
                    payoutId: selectedFeeRefund._settlementId,
                    body: {
                      idempotencyKey: settlementKey,
                      evidenceReference: evidenceReference.trim(),
                      reason: failureReason.trim(),
                    },
                  }).unwrap();
                  shikshaMitraToast.success({
                    message: 'Payment marked failed. A linked new request can now be created.',
                  });
                  verifyDialog.onFalse();
                } catch (error: any) {
                  shikshaMitraToast.error({
                    message: error?.data?.error?.message ?? 'Could not record payment failure.',
                  });
                }
              }}
            >
              Mark failed
            </Button>
            <Button
              startIcon={<Iconify icon="mdi:check-circle-outline" />}
              color="success"
              variant="contained"
              disabled={
                isConfirming || !evidenceReference.trim() || !selectedFeeRefund?._settlementId
              }
              onClick={async () => {
                if (!selectedFeeRefund?._refundRequestId || !selectedFeeRefund._settlementId)
                  return;
                try {
                  await confirmPayout({
                    id: selectedFeeRefund._refundRequestId,
                    payoutId: selectedFeeRefund._settlementId,
                    body: {
                      idempotencyKey: settlementKey,
                      evidenceReference: evidenceReference.trim(),
                    },
                  }).unwrap();
                  shikshaMitraToast.success({ message: 'Refund confirmed paid.' });
                  verifyDialog.onFalse();
                } catch (error: any) {
                  shikshaMitraToast.error({
                    message: error?.data?.error?.message ?? 'Could not confirm payment.',
                  });
                }
              }}
            >
              Confirm paid
            </Button>
          </Stack>
        </Stack>
      </CustomDialog>

      <CustomDialog
        open={reverseDialog.value}
        title="Record returned payment"
        handleClose={reverseDialog.onFalse}
        maxWidth="xs"
      >
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Record a confirmed bank or instrument return. This restores the refundable balance.
          </Typography>
          <TextField
            required
            multiline
            minRows={3}
            label="Reversal reason"
            value={reversalReason}
            onChange={(e) => setReversalReason(e.target.value)}
            inputProps={{ maxLength: 1000 }}
          />
          <TextField
            required
            size="small"
            label="Return evidence reference"
            value={evidenceReference}
            onChange={(event) => setEvidenceReference(event.target.value)}
            inputProps={{ maxLength: 500 }}
          />
          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            <Button
              startIcon={<Iconify icon="mdi:close" />}
              onClick={reverseDialog.onFalse}
              color="inherit"
            >
              Cancel
            </Button>
            <Button
              startIcon={<Iconify icon="mdi:cash-refund" />}
              color="warning"
              variant="contained"
              disabled={
                isReversing ||
                !reversalReason.trim() ||
                !evidenceReference.trim() ||
                !selectedFeeRefund?._settlementId
              }
              onClick={async () => {
                if (!selectedFeeRefund?._refundRequestId || !selectedFeeRefund._settlementId)
                  return;
                try {
                  await returnPayout({
                    id: selectedFeeRefund._refundRequestId,
                    settlementId: selectedFeeRefund._settlementId,
                    reason: reversalReason.trim(),
                    evidenceReference: evidenceReference.trim(),
                  }).unwrap();
                  shikshaMitraToast.success({ message: 'Returned payment recorded.' });
                  reverseDialog.onFalse();
                  setSelectedFeeRefund(null);
                } catch (err: any) {
                  shikshaMitraToast.error({
                    message: err?.data?.error?.message ?? 'Refund reversal failed.',
                  });
                }
              }}
            >
              Record return
            </Button>
          </Stack>
        </Stack>
      </CustomDialog>

      <ConfirmDialog
        open={deleteDialog.value}
        onClose={() => {
          setSelectedFeeRefund(null);
          deleteDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete refund request for student{' '}
            <strong>{selectedFeeRefund?.name}</strong>?
          </>
        }
        action={
          <Button
            startIcon={<Iconify icon="mdi:delete-outline" />}
            variant="contained"
            color="error"
            size="small"
            onClick={() => {
              deleteDialog.onFalse();
              if (selectedFeeRefund?._refundRequestId) {
                confirmWithUndo({
                  item: selectedFeeRefund,
                  onOptimisticRemove: (dispatchFn, setDeleteIndex) => {
                    dispatchFn(
                      feeRefundApi.util.updateQueryData(
                        'getFeeRefunds',
                        {
                          academicMediumId: academicFilters.filterPayload?.educationMediumId,
                          standardId: academicFilters.filterPayload?.standardId,
                          divisionId: academicFilters.filterPayload?.divisionId,
                        },
                        (draft) => {
                          const index = draft.items.findIndex(
                            (t) => t.id === selectedFeeRefund._refundRequestId
                          );
                          if (index !== -1) {
                            setDeleteIndex(index);
                            draft.items.splice(index, 1);
                          }
                        }
                      )
                    );
                    setSelectedFeeRefund(null);
                  },
                  onUndoRestore: (dispatchFn, _deleteIndex) => {
                    dispatchFn(
                      feeRefundApi.util.invalidateTags([financeModuleType.feeRefund as any])
                    );
                  },
                  onCommit: () => deleteRefund(selectedFeeRefund._refundRequestId).unwrap(),
                });
              }
              setTimeout(() => deleteDialog.onFalse(), 200);
            }}
          >
            Yes
          </Button>
        }
      />
    </Box>
  );
};

export default FeeRefund;
