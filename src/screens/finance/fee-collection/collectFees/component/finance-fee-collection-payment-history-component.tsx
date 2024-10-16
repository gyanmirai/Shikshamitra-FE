import React from 'react'

import { MenuItem, MenuList } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

const paymentHistoryData = [
    {
        paymentId: "hdjsh233",
        date: "12-10-2023",
        dueDate: "10",
        amount: "500",
        status: "Paid"
    },
    {
        paymentId: "hdjsh233",
        date: "12-10-2023",
        dueDate: "10",
        amount: "500",
        status: "Paid"


    },
    {
        paymentId: "hdjsh233",
        date: "12-10-2023",
        amount: "500",
        dueDate: "10",
        status: "Paid"
    }
];
const FinanceFeeCollectionPaymentHistoryComponent = () => {
    const data = [];
    return (
        <CustomizableTable
            columns={[
                { id: 'paymentId', label: 'Student Name' },
                { id: 'date', label: 'Date' },
                { id: 'amount', label: 'Amount' },
                { id: 'dueDate', label: 'Due Date' },

                { id: 'status', label: 'Status' },
                {
                    id: 'action',
                    label: 'Action',
                    render: (row) => (
                        <ThreeDotsActions
                            actions={() => (
                                <MenuList>
                                    <MenuItem
                                        onClick={() => {

                                            // popover.onClose();
                                        }}
                                    >
                                        <Iconify icon="mdi:eye" />
                                        View Receipt
                                    </MenuItem>
                                    <MenuItem
                                        onClick={() => {

                                            // popover.onClose();
                                        }}
                                    >
                                        <Iconify icon="mdi:check" />
                                        Mark as Check
                                    </MenuItem>
                                    <MenuItem
                                        onClick={() => {

                                            // popover.onClose();
                                        }}
                                    >
                                        <Iconify icon="mdi:pen" />
                                        Edit
                                    </MenuItem>

                                </MenuList>
                            )}
                        />
                    ),
                },

            ]}
            data={paymentHistoryData}
        />
    )
}

export default FinanceFeeCollectionPaymentHistoryComponent