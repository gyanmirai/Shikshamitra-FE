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
import { useGetIncomeCategoriesQuery } from 'src/redux/finance/incomeCategory';

import IncomeCategoryForm from './Components/IncomeCategoryForm';
import IncomeCategoryTable from './Components/IncomeCategoryTable';

import type { IIncomeCategory } from './Components/type';

const FinanceIncomeCategoriesScreen = () => {
  // Use custom hook to fetch income categories
  const { data: incomeCategoryData, isLoading: incomeCategoryLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetIncomeCategoriesQuery,
  });

  // Dialog control states
  const deleteIncomeCategoryDialog = useBoolean();
  const addIncomeCategoryDialog = useBoolean();
  const [open, setOpen] = useState(false);

  // State management
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const [selectedIncomeCategory, setSelectedIncomeCategory] = useState<IIncomeCategory | null>(
    null
  );
  const dispatch = useDispatch();

  /**
   * Handles closing of the income category form dialog
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    const resetState = () => {
      setTimeout(() => {
        setSelectedIncomeCategory(null);
        dispatch(setIsChanges(false));
      }, 200);
    };

    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      addIncomeCategoryDialog.onFalse();
      resetState();
    } else if (!isChanges) {
      addIncomeCategoryDialog.onFalse();
      setTimeout(() => {
        setSelectedIncomeCategory(null);
      }, 200);
    }
  };

  if (incomeCategoryLoading) {
    return <Box>Loading...</Box>;
  }

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <CustomBreadcrumbs
        heading="Income Category"
        description="This screen displays all the created income categories with an option to create a new income category."
        links={[
          { name: 'Finance', href: '/finance/dashboard' },
          { name: 'Setting', href: '/finance/setting' },
          { name: 'Income Category', href: '/finance/income-category' },
        ]}
        action={
          <Button
            onClick={() => addIncomeCategoryDialog.onTrue()}
            size="small"
            startIcon={<Add />}
            variant="contained"
          >
            Income Category
          </Button>
        }
        sx={{ mb: 2 }}
      />

      <IncomeCategoryTable
        onDelete={(data) => {
          setSelectedIncomeCategory(data);
          deleteIncomeCategoryDialog.onTrue();
        }}
        onEdit={(data) => {
          setSelectedIncomeCategory(data);
          addIncomeCategoryDialog.onTrue();
        }}
        open={open}
        onAddIncomeCategory={addIncomeCategoryDialog}
        setOpenDialog={setOpen}
        editData={selectedIncomeCategory}
        setEditData={setSelectedIncomeCategory}
        data={incomeCategoryData || []}
      />

      <CustomDialog
        open={addIncomeCategoryDialog.value}
        handleClose={() => {
          addIncomeCategoryDialog.onFalse();
          setTimeout(() => {
            setSelectedIncomeCategory(null);
          }, 200);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {selectedIncomeCategory ? 'Update Income Category' : 'Add Income Category'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title={
                selectedIncomeCategory
                  ? 'This modal allows the user to add all required details and create a new income category.'
                  : 'This modal allows the user to add all required details and create a new income category.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
      >
        <IncomeCategoryForm
          open={addIncomeCategoryDialog}
          onClose={handleClose}
          editData={selectedIncomeCategory}
        />
      </CustomDialog>

      <ConfirmDialog
        open={deleteIncomeCategoryDialog.value}
        onClose={() => {
          setSelectedIncomeCategory(null);
          deleteIncomeCategoryDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete income category{' '}
            <strong>{selectedIncomeCategory?.incomeCategoryName}</strong>?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => {
              deleteIncomeCategoryDialog.onFalse();
              setSelectedIncomeCategory(null);
              shikshaMitraToast.success({
                message: `Income Category ${selectedIncomeCategory?.incomeCategoryName} deleted successfully`,
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

export default FinanceIncomeCategoriesScreen;
