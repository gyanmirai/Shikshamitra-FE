
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
import React, { useState } from "react";

import { Table, Paper, Button, Dialog,
  TableRow, MenuList, MenuItem, TableBody, TableCell, TableHead,
  DialogTitle,
  DialogContent,
  TableContainer
} from "@mui/material";

import { useBoolean } from "src/hooks/use-boolean";

import ThreeDotsActions from "src/components/three-dots-actions";
import CustomizableTable from "src/components/customizabaleTable";

import FinanceEditFeeStructureForStudent from "./component/finance-edit-fee-structure-for-student";

const students = [
 { 
  studentId:123,
  name: "John Doe",
  grade: 10,
  paymentTerm: "Monthly",
  totalPending:38000,
  totalPaid:40000,
  discountAmount:0,
  fixedReduction:0,
  overAllDueDate:"20-04-2025",
  totalFees:78000,
  totalDueAfterDiscount:0,
  fees: [
    {
      feeHeadId:198,
      feeHead: "Tuition",
      totalFees:60000,
      amount: 5000,
      paymentDates: [
        { month:"June-2024",date: "15-01-2024", status: "Paid" },
        {month:"July-2024" ,date: "15-02-2024", status: "Paid" },
        { month:"Aug-2024",date: "15-03-2024", status: "Paid" },
        { month:"Sep-2024",date: "15-03-2024", status: "Paid" },
        { month:"Oct-2024",date: "15-03-2024", status: "Paid" },
        { month:"Nov-2024",date: "15-03-2024", status: "Paid" },
        { month:"Dec-2024",date: "15-03-2024", status: "Paid" },
        { month:"Jan-2025",date: "15-03-2024", status: "Paid" },
        { month:"Feb-2025",date: "15-03-2024", status: "Unpaid" },
        { month:"April-2025",date: "15-03-2024", status: "Unpaid" },
        { month:"May-2025",date: "15-03-2024", status: "Unpaid" },
      ],
    },
    {
      feeHeadId:230,
      feeHead: "Library",
      totalFees:18000,
      amount: 1500,
      paymentDates: [
        { month:"June-2024",date: "15-01-2024", status: "Paid" },
        {month:"July-2024" ,date: "15-02-2024", status: "Paid" },
        { month:"Aug-2024",date: "15-03-2024", status: "Paid" },
        { month:"Sep-2024",date: "15-03-2024", status: "Paid" },
        { month:"Oct-2024",date: "15-03-2024", status: "Paid" },
        { month:"Nov-2024",date: "15-03-2024", status: "Paid" },
        { month:"Dec-2024",date: "15-03-2024", status: "Paid" },
        { month:"Jan-2025",date: "15-03-2024", status: "Paid" },
        { month:"Feb-2025",date: "15-03-2024", status: "Unpaid" },
        { month:"April-2025",date: "15-03-2024", status: "Unpaid" },
        { month:"May-2025",date: "15-03-2024", status: "Unpaid" },
      ],
    },
   
  ],}
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

  const FeeStructureClose =()=>{
    dialog.onFalse();
     setSelectedStudent(null)
  }

  const feeStructureSaveHandler = (data: any)=>{
      console.log("data for edit fee structure", data)
  }

  return (
    <>

      <CustomizableTable
        columns={[
          { id: 'name', label: 'Student Name' },
          { id: 'grade', label: 'Grade' },
          { id: 'totalPaid', label: 'Total Paid' },
          { id: 'totalPending', label: 'Total Pending' },
    
          {
            id: 'action',
            label: 'Action',
            render(value: any, row: any) {
              return (
                <ThreeDotsActions
                  actions={({ popover }: any) => (
                    <MenuList>
                     
                      <MenuItem onClick={() => { handleOpen(row) }}>View Details</MenuItem>
                     
                      <MenuItem onClick={() => {
                              setSelectedStudent(row);
                              dialog.onTrue();
                              popover.onClose();
                            }}>Edit</MenuItem>
                 
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
       <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
       <DialogTitle>
         {`Fee Details for ${selectedStudent.name} / Grade: ${selectedStudent.grade}th`}
       </DialogTitle>
       <DialogContent>
         <TableContainer component={Paper} style={{ marginTop: "10px" }}>
           <Table>
             <TableHead>
               <TableRow>
                 <TableCell>Payment Term</TableCell>
                 {/* Render fee categories as columns */}
                 {selectedStudent.fees.map((fee:any, idx:any) => (
                   <TableCell key={idx}>{fee.feeHead}</TableCell>
                 ))}
                 <TableCell>Action</TableCell>
               </TableRow>
             </TableHead>
             <TableBody>
               {/* Assuming the first fee category has the list of months for all fees */}
               {selectedStudent.fees[0].paymentDates.map((payment:any, rowIndex:any) => (
                 <TableRow key={rowIndex}>
                   <TableCell>{payment.month}</TableCell>
                   
                   {/* Render each fee category's status and amount */}
                   {selectedStudent.fees.map((fee:any, colIndex:any) => (
                     <TableCell
                       key={colIndex}
                       style={{ color: fee.paymentDates[rowIndex].status === "Paid" ? "green" : "red" }}
                     >
                       {fee.amount} 
                       {/* - {fee.paymentDates[rowIndex].status} */}
                     </TableCell>
                   ))}
 
                   {/* Action button based on status */}
                   <TableCell>
                     {selectedStudent.fees.every(
                       (fee:any) => fee.paymentDates[rowIndex].status === "Paid"
                     ) ? (
                       <Button
                         variant="outlined"
                     
                         onClick={() => alert("Receipt Print")}
                       >
                         Print Receipt
                       </Button>
                     ) : (
                       <Button
                         variant="outlined"
                        
                         onClick={() => alert("Reminder sent")}
                       >
                         Send Reminder
                       </Button>
                     )}
                   </TableCell>
                 </TableRow>
               ))}
             </TableBody>
           </Table>
         </TableContainer>
       </DialogContent>
     </Dialog>
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
}

export default FinanceStudentFeeManagement;
