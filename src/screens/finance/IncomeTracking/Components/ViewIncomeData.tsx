import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import React from 'react';

import { Box, Grid, Typography } from '@mui/material';

import CustomizableTable from 'src/components/customizabaleTable';

import type { IIncomeFormValues } from './type';

const ViewIncomeData = ({
  viewIncomeDialog,
  incomeData,
  incomeDetailedData,
}: {
  viewIncomeDialog: UseBooleanReturn;
  incomeData: IIncomeFormValues | null;
  incomeDetailedData: any;
}) => (
  <Box sx={{ p: 2 }}>
    <Box
      sx={{
        border: '1px solid #e0e0e0',
        borderRadius: 2,
        p: 2,
        mb: 3,
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography>
            <b>Income Category</b>
          </Typography>
          <Typography>{incomeData?.incomeCategory}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography>
            <b>Budget</b>
          </Typography>
          <Typography variant="body1">{incomeData?.budget}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography>
            <b>Budget Sub Category</b>
          </Typography>
          <Typography variant="body1">{incomeData?.budgetSubCategory}</Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography>
            <b>Total Amount Received</b>
          </Typography>
          <Typography variant="body1">₹ {incomeData?.amount}</Typography>
        </Grid>
      </Grid>
    </Box>

    {/* Income Lists */}
    <Typography variant="h6" gutterBottom>
      Income Lists
    </Typography>

    <CustomizableTable
      tableId="income-table"
      isSearch={false}
      isFilter={false}
      noDataText="No Income data found"
      columns={[
        {
          id: 'incomeName',
          label: 'Income Name',
          align: 'left',
        },
        {
          id: 'receivedDate',
          label: 'Received Date',
          align: 'left',
          filterType: 'date',
        },
        {
          id: 'budgetSubCategory',
          label: 'Budget Sub Category',
          align: 'left',
        },
        {
          id: 'paymentMethod',
          label: 'Payment Method',
          align: 'left',
        },
        {
          id: 'amount',
          label: 'Amount',
          align: 'left',

          filterType: 'number',
          render: (value) => `₹ ${value?.toLocaleString()}`,
        },
      ]}
      data={incomeDetailedData || []}
    />
  </Box>
);

export default ViewIncomeData;
