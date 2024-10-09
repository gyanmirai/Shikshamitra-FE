import React from 'react'

import { Box, MenuItem, MenuList, Typography, } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import DataTable from 'src/components/commonTable';
import CustomSelect from 'src/components/custom-select'
import ThreeDotsActions from 'src/components/three-dots-actions';

const PredefinedCategoryIncomeExpenseComponent = () => (
    <>
        <Box py="15px">
            <Typography component="span" variant="h6">
                Predefined Categories for Income and Expenses
            </Typography>
        </Box>

        <Box display="flex" flexDirection="column" gap={3}>
            <CustomSelect
                label="Predefined Category"
                options={[]}
                value=""
                onChange={() => { }}
                formControlProps={{ sx: { minWidth: 150 } }}
            />
            <DataTable
                columns={[
                    { key: 'existingcategories', label: 'Existing categories' },
                    {
                        key: 'action',
                        label: 'Action',
                        render(row: any) {
                            return (
                                <ThreeDotsActions
                                    actions={({ popover }: any) => (
                                        <MenuList>
                                            <MenuItem
                                                onClick={() => {
                                                    // modal.onTrue();
                                                    // popover.onClose();
                                                }}
                                            >
                                                <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px' }} />
                                                Edit
                                            </MenuItem>
                                            <MenuItem
                                                onClick={() => {
                                                    // uploadModal.onTrue();
                                                    // popover.onClose();
                                                }}
                                            >
                                                <Iconify icon="solar:trash-bin-trash-bold" sx={{ height: '16px', width: '16px' }} />
                                                Delete
                                            </MenuItem>
                                        </MenuList>
                                    )}
                                />
                            );
                        },
                    },
                ]}
                data={[
                    { existingcategories: 'Income', action: "edit" },
                    { existingcategories: 'Expense', action: "edit" },

                ]}
            // sx={{
            //     '& .MuiTableCell-root': {
            //         padding: '8px', // Adjust padding as needed
            //     },
            //     '& .MuiTableRow-root': {
            //         height: '40px', // Set a specific height to control row height
            //     },
            // }}
            />

        </Box>







    </>

)

export default PredefinedCategoryIncomeExpenseComponent