'use client';

import React from 'react';

import { Box, TextField, Typography } from '@mui/material';

import { formatNumber } from 'src/utils/formate_number';

import data from 'src/json/finance/reconicilation/clearedChqueData.json';

import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const FinanceClearedChequeListScreen = () => (
  <>
    <CustomBreadcrumbs
      heading="Cleared Cheque"
      description="The cleared cheque screen displays all payments made by cheque which are marked as cleared"
      links={[
        { name: 'Finance', href: '/finance/dashboard' },
        { name: 'Reconciliation' },
        { name: 'Cleared Cheque' },
      ]}
      sx={{ px: 1, mb: 2 }}
    />
    <Box py="15px" display="flex" justifyContent="space-between">
      <Box display="flex" flexDirection="row" gap={3}>
        <CustomSelect
          label="Class/Grade"
          options={[]}
          value=""
          onChange={() => {}}
          formControlProps={{ sx: { minWidth: 140 } }}
        />
        <CustomSelect
          label="Division"
          options={[]}
          value=""
          onChange={() => {}}
          formControlProps={{ sx: { minWidth: 140 } }}
        />
        <TextField
          label="Search by student name"
          variant="outlined"
          size="small"
          value=""
          onChange={(e: any) => {
            console.log(e);
          }}
        />
      </Box>
    </Box>
    <CustomizableTable
      noDataText={
        <>There are no cleared cheques recorded for the selected class and division at this time.</>
      }
      searchFieldProps={{
        placeholder: 'Search by Gr Number, Name...',
        label: 'Search by Gr Number, Name...',
        sx: {
          maxWidth: '400px',
          width: '100%',
        },
      }}
      tableId="finance-cleared-checklist-tab"
      columns={[
        //  {id:"srNo", label:"SR No"},

        { id: 'grNumber', label: 'GR No', filterType: 'number', sticky: true },
        { id: 'studentName', label: 'Student Name' },
        { id: 'chequeNumber', label: 'Cheque Number' },
        { id: 'chequeDate', label: 'Cheque Date', filterType: 'date' },
        { id: 'clearedDate', label: 'Cleared Date', filterType: 'date' },
        { id: 'feeHead', label: 'Fee Head' },

        {
          id: 'amount',
          label: 'Amount',
          filterType: 'formattedNumber',
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
