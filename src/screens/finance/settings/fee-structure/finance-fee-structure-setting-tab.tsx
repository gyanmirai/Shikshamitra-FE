import React from 'react'

import { Box, Button, MenuItem, MenuList, Typography } from '@mui/material';

import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const FinanceFeeStructureSettingTab = () => (
    <>
        <Box gap={3} display="flex" flexDirection="row" justifyContent="flex-end">
            <Button variant="contained" size="small">
                Bulk Update Fees
            </Button>
            <Button variant="contained" size="small">
                Add New Fee Category
            </Button>
        </Box>
        <Box>
            <Typography component="span" variant="h6" gutterBottom>
                Fee Categories Overview
            </Typography>
        </Box>
        <CustomizableTable
            columns={[
                { id: 'class', label: 'Class' },
                { id: 'studentName', label: 'Student Name' },
                { id: 'feeType', label: 'Fee Type' },
                { id: 'amountDue', label: 'Amount Due' },
                { id: 'amountPaid', label: 'Amount Paid' },
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
                    feeType: 'Library Fees',
                    amountDue: '$500',
                    amountPaid: '$1000',
                    dueDate: '01-01-2024',
                    status: 'Completed',
                    action: 'View',
                },
                {
                    class: '10th',
                    studentName: 'Jayvion Simon',
                    feeType: 'Tuition Fees',
                    amountDue: '$500',
                    amountPaid: '$1000',
                    dueDate: '01-01-2024',
                    status: 'Completed',
                    action: 'View',
                },
                {
                    class: '10th',
                    studentName: 'Jayvion Simon',
                    feeType: 'Tuition Fees',
                    amountDue: '$500',
                    amountPaid: '$1000',
                    dueDate: '01-01-2024',
                    status: 'Completed',
                    action: 'View',
                },
            ]}
        />
    </>
)

export default FinanceFeeStructureSettingTab