'use client';

import React, { useState } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Switch, Button, TextField, DialogActions, DialogContent } from '@mui/material';

const FinanceNotificationTable = () => {
  const [open, setOpen] = useState(false); // State to manage dialog visibility
  const [currentRow, setCurrentRow] = useState<any>(null); // State to store the current row being edited
  const [details, setDetails] = useState(''); // State to manage the details text

  const cardData = [
    {
      cardTitle: 'Overdue Fee Alert',
      switchLabel: 'Enable Overdue Alerts',
      textFieldLabel:
        'We noticed that your [Fee Type] fee of ₹[Amount] for [Month/Term] was due on [Due Date] and is still pending. Please clear the payment at the earliest to avoid additional late fees or service disruptions',
      showOptionalSwitch: false,
    },
    // {
    //   cardTitle: 'Low Department Budgets',
    //   switchLabel: 'Enable alerts for low budget',
    //   textFieldLabel: 'Alert when utilization reaches 80%',
    //   showOptionalSwitch: false,
    // },
    // {
    //   cardTitle: 'Unpaid Salary Alerts',
    //   switchLabel: 'Enable Unpaid Salary Alerts',
    //   textFieldLabel: '2 Days after salary unpaid',
    //   showOptionalSwitch: false,
    // },
    {
      cardTitle: 'General Fee Reminders',
      switchLabel: 'Enable Fee Reminders',
      textFieldLabel: 'Send reminder X days before due date',
      showOptionalSwitch: false,
    },
    // {
    //   cardTitle: 'Overdue Alerts',
    //   switchLabel: 'Enable Overdue Alerts',
    //   textFieldLabel: 'Send overdue alert after X days',
    //   showOptionalSwitch: false,
    // },
    // {
    //   cardTitle: 'Upcoming Expenses',
    //   switchLabel: 'Activate or deactivate notifications for upcoming expenses',
    //   textFieldLabel: 'To enter specific dates or conditions',
    //   showOptionalSwitch: true,
    // },
    // {
    //   cardTitle: 'Pending Income',
    //   switchLabel: 'Activate or deactivate notifications for pending income',
    //   textFieldLabel: 'To enter specific dates or conditions',
    //   showOptionalSwitch: true,
    // },
  ];

  const handleOpenDialog = (row: any) => {
    setCurrentRow(row);
    setDetails(row.textFieldLabel);
    setOpen(true);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setCurrentRow(null);
    setDetails('');
  };

  const handleSaveDetails = () => {
    // console.log(`${currentRow.cardTitle} updated details:`, details);
    // Here you can update the data source with the new details value
    handleCloseDialog();
  };

  const financeCategoryNotificationDialogBoolean = useBoolean();
  return (
    <>
      <CustomizableTable
        tableId="finance-notification-table"
        isFilter={false}
        isPagination={false}
        isSearch={false}
        isShowedDense={false}
        columns={[
          { id: 'cardTitle', label: 'Notification Title' },
          {
            id: 'switchLabel',
            label: 'Enable/Disable',
            render(value, item) {
              return (
                <Switch
                  checked
                  onChange={(e) => console.log(`${item.cardTitle} switch:`, e.target.checked)}
                />
              );
            },
          },

          {
            id: 'action',
            label: 'Action',
            render(value, row) {
              return (
                <ThreeDotsActions
                  showThreeDots={false}
                  showEditIcon
                  showViewIcon
                  handleEditClick={() => {
                    // setCurrentRow(row)
                    financeCategoryNotificationDialogBoolean.onTrue();
                  }}
                />
              );
            },
          },
        ]}
        data={cardData}
      />
      {/* {financeCategoryNotificationDialogBoolean && (
        <FinanceCategoryNotificationDialog
          open={financeCategoryNotificationDialogBoolean.value}
          onClose={() => {
            financeCategoryNotificationDialogBoolean.onFalse();
          }}
          selectedCategory={[]}
        />
      )} */}
      {/* Dialog for editing details */}
      <CustomDialog
        title={`Edit Details For ${currentRow !== null ? currentRow!.cardTitle : ''}`}
        open={open}
        handleClose={handleCloseDialog}
        maxWidth="sm"
      >
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral' }}>
          <DialogContent>
            <Box pt="15px" />
            <TextField
              label="Details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              fullWidth
              multiline
              rows={4}
            />
          </DialogContent>
        </Scrollbar>
        <DialogActions>
          {/* <Button onClick={handleCloseDialog} color="secondary">
            Cancel
          </Button> */}
          <Button onClick={handleSaveDetails} variant="contained" size="small">
            Save
          </Button>
        </DialogActions>
      </CustomDialog>
    </>
  );
};

export default FinanceNotificationTable;
