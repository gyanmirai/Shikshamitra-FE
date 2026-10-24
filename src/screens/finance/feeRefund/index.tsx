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
import { useFinanceFormClose } from 'src/hooks/use-finance-form-close';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { Box, Card, Stack, Button, TextField, Typography } from '@mui/material';
import { useGetFinanceRoutingOptionsQuery } from 'src/redux/finance/financeRoutingApi';
import { useFinanceAcademicFilters } from 'src/screens/finance/hooks/useFinanceAcademicFilters';
import {
  feeRefundApi,
  useDeleteFeeRefundMutation,
  useCancelFeeRefundMutation,
  useSubmitFeeRefundMutation,
  useRejectFeeRefundMutation,
  useApproveFeeRefundMutation,
  useRecordRefundPayoutMutation,
  useReturnRefundPayoutMutation,
  useStartReviewFeeRefundMutation,
} from 'src/redux/finance/RefundManagement/feeRefundManage';

import RefundWorklist from './Components/RefundWorklist';
import RefundRemarksForm from './Components/RefundRemarksForm';
import FeeRefundFormComponent from './NewRefundForm/RefundForm';
import RefundPaymentDialog from './Components/RefundPaymentDialog';
import { buildRefundPayoutPayload } from './Components/refundPaymentPayload';
import FeeRefundReasonApprovalForm from './Components/FeeRefuncRejectApproveForm';

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
  const { permissions } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();
  const academicFilters = useFinanceAcademicFilters();
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const {
    data: bankAccountsData,
    isLoading: bankAccountsLoading,
    isFetching: bankAccountsFetching,
  } = useGetFinanceRoutingOptionsQuery(
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
  const [settlementKey, setSettlementKey] = useState('');
  const [settlementDate, setSettlementDate] = useState('');
  const [reversalReason, setReversalReason] = useState('');
  const [evidenceReference, setEvidenceReference] = useState('');
  const [replacementRefundId, setReplacementRefundId] = useState<string | undefined>();
  const [refundFormBusy, setRefundFormBusy] = useState(false);

  /**
   * Handles closing of the refund request form dialog
   * @param _e - Event object (unused)
   * @param isSubmit - Boolean indicating if form was submitted
   */
  const { handleClose, confirmation: handleCloseConfirmation } = useFinanceFormClose(
    addRefundRequest.value || viewRefundRequest.value,
    () => {
      setSelectedFeeRefund(null);
      setReplacementRefundId(undefined);
      setIsEditMode(false);
      addRefundRequest.onFalse();
      viewRefundRequest.onFalse();
    },
    refundFormBusy,
    addRefundRequest.value ? undefined : false
  );

  const { handleClose: handleRequstClose, confirmation: handleRequstCloseConfirmation } =
    useFinanceFormClose(
      onConfirmDialg.value,
      () => {
        onConfirmDialg.onFalse();
        setSelectedMode('');
      },
      isApproving || isRejecting || isCancelling
    );
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {handleRequstCloseConfirmation}
      {handleCloseConfirmation}
      {addRefundRequest.value ? (
        <Box inert={refundFormBusy || undefined} aria-busy={refundFormBusy}>
          <CustomBreadcrumbs
            description={
              isEditMode
                ? 'Form to update and resubmit student fee refund requests.'
                : 'Form to record and request student fee refunds.'
            }
            heading={isEditMode ? 'Edit Refund Request' : 'Add Refund Request'}

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
      ) : (
        <CustomBreadcrumbs
          description="Search for a student and manage fee refund requests by initiating new refund requests."
          heading="Refunds"

          links={[
            { name: 'Finance', href: '/finance/dashboard' },
            { name: 'Refunds', href: '/finance/fee-refund' },
          ]}
        />
      )}

      {!addRefundRequest.value && (
        <RefundWorklist
          primaryAction={
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
                sx={{ px: 4 }}
              >
                Fee Refund
              </Button>
            ) : undefined
          }
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
            setEvidenceReference('');
            setSettlementKey(crypto.randomUUID());
            setSettlementDate(data._paymentDate ?? new Date().toISOString());
            processDialog.onTrue();
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
        guardUnsavedChanges={false}
        disableClose={isApproving || isRejecting || isCancelling}
        handleClose={() => handleRequstClose()}
        maxWidth="xs"
      >
        {onConfirmDialg.value && (
          <FeeRefundReasonApprovalForm
            key={selectedFeeRefund?._refundRequestId}
            onClose={async (e, isSubmit, notes) => {
              if (isSubmit && selectedFeeRefund) {
                try {
                  const refundId = (selectedFeeRefund as any)._refundRequestId;
                  if (selectedMode === 'Approve') {
                    await approveRefund({
                      id: refundId,
                      notes: notes ?? undefined,
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
        )}
      </CustomDialog>

      {processDialog.value && selectedFeeRefund && (
        <RefundPaymentDialog
          key={settlementKey}
          refund={selectedFeeRefund}
          expenseCategories={bankAccountsData?.expenseCategories ?? []}
          bankAccounts={bankAccountsData?.bankAccounts ?? []}
          bankAccountsLoading={bankAccountsLoading || bankAccountsFetching}
          loading={isProcessing}
          onClose={processDialog.onFalse}
          onSubmit={async (values) => {
            if (!selectedFeeRefund._refundRequestId) return;
            try {
              await recordPayout({
                id: selectedFeeRefund._refundRequestId,
                body: buildRefundPayoutPayload(
                  selectedFeeRefund,
                  values,
                  settlementKey,
                  settlementDate
                ),
              }).unwrap();
              shikshaMitraToast.success({
                message: 'Refund completed and added to Expenses.',
              });
              processDialog.onFalse();
              setSelectedFeeRefund(null);
            } catch (err: any) {
              const message = parseApiProblemDetail(err).detail || 'Refund processing failed.';
              shikshaMitraToast.error({ message });
              throw new Error(message);
            }
          }}
        />
      )}

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
