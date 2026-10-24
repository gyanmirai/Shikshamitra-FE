'use client';

import { useFinanceFormClose } from 'src/hooks/use-finance-form-close';
import type { RootState } from 'src/redux/store';

import { useState } from 'react';
import { Add } from '@mui/icons-material';

import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';

import { Box, Card, Button, Typography } from '@mui/material';
import { financePermissions } from 'src/constants/finance-menu';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';

import { useFinanceAcademicFilters } from 'src/screens/finance/hooks/useFinanceAcademicFilters';

import { useAdjustment } from './hooks/useAdjustment';
import AdjustmentForm from './components/AdjustmentForm';
import AdjustmentView from './components/AdjustmentView';
import AdjustmentTable from './components/AdjustmentTable';
import { useFinancePermissions } from '../hooks/useFinancePermissions';
import ApplyAdjustmentScreen from './components/ApplyAdjustmentScreen';
import { AdjustmentTabEnum, AdjustmentStatusEnum } from './enums/adjustment.enum';
import AdjustmentApproveRejectForm from './components/AdjustmentApproveRejectForm';

import type { AdjustmentRequest } from './types/adjustment.types';
import type { IAdjustmentFullFormValues } from './types/adjustmentFormValues';

const Adjustments = () => {
  const access = useFinancePermissions(financePermissions.fees.adjustment);
  const academicFilters = useFinanceAcademicFilters();
  const [activeTab, setActiveTab] = useState(AdjustmentTabEnum.Pending);
  const [selectedAdjustment, setSelectedAdjustment] = useState<AdjustmentRequest | null>(null);
  // Tracks whether the Apply screen was opened from View screen (true) or list table (false)
  const [applyFromView, setApplyFromView] = useState(false);

  const addDialog = useBoolean();
  const viewDialog = useBoolean();
  const confirmDialog = useBoolean();
  // applyScreen replaces applyDialog — Approve now opens a full-page screen
  const applyScreen = useBoolean();

  const { user } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch();

  const currentUserId = user?.id ?? '';
  const currentUserName = user?.name ?? user?.userName ?? 'User';

  const { tabCounts, createAdjustment, rejectAdjustment, refetch } = useAdjustment(activeTab);

  const { handleClose, confirmation: discardConfirmation } = useFinanceFormClose(
    addDialog.value || viewDialog.value,
    () => {
      addDialog.onFalse();
      viewDialog.onFalse();
      setSelectedAdjustment(null);
    },
    false,
    addDialog.value ? undefined : false
  );

  const handleConfirmClose = async (_e: any, isSubmit?: boolean, notes?: string) => {
    if (isSubmit && selectedAdjustment && access.canAdd) {
      try {
        await rejectAdjustment(selectedAdjustment.id, currentUserName, notes ?? '');
        shikshaMitraToast.success({ message: 'Adjustment request rejected.' });
        confirmDialog.onFalse();
        viewDialog.onFalse();
        setSelectedAdjustment(null);
        refetch();
      } catch (err: any) {
        shikshaMitraToast.error({
          message: err?.data?.error?.message || 'Failed to reject adjustment.',
        });
      }
    } else {
      confirmDialog.onFalse();
    }
  };

  const handleFormSubmit = async (values: IAdjustmentFullFormValues) => {
    if (!access.canAdd) return;
    try {
      await createAdjustment(values);
      shikshaMitraToast.success({ message: 'Adjustment request submitted successfully.' });
      handleClose(null, true);
      refetch();
    } catch (err: any) {
      shikshaMitraToast.error({
        message: err?.data?.error?.message || 'Failed to submit adjustment request.',
      });
    }
  };

  const handleView = (row: AdjustmentRequest) => {
    setSelectedAdjustment(row);
    viewDialog.onTrue();
  };

  // Navigate back from the approval screen — respects entry point
  const handleApproveScreenBack = () => {
    applyScreen.onFalse();
    if (applyFromView) {
      viewDialog.onTrue();
    } else {
      // Came from the list table — just show the table
      setSelectedAdjustment(null);
    }
    setApplyFromView(false);
  };

  const canApprove =
    access.canAdd &&
    (selectedAdjustment?.status === AdjustmentStatusEnum.Pending ||
      selectedAdjustment?.status === AdjustmentStatusEnum.PartiallyApplied) &&
    selectedAdjustment.requestedByUserId !== currentUserId;

  const renderBreadcrumbs = () => {
    if (addDialog.value) {
      return (
        <CustomBreadcrumbs
          description="Fill in the adjustment details against the student's paid fee records."
          heading="Create Adjustment"

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

    if (applyScreen.value && selectedAdjustment) {
      return (
        <CustomBreadcrumbs
          description="Distribute approved adjustment amount across the student's pending fees."
          heading="Apply Adjustment"

          links={[
            { name: 'Finance', href: '/finance/dashboard' },
            {
              name: 'Adjustments',
              href: '/finance/adjustments',
              onClick() {
                applyScreen.onFalse();
                viewDialog.onFalse();
                setSelectedAdjustment(null);
              },
            },
            {
              name: 'View Adjustment',
              onClick() {
                applyScreen.onFalse();
                viewDialog.onTrue();
              },
            },
            { name: 'Apply Adjustment' },
          ]}
          isBack={applyScreen.value}
          onBack={handleApproveScreenBack}
        />
      );
    }

    if (viewDialog.value) {
      return (
        <CustomBreadcrumbs
          description="Review the adjustment request details and take an approval action."
          heading="View Adjustment"

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
        description="Manage fee adjustment requests — create, review, and approve or reject adjustments against paid student fees."
        heading="Adjustments"

        links={[{ name: 'Finance', href: '/finance/dashboard' }, { name: 'Adjustments' }]}
      />
    );
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {discardConfirmation}
      {renderBreadcrumbs()}

      {!addDialog.value && !viewDialog.value && !applyScreen.value && (
        <AdjustmentTable
          primaryAction={
            <Button
              size="small"
              variant="contained"
              disabled={!access.canAdd}
              startIcon={<Add />}
              sx={{ px: 4 }}
              onClick={addDialog.onTrue}
            >
              New Adjustment
            </Button>
          }
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabCounts={tabCounts}
          onCreateAdjustment={() => {
            if (access.canAdd) addDialog.onTrue();
          }}
          onView={handleView}
          onApprove={(row) => {
            if (!access.canAdd) return;
            setSelectedAdjustment(row);
            setApplyFromView(false);
            applyScreen.onTrue();
          }}
          onReject={(row) => {
            if (!access.canAdd) return;
            setSelectedAdjustment(row);
            confirmDialog.onTrue();
          }}
          academicFilters={academicFilters}
        />
      )}

      {addDialog.value && access.canAdd && (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <AdjustmentForm
            onCancel={handleClose}
            onSubmit={handleFormSubmit}
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

      {viewDialog.value && selectedAdjustment && (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <AdjustmentView
            adjustmentId={selectedAdjustment.id}
            viewMeta={{
              id: selectedAdjustment.id,
              status: selectedAdjustment.status,
              requestedByUserId: selectedAdjustment.requestedByUserId,
            }}
            onClose={() => {
              viewDialog.onFalse();
              setSelectedAdjustment(null);
            }}
            onApprove={() => {
              // Navigate to the approval screen instead of opening a dialog
              viewDialog.onFalse();
              setApplyFromView(true);
              applyScreen.onTrue();
            }}
            onReject={() => {
              confirmDialog.onTrue();
            }}
            showApprove={canApprove}
            showReject={access.canAdd && selectedAdjustment.status === AdjustmentStatusEnum.Pending}
          />
        </Card>
      )}

      {/* ── Approval Screen (replaces ApplyAdjustmentDialog) ── */}
      {applyScreen.value && selectedAdjustment && access.canAdd && (
        <ApplyAdjustmentScreen
          approvedBy={currentUserName}
          adjustment={selectedAdjustment}
          fromView={applyFromView}
          onBack={handleApproveScreenBack}
          onApplied={async () => {
            applyScreen.onFalse();
            viewDialog.onFalse();
            setSelectedAdjustment(null);
            setApplyFromView(false);
            refetch();
          }}
        />
      )}

      <CustomDialog
        open={confirmDialog.value}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Reject Adjustment</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="Reject this adjustment request. A rejection reason is required."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        handleClose={() => {
          confirmDialog.onFalse();
        }}
        maxWidth="xs"
      >
        <AdjustmentApproveRejectForm mode="Reject" onClose={handleConfirmClose} />
      </CustomDialog>
    </Box>
  );
};

export default Adjustments;
