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
import { Box, Card, Button, Typography } from '@mui/material';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useFinanceAcademicFilters } from 'src/screens/finance/hooks/useFinanceAcademicFilters';
import {
  feeRefundApi,
  useDeleteFeeRefundMutation,
  useUpdateFeeRefundStatusMutation,
} from 'src/redux/finance/RefundManagement/feeRefundManage';

import RefundRemarksForm from './Components/RefundRemarksForm';
import StudentFeeRefundTable from './Components/FeeRefundTable';
import FeeRefundFormComponent from './NewRefundForm/RefundForm';
import FeeRefundReasonApprovalForm from './Components/FeeRefuncRejectApproveForm';

import type { IStudentFeeData } from './type';

const FeeRefund = () => {
  const addRefundRequest = useBoolean();
  const viewRefundRequest = useBoolean();
  const onConfirmDialg = useBoolean();
  const deleteDialog = useBoolean();
  const { confirmWithUndo } = useConfirmWithUndo();
  const [selectedMode, setSelectedMode] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();
  const academicFilters = useFinanceAcademicFilters();

  const [updateStatus, { isLoading: isUpdateStatus, isFetching: isFetchingStatus }] =
    useQueryAndMutation({
      type: 'mutation',
      currentQueryAndMutation: useUpdateFeeRefundStatusMutation,
    });
  const [deleteRefund] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteFeeRefundMutation,
  });

  // State to store the selected student fee refund data
  // null when no student is selected
  const [selectedFeeRefund, setSelectedFeeRefund] = useState<IStudentFeeData | null>(null);

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
                  {selectedMode === 'Approve' ? 'Approve Request' : 'Reject Request'}
                </Typography>
                <CustomTooltip
                  arrow
                  placement="right"
                  sx={{ textAlign: 'justify' }}
                  title={
                    selectedMode === 'Approve'
                      ? 'This modal allows the admin to approve a student’s fee refund request by adding remarks and confirming the approval.'
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
                await updateStatus({
                  id: refundId,
                  body: {
                    status: selectedMode === 'Approve' ? 2 : 3,
                    notes: notes ?? undefined,
                  },
                }).unwrap();
                shikshaMitraToast.success({
                  message: `Refund request ${selectedMode === 'Approve' ? 'approved' : 'rejected'} successfully.`,
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
          loading={isUpdateStatus || isFetchingStatus}
        />
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
