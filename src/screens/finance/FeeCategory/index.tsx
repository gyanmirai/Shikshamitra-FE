'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { Box, Button, Typography } from '@mui/material';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useGetFeeCategoriesQuery } from 'src/redux/feeCategory/feeCategoryApi';

import FeeCategoryForm from './Components/FeeCategoryForm';
import FeeCategoryTable from './Components/FeeCategoryTable';

import type { IFeeCategory } from './Components/type';

const FeeCategoryCreation = () => {
  // Custom hook to fetch fee category data
  const { data: feeCategoryData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetFeeCategoriesQuery,
  });

  // Dialog control states
  const deleteFeeCategoryDialog = useBoolean(); // Controls delete confirmation dialog
  const addFeeCategoryDialog = useBoolean(); // Controls add/edit fee category dialog
  const [open, setOpen] = useState(false); // Controls table dialog state

  // Global state for tracking unsaved changes
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  // State to store currently selected fee category for edit/delete operations
  const [selectedFeeCategory, setSelectedFeeCategory] = useState<IFeeCategory | null>(null);

  const dispatch = useDispatch();

  /**
   * Handles closing of add/edit fee category dialog
   * @param _e - Event object
   * @param isSubmit - Boolean indicating if form was submitted
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    // Helper function to reset state after dialog closes
    const resetState = () => {
      setTimeout(() => {
        setSelectedFeeCategory(null);
        dispatch(setIsChanges(false));
      }, 200);
    };

    // If form was submitted or user confirms leaving with unsaved changes
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      addFeeCategoryDialog.onFalse();
      resetState();
    }
    // If no unsaved changes, simply close dialog
    else if (!isChanges) {
      addFeeCategoryDialog.onFalse();
      setTimeout(() => {
        setSelectedFeeCategory(null);
      }, 200);
    }
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Fee Category"
        description="Manage all fee categories such as Academic, Hostel. Use the actions to edit or delete existing categories. Click ‘Add Fee Category’ to create a new one."
        links={[
          { name: 'Finance', href: '/finance/dashboard' },
          { name: 'Setting', href: '/finance/setting' },
          { name: 'Fee Category', href: '/finance/fee-category' },
        ]}
        action={
          <Button
            onClick={() => addFeeCategoryDialog.onTrue()}
            size="small"
            startIcon={<Add />}
            variant="contained"
          >
            Fee Category
          </Button>
        }
        sx={{ px: 1, mb: 1 }}
      />

      <FeeCategoryTable
        onDelete={(data) => {
          setSelectedFeeCategory(data);
          deleteFeeCategoryDialog.onTrue();
        }}
        onEdit={(data) => {
          setSelectedFeeCategory(data);
          addFeeCategoryDialog.onTrue();
        }}
        open={open}
        onAddFeeCategory={addFeeCategoryDialog}
        setOpenDialog={setOpen}
        editData={selectedFeeCategory}
        setEditData={setSelectedFeeCategory}
        data={feeCategoryData}
      />

      <CustomDialog
        open={addFeeCategoryDialog.value}
        handleClose={() => {
          addFeeCategoryDialog.onFalse();
          setTimeout(() => {
            setSelectedFeeCategory(null);
          }, 200);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {selectedFeeCategory ? 'Update Fee Category' : 'Add Fee Category'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title={
                selectedFeeCategory
                  ? 'Update existing fee category by entering its name (e.g., Academic, Transport, Hostel).'
                  : 'Create a new fee category by entering its name (e.g., Academic, Transport, Hostel).'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <FeeCategoryForm
          open={addFeeCategoryDialog}
          onClose={handleClose}
          editData={selectedFeeCategory}
        />
      </CustomDialog>

      <ConfirmDialog
        open={deleteFeeCategoryDialog.value}
        onClose={() => {
          setSelectedFeeCategory(null);
          deleteFeeCategoryDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete fee category{' '}
            <strong>{selectedFeeCategory?.feeCategoryName}</strong>?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => {
              deleteFeeCategoryDialog.onFalse();
              setSelectedFeeCategory(null);
              shikshaMitraToast.success({
                message: `Fee Category : ${selectedFeeCategory?.feeCategoryName} deleted successfully`,
              });
              // handle delete action
            }}
          >
            Yes
          </Button>
        }
      />
    </Box>
  );
};

export default FeeCategoryCreation;
