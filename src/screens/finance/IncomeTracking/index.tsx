'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Card, Button, Typography } from '@mui/material';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetIncomesQuery } from 'src/redux/incomeApi/incomeApi';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
// import { useGetIncomeTrackingQuery } from 'src/redux/finance/incomeTracking';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useGetIncomeDetailsQuery } from 'src/redux/incomeApi/incomeDetailedApi';

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
  const { data: incomeData, isLoading: incomeLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetIncomesQuery,
  });
  const { data: incomeDetailedData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetIncomeDetailsQuery,
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

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {addIncomeDialog.value ? (
        <CustomBreadcrumbs
          heading="Income Tracking"
          description={
            selectedIncome
              ? 'Update income record details such as source, date, amount, and category to maintain accurate income tracking.'
              : 'This screen allows users to add a new income by filling in all related fields such as category, amount, date and payment details.'
          }
          isBack
          onBack={() => handleClose(null, false)}
          links={[
            { name: 'Finance', href: '/finance/dashboard' },
            { name: 'Setting', href: '/finance/setting' },
            { name: 'Income Tracking', href: '/finance/income-tracking' },
          ]}
          sx={{ px: 1, mb: 2 }}
        />
      ) : (
        <CustomBreadcrumbs
          heading="Income Tracking"
          description="This screen displays all income categories with the option to view detailed entries under each category and add new income records."
          links={[
            { name: 'Finance', href: '/finance/dashboard' },
            { name: 'Setting', href: '/finance/setting' },
            { name: 'Income Tracking', href: '/finance/income-tracking' },
          ]}
          action={
            <Button
              onClick={() => addIncomeDialog.onTrue()}
              size="small"
              startIcon={<Add />}
              variant="contained"
            >
              Income
            </Button>
          }
          sx={{ px: 1, mb: 2 }}
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
            Are you sure you want to delete income record{' '}
            <strong>{selectedIncome?.incomeName}</strong>?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => {
              deleteIncomeDialog.onFalse();
              setSelectedIncome(null);
              shikshaMitraToast.success({
                message: `Income record ${selectedIncome?.incomeName} deleted successfully`,
              });
              // handle delete action
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
        maxWidth="sm"
      >
        <ViewIncomeData
          viewIncomeDialog={viewIncomeDialog}
          incomeData={selectedIncome}
          incomeDetailedData={incomeDetailedData}
        />
      </CustomDialog>
    </Box>
  );
};

export default IncomeTracking;
