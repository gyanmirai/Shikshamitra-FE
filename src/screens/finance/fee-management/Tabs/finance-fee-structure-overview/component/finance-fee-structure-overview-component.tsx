import React, { useState } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Button, MenuItem, MenuList, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
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

  return (
    <>
      <Box pb="10px">
        <Box display="flex" flexDirection="row" justifyContent="space-between">
          <Typography component="span" variant="h6" gutterBottom>
            Fee Structure Overview
          </Typography>
          <Button onClick={dialog.onTrue} variant="contained" size="medium">
            Create New Fee Structure
          </Button>
        </Box>
        <Box display="flex" gap={3} py="10px">
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
        </Box>
        <CustomizableTable
          columns={[
            { id: 'classGrade', label: 'Class/Grade' },

            { id: 'feeType', label: 'Fee Type' },
            { id: 'amount', label: 'Amount' },

            { id: 'dueDate', label: 'Due Date' },
            { id: 'status', label: 'Status' },
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
                          {/* <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px' }} /> */}
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
                          {/* <Iconify icon="solar:upload-bold" sx={{ height: '16px', width: '16px' }} /> */}
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
