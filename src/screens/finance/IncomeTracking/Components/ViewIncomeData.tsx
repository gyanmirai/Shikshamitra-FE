import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import React from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomizableTable from 'src/components/customizabaleTable';
import { DialogScrollContent } from 'src/components/customDialog';
import { PaymentMethodLabels } from 'src/enums/finance-payment-method';
import {
  Box,
  Card,
  Grid,
  Stack,
  Paper,
  Button,
  Divider,
  Typography,
  DialogActions,
} from '@mui/material';

import type { IIncomeRecord } from '../types';

const ViewIncomeData = ({
  viewIncomeDialog,
  incomeData,
  incomeDetailedData,
  onClose,
}: {
  viewIncomeDialog: UseBooleanReturn;
  incomeData: IIncomeRecord | null;
  incomeDetailedData: any;
  onClose: () => void;
}) => {
  const { incomeInformation, incomeList } = incomeDetailedData || {};
  return (
    <>
      <DialogScrollContent>
        <Stack spacing={3} sx={{ p: 1 }}>
          {/* Income Information Section */}
          <Card
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: 2,
              borderStyle: 'dashed',
              borderColor: 'divider',
              bgcolor: 'background.neutral',
            }}
          >
            <Stack spacing={2}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Iconify
                  icon="solar:bill-list-bold-duotone"
                  width={24}
                  sx={{ color: 'primary.main' }}
                />
                <Typography variant="h6" color="text.primary">
                  Income Summary
                </Typography>
              </Stack>

              <Divider sx={{ borderStyle: 'dashed' }} />

              <Grid container spacing={3}>
                {/* Income Category */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <Stack spacing={0.5}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight="bold"
                      sx={{ textTransform: 'uppercase' }}
                    >
                      Income Category
                    </Typography>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {incomeInformation?.incomeCategoryName || incomeData?.categoryName || '—'}
                    </Typography>
                  </Stack>
                </Grid>

                {/* Total Amount Received */}
                <Grid size={{ xs: 12, md: 4 }}>
                  <Stack spacing={0.5}>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      fontWeight="bold"
                      sx={{ textTransform: 'uppercase' }}
                    >
                      Total Amount Received
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      sx={{ color: 'success.main', fontWeight: 'bold' }}
                    >
                      ₹{' '}
                      {incomeInformation?.totalAmountReceived?.toLocaleString() ||
                        incomeData?.amount?.toLocaleString() ||
                        0}
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </Stack>
          </Card>

          {/* Income Lists Section */}
          <Stack spacing={1.5}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ px: 1 }}>
              <Iconify icon="solar:list-bold-duotone" width={22} sx={{ color: 'info.main' }} />
              <Typography variant="subtitle1" fontWeight="bold">
                Detailed Transactions
              </Typography>
            </Stack>

            <Paper
              variant="outlined"
              sx={{
                borderRadius: 2,
                overflow: 'hidden',
                boxShadow: 'var(--shadows-popover)',
                borderColor: 'divider',
              }}
            >
              <CustomizableTable
                tableId="income-table"
                isSearch={false}
                isFilter={false}
                noDataText="No transaction data found for this income entry."
                columns={[
                  {
                    stickyPosition: 'left',
                    id: 'incomeName',
                    label: 'Name',
                    align: 'left',
                    minWidth: '220px',
                    sticky: true,
                    render: (value: any) => (
                      <Typography variant="body2" fontWeight="medium">
                        {value}
                      </Typography>
                    ),
                  },
                  {
                    id: 'receivedDate',
                    label: 'Date',
                    align: 'left',
                    filterType: 'date',
                    minWidth: '140px',
                    render: (value: any) => (
                      <Typography variant="body2" color="text.secondary">
                        {value}
                      </Typography>
                    ),
                  },
                  {
                    cellSx: { textAlign: 'center' as const },
                    id: 'paymentMethod',
                    label: 'Method',
                    align: 'left',
                    minWidth: '140px',
                    render: (value: any) => (
                      <Box
                        sx={{
                          display: 'inline-flex',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          bgcolor: 'background.neutral',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Typography variant="caption" fontWeight="bold">
                          {PaymentMethodLabels[value as keyof typeof PaymentMethodLabels] || value}
                        </Typography>
                      </Box>
                    ),
                  },
                  {
                    cellSx: { textAlign: 'right' as const },
                    id: 'amount',
                    label: 'Amount (₹)',
                    align: 'left',
                    minWidth: '140px',
                    filterType: 'number',
                    render: (value: any) => (
                      <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
                        ₹ {value?.toLocaleString()}
                      </Typography>
                    ),
                  },
                ]}
                data={incomeList || []}
              />
            </Paper>
          </Stack>
        </Stack>
      </DialogScrollContent>

      <Divider />

      <DialogActions sx={{ p: 2.5, bgcolor: 'background.paper' }}>
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
    </>
  );
};

export default ViewIncomeData;
