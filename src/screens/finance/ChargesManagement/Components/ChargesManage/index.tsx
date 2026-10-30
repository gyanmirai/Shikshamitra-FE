'use client';

import type { RootState } from 'src/redux/store';

import { useState } from 'react';
import { Add } from '@mui/icons-material';
import { GlobalIcons } from 'src/utils/icons';
import { formatNumber } from 'src/utils/formate_number';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

import {
  Box,
  Card,
  Stack,
  Alert,
  Button,
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { shikshaMitraToast } from 'src/components/toast';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import {
  useDeleteChargeMutation,
  useVoidChargeMutation,
} from 'src/redux/finance/ChargeManagement/chargeApi';
import { useFinanceAcademicFilters } from 'src/screens/finance/hooks/useFinanceAcademicFilters';
import CustomTooltip from 'src/components/custom-tooltip';

import ChargesTable from './Component/ChargesTable';
import { UpdateChargeForm } from '../UpdateChargeForm';
import ChargeDetailsCard from './Component/ViewChargeForm';
import { ChargeApprovalReview } from '../ChargeApprovalReview';
import ChargeReasonApprovalForm from './Component/ChargeApproveRejectForm';

import type { IChargeData } from './Component/type';
import { useChargePermissions } from '../../useChargePermissions';

const ChargesManagement = () => {
  // State to store the currently selected charge data
  const [selectedChargeData, setSelectedChargeData] = useState<IChargeData | null>(null);
  const [unsavedClose, setUnsavedClose] = useState<'create' | 'edit' | null>(null);
  const addChargeDialog = useBoolean();
  const onConfirmDialg = useBoolean();
  const academicFilters = useFinanceAcademicFilters();
  const permissions = useChargePermissions();

  // Lifted state for tab selection to persist across dialog open/close
  const [selectedTab, setSelectedTab] = useState<string | number>(0);

  // Trigger refetch when charges are modified (create/edit/delete)
  const [refetchTrigger, setRefetchTrigger] = useState<number>(0);

  const [deleteCharge] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteChargeMutation,
  });
  const [voidCharge, { isLoading: isVoiding }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useVoidChargeMutation,
  });
  const [voidReason, setVoidReason] = useState('');

  const [selectedMode, setSelectedMode] = useState('');

  // Boolean hooks to control dialog visibility
  const viewChargeDetailsDialog = useBoolean();
  const editChargeDialog = useBoolean();
  const removeChargeDialog = useBoolean();
  const voidChargeDialog = useBoolean();
  const approvalReviewDialog = useBoolean();

  // Redux state and dispatch
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

  /**
   * Handles closing of the add charge dialog
   * @param _e - Event object (unused)
   * @param isSubmit - Boolean indicating if form was submitted
   */
  const handleClose = (_e: any, isSubmit?: boolean, discardConfirmed = false) => {
    if (isChanges && !isSubmit && !discardConfirmed) {
      setUnsavedClose('create');
      return;
    }
    // Helper function to reset changes state after a delay
    const resetState = () => {
      dispatch(setIsChanges(false));
    };

    // Close dialog if form was submitted or user confirms leaving with unsaved changes
    if (isSubmit || discardConfirmed) {
      onConfirmDialg.onFalse();
      viewChargeDetailsDialog.onFalse();
      setSelectedMode('');
      setSelectedChargeData(null);
      addChargeDialog.onFalse();
      if (isSubmit) {
        setRefetchTrigger((prev) => prev + 1); // Trigger refetch of charges table
      }
      resetState();
    } else if (!isChanges) {
      onConfirmDialg.onFalse();
      viewChargeDetailsDialog.onFalse();
      setSelectedMode('');
      setSelectedChargeData(null);
      // Close dialog if there are no unsaved changes
      addChargeDialog.onFalse();
    }
  };

  /**
   * Handles closing of the edit charge dialog
   * @param _e - Event object (unused)
   * @param isSubmit - Boolean indicating if form was submitted
   */
  const handleEditClose = (_e: any, isSubmit?: boolean, discardConfirmed = false) => {
    if (isChanges && !isSubmit && !discardConfirmed) {
      setUnsavedClose('edit');
      return;
    }
    // Helper function to reset changes state after a delay
    const resetState = () => {
      dispatch(setIsChanges(false));
      setSelectedChargeData(null);
    };

    // Close dialog if form was submitted or user confirms leaving with unsaved changes
    if (isSubmit || discardConfirmed) {
      editChargeDialog.onFalse();
      if (isSubmit) {
        setRefetchTrigger((prev) => prev + 1); // Trigger refetch of charges table
      }
      resetState();
    } else if (!isChanges) {
      // Close dialog if there are no unsaved changes
      editChargeDialog.onFalse();
      setSelectedChargeData(null);
    }
  };

  const openApprovalReview = (data: IChargeData, mode: 'Approve' | 'Reject') => {
    const chargeId = data.chargeId || data.id;
    const permitted =
      mode === 'Approve'
        ? permissions.canApprove && data.availableActions?.includes('Approve')
        : permissions.canReject && data.availableActions?.includes('Reject');

    if (!permitted) {
      shikshaMitraToast.error({
        message: `You are not allowed to ${mode.toLowerCase()} this charge.`,
      });
      return;
    }

    if (!chargeId) {
      shikshaMitraToast.error({
        message: 'The charge could not be opened. Refresh the list and try again.',
      });
      return;
    }

    setSelectedChargeData({ ...data, chargeId });
    setSelectedMode(mode);
    approvalReviewDialog.onTrue();
  };

  const handleVoidClose = () => {
    if (isVoiding) return;
    voidChargeDialog.onFalse();
    setSelectedChargeData(null);
    setVoidReason('');
  };

  return (
    <Box sx={{ height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      {viewChargeDetailsDialog.value ? (
        <CustomBreadcrumbs
          description="View and manage student charges."
          heading="View Charge"

          links={[
            { name: 'Finance', href: '/finance/dashboard' },
            { name: 'Fees', href: '/finance/charge-management' },
            {
              name: 'Charges',
              href: '/finance/charge-management',
              onClick(e) {
                viewChargeDetailsDialog.onFalse();
                setSelectedChargeData(null);
              },
            },
            { name: 'View Charge' },
          ]}
          isBack
          onBack={() => {
            viewChargeDetailsDialog.onFalse();
            setSelectedChargeData(null);
          }}
        />
      ) : addChargeDialog.value ? (
        <CustomBreadcrumbs
          description="Create a new charge for students."
          heading="Add Charge"

          links={[
            { name: 'Finance', href: '/finance/dashboard' },
            { name: 'Fees', href: '/finance/charge-management' },
            {
              name: 'Charges',
              href: '/finance/charge-management',
              onClick(e) {
                e.preventDefault();
                handleClose(null, false);
              },
            },
            { name: 'Add Charge' },
          ]}
          isBack
          onBack={() => {
            handleClose(null, false);
          }}
        />
      ) : editChargeDialog.value ? (
        <CustomBreadcrumbs
          description="Edit and update charge details and mappings."
          heading="Update Charge"

          links={[
            { name: 'Finance', href: '/finance/dashboard' },
            { name: 'Fees', href: '/finance/charge-management' },
            {
              name: 'Charges',
              href: '/finance/charge-management',
              onClick(e) {
                e.preventDefault();
                handleEditClose(null, false);
              },
            },
            { name: 'Update Charge' },
          ]}
          isBack
          onBack={() => {
            handleEditClose(null, false);
          }}
          sx={{ px: 1 }}
        />
      ) : approvalReviewDialog.value ? (
        <CustomBreadcrumbs
          description={
            selectedMode === 'Approve'
              ? 'Review and approve the charge for selected students.'
              : 'Review and reject the charge request.'
          }
          heading={selectedMode === 'Approve' ? 'Approve Charge' : 'Reject Charge'}

          links={[
            { name: 'Finance', href: '/finance/dashboard' },
            { name: 'Fees', href: '/finance/charge-management' },
            {
              name: 'Charges',
              href: '/finance/charge-management',
              onClick(e) {
                approvalReviewDialog.onFalse();
                setSelectedChargeData(null);
                setSelectedMode('');
              },
            },
            { name: selectedMode === 'Approve' ? 'Approve Charge' : 'Reject Charge' },
          ]}
          isBack
          onBack={() => {
            approvalReviewDialog.onFalse();
            setSelectedChargeData(null);
            setSelectedMode('');
          }}
          sx={{ px: 1 }}
        />
      ) : (
        <CustomBreadcrumbs
          description="This screen shows a list of all existing charges with an option to create a new one. charges including tuition fees, exam fees, and other miscellaneous charges."
          heading="Charges"

          links={[
            { name: 'Finance', href: '/finance/dashboard' },
            { name: 'Fees', href: '/finance/charge-management' },
            { name: 'Charges', href: '/finance/charge-management' },
          ]}
        />
      )}
      {!addChargeDialog.value &&
        !viewChargeDetailsDialog.value &&
        !editChargeDialog.value &&
        !approvalReviewDialog.value && (
          <ChargesTable
            primaryAction={
              permissions.canAdd ? (
                <Button
                  startIcon={<Add />}
                  variant="contained"
                  onClick={addChargeDialog.onTrue}
                  size="small"
                  sx={{ px: 4 }}
                >
                  Add Charge
                </Button>
              ) : undefined
            }
            academicFilters={academicFilters}
            onView={(data) => {
              viewChargeDetailsDialog.onTrue();
              setSelectedChargeData(data);
            }}
            onEdit={(data) => {
              editChargeDialog.onTrue();
              setSelectedChargeData(data);
            }}
            onAddCharge={() => {
              addChargeDialog.onTrue();
            }}
            onApprove={(data) => {
              openApprovalReview(data, 'Approve');
            }}
            onReject={(data) => {
              openApprovalReview(data, 'Reject');
            }}
            onVoid={(data) => {
              if (!data.availableActions?.includes('Void')) return;
              setSelectedChargeData(data);
              setVoidReason('');
              voidChargeDialog.onTrue();
            }}
            onRemove={(data) => {
              removeChargeDialog.onTrue();
              setSelectedChargeData(data);
            }}
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
            refetchTrigger={refetchTrigger}
          />
        )}

      {/* Add Charge Dialog */}
      {addChargeDialog.value && (
        <Card
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: 'var(--shadows-4)',
          }}
        >
          <UpdateChargeForm
            open={addChargeDialog}
            onClose={handleClose}
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

      {/* Edit Charge Dialog */}
      {editChargeDialog.value && selectedChargeData?.chargeId && (
        <Card
          sx={{
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: 'var(--shadows-4)',
          }}
        >
          <UpdateChargeForm
            chargeId={selectedChargeData.chargeId}
            open={editChargeDialog}
            onClose={handleEditClose}
          />
        </Card>
      )}

      {/* View Charge Dialog */}
      {viewChargeDetailsDialog.value && (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <ChargeDetailsCard
            charge={selectedChargeData}
            isActionShow={false}
            onApprove={() => {
              onConfirmDialg.onTrue();
              setSelectedMode('Approve');
              setSelectedChargeData(selectedChargeData);
            }}
            onReject={() => {
              onConfirmDialg.onTrue();
              setSelectedMode('Reject');
              setSelectedChargeData(selectedChargeData);
            }}
            onCancel={() => {
              viewChargeDetailsDialog.onFalse();
              setSelectedChargeData(null);
            }}
          />
        </Card>
      )}

      {/* Charge Approval Review Screen */}
      {approvalReviewDialog.value && selectedChargeData?.chargeId && (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <ChargeApprovalReview
            chargeId={selectedChargeData.chargeId}
            mode={(selectedMode.toLowerCase() as 'approve' | 'reject') || 'approve'}
            open={approvalReviewDialog.value}
            onClose={() => {
              approvalReviewDialog.onFalse();
              setSelectedChargeData(null);
              setSelectedMode('');
              setRefetchTrigger((prev) => prev + 1); // Trigger refetch of charges table
            }}
          />
        </Card>
      )}

      <CustomDialog
        open={onConfirmDialg.value}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {selectedMode === 'Approve' ? 'Approve Charge' : 'Reject Charge'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title={selectedMode === 'Approve' ? 'Approve the charge' : 'Reject the charge'}
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        handleClose={() => {
          onConfirmDialg.onFalse();
          setSelectedMode('');
          if (!viewChargeDetailsDialog.value) {
            setSelectedChargeData(null);
          }
        }}
        maxWidth="xs"
      >
        <ChargeReasonApprovalForm
          onClose={(_e: any, isSubmit?: boolean) => {
            onConfirmDialg.onFalse();
            setSelectedMode('');
            if (isSubmit) {
              viewChargeDetailsDialog.onFalse();
              setSelectedChargeData(null);
            }
          }}
          mode={selectedMode}
          selectedCharge={selectedChargeData}
        />
      </CustomDialog>
      <ConfirmDialog
        open={removeChargeDialog.value}
        onClose={() => {
          setSelectedChargeData(null);
          removeChargeDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete charge{' '}
            <strong>{selectedChargeData?.categoryName}</strong>?
          </>
        }
        action={
          <Button
            startIcon={<Iconify icon="mdi:delete-outline" />}
            variant="contained"
            color="error"
            size="small"
            onClick={async () => {
              removeChargeDialog.onFalse();
              if (selectedChargeData) {
                try {
                  await deleteCharge({ id: selectedChargeData.chargeId }).unwrap();
                  setSelectedChargeData(null);
                  setRefetchTrigger((prev) => prev + 1);
                  shikshaMitraToast.success({ message: 'Charge deleted successfully.' });
                } catch (error: any) {
                  shikshaMitraToast.error({
                    message: error?.data?.error?.message || 'Charge could not be deleted.',
                  });
                }
              }
            }}
          >
            Yes
          </Button>
        }
      />
      <CustomDialog
        open={voidChargeDialog.value}
        handleClose={handleVoidClose}
        title="Cancel Charge"
        titleInfo="Review the affected charge and enter the reason for cancellation."
        maxWidth="sm"
        hasForm={false}
        guardUnsavedChanges={false}
        disableClose={isVoiding}
        aria-describedby="cancel-charge-description"
      >
        <DialogScrollContent>
          <Stack spacing={2}>
            <Typography id="cancel-charge-description" variant="body2">
              Cancel the approved, uncollected charges in this batch. Cancelled charges will no
              longer be available for collection.
            </Typography>
            <Box component="dl" sx={{ m: 0 }}>
              {[
                [
                  'Charge name',
                  selectedChargeData?.chargeName || selectedChargeData?.purposeDescription || '—',
                ],
                ['Category', selectedChargeData?.categoryName || '—'],
                [
                  'Amount per student',
                  selectedChargeData ? formatNumber(selectedChargeData.amount, 'INR') : '—',
                ],
              ].map(([label, value]) => (
                <Box
                  key={label}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: 'minmax(0, 1fr) minmax(0, 1.5fr)' },
                    gap: { xs: 0.5, sm: 2 },
                    py: 1,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography component="dt" variant="body2" color="text.secondary">
                    {label}
                  </Typography>
                  <Typography
                    component="dd"
                    variant="body2"
                    sx={{ m: 0, fontWeight: 600, overflowWrap: 'anywhere' }}
                  >
                    {value}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Alert severity="warning">
              Charges with a collection cannot be cancelled. Use reconciliation to reverse the
              collection, or use the refund workflow to return a payment.
            </Alert>
            <TextField
              autoFocus
              fullWidth
              multiline
              minRows={3}
              size="small"
              required
              label="Cancellation reason"
              value={voidReason}
              disabled={isVoiding}
              onChange={(event) => setVoidReason(event.target.value)}
              error={voidReason.length > 0 && voidReason.trim().length < 10}
              helperText="Explain why this charge is being cancelled (at least 10 characters)."
            />
          </Stack>
        </DialogScrollContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button
            type="button"
            size="small"
            variant="outlined"
            color="inherit"
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
            disabled={isVoiding}
            onClick={handleVoidClose}
          >
            Keep charge
          </Button>
          <Button
            type="button"
            size="small"
            loading={isVoiding}
            loadingPosition="start"
            startIcon={<Iconify icon="mdi:cancel" />}
            variant="contained"
            color="error"
            disabled={
              isVoiding ||
              voidReason.trim().length < 10 ||
              !selectedChargeData?.availableActions?.includes('Void')
            }
            onClick={async () => {
              if (!selectedChargeData?.availableActions?.includes('Void') || isVoiding) return;
              try {
                await voidCharge({
                  id: selectedChargeData.chargeId,
                  body: {
                    studentIds: [],
                    concurrencyStamp: selectedChargeData.concurrencyStamp,
                    reason: voidReason.trim(),
                  },
                }).unwrap();
                shikshaMitraToast.success({ message: 'Charge cancelled successfully.' });
                voidChargeDialog.onFalse();
                setSelectedChargeData(null);
                setVoidReason('');
                setRefetchTrigger((prev) => prev + 1);
              } catch (error: any) {
                shikshaMitraToast.error({
                  message: error?.data?.error?.message || 'Charge could not be cancelled.',
                });
              }
            }}
          >
            Cancel charge
          </Button>
        </DialogActions>
      </CustomDialog>
      <ConfirmDialog
        open={unsavedClose !== null}
        icon="warning"
        title="Discard unsaved changes?"
        content="Your charge has unsaved changes. Leaving will discard them."
        onClose={() => setUnsavedClose(null)}
        action={
          <Button
            startIcon={<Iconify icon="mdi:exit-to-app" />}
            variant="contained"
            color="warning"
            onClick={() => {
              if (unsavedClose === 'create') handleClose(null, false, true);
              if (unsavedClose === 'edit') handleEditClose(null, false, true);
              setUnsavedClose(null);
            }}
          >
            Discard changes
          </Button>
        }
      />
    </Box>
  );
};

export default ChargesManagement;
