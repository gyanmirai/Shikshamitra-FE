import type { IColumn } from 'src/components/customizabaleTable/type';
import type { PaymentDate } from 'src/screens/student/studentProfile/finance-profile-data/finance-profile-fee-data';

import React from 'react';

import {
  Box,
  MenuList,
  MenuItem,
  Accordion,
  Typography,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import { formatNumber } from 'src/utils/formate_number';

import { Iconify } from 'src/components/iconify/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { StudentForFeeStructure } from '../data/student-fee-structure-interface';

interface FeeDetailsComponentProps {
  students: StudentForFeeStructure;
}

const FeeDetailsComponent: React.FC<FeeDetailsComponentProps> = ({ students }) => {
  const renderFeeInfo = (label: string, amount: number, color?: string) => (
    <Typography variant="body2" sx={{ color, fontWeight: color ? 'bold' : 'normal' }}>
      <strong>{label}:</strong> {formatNumber(amount, 'INR')}
    </Typography>
  );

  const tableColumns = [
    { id: 'Month', label: 'Due Date', filterType: 'date' },
    {
      id: 'Gross Fee',
      label: 'Gross Fee',
      filterType: 'number',
      render: (value: number) => (
        <Typography fontSize={14}>{formatNumber(value, 'INR')}</Typography>
      ),
    },
    {
      id: 'Payable Fee',
      label: 'Payable Fee',
      filterType: 'number',
      render: (value: number) => (
        <Typography fontSize={14}>{formatNumber(value, 'INR')}</Typography>
      ),
    },
    {
      id: 'Paid',
      label: 'Paid',
      filterType: 'number',
      render: (value: number) => (
        <Typography fontSize={14} color="#138e58">
          {formatNumber(value, 'INR')}
        </Typography>
      ),
    },
    {
      id: 'Pending',
      label: 'Pending',
      filterType: 'number',
      render: (value: number) => (
        <Typography fontSize={14} color="#b76e00">
          {formatNumber(value, 'INR')}
        </Typography>
      ),
    },
    {
      id: 'General Discount',
      label: 'General Discount',
      filterType: 'number',
      render: (value: number) => (
        <Typography fontSize={14}>{formatNumber(value, 'INR')}</Typography>
      ),
    },
    {
      id: 'Additional Discount',
      label: 'Additional Discount',
      filterType: 'number',
      render: (value: number) => (
        <Typography fontSize={14}>{formatNumber(value, 'INR')}</Typography>
      ),
    },
    {
      id: 'Action',
      label: 'Action',
      isSort: false,
      isFilter: false,
      sticky: true,
      align: 'right',
      render: (_: unknown, row: { Pending: number }) => (
        <ThreeDotsActions
          placement="right-top"
          actions={({ popover }) => (
            <MenuList>
              <MenuItem>
                <Iconify
                  icon={row.Pending > 0 ? 'hugeicons:payment-02' : 'noto:receipt'}
                  sx={{ height: '16px', width: '16px' }}
                />
                {row.Pending > 0 ? 'Make Payment' : 'View Receipt'}
              </MenuItem>
            </MenuList>
          )}
        />
      ),
    },
  ];

  const getTableData = (
    feeHead: {
      grossAmount: number;
      payableAmount?: number;
      paybleAmount?: number;
      discount?: number;
    },
    paymentDates: PaymentDate[]
  ) =>
    paymentDates.map((payment) => ({
      Month: payment.date,
      'Gross Fee': feeHead.grossAmount,
      'Payable Fee': feeHead.payableAmount ?? feeHead.paybleAmount ?? 0,
      Paid: Number(payment.paidAmount),
      Pending: Number(payment.pendingAmount),
      'General Discount': feeHead.discount ?? 0,
      'Additional Discount': 0,
    }));
  return (
    <Box>
      {students.fees.map((feeHead) => (
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
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                gap="10px"
                width="100%"
              >
                <Box display="flex" flexWrap="wrap" gap="10px">
                  {renderFeeInfo('Gross Fee', feeHead.totalFees)}
                  {renderFeeInfo('Payable Fee', feeHead.finalFees)}
                  {renderFeeInfo('General Discount', feeHead.totalDiscount)}
                  {renderFeeInfo('Additional Discount', 0)}
                </Box>
                <Box display="flex" gap="20px" alignItems="center">
                  {renderFeeInfo('Paid', feeHead.totalPaidAmount, '#138e58')}
                  {renderFeeInfo('Pending', feeHead.finalFees - feeHead.totalPaidAmount, '#b76e00')}
                </Box>
              </Box>
            </Box>
          </AccordionSummary>

          <AccordionDetails>
            <CustomizableTable
              columns={tableColumns as IColumn[]}
              data={getTableData(feeHead, feeHead.paymentDates as PaymentDate[])}
              tableId="student-fee-details"
            />
          </AccordionDetails>
        </Accordion>
      ))}
    </Box>
  );
};

export default FeeDetailsComponent;
