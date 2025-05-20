import React from 'react';

import { Box, Tab, Tooltip, Typography } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import { Iconify } from 'src/components/iconify/iconify';
import { CustomTabs } from 'src/components/custom-tabs/custom-tabs';

import { feestructureDummyData } from '../data/fee-structure-data';
import EditableFeeStructureTable from './editable-fee-structure-table';
import ReadOnlyFeeStructureTable from './read-only-fee-structure-table';

interface FinanceEditFeeStructureSettingDialogProps {
  dialogValue: boolean;
  onClose: () => void;
  data: any; // Data passed to the dialog (likely a list of fee structures)
}

const FinanceEditFeeStructureSettingDialog: React.FC<FinanceEditFeeStructureSettingDialogProps> = ({
  dialogValue,
  onClose,
  data,
}) => {
  // Define tab options
  const TABS = [
    { value: 'reference', label: 'For View' },
    { value: 'editable', label: 'For Edit' },
  ];

  const tabs = useTabs('editable'); // Initialize tabs with default value

  return (
    <CustomDialog
      maxWidth="xl"
      title={
        <Box display="flex" flexDirection="row" gap={2} alignItems="center">
          <Typography variant="h5">
            {tabs.value === 'editable' ? 'Edit For Class 1' : 'Details For Class 1'}
          </Typography>
          <Tooltip
            arrow
            placement="right"
            title="You can edit and modify the existing fee structure for Class 1. While making edits, if you want to track the changes you've made, you can view the details in the Reference Table."
          >
            <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
          </Tooltip>
        </Box>
      }
      open={dialogValue}
      handleClose={onClose}
    >
      <CustomTabs
        value={tabs.value}
        onChange={tabs.onChange}
        variant="fullWidth"
        slotProps={{ tab: { px: 0 } }}
      >
        {TABS.map((tab) => (
          <Tab key={tab.value} value={tab.value} label={tab.label} />
        ))}
      </CustomTabs>

      <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '700px' }}>
        {tabs.value === 'editable' && <EditableFeeStructureTable data={feestructureDummyData} />}
        {tabs.value === 'reference' && <ReadOnlyFeeStructureTable data={feestructureDummyData} />}
      </Scrollbar>
    </CustomDialog>
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
