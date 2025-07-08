import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import React from 'react';

import { Box, Card } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { feestructureDummyData } from '../data/fee-structure-data';
import EditableFeeStructureTable from './editable-fee-structure-table';

interface FinanceEditFeeStructureSettingDialogProps {
  dialogValue: UseBooleanReturn;
  onClose: (e: any, isSubmit: boolean) => void;
  data: any; // Data passed to the dialog (likely a list of fee structures)
  setSelectedEntry: (data: any) => void;
}

const FinanceEditFeeStructureSettingDialog: React.FC<FinanceEditFeeStructureSettingDialogProps> = ({
  dialogValue,
  onClose,
  data,
  setSelectedEntry,
}) => {
  // Define tab options
  const TABS = [
    { value: 'reference', label: 'For View' },
    { value: 'editable', label: 'For Edit' },
  ];

  const tabs = useTabs('editable'); // Initialize tabs with default value

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Fee Structure"
        links={[
          { name: 'Finance', href: '/finance/dashboard' },
          { name: 'Setting', href: '/finance/settings/create-fee-structure/' },
          { name: 'Fee Structure' },
        ]}
        description="This is the Fee Structure section, where you can create, enable, or disable fee structures as needed."
        sx={{ px: 1, mb: 2 }}
        isBack
        onBack={() => {
          dialogValue.onFalse();
          setSelectedEntry(null);
        }}
      />
      <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
        <EditableFeeStructureTable data={feestructureDummyData} onClose={onClose} />
      </Card>
    </Box>
  );
};

export default FinanceEditFeeStructureSettingDialog;

// import React from 'react'

// import { Button, Switch, Typography, DialogActions } from '@mui/material';

// import { formatNumber } from 'src/utils/formate_number';

// import { Scrollbar } from 'src/components/scrollbar';
// import CustomDialog from 'src/components/customDialog'
// import CustomizableTable from 'src/components/customizabaleTable'

// interface FinanceEditFeeStructureSettingDialogProps {
//     dialogValue: boolean,
//     onClose: () => void,
//     data: any,
// }

// const FinanceEditFeeStructureSettingDialog: React.FC<FinanceEditFeeStructureSettingDialogProps> = ({ onClose, data, dialogValue }) => {
//     console.log("data", data);

//     const dummyData = [
//         {
//             feeHead: "Tuition",
//             grossFee: 5000,
//             payableFee: 4500,
//             generalDiscount: 500,
//         },
//         {
//             feeHead: "Sports",
//             grossFee: 5000,
//             payableFee: 4500,
//             generalDiscount: 500,
//         },
//         {
//             feeHead: "Transport",
//             grossFee: 5000,
//             payableFee: 4500,
//             generalDiscount: 500,
//         },
//         {
//             feeHead: "Admission",
//             grossFee: 1000,
//             payableFee: 1000,
//             generalDiscount: 0,
//         },

//     ]
//     return (
//         <CustomDialog
//             maxWidth="xl"
//             title="Detail Fee Structure" open={dialogValue} handleClose={onClose}>
//             <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '450px' }}>

//                 <CustomizableTable
//                     isSearch={false}
//                     isFilter={false}
//                     isPagination={false}
//                     isShowedDense={false}
//                     columns={[
//                         { id: "feeHead", label: "Fee Head" },
//                         {
//                             id: "grossFee", label: "Gross Fee", render(value, row) {
//                                 return (
//                                     <Typography sx={{ fontSize: '12px' }}>
//                                         {formatNumber(Number(value), 'INR')}
//                                     </Typography>
//                                 );
//                             },
//                         },
//                         {
//                             id: "generalDiscount", label: "General Discount", render(value, row) {
//                                 return (
//                                     <Typography sx={{ fontSize: '12px' }}>
//                                         {formatNumber(Number(value), 'INR')}
//                                     </Typography>
//                                 );
//                             },
//                         },
//                         {
//                             id: "payableFee", label: "Payable Fee", render(value, row) {
//                                 return (
//                                     <Typography sx={{ fontSize: '12px' }}>
//                                         {formatNumber(Number(value), 'INR')}
//                                     </Typography>
//                                 );
//                             },
//                         },

//                         {
//                             id: "monthly", label: "Monthly Payable Fee", render(value, row) {
//                                 return (
//                                     <Typography sx={{ fontSize: '12px' }}>
//                                         {formatNumber(Number(row.payableFee / 12), 'INR')}
//                                     </Typography>
//                                 );
//                             },
//                         },
//                         {
//                             id: "quartly", label: "Quartely Payable Fee", render(value, row) {
//                                 return (
//                                     <Typography sx={{ fontSize: '12px' }}>
//                                         {formatNumber(Number(row.payableFee / 4), 'INR')}
//                                     </Typography>
//                                 );
//                             },
//                         },

//                         {
//                             id: "bi-annual", label: "Bi-Annually Payable Fee", render(value, row) {
//                                 return (
//                                     <Typography sx={{ fontSize: '12px' }}>
//                                         {formatNumber(Number(row.payableFee / 2), 'INR')}
//                                     </Typography>
//                                 );
//                             },
//                         },
//                         {
//                             id: "active", label: "Active/In Active", render(value, row) {
//                                 return <Switch name="creditcard" checked onChange={() => { }} />
//                             },
//                         }

//                     ]} data={dummyData} />
//             </Scrollbar>

//             <DialogActions sx={{ flexShrink: 0 }}>
//                 <Button >Save</Button>

//             </DialogActions>

//         </CustomDialog>
//     )
// }

// export default FinanceEditFeeStructureSettingDialog
