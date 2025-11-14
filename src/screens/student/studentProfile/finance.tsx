import type { LabelColor } from 'src/components/label';

import React from 'react';
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

  const feeCards = [
    {
      title: 'Total Fees',
      amount: '60,000',
      icon: 'solar:bill-list-bold-duotone',
      color: theme.palette.primary.main,
    },
    {
      title: 'Paid Fees',
      amount: '40,000',
      icon: 'solar:check-circle-bold-duotone',
      color: theme.palette.success.main,
    },
    {
      title: 'Pending Fees',
      amount: '20,000',
      icon: 'solar:clock-circle-bold-duotone',
      color: theme.palette.warning.main,
    },
    {
      title: 'Overdue Fees',
      amount: '20,000',
      icon: 'solar:danger-circle-bold-duotone',
      color: theme.palette.error.main,
    },
    {
      title: 'Pending Refund',
      amount: '0',
      icon: 'solar:card-recive-bold-duotone',
      color: theme.palette.info.main,
    },
    {
      title: 'Pending Charges',
      amount: '500',
      icon: 'solar:ticket-sale-bold-duotone',
      color: theme.palette.warning.main,
    },
  ];

  return (
    <>
      <Grid container spacing={2.5} sx={{ mt: 1 }}>
        {feeCards.map((card, index) => (
          <Grid key={index} size={{ xs: 12, sm: 6, md: 4 }}>
            <Card sx={{ p: 3, boxShadow: 'var(--shadows-4)', height: '100%' }}>
              <Stack spacing={2}>
                <Typography variant="subtitle1" color="text.secondary">
                  {card.title}
                </Typography>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="h3" sx={{ fontWeight: 700 }}>
                    ₹{card.amount}
                  </Typography>
                  <Iconify icon={card.icon} width={48} sx={{ color: card.color }} />
                </Stack>
              </Stack>
            </Card>
          </Grid>
        ))}
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
