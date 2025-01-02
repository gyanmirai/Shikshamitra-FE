// 'use client';

// import React, { useMemo } from 'react';

// import { Box, Tab, Card } from '@mui/material';

// import { useSearchParam } from 'src/hooks/use-search-param';

// import { Iconify } from 'src/components/iconify';
// import { CustomTabs } from 'src/components/custom-tabs';

// import FinanceStudentFeeTab from './finance-student-fee-tab';

// const TABS = [
//   // {
//   //   value: 'collect-fee',
//   //   label: 'Collect Fees',
//   //   icon: <Iconify icon="prime:indian-rupee" width={20} />,

//   //   component: () => <FinanceFeeCollectionTab />,
//   // },
//   {
//     value: 'student-fee',
//     label: 'Student Fees',
//     icon: <Iconify icon="ph:student-thin" width={20} />,
//     component: () => <FinanceStudentFeeTab />,
//   },
//   // {
//   //   value: 'payment-history',
//   //   label: 'Payment History',
//   //   icon: <Iconify icon="material-symbols-light:history" width={20} />,
//   //   component: () => <FinanceFeeCollectionPaymentHistoryTab />,
//   // },
//   // {
//   //   value: 'fee-refund',
//   //   label: 'Fee Refund',
//   //   icon: <Iconify icon="gridicons:refund" width={20} />,
//   //   component: () => <FinanceFeeCollectionRefundTab />,
//   // },
//   // {
//   //   value: 'charges',
//   //   label: 'Charges',
//   //   icon: <Iconify icon="tdesign:money" width={20} />,
//   //   component: () => <FinanceFeeCollectionCharges />,
//   // },
// ];

// const FinanceFeeCollectionScreen = () => {
//   const [searchParams, setSearchParams] = useSearchParam({ tab: 'student-fee' });

//   const currentActiveComponent = useMemo(
//     () => TABS.find((tab) => tab.value === searchParams?.tab),
//     [searchParams.tab]
//   );
//   return (
//     <Box>
//       <Card>
//         <CustomTabs
//           value={searchParams.tab}
//           onChange={(e, value) => setSearchParams({ tab: value })}
//         >
//           {TABS.map((tab) => (
//             <Tab
//               sx={{ fontSize: '12px' }}
//               icon={tab.icon}
//               key={tab.value}
//               value={tab.value}
//               label={tab.label}
//             />
//           ))}
//         </CustomTabs>
//       </Card>
//       <Box px={1} pt={2}>
//         {currentActiveComponent?.component && (
//           <currentActiveComponent.component
//           // searchParams={searchParams}
//           // setSearchParams={setSearchParams}
//           />
//         )}
//       </Box>
//     </Box>
//   );
// };

// export default FinanceFeeCollectionScreen;
