import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import React from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomizableTable from 'src/components/customizabaleTable';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Grid, Card, Button, Typography, DialogActions } from '@mui/material';
import { useGetExpenseListQuery } from 'src/redux/finance/expenseApi/expenseDetailedApi';

import type { IExpenseFormValues } from './type';

const ViewExpenseData = ({
  viewExpenseDialog,
  expenseData,
  expenseDetailedData,
  onClose,
}: {
  viewExpenseDialog: UseBooleanReturn;
  expenseData: IExpenseFormValues | null;
  expenseDetailedData: any;
  onClose: () => void;
}) => {
  const { data: expenseListData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExpenseListQuery,
  });

  console.log('expenseListData', expenseListData);

  return (
    <Box>
      <DialogScrollContent>
        {/* Expense Information Card */}
        <Card
          sx={{
            p: 2,
            mb: 3,
          }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
              Expense Information
            </Typography>

            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 4 }}>
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', fontSize: '0.875rem', mb: 0.5 }}
                >
                  Expense Category
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                  Learning Materials
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', fontSize: '0.875rem', mb: 0.5 }}
                >
                  Budget
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                  Academic Budget 2025
                </Typography>
              </Grid>

              <Grid size={{ xs: 12, md: 4 }}>
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', fontSize: '0.875rem', mb: 0.5 }}
                >
                  Total Expense Amount
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                  ₹ 1,00,000
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Card>

        {/* Expense Lists Section */}
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
          Expense Lists
        </Typography>

        <Box sx={{ pb: 2 }}>
          <CustomizableTable
            tableId="expense-list-table"
            isLoading={false}
            noDataText="No Expense data found"
            columns={[
              {
                id: 'expenseName',
                label: 'Expense Name',
                align: 'left',
              },
              {
                id: 'expenseDate',
                label: 'Expense Date',
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
                render: (value, row) => (
                  <Typography variant="body2">₹ {row.amount?.toLocaleString()}</Typography>
                ),
              },
            ]}
            data={expenseListData || []}
          />
        </Box>
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
};

export default ViewExpenseData;
