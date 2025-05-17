// import React from 'react';

// import { Box, Grid, Radio, Divider, Typography } from '@mui/material';

// import { formatNumber } from 'src/utils/formate_number';
// import { numberToWords } from 'src/utils/numberToWords';

// import ReceiptTable from 'src/screens/finance/viewReceipt/receipt-table';

// interface TemplateOneProps {
//   selectedTemplate: string;
//   onSelectTemplate: (data: any) => void;
// }

// const TemplateOne: React.FC<TemplateOneProps> = ({ selectedTemplate, onSelectTemplate }) => (
//   <Grid container spacing={2} mb={3} justifyContent="flex-start">
//     <Grid item xs={12} md={12}>
//       <Box
//         sx={{
//           position: 'relative', // For absolute positioning of radio button
//           border: '1px solid #ddd',
//           borderRadius: '8px',
//           p: 1.5,
//           textAlign: 'center',
//           height: '100%',
//           boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
//           overflow: 'hidden',
//           '&:hover': {
//             boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
//           },
//         }}
//       >
//         {/* Radio Button at Top Right */}
//         <Radio
//           checked={selectedTemplate === 'TemplateOne'}
//           onChange={() => onSelectTemplate('TemplateOne')}
//           value="TemplateOne"
//           sx={{ position: 'absolute', top: 8, right: 8 }}
//         />

//         <Typography variant="subtitle2" noWrap sx={{ fontSize: '0.9rem', mb: 5 }}>
//           Template 1
//         </Typography>

//         {/* Preview content */}
//         <Box sx={{ mb: 1 }}>
//           <Grid
//             container
//             sx={{ fontSize: '0.75rem', alignItems: 'flex-start', justifyContent: 'space-between' }}
//           >
//             <Grid item xs={5}>
//               <Box display="flex" flexDirection="column" alignItems="flex-start">
//                 <Typography fontSize="10px" variant="body2" noWrap>
//                   From:
//                 </Typography>
//                 <Typography fontSize="10px" variant="body2" noWrap>
//                   Deep Darshan Vidhya Sankool
//                 </Typography>
//                 <Typography fontSize="10px" variant="body2" noWrap>
//                   Dindoli - 560078
//                 </Typography>
//               </Box>
//             </Grid>
//             <Grid item xs={5}>
//               <Box display="flex" flexDirection="column" alignItems="flex-start">
//                 <Typography fontSize="10px" variant="body2" noWrap>
//                   To:
//                 </Typography>
//                 <Typography fontSize="10px" variant="body2" noWrap>
//                   <strong>Name:</strong> Vishal Patel
//                 </Typography>
//                 <Typography fontSize="10px" variant="body2" noWrap>
//                   <strong>Class:</strong> 10-A
//                 </Typography>
//               </Box>
//             </Grid>
//           </Grid>
//         </Box>

//         <Divider sx={{ mb: 1 }} />
//         <Box
//           display="flex"
//           flexDirection="column"
//           justifyContent="space-between"
//           pb="10px"
//           sx={{ fontSize: '0.75rem' }}
//         >
//           <Box display="flex" justifyContent="space-between">
//             <Typography fontSize="10px">
//               <strong>Payment Mode :</strong> Payment Gateway
//             </Typography>
//             <Typography fontSize="10px">
//               <strong>Bank:</strong> Paytm
//             </Typography>
//           </Box>

//           <Box display="flex" justifyContent="space-between">
//             <Typography fontSize="10px">
//               <strong>Ref:</strong> 09788nhgh679jlk
//             </Typography>
//             <Typography fontSize="10px">
//               <strong>Date:</strong> 06/08/2025
//             </Typography>
//           </Box>
//         </Box>

//         <Divider sx={{ mb: 1 }} />

//         <ReceiptTable
//           columns={[
//             { id: 'feeHead', label: 'Fee Head' },
//             { id: 'feeHeadMonth', label: 'Paid For' },
//             { id: 'amount', label: 'Amount' },
//           ]}
//           data={[
//             { feeHead: 'Library Fee', amount: 1000, feeHeadMonth: 'March' },
//             { feeHead: 'Sports Fee', amount: 800, feeHeadMonth: 'March' },
//           ]}
//         />
//         <Box mt={7} display="flex" justifyContent="space-between" sx={{ fontSize: '0.65rem' }}>
//           <Box>
//             <Typography fontSize="10px">
//               <strong>Pending Fees:</strong> {formatNumber(900, 'INR')}
//             </Typography>
//           </Box>
//           <Box sx={{ textAlign: 'right', fontSize: '10px' }}>
//             <Typography fontSize="10px">
//               <strong>Total:</strong> {formatNumber(900, 'INR')}
//             </Typography>
//             <Typography sx={{ pb: '10px', fontSize: '10px' }}>
//               (In Words: {numberToWords(900)} Rupees Only)
//             </Typography>
//             <Typography fontSize="10px">_________________________</Typography>
//             <Typography fontSize="10px">Receiver Sign</Typography>
//           </Box>
//         </Box>
//       </Box>
//     </Grid>
//   </Grid>
// );

// export default TemplateOne;
