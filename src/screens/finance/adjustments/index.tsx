'use client';

import type { RootState } from 'src/redux/store';

import { Suspense, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Box, Card, Button, Typography, LinearProgress } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { financePaths, financePermissions } from 'src/constants/finance-menu';
import { useFinanceFormClose } from 'src/hooks/use-finance-form-close';
import { useFinanceAcademicFilters } from 'src/screens/finance/hooks/useFinanceAcademicFilters';
import type { IAdjustmentFullFormValues } from './types/adjustmentFormValues';
import type { AdjustmentRequest } from './types/adjustment.types';

import { useAdjustment } from './hooks/useAdjustment';
import AdjustmentForm from './components/AdjustmentForm';
import AdjustmentView from './components/AdjustmentView';
import AdjustmentTable from './components/AdjustmentTable';
import ApplyAdjustmentScreen from './components/ApplyAdjustmentScreen';
import { useFinancePermissions } from '../hooks/useFinancePermissions';
import { AdjustmentStatusEnum } from './enums/adjustment.enum';
import AdjustmentApproveRejectForm from './components/AdjustmentApproveRejectForm';

export default function Adjustments() {
  const access = useFinancePermissions(financePermissions.fees.adjustment);
  const academicFilters = useFinanceAcademicFilters();
  const canCreateAdjustment =
    access.canAdd && academicFilters.requestCapabilities?.adjustment.add === true;
  const user = useSelector((state: RootState) => state.auth.user);
  const [mode, setMode] = useState<'list' | 'create' | 'apply'>('list');
  const [selected, setSelected] = useState<AdjustmentRequest | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [fromView, setFromView] = useState(false);
  const [workflowBusy, setWorkflowBusy] = useState(false);
  const completed = useRef(false);
  const { createAdjustment, rejectAdjustment, isCreating, isRejecting } = useAdjustment();
  const busy = workflowBusy || isCreating;
  const canReview = (row: AdjustmentRequest, action: 'Approve' | 'Reject') =>
    Boolean(
      (action === 'Approve' ? access.canApprove : access.canReject) &&
      user?.sub &&
      row.requestedByUserId !== user.sub &&
      row.availableActions?.includes(action)
    );
  const { handleClose, confirmation } = useFinanceFormClose(
    mode !== 'list',
    () => {
      const returnToDetails = mode === 'apply' && fromView && !completed.current;
      completed.current = false;
      setMode('list');
      setViewOpen(returnToDetails);
      if (!returnToDetails) setSelected(null);
      setFromView(false);
    },
    busy
  );
  const { handleClose: closeRejection, confirmation: rejectConfirmation } = useFinanceFormClose(
    rejectOpen,
    () => setRejectOpen(false),
    isRejecting
  );
  const closeDetails = () => {
    setViewOpen(false);
    setSelected(null);
  };
  const apply = (row: AdjustmentRequest, fromDetails: boolean) => {
    if (
      !canReview(row, 'Approve') ||
      ![AdjustmentStatusEnum.Pending, AdjustmentStatusEnum.PartiallyApplied].includes(row.status)
    )
      return;
    setSelected(row);
    setFromView(fromDetails);
    setViewOpen(false);
    setMode('apply');
  };
  const reject = (row: AdjustmentRequest) => {
    if (!canReview(row, 'Reject') || row.status !== AdjustmentStatusEnum.Pending) return;
    setSelected(row);
    setRejectOpen(true);
  };
  const submit = async (values: IAdjustmentFullFormValues) => {
    if (!canCreateAdjustment) throw new Error('Adjustment initiation is unavailable.');
    const result = await createAdjustment(values);
    shikshaMitraToast.success({
      message:
        result?.appliedAmount > 0
          ? 'Adjustment approved and applied successfully.'
          : 'Adjustment request submitted successfully.',
    });
  };
  const submitRejection = async (_event: unknown, submitted = false, notes?: string) => {
    if (!submitted) {
      closeRejection();
      return;
    }
    if (
      !selected ||
      !canReview(selected, 'Reject') ||
      selected.status !== AdjustmentStatusEnum.Pending
    )
      return;
    try {
      await rejectAdjustment(selected.id, user?.name || user?.userName || 'User', notes ?? '');
      shikshaMitraToast.success({ message: 'Adjustment request rejected.' });
      closeRejection(null, true);
      closeDetails();
    } catch (error) {
      shikshaMitraToast.error({ message: parseApiProblemDetail(error).detail });
    }
  };
  const title =
    mode === 'create' ? 'Create Adjustment' : mode === 'apply' ? 'Apply Adjustment' : 'Adjustments';

  return (
    <Box sx={{ height: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading={title}
        description={
          mode === 'create'
            ? 'Select the student, source fee installments and amount to request an adjustment.'
            : mode === 'apply'
              ? 'Allocate the available adjustment to outstanding fees and review before applying.'
              : 'Create, review and apply non-cash student fee adjustments.'
        }
        links={[
          { name: 'Finance', href: financePaths.dashboard },
          ...(mode !== 'list'
            ? [
                {
                  name: 'Adjustments',
                  href: financePaths.fees.adjustments,
                  onClick: (event: React.MouseEvent) => {
                    event.preventDefault();
                    handleClose();
                  },
                },
              ]
            : []),
          { name: title },
        ]}
        isBack={mode !== 'list'}
        backDisabled={busy}
        onBack={() => handleClose()}
        action={
          mode === 'list' && canCreateAdjustment ? (
            <Button
              size="small"
              variant="contained"
              startIcon={<Iconify icon={GlobalIcons.addIcon} />}
              onClick={() => {
                closeDetails();
                setMode('create');
              }}
            >
              New adjustment
            </Button>
          ) : undefined
        }
      />
      {mode === 'list' && (
        <Suspense fallback={<LinearProgress aria-label="Loading adjustments" />}>
          <AdjustmentTable
            academicFilters={academicFilters}
            onCreateAdjustment={() => {
              if (canCreateAdjustment) setMode('create');
            }}
            onView={(row) => {
              if (access.canView) {
                setSelected(row);
                setViewOpen(true);
              }
            }}
            onApprove={(row) => apply(row, false)}
            onReject={reject}
          />
        </Suspense>
      )}
      {mode === 'create' && canCreateAdjustment && (
        <Card
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          <AdjustmentForm
            scopeOptions={academicFilters.scopeOptions}
            onCancel={handleClose}
            onSubmit={submit}
            onBusyChange={setWorkflowBusy}
            defaultBoardId={academicFilters.selectedBoard}
            defaultMediumId={academicFilters.selectedMedium}
            defaultStandardId={
              academicFilters.selectedStandardId === 'All Classes'
                ? ''
                : academicFilters.selectedStandardId
            }
            defaultDivisionId={
              academicFilters.selectedDivisionId === 'All Divisions'
                ? ''
                : academicFilters.selectedDivisionId
            }
          />
        </Card>
      )}
      {viewOpen && selected && (
        <AdjustmentView
          adjustmentId={selected.id}
          viewMeta={{
            id: selected.id,
            status: selected.status,
            requestedByUserId: selected.requestedByUserId,
          }}
          onClose={closeDetails}
          onApprove={() => apply(selected, true)}
          onReject={() => reject(selected)}
          showApprove={canReview(selected, 'Approve')}
          showReject={canReview(selected, 'Reject')}
        />
      )}
      {mode === 'apply' && selected && canReview(selected, 'Approve') && (
        <ApplyAdjustmentScreen
          key={selected.id}
          approvedBy={user?.name || user?.userName || 'User'}
          adjustment={selected}
          fromView={fromView}
          onBack={() => handleClose()}
          onBusyChange={setWorkflowBusy}
          onApplied={() => {
            completed.current = true;
            handleClose(null, true);
          }}
        />
      )}
      <CustomDialog
        open={rejectOpen}
        title="Reject Adjustment Request"
        titleInfo="Record a meaningful reason to reject this request. The requester cannot reject their own adjustment."
        guardUnsavedChanges={false}
        disableClose={isRejecting}
        handleClose={() => closeRejection()}
        maxWidth="xs"
      >
        {rejectOpen && (
          <>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ px: 2, pb: 2, overflowWrap: 'anywhere' }}
            >
              {selected?.studentName}
              {selected?.studentGrNo ? ` · GR ${selected.studentGrNo}` : ''}
            </Typography>
            <AdjustmentApproveRejectForm
              mode="Reject"
              onClose={submitRejection}
              loading={isRejecting}
            />
          </>
        )}
      </CustomDialog>
      {confirmation}
      {rejectConfirmation}
    </Box>
  );
}
