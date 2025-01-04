// // import FinanceStudentFeeManagementComponent from './component/finance-student-fee-management-component';
// import React, { useState } from "react";

// import {
//   Table, Paper, Button, Dialog, TableRow, TableBody,
//   TableCell, TableHead, Typography, DialogTitle, DialogContent, TableContainer
// } from "@mui/material";

// // Dummy data for fee management
// const studentFees = [
//   {
//     feeHead: "Tuition",
//     paymentTerm: "Monthly",
//     nextDueDate: "2024-11-15",
//     status: "Paid",
//     paymentHistory: [
//       { date: "2024-10-15", amount: 5000, receipt: "Receipt #1001" },
//       { date: "2024-09-15", amount: 5000, receipt: "Receipt #1000" },
//     ],
//   },
//   {
//     feeHead: "Library",
//     paymentTerm: "Bi-Annually",
//     nextDueDate: "2025-01-01",
//     status: "Unpaid",
//     paymentHistory: [
//       { date: "2024-07-01", amount: 1500, receipt: "Receipt #1002" },
//     ],
//   },
//   {
//     feeHead: "Sports",
//     paymentTerm: "Annually",
//     nextDueDate: "2025-07-01",
//     status: "Overdue",
//     paymentHistory: [
//       { date: "2024-07-01", amount: 3000, receipt: "Receipt #1003" },
//     ],
//   },
// ];
// const FinanceStudentStructureOverviewTabScreen = () => {

//     // {/* <FinanceStudentFeeManagementComponent /> */}
//     // {/* <FinanceStudentTransectionOverviewComponent /> */}

//   const [open, setOpen] = useState(false);
//   const [selectedFee, setSelectedFee] = useState<any>(null);

//   const handleOpen = (fee:any) => {
//     setSelectedFee(fee);
//     setOpen(true);
//   };

//   const handleClose = () => {
//     setOpen(false);
//     setSelectedFee(null);
//   };

//   return (
//     <div>
//       <h2>Student Fee Management</h2>
//       <TableContainer component={Paper}>
//         <Table>
//           <TableHead>
//             <TableRow>
//               <TableCell>Fee Head</TableCell>
//               <TableCell>Payment Term</TableCell>
//               <TableCell>Next Due Date</TableCell>
//               <TableCell>Status</TableCell>
//               <TableCell>Actions</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {studentFees.map((fee, index) => (
//               <TableRow key={index}>
//                 <TableCell>{fee.feeHead}</TableCell>
//                 <TableCell>{fee.paymentTerm}</TableCell>
//                 <TableCell>{fee.nextDueDate}</TableCell>
//                 <TableCell>{fee.status}</TableCell>
//                 <TableCell>
//                   <Button variant="contained" onClick={() => handleOpen(fee)}>
//                     View Details
//                   </Button>
//                 </TableCell>
//               </TableRow>
//             ))}
//           </TableBody>
//         </Table>
//       </TableContainer>

//       {/* Details Modal */}
//       {selectedFee && (
//         <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
//           <DialogTitle>{`Details for ${selectedFee.feeHead}`}</DialogTitle>
//           <DialogContent>
//             <Typography variant="h6">Payment Term: {selectedFee.paymentTerm}</Typography>
//             <Typography variant="h6">Next Due Date: {selectedFee.nextDueDate}</Typography>
//             <Typography variant="h6">Status: {selectedFee.status}</Typography>
//             <br />
//             <Typography variant="subtitle1">Payment History:</Typography>
//             {selectedFee.paymentHistory.map((payment:any, index:any) => (
//               <div key={index} style={{ marginBottom: "10px" }}>
//                 <Typography>
//                   <strong>Date:</strong> {payment.date}
//                 </Typography>
//                 <Typography>
//                   <strong>Amount:</strong> ${payment.amount}
//                 </Typography>
//                 <Typography>
//                   <strong>Receipt:</strong> {payment.receipt}
//                 </Typography>
//               </div>
//             ))}
//             <br />
//             <Button
//               variant="contained"
//               color="secondary"
//               onClick={() => alert("Reminder sent")}
//               style={{ marginRight: "10px" }}
//             >
//               Send Reminder
//             </Button>
//             <Button
//               variant="contained"
//               color="primary"
//               onClick={() => alert("Receipt generated")}
//             >
//               Generate Receipt
//             </Button>
//           </DialogContent>
//         </Dialog>
//       )}
//     </div>
//   );
// }

// export default FinanceStudentStructureOverviewTabScreen;
import React, { useState } from 'react';

import { Box, Accordion, Typography, AccordionSummary, AccordionDetails } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { formatNumber } from 'src/utils/formate_number';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import FinanceEditFeeStructureForStudent from './component/finance-edit-fee-structure-for-student';

const students = [
  {
    grNo: 1,
    rollNo: 34,
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
  // {
  //   studentId: 1235,
  //   name: 'John Wick',
  //   grade: 10,
  //   paymentTerm: 'Yearly',
  //   totalPending: 38000,
  //   totalPaid: 40000,
  //   discountAmount: 0,
  //   fixedReduction: 0,
  //   overAllDueDate: '20-04-2025',
  //   totalFees: 81000,
  //   finalFees: 78000,
  //   totalDueAfterDiscount: 0,
  //   fees: [
  //     {
  //       feeHeadId: 198,
  //       feeHead: 'Tuition',
  //       totalFees: 60000,
  //       amount: 60000,
  //       paymentDates: [{ month: 'April-2024', date: '15-04-2024', status: 'Paid', paidAmount: "60000", pendingAmount: "0" },],
  //     },
  //     {
  //       feeHeadId: 230,
  //       feeHead: 'Library',
  //       totalFees: 18000,
  //       amount: 18000,
  //       paymentDates: [{ month: 'April-2024', date: '15-04-2024', status: 'Paid', paidAmount: "18000", pendingAmount: "0" },],
  //     },
  //   ],
  // },
  // {
  //   studentId: 12357,
  //   name: 'Jack Sparrow',
  //   grade: 10,
  //   paymentTerm: 'Quartly',
  //   totalPending: 38000,
  //   totalPaid: 40000,
  //   discountAmount: 0,
  //   fixedReduction: 0,
  //   overAllDueDate: '20-04-2025',
  //   totalFees: 78000,
  //   totalDueAfterDiscount: 0,
  //   fees: [
  //     {
  //       feeHeadId: 198,
  //       feeHead: 'Tuition',
  //       totalFees: 60000,
  //       amount: 15000,
  //       paymentDates: [
  //         { month: 'March-2025', date: '15-01-2024', status: 'Unpaid' },
  //         { month: 'Feb-2024', date: '15-01-2024', status: 'Paid' },
  //         { month: 'Oct-2024', date: '15-01-2024', status: 'Paid' },
  //         { month: 'June-2024', date: '15-01-2024', status: 'Paid' },
  //       ],
  //     },
  //     {
  //       feeHeadId: 230,
  //       feeHead: 'Library',
  //       totalFees: 18000,
  //       amount: 4500,
  //       paymentDates: [
  //         { month: 'March-2025', date: '15-01-2024', status: 'Unpaid' },
  //         { month: 'Feb-2024', date: '15-01-2024', status: 'Paid' },
  //         { month: 'Oct-2024', date: '15-01-2024', status: 'Paid' },
  //         { month: 'June-2024', date: '15-01-2024', status: 'Paid' },
  //       ],
  //     },
  //   ],
  // },
];

const FinanceStudentFeeManagement = () => {
  const dialog = useBoolean();
  const [open, setOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [studentsData, setStudentsData] = useState<any>(null);

  const handleOpen = (student: any) => {
    setSelectedStudent(student);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedStudent(null);
  };

  const FeeStructureClose = () => {
    dialog.onFalse();
    setSelectedStudent(null);
  };

  const feeStructureSaveHandler = (data: any) => {
    console.log('data for edit fee structure', data);
  };

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
    <>
      {/* <CustomBreadcrumbs
        heading="Student Fee Management"
        links={[{ name: 'Finance' }, { name: 'Fee Management' }]}
        sx={{ px: 1, mb: 2 }}
        
      /> */}
      <CustomizableTable
        columns={[
          {
            id: 'grNo',
            label: 'Gr No',
            render(value, row) {
              return (
                <Typography minWidth="120px" fontSize="12px">
                  {value}
                </Typography>
              );
            },
          },
          {
            id: 'rollNo',
            label: 'Roll No',
            render(value, row) {
              return (
                <Typography minWidth="120px" fontSize="12px">
                  {value}
                </Typography>
              );
            },
          },
          {
            id: 'division',
            label: 'Division',
            render(value, row) {
              return (
                <Typography minWidth="120px" fontSize="12px">
                  A
                </Typography>
              );
            },
          },
          {
            id: 'name',
            label: 'Student Name',
            render(value, row) {
              return (
                <Typography minWidth="120px" fontSize="12px">
                  {row.name}
                </Typography>
              );
            },
          },
          { id: 'grade', label: 'Class' },
          {
            id: 'totalFees',
            label: 'Gross Fees',
            render(value, row) {
              return (
                <Typography minWidth="100px" fontSize="12px">
                  {formatNumber(row.totalFees, 'INR')}
                </Typography>
              );
            },
          },
          {
            id: 'finalFees',
            label: 'Payable Fees',
            render(value, row) {
              return (
                <Typography minWidth="120px" fontSize="12px">
                  {formatNumber(row.finalFees, 'INR')}
                </Typography>
              );
            },
          },
          {
            id: 'totalGeneralDiscount',
            label: 'Total General Discount',

            render(value, row) {
              return (
                <Typography minWidth="180px" fontSize="12px">
                  {formatNumber(row.totalGeneralDiscount, 'INR')}
                </Typography>
              );
            },
          },
          {
            id: 'totalAdditionalDiscount',
            label: 'Total Additional Discount',

            render(value, row) {
              return (
                <Typography minWidth="180px" fontSize="12px">
                  {formatNumber(row.totalAdditionalDiscount, 'INR')}
                </Typography>
              );
            },
          },
          {
            id: 'totalPaid',
            label: 'Total Paid',

            render(value, row) {
              return (
                <Typography minWidth="100px" fontSize="12px" color="green">
                  {formatNumber(row.totalPaid, 'INR')}
                </Typography>
              );
            },
          },
          {
            id: 'totalPending',
            label: 'Total Pending',

            render(value, row) {
              return (
                <Typography minWidth="120px" fontSize="12px" color="red">
                  {formatNumber(row.totalPending, 'INR')}
                </Typography>
              );
            },
          },

          {
            id: 'action',
            label: 'Action',

            render(value: any, row: any) {
              return (
                <ThreeDotsActions
                  placement="right-top"
                  showThreeDots={false}
                  showViewIcon
                  handleViewClick={() => {
                    handleOpen(row);
                  }}
                  // actions={({ popover }: any) => (
                  //   <MenuList>
                  //     <MenuItem
                  //       onClick={() => {
                  //         handleOpen(row);
                  //       }}
                  //     >
                  //       <Iconify icon="mdi:eye" />
                  //       View Details
                  //     </MenuItem>

                  //     {/* <MenuItem
                  //       onClick={() => {
                  //         setSelectedStudent(row);
                  //         dialog.onTrue();
                  //         popover.onClose();
                  //       }}
                  //     >
                  //       <Iconify icon="solar:pen-bold" />
                  //       Edit
                  //     </MenuItem> */}
                  //   </MenuList>
                  // )}
                />
              );
            },
          },
        ]}
        data={students}
      />

      {/* Details Modal */}
      {selectedStudent && (
        <CustomDialog
          title={`Fee Details for ${selectedStudent.name} / Standard: ${selectedStudent.grade}th -A `}
          open={open}
          handleClose={handleClose}
          maxWidth="xl"
        >
          <Scrollbar sx={{ overflow: 'auto', maxHeight: '550px' }}>
            <div>
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
            </div>
          </Scrollbar>
        </CustomDialog>
      )}
      {dialog.value && selectedStudent && (
        <FinanceEditFeeStructureForStudent
          onSave={feeStructureSaveHandler}
          dialogValue={dialog.value}
          onClose={() => dialog.onFalse()}
          data={selectedStudent}
        />
      )}
    </>
  );
};

export default FinanceStudentFeeManagement;
// eslint-disable-next-line no-lone-blocks
{
  /* selectedStudent.fees.map((feeHead: any) => (
  
  // <Card key={feeHead.feeHeadId} style={{ marginBottom: "20px" }}>
                //   <h3>{feeHead.feeHead}</h3>
                //   <div>Total Fees: {feeHead.totalFees}</div>
                //   <div>Total Paid: {feeHead.totalPaidAmount}</div>
                //   <div>Total Pending: {feeHead.totalFees - feeHead.totalPaidAmount}</div>
                //   <div>Discount per Month: {feeHead.discount.toFixed(2)}</div>

                //   {/* Nested Payment Term Details */
}
//   <div style={{ marginTop: "15px", borderTop: "1px solid #ccc", paddingTop: "10px" }}>
//     <h4>Payment Details (Monthly):</h4>
//     {
//       feeHead.paymentDates.map((payment: any, index: any) => (
//         <Card key={index} style={{ marginBottom: "10px", padding: "10px", background: "#f9f9f9" }}>
//           <div><strong>Month:</strong> {payment.month}</div>
//           <div><strong>Due Date:</strong> {payment.date}</div>
//           <div><strong>Status:</strong> {payment.status}</div>
//           <div><strong>Paid Amount:</strong> {payment.paidAmount}</div>
//           <div><strong>Pending Amount:</strong> {payment.pendingAmount}</div>
//         </Card>
//       ))
//     }
//   </div>
// </Card>
// ))}} */}

// eslint-disable-next-line no-lone-blocks
{
  /* <CustomizableTable
              isPagination={false}
              isFilter={false}
              isSearch={false}
              isShowedDense={false}

              columns={[
                { id: 'paymentTerm', label: 'Payment Term' },
                ...selectedStudent.fees.map((fee: any) => ({
                  id: fee.feeHead.toLowerCase(),
                  label: fee.feeHead,
                  render: (value: any) => (
                    <Typography

                      style={{
                        color: value.status === 'Paid' ? 'green' : 'red',
                        fontSize: "12px"

                      }}
                    >
                      {formatNumber(value.amount, "INR")}
                    </Typography>
                  ),
                })),
              
                {
                  id: 'action',
                  label: 'Action',
                  render: (value, row) => {




                    const unpaidFees = selectedStudent.fees
                      .filter((fee: any) =>
                        fee.paymentDates.some(
                          (payment: any) => payment.month === row.paymentTerm && payment.status === "Unpaid"
                        )
                      );

                    const actionLabel = unpaidFees.length > 0 ? "Send Reminder" : "Print Receipt";

                    const handleAction = () => {
                      if (unpaidFees.length > 0) {
                        const message = unpaidFees
                          .map((fee: any) => `${actionLabel} for ${fee.feeHead} - ${row.paymentTerm}`)
                          .join("\n");
                        alert(message);
                      } else {
                        alert(`${actionLabel} for ${selectedStudent.fees[0].feeHead} - ${row.paymentTerm}`);
                      }
                    };

                    return (

                      <Tooltip title={actionLabel === "Send Reminder" ? "Send Reminder" : "Print"}>
                        <Iconify
                          icon={actionLabel === "Send Reminder" ? "carbon:reminder" : "flat-color-icons:print"}
                          sx={{ height: '16px', width: '16px', cursor: 'pointer' }}
                          onClick={() => {
                            if (actionLabel === "Send Reminder") {
                              // Handle send reminder action
                              console.log("Reminder sent!");
                            } else {
                              // Handle Print action
                              console.log("Item Print!");
                            }
                          }}
                        />
                      </Tooltip>


                    );
                  },
                }



              ]}
              data={selectedStudent.fees[0].paymentDates.map((date: any, idx: any) => ({
                paymentTerm: date.month,
                ...selectedStudent.fees.reduce((acc: any, fee: any) => {
                  acc[fee.feeHead.toLowerCase()] = {
                    amount: fee.amount,
                    status: fee.paymentDates[idx].status,
                  };
                  return acc;
                }, {}),

              }))}
            /> */
}
