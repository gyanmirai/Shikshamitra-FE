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
import { Box, Card, Button, Typography } from '@mui/material';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetBudgetDataQuery } from 'src/redux/budgetApi/budgetApi';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
// import budgetTableData from 'src/json/budget/budgetTableData.json'; // <-- your budget data JSON
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
// import budgetTableData from 'src/json/budget/budgetTableData.json'; // <-- your budget data JSON

import BudgetTable from './Components/BudgetTable';
import NewBudgetForm from './Components/BudgetForm';
import BudgetDetailsCard from './Components/BudgetView';
import BudgetApproval from './Components/BudgetReviewDetails';
import ReasonApprovalForm from '../Concession/Components/ConcessionRequestApprove';

// import NewBudgetForm from './components/budgetFormComponent';
// import ViewBudgetComp from './components/viewBudgetComp';
// import ScheduledBudgetTable from './components/scheduleBudgetTable';

// import type { IBudgetFormValues } from './type';

const ScheduleBudget = ({ showBreadCumb = true }: { showBreadCumb?: boolean }) => {
  // State to control budget form visibility
  const [open, setOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { data: budgetData, isLoading: paymentTermsLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetBudgetDataQuery,
  });

  // State to store currently selected budget for editing
  const [selectedBudget, setSelectedBudget] = useState<any | null>(null);

  // Redux selector to track unsaved changes
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const onConfirmDialg = useBoolean();
  const [selectedMode, setSelectedMode] = useState('');
  // Boolean hook to control delete confirmation dialog
  const deleteDialog = useBoolean();

  // Redux dispatch hook for state management
  const dispatch = useDispatch();

  // Boolean hook to control detail view dialog
  const viewDialog = useBoolean();
  const reviewDialog = useBoolean();

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
      onConfirmDialg.onFalse();
      reviewDialog.onFalse();
      setSelectedMode('');
      setSelectedBudget(null);
    } else if (!isChanges) {
      setOpen(false);
      onConfirmDialg.onFalse();
      reviewDialog.onFalse();
      setSelectedMode('');
      setSelectedBudget(null);
    }
  };

  return (
    <Box height="100%" display="flex" flexDirection="column">
      {showBreadCumb &&
        (open ? (
          <CustomBreadcrumbs
            heading={selectedBudget?.budgetName ? 'Update Budget' : 'Add Budget'}
            description={
              selectedBudget?.budgetName
                ? 'Update existing budget details including category, amount, and allocations.'
                : 'Create a new budget by entering category, amount, and allocations.'
            }
            links={[
              { name: 'Finance', href: '/finance/dashboard' },
              { name: 'Budget', href: '/finance/budgeting', onClick: () => setOpen(false) },
              { name: 'Budgeting' },
              { name: selectedBudget?.budgetName ? 'Update Budget' : 'Add Budget' },
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
            links={[{ name: 'Finance', href: '/finance/dashboard' }, { name: 'Budgeting' }]}
            sx={{ px: 1 }}
            action={
              <Button
                startIcon={<Add />}
                variant="contained"
                size="small"
                onClick={() => setOpen(true)}
                sx={{ px: '32px' }}
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
          onReview={(data) => {
            reviewDialog.onTrue();
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
        open={viewDialog.value}
        handleClose={() => {
          viewDialog.onFalse();
          setTimeout(() => {
            setSelectedBudget(null);
          }, 200);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">View Budget</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="This modal shows the complete details of the selected budget including category, amount, allocations, and other relevant information."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        maxWidth="md"
      >
        <BudgetDetailsCard
          budget={selectedBudget}
          handleClose={() => {
            viewDialog.onFalse();
            setTimeout(() => {
              setSelectedBudget(null);
            }, 200);
          }}
        />
      </CustomDialog>

      {/* View Details */}
      {/* View Budget Dialog */}
      <CustomDialog
        open={viewDialog.value}
        handleClose={() => {
          viewDialog.onFalse();
          setTimeout(() => {
            setSelectedBudget(null);
          }, 200);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">View Budget</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="This modal shows the complete details of the selected budget including category, amount, allocations, and other relevant information."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        maxWidth="md"
      >
        <BudgetDetailsCard
          budget={selectedBudget}
          handleClose={() => {
            viewDialog.onFalse();
            setTimeout(() => {
              setSelectedBudget(null);
            }, 200);
          }}
        />
      </CustomDialog>

      {/* Review Budget Dialog */}
      <CustomDialog
        open={reviewDialog.value}
        handleClose={() => {
          reviewDialog.onFalse();
          setTimeout(() => {
            setSelectedBudget(null);
          }, 200);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">Review Budget</Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title="Review and approve/reject the budget request with comments and status updates."
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        maxWidth="md"
      >
        <BudgetApproval
          budget={selectedBudget}
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
      </CustomDialog>

      <CustomDialog
        open={onConfirmDialg.value}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {selectedMode === 'Approve' ? 'Approve Budget' : 'Reject Budget'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title={
                selectedMode === 'Approve'
                  ? "Approve the student's concession request"
                  : "Reject the student's concession request"
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        handleClose={() => {
          onConfirmDialg.onFalse();
          setSelectedMode('');
          setSelectedBudget(null);
        }}
        maxWidth="xs"
      >
        <ReasonApprovalForm onClose={handleClose} mode={selectedMode} />
      </CustomDialog>
    </Box>
  );
};

export default ScheduleBudget;
