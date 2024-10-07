import { Box, MenuItem, MenuList, TextField, Typography } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import React from 'react'
import CustomSelect from 'src/components/custom-select'
import CustomizableTable from 'src/components/customizabaleTable'
import ThreeDotsActions from 'src/components/three-dots-actions'

const FinanceFeeListOverviewComponent = () => {
    return (
        <Box>
            <TextField
                fullWidth
                name="Tuition Fees"
                label="Search by student name or grade"
                // value={formik.values.description}
                // onChange={formik.handleChange}
                size="small"
            />
            <Box display="flex" gap={3} py="10px">

                <CustomSelect
                    label="Class/Grade"
                    options={[]}
                    value=""
                    onChange={() => { }}
                    formControlProps={{ sx: { minWidth: 150 } }}
                />
                <CustomSelect
                    label="Division"
                    options={[]}
                    value=""
                    onChange={() => { }}
                    formControlProps={{ sx: { minWidth: 150 } }}
                />
                <CustomSelect
                    label="Payment Status"
                    options={[]}
                    value=""
                    onChange={() => { }}
                    formControlProps={{ sx: { minWidth: 150 } }}
                />
                <DatePicker
                    label="Due Date"
                    format="DD-MM-YYYY"
                    slotProps={{ textField: { size: 'small' } }}
                />
                <DatePicker
                    label="Payment Date"
                    format="DD-MM-YYYY"
                    slotProps={{ textField: { size: 'small' } }}
                />
            </Box>

            <Typography component="span" variant="h6" gutterBottom>Fee Overview</Typography>

       <Box>
       <CustomizableTable
        columns={[
          { id: 'class', label: 'Class' },
          { id: 'studentName', label: 'Student Name' },
          { id: 'feeType', label: 'Fee Type' },
          { id: 'amountDue', label: 'Amount Due' },
          { id: 'amountPaid', label: 'Amount Paid' },
          { id: 'dueDate', label: 'Due Date' },
          { id: 'status',  label: 'Status' },
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
                       Add Payment
                      </MenuItem>
                    
                     
                    </MenuList>
                  )}
                />
              );
            },
          },
        ]}
        data={[
          {
            class: '10th',
            studentName: 'Jayvion Simon',
            feeType: 'Jayvion Simon',
            amountDue: '$500',
            amountPaid: '$1000',
            dueDate: '01-01-2024',
            status: 'Completed',
            action: 'View',
          },
          {
            class: '10th',
            studentName: 'Jayvion Simon',
            feeType: 'Jayvion Simon',
            amountDue: '$500',
            amountPaid: '$1000',
            dueDate: '01-01-2024',
            status: 'Completed',
            action: 'View',
          },
          {
            class: '10th',
            studentName: 'Jayvion Simon',
            feeType: 'Jayvion Simon',
            amountDue: '$500',
            amountPaid: '$1000',
            dueDate: '01-01-2024',
            status: 'Completed',
            action: 'View',
          },
          

        ]}
      />
       </Box>
        </Box>
    )
}

export default FinanceFeeListOverviewComponent