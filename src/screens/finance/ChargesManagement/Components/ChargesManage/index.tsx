'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useSelector, useDispatch } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { Box, Card, Button, Typography } from '@mui/material';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useGetChargesQuery } from 'src/redux/finance/ChargeManagement/chargeApi';

import ChargeForm from './Component/ChargeForm';
import ChargesTable from './Component/ChargesTable';
import ChargeDetailsCard from './Component/ViewChargeForm';
import ChargeReasonApprovalForm from './Component/ChargeApproveRejectForm';

import type { IChargeData } from './Component/type';

const ChargesManagement = () => {
  // State to store the currently selected charge data
  const [selectedChargeData, setSelectedChargeData] = useState<IChargeData | null>(null);
  const addChargeDialog = useBoolean();
  const onConfirmDialg = useBoolean();

  // Fetch charge data using custom query hook
  const { data: chargeData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetChargesQuery,
  });
  const [selectedMode, setSelectedMode] = useState('');

  // Boolean hooks to control dialog visibility
  const viewChargeDetailsDialog = useBoolean();
  const editChargeDialog = useBoolean();
  const removeChargeDialog = useBoolean();

  // Redux state and dispatch
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

  /**
   * Handles closing of the add charge dialog
   * @param _e - Event object (unused)
   * @param isSubmit - Boolean indicating if form was submitted
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    // Helper function to reset changes state after a delay
    const resetState = () => {
      setTimeout(() => {
        dispatch(setIsChanges(false));
      }, 200);
    };

    // Close dialog if form was submitted or user confirms leaving with unsaved changes
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      onConfirmDialg.onFalse();
      setSelectedMode('');
      setSelectedChargeData(null);
      addChargeDialog.onFalse();
      // viewChargeDetailsDialog.onFalse();
      resetState();
    } else if (!isChanges) {
      onConfirmDialg.onFalse();
      setSelectedMode('');
      setSelectedChargeData(null);
      // viewChargeDetailsDialog.onFalse();
      // Close dialog if there are no unsaved changes
      addChargeDialog.onFalse();
    }
  };

  /**
   * Handles closing of the edit charge dialog
   * @param _e - Event object (unused)
   * @param isSubmit - Boolean indicating if form was submitted
   */
  const handleEditClose = (_e: any, isSubmit?: boolean) => {
    // Helper function to reset changes state after a delay
    const resetState = () => {
      setTimeout(() => {
        dispatch(setIsChanges(false));
        setSelectedChargeData(null);
      }, 200);
    };

    // Close dialog if form was submitted or user confirms leaving with unsaved changes
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      editChargeDialog.onFalse();
      resetState();
    } else if (!isChanges) {
      // Close dialog if there are no unsaved changes
      editChargeDialog.onFalse();
      setSelectedChargeData(null);
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {viewChargeDetailsDialog.value ? (
        <CustomBreadcrumbs
          heading="View Charge"
          description="View and manage student charges."
          links={[
            { name: 'Finance', href: '/finance/dashboard' },
            {
              name: 'Charges',
              href: '/finance/charge-management/chargesRequest',
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
          sx={{ mb: 2 }}
        />
      ) : addChargeDialog.value ? (
        <CustomBreadcrumbs
          heading="Add Charge"
          description="View and manage student charges."
          links={[
            { name: 'Finance', href: '/finance/dashboard' },
            {
              name: 'Charges',
              href: '/finance/charge-management/chargesRequest',
              onClick(e) {
                addChargeDialog.onFalse();
                setSelectedChargeData(null);
              },
            },
            { name: 'Add Charge' },
          ]}
          isBack
          onBack={() => {
            handleClose(null, false);
          }}
          sx={{ mb: 2 }}
        />
      ) : editChargeDialog.value ? (
        <CustomBreadcrumbs
          heading="Update Charge"
          description="View and manage student charges."
          links={[
            { name: 'Finance', href: '/finance/dashboard' },
            {
              name: 'Charges',
              href: '/finance/charge-management/chargesRequest',
              onClick(e) {
                editChargeDialog.onFalse();
                setSelectedChargeData(null);
              },
            },
            { name: 'Update Charge' },
          ]}
          isBack
          onBack={() => {
            editChargeDialog.onFalse();
            setSelectedChargeData(null);
          }}
          sx={{ px: 1, mb: 1 }}
        />
      ) : (
        <CustomBreadcrumbs
          heading="Charges"
          description="This screen shows a list of all existing charges with an option to create a new one. charges including tuition fees, exam fees, and other miscellaneous charges."
          links={[
            { name: 'Finance', href: '/finance/dashboard' },
            { name: 'Charges', href: '/finance/charge-management/chargesRequest' },
          ]}
          action={
            <Button
              startIcon={<Add />}
              variant="contained"
              onClick={addChargeDialog.onTrue}
              size="small"
            >
              Charge
            </Button>
          }
          sx={{ px: 1 }}
        />
      )}
      {!addChargeDialog.value && !viewChargeDetailsDialog.value && !editChargeDialog.value && (
        <ChargesTable
          data={chargeData}
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
            onConfirmDialg.onTrue();
            setSelectedMode('Approve');
            setSelectedChargeData(data);
          }}
          onReject={(data) => {
            onConfirmDialg.onTrue();
            setSelectedMode('Reject');
            setSelectedChargeData(data);
          }}
          onRemove={(data) => {
            removeChargeDialog.onTrue();
            setSelectedChargeData(data);
          }}
        />
      )}

      {/* Add Charge Dialog */}
      {addChargeDialog.value && (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <ChargeForm open={addChargeDialog} onClose={handleClose} />
        </Card>
      )}

      {/* Edit Charge Dialog */}
      {editChargeDialog.value && (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
          <ChargeForm
            open={editChargeDialog}
            onClose={handleEditClose}
            editData={selectedChargeData}
            isEdit
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
          setSelectedChargeData(null);
        }}
        maxWidth="xs"
      >
        <ChargeReasonApprovalForm onClose={handleClose} mode={selectedMode} />
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
            Are you sure you want to delete charge <strong>{selectedChargeData?.category}</strong>?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => {
              removeChargeDialog.onFalse();
              setSelectedChargeData(null);
              shikshaMitraToast.success({
                message: `Charge ${selectedChargeData?.category} deleted successfully for ${selectedChargeData?.studentName}`,
              });
              // Handle delete action here
            }}
          >
            Yes
          </Button>
        }
      />
    </Box>
  );
};

export default ChargesManagement;
