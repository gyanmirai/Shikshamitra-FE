'use client';

import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import React, { useState, useEffect } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { Box, Button, Typography } from '@mui/material';
import { formatNumber } from 'src/utils/formate_number';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import incomeTrackingData from 'src/json/finance/income/incomeTrackingData.json';

import FinanceAddNewIncomeDialog from './component/finance-add-new-income-dialog';
import FinanceIncomeDetailsDialog from './component/finance-income-details-dialog';

import type { IncomeData } from './interface/income-screen-interface';

const FinanceIncomeTrackingScreen = () => {
  // Dialog control for main actions
  const dialog = useBoolean();
  // Dialog control for showing income source details
  const dialogForDetailsInSource = useBoolean();
  // Dialog control for delete confirmation
  const dialogForDeleteConfirmation = useBoolean();
  // State to store the currently selected income entry
  const [selectedEntry, setSelectedEntry] = useState<IncomeData>(incomeTrackingData[0]);
  // State to track if we're in edit mode
  const [isEdit, setIsEdit] = useState<boolean>(false);
  // State to store all income tracking data
  const [tableData] = useState<IncomeData[]>(incomeTrackingData);
  // State to control the visibility of the add/edit dialog
  const [open, setOpen] = useState<boolean>(false);

  // Handler to close the income source details dialog
  const closeDialogForDetailsInSource = () => {
    dialogForDetailsInSource.onFalse();
  };

  // Effect to handle changes in selected entry or edit mode
  useEffect(() => {}, [selectedEntry, isEdit]);

  // Handler to close the add/edit dialog and reset edit mode
  const handleClose = () => {
    setOpen(false);
    setIsEdit(false);
  };

  return (
    <Box height="100%">
      {/* for adding new income based on category */}
      {open ? (
        <FinanceAddNewIncomeDialog
          onSave={() => {}}
          dialogValue={dialog.value}
          onClose={handleClose}
          data={selectedEntry}
          isEdit={isEdit}
          allData={tableData}
        />
      ) : (
        <Box>
          <CustomBreadcrumbs
            description="The Income Tracking screen provides an overview of all recorded income transactions. You can track income sources, view transaction details, and monitor financial records efficiently."
            heading="Income Tracking"
            links={[{ name: 'Finance', href: '/finance/dashboard' }, { name: 'Income Tracking' }]}
            action={
              <Button
                size="small"
                startIcon={<Add />}
                onClick={() => setOpen(true)}
                variant="contained"
              >
                Income
              </Button>
            }
          />

          <CustomizableTable
            noDataText={
              <>
                No Income Found{' '}
                <Box
                  onClick={() => {
                    setOpen(true);
                  }}
                  color="primary.main"
                  fontWeight={600}
                  sx={{
                    '&:hover': {
                      cursor: 'pointer',
                      color: 'primary.main',
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Add Income
                </Box>
              </>
            }
            tableId="income-tracking-table"
            isScrollbar={false}
            columns={[
              {
                id: 'incomeSource',
                label: 'Income Source',
              },
              {
                id: 'incomeAmount',
                label: 'Income Amount',
                filterType: 'formattedNumber',
                align: 'right',
                render(value, row) {
                  return (
                    <Typography fontSize="13px">{formatNumber(row.incomeAmount, 'INR')}</Typography>
                  );
                },
              },
              {
                id: 'action',
                label: 'Actions',
                isFilter: false,
                isSort: false,
                minWidth: 70,
                align: 'left',
                sticky: true,
                render(value, row: any) {
                  return (
                    <ThreeDotsActions
                      showThreeDots={false}
                      placement="right-top"
                      showViewIcon
                      handleViewClick={() => {
                        dialogForDetailsInSource.onTrue();
                        setSelectedEntry(row);
                      }}
                      showDeleteIcon
                      handleDeleteClick={() => {
                        dialogForDeleteConfirmation.onTrue();
                        setSelectedEntry(row);
                      }}
                      showEditIcon
                      handleEditClick={() => {
                        setIsEdit(true);
                        setSelectedEntry(row);
                        setOpen(true);
                      }}
                    />
                  );
                },
              },
            ]}
            data={tableData}
          />
        </Box>
      )}

      {dialogForDeleteConfirmation.value && (
        <ConfirmDialog
          open={dialogForDeleteConfirmation.value}
          onClose={() => {
            dialogForDeleteConfirmation.onFalse();
          }}
          title="Delete"
          content={
            <>
              Are you sure you want to delete <strong>{selectedEntry.incomeSource}?</strong>
            </>
          }
          action={
            <LoadingButton
              size="small"
              variant="contained"
              loading={false}
              color="error"
              onClick={() => {}}
            >
              Yes
            </LoadingButton>
          }
        />
        // <DeleteConfirmationDialog
        //   open={dialogForDeleteConfirmation.value}
        //   onClose={() => {
        //     dialogForDeleteConfirmation.onFalse();
        //   }}
        //   onConfirm={() => {}}
        //   title="Delete Item"
        //   description="Are you sure you want to delete this item? This action cannot be undone."
        // />
      )}

      {/* details of the income based on source type */}
      {dialogForDetailsInSource.value && (
        <FinanceIncomeDetailsDialog
          dialogValue={dialogForDetailsInSource.value}
          onClose={closeDialogForDetailsInSource}
          data={selectedEntry}
        />
      )}
    </Box>
  );
};

export default FinanceIncomeTrackingScreen;
