import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import React from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomizableTable from 'src/components/customizabaleTable';
import { DialogScrollContent } from 'src/components/customDialog';
import { Box, Card, Grid, Button, Typography, DialogActions } from '@mui/material';

import type { IIncomeFormValues } from './type';

const ViewIncomeData = ({
  viewIncomeDialog,
  incomeData,
  incomeDetailedData,
  onClose,
}: {
  viewIncomeDialog: UseBooleanReturn;
  incomeData: IIncomeFormValues | null;
  incomeDetailedData: any;
  onClose: () => void;
}) => (
  <Box>
    <DialogScrollContent>
      <Card
        sx={{
          p: 2,
          mb: 3,
        }}
      >
        <Box sx={{}}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            Income Information
          </Typography>
          <Grid container spacing={2}>
            {/* Income Category */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Income Category
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {incomeData?.incomeCategory || '-'}
              </Typography>
            </Grid>

            {/* Budget */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Budget
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {incomeData?.budget || '-'}
              </Typography>
            </Grid>

            {/* Total Amount Received */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Total Amount Received
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                ₹ {incomeData?.amount || 0}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Card>

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
            minWidth: '200px',
          },
          {
            id: 'receivedDate',
            label: 'Received Date',
            align: 'left',
            filterType: 'date',
            minWidth: '150px',
          },
          {
            id: 'paymentMethod',
            label: 'Payment Method',
            align: 'left',
            minWidth: '160px',
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
    </DialogScrollContent>
    <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
      <Button
        onClick={() => {
          onClose();
        }}
        variant="outlined"
        size="small"
        startIcon={<Iconify icon={GlobalIcons.cancel} />}
      >
        Cancel
      </Button>
    </DialogActions>
  </Box>
);

export default ViewIncomeData;
