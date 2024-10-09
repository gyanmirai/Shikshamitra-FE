import React from 'react'

import { Box, MenuItem, MenuList, TextField, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import DataTable from 'src/components/commonTable';
import ThreeDotsActions from 'src/components/three-dots-actions';


const PresetCategoryAndDepartmentForBudget = () => (
    <>
        <Box py="15px">
            <Typography component="span" variant="h6">
                Preset Categories and Departments for Budgeting
            </Typography>
        </Box>

        <Box pb="20px" display="flex" flexDirection="column" gap={3}>
            <TextField
                name="Department name"
                label="Department name"
                // value={formik.values.description}
                // onChange={formik.handleChange}
                size="small"
            />
            <DataTable
                columns={[
                    { key: 'existingcategories', label: 'Existing categories' },
                    { key: 'existingdepartments', label: 'Existing departments' },
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
                    { existingcategories: 'Income', existingdepartments: "IT", action: "edit" },
                    { existingcategories: 'Expense', existingdepartments: "IT", action: "edit" },

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

export default PresetCategoryAndDepartmentForBudget