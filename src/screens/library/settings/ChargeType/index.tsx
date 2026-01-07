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
  librarySettingsApi,
  useGetLibrarySettingsQuery,
  useDeleteChargeCategoryMutation,
} from 'src/redux/library/settingApi';

import ChargeTypeForm from './Components/ChargeTypeForm';
import ChargeTypeTable from './Components/ChargeTypeTable';

import type { IChargeType } from './Components/type';

const ChargeTypeCreation = () => {
  // Custom hook to fetch charge type data
  const { data: chargeTypeData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetLibrarySettingsQuery,
  });

  // Delete mutation hook
  const [deleteChargeCategory, { isLoading: isDeleteLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteChargeCategoryMutation,
  });

  // Undo functionality hook
  const { confirmWithUndo } = useConfirmWithUndo();

  // Dialog control states
  const deleteChargeTypeDialog = useBoolean();
  const addChargeTypeDialog = useBoolean();
  const [open, setOpen] = useState(false);

  // State management
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const [selectedChargeType, setSelectedChargeType] = useState<IChargeType | null>(null);
  const dispatch = useDispatch();

  // Close handler
  const handleClose = (_e: any, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        setSelectedChargeType(null);
        dispatch(setIsChanges(false));
      }, 200);
    };

    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      addChargeTypeDialog.onFalse();
      resetState();
    } else if (!isChanges) {
      addChargeTypeDialog.onFalse();
      setTimeout(() => {
        setSelectedChargeType(null);
      }, 200);
    }
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Charges Categories"
        description="This screen displays all the created charge types (such as late return fee, damage fee, etc.) and provides an option to add new Charges Categories."
        links={[
          { name: 'Library', href: '/library/dashboard' },
          { name: 'Setting', href: '/library/setting' },
          { name: 'Charges Categories', href: '/library/settings/charge-type' },
        ]}
        action={
          <Button
            onClick={() => addChargeTypeDialog.onTrue()}
            size="small"
            startIcon={<Add />}
            variant="contained"
            sx={{ px: '32px' }}
          >
            Charges Categories
          </Button>
        }
        sx={{ mb: 2 }}
      />

      <ChargeTypeTable
        onDelete={(data) => {
          setSelectedChargeType(data);
          deleteChargeTypeDialog.onTrue();
        }}
        onEdit={(data) => {
          setSelectedChargeType(data);
          addChargeTypeDialog.onTrue();
        }}
        open={open}
        onAddChargeType={addChargeTypeDialog}
        setOpenDialog={setOpen}
        setEditData={setSelectedChargeType}
        data={chargeTypeData}
      />

      <CustomDialog
        open={addChargeTypeDialog.value}
        handleClose={() => {
          addChargeTypeDialog.onFalse();
          setTimeout(() => {
            setSelectedChargeType(null);
          }, 200);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {selectedChargeType ? 'Update Charge Category' : 'Add Charge Category'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title={
                selectedChargeType
                  ? 'Update the charge type details including type name and amount.'
                  : 'This modal allows the admin/libraian to create a new charge type by entering its name, description, and amount.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <ChargeTypeForm
          open={addChargeTypeDialog}
          onClose={handleClose}
          editData={selectedChargeType}
        />
      </CustomDialog>

      <ConfirmDialog
        open={deleteChargeTypeDialog.value}
        onClose={() => {
          setSelectedChargeType(null);
          deleteChargeTypeDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete charge type{' '}
            <strong>{selectedChargeType?.chargeType}</strong>?
          </>
        }
        action={
          <LoadingButton
            loading={isDeleteLoading}
            variant="contained"
            color="error"
            size="small"
            onClick={async () => {
              confirmWithUndo({
                item: selectedChargeType,
                onOptimisticRemove: (dispatchFn, setDeleteIndex) =>
                  dispatchFn(
                    librarySettingsApi.util.updateQueryData(
                      'getLibrarySettings',
                      undefined,
                      (draft: any) => {
                        const index = draft?.findIndex((b: any) => b.id === selectedChargeType?.id);
                        setDeleteIndex(index);
                        if (index !== -1) {
                          draft.splice(index, 1);
                        }
                      }
                    )
                  ),
                onUndoRestore: (dispatchFn, index) =>
                  dispatchFn(
                    librarySettingsApi.util.updateQueryData(
                      'getLibrarySettings',
                      undefined,
                      (draft: any) => {
                        if (!draft) return;
                        draft.splice(index, 0, selectedChargeType);
                      }
                    )
                  ),
                onCommit: () => deleteChargeCategory({ categoryId: selectedChargeType?.id || '' }),
              });
              deleteChargeTypeDialog.onFalse();
              setSelectedChargeType(null);
            }}
          >
            Yes
          </LoadingButton>
        }
      />
    </Box>
  );
};

export default ChargeTypeCreation;
