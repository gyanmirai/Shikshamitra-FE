'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Card, Button, Typography } from '@mui/material';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { useConfirmWithUndo } from 'src/hooks/useConfirmWithUndo';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { incomeApi, useGetIncomesQuery } from 'src/redux/incomeApi/incomeApi';
import { useGetIncomeDetailsQuery } from 'src/redux/incomeApi/incomeDetailedApi';
import { useDeleteIncomeCategoryMutation } from 'src/redux/finance/incomeTrackingManagement/incomeTracking';

import IncomeTable from './Components/IncomeTable';
import ViewIncomeData from './Components/ViewIncomeData';
import IncomeTrackingForm from './Components/IncomeTrackingForm';

import type { IIncomeFormValues } from './Components/type';

const IncomeTracking = () => {
  // State for selected income record
  const [selectedIncome, setSelectedIncome] = useState<IIncomeFormValues | null>(null);

  // Custom hooks for dialogs
  const addIncomeDialog = useBoolean();
  const deleteIncomeDialog = useBoolean();
  const viewIncomeDialog = useBoolean();
  const { confirmWithUndo } = useConfirmWithUndo();

  const { data: incomeData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetIncomesQuery,
  });

  const { data: incomeDetailedData, refetch } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetIncomeDetailsQuery,
  });

  // DELETE mutation
  const { deleteIncomeCategory } = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useDeleteIncomeCategoryMutation,
  });

  // Redux
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

  // Handle form/dialog close
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      addIncomeDialog.onFalse();
      setSelectedIncome(null);
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      addIncomeDialog.onFalse();
      setSelectedIncome(null);
    }
  };

  const handleViewDialogClose = () => {
    setSelectedIncome(null);
    viewIncomeDialog.onFalse();
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {addIncomeDialog.value ? (
        <CustomBreadcrumbs
          heading={selectedIncome ? 'Update Income Tracking ' : 'Add Income Tracking '}
          description={
            selectedIncome
              ? 'Update income record details such as source, date, amount, and category to maintain accurate income tracking.'
              : 'This screen allows users to add a new income by filling in all related fields such as category, amount, date and payment details.'
          }
          isBack
          onBack={() => handleClose(null, false)}
          links={[
            { name: 'Finance', href: '/finance/dashboard' },
            {
              name: 'Income Tracking',
              href: '/finance/income-tracking',
              onClick: () => {
                addIncomeDialog.onFalse();
                setSelectedIncome(null);
              },
            },
            { name: selectedIncome ? 'Update Income Tracking ' : 'Add Income Tracking ' },
          ]}
          sx={{ mb: 2 }}
        />
      ) : (
        <CustomBreadcrumbs
          heading="Income Tracking"
          description="This screen displays all income categories with the option to view detailed entries under each category and add new income records."
          links={[
            { name: 'Finance', href: '/finance/dashboard' },
            { name: 'Income Tracking', href: '/finance/income-tracking' },
          ]}
          action={
            <Button
              onClick={() => addIncomeDialog.onTrue()}
              size="small"
              startIcon={<Add />}
              variant="contained"
              sx={{ px: '32px' }}
            >
              Income
            </Button>
          }
          sx={{ px: 2, mb: 1 }}
        />
      )}

      <>
        {/* Form for add/edit income */}
        {addIncomeDialog.value ? (
          <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
            <IncomeTrackingForm
              open={addIncomeDialog}
              onClose={handleClose}
              editData={selectedIncome}
            />
          </Card>
        ) : (
          <IncomeTable
            data={incomeData || []}
            addIncome={addIncomeDialog}
            setEditData={setSelectedIncome}
            onEdit={(data) => {
              addIncomeDialog.onTrue();
              setSelectedIncome(data);
            }}
            onDelete={(data) => {
              deleteIncomeDialog.onTrue();
              setSelectedIncome(data);
            }}
            onView={(data) => {
              viewIncomeDialog.onTrue();
              setSelectedIncome(data);
            }}
          />
        )}
      </>

      {/* Delete confirmation dialog */}
      <ConfirmDialog
        open={deleteIncomeDialog.value}
        onClose={() => {
          setSelectedIncome(null);
          deleteIncomeDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete the income record{' '}
            <strong>&quot;{selectedIncome?.incomeName}&quot;</strong>?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={async () => {
              if (selectedIncome) {
                deleteIncomeDialog.onFalse();
                const currentData = incomeData && incomeData.length > 0 ? incomeData : [];
                confirmWithUndo({
                  item: selectedIncome,
                  onOptimisticRemove: (dispatchFn, setDeleteIndex) => {
                    const index = currentData.findIndex(
                      (item: any) => item.id === selectedIncome.id
                    );
                    if (index !== -1) {
                      setDeleteIndex(index);
                      dispatchFn(
                        incomeApi.util.updateQueryData('getIncomes', undefined, (draft: any) => {
                          if (draft) {
                            const paramsIndex = draft.findIndex(
                              (item: any) => item.id === selectedIncome.id
                            );
                            if (paramsIndex !== -1) {
                              draft.splice(paramsIndex, 1);
                            }
                          }
                        })
                      );
                    }
                  },
                  onUndoRestore: () => {
                    refetch();
                  },
                  onCommit: async () => {
                    if (selectedIncome?.id) {
                      await deleteIncomeCategory(selectedIncome.id);
                    }
                  },
                });
                setSelectedIncome(null);
              }
            }}
          >
            Yes
          </Button>
        }
      />

      <CustomDialog
        open={viewIncomeDialog.value}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">View Incomes</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="This modal displays all income entries under a particular income category, allowing users to view detailed records."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        handleClose={() => {
          setSelectedIncome(null);
          viewIncomeDialog.onFalse();
        }}
        maxWidth="md"
      >
        <ViewIncomeData
          viewIncomeDialog={viewIncomeDialog}
          incomeData={selectedIncome}
          incomeDetailedData={incomeDetailedData}
          onClose={handleViewDialogClose}
        />
      </CustomDialog>
    </Box>
  );
};

export default IncomeTracking;
