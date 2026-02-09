'use client';

import React from 'react';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { Box, Card, Button, Typography } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import IncomeTable from './Components/IncomeTable';
import ViewIncomeData from './Components/ViewIncomeData';
import IncomeTrackingForm from './Components/IncomeTrackingForm';
import { useIncomeTrackingScreen } from './hooks/useIncomeTrackingScreen';

const IncomeTracking = () => {
  const {
    selectedIncome,
    setSelectedIncome,
    addIncomeDialog,
    deleteIncomeDialog,
    viewIncomeDialog,
    incomeData,
    incomeDetailedData,
    handleClose,
    handleViewDialogClose,
    handleDeleteConfirm,
  } = useIncomeTrackingScreen();

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
          <Button variant="contained" color="error" size="small" onClick={handleDeleteConfirm}>
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
        handleClose={handleViewDialogClose}
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
