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
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { Box, Card, Stack, Button, MenuItem, TextField, Typography } from '@mui/material';
import { useFinanceAcademicFilters } from 'src/screens/finance/hooks/useFinanceAcademicFilters';
import {
  feeRefundApi,
  useDeleteFeeRefundMutation,
  useCancelFeeRefundMutation,
  useSubmitFeeRefundMutation,
  useRejectFeeRefundMutation,
  useApproveFeeRefundMutation,
  useProcessFeeRefundMutation,
  useReverseFeeRefundMutation,
  useStartReviewFeeRefundMutation,
} from 'src/redux/finance/RefundManagement/feeRefundManage';

import RefundRemarksForm from './Components/RefundRemarksForm';
import StudentFeeRefundTable from './Components/FeeRefundTable';
import FeeRefundFormComponent from './NewRefundForm/RefundForm';
import FeeRefundReasonApprovalForm from './Components/FeeRefuncRejectApproveForm';
import { refundPaymentMethodsConfig } from './NewRefundForm/refundPaymentDetailsConfig';

import type { IStudentFeeData } from './type';

const FeeRefund = () => {
  const addRefundRequest = useBoolean();
  const viewRefundRequest = useBoolean();
  const onConfirmDialg = useBoolean();
  const deleteDialog = useBoolean();
  const processDialog = useBoolean();
  const reverseDialog = useBoolean();
  const { confirmWithUndo } = useConfirmWithUndo();
  const [selectedMode, setSelectedMode] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();
  const academicFilters = useFinanceAcademicFilters();

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
  const [processRefund, { isLoading: isProcessing }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useProcessFeeRefundMutation,
  });
  const [reverseRefund, { isLoading: isReversing }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useReverseFeeRefundMutation,
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
  const [reversalReason, setReversalReason] = useState('');

  /**
   * Handles closing of the refund request form dialog
   * @param _e - Event object (unused)
   * @param isSubmit - Boolean indicating if form was submitted
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are u sure to leave this page ?'))) {
      setSelectedFeeRefund(null);
      setIsEditMode(false);
      addRefundRequest.onFalse();
      viewRefundRequest.onFalse();
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      setSelectedFeeRefund(null);
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
              name: 'Fee Refund',
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
      ) : viewRefundRequest.value ? (
        <CustomBreadcrumbs
          heading="View Refund Request"
          description="Review the details of the student's fee refund request and take appropriate action by approving or rejecting it."
          links={[
            { name: 'Finance', href: '/finance/dashboard' },
            {
              name: 'Fee Refund',
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
          heading="Fee Refund"
          description="Search for a student and manage fee refund requests by initiating new refund requests."
          links={[
            { name: 'Finance', href: '/finance/dashboard' },
            { name: 'Fee Refund', href: '/finance/fee-refund' },
          ]}
          action={
            <Button
              onClick={() => {
                setSelectedFeeRefund(null);
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
          }
        />
      )}

      {!addRefundRequest.value && !viewRefundRequest.value && (
        <StudentFeeRefundTable
          onRequestRefund={(data) => {
            setSelectedFeeRefund(data);
            setIsEditMode(false);
            addRefundRequest.onTrue();
          }}
          onView={(data) => {
            setSelectedFeeRefund(data);
            setIsEditMode(false);
            viewRefundRequest.onTrue();
          }}
          onEdit={(data) => {
            setSelectedFeeRefund(data);
            setIsEditMode(true);
            addRefundRequest.onTrue();
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
          onDelete={(data) => {
            setSelectedFeeRefund(data);
            deleteDialog.onTrue();
          }}
          onSubmit={async (data) => {
            if (!data._refundRequestId) return;
            try {
              await submitRefund(data._refundRequestId).unwrap();
              shikshaMitraToast.success({ message: 'Refund request submitted for review.' });
            } catch (err: any) {
              shikshaMitraToast.error({
                message: err?.data?.error?.message ?? 'Could not submit the refund request.',
              });
            }
          }}
          onCancel={(data) => {
            setSelectedFeeRefund(data);
            setSelectedMode('Cancel');
            onConfirmDialg.onTrue();
          }}
          onStartReview={async (data) => {
            try {
              await startReview(data._refundRequestId).unwrap();
              shikshaMitraToast.success({ message: 'Refund request moved to review.' });
            } catch (err: any) {
              shikshaMitraToast.error({
                message: err?.data?.error?.message ?? 'Could not start review.',
              });
            }
          }}
          onProcess={(data) => {
            setSelectedFeeRefund(data);
            setSettlementMethod(data._refundMethod ?? '');
            setExternalReference('');
            setSettlementKey(crypto.randomUUID());
            processDialog.onTrue();
          }}
          onReverse={(data) => {
            setSelectedFeeRefund(data);
            setReversalReason('');
            reverseDialog.onTrue();
          }}
          academicFilters={academicFilters}
        />
      )}

      {addRefundRequest.value && (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <FeeRefundFormComponent
            onCancel={handleClose}
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
          onClose={async (e, isSubmit, notes) => {
            if (isSubmit && selectedFeeRefund) {
              try {
                const refundId = (selectedFeeRefund as any)._refundRequestId;
                if (selectedMode === 'Approve') {
                  await approveRefund({ id: refundId, notes: notes ?? undefined }).unwrap();
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
        title="Process Refund Settlement"
        handleClose={processDialog.onFalse}
        maxWidth="xs"
      >
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Record the payout for <strong>{selectedFeeRefund?.name}</strong>. The fee ledger changes
            only after this succeeds.
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
            {Object.keys(refundPaymentMethodsConfig).map((method) => (
              <MenuItem key={method} value={method}>{method}</MenuItem>
            ))}
          </TextField>
          <TextField
            label="Bank / transaction reference"
            value={externalReference}
            onChange={(e) => setExternalReference(e.target.value)}
            size="small"
            inputProps={{ maxLength: 200 }}
          />
          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            <Button onClick={processDialog.onFalse} color="inherit">
              Cancel
            </Button>
            <Button
              variant="contained"
              disabled={isProcessing || !selectedFeeRefund?._refundRequestId || !settlementMethod}
              onClick={async () => {
                if (!selectedFeeRefund?._refundRequestId) return;
                try {
                  await processRefund({
                    id: selectedFeeRefund._refundRequestId,
                    body: {
                      idempotencyKey: settlementKey,
                      method: settlementMethod,
                      amount: selectedFeeRefund._approvedAmount,
                      settlementDate: new Date().toISOString(),
                      externalReference: externalReference || undefined,
                    },
                  }).unwrap();
                  shikshaMitraToast.success({ message: 'Refund processed successfully.' });
                  processDialog.onFalse();
                  setSelectedFeeRefund(null);
                } catch (err: any) {
                  shikshaMitraToast.error({
                    message: err?.data?.error?.message ?? 'Refund processing failed.',
                  });
                }
              }}
            >
              Process Refund
            </Button>
          </Stack>
        </Stack>
      </CustomDialog>

      <CustomDialog
        open={reverseDialog.value}
        title="Reverse Processed Refund"
        handleClose={reverseDialog.onFalse}
        maxWidth="xs"
      >
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Typography variant="body2" color="text.secondary">
            This creates an auditable reversal and restores the refundable fee balance.
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
          <Stack direction="row" justifyContent="flex-end" spacing={1}>
            <Button onClick={reverseDialog.onFalse} color="inherit">
              Cancel
            </Button>
            <Button
              color="warning"
              variant="contained"
              disabled={isReversing || !reversalReason.trim() || !selectedFeeRefund?._settlementId}
              onClick={async () => {
                if (!selectedFeeRefund?._refundRequestId || !selectedFeeRefund._settlementId)
                  return;
                try {
                  await reverseRefund({
                    id: selectedFeeRefund._refundRequestId,
                    settlementId: selectedFeeRefund._settlementId,
                    reason: reversalReason.trim(),
                  }).unwrap();
                  shikshaMitraToast.success({ message: 'Refund reversed successfully.' });
                  reverseDialog.onFalse();
                  setSelectedFeeRefund(null);
                } catch (err: any) {
                  shikshaMitraToast.error({
                    message: err?.data?.error?.message ?? 'Refund reversal failed.',
                  });
                }
              }}
            >
              Reverse Refund
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
