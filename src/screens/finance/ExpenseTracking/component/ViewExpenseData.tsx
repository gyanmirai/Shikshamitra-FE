import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import React from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomizableTable from 'src/components/customizabaleTable';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetExpenseListQuery } from 'src/redux/finance/expenseApi/expenseDetailedApi';
import { Box, Grid, Card, Stack, Button, Divider, Typography, DialogActions } from '@mui/material';

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
  const { data: expenseListData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExpenseListQuery,
  });

  return (
    <Box>
      <DialogScrollContent sx={{ p: { xs: 2, md: 3 } }}>
        {/* Expense Summary Section */}
        <Card
          sx={{
            p: 3,
            mb: 4,
            backgroundColor: (theme) => theme.palette.background.neutral,
            borderRadius: 2,
            boxShadow: 'none',
            border: (theme) => `1px dashed ${theme.palette.divider}`,
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
            <Iconify
              icon="fluent:receipt-money-24-filled"
              width={24}
              sx={{ color: 'primary.main' }}
            />
            <Typography variant="h6" fontWeight="bold">
              Expense Summary
            </Typography>
          </Stack>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack spacing={0.5}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight="bold"
                  sx={{ textTransform: 'uppercase' }}
                >
                  EXPENSE CATEGORY
                </Typography>
                <Typography variant="subtitle1" fontWeight="bold">
                  {expenseData?.expenseCategory || '—'}
                </Typography>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Stack spacing={0.5}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight="bold"
                  sx={{ textTransform: 'uppercase' }}
                >
                  TAGS
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.primary' }}>
                  {expenseData?.expenseCategoryTags || '—'}
                </Typography>
              </Stack>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Stack spacing={0.5}>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  fontWeight="bold"
                  sx={{ textTransform: 'uppercase' }}
                >
                  TOTAL AMOUNT SPENT
                </Typography>
                <Typography variant="h5" color="error.main" fontWeight="800">
                  ₹ {expenseDetailedData?.totalExpenseAmount?.toLocaleString() || '0'}
                </Typography>
              </Stack>
            </Grid>
          </Grid>
        </Card>

        {/* Detailed Transactions Section */}
        <Stack direction="row" alignItems="center" spacing={1.5} mb={2}>
          <Iconify
            icon="fluent:text-bullet-list-square-24-regular"
            width={24}
            sx={{ color: 'text.secondary' }}
          />
          <Typography variant="h6" fontWeight="bold">
            Detailed Transactions
          </Typography>
        </Stack>

        <Card sx={{ boxShadow: 'var(--shadows-2)', borderRadius: 2 }}>
          <CustomizableTable
            tableId="expense-list-table"
            isLoading={false}
            noDataText="No Expense data found"
            columns={[
              {
                id: 'expenseName',
                label: 'Expense Name',
                align: 'left',
                sticky: true,
              },
              {
                id: 'spentDate',
                label: 'Date',
                align: 'left',
              },
              {
                id: 'paymentMethod',
                label: 'Method',
                align: 'left',
                render: (value, row) => (
                  <Box
                    sx={{
                      px: 1,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: 'background.neutral',
                      display: 'inline-block',
                      typography: 'caption',
                      fontWeight: 'bold',
                      color: 'text.primary',
                      border: (theme) => `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    {row.paymentMethod}
                  </Box>
                ),
              },
              {
                id: 'amount',
                label: 'Amount (₹)',
                align: 'right',
                render: (value, row) => (
                  <Typography variant="subtitle2" fontWeight="bold">
                    ₹ {row.amount?.toLocaleString()}
                  </Typography>
                ),
              },
            ]}
            data={expenseListData || []}
          />
        </Card>
      </DialogScrollContent>

      <Divider />

      <DialogActions sx={{ p: 2.5 }}>
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
