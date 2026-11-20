'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { Box, Button, Typography } from '@mui/material';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import {
  LibraryChargeApi,
  useGetLibraryChargesQuery,
  useDeleteLibraryChargeMutation,
} from 'src/redux/library/charges-management/charges-get-api';

import AssignChargesForm from './Components/AssignChargesForm';
import LibraryChargesTable from './Components/ChargedManagementTable';
import CollectChargesForm from './Components/AssignChargeProcessForm';
import CollectChargesView from './Components/AssignViewChargeDetails';
import { useLibraryChargePermissions } from './Components/useLibraryChargePermissions';

import type { ILibraryChargeData } from './Components/type';

const LibraryChargesManagement = () => {
  const access = useLibraryChargePermissions();
  // State for selected record
  const [selectedRecord, setSelectedRecord] = useState<ILibraryChargeData | null>(null);
  const [financeBusy, setFinanceBusy] = useState(false);

  // Dialog states
  const addDialog = useBoolean();
  const deleteDialog = useBoolean();
  const viewDialog = useBoolean();
  const collectDialog = useBoolean();

  //   Fetch charges
  const { data: chargesData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetLibraryChargesQuery,
  });

  // Delete library charge mutation hook
  const [deleteLibraryCharge, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteLibraryChargeMutation,
  });

  // Undo functionality hook
  const { confirmWithUndo } = useConfirmWithUndo();

  // Redux confirm state
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const { currentAcademicYearId } = useSelector((state: RootState) => state.globalState);
  const dispatch = useDispatch();

  /**
   * Handle closing dialog with unsaved changes check
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      collectDialog.onFalse();
      addDialog.onFalse();
      setSelectedRecord(null);
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      collectDialog.onFalse();
      addDialog.onFalse();
      setSelectedRecord(null);
    }
  };

  return (
    <Box
      data-testid="library-charges-page"
      sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      <CustomBreadcrumbs
        heading="Charges"
        description={
          addDialog.value
            ? 'Add new charge or update existing charge details.'
            : 'Manage charges for library members.'
        }
        links={[
          { name: 'Library', href: '/library/dashboard' },
          { name: 'Charges', href: '/library/charges' },
        ]}
        action={
          <Button
            data-testid="library-charge-assign-button"
            disabled={!access.add}
            onClick={() => {
              if (access.add) {
                setSelectedRecord(null);
                addDialog.onTrue();
              }
            }}
            size="small"
            startIcon={<Add />}
            variant="contained"
            sx={{ px: '32px' }}
          >
            Assign Charge
          </Button>
        }
        sx={{ px: 2 }}
      />

      {/* Dialog for Add/Edit */}
      <CustomDialog
        open={addDialog.value && (selectedRecord ? access.update : access.add)}
        handleClose={() => {
          addDialog.onFalse();
          setSelectedRecord(null);
        }}
        maxWidth="md"
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {selectedRecord ? 'Update Charges' : 'Assign Charges'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title={
                selectedRecord
                  ? 'Update charge details such as category, amount, or status.'
                  : 'Fill details to add a new charge.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <AssignChargesForm open={addDialog.value} onClose={handleClose} editData={selectedRecord} />
      </CustomDialog>

      <CustomDialog
        open={collectDialog.value && access.view}
        disableClose={financeBusy}
        handleClose={() => {
          collectDialog.onFalse();
          setSelectedRecord(null);
        }}
        maxWidth="sm"
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Library Finance</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="Review the saved assessment and its Finance approval, policies, collection and receipt evidence."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <CollectChargesForm
          open={collectDialog}
          onClose={handleClose}
          charge={selectedRecord}
          onBusyChange={setFinanceBusy}
        />
      </CustomDialog>

      <CustomDialog
        open={viewDialog.value && access.view}
        handleClose={() => {
          viewDialog.onFalse();
          setSelectedRecord(null);
        }}
        maxWidth="sm"
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">View Charge Details</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="View detailed information about this charge"
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <CollectChargesView charge={selectedRecord} />
      </CustomDialog>

      {/* Table */}
      <LibraryChargesTable
        data={chargesData}
        addChargesDialog={addDialog}
        onEditCharge={(data) => {
          if (!access.update) return;
          setSelectedRecord(data);
          addDialog.onTrue();
        }}
        onCollectCharges={(data) => {
          if (!access.view) return;
          collectDialog.onTrue();
          setSelectedRecord(data);
        }}
        onViewCharges={(data) => {
          if (!access.view) return;
          viewDialog.onTrue();
          setSelectedRecord(data);
        }}
        onDeleteCharge={(data) => {
          if (!access.delete) return;
          setSelectedRecord(data);
          deleteDialog.onTrue();
        }}
      />

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialog.value && access.delete}
        onClose={() => {
          deleteDialog.onFalse();
          setTimeout(() => {
            setSelectedRecord(null);
          }, 200);
        }}
        title="Delete Charge"
        content={
          <>
            Are you sure you want to delete the <strong>{selectedRecord?.chargeCategory}</strong>{' '}
            charge For <strong>{selectedRecord?.memberName}</strong>?
          </>
        }
        action={
          <LoadingButton
            loading={isDeleteLoading}
            disabled={!access.delete}
            variant="contained"
            color="error"
            size="small"
            onClick={async () => {
              if (!access.delete) return;
              confirmWithUndo({
                item: selectedRecord,
                onOptimisticRemove: (dispatchFn, setDeleteIndex) =>
                  dispatchFn(
                    LibraryChargeApi.util.updateQueryData(
                      'getLibraryCharges',
                      undefined,
                      (draft: any) => {
                        const index = draft?.findIndex(
                          (charge: any) => charge.id === selectedRecord?.id
                        );
                        setDeleteIndex(index);
                        if (index !== -1) {
                          draft.splice(index, 1);
                        }
                      }
                    )
                  ),
                onUndoRestore: (dispatchFn, index) =>
                  dispatchFn(
                    LibraryChargeApi.util.updateQueryData(
                      'getLibraryCharges',
                      undefined,
                      (draft: any) => {
                        if (!draft) return;
                        draft.splice(index, 0, selectedRecord);
                      }
                    )
                  ),
                onCommit: () =>
                  deleteLibraryCharge({
                    chargeId: selectedRecord?.id || '',
                    academicYearId: currentAcademicYearId,
                  }),
              });
              deleteDialog.onFalse();
              setSelectedRecord(null);
            }}
          >
            Yes
          </LoadingButton>
        }
      />
    </Box>
  );
};

export default LibraryChargesManagement;
