'use client';

import React from 'react';

import { Typography } from '@mui/material';

import { formatNumber } from 'src/utils/formate_number';

import data from 'src/json/finance/reconicilation/clearedChqueData.json';

import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const FinanceClearedChequeListScreen = () => (
  <>
    <CustomBreadcrumbs
      heading="Cleared Cheque"
      description="The cleared cheque screen displays all payments made by cheque which are marked as cleared"
      links={[
        { name: 'Finance', href: '/finance/dashboard' },
        { name: 'Reconciliation', href: '/finance/reconciliation/cleared-cheque/' },
        { name: 'Cleared Cheque' },
      ]}
      sx={{ px: 1, mb: 2 }}
    />

    <CustomizableTable
      noDataText={
        <>There are no cleared cheques recorded for the selected class and division at this time.</>
      }
      tableId="finance-cleared-checklist-tab"
      columns={[
        //  {id:"srNo", label:"SR No"},

        { id: 'grNumber', label: 'GR No', filterType: 'number', sticky: true, align: 'left' },
        { id: 'studentName', label: 'Student Name', align: 'left' },
        { id: 'class', label: 'Class', align: 'left' },
        { id: 'division', label: 'Division', align: 'left' },
        { id: 'chequeNumber', label: 'Cheque Number', align: 'left' },
        { id: 'chequeDate', label: 'Cheque Date', filterType: 'date', align: 'left' },
        { id: 'clearedDate', label: 'Cleared Date', filterType: 'date', align: 'left' },
        { id: 'feeHead', label: 'Fee Head', align: 'left' },
        {
          id: 'amount',
          label: 'Amount',
          filterType: 'formattedNumber',
          align: 'left',
          render(value, row) {
            return <Typography fontSize="12px">{formatNumber(row.amount, 'INR')}</Typography>;
          },
        },
      ]}
      data={data}
    />
  </>
);

export default FinanceClearedChequeListScreen;
