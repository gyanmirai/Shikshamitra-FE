'use client';

import React from 'react';
import { Add } from '@mui/icons-material';
import { Box, Card, Button } from '@mui/material';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import IncomeTable from './Components/IncomeTable';
import IncomeTrackingForm from './Components/IncomeTrackingForm';
import { useIncomeTrackingScreen } from './hooks/useIncomeTrackingScreen';

const IncomeTracking = () => {
  const {
    selectedIncome,
    setSelectedIncome,
    addIncomeDialog,
    deleteIncomeDialog,
    // viewIncomeDialog,
    incomeData,
    fetchingIncomeData,
    loadingIncomeData,
    // incomeDetailedData,
    handleClose,
    // handleViewDialogClose,
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
            data={incomeData?.items || []}
            addIncome={addIncomeDialog}
            isLoading={fetchingIncomeData || loadingIncomeData}
            setEditData={setSelectedIncome}
            onEdit={(data) => {
              addIncomeDialog.onTrue();
              setSelectedIncome(data);
            }}
            onDelete={(data) => {
              deleteIncomeDialog.onTrue();
              setSelectedIncome(data);
            }}
            // onView={(data) => {
            //   viewIncomeDialog.onTrue();
            //   setSelectedIncome(data);
            // }}
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
            <strong>&quot;{selectedIncome?.name}&quot;</strong>?
          </>
        }
        action={
          <Button variant="contained" color="error" size="small" onClick={handleDeleteConfirm}>
            Yes
          </Button>
        }
      />
    </Box>
  );
};

export default IncomeTracking;
