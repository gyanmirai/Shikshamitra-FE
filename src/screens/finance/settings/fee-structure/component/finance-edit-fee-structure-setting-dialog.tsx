import React, { useState } from 'react';

import { Button, Switch, TextField, Typography, DialogActions } from '@mui/material';

import { formatNumber } from 'src/utils/formate_number';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomizableTable from 'src/components/customizabaleTable';

interface FinanceEditFeeStructureSettingDialogProps {
  dialogValue: boolean;
  onClose: () => void;
  data: any;
}

const FinanceEditFeeStructureSettingDialog: React.FC<FinanceEditFeeStructureSettingDialogProps> = ({
  onClose,
  data,
  dialogValue,
}) => {
  const dummyData = [
    {
      feeHead: 'Tuition',
      grossFee: 5000,
      payableFee: 4500,
      generalDiscount: 500,
    },
    {
      feeHead: 'Sports',
      grossFee: 5000,
      payableFee: 4500,
      generalDiscount: 500,
    },
    {
      feeHead: 'Transport',
      grossFee: 5000,
      payableFee: 4500,
      generalDiscount: 500,
    },
    {
      feeHead: 'Admission',
      grossFee: 1000,
      payableFee: 1000,
      generalDiscount: 0,
    },
  ];

  const [editableData, setEditableData] = useState(
    dummyData.reduce(
      (acc, row) => {
        acc[row.feeHead] = { ...row };
        return acc;
      },
      {} as Record<string, (typeof dummyData)[number]>
    )
  );

  // Handle changes in editable fields
  const handleFieldChange = (value: string | number, field: string, feeHead: string) => {
    setEditableData((prev) => {
      const updatedRow = { ...prev[feeHead], [field]: Number(value) };

      // Recalculate Payable Fee dynamically
      updatedRow.payableFee = updatedRow.grossFee - updatedRow.generalDiscount;

      return {
        ...prev,
        [feeHead]: updatedRow,
      };
    });
  };

  return (
    <CustomDialog
      maxWidth="xl"
      title="Detail Fee Structure"
      open={dialogValue}
      handleClose={onClose}
    >
      <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '600px' }}>
        {/* Read-only table */}
        <Typography variant="h6" sx={{ mb: 2 }}>
          Reference Table
        </Typography>
        <CustomizableTable
          tableId="readOnlyTable"
          isSearch={false}
          isFilter={false}
          isPagination={false}
          isShowedDense={false}
          columns={[
            { id: 'feeHead', label: 'Fee Head' },
            {
              id: 'grossFee',
              label: 'Gross Fee',
              render(value) {
                return (
                  <Typography sx={{ fontSize: '12px' }}>
                    {formatNumber(Number(value), 'INR')}
                  </Typography>
                );
              },
            },
            {
              id: 'generalDiscount',
              label: 'General Discount',
              render(value) {
                return (
                  <Typography sx={{ fontSize: '12px' }}>
                    {formatNumber(Number(value), 'INR')}
                  </Typography>
                );
              },
            },
            {
              id: 'payableFee',
              label: 'Payable Fee',
              render(value) {
                return (
                  <Typography sx={{ fontSize: '12px' }}>
                    {formatNumber(Number(value), 'INR')}
                  </Typography>
                );
              },
            },
            {
              id: 'monthly',
              label: 'Monthly Payable Fee',
              render(value, row) {
                return (
                  <Typography sx={{ fontSize: '12px' }}>
                    {formatNumber(Number(row.payableFee / 12), 'INR')}
                  </Typography>
                );
              },
            },
            {
              id: 'quartly',
              label: 'Quartely Payable Fee',
              render(value, row) {
                return (
                  <Typography sx={{ fontSize: '12px' }}>
                    {formatNumber(Number(row.payableFee / 4), 'INR')}
                  </Typography>
                );
              },
            },

            {
              id: 'bi-annual',
              label: 'Bi-Annually Payable Fee',
              render(value, row) {
                return (
                  <Typography sx={{ fontSize: '12px' }}>
                    {formatNumber(Number(row.payableFee / 2), 'INR')}
                  </Typography>
                );
              },
            },
            {
              id: 'active',
              label: 'Active/In Active',
              render(value, row) {
                return <Switch name="creditcard" checked onChange={() => {}} />;
              },
            },
          ]}
          data={dummyData}
        />

        {/* Editable table */}
        <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
          Editable Table
        </Typography>
        <CustomizableTable
          tableId="editableTable"
          isSearch={false}
          isFilter={false}
          isPagination={false}
          isShowedDense={false}
          columns={[
            { id: 'feeHead', label: 'Fee Head' },
            {
              id: 'grossFee',
              label: 'Gross Fee',
              render: (value, row) => (
                <TextField
                  fullWidth
                  size="small"
                  value={editableData[row.feeHead].grossFee}
                  onChange={(e) => handleFieldChange(e.target.value, 'grossFee', row.feeHead)}
                />
              ),
            },
            {
              id: 'generalDiscount',
              label: 'General Discount',
              render: (value, row) => (
                <TextField
                  fullWidth
                  size="small"
                  value={editableData[row.feeHead].generalDiscount}
                  onChange={(e) =>
                    handleFieldChange(e.target.value, 'generalDiscount', row.feeHead)
                  }
                />
              ),
            },
            {
              id: 'payableFee',
              label: 'Payable Fee',
              render(value, row) {
                return (
                  <Typography fontSize="12px">
                    {formatNumber(editableData[row.feeHead].payableFee, 'INR')}
                  </Typography>
                );
              },
            },
            {
              id: 'monthly',
              label: 'Monthly Payable Fee',
              render(value, row) {
                return (
                  <Typography sx={{ fontSize: '12px' }}>
                    {formatNumber(Number(row.payableFee / 12), 'INR')}
                  </Typography>
                );
              },
            },
            {
              id: 'quartly',
              label: 'Quartely Payable Fee',
              render(value, row) {
                return (
                  <Typography sx={{ fontSize: '12px' }}>
                    {formatNumber(Number(row.payableFee / 4), 'INR')}
                  </Typography>
                );
              },
            },

            {
              id: 'bi-annual',
              label: 'Bi-Annually Payable Fee',
              render(value, row) {
                return (
                  <Typography sx={{ fontSize: '12px' }}>
                    {formatNumber(Number(row.payableFee / 2), 'INR')}
                  </Typography>
                );
              },
            },
            {
              id: 'active',
              label: 'Active/In Active',
              render(value, row) {
                return <Switch name="creditcard" checked onChange={() => {}} />;
              },
            },
          ]}
          data={Object.values(editableData)}
        />
      </Scrollbar>

      <DialogActions sx={{ flexShrink: 0 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={() => {
            console.log('Updated Data:', Object.values(editableData));
            onClose();
          }}
        >
          Save
        </Button>
      </DialogActions>
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
