'use client';

import type { RootState } from 'src/redux/store';
import type { Board, Medium } from 'src/types/school';

import { Add } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Card, Button, Typography } from '@mui/material';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { FeeRefundStatusType } from 'src/enums/feeRefund-status-type';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useGetFeeRefundQuery } from 'src/redux/finance/RefundManagement/feeRefundManage';

import RefundRemarksForm from './Components/RefundRemarksForm';
import RefundProcessForm from './Components/RefundProcessForm';
import StudentFeeRefundTable from './Components/FeeRefundTable';
import FeeRefundFormComponent from './NewRefundForm/RefundForm';
import FeeRefundReasonApprovalForm from './Components/FeeRefuncRejectApproveForm';

import type { IStudentFeeData } from './type';

const DUMMY_FEE_REFUND_DATA: IStudentFeeData[] = [
  {
    id: 1,
    name: 'Aarav Sharma',
    avatarUrl: '',
    board: 'CBSE',
    medium: 'English',
    class: '10',
    division: 'A',
    grNo: 'GR001',
    rollNo: '101',
    totalPaidFees: 45000,
    totalPendingFees: 0,
    refundAmount: 5000,
    requestDate: '2026-04-10',
    reasonOfRefund: 'TC Issued',
    parentName: 'Rajesh Sharma',
    status: FeeRefundStatusType.Approved,
    refundMethod: 'Bank Transfer',
  },
  {
    id: 2,
    name: 'Priya Patel',
    avatarUrl: '',
    board: 'CBSE',
    medium: 'English',
    class: '9',
    division: 'B',
    grNo: 'GR002',
    rollNo: '205',
    totalPaidFees: 38000,
    totalPendingFees: 2000,
    refundAmount: 3000,
    requestDate: '2026-04-15',
    reasonOfRefund: 'Excess Payment',
    parentName: 'Suresh Patel',
    status: FeeRefundStatusType.Pending,
    refundMethod: 'Cash',
  },
  {
    id: 3,
    name: 'Rohan Mehta',
    avatarUrl: '',
    board: 'SSC',
    medium: 'Gujarati',
    class: '8',
    division: 'A',
    grNo: 'GR003',
    rollNo: '310',
    totalPaidFees: 30000,
    totalPendingFees: 0,
    refundAmount: 2500,
    requestDate: '2026-04-20',
    reasonOfRefund: 'School Transfer',
    parentName: 'Amit Mehta',
    status: FeeRefundStatusType.UnderReview,
    refundMethod: 'Cheque',
  },
  {
    id: 4,
    name: 'Sneha Joshi',
    avatarUrl: '',
    board: 'CBSE',
    medium: 'English',
    class: '7',
    division: 'C',
    grNo: 'GR004',
    rollNo: '412',
    totalPaidFees: 28000,
    totalPendingFees: 1000,
    refundAmount: 1500,
    requestDate: '2026-04-22',
    reasonOfRefund: 'Double Payment',
    parentName: 'Vijay Joshi',
    status: FeeRefundStatusType.Rejected,
    refundMethod: 'Bank Transfer',
  },
  {
    id: 5,
    name: 'Karan Desai',
    avatarUrl: '',
    board: 'SSC',
    medium: 'English',
    class: '11',
    division: 'A',
    grNo: 'GR005',
    rollNo: '502',
    totalPaidFees: 52000,
    totalPendingFees: 0,
    refundAmount: 7000,
    requestDate: '2026-04-28',
    reasonOfRefund: 'Stream Change',
    parentName: 'Nilesh Desai',
    status: FeeRefundStatusType.ImageUploaded,
    refundMethod: 'Bank Transfer',
  },
];

const FeeRefund = () => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

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
  const { data: feeRefundData } = useQueryAndMutation({
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
          data={feeRefundData?.length ? feeRefundData : DUMMY_FEE_REFUND_DATA}
          boards={boards || []}
          mediums={mediums || []}
          selectedBoard={selectedBoard}
          selectedMedium={selectedMedium}
          onBoardChange={(value) => {
            setSelectedBoard(value);
            setSelectedMedium('');
          }}
          onMediumChange={setSelectedMedium}
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
          <FeeRefundFormComponent onCancel={handleClose} />
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
        }}
        maxWidth="xs"
      >
        <FeeRefundReasonApprovalForm onClose={handleRequstClose} mode={selectedMode} />
      </CustomDialog>
    </Box>
  );
};

export default FeeRefund;
