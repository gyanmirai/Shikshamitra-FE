'use client';

import type { RootState } from 'src/redux/store';

import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { Add } from '@mui/icons-material';
import { Box, Card, Button } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetBudgetDataQuery } from 'src/redux/budgetApi/budgetApi';
// import budgetTableData from 'src/json/budget/budgetTableData.json'; // <-- your budget data JSON
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import CustomDialog from 'src/components/customDialog';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import BudgetTable from './Components/BudgetTable';
import NewBudgetForm from './Components/BudgetForm';
import BudgetDetailsCard from './Components/BudgetView';

// import NewBudgetForm from './components/budgetFormComponent';
// import ViewBudgetComp from './components/viewBudgetComp';
// import ScheduledBudgetTable from './components/scheduleBudgetTable';

// import type { IBudgetFormValues } from './type';

const ScheduleBudget = ({ showBreadCumb = true }: { showBreadCumb?: boolean }) => {
  // State to control budget form visibility
  const [open, setOpen] = useState(false);
  const { data: budgetData, isLoading: paymentTermsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBudgetDataQuery,
  });

  // State to store currently selected budget for editing
  const [selectedBudget, setSelectedBudget] = useState<any | null>(null);

  // Redux selector to track unsaved changes
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  // Boolean hook to control delete confirmation dialog
  const deleteDialog = useBoolean();

  // Redux dispatch hook for state management
  const dispatch = useDispatch();

  // Boolean hook to control detail view dialog
  const viewDialog = useBoolean();

  /**
   * Handles the deletion of a budget entry
   */
  const handleDelete = (id: string | undefined) => {
    deleteDialog.onFalse();
    setSelectedBudget(null);
  };

  /**
   * Handles closing the budget form with confirmation if there are unsaved changes
   */
  const handleClose = (_e: any, isSubmit?: boolean) => {
    if (isSubmit || (isChanges && window.confirm('Are you sure you want to leave this page?'))) {
      setOpen(false);
      dispatch(setIsChanges(false));
      setSelectedBudget(null);
    } else if (!isChanges) {
      setOpen(false);
      setSelectedBudget(null);
    }
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      {showBreadCumb &&
        (open ? (
          <CustomBreadcrumbs
            heading="Budgeting"
            description={
              selectedBudget?.budgetName
                ? 'Update existing budget details including category, amount, and allocations.'
                : 'Create a new budget by entering category, amount, and allocations.'
            }
            links={[
              { name: 'Finance', href: '/finance/dashboard' },
              { name: 'Budget', href: '/finance/scheduleBudget' },
              { name: 'Budgeting' },
            ]}
            sx={{ px: 1 }}
            isBack
            onBack={() => {
              handleClose(null, false);
            }}
          />
        ) : (
          <CustomBreadcrumbs
            heading="Budgeting"
            description="Manage all budgets with complete details—categories, allocations, and amounts. Add, edit, or delete budgets as required."
            links={[
              { name: 'Finance', href: '/finance/dashboard' },
              { name: 'Budget', href: '/finance/budgetDashboard' },
              { name: 'Budgeting' },
            ]}
            sx={{ px: 1 }}
            action={
              <Button
                startIcon={<Add />}
                variant="contained"
                size="small"
                onClick={() => setOpen(true)}
              >
                Budget
              </Button>
            }
          />
        ))}
      {open ? (
        <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)', mt: 2 }}>
          <NewBudgetForm
            onClose={() => {
              setOpen(false);
            }}
          />
        </Card>
      ) : (
        <BudgetTable
          onDelete={(data) => {
            setSelectedBudget(data);
            deleteDialog.onTrue();
          }}
          //   openDialog={open}
          setOpenDialog={setOpen}
          //   editData={selectedBudget}
          setEditData={setSelectedBudget}
          data={budgetData}
          onViewDetail={(data) => {
            viewDialog.onTrue();
            setSelectedBudget(data);
          }}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={deleteDialog.value}
        onClose={() => {
          deleteDialog.onFalse();
          setSelectedBudget(null);
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete budget <strong>{selectedBudget?.budgetName}</strong>?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => {
              handleDelete(selectedBudget?.id);
              shikshaMitraToast.success({
                message: `Budget ${selectedBudget?.budgetName} deleted successfully`,
              });
            }}
          >
            Yes
          </Button>
        }
      />

      {/* View Details */}
      <CustomDialog
        title="View Budget"
        open={viewDialog.value}
        handleClose={() => {
          viewDialog.onFalse();
          setSelectedBudget(null);
        }}
        maxWidth="md"
      >
        {/* <ViewBudgetComp budgetData={selectedBudget} /> */}
        <BudgetDetailsCard budget={selectedBudget} />
      </CustomDialog>
    </Box>
  );
};

export default ScheduleBudget;
