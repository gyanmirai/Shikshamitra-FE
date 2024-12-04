import React, { useState } from 'react';

import {
  Box, Card, Stack, Divider, Accordion,
  Typography,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import { formatNumber } from 'src/utils/formate_number';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

import type { StudentTabsComponentType } from '.';

const students = [
  {
    studentId: 123,
    name: 'Vishal Rameshbhai Patel',
    grade: 10,
    paymentTerm: 'Monthly',
    paymentTermNumber: 12,
    totalPending: 26000,
    totalPaid: 52000,
    totalGeneralDiscount: 3000,
    totalAdditionalDiscount: 0,

    discountAmount: 0,
    fixedReduction: 0,
    overAllDueDate: '20-04-2025',
    totalFees: 81000,
    finalFees: 78000,
    totalDueAfterDiscount: 0,
    fees: [
      {
        feeHeadId: 198,
        feeHead: 'Tuition',
        totalFees: 63000,
        finalFees: 60000,
        grossAmount: 5250,
        payableAmount: 5000,
        totalPaidAmount: 40000,
        discount: 3000 / 12,
        totalDiscount: 3000,
        paymentDates: [
          {
            month: 'May-2025',
            date: '15-03-2024',
            status: 'Unpaid',
            paidAmount: '0',
            pendingAmount: '5000',
          },
          {
            month: 'April-2025',
            date: '15-03-2024',
            status: 'Unpaid',
            paidAmount: '0',
            pendingAmount: '5000',
          },
          {
            month: 'March-2025',
            date: '15-03-2024',
            status: 'Unpaid',
            paidAmount: '0',
            pendingAmount: '5000',
          },
          {
            month: 'Feb-2025',
            date: '15-03-2024',
            status: 'Unpaid',
            paidAmount: '0',
            pendingAmount: '5000',
          },
          {
            month: 'Jan-2025',
            date: '15-03-2024',
            status: 'Paid',
            paidAmount: '5000',
            pendingAmount: '0',
          },
          {
            month: 'Dec-2024',
            date: '15-03-2024',
            status: 'Paid',
            paidAmount: '5000',
            pendingAmount: '0',
          },
          {
            month: 'Nov-2024',
            date: '15-03-2024',
            status: 'Paid',
            paidAmount: '5000',
            pendingAmount: '0',
          },
          {
            month: 'Oct-2024',
            date: '15-03-2024',
            status: 'Paid',
            paidAmount: '5000',
            pendingAmount: '0',
          },
          {
            month: 'Sep-2024',
            date: '15-03-2024',
            status: 'Paid',
            paidAmount: '5000',
            pendingAmount: '0',
          },
          {
            month: 'Aug-2024',
            date: '15-03-2024',
            status: 'Paid',
            paidAmount: '5000',
            pendingAmount: '0',
          },
          {
            month: 'July-2024',
            date: '15-02-2024',
            status: 'Paid',
            paidAmount: '5000',
            pendingAmount: '0',
          },
          {
            month: 'June-2024',
            date: '15-01-2024',
            status: 'Paid',
            paidAmount: '5000',
            pendingAmount: '0',
          },
        ],
      },
      {
        feeHeadId: 230,
        feeHead: 'Library',
        totalFees: 18000,
        finalFees: 18000,
        grossAmount: 1500,
        paybleAmount: 1500,
        totalPaidAmount: 12000,
        discount: 0,
        totalDiscount: 0,
        paymentDates: [
          {
            month: 'May-2025',
            date: '15-03-2024',
            status: 'Unpaid',
            paidAmount: '0',
            pendingAmount: '1500',
          },
          {
            month: 'April-2025',
            date: '15-03-2024',
            status: 'Unpaid',
            paidAmount: '0',
            pendingAmount: '1500',
          },
          {
            month: 'March-2025',
            date: '15-03-2024',
            status: 'Unpaid',
            paidAmount: '0',
            pendingAmount: '1500',
          },
          {
            month: 'Feb-2025',
            date: '15-03-2024',
            status: 'Unpaid',
            paidAmount: '0',
            pendingAmount: '1500',
          },
          {
            month: 'Jan-2025',
            date: '15-03-2024',
            status: 'Paid',
            paidAmount: '1500',
            pendingAmount: '0',
          },
          {
            month: 'Dec-2024',
            date: '15-03-2024',
            status: 'Paid',
            paidAmount: '1500',
            pendingAmount: '0',
          },
          {
            month: 'Nov-2024',
            date: '15-03-2024',
            status: 'Paid',
            paidAmount: '1500',
            pendingAmount: '0',
          },
          {
            month: 'Oct-2024',
            date: '15-03-2024',
            status: 'Paid',
            paidAmount: '1500',
            pendingAmount: '0',
          },
          {
            month: 'Sep-2024',
            date: '15-03-2024',
            status: 'Paid',
            paidAmount: '1500',
            pendingAmount: '0',
          },
          {
            month: 'Aug-2024',
            date: '15-03-2024',
            status: 'Paid',
            paidAmount: '1500',
            pendingAmount: '0',
          },
          {
            month: 'July-2024',
            date: '15-02-2024',
            status: 'Paid',
            paidAmount: '1500',
            pendingAmount: '0',
          },
          {
            month: 'June-2024',
            date: '15-01-2024',
            status: 'Paid',
            paidAmount: '1500',
            pendingAmount: '0',
          },
        ],
      },
    ],
  },

];


const Finance = (props: StudentTabsComponentType) => {

  const [selectedStudent, setSelectedStudent] = useState<any>(students[0]);
  const headerCellStyle = {
    border: '1px solid #ccc',
    padding: '10px',
    position: 'sticky',
    top: 0,
    background: '#f4f6f8',
    zIndex: 1,
  };

  const cellStyle: React.CSSProperties = {
    border: '1px solid #ccc',
    padding: '10px',
    fontSize: '12px',
    textAlign: 'right',
  };
  return (
    <Box>
      <Stack direction="row" spacing={2} alignItems="center">
        <Card
          elevation={3}
          sx={{
            py: 2,
            textAlign: 'center',
            typography: 'h4',
            maxWidth: '250px',
            width: '100%',
          }}
        >
          <Stack
            direction="row"
            divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
          >
            <Stack width={1}>
              <Box fontSize="14px">
                Total Fees &nbsp;
                <Label variant="soft" color="success" fontSize="12px" display="inline-block">
                  ₹ 60,000
                </Label>
              </Box>
            </Stack>
          </Stack>
        </Card>

        <Card
          elevation={3}
          sx={{
            py: 2,
            textAlign: 'center',
            typography: 'h4',
            maxWidth: '250px',
            width: '100%',
          }}
        >
          <Stack
            direction="row"
            divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
          >
            <Stack width={1}>
              <Box fontSize="14px">
                Paid Fees &nbsp;
                <Label variant="soft" color="success" fontSize="12px" display="inline-block">
                  ₹ 40,000
                </Label>
              </Box>
            </Stack>
          </Stack>
        </Card>
        <Card
          elevation={3}
          sx={{
            py: 2,
            textAlign: 'center',
            typography: 'h4',
            maxWidth: '250px',
            width: '100%',
          }}
        >
          <Stack
            direction="row"
            divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
          >
            <Stack width={1}>
              <Box fontSize="14px">
                Pending Fees &nbsp;
                <Label variant="soft" color="warning" fontSize="12px" display="inline-block">
                  ₹ 20,000
                </Label>
              </Box>
            </Stack>
          </Stack>
        </Card>
        <Card
          elevation={3}
          sx={{
            py: 2,
            textAlign: 'center',
            typography: 'h4',
            maxWidth: '250px',
            width: '100%',
          }}
        >
          <Stack
            direction="row"
            divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
          >
            <Stack width={1}>
              <Box fontSize="14px">
                Overdue Fees &nbsp;
                <Label variant="soft" color="error" fontSize="12px" display="inline-block">
                  ₹ 20,000
                </Label>
              </Box>
            </Stack>
          </Stack>
        </Card>
        <Card
          elevation={3}
          sx={{
            py: 2,
            textAlign: 'center',
            typography: 'h4',
            maxWidth: '250px',
            width: '100%',
          }}
        >
          <Stack
            direction="row"
            divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
          >
            <Stack width={1}>
              <Box fontSize="14px">
                Pending Refund &nbsp;
                <Label variant="soft" color="error" fontSize="12px" display="inline-block">
                  ₹ 0
                </Label>
              </Box>
            </Stack>
          </Stack>
        </Card>
        <Card
          elevation={3}
          sx={{
            py: 2,
            textAlign: 'center',
            typography: 'h4',
            maxWidth: '250px',
            width: '100%',
          }}
        >
          <Stack
            direction="row"
            divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
          >
            <Stack width={1}>
              <Box fontSize="14px">
                Pending Charges &nbsp;
                <Label variant="soft" color="error" fontSize="12px" display="inline-block">
                  ₹ 500
                </Label>
              </Box>
            </Stack>
          </Stack>
        </Card>
      </Stack>

      <Divider sx={{ mt: 2 }} />


      {selectedStudent.fees.map((feeHead: any) => (
        <Accordion key={feeHead.feeHeadId}>
          <AccordionSummary
            expandIcon={<Iconify icon="iconamoon:arrow-up-2-thin" />}
            aria-controls={`panel-${feeHead.feeHeadId}-content`}
            id={`panel-${feeHead.feeHeadId}-header`}
          >
            <Box display="flex" flexDirection="column" gap={3} width="100%">
              <Typography
                variant="subtitle1"
                component="div"
                sx={{ fontWeight: 'bold', marginBottom: 1 }}
              >
                {feeHead.feeHead}
              </Typography>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center', // Center aligns Paid & Pending vertically with others
                  gap: '10px',
                  fontSize: '14px',
                  width: '100%', // Ensures full width for proper spacing
                }}
              >
                <Box display="flex" flexWrap="wrap" gap="10px">
                  <Typography variant="body2" component="span">
                    <strong>Gross Fee:</strong> {formatNumber(feeHead.totalFees, 'INR')}
                  </Typography>
                  <Typography variant="body2" component="span">
                    <strong>Payable Fee:</strong> {formatNumber(feeHead.finalFees, 'INR')}
                  </Typography>
                  <Typography variant="body2" component="span">
                    <strong>General Discount:</strong>{' '}
                    {formatNumber(feeHead.totalDiscount, 'INR')}
                  </Typography>
                  <Typography variant="body2" component="span">
                    <strong>Additional Discount:</strong> {formatNumber(0, 'INR')}
                  </Typography>
                </Box>
                <Box display="flex" gap="20px" alignItems="center">
                  <Typography
                    variant="body2"
                    component="span"
                    sx={{ color: '#138e58', fontWeight: 'bold' }}
                  >
                    <strong>Paid:</strong> {formatNumber(feeHead.totalPaidAmount, 'INR')}
                  </Typography>
                  <Typography
                    variant="body2"
                    component="span"
                    sx={{ color: '#b76e00', fontWeight: 'bold' }}
                  >
                    <strong>Pending:</strong>{' '}
                    {formatNumber(feeHead.finalFees - feeHead.totalPaidAmount, 'INR')}
                  </Typography>
                </Box>
              </div>
            </Box>
          </AccordionSummary>

          <AccordionDetails>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th
                    style={{
                      border: '1px solid #ccc',
                      padding: '10px',
                      position: 'sticky',
                      top: 0,
                      background: '#f4f6f8',
                      zIndex: 1,
                      fontSize: '12px',
                    }}
                  >
                    Month
                  </th>
                  <th
                    style={{
                      border: '1px solid #ccc',
                      padding: '10px',
                      position: 'sticky',
                      top: 0,
                      background: '#f4f6f8',
                      zIndex: 1,
                      fontSize: '12px',
                    }}
                  >
                    Gross Fee
                  </th>
                  <th
                    style={{
                      border: '1px solid #ccc',
                      padding: '10px',
                      position: 'sticky',
                      top: 0,
                      background: '#f4f6f8',
                      zIndex: 1,
                      fontSize: '12px',
                    }}
                  >
                    Payable Fee
                  </th>
                  <th
                    style={{
                      border: '1px solid #ccc',
                      padding: '10px',
                      position: 'sticky',
                      top: 0,
                      background: '#f4f6f8',
                      zIndex: 1,
                      fontSize: '12px',
                    }}
                  >
                    Paid
                  </th>
                  <th
                    style={{
                      border: '1px solid #ccc',
                      padding: '10px',
                      position: 'sticky',
                      top: 0,
                      background: '#f4f6f8',
                      zIndex: 1,
                      fontSize: '12px',
                    }}
                  >
                    Pending
                  </th>
                  <th
                    style={{
                      border: '1px solid #ccc',
                      padding: '10px',
                      position: 'sticky',
                      top: 0,
                      background: '#f4f6f8',
                      zIndex: 1,
                      fontSize: '12px',
                    }}
                  >
                    General Discount
                  </th>
                  <th
                    style={{
                      border: '1px solid #ccc',
                      padding: '10px',
                      position: 'sticky',
                      top: 0,
                      background: '#f4f6f8',
                      zIndex: 1,
                      fontSize: '12px',
                    }}
                  >
                    Additional Discount
                  </th>
                  {/* <th style={{
                            border: "1px solid #ccc",
                            padding: "10px",
                            position: "sticky",
                            top: 0,
                            background: "#f4f6f8",
                            zIndex: 1,

                          }}>Status</th> */}
                </tr>
              </thead>
              <tbody>
                {feeHead.paymentDates.map((payment: any, index: any) => (
                  <tr key={index}>
                    <td
                      style={{
                        border: '1px solid #ccc',
                        padding: '10px',
                        fontSize: '12px',
                        textAlign: 'center',
                      }}
                    >
                      {payment.month}
                    </td>
                    <td style={cellStyle}>{formatNumber(feeHead.grossAmount, 'INR')}</td>
                    <td style={cellStyle}>{formatNumber(feeHead.payableAmount, 'INR')}</td>
                    <td
                      style={{
                        ...cellStyle,
                        color: payment.paidAmount > 0 ? '#138e58' : 'black',
                      }}
                    >
                      {formatNumber(payment.paidAmount, 'INR')}
                    </td>
                    <td
                      style={{
                        ...cellStyle,
                        color: payment.pendingAmount > 0 ? '#b76e00' : 'black',
                      }}
                    >
                      {formatNumber(payment.pendingAmount, 'INR')}
                    </td>
                    <td
                      style={{
                        ...cellStyle,
                        color: feeHead.discount > 0 ? '#856404' : '#000',
                      }}
                    >
                      {formatNumber(feeHead.discount, 'INR')}
                    </td>
                    <td
                      style={{
                        ...cellStyle,
                        color: feeHead.discount > 0 ? '#856404' : '#000',
                      }}
                    >
                      {formatNumber(0, 'INR')}
                    </td>
                    {/* <td style={cellStyle}>
                              <Label
                                variant="soft"
                                color={
                                  payment.status === 'Overdue'
                                    ? 'error'
                                    : payment.status === 'Unpaid'
                                      ? 'warning'
                                      : payment.status === 'Paid'
                                        ? 'success'
                                        : 'default'
                                }
                              >
                                {payment.status}
                              </Label>
                            </td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </AccordionDetails>
        </Accordion>
      ))}
      <Box />

      {/* <FinanceStudentDetailedFeeComponent studentId="12" /> */}
    </Box>

  );
};

export default Finance;
