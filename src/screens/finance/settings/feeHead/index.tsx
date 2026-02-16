'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { Box, Button, Typography } from '@mui/material';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import {
  useGetFeeHeadsQuery,
  FeeHeadManagementApi,
  usePatchFeeHeadMutation,
  useDeleteFeeHeadMutation,
} from 'src/redux/feeHeadManage/feeHeadManageApi';

import FeeHeadForm from './Components/FeeHeadForm';
import FeeHeadTable from './Components/FeeHeadTable';

import type { IFeeHead } from './Components/type';

const FeeHeadCreation = () => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const [patchFeeHead, { isLoading: isPatchFeeHeadLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePatchFeeHeadMutation,
  });

  // Custom hook to fetch fee head data
  const {
    data: feeHeadData,
    refetch,
    isLoading: isFeeHeadLoading,
    isFetching: isFeeHeadFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFeeHeadsQuery,
    params: { academicYearId: currentYear?.id },
  });

  // DELETE mutation
  const [deleteFeeHead] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteFeeHeadMutation,
  });

  // Dialog control states
  const addFeeHeadDialog = useBoolean(); // Controls add/edit fee head dialog
  const activeDialog = useBoolean(); // Controls active/inactive confirmation dialog
  const deleteDialog = useBoolean(); // Controls delete confirmation dialog
  const { confirmWithUndo } = useConfirmWithUndo();

  // State management
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup); // Tracks unsaved changes
  const [selectedFeeHead, setSelectedFeeHead] = useState<IFeeHead | null>(null); // Currently selected fee head for edit/delete
  const [selectedEntry, setSelectedEntry] = useState<IFeeHead | null>(null);
  const dispatch = useDispatch();

  /**
   * Handles closing of the fee head form dialog
   * @param _e - Event object (unused)
   * @param isSubmit - Boolean indicating if form was submitted
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    // Helper function to reset state after dialog closes
    const resetState = () => {
      setTimeout(() => {
        setSelectedFeeHead(null);
        dispatch(setIsChanges(false));
      }, 200);
    };

    // Handle different closing scenarios
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      addFeeHeadDialog.onFalse();
      resetState();
    } else if (!isChanges) {
      addFeeHeadDialog.onFalse();
      setTimeout(() => {
        setSelectedFeeHead(null);
      }, 200);
    }
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Fee Head"
        description="Manage all fee heads such as Tuition Fee, Exam Fee, and more. Use the actions to edit or delete existing heads. Click '+ Fee Head' to create a new one."
        links={[
          { name: 'Finance', href: '/finance/dashboard' },
          { name: 'Settings', href: '/finance/setting' },
          { name: 'Fee Head', href: '/finance/fee-head' },
        ]}
        action={
          <Button
            onClick={() => addFeeHeadDialog.onTrue()}
            size="small"
            startIcon={<Add />}
            variant="contained"
            sx={{ px: '32px' }}
          >
            Fee Head
          </Button>
        }
      />

      <FeeHeadTable
        onEdit={(data) => {
          setSelectedFeeHead(data);
          addFeeHeadDialog.onTrue();
        }}
        onDelete={(data) => {
          setSelectedEntry(data);
          deleteDialog.onTrue();
        }}
        onToggle={(data) => {
          setSelectedEntry(data);
          activeDialog.onTrue();
        }}
        isLoading={isFeeHeadLoading || isFeeHeadFetching}
        onAddFeeHead={addFeeHeadDialog}
        editData={selectedFeeHead}
        setEditData={setSelectedFeeHead}
        data={feeHeadData?.items}
      />

      {/* Add/Edit Fee Head Dialog */}
      <CustomDialog
        open={addFeeHeadDialog.value}
        handleClose={() => {
          addFeeHeadDialog.onFalse();
          setTimeout(() => {
            setSelectedFeeHead(null);
          }, 200);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {selectedFeeHead ? 'Update Fee Head' : 'Add Fee Head'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title={
                selectedFeeHead
                  ? 'You can update the fee head details including name, category, and description.'
                  : 'Add a new fee head by selecting a category and entering a name.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <FeeHeadForm open={addFeeHeadDialog} onClose={handleClose} editData={selectedFeeHead} />
      </CustomDialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={deleteDialog.value}
        onClose={() => {
          setTimeout(() => {
            setSelectedEntry(null);
          }, 200);
          deleteDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete fee head <strong>{selectedEntry?.name}</strong>?
          </>
        }
        action={
          <LoadingButton
            variant="contained"
            color="error"
            size="small"
            onClick={async () => {
              confirmWithUndo({
                item: selectedEntry,
                onOptimisticRemove: (dispatchFn, setDeleteIndex) =>
                  dispatchFn(
                    FeeHeadManagementApi.util.updateQueryData(
                      'getFeeHeads',
                      { academicYearId: currentYear?.id },
                      (draft: any) => {
                        const index = draft.items?.findIndex(
                          (b: any) => b.id === (selectedEntry as any)?.id
                        );
                        setDeleteIndex(index);
                        if (index !== -1) {
                          draft.items.splice(index, 1);
                        }
                      }
                    )
                  ),
                onUndoRestore: () => refetch(),
                onCommit: () =>
                  deleteFeeHead({
                    id: (selectedEntry as any).id,
                  }),
              });
              deleteDialog.onFalse();
              setSelectedEntry(null);
            }}
          >
            Yes
          </LoadingButton>
        }
      />

      <ConfirmDialog
        open={activeDialog.value}
        onClose={() => {
          setTimeout(() => {
            setSelectedEntry(null);
          }, 200);
          activeDialog.onFalse();
        }}
        title="Active"
        content={
          <>
            Are you sure you want to active fee head <strong>{selectedEntry?.name}</strong>?
          </>
        }
        action={
          <LoadingButton
            variant="contained"
            color="error"
            size="small"
            loading={isPatchFeeHeadLoading}
            startIcon={
              <Iconify icon={selectedEntry?.isActive ? GlobalIcons.cancel : GlobalIcons.tick} />
            }
            onClick={async () => {
              if (!selectedEntry?.id) return;
              try {
                await patchFeeHead({
                  feeHeadId: selectedEntry.id,
                  body: { isActive: !selectedEntry.isActive },
                }).unwrap();

                shikshaMitraToast.success({
                  message: (
                    <>
                      Fee Head: <strong>{selectedEntry?.name}</strong>{' '}
                      {selectedEntry.isActive ? 'activated' : 'deactivated'} successfully.
                    </>
                  ),
                });
                setTimeout(() => {
                  setSelectedEntry(null);
                }, 200);
                activeDialog.onFalse();
              } catch (error) {
                console.error('Delete operation failed:', error);
                shikshaMitraToast.error({
                  message: 'Failed to delete fee head',
                });
              }
            }}
          >
            {selectedEntry?.isActive ? 'Deactivate' : 'Activate'}
          </LoadingButton>
        }
      />
    </Box>
  );
};

export default FeeHeadCreation;
