'use client';

import type { RootState } from 'src/redux/store';
import type { Board, Medium } from 'src/types/school';

import { Add } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Card, Button, Typography } from '@mui/material';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetFeeRefundQuery } from 'src/redux/finance/feeRefund';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import RefundRemarksForm from './Components/RefundRemarksForm';
import RefundProcessForm from './Components/RefundProcessForm';
import StudentFeeRefundTable from './Components/FeeRefundTable';
import FeeRefundFormComponent from './NewRefundForm/RefundForm';
import FeeRefundReasonApprovalForm from './Components/FeeRefuncRejectApproveForm';

import type { IStudentFeeData } from './type';

const FeeRefund = () => {
  const {
    currentYear,
    currentBoard,
    currentMedium: medium,
    setCurrentMedium: setMedium,
  } = useSelector((state: RootState) => state.globalState);

  // Local state to store filtered boards based on academic year
  const [boards, setBoards] = useState([]);
  const [mediums, setMediums] = useState<Medium[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<string>('');
  const [selectedMedium, setSelectedMedium] = useState<string>('');
  // Boolean state to control the visibility of add concession request modal/form
  const addRefundRequest = useBoolean();
  const viewRefundRequest = useBoolean();
  const processRefundDialog = useBoolean();
  const onConfirmDialg = useBoolean();
  const [selectedMode, setSelectedMode] = useState('');
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
    if (isSubmit || (isChanges && window.confirm('Are u sure to leave this page ?'))) {
      setSelectedFeeRefund(null);
      addRefundRequest.onFalse();
      viewRefundRequest.onFalse();
      processRefundDialog.onFalse();
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      setSelectedFeeRefund(null);
      addRefundRequest.onFalse();
      viewRefundRequest.onFalse();
      processRefundDialog.onFalse();
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
  useEffect(() => {
    // Filter boards based on academic year ID from edit data
    setBoards(currentYear?.boards);
    const board = boards?.find((item: any) => item.id === selectedBoard);
    setMediums((board as unknown as Board)?.educationMediums || []);
  }, [boards, currentYear?.boards, selectedBoard]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {addRefundRequest.value ? (
        <CustomBreadcrumbs
          heading="Fee Refund"
          description="Form to record and request student fee refunds."
          links={[
            { name: 'Finance', href: '/finance/dashboard' },
            { name: 'Fee Refund', href: '/finance/fee-refund' },
          ]}
          isBack={addRefundRequest.value}
          onBack={() => {
            addRefundRequest.onFalse();
            setSelectedFeeRefund(null);
          }}
          sx={{ px: 1, mb: 2 }}
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
            >
              Fee Refund
            </Button>
          }
          sx={{ px: 1, mb: 2 }}
        />
      )}

      {!addRefundRequest.value && (
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <CustomSelect
            label="Board"
            options={boards || []}
            labelKey="name"
            valueKey="id"
            value={selectedBoard}
            onChange={(value) => {
              setSelectedBoard(value as string);
              setSelectedMedium('');
            }}
            formControlProps={{ sx: { maxWidth: '200px', width: '100%' } }}
          />
          <CustomSelect
            label="Medium"
            options={mediums || []}
            labelKey="name"
            disabled={!selectedBoard}
            valueKey="id"
            value={selectedMedium}
            onChange={(value) => setSelectedMedium(value as string)}
            formControlProps={{ sx: { maxWidth: '200px', width: '100%' } }}
          />
        </Box>
      )}

      {!addRefundRequest.value && (
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
      )}

      {addRefundRequest.value && (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <FeeRefundFormComponent
            onCancel={handleClose}
            student={selectedFeeRefund as IStudentFeeData}
          />
        </Card>
      )}

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
          setSelectedFeeRefund(null);
        }}
        maxWidth="xs"
      >
        <FeeRefundReasonApprovalForm onClose={handleRequstClose} mode={selectedMode} />
      </CustomDialog>
    </Box>
  );
};

export default FeeRefund;
