'use client';

import type { RootState } from 'src/redux/store';

import React from 'react';
import { useSelector } from 'react-redux';
import { Add } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import { Box, Button, Typography } from '@mui/material';
import CustomTooltip from 'src/components/custom-tooltip';
import { hasGrantedPermission } from 'src/utils/permissions';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { financePermissions } from 'src/constants/finance-menu';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import IncomeTable from './Components/IncomeTable';
import IncomeTrackingForm from './Components/IncomeTrackingForm';
import { useIncomeTrackingScreen } from './hooks/useIncomeTrackingScreen';

interface IncomeTrackingProps {
  embedded?: boolean;
}

const IncomeTracking = ({ embedded = false }: IncomeTrackingProps) => {
  const { permissions } = useSelector((state: RootState) => state.auth);
  const canAdd = hasGrantedPermission(permissions, `${financePermissions.accounts.income}.Add`);
  const canDelete = hasGrantedPermission(permissions, `${financePermissions.accounts.income}.Delete`);
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
      {!embedded && (
        <CustomBreadcrumbs
          heading="Income Tracking"
          description="This screen displays all income categories with the option to view detailed entries under each category and add new income records."
          links={[
            { name: 'Finance', href: '/finance/dashboard' },
            { name: 'Accounts', href: '/finance/income-tracking' },
            { name: 'Income Tracking' },
          ]}
          action={canAdd ?
            <Button
              onClick={() => addIncomeDialog.onTrue()}
              size="small"
              startIcon={<Add />}
              variant="contained"
              sx={{ px: '32px' }}
            >
              Income
            </Button> : undefined
          }
        />
      )}

      {embedded && canAdd && !addIncomeDialog.value && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <Button
            onClick={() => addIncomeDialog.onTrue()}
            size="small"
            startIcon={<Add />}
            variant="contained"
            sx={{ px: '32px' }}
          >
            Income
          </Button>
        </Box>
      )}

      <IncomeTable
        data={incomeData?.items || []}
        addIncome={addIncomeDialog}
        canAdd={canAdd}
        isLoading={fetchingIncomeData || loadingIncomeData}
        setEditData={setSelectedIncome}
        onEdit={canAdd ? (data) => {
          addIncomeDialog.onTrue();
          setSelectedIncome(data);
        } : undefined}
        onDelete={canDelete ? (data) => {
          deleteIncomeDialog.onTrue();
          setSelectedIncome(data);
        } : undefined}
        // onView={(data) => {
        //   viewIncomeDialog.onTrue();
        //   setSelectedIncome(data);
        // }}
      />

      <CustomDialog
        open={addIncomeDialog.value}
        handleClose={() => {
          addIncomeDialog.onFalse();
          setTimeout(() => {
            setSelectedIncome(null);
          }, 200);
        }}
        title={
          <Box display="flex" flexDirection="row" gap={1} alignItems="center">
            <Typography variant="h5">
              {selectedIncome ? 'Update Income Tracking' : 'Add Income Tracking'}
            </Typography>
            <CustomTooltip
              arrow
              placement="right"
              sx={{ textAlign: 'justify' }}
              title={
                selectedIncome
                  ? 'Update income record details such as source, date, amount, and category to maintain accurate income tracking.'
                  : 'This screen allows users to add a new income by filling in all related fields such as category, amount, date and payment details.'
              }
            >
              <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
            </CustomTooltip>
          </Box>
        }
        maxWidth="sm"
      >
        <IncomeTrackingForm
          open={addIncomeDialog}
          onClose={handleClose}
          editData={selectedIncome}
        />
      </CustomDialog>

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
