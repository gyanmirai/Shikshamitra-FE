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

import type { StudentForFeeStructure } from '../data/student-fee-structure-data';

interface FeeDetailsComponentProps {
  students: StudentForFeeStructure;
}

const FeeDetailsComponent: React.FC<FeeDetailsComponentProps> = ({ students }) => (
  <Box>
    {students.fees.map((feeHead: any) => (
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
                  <strong>General Discount:</strong> {formatNumber(feeHead.totalDiscount, 'INR')}
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
                render(value, row) {
                  return <Typography fontSize={14}>{formatNumber(value, 'INR')}</Typography>;
                },
              },
              {
                id: 'Payable Fee',
                label: 'Payable Fee',
                render(value, row) {
                  return <Typography fontSize={14}>{formatNumber(value, 'INR')}</Typography>;
                },
              },

              {
                id: 'Paid',
                label: 'Paid',
                render(value, row) {
                  return (
                    <Typography fontSize={14} color="#138e58">
                      {formatNumber(value, 'INR')}
                    </Typography>
                  );
                },
              },
              {
                id: 'Pending',
                label: 'Pending',
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
                render(value, row) {
                  return <Typography fontSize={14}>{formatNumber(value, 'INR')}</Typography>;
                },
              },
              {
                id: 'Additional Discount',
                label: 'Additional Discount',
                render(value, row) {
                  return <Typography fontSize={14}>{formatNumber(value, 'INR')}</Typography>;
                },
              },
              {
                id: 'Action',
                label: 'Action',
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
                                //  setSelectedGrade(row as any);
                                //  setIsEdit(true);
                                //  dialog.onTrue();
                              }}
                            >
                              <Iconify icon="noto:receipt" sx={{ height: '16px', width: '16px' }} />
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
  </Box>
);

export default FeeDetailsComponent;
