'use client';

import type { RootState } from 'src/redux/store';

import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Add } from '@mui/icons-material';
import { Box, Button, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetFeeRefundQuery } from 'src/redux/finance/feeRefund';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import RefundRequestForm from './Components/RefurnRequestForm';
import RefundRemarksForm from './Components/RefundRemarksForm';
import RefundProcessForm from './Components/RefundProcessForm';
import StudentFeeRefundTable from './Components/FeeRefundTable';
import NewFeeRequestRefundForm from './Components/NewFeeRequest';

import type { IStudentFeeData } from './type';

const FeeRefund = () => {
  // Boolean state to control the visibility of add concession request modal/form
  const addRefundRequest = useBoolean();
  const createRefundRequest = useBoolean();
  const viewRefundRequest = useBoolean();
  const processRefundDialog = useBoolean();
  // Redux state for tracking unsaved changes
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  // Redux dispatch hook for dispatching actions
  const dispatch = useDispatch();

  // Fetch fee refund data using custom query hook
  const { data: feeRefundData, isLoading: feeRefundLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFeeRefundQuery,
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
    // Helper function to reset state with a delay
    const resetState = () => {
      setTimeout(() => {
        setSelectedFeeRefund(null);
        dispatch(setIsChanges(false));
      }, 200); // Delay matches dialog close animation duration
    };

    // If form was submitted or user confirms leaving with unsaved changes
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      setSelectedFeeRefund(null);
      createRefundRequest.onFalse();
      addRefundRequest.onFalse();
      viewRefundRequest.onFalse();
      processRefundDialog.onFalse();
      resetState();
    }
    // If no unsaved changes, simply close the dialog
    else if (!isChanges) {
      setSelectedFeeRefund(null);
      createRefundRequest.onFalse();
      addRefundRequest.onFalse();
      viewRefundRequest.onFalse();
      processRefundDialog.onFalse();
      setTimeout(() => {
        setSelectedFeeRefund(null);
      }, 200);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Fee Refund"
        description="View and manage student concession requests."
        links={[
          { name: 'Finance', href: '/finance/dashboard' },
          { name: 'Fee Refund', href: '/finance/fee-refund' },
        ]}
        action={
          <Button
            onClick={() => createRefundRequest.onTrue()}
            size="small"
            startIcon={<Add />}
            variant="contained"
          >
            Fee Refund
          </Button>
        }
        sx={{ px: 1, mb: 2 }}
      />

      <StudentFeeRefundTable
        data={feeRefundData}
        onRequestRefund={(data) => {
          setSelectedFeeRefund(data);
          addRefundRequest.onTrue();
        }}
        onView={(data) => {
          setSelectedFeeRefund(data);
          viewRefundRequest.onTrue();
        }}
        onProcessRefund={(data) => {
          setSelectedFeeRefund(data);
          processRefundDialog.onTrue();
        }}
      />

      <CustomDialog
        open={createRefundRequest.value}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Create Fee Refund</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="Form to create and submit new fee refund requests."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        handleClose={() => {
          setSelectedFeeRefund(null);
          createRefundRequest.onFalse();
        }}
        maxWidth="sm"
      >
        <NewFeeRequestRefundForm open={createRefundRequest} onClose={handleClose} student={null} />
      </CustomDialog>

      <CustomDialog
        open={addRefundRequest.value}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Request Refund</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="Form to record and request student fee refunds."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        handleClose={() => {
          setSelectedFeeRefund(null);
          addRefundRequest.onFalse();
        }}
        maxWidth="sm"
      >
        <RefundRequestForm
          open={addRefundRequest}
          onClose={handleClose}
          student={selectedFeeRefund as IStudentFeeData}
        />
      </CustomDialog>

      <CustomDialog
        open={viewRefundRequest.value}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">View Request</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="This modal provides administrators with complete details of the fee refund request submitted by a student, enabling them to review the information and take action by approving or rejecting the request."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        handleClose={() => {
          setSelectedFeeRefund(null);
          viewRefundRequest.onFalse();
        }}
        maxWidth="sm"
      >
        <RefundRemarksForm
          open={viewRefundRequest}
          onClose={handleClose}
          student={selectedFeeRefund as IStudentFeeData}
        />
      </CustomDialog>

      <CustomDialog
        open={processRefundDialog.value}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Process For Refund</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="This modal provides the complete details of the approved refund request along with admin remarks, allowing staff to enter payment details and finalize the refund process."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        handleClose={() => {
          processRefundDialog.onFalse();
          setSelectedFeeRefund(null);
        }}
        maxWidth="sm"
      >
        <RefundProcessForm
          open={processRefundDialog}
          onClose={handleClose}
          student={selectedFeeRefund as IStudentFeeData}
        />
      </CustomDialog>
      {/* <CustomDialog
        open={viewConcessionRequest.value}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">View Concession</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="Review the student’s concession request and take action to approve or reject it."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        handleClose={() => {
          setSelectedConcession(null);
          viewConcessionRequest.onFalse();
        }}
        maxWidth="sm"
      >
        <ViewConcessionRequest
          viewConcessionRequest={viewConcessionRequest}
          onClose={() => {
            viewConcessionRequest.onFalse();
            setSelectedConcession(null);
          }}
          student={selectedConcessionForView as unknown as IStudentInfo}
          documents={selectedConcessionForView?.documents}
          onApprove={() => {
            // Handle approve logic
          }}
          onReject={() => {
            // Handle reject logic
          }}
          onMismatch={() => {
            // Handle mismatch logic
          }}
        />
      </CustomDialog>  */}
    </Box>
  );
};

export default FeeRefund;
