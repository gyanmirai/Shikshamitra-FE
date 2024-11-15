import React, { useState, useEffect } from 'react';

import { Box, MenuItem, MenuList } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Label } from 'src/components/label/label';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import FinanceStudentUpdatePaymentDialog from './finance-student-update-payment-dialog';

import type studentFeePaymentStatusUpdated from '../data/student-fee-payment-status-updated';

const data = [
  {
    class: '10th',
    studentName: 'Raj',
    gradeLevel: '10TH A',
    feeStatus: 'Unpaid',
    action: 'View',
  },
  {
    class: '10th',
    studentName: 'Abc',
    gradeLevel: '10TH A',
    feeStatus: 'Paid',
    action: 'View',
  },
  {
    class: '10th',
    studentName: 'Jay',
    gradeLevel: '10TH A',
    feeStatus: 'Overdue',
    action: 'View',
  },
];
const FinanceStudentFeeManagementComponent = () => {
  const dialog = useBoolean();

  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [studentFeeManagementData, setStudentFeeManagementData] = useState(data);

  useEffect(() => {
    if (selectedEntry) {
      console.log('Updated selectedEntry:', selectedEntry);

      //     <FinanceStudentUpdatePaymentDialog  dialogValue={dialog.value} onClose={()=>{dialog.onFalse}} data={selectedEntry}/>
      // }
    }
  }, [selectedEntry]);

  const handleSave = (values: studentFeePaymentStatusUpdated) => {
    console.log('Data after save', values);

    const updatedData = studentFeeManagementData.map((val) => {
      if (
        val.studentName === selectedEntry.studentName &&
        val.gradeLevel === selectedEntry.gradeLevel
      ) {
        return {
          ...val,
          feeStatus: values.paymentStatus,
        };
      }
      return val;
    });

    setStudentFeeManagementData(updatedData);
    dialog.onFalse();
  };

  return (
    <>
      {/* <Typography component="span" variant="h6">
        Student Fee Management
      </Typography> */}
      <Box>
        {/* <Box display="flex" gap={3} py="10px">
          <CustomSelect
            label="Class/Grade"
            options={[]}
            value=""
            onChange={() => {}}
            formControlProps={{ sx: { minWidth: 150 } }}
          />
          <CustomSelect
            label="Division"
            options={[]}
            value=""
            onChange={() => {}}
            formControlProps={{ sx: { minWidth: 150 } }}
          />
          <CustomSelect
            label="Select Action"
            options={[]}
            value=""
            onChange={() => {}}
            formControlProps={{ sx: { minWidth: 150 } }}
          />
        </Box>
        <TextField
          name="Tuition Fees"
          label="Search by student name or grade"
          // value={formik.values.description}
          // onChange={formik.handleChange}
          size="small"
        /> */}

        <Box>
          <CustomizableTable
            columns={[
              { id: 'studentName', label: 'Student Name' },
              { id: 'gradeLevel', label: 'Grade Level' },
              {
                id: 'feeStatus',
                label: 'Fee Status',
                render(value, row) {
                  return (
                    <Label
                      variant="soft"
                      color={
                        value === 'Unpaid'
                          ? 'warning'
                          : value === 'Overdue'
                            ? 'error'
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
                              //   modal.onTrue();
                              //   popover.onClose();
                            }}
                          >
                            {/* <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px' }} /> */}
                            Sent Reminder
                          </MenuItem>
                          <MenuItem
                            onClick={() => {
                              setSelectedEntry(row);
                              dialog.onTrue();
                              popover.onClose();
                            }}
                          >
                            {/* <Iconify icon="solar:upload-bold" sx={{ height: '16px', width: '16px' }} /> */}
                            Update Payment Status
                          </MenuItem>
                        </MenuList>
                      )}
                    />
                  );
                },
              },
            ]}
            data={studentFeeManagementData}
          />
        </Box>
        {dialog.value && selectedEntry && (
          <FinanceStudentUpdatePaymentDialog
            onSave={handleSave}
            dialogValue={dialog.value}
            onClose={() => dialog.onFalse()}
            data={selectedEntry}
          />
        )}
      </Box>
    </>
  );
};

export default FinanceStudentFeeManagementComponent;
