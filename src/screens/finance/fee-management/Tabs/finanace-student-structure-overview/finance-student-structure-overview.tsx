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

import { Tooltip, MenuList, MenuItem, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { formatNumber } from 'src/utils/formate_number';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import FinanceEditFeeStructureForStudent from './component/finance-edit-fee-structure-for-student';

const students = [
  {
    studentId: 123,
    name: 'John Doe',
    grade: 10,
    paymentTerm: 'Monthly',
    totalPending: 38000,
    totalPaid: 40000,
    discountAmount: 0,
    fixedReduction: 0,
    overAllDueDate: '20-04-2025',
    totalFees: 78000,
    totalDueAfterDiscount: 0,
    fees: [
      {
        feeHeadId: 198,
        feeHead: 'Tuition',
        totalFees: 60000,
        amount: 5000,
        totalPaidAmount: 40000,
        paymentDates: [
          { month: 'May-2025', date: '15-03-2024', status: 'Unpaid' },
          { month: 'April-2025', date: '15-03-2024', status: 'Unpaid' },
          { month: 'March-2025', date: '15-03-2024', status: 'Unpaid' },

          { month: 'Feb-2025', date: '15-03-2024', status: 'Unpaid' },
          { month: 'Jan-2025', date: '15-03-2024', status: 'Paid' },
          { month: 'Dec-2024', date: '15-03-2024', status: 'Paid' },

          { month: 'Nov-2024', date: '15-03-2024', status: 'Paid' },

          { month: 'Oct-2024', date: '15-03-2024', status: 'Paid' },
          { month: 'Sep-2024', date: '15-03-2024', status: 'Paid' },
          { month: 'Aug-2024', date: '15-03-2024', status: 'Paid' },
          { month: 'July-2024', date: '15-02-2024', status: 'Paid' },
          { month: 'June-2024', date: '15-01-2024', status: 'Paid' },
        ],
      },
      {
        feeHeadId: 230,
        feeHead: 'Library',
        totalFees: 18000,
        amount: 1500,
        totalPaidAmount: 12000,
        paymentDates: [
          { month: 'May-2025', date: '15-03-2024', status: 'Unpaid' },
          { month: 'April-2025', date: '15-03-2024', status: 'Unpaid' },
          { month: 'March-2025', date: '15-03-2024', status: 'Unpaid' },

          { month: 'Feb-2025', date: '15-03-2024', status: 'Unpaid' },
          { month: 'Jan-2025', date: '15-03-2024', status: 'Paid' },
          { month: 'Dec-2024', date: '15-03-2024', status: 'Paid' },

          { month: 'Nov-2024', date: '15-03-2024', status: 'Paid' },

          { month: 'Oct-2024', date: '15-03-2024', status: 'Paid' },
          { month: 'Sep-2024', date: '15-03-2024', status: 'Paid' },
          { month: 'Aug-2024', date: '15-03-2024', status: 'Paid' },
          { month: 'July-2024', date: '15-02-2024', status: 'Paid' },
          { month: 'June-2024', date: '15-01-2024', status: 'Paid' },
        ],
      },
    ],
  },
  {
    studentId: 1235,
    name: 'John Wick',
    grade: 10,
    paymentTerm: 'Yearly',
    totalPending: 38000,
    totalPaid: 40000,
    discountAmount: 0,
    fixedReduction: 0,
    overAllDueDate: '20-04-2025',
    totalFees: 78000,
    totalDueAfterDiscount: 0,
    fees: [
      {
        feeHeadId: 198,
        feeHead: 'Tuition',
        totalFees: 60000,
        amount: 60000,
        paymentDates: [{ month: 'June-2024', date: '15-01-2024', status: 'Paid' }],
      },
      {
        feeHeadId: 230,
        feeHead: 'Library',
        totalFees: 18000,
        amount: 18000,
        paymentDates: [{ month: 'June-2024', date: '15-01-2024', status: 'Paid' }],
      },
    ],
  },
  {
    studentId: 12357,
    name: 'Jack Sparrow',
    grade: 10,
    paymentTerm: 'Quartly',
    totalPending: 38000,
    totalPaid: 40000,
    discountAmount: 0,
    fixedReduction: 0,
    overAllDueDate: '20-04-2025',
    totalFees: 78000,
    totalDueAfterDiscount: 0,
    fees: [
      {
        feeHeadId: 198,
        feeHead: 'Tuition',
        totalFees: 60000,
        amount: 15000,
        paymentDates: [
          { month: 'March-2025', date: '15-01-2024', status: 'Unpaid' },
          { month: 'Feb-2024', date: '15-01-2024', status: 'Paid' },
          { month: 'Oct-2024', date: '15-01-2024', status: 'Paid' },
          { month: 'June-2024', date: '15-01-2024', status: 'Paid' },
        ],
      },
      {
        feeHeadId: 230,
        feeHead: 'Library',
        totalFees: 18000,
        amount: 4500,
        paymentDates: [
          { month: 'March-2025', date: '15-01-2024', status: 'Unpaid' },
          { month: 'Feb-2024', date: '15-01-2024', status: 'Paid' },
          { month: 'Oct-2024', date: '15-01-2024', status: 'Paid' },
          { month: 'June-2024', date: '15-01-2024', status: 'Paid' },
        ],
      },
    ],
  },
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

  return (
    <>
      <CustomizableTable
        columns={[
          { id: 'name', label: 'Student Name' },
          { id: 'grade', label: 'Grade' },
          {
            id: 'totalPaid',
            label: 'Total Paid',
            render(value, row) {
              return (
                <Typography fontSize="12px" color="green">
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
                <Typography fontSize="12px" color="red">
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
                  actions={({ popover }: any) => (
                    <MenuList>
                      <MenuItem
                        onClick={() => {
                          handleOpen(row);
                        }}
                      >
                        View Details
                      </MenuItem>

                      <MenuItem
                        onClick={() => {
                          setSelectedStudent(row);
                          dialog.onTrue();
                          popover.onClose();
                        }}
                      >
                        Edit
                      </MenuItem>
                    </MenuList>
                  )}
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
          title={`Fee Details for ${selectedStudent.name} / Grade: ${selectedStudent.grade}th`}
          open={open}
          handleClose={handleClose}
          maxWidth="md"
        >
          <CustomizableTable
            isPagination={false}
            isFilter={false}
            isSearch={false}
            columns={[
              { id: 'paymentTerm', label: 'Payment Term' },
              ...selectedStudent.fees.map((fee: any) => ({
                id: fee.feeHead.toLowerCase(),
                label: fee.feeHead,
                render: (value: any) => (
                  <Typography
                    style={{
                      color: value.status === 'Paid' ? 'green' : 'red',
                      fontSize: '12px',
                    }}
                  >
                    {formatNumber(value.amount, 'INR')}
                  </Typography>
                ),
              })),
              {
                id: 'action',
                label: 'Action',
                render: (value, row) => {
                  const unpaidFees = selectedStudent.fees.filter((fee: any) =>
                    fee.paymentDates.some(
                      (payment: any) =>
                        payment.month === row.paymentTerm && payment.status === 'Unpaid'
                    )
                  );

                  const actionLabel = unpaidFees.length > 0 ? 'Send Reminder' : 'Print Receipt';

                  const handleAction = () => {
                    if (unpaidFees.length > 0) {
                      const message = unpaidFees
                        .map((fee: any) => `${actionLabel} for ${fee.feeHead} - ${row.paymentTerm}`)
                        .join('\n');
                      alert(message);
                    } else {
                      alert(
                        `${actionLabel} for ${selectedStudent.fees[0].feeHead} - ${row.paymentTerm}`
                      );
                    }
                  };

                  return (
                    <Tooltip title={actionLabel === 'Send Reminder' ? 'Send Reminder' : 'Print'}>
                      <Iconify
                        icon={
                          actionLabel === 'Send Reminder'
                            ? 'carbon:reminder'
                            : 'flat-color-icons:print'
                        }
                        sx={{ height: '16px', width: '16px', cursor: 'pointer' }}
                        onClick={() => {
                          if (actionLabel === 'Send Reminder') {
                            // Handle send reminder action
                            console.log('Reminder sent!');
                          } else {
                            // Handle Print action
                            console.log('Item Print!');
                          }
                        }}
                      />
                    </Tooltip>
                  );
                },
              },

              // {
              //   id: 'action',
              //   label: 'Action',
              //   render: (value, row) => {

              //     const unpaidFee = selectedStudent.fees.find((fee: any) =>
              //       fee.paymentDates.some(
              //         (payment: any) => payment.month === row.paymentTerm && payment.status === 'Unpaid'
              //       )
              //     );

              //     // If there is any unpaid fee, show "Send Reminder" else "Print Receipt"

              //     // const actionLabel  = unpaidFee ? "Send Reminder" : "Print Receipt";
              //     // const handleAction = () => {
              //     //   alert(
              //     //     actionLabel === "Send Reminder"
              //     //     ? 'Reminder Sent'
              //     //     : 'Print Receipt'
              //     //   );
              //     //   // alert(
              //     //   //   // `${actionLabel} for ${unpaidFee ? unpaidFee.feeHead : selectedStudent.fees[0].feeHead} - ${row.paymentTerm}`
              //     //   // );
              //     // };

              //     return (
              //       <Button
              //         size="small"
              //         variant="outlined"
              //         onClick={handleAction}
              //       >
              //         {actionLabel}
              //       </Button>
              //     );
              //   },
              // },
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
          />
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
