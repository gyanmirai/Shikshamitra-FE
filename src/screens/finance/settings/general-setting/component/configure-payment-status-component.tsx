import React from 'react'

import { Box, Button, MenuItem, MenuList, TextField, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import DataTable from 'src/components/commonTable';
import ThreeDotsActions from 'src/components/three-dots-actions';

const ConfigurePaymentStatusComponent = () => (
    <>
        <Typography component="span" variant="h6">
            Configure Payment Status Options
        </Typography>
        <Box py="15px" display="flex" flexDirection="column" gap={3}>
            <DataTable
                columns={[
                    { key: 'paymentMethod', label: 'Payment Method' },
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
                    { paymentMethod: 'Paid', action: "edit" },
                    { paymentMethod: 'Due', action: "edit" },
                    { paymentMethod: 'UnPaid', action: "edit" },
                ]}

            />
            <Box display="flex" flexDirection="row" gap={3} alignItems="center" justifyContent="flex-start">
                <TextField
                    name="Add new status"
                    label="Add new status"
                    // value={formik.values.description}
                    // onChange={formik.handleChange}
                    size="small"
                />
                <Button variant="contained" size="small">
                    Add
                </Button>
            </Box>

        </Box>
    </>

)

export default ConfigurePaymentStatusComponent