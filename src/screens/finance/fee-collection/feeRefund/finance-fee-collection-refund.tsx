import React, { useState } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Button, MenuItem, MenuList, TextField, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import FeeRefundDialog from './component/fee-refund-dialog';

const FinanceFeeCollectionRefundTab = () => {
    const data = [
        {
            paymentId: "jack7765",
            feeHead: "Tuition",
            paidAmount: "1000",
            refundAmount: 0,

            paidDate: "20-04-2024",
            status: "Paid",
        },
        {
            paymentId: "jack875340",
            feeHead: "Transportation",
            paidAmount: "80000",
            refundAmount: 0,

            paidDate: "15-05-2024",
            status: "Paid",
        },
        {
            paymentId: "jack98765",
            feeHead: "Sports",
            paidAmount: "60000",
            refundAmount: 0,
            paidDate: "30-04-2024",
            status: "Paid",


        },
        {
            paymentId: "jack7785",
            feeHead: "Activity",
            paidAmount: "30000",
            refundAmount: 0,
            paidDate: "10-06-2024",
            status: "Paid",



        },
    ]

    const historyData = [
        {
            className: "1A",
            grNo: "101",
            receiptNo: "RCPT001",
            refundDate: "01-05-2024",
            amount: 1500,
            modeOfPayment: "Cheque",
            transactionId: "TXN12345",
            receiptBook: "RB001"
        },
        {
            className: "2B",
            grNo: "102",
            receiptNo: "RCPT002",
            refundDate: "15-05-2024",
            amount: 2000,
            modeOfPayment: "Transaction",
            transactionId: "TXN12346",
            receiptBook: "RB002"
        },
    ]
    const dialog = useBoolean();
    const [selectedEntry, setSelectedEntry] = useState(data);
    const [isEdit, setIsEdit] = useState(false);
    // const [tableData, setTableData] = useState(data);
    const [paymentHistoryData, setPaymentHistoryData] = useState(data);

    const handleRefundChange = (index: any, value: any) => {
        const newData = [...paymentHistoryData];
        const existingIndex = newData.findIndex((val) => val.paymentId === index)
        newData[existingIndex].refundAmount = value;
        setPaymentHistoryData(newData);
    };

    const totalRefundAmount: number = paymentHistoryData.reduce((total: any, item: any) => total + Number(item.refundAmount), 0);

    const totalRow = {
        paymentId: '',
        feeHead: '',
        paidAmount: 'Total',
        refundAmount: totalRefundAmount,

        paidDate: '',
        status: '',
    };

    const handleSave = () => {

    }

    const closeDialog = () => {
        dialog.onFalse()
    }

    const handleDilog = () => {
        setIsEdit(true);
        setSelectedEntry(paymentHistoryData);

        dialog.onTrue();
    }
    return (
        <>
            <Box display="flex" flexDirection="row" gap={2}>
                <Box py="15px" display="flex" flexDirection="row" gap={3}>
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
                    <TextField
                        label="Search by student name"
                        variant="outlined"
                        size="small"
                        fullWidth
                        value=""
                        onChange={(e) => { }}
                    />
                </Box>
            </Box>
            <CustomizableTable
                columns={[
                    { id: 'paymentId', label: 'Payment Id' },
                    { id: 'feeHead', label: 'Fee Head' },
                    { id: 'paidAmount', label: 'Paid Amount' },
                    {
                        id: 'refundAmount',
                        label: 'Refund Amount',
                        render: (value: any, row: any) => (
                            <TextField
                                disabled={row.paidAmount === "Total"}
                                type="number"
                                variant="outlined"
                                size="small"
                                value={row.refundAmount || ''}
                                onChange={(e) => handleRefundChange(row.paymentId, e.target.value)}
                            />
                        ),
                    },

                    { id: 'paidDate', label: 'Paid Date' },
                    { id: 'status', label: 'Status' },
                    // {
                    //     id: 'action',
                    //     label: 'Action',
                    //     render: (datax:any) => (
                    //         <ThreeDotsActions
                    //             actions={() => (
                    //                 <MenuList>
                    //                     <MenuItem onClick={() => { /* View Receipt action */ }}>
                    //                         <Iconify icon="mdi:check" />
                    //                         View Receipt
                    //                     </MenuItem>
                    //                     <MenuItem onClick={() => { /* Send Reminder action */ }}>
                    //                         <Iconify icon="mdi:check" />
                    //                         Send Reminder
                    //                     </MenuItem>
                    //                 </MenuList>
                    //             )}
                    //         />
                    //     ),
                    // },
                ]}
                data={[...paymentHistoryData, totalRow]}
            />
            <Box display="flex" justifyContent="flex-end" py={2}>
                <Button onClick={() => { handleDilog() }} variant="contained" size="small">
                    Next
                </Button>
            </Box>
            <Typography variant="h6" sx={{ ml: 2,  }}>
            Refund History
          </Typography>
            <CustomizableTable
                columns={[
                    { id: 'className', label: 'Class Name' },
                    { id: 'grNo', label: 'GrNo' },
                    { id: 'receiptNo', label: 'ReceiptNo' },
                    { id: 'refundDate', label: 'RefundDate' },
                    { id: 'amount', label: 'Amount' },
                    { id: 'modeOfPayment', label: 'ModeOfPayment' },
                    { id: 'transactionId', label: 'TransactionId' },
                    { id: 'receiptBook', label: 'Receipt Book' },
                ]}
                data={historyData}
            />

            <Box>
                {dialog.value && selectedEntry && (
                    <FeeRefundDialog
                        onSave={handleSave}
                        dialogValue={dialog.value}
                        onClose={closeDialog}
                        data={selectedEntry}
                        isEdit={isEdit}
                        allData={paymentHistoryData}
                        total={totalRefundAmount}
                    />
                )}
            </Box>
        </>
    );
}

export default FinanceFeeCollectionRefundTab;
