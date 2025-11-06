import type { LabelColor } from 'src/components/label';

import React from 'react';
import { varAlpha } from 'src/theme/styles';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Label } from 'src/components/label/label';
import CustomDialog from 'src/components/customDialog';
import { formatNumber } from 'src/utils/formate_number';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { AppAreaInstalled } from 'src/screens/hr/dashboard/app-area-installed';
import PaymentReceipt from 'src/screens/hostel/feeManagement/components/HostelPaymentHistoryComponent/paymentReceipt';
import {
  PaymentStatusType,
  PaymentStatusOptions,
  PaymentStatusTypeColors,
} from 'src/enums/payment-status';
import {
  Box,
  Card,
  Grid,
  Stack,
  MenuList,
  MenuItem,
  Accordion,
  Typography,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import { students } from './finance-profile-data/finance-profile-fee-data';

import type { StudentTabsComponentType } from '.';
import type { PaymentDate } from './finance-profile-data/finance-profile-fee-data';

const Finance = (props: StudentTabsComponentType) => {
  const receiptDialog = useBoolean();
  const theme = useTheme();

  return (
    <>
      <Grid container spacing={2.5}>
        {/* Total Fees Card */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card
            elevation={0}
            sx={{
              p: 3,
              height: '140px',
              border: `1px solid ${varAlpha(theme.palette.primary.mainChannel, 0.12)}`,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${varAlpha(theme.palette.primary.mainChannel, 0.05)} 0%, ${varAlpha(
                theme.palette.primary.mainChannel,
                0.01
              )} 100%)`,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 12px 24px ${varAlpha(theme.palette.primary.mainChannel, 0.15)}`,
              },
            }}
          >
            <Stack spacing={1} height="100%" justifyContent="center">
              <Box display="flex" alignItems="center" gap={1}>
                <Iconify icon="mdi:currency-inr" width={24} />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: '16px', fontWeight: 500 }}
                >
                  Total Fees
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={700} sx={{ marginLeft: '5px' }}>
                ₹ 60,000
              </Typography>
            </Stack>
          </Card>
        </Grid>

        {/* Paid Fees Card */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card
            elevation={0}
            sx={{
              p: 3,
              height: '140px',
              border: `1px solid ${varAlpha(theme.palette.success.mainChannel, 0.12)}`,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${varAlpha(theme.palette.success.mainChannel, 0.05)} 0%, ${varAlpha(
                theme.palette.success.mainChannel,
                0.01
              )} 100%)`,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 12px 24px ${varAlpha(theme.palette.success.mainChannel, 0.15)}`,
              },
            }}
          >
            <Stack spacing={1} height="100%" justifyContent="center">
              <Box display="flex" alignItems="center" gap={1}>
                <Iconify icon="mdi:check-circle" width={24} />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: '16px', fontWeight: 500 }}
                >
                  Paid Fees
                </Typography>
              </Box>
              <Typography
                variant="h4"
                fontWeight={700}
                sx={{ marginLeft: '5px' }}
                color="success.main"
              >
                ₹ 40,000
              </Typography>
            </Stack>
          </Card>
        </Grid>

        {/* Pending Fees Card */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card
            elevation={0}
            sx={{
              p: 3,
              height: '140px',
              border: `1px solid ${varAlpha(theme.palette.warning.mainChannel, 0.12)}`,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${varAlpha(theme.palette.warning.mainChannel, 0.05)} 0%, ${varAlpha(
                theme.palette.warning.mainChannel,
                0.01
              )} 100%)`,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 12px 24px ${varAlpha(theme.palette.warning.mainChannel, 0.15)}`,
              },
            }}
          >
            <Stack spacing={1} height="100%" justifyContent="center">
              <Box display="flex" alignItems="center" gap={1}>
                <Iconify icon="mdi:clock-outline" width={24} />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: '16px', fontWeight: 500 }}
                >
                  Pending Fees
                </Typography>
              </Box>
              <Typography
                variant="h4"
                fontWeight={700}
                sx={{ marginLeft: '5px' }}
                color="warning.main"
              >
                ₹ 20,000
              </Typography>
            </Stack>
          </Card>
        </Grid>

        {/* Overdue Fees Card */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card
            elevation={0}
            sx={{
              p: 3,
              height: '140px',
              border: `1px solid ${varAlpha(theme.palette.error.mainChannel, 0.12)}`,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${varAlpha(theme.palette.error.mainChannel, 0.05)} 0%, ${varAlpha(
                theme.palette.error.mainChannel,
                0.01
              )} 100%)`,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 12px 24px ${varAlpha(theme.palette.error.mainChannel, 0.15)}`,
              },
            }}
          >
            <Stack spacing={1} height="100%" justifyContent="center">
              <Box display="flex" alignItems="center" gap={1}>
                <Iconify icon="mdi:alert-circle" width={24} />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: '16px', fontWeight: 500 }}
                >
                  Overdue Fees
                </Typography>
              </Box>
              <Typography
                variant="h4"
                fontWeight={700}
                sx={{ marginLeft: '5px' }}
                color="error.main"
              >
                ₹ 20,000
              </Typography>
            </Stack>
          </Card>
        </Grid>

        {/* Pending Refund Card */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card
            elevation={0}
            sx={{
              p: 3,
              height: '140px',
              border: `1px solid ${varAlpha(theme.palette.info.mainChannel, 0.12)}`,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${varAlpha(theme.palette.info.mainChannel, 0.05)} 0%, ${varAlpha(
                theme.palette.info.mainChannel,
                0.01
              )} 100%)`,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 12px 24px ${varAlpha(theme.palette.info.mainChannel, 0.15)}`,
              },
            }}
          >
            <Stack spacing={1} height="100%" justifyContent="center">
              <Box display="flex" alignItems="center" gap={1}>
                <Iconify icon="mdi:cash-refund" width={24} />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: '16px', fontWeight: 500 }}
                >
                  Pending Refund
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={700} sx={{ marginLeft: '5px' }}>
                ₹ 0
              </Typography>
            </Stack>
          </Card>
        </Grid>

        {/* Pending Charges Card */}
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <Card
            elevation={0}
            sx={{
              p: 3,
              height: '140px',
              border: `1px solid ${varAlpha(theme.palette.warning.mainChannel, 0.12)}`,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${varAlpha(theme.palette.warning.mainChannel, 0.05)} 0%, ${varAlpha(
                theme.palette.warning.mainChannel,
                0.01
              )} 100%)`,
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0 12px 24px ${varAlpha(theme.palette.warning.mainChannel, 0.15)}`,
              },
            }}
          >
            <Stack spacing={1} height="100%" justifyContent="center">
              <Box display="flex" alignItems="center" gap={1}>
                <Iconify icon="mdi:cash-plus" width={24} />
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ fontSize: '16px', fontWeight: 500 }}
                >
                  Pending Charges
                </Typography>
              </Box>
              <Typography variant="h4" fontWeight={700} sx={{ marginLeft: '5px' }}>
                ₹ 500
              </Typography>
            </Stack>
          </Card>
        </Grid>
      </Grid>

      {/* Chart Section */}
      <Box sx={{ height: 'calc(100vh - 400px)', mt: 3 }}>
        <AppAreaInstalled
          title="Fee Insights"
          selectSeries="2024"
          isShowChartLegendValue={false}
          chart={{
            categories: [
              'Jan',
              'Feb',
              'Mar',
              'Apr',
              'May',
              'Jun',
              'Jul',
              'Aug',
              'Sep',
              'Oct',
              'Nov',
              'Dec',
            ],
            series: [
              {
                name: '2024',
                data: [
                  {
                    name: 'Paid Fee',
                    data: [4500, 3800, 5000, 4200, 3500, 4800, 5200, 3900, 4600, 5100, 4300, 4700],
                  },
                  {
                    name: 'Pending Fee',
                    data: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                  },
                ],
              },
            ],
          }}
          sx={{ height: '100%' }}
        />

        <Box sx={{ my: 2 }} />
        {students[0].fees.map((feeHead: any) => (
          <Accordion key={feeHead.feeHeadId}>
            <AccordionSummary
              expandIcon={<Iconify icon="mdi:expand-more" />}
              aria-controls={`panel-${feeHead.feeHeadId}-content`}
              id={`panel-${feeHead.feeHeadId}-header`}
            >
              <Box display="flex" flexDirection="column" gap={3} width="100%">
                <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold' }}>
                  {feeHead.feeHead}
                </Typography>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '14px',
                    width: '100%',
                  }}
                >
                  <Box display="flex" flexWrap="wrap" gap="10px">
                    <Typography variant="body2">
                      <strong>Gross Fee:</strong> {formatNumber(feeHead.totalFees, 'INR')}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Payable Fee:</strong> {formatNumber(feeHead.finalFees, 'INR')}
                    </Typography>
                    <Typography variant="body2">
                      <strong>General Discount:</strong>{' '}
                      {formatNumber(feeHead.totalDiscount, 'INR')}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Additional Discount:</strong> {formatNumber(0, 'INR')}
                    </Typography>
                  </Box>
                  <Box display="flex" gap="20px" alignItems="center">
                    <Typography variant="body2" sx={{ color: '#138e58', fontWeight: 'bold' }}>
                      <strong>Paid:</strong> {formatNumber(feeHead.totalPaidAmount, 'INR')}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#b76e00', fontWeight: 'bold' }}>
                      <strong>Pending:</strong>{' '}
                      {formatNumber(feeHead.finalFees - feeHead.totalPaidAmount, 'INR')}
                    </Typography>
                  </Box>
                </div>
              </Box>
            </AccordionSummary>

            {/* Fee Month Table */}
            <AccordionDetails>
              <CustomizableTable
                columns={[
                  { id: 'Month', label: 'Month' },
                  {
                    id: 'Gross Fee',
                    label: 'Gross Fee',
                    filterType: 'number',
                    minWidth: 110,
                    render(value, row) {
                      return <Typography fontSize={14}>{formatNumber(value, 'INR')}</Typography>;
                    },
                  },
                  {
                    id: 'Payable Fee',
                    label: 'Payable Fee',
                    filterType: 'number',
                    minWidth: 130,
                    render(value, row) {
                      return <Typography fontSize={14}>{formatNumber(value, 'INR')}</Typography>;
                    },
                  },
                  {
                    id: 'Paid',
                    label: 'Paid',
                    filterType: 'number',
                    render(value, row) {
                      return <Typography fontSize={14}>{formatNumber(value, 'INR')}</Typography>;
                    },
                  },
                  {
                    id: 'Pending',
                    label: 'Pending',
                    filterType: 'number',
                    render(value, row) {
                      return (
                        <Typography fontSize={14} color="#b76e00">
                          {formatNumber(value, 'INR')}
                        </Typography>
                      );
                    },
                  },
                  {
                    id: 'General Discount',
                    label: 'General Discount',
                    filterType: 'number',
                    minWidth: 160,
                    align: 'left',
                    render(value, row) {
                      return <Typography fontSize={14}>{formatNumber(value, 'INR')}</Typography>;
                    },
                  },
                  {
                    id: 'Additional Discount',
                    label: 'Additional Discount',
                    minWidth: 190,
                    align: 'left',
                    filterType: 'number',
                    render(value, row) {
                      return <Typography fontSize={14}>{formatNumber(value, 'INR')}</Typography>;
                    },
                  },
                  {
                    id: 'status',
                    label: 'Status',
                    filterType: 'enum',
                    enumOptions: PaymentStatusOptions,
                    minWidth: 100,
                    align: 'left',
                    isSort: false,
                    render(value, row) {
                      const color = PaymentStatusTypeColors[
                        value as PaymentStatusType
                      ] as LabelColor;

                      return (
                        <Label color={color}>{PaymentStatusType[value as PaymentStatusType]}</Label>
                      );
                    },
                  },
                  {
                    id: 'Action',
                    label: 'Action',
                    sticky: true,
                    isFilter: false,

                    isSort: false,
                    minWidth: 40,
                    render(value, row) {
                      return (
                        <ThreeDotsActions
                          placement="right-top"
                          actions={({ popover: pop }) => (
                            <MenuList>
                              {row.Pending > 0 ? (
                                <MenuItem
                                  onClick={() => {
                                    //  setSelectedGrade(row as any);
                                    //  setIsEdit(true);
                                    //  dialog.onTrue();
                                  }}
                                >
                                  <Iconify
                                    icon="hugeicons:payment-02"
                                    sx={{ height: '16px', width: '16px' }}
                                  />
                                  Make Payment
                                </MenuItem>
                              ) : (
                                <MenuItem
                                  onClick={() => {
                                    receiptDialog.onTrue();
                                    pop.onClose();
                                    //  setSelectedGrade(row as any);
                                    //  setIsEdit(true);
                                    //  dialog.onTrue();
                                  }}
                                >
                                  <Iconify
                                    icon="noto:receipt"
                                    sx={{ height: '16px', width: '16px' }}
                                  />
                                  View Receipt
                                </MenuItem>
                              )}
                            </MenuList>
                          )}
                        />
                      );
                    },
                  },
                ]}
                data={feeHead.paymentDates.map((payment: PaymentDate) => ({
                  Month: payment.month,
                  'Gross Fee': feeHead.grossAmount,
                  'Payable Fee': feeHead.payableAmount ?? feeHead.paybleAmount ?? 0,
                  Paid: Number(payment.paidAmount),
                  Pending: Number(payment.pendingAmount),
                  'General Discount': feeHead.discount ?? 0,
                  'Additional Discount': 0,
                }))}
                tableId="student-fee-details"
              />
            </AccordionDetails>
          </Accordion>
        ))}

        <CustomDialog
          open={receiptDialog.value}
          title=""
          handleClose={receiptDialog.onFalse}
          maxWidth="md"
          fullWidth
        >
          <PaymentReceipt />
        </CustomDialog>
      </Box>
    </>
  );
};

export default Finance;
