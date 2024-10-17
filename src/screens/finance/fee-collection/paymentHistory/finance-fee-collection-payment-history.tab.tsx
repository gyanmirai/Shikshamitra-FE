import React from 'react'

import { DatePicker } from '@mui/x-date-pickers';
import { Box, MenuItem, MenuList } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const FinanceFeeCollectionPaymentHistoryTab = () => {
    const paymentHistoryData = [
        {
            studentName: "jack",
            date: "12-10-2023",
            class: "10",
            feeType: "tuition",
            amount: "500",
            status: "paid"
        },
        {
            studentName: "jack",
            date: "12-10-2023",
            class: "10",
            feeType: "tuition",
            amount: "500",
            status: "paid"

        },
        {
            studentName: "jack",
            date: "12-10-2023",
            class: "10",
            feeType: "tuition",
            amount: "500",
            status: "paid"

        }
    ];
    return (
        <>
            <Box display="flex" flexDirection="row" gap={2}>
                <DatePicker
                    label="Start Date"
                    slotProps={{
                        textField: {
                            sx: { width: '100%', maxWidth: '200px' },
                            size: 'small',
                        },
                    }}
                />
                <DatePicker
                    label="End Date"
                    slotProps={{
                        textField: {
                            sx: { width: '100%', maxWidth: '200px' },
                            size: 'small',
                        },
                    }}
                />
                <CustomSelect
                    label="Class/Grade"
                    options={[]}
                    value=""
                    onChange={() => { }}
                    formControlProps={{ sx: { minWidth: 140 } }}
                />
                <CustomSelect
                    label="Division"
                    options={[]}
                    value=""
                    onChange={() => { }}
                    formControlProps={{ sx: { minWidth: 140 } }}
                />
                <CustomSelect
                    label="Payment Status"
                    options={[]}
                    value=""
                    onChange={() => { }}
                    formControlProps={{ sx: { minWidth: 150 } }}
                />

            </Box>
            <CustomizableTable
                columns={[
                    { id: 'studentName', label: 'Student Name' },
                    { id: 'date', label: 'Date' },
                    { id: 'class', label: 'Class' },
                    { id: 'feeType', label: 'Fee Type' },
                    { id: 'amount', label: 'Amount' },
                    { id: 'status', label: 'Status' },
                    {
                        id: 'action',
                        label: 'Action',
                        render: (data) => (
                            <ThreeDotsActions
                                actions={() => (
                                    <MenuList>
                                        <MenuItem
                                            onClick={() => {
                                                // popover.onClose();
                                            }}
                                        >
                                            <Iconify icon="mdi:check" />
                                            View Receipt
                                        </MenuItem>
                                        <MenuItem
                                            onClick={() => {
                                                // popover.onClose();

                                            }}
                                        >
                                            <Iconify icon="mdi:check" />
                                            Send Reminder
                                        </MenuItem>

                                    </MenuList>
                                )}
                            />
                        ),
                    },

                ]}
                data={paymentHistoryData}
            />
        </>
    )
}

export default FinanceFeeCollectionPaymentHistoryTab