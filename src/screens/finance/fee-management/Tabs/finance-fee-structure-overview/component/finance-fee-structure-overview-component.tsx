import React, { useState } from 'react';

import { Box, Paper, Switch, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { formatNumber } from 'src/utils/formate_number';

import CustomizableTable from 'src/components/customizabaleTable';

import FinanceCreateFeeStructureComponent from './finance-create-fee-structure';

import type CreateNewFeeStructure from '../data/createNewFeeStructure';
import type FeeStructureOverView from '../data/FeeStructure-interface';

interface FinanceFeeStructureOverviewComponentProps {
  data: FeeStructureOverView[];
}
const FinanceFeeStructureOverviewComponent: React.FC<FinanceFeeStructureOverviewComponentProps> = ({
  data,
}) => {
  const dialog = useBoolean();
  const [feeStructureOverViewData, setFeeOverViewData] = useState(data);
  const [selectedEntry, setSelectedEntry] = useState<FeeStructureOverView | null>(null);

  const handleClose = () => {
    dialog.onFalse();
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
        },
        {
          id: 2,
          name: 'Sports Fee',
          amount: 1500,
          isCounted: false,
          value: 'sportsFee',
          paymentMethod: 'Cash',
        },
        {
          id: 3,
          name: 'Transport Fee',
          amount: 1000,
          isCounted: true,
          value: 'transportFee',
          paymentMethod: 'Check',
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
        <Box display="flex" flexDirection="row" justifyContent="space-between">
          <Typography component="span" variant="h6" gutterBottom>
            Fee Structure Overview
          </Typography>
          {/* <Button onClick={dialog.onTrue} variant="contained" size="medium">
            Create New Fee Structure
          </Button> */}
        </Box>
        {/* <Box display="flex" gap={3} py="10px">
          <CustomSelect
            label="Class/Grade"
            options={[]}
            value=""
            onChange={() => {}}
            formControlProps={{ sx: { minWidth: 150 } }}
          />
          <CustomSelect
            label="Fee Status"
            options={[]}
            value=""
            onChange={() => {}}
            formControlProps={{ sx: { minWidth: 150 } }}
          />
          <DatePicker
            label="To Date"
            format="DD-MM-YYYY"
            slotProps={{ textField: { size: 'small' } }}
          />
          <DatePicker
            label="End Date"
            format="DD-MM-YYYY"
            slotProps={{ textField: { size: 'small' } }}
          />
        </Box> */}
        {/* <CustomizableTable
          columns={[
            { id: 'classGrade', label: 'Class/Grade' },

            { id: 'feeType', label: 'Fee Type' },
            { id: 'amount', label: 'Amount' },

            { id: 'dueDate', label: 'Due Date' },
            {
              id: 'status',
              label: 'Status',
              render(value, row) {
                return (
                  <Label
                    variant="soft"
                    color={
                      value === 'Overdue'
                        ? 'error'
                        : value === 'Unpaid'
                          ? 'warning'
                          : value === 'Paid'
                            ? 'success'
                            : 'default'
                    }
                  >
                    {value}
                  </Label>
                );
              },
            },
            {
              id: 'action',
              label: 'Action',
              render(value, row) {
                return (
                  <ThreeDotsActions
                    actions={({ popover }: any) => (
                      <MenuList>
                        <MenuItem
                          onClick={() => {
                            // setSelectedEntry(row);
                            //   modal.onTrue();
                            //   popover.onClose();
                          }}
                        >
                          <Iconify icon="solar:eye-bold" />
                          View
                        </MenuItem>
                        <MenuItem
                          onClick={() => {
                            setSelectedEntry(row as FeeStructureOverView);
                            dialog.onTrue();
                            //   uploadModal.onTrue();
                            //   popover.onClose();
                          }}
                        >
                          <Iconify icon="solar:pen-bold" />
                          Edit
                        </MenuItem>
                      </MenuList>
                    )}
                  />
                );
              },
            },
          ]}
          data={feeStructureOverViewData}
        /> */}
        <CustomizableTable
          isSearch={false}
          isFilter={false}
          isPagination={false}
          columns={[
            {
              id: 'bookRecipt',
              label: 'Book Recipt',
              children(row) {
                // const switchState = switchStates[row.id] || [];
                return (
                  <>
                    {row.feeSubCategoryList.length > 0 ? (
                      <Box display="flex" gap={2} alignItems="center">
                        {row.feeSubCategoryList.map((val: any, index: any) => (
                          <React.Fragment key={index}>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Paper elevation={4} sx={{ p: 2, width: '100%' }}>
                                <Box
                                  display="flex"
                                  alignItems="center"
                                  justifyContent="space-between"
                                  sx={{ mb: 1 }}
                                >
                                  <Typography variant="body1" fontWeight="bold">
                                    {val.name}:
                                  </Typography>
                                  <Typography variant="body1">
                                    {formatNumber(val.amount, 'INR')}
                                  </Typography>
                                  <Switch checked onChange={() => {}} />
                                </Box>

                                <Box display="flex" flexDirection="column" gap={1}>
                                  <Typography>
                                    Monthly: {formatNumber(val.amount / 12, 'INR')}
                                  </Typography>
                                  <Typography>
                                    Quarterly: {formatNumber(val.amount / 4, 'INR')}
                                  </Typography>
                                  <Typography>
                                    Bi-annual: {formatNumber(val.amount / 2, 'INR')}
                                  </Typography>
                                  <Typography>Yearly: {formatNumber(val.amount, 'INR')}</Typography>
                                </Box>
                              </Paper>
                            </Box>
                          </React.Fragment>
                        ))}
                      </Box>
                    ) : (
                      <Box>
                        <Typography>No data</Typography>
                      </Box>
                    )}
                  </>
                );
              },
            },
            { id: 'applicableGrade', label: 'Applicable Grade' },
            {
              id: 'amount',
              label: 'Amount',
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
            // {
            //   id: 'action',
            //   label: 'Action',
            //   render(value, row: any) {
            //     return (
            //       <ThreeDotsActions
            //         actions={({ popover }) => (
            //           <MenuList>
            //             <MenuItem
            //               onClick={() => {
            //                 setSelectedEntry(row);
            //                 setIsEdit(true);
            //                 dialog.onTrue();
            //               }}
            //             >
            //               <Iconify icon="solar:pen-bold" />
            //               Edit
            //             </MenuItem>
            //             <MenuItem
            //               onClick={() => {
            //                 handleDelete(row);
            //               }}
            //             >
            //               <Iconify icon="solar:trash-bin-trash-bold" />
            //               Delete
            //             </MenuItem>
            //           </MenuList>
            //         )}
            //       />
            //     );
            //   },
            // },
          ]}
          data={tableData}
        />
      </Box>
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
