'use client';

import React, { useState, useEffect } from 'react';

import { Box, Button, MenuItem, MenuList, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { formatNumber } from 'src/utils/formate_number';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import FinanceAddNewIncomeDialog from './component/finance-add-new-income-dialog';
import FinanceIncomeDetailsDialog from './component/finance-income-details-dialog';

interface Data {
  incomeSource: string;
  incomeAmount: string;
  paymentMethod: string;
  date: string;
  id: number;
  paymentStatus: string;
  action?: string;
  incomeList?: any;
}

let data: Data[] = [
  {
    id: 1,
    incomeSource: 'Fees',
    incomeAmount: '50000',
    paymentMethod: 'Online',
    date: '12-12-2024',
    paymentStatus: 'Paid',
    action: 'View',
    incomeList: [
      {
        incomeName: 'Tuition Fees',
        amount: 25000,
        date: '11-10-2024',
      },
      {
        incomeName: 'Tuition Fees',
        amount: 25000,
        date: '12-10-2024',
      },
    ],
  },
  {
    id: 2,
    incomeSource: 'Donation',
    incomeAmount: '500000',
    paymentMethod: 'Online',
    date: '10-10-2024',
    paymentStatus: 'Paid',
    action: 'View',
    incomeList: [
      {
        incomeName: 'Sks Trust',
        amount: 250000,
        date: '11-10-2024',
      },
      {
        incomeName: 'Gyan Mirai',
        amount: 250000,
        date: '12-08-2024',
      },
    ],
  },
];

const FinanceIncomeTrackingScreen = () => {
  const dialog = useBoolean();
  const dialogForDetailsInSource = useBoolean();
  const [selectedEntry, setSelectedEntry] = useState(data);
  const [isEdit, setIsEdit] = useState(false);
  const [tableData, setTableData] = useState(data);

  const closeDialog = () => {
    setIsEdit(false);
    dialog.onFalse();
  };


  const closeDialogForDetailsInSource = () => {

    dialogForDetailsInSource.onFalse();
  };

  useEffect(() => { }, [selectedEntry, isEdit]);

  const handleSave = (dataFromDialog: Data) => {
    const { incomeSource, incomeAmount, paymentMethod, date, paymentStatus, id } = dataFromDialog;

    if (dataFromDialog) {
      const existingEntryIndex = data.findIndex((val) => id === val.id);

      const newIncomeEntry = {
        incomeSource,
        incomeAmount,
        paymentMethod,
        date,
        paymentStatus,
        id,
        action: isEdit ? 'edit' : 'add',
      };

      const updatedData = [...data];

      if (isEdit && existingEntryIndex !== -1) {
        updatedData[existingEntryIndex] = newIncomeEntry;
      } else {
        updatedData.push(newIncomeEntry);
      }

      setTableData(updatedData);
    }

    closeDialog();
    console.log('Updated Data:', dataFromDialog);
  };

  const handleDelete = (item: any) => {
    data = data.filter((val) => val.id !== item.id || val.id !== item.id);

    setTableData([...data]);
  };

  return (
    <>
    <CustomBreadcrumbs
        heading="Income Tracking"
        links={[{ name: 'Finance' }, { name: 'Income Tracking' }]}
        sx={{ px: 1, mb: 2 }}
        
      />
      <Box gap={3} display="flex" flexDirection="row" justifyContent="flex-end">
        <Button onClick={dialog.onTrue} variant="contained" size="small">
          Add New Income
        </Button>
      </Box>
      <Box>
        <Typography component="span" variant="h6" gutterBottom>
          Income OverView
        </Typography>
      </Box>
      <CustomizableTable
        isScrollbar={false}
        columns={[
          {
            id: 'incomeSource',
            label: 'Income Source',
            // children(row) {
            //   return (
            //     <CustomizableTable
            //       isFilter={false}
            //       isPagination={false}
            //       isSearch={false}
            //       columns={[
            //         { id: 'incomeName', label: 'Income Name' },
            //         {
            //           id: 'amount',
            //           label: 'Amount',
            //           render(value) {
            //             return (
            //               <Typography fontSize="12px">{formatNumber(value, 'INR')}</Typography>
            //             );
            //           },
            //         },
            //         { id: 'date', label: 'Received Date' },
            //       ]}
            //       data={row.incomeList}
            //     />
            //   );
            // },
          },
          {
            id: 'incomeAmount',
            label: 'Income Amount',
            render(value, row) {
              return (
                <Typography fontSize="12px">{formatNumber(row.incomeAmount, 'INR')}</Typography>
              );
            },
          },
          { id: 'paymentMethod', label: 'Payment Method' },
          { id: 'date', label: 'Date' },

          {
            id: 'paymentStatus',
            label: 'Payment Status',
            render(value, row) {
              return (
                <Label
                  variant="soft"
                  color={
                    value === 'Overdue'
                      ? 'error'
                      : value === 'Unpaid'
                        ? 'warning'
                        : value === 'Paid'
                          ? 'success'
                          : 'default'
                  }
                >
                  {value}
                </Label>
              );
            },
          },
          {
            id: 'action',
            label: 'Action',
            render(value, row: any) {
              return (
                <ThreeDotsActions
                placement='right-top'
                  actions={({ popover }: any) => (
                    <MenuList>
                      <MenuItem
                        onClick={() => {
                          console.log("data row", row)
                          dialogForDetailsInSource.onTrue();
                          setSelectedEntry(row)
                        }}
                      >
                        <Iconify icon="mdi:eye" />
                        View Details
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          setIsEdit(true);
                          setSelectedEntry(row);

                          dialog.onTrue();
                        }}
                      >
                        <Iconify icon="solar:pen-bold" />
                        Edit
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          handleDelete(row);
                        }}
                      >
                        <Iconify icon="solar:trash-bin-trash-bold" />
                        Delete
                      </MenuItem>
                    </MenuList>
                  )}
                />
              );
            },
          },
        ]}
        data={tableData}
      />
      <Box>
        {dialog.value && selectedEntry && (
          <FinanceAddNewIncomeDialog
            onSave={handleSave}
            dialogValue={dialog.value}
            onClose={closeDialog}
            data={selectedEntry}
            isEdit={isEdit}
            allData={tableData}
          />
        )}
      </Box>

      {dialogForDetailsInSource.value && <FinanceIncomeDetailsDialog 
        dialogValue={dialogForDetailsInSource.value}
        onClose={closeDialogForDetailsInSource}
        data={selectedEntry} />}
    </>
  );
};

export default FinanceIncomeTrackingScreen;
