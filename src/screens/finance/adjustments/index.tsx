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
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import { useAdjustment } from './hooks/useAdjustment';
import AdjustmentForm from './components/AdjustmentForm';
import AdjustmentView from './components/AdjustmentView';
import AdjustmentTable from './components/AdjustmentTable';
import ApplyAdjustmentDialog from './components/ApplyAdjustmentDialog';
import AdjustmentApproveRejectForm from './components/AdjustmentApproveRejectForm';

import type { AdjustmentRequest } from './types/adjustment.types';

const Adjustments = () => {
  const [selectedBoard, setSelectedBoard] = useState('');
  const [selectedMedium, setSelectedMedium] = useState('');
  const [selectedAdjustment, setSelectedAdjustment] = useState<AdjustmentRequest | null>(null);
  const [selectedMode, setSelectedMode] = useState<'Approve' | 'Reject' | ''>('');

  const addDialog = useBoolean();
  const viewDialog = useBoolean();
  const confirmDialog = useBoolean();
  const applyDialog = useBoolean();

  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

  const { adjustments, createAdjustment, applyApprovedAdjustment, rejectAdjustment } =
    useAdjustment();

  // ── Logged-in user (replace with actual auth selector) ──────────────────
  const currentUser = 'Admin User';

  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure to leave this page?'))) {
      addDialog.onFalse();
      viewDialog.onFalse();
      setSelectedAdjustment(null);
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      addDialog.onFalse();
      viewDialog.onFalse();
      setSelectedAdjustment(null);
    }
  };

  const handleConfirmClose = (_e: any, isSubmit?: boolean, notes?: string) => {
    if (isSubmit && selectedAdjustment) {
      if (selectedMode === 'Reject') {
        rejectAdjustment(selectedAdjustment.id, currentUser, notes ?? '');
        shikshaMitraToast.success({ message: 'Adjustment request rejected.' });
      }
      confirmDialog.onFalse();
      setSelectedMode('');
      viewDialog.onFalse();
      setSelectedAdjustment(null);
    } else {
      confirmDialog.onFalse();
      setSelectedMode('');
    }
  };

  const handleFormSubmit = (values: any) => {
    createAdjustment(
      {
        studentId: values.studentId,
        studentName: values.studentName,
        studentGrNo: values.grNo,
        className: values.standardId,
        divisionName: values.divisionId,
        rollNumber: '',
        contactNo: '',
        totalPaidFees: values.totalPaidFees,
        paidFeeDetails: values.paidFeeDetails,
      },
      {
        adjustmentType: values.adjustmentType,
        adjustmentAmount: values.adjustmentAmount,
        reason: values.reason,
        remarks: values.remarks,
      },
      currentUser
    );
    shikshaMitraToast.success({ message: 'Adjustment request submitted successfully.' });
    handleClose(null, true);
  };

  // ── Breadcrumb section ───────────────────────────────────────────────────
  const renderBreadcrumbs = () => {
    if (addDialog.value) {
      return (
        <CustomBreadcrumbs
          heading="Create Adjustment"
          description="Fill in the adjustment details against the student's paid fee records."
          links={[
            { name: 'Finance', href: '/finance/dashboard' },
            {
              name: 'Adjustments',
              href: '/finance/adjustments',
              onClick() {
                addDialog.onFalse();
                setSelectedAdjustment(null);
              },
            },
            { name: 'Create Adjustment' },
          ]}
          isBack={addDialog.value}
          onBack={() => handleClose(null, false)}
        />
      );
    }

    if (viewDialog.value) {
      return (
        <CustomBreadcrumbs
          heading="View Adjustment"
          description="Review the adjustment request details and take an approval action."
          links={[
            { name: 'Finance', href: '/finance/dashboard' },
            {
              name: 'Adjustments',
              href: '/finance/adjustments',
              onClick() {
                viewDialog.onFalse();
                setSelectedAdjustment(null);
              },
            },
            { name: 'View Adjustment' },
          ]}
          isBack={viewDialog.value}
          onBack={() => {
            viewDialog.onFalse();
            setSelectedAdjustment(null);
          }}
        />
      );
    }

    return (
      <CustomBreadcrumbs
        heading="Adjustments"
        description="Manage fee adjustment requests — create, review, and approve or reject adjustments against paid student fees."
        links={[{ name: 'Finance', href: '/finance/dashboard' }, { name: 'Adjustments' }]}
        action={
          <Button
            size="small"
            variant="contained"
            startIcon={<Add />}
            sx={{ px: '32px' }}
            onClick={() => {
              addDialog.onTrue();
            }}
          >
            New Adjustment
          </Button>
        }
      />
    );
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {renderBreadcrumbs()}

      {/* ── Main Table ──────────────────────────────────────────── */}
      {!addDialog.value && !viewDialog.value && (
        <AdjustmentTable
          data={adjustments}
          selectedBoard={selectedBoard}
          setSelectedBoard={setSelectedBoard}
          selectedMedium={selectedMedium}
          setSelectedMedium={setSelectedMedium}
          onCreateAdjustment={(row) => {
            setSelectedAdjustment(row);
            addDialog.onTrue();
          }}
          onView={(row) => {
            setSelectedAdjustment(row);
            viewDialog.onTrue();
          }}
        />
      )}

      {/* ── Create Adjustment Form ──────────────────────────────── */}
      {addDialog.value && (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <AdjustmentForm onCancel={handleClose} onSubmit={handleFormSubmit} />
        </Card>
      )}

      {/* ── View Adjustment ─────────────────────────────────────── */}
      {viewDialog.value && selectedAdjustment && (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <AdjustmentView
            student={selectedAdjustment}
            onClose={() => {
              viewDialog.onFalse();
              setSelectedAdjustment(null);
            }}
            onApprove={() => {
              applyDialog.onTrue();
            }}
            onReject={() => {
              setSelectedMode('Reject');
              confirmDialog.onTrue();
            }}
          />
        </Card>
      )}

      <ApplyAdjustmentDialog
        open={applyDialog.value}
        approvedBy={currentUser}
        adjustment={selectedAdjustment}
        onClose={() => {
          applyDialog.onFalse();
        }}
        onApplied={(result) => {
          if (!selectedAdjustment) return;

          applyApprovedAdjustment(selectedAdjustment.id, currentUser, result);
          applyDialog.onFalse();
          viewDialog.onFalse();
          setSelectedAdjustment(null);
        }}
      />

      {/* ── Approve / Reject Confirm Dialog ──────────────────────── */}
      <CustomDialog
        open={confirmDialog.value}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Reject Adjustment</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title={
                selectedMode === 'Approve'
                  ? 'Approve this adjustment request. Add optional remarks.'
                  : 'Reject this adjustment request. A rejection reason is required.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        handleClose={() => {
          confirmDialog.onFalse();
          setSelectedMode('');
        }}
        maxWidth="xs"
      >
        <AdjustmentApproveRejectForm mode="Reject" onClose={handleConfirmClose} />
      </CustomDialog>
    </Box>
  );
};

export default Adjustments;
