import type { LabelColor } from 'src/components/label';

import React from 'react';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Label } from 'src/components/label/label';
import { Scrollbar } from 'src/components/scrollbar';
import { alpha, useTheme } from '@mui/material/styles';
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

  const feeCards = [
    {
      title: 'Total Fees',
      amount: '60,000',
      icon: 'solar:bill-list-bold-duotone',
      color: theme.palette.primary.main,
      subInfo: [
        { label: 'Paid', value: '40,000', color: theme.palette.success.main },
        { label: 'Pending', value: '20,000', color: theme.palette.warning.main },
      ],
    },
    {
      title: 'Outstanding',
      amount: '20,500',
      icon: 'solar:danger-circle-bold-duotone',
      color: theme.palette.error.main,
      subInfo: [
        { label: 'Overdue', value: '20,000', color: theme.palette.error.main },
        { label: 'Charges', value: '500', color: theme.palette.warning.main },
      ],
    },
    {
      title: 'Refund Status',
      amount: '0',
      icon: 'solar:card-recive-bold-duotone',
      color: theme.palette.info.main,
      subInfo: [{ label: 'No pending refunds', value: '', color: theme.palette.text.secondary }],
    },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 280px)' }}>
      <Scrollbar sx={{ flexGrow: 1, height: '100%' }}>
        <Box sx={{ gap: 2, minWidth: 360, display: 'flex', flexDirection: 'column' }}>
          {/* Cards Grid */}
          <Grid container spacing={1}>
            {feeCards.map((card, index) => (
              <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
                <Card
                  sx={{
                    p: 2,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: theme.customShadows?.z16 || theme.shadows[10],
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 2,
                    }}
                  >
                    <Stack spacing={1}>
                      <Typography
                        variant="subtitle2"
                        sx={{ color: 'text.secondary', fontWeight: 600 }}
                      >
                        {card.title}
                      </Typography>
                      <Typography variant="h4" sx={{ fontWeight: 600 }}>
                        ₹{card.amount}
                      </Typography>
                    </Stack>

                    <Box
                      sx={{
                        width: 56,
                        height: 56,
                        display: 'flex',
                        borderRadius: '50%',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha(card.color, 0.1),
                        color: card.color,
                      }}
                    >
                      <Iconify icon={card.icon} width={32} />
                    </Box>
                  </Box>

                  {/* Sub Information */}
                  {card.subInfo && card.subInfo.length > 0 && (
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 2,
                        pt: 2,
                        borderTop: `1px dashed ${theme.palette.divider}`,
                      }}
                    >
                      {card.subInfo.map((info: any, idx: number) => (
                        <Box key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <Box
                            sx={{
                              width: 4,
                              height: 16,
                              bgcolor: info.color,
                              borderRadius: 0.5,
                            }}
                          />
                          <Typography
                            variant="caption"
                            sx={{ color: 'text.secondary', fontWeight: 500 }}
                          >
                            {info.label}
                            {info.value && `: ₹${info.value}`}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Chart Section */}
          <Card sx={{ p: 2, borderRadius: 2 }}>
            <Box sx={{ height: 420 }}>
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
                          data: [
                            4500, 3800, 5000, 4200, 3500, 4800, 5200, 3900, 4600, 5100, 4300, 4700,
                          ],
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
            </Box>
          </Card>

          {/* Fee Breakdown Accordions */}
          <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 700, px: 1 }}>
            Fee Structure Details
          </Typography>

          {students[0].fees.map((feeHead: any) => (
            <Accordion
              key={feeHead.feeHeadId}
              defaultExpanded
              sx={{
                borderRadius: 2,
                border: `1px solid ${theme.palette.divider}`,
                '&:before': { display: 'none' },
                '&.Mui-expanded': { m: 0, mb: 2 },
                overflow: 'hidden',
                boxShadow: 'none',
                transition: 'box-shadow 0.3s',
                '&:hover': {
                  boxShadow: theme.customShadows?.z4 || theme.shadows[4],
                },
              }}
            >
              <AccordionSummary
                expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" width={20} />}
                sx={{
                  bgcolor: alpha(theme.palette.background.neutral, 0.4),
                  minHeight: 64,
                  '& .MuiAccordionSummary-content': { my: 2 },
                }}
              >
                <Stack spacing={2} width="100%">
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}
                  >
                    <Iconify
                      icon="solar:bill-check-bold-duotone"
                      width={24}
                      sx={{ color: 'primary.main' }}
                    />
                    {feeHead.feeHead}
                  </Typography>

                  <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, md: 8 }}>
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={{ xs: 1, sm: 3 }}
                        divider={
                          <Box
                            sx={{
                              borderRight: '1px solid',
                              borderColor: 'divider',
                              height: 24,
                              display: { xs: 'none', sm: 'block' },
                            }}
                          />
                        }
                      >
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Gross Fee
                          </Typography>
                          <Typography variant="subtitle2">
                            {formatNumber(feeHead.totalFees, 'INR')}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Payable
                          </Typography>
                          <Typography variant="subtitle2">
                            {formatNumber(feeHead.finalFees, 'INR')}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Discount
                          </Typography>
                          <Typography variant="subtitle2">
                            {formatNumber(feeHead.totalDiscount, 'INR')}
                          </Typography>
                        </Box>
                      </Stack>
                    </Grid>

                    <Grid size={{ xs: 12, md: 4 }}>
                      <Stack
                        direction="row"
                        spacing={3}
                        justifyContent={{ xs: 'flex-start', md: 'flex-end' }}
                      >
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Iconify
                            icon="solar:check-circle-bold"
                            width={18}
                            sx={{ color: 'success.main' }}
                          />
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Paid
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ color: 'success.main', fontWeight: 700 }}
                            >
                              {formatNumber(feeHead.totalPaidAmount, 'INR')}
                            </Typography>
                          </Box>
                        </Stack>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Iconify
                            icon="solar:clock-circle-bold"
                            width={18}
                            sx={{ color: 'warning.main' }}
                          />
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              Pending
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ color: 'warning.main', fontWeight: 700 }}
                            >
                              {formatNumber(feeHead.finalFees - feeHead.totalPaidAmount, 'INR')}
                            </Typography>
                          </Box>
                        </Stack>
                      </Stack>
                    </Grid>
                  </Grid>
                </Stack>
              </AccordionSummary>

              <AccordionDetails sx={{ p: 0 }}>
                <Box sx={{ p: 2 }}>
                  <CustomizableTable
                    columns={[
                      { id: 'Month', label: 'Month', minWidth: 120 },
                      {
                        id: 'Gross Fee',
                        label: 'Gross Fee',
                        filterType: 'number',
                        minWidth: 120,
                        render(value, row) {
                          return (
                            <Typography variant="body2">{formatNumber(value, 'INR')}</Typography>
                          );
                        },
                      },
                      {
                        id: 'Payable Fee',
                        label: 'Payable Fee',
                        filterType: 'number',
                        minWidth: 120,
                        render(value, row) {
                          return (
                            <Typography variant="body2" fontWeight="bold">
                              {formatNumber(value, 'INR')}
                            </Typography>
                          );
                        },
                      },
                      {
                        id: 'Paid',
                        label: 'Paid',
                        filterType: 'number',
                        minWidth: 120,
                        render(value, row) {
                          return (
                            <Typography variant="body2" color="success.main" fontWeight="bold">
                              {formatNumber(value, 'INR')}
                            </Typography>
                          );
                        },
                      },
                      {
                        id: 'Pending',
                        label: 'Pending',
                        filterType: 'number',
                        minWidth: 120,
                        render(value, row) {
                          return (
                            <Typography variant="body2" color="warning.main" fontWeight="bold">
                              {formatNumber(value, 'INR')}
                            </Typography>
                          );
                        },
                      },
                      {
                        id: 'General Discount',
                        label: 'Discount',
                        filterType: 'number',
                        minWidth: 120,
                        render(value, row) {
                          return (
                            <Typography variant="body2">{formatNumber(value, 'INR')}</Typography>
                          );
                        },
                      },
                      {
                        id: 'Additional Discount',
                        label: 'Additional Discount',
                        minWidth: 160,
                        filterType: 'number',
                        render(value, row) {
                          return (
                            <Typography variant="body2">{formatNumber(value, 'INR')}</Typography>
                          );
                        },
                      },
                      {
                        id: 'status',
                        label: 'Status',
                        filterType: 'enum',
                        enumOptions: PaymentStatusOptions,
                        minWidth: 120,
                        isSort: false,
                        render(value, row) {
                          const color = PaymentStatusTypeColors[
                            value as PaymentStatusType
                          ] as LabelColor;

                          return (
                            <Label variant="soft" color={color}>
                              {PaymentStatusType[value as PaymentStatusType]}
                            </Label>
                          );
                        },
                      },
                      {
                        id: 'Action',
                        label: 'Action',
                        sticky: true,
                        isFilter: false,
                        isSort: false,
                        minWidth: 80,
                        align: 'right',
                        render(value, row) {
                          return (
                            <ThreeDotsActions
                              placement="right-top"
                              actions={({ popover: pop }) => (
                                <MenuList>
                                  {row.Pending > 0 ? (
                                    <MenuItem onClick={() => {}}>
                                      <Iconify
                                        icon="solar:card-transfer-bold-duotone"
                                        sx={{ mr: 1 }}
                                      />
                                      Make Payment
                                    </MenuItem>
                                  ) : (
                                    <MenuItem
                                      onClick={() => {
                                        receiptDialog.onTrue();
                                        pop.onClose();
                                      }}
                                    >
                                      <Iconify
                                        icon="solar:document-text-bold-duotone"
                                        sx={{ mr: 1 }}
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
                      status: Number(payment.pendingAmount) > 0 ? 0 : 1, // keeping logic
                    }))}
                    tableId="student-fee-details"
                  />
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Scrollbar>

      <CustomDialog
        open={receiptDialog.value}
        title="Payment Receipt"
        handleClose={receiptDialog.onFalse}
        maxWidth="md"
        fullWidth
      >
        <PaymentReceipt />
      </CustomDialog>
    </Box>
  );
};

export default Finance;
