import React, { useState } from 'react';

import { Box, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { formatNumber } from 'src/utils/formate_number';

import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import FinanceCreateFeeStructureComponent from './finance-create-fee-structure';
import FinanceDetailFeeStructureView from './finance-detail-fee-structure-view';

import type CreateNewFeeStructure from '../data/createNewFeeStructure';
import type FeeStructureOverView from '../data/FeeStructure-interface';

interface FinanceFeeStructureOverviewComponentProps {
  data: FeeStructureOverView[];
}
const FinanceFeeStructureOverviewComponent: React.FC<FinanceFeeStructureOverviewComponentProps> = ({
  data,
}) => {
  const dialog = useBoolean();
  const detaiFeeStructure = useBoolean();
  const [feeStructureOverViewData, setFeeOverViewData] = useState(data);
  const [selectedEntry, setSelectedEntry] = useState<FeeStructureOverView | null>(null);

  const handleClose = () => {
    dialog.onFalse();
  };
  const handleCloseForDetailFeeStructure = () => {
    detaiFeeStructure.onFalse();
  };

  const handleSave = (values: CreateNewFeeStructure) => {
    if (values) {
      // const { classGrade, toDate } = values;

      const feeEntries = [
        { feeType: 'Library', amount: values.libraryFees },
        { feeType: 'Transport', amount: values.transportFees },
        { feeType: 'Tuition', amount: values.tuitionFees },
        { feeType: 'Fixed Reduction', amount: values.fixedReductions },
        { feeType: 'Other', amount: values.otherFees },
      ];

      const structuredFees: FeeStructureOverView[] = feeEntries.map((entry) => ({
        classGrade: '10',

        feeType: entry.feeType,
        amount: entry.amount,

        dueDate: '10-25-2024',
        status: 'Pending',
        action: 'Edit',
      }));

      setFeeOverViewData((prevData) => [...prevData, ...structuredFees]); // Assuming setFeeOverViewData is your state setter for the table data
      console.log('Generated Fee Structures:', structuredFees);
    } else {
      console.log('No data received from child');
    }

    dialog.onFalse();
  };

  const initialData = [
    {
      id: 1,
      amount: 3000,
      discountAmount: 2000,
      grossFee: 5000,
      applicableGrade: '2',
      bookRecipt: 'CBSE',
      paymentDueDate: '20-12-2024',

      feeSubCategoryList: [
        {
          id: 1,
          name: 'Tuition Fee',
          amount: 500,
          isCounted: true,
          value: 'tuitionFee',
          paymentMethod: 'Cash',
          discountAmount: 0,
          discountCategory: '-',
        },
        {
          id: 2,
          name: 'Sports Fee',
          amount: 1500,
          isCounted: false,
          value: 'sportsFee',
          paymentMethod: 'Cash',
          discountAmount: 0,
          discountCategory: '-',
        },
        {
          id: 3,
          name: 'Transport Fee',
          amount: 1000,
          isCounted: true,
          value: 'transportFee',
          paymentMethod: 'Check',
          discountAmount: 0,
          discountCategory: '-',
        },
      ],
      statusToggle: true,
      action: 'View',
    },
  ];
  const [tableData, setTableData] = useState<any>(initialData);
  return (
    <>
      <Box pb="10px">
        <CustomizableTable
          isSearch={false}
          isFilter={false}
          isPagination={false}
          columns={[
            {
              id: 'bookRecipt',
              label: 'Receipt Book',
              // children(row) {
              //   // const switchState = switchStates[row.id] || [];
              //   return (
              //     <>
              //       {row.feeSubCategoryList.length > 0 ? (
              //         <Box display="flex" gap={2} alignItems="center">
              //           {row.feeSubCategoryList.map((val: any, index: any) => (
              //             <React.Fragment key={index}>
              //               <Box display="flex" alignItems="center" gap={1}>
              //                 <Paper elevation={4} sx={{ p: 2, width: '100%' }}>
              //                   <Box
              //                     display="flex"
              //                     alignItems="center"
              //                     justifyContent="space-between"
              //                     sx={{ mb: 1 }}
              //                   >
              //                     <Typography sx={{ pr: 1 }} fontSize="12px" fontWeight="bold">
              //                       {val.name}:
              //                     </Typography>
              //                     <Typography fontSize="12px">
              //                       {formatNumber(val.amount, 'INR')}
              //                     </Typography>
              //                     <Switch checked onChange={() => { }} />
              //                   </Box>

              //                   <Box display="flex" flexDirection="column" gap={1}>
              //                     <Typography fontSize="12px">
              //                       Monthly: {formatNumber(val.amount / 12, 'INR')}
              //                     </Typography>
              //                     <Typography fontSize="12px">
              //                       Quarterly: {formatNumber(val.amount / 4, 'INR')}
              //                     </Typography>
              //                     <Typography fontSize="12px">
              //                       Bi-annual: {formatNumber(val.amount / 2, 'INR')}
              //                     </Typography>
              //                     <Typography fontSize="12px">
              //                       Yearly: {formatNumber(val.amount, 'INR')}
              //                     </Typography>
              //                   </Box>
              //                 </Paper>
              //               </Box>
              //             </React.Fragment>
              //           ))}
              //         </Box>
              //       ) : (
              //         <Box>
              //           <Typography>No data</Typography>
              //         </Box>
              //       )}
              //     </>
              //   );
              // },
            },
            { id: 'applicableGrade', label: 'Standard' },
            {
              id: 'grossFee',
              label: 'Gross Fees',
              render(value, row) {
                // const totalAmount = row.feeSubCategoryList.reduce(
                //   (total: any, val: any, index: any) =>
                //     switchStates[row.id] && switchStates[row.id][index]
                //       ? total + Number(val.amount)
                //       : total,
                //   0
                // );

                // console.log('Row data:', row);
                // console.log('Total amount:', totalAmount);

                return (
                  <Typography sx={{ fontSize: '12px' }}>
                    {formatNumber(Number(row.grossFee), 'INR')}
                  </Typography>
                );
              },
            },
            {
              id: 'discountAmount',
              label: 'General Discount',
              render(value, row) {
                // const totalAmount = row.feeSubCategoryList.reduce(
                //   (total: any, val: any, index: any) =>
                //     switchStates[row.id] && switchStates[row.id][index]
                //       ? total + Number(val.amount)
                //       : total,
                //   0
                // );

                // console.log('Row data:', row);
                // console.log('Total amount:', totalAmount);

                return (
                  <Typography sx={{ fontSize: '12px' }}>
                    {formatNumber(Number(row.discountAmount), 'INR')}
                  </Typography>
                );
              },
            },

            {
              id: 'amount',
              label: 'Payable Fees',
              render(value, row) {
                // const totalAmount = row.feeSubCategoryList.reduce(
                //   (total: any, val: any, index: any) =>
                //     switchStates[row.id] && switchStates[row.id][index]
                //       ? total + Number(val.amount)
                //       : total,
                //   0
                // );

                // console.log('Row data:', row);
                // console.log('Total amount:', totalAmount);

                return (
                  <Typography sx={{ fontSize: '12px' }}>
                    {formatNumber(Number(row.amount), 'INR')}
                  </Typography>
                );
              },
            },

            {
              id: 'paymentDueDate',
              label: 'Payment Due Date',
            },
            // {
            //   id: 'statustoggle',
            //   label: 'Status Toggle',
            //   render(statusToggle) {
            //     return <Switch checked value={statusToggle} />;
            //   },
            // },
            {
              id: 'action',
              label: 'Action',
              render(value, row: any) {
                return (
                  <ThreeDotsActions
                    showThreeDots={false}
                    placement="right-top"
                    showViewIcon
                    handleViewClick={() => {
                      setSelectedEntry(row);
                      detaiFeeStructure.onTrue();
                    }}

                    // actions={({ popover }) => (
                    //   <MenuList>
                    //     <MenuItem
                    //       onClick={() => {
                    //         setSelectedEntry(row);
                    //         detaiFeeStructure.onTrue();
                    //       }}
                    //     >
                    //       <Iconify icon="mdi:eye" />
                    //       View Details
                    //     </MenuItem>
                    //   </MenuList>
                    // )}
                  />
                );
              },
            },
          ]}
          data={tableData}
        />
      </Box>
      {detaiFeeStructure.value && (
        <FinanceDetailFeeStructureView
          data={selectedEntry}
          onClose={handleCloseForDetailFeeStructure}
          dialogValue={detaiFeeStructure.value}
        />
      )}

      {dialog.value && (
        <FinanceCreateFeeStructureComponent
          selectedEntry={selectedEntry}
          onSave={handleSave}
          onClose={handleClose}
          dialogValue={dialog.value}
        />
      )}
    </>
  );
};

export default FinanceFeeStructureOverviewComponent;
