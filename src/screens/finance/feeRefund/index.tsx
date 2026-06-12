'use client';

import type { RootState } from 'src/redux/store';

import { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Card, Button, Typography } from '@mui/material';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useFinanceAcademicFilters } from 'src/screens/finance/hooks/useFinanceAcademicFilters';
import { useUpdateFeeRefundStatusMutation } from 'src/redux/finance/RefundManagement/feeRefundManage';

import RefundRemarksForm from './Components/RefundRemarksForm';
import StudentFeeRefundTable from './Components/FeeRefundTable';
import FeeRefundFormComponent from './NewRefundForm/RefundForm';
import FeeRefundReasonApprovalForm from './Components/FeeRefuncRejectApproveForm';

import type { IStudentFeeData } from './type';

const FeeRefund = () => {
  const addRefundRequest = useBoolean();
  const viewRefundRequest = useBoolean();
  const onConfirmDialg = useBoolean();
  const [selectedMode, setSelectedMode] = useState('');
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();
  const academicFilters = useFinanceAcademicFilters();

  const [updateStatus] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateFeeRefundStatusMutation,
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
      addRefundRequest.onFalse();
      viewRefundRequest.onFalse();
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      setSelectedFeeRefund(null);
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
          heading="Add Refund Request"
          description="Form to record and request student fee refunds."
          links={[
            { name: 'Finance', href: '/finance/dashboard' },
            {
              name: 'Fee Refund',
              href: '/finance/fee-refund',
              onClick() {
                addRefundRequest.onFalse();
              },
            },
            { name: 'Add Refund Request' },
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
              onClick={() => addRefundRequest.onTrue()}
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
            addRefundRequest.onTrue();
          }}
          onView={(data) => {
            setSelectedFeeRefund(data);
            viewRefundRequest.onTrue();
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
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
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
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
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
        />
      </CustomDialog>
    </Box>
  );
};

export default FeeRefund;
