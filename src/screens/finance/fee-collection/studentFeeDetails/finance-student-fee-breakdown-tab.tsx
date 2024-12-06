import React from 'react';

import { Box, Card, Chip, Typography, CardContent } from '@mui/material';

import { formatNumber } from 'src/utils/formate_number';

import CustomizableTable from 'src/components/customizabaleTable';

interface PaymentStatus {
  title: string;
  status: string;
}

interface FeeCardProps {
  feeHead: string;
  paymentTerm: string;
  paymentStatus: PaymentStatus[];
}
const FeeCard: React.FC<FeeCardProps> = ({ feeHead, paymentTerm, paymentStatus }) => {
  const unpaidStatuses = paymentStatus.filter((status) => status.status === 'Unpaid');

  return (
    <Card style={{ margin: '10px', padding: '10px' }}>
      <CardContent>
        <Typography variant="h6" style={{ fontWeight: 'bold' }}>
          {feeHead}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Payment Term: {paymentTerm}
        </Typography>

        <Typography variant="subtitle1">Payment Status:</Typography>
        <Chip label={`Unpaid: ${unpaidStatuses.length}`} color="error" />

        <Box mt={1}>
          {paymentStatus.map((status, index) => (
            <Typography key={index} style={{ color: status.status === 'Paid' ? 'green' : 'red' }}>
              {status.title}: <strong>{status.status}</strong>
            </Typography>
          ))}
        </Box>
      </CardContent>
    </Card>
  );
};

const FinanceStudentFeeBreakdownTab = () => {
  const data = [
    {
      id: 1,
      date: '25-04-2025',
      type: 'Tuition Fee',
      discount: '2500',
      amount: '50000',
      additionalDiscount: 0,
      grossFee: 52500,
    },
    {
      id: 2,
      date: '25-04-2025',
      discount: '500',
      type: 'Sports Fee',
      amount: '5000',
      additionalDiscount: 0,
      grossFee: 5500,
    },
    {
      id: 3,
      date: '25-04-2025',
      type: 'Library Fee',
      discount: '0',
      amount: '2500',
      additionalDiscount: 0,
      grossFee: 2500,
    },
  ];
  return (
    <>
      <CustomizableTable
        isFilter={false}
        isPagination={false}
        isSearch={false}
        columns={[
          { id: 'date', label: 'Due Date' },
          { id: 'type', label: 'Type' },
          {
            id: 'grossFee', label: "Gross Fee", render(value, row) {
              return <Typography fontSize="12px">{formatNumber(value, 'INR')}</Typography>;
            },
          },
          {
            id: 'discount',
            label: 'General Discount',
            render(value, row) {
              return <Typography fontSize="12px">{formatNumber(row.discount, 'INR')}</Typography>;
            },
          },
          {
            id: 'additionalDiscount',
            label: 'Additional Discount',
            render(value, row) {
              return <Typography fontSize="12px">{formatNumber(row.additionalDiscount, 'INR')}</Typography>;
            },
          },

          {
            id: 'amount',
            label: 'Payable Fee',
            render(value, row) {
              return <Typography fontSize="12px">{formatNumber(row.amount, 'INR')}</Typography>;
            },
          },
        ]}
        data={data}
      />
      <Box pb="20px" />
    </>
  );
};

export default FinanceStudentFeeBreakdownTab;

// const FinanceStudentFeeBreakdownTab = () => {
//     const [expandedRow, setExpandedRow] = useState<number | null>(null);

//     const data = [
//         {
//             studentId: "12345",
//             name: "John Doe",
//             paymentDate: "2024-05-01",
//             totalAmount: 500,
//             feeHeadListArray: [
//                 {
//                     feeHead: "Tuition",
//                     paymentTerm: "Annually",
//                     paymentStatus: [{ title: "2024-2025", status: "Paid" }],
//                 },
//                 {
//                     feeHead: "Sports",
//                     paymentTerm: "Monthly",
//                     paymentStatus: [
//                         { title: "January", status: "Unpaid" },
//                         { title: "February", status: "Paid" },
//                         { title: "March", status: "Paid" },
//                         { title: "April", status: "Paid" },
//                         { title: "May", status: "Paid" },
//                         { title: "June", status: "Paid" },
//                         { title: "July", status: "Paid" },
//                         { title: "August", status: "Paid" },
//                         { title: "Septmber", status: "Paid" },
//                         { title: "October", status: "Paid" },
//                         { title: "November", status: "Paid" },
//                         { title: "December", status: "Paid" },
//                     ],
//                 },
//                 {
//                     feeHead: "Lab Fees",
//                     paymentTerm: "Quarterly",
//                     paymentStatus: [
//                         { title: "Q1", status: "Paid" },
//                         { title: "Q2", status: "Unpaid" },
//                     ],
//                 },
//             ],
//         },
//     ];

//     const toggleRow = (index: number) => {
//         setExpandedRow(expandedRow === index ? null : index);
//     };

//     return (
//         <Box p={3}>
//             {data.map(student => (
//                 <Box key={student.studentId} mb={3}>
//                     <Typography variant="h5" style={{ fontWeight: 'bold' }}>{student.name}</Typography>
//                     <Typography variant="body1">Payment Due Date: {student.paymentDate}</Typography>
//                     <Typography variant="body1" style={{ fontWeight: 'bold' }}>Total Amount Due: ${student.totalAmount}</Typography>

//                     <TableContainer>
//                         <Table>
//                             <TableHead>
//                                 <TableRow>
//                                     <TableCell>Fee Head</TableCell>
//                                     <TableCell>Payment Term</TableCell>
//                                     <TableCell>Status</TableCell>
//                                 </TableRow>
//                             </TableHead>
//                             <TableBody>
//                                 {student.feeHeadListArray.map((feeHead, index) => (
//                                     <>
//                                         <TableRow key={index} onClick={() => toggleRow(index)} style={{ cursor: 'pointer' }}>
//                                             <TableCell>{feeHead.feeHead}</TableCell>
//                                             <TableCell>{feeHead.paymentTerm}</TableCell>
//                                             <TableCell>
//                                                 <Chip label={`Unpaid: ${feeHead.paymentStatus.filter(status => status.status === 'Unpaid').length}`} color="error" />
//                                             </TableCell>
//                                         </TableRow>
//                                         {expandedRow === index && (
//                                             <TableRow>
//                                                 <TableCell colSpan={3}>
//                                                     <FeeCard
//                                                         feeHead={feeHead.feeHead}
//                                                         paymentTerm={feeHead.paymentTerm}
//                                                         paymentStatus={feeHead.paymentStatus}
//                                                     />
//                                                 </TableCell>
//                                             </TableRow>
//                                         )}
//                                     </>
//                                 ))}
//                             </TableBody>
//                         </Table>
//                     </TableContainer>
//                 </Box>
//             ))}
//         </Box>
//     );
// };

// export default FinanceStudentFeeBreakdownTab;
