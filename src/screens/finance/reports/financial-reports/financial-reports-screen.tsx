import React from 'react'

import { Box, Button, Typography } from '@mui/material';

import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';

const FinancialReportsScreen = () => {
    const monthlyFeeCollectedData = [
        { date: '01-01-2024', totalFees: '2500', collectedFees: '2000', pendingFees: "500" },
        { date: '01-01-2024', totalFees: '2500', collectedFees: '2000', pendingFees: "500" },
        { date: '01-01-2024', totalFees: '2500', collectedFees: '2000', pendingFees: "500" },
        { date: '01-01-2024', totalFees: '2500', collectedFees: '2000', pendingFees: "500" },
        { date: '01-01-2024', totalFees: '2500', collectedFees: '2000', pendingFees: "500" },

    ];

    const columns: any = [
        { id: 'date', label: 'Date/Month' },
        { id: 'totalFees', label: 'Total Fees' },
        { id: 'collectedFees', label: 'Collected Fees' },
        { id: 'pendingFees', label: 'Pending Fees' },
    ];
    const gradeWiseFeeCollectedData = [
        { grade: 1, totalFees: '2500', collectedFees: '2000', pendingFees: "500" },
        { grade: 2, totalFees: '2500', collectedFees: '2000', pendingFees: "500" },
        { grade: 3, totalFees: '2500', collectedFees: '2000', pendingFees: "500" },
        { grade: 4, totalFees: '2500', collectedFees: '2000', pendingFees: "500" },
        { grade: 5, totalFees: '2500', collectedFees: '2000', pendingFees: "500" },

    ];

    const gradeWiseFeeCollectionColumns: any = [
        { id: 'grade', label: 'Grade' },
        { id: 'totalFees', label: 'Total Fees' },
        { id: 'collectedFees', label: 'Collected Fees' },
        { id: 'pendingFees', label: 'Pending Fees' },
    ];



    const pendingFeeData = [
        { grade: 1, studentName: "dharmik", feeType: 'Tuition Fees', amount: "6000", dueDate: "20-20-2024" },
        { grade: 2, studentName: "dharmik", feeType: 'Tuition Fees', amount: "6000", dueDate: "20-20-2024" },
        { grade: 3, studentName: "dharmik", feeType: 'Tuition Fees', amount: "6000", dueDate: "20-20-2024" },
        { grade: 4, studentName: "dharmik", feeType: 'Tuition Fees', amount: "6000", dueDate: "20-20-2024" },
        { grade: 5, studentName: "dharmik", feeType: 'Tuition Fees', amount: "6000", dueDate: "20-20-2024" },

    ];

    const pendingFeeColumns: any = [
        { id: 'studentName', label: 'Student Name' },
        { id: 'grade', label: 'Grade' },
        { id: 'feeType', label: 'Fee Type' },
        { id: 'amount', label: 'Amount' },
        { id: 'dueDate', label: 'Due Date' },


    ];

    const overduePaymentsData = [
        { grade: 1, studentName: "dharmik", feeType: 'Tuition Fees', overDueAmount: "6000", daysOverDue: "20 days", dueDate: "20-20-2024" },
        { grade: 2, studentName: "dharmik", feeType: 'Tuition Fees', overDueAmount: "6000", daysOverDue: "20 days", dueDate: "20-20-2024" },
        { grade: 3, studentName: "dharmik", feeType: 'Tuition Fees', overDueAmount: "6000", daysOverDue: "20 days", dueDate: "20-20-2024" },
        { grade: 4, studentName: "dharmik", feeType: 'Tuition Fees', overDueAmount: "6000", daysOverDue: "20 days", dueDate: "20-20-2024" },
        { grade: 5, studentName: "dharmik", feeType: 'Tuition Fees', overDueAmount: "6000", daysOverDue: "20 days", dueDate: "20-20-2024" },

    ];

    const overduePaymentsColumns: any = [
        { id: 'studentName', label: 'Student Name' },
        { id: 'grade', label: 'Grade' },
        { id: 'feeType', label: 'Fee Type' },
        { id: 'overDueAmount', label: 'Overdue Amount' },
        { id: 'dueDate', label: 'Due Date' },
        { id: 'daysOverDue', label: 'Days Overdue' },
    ];

    return (
        <>
            <Box display="flex" flexDirection="row" gap={3} justifyItems="center" alignItems="center">
                <CustomSelect
                    label="Date Range"
                    options={[]}
                    value=""
                    onChange={() => { }}
                    formControlProps={{ sx: { minWidth: 120 } }}
                />
                <CustomSelect
                    label="Grade/Class"
                    options={[]}
                    value=""
                    onChange={() => { }}
                    formControlProps={{ sx: { minWidth: 120 } }}
                />
                <CustomSelect
                    label="Division"
                    options={[]}
                    value=""
                    onChange={() => { }}
                    formControlProps={{ sx: { minWidth: 120 } }}
                />
                <CustomSelect
                    label="Payment Status"
                    options={[]}
                    value=""
                    onChange={() => { }}
                    formControlProps={{ sx: { minWidth: 140 } }}
                />
            </Box>
            <Typography variant="h6" sx={{ pt: "15px" }}>
                Monthly/Yearly Fees Collected
            </Typography>
            <CustomizableTable columns={columns} data={monthlyFeeCollectedData} />
            <Box pt="15px" display="flex" justifyContent="flex-end">
                <Button variant="contained" size="small">
                    Export
                </Button>
            </Box>
            <Typography variant="h6" sx={{ pt: "15px" }}>
                Grade-Wise Fee Collection
            </Typography>
            <CustomizableTable columns={gradeWiseFeeCollectionColumns} data={gradeWiseFeeCollectedData} />
            <Box pt="15px" display="flex" justifyContent="flex-end">
                <Button variant="contained" size="small">
                    Export
                </Button>
            </Box>
            <Typography variant="h6" sx={{ pt: "15px" }}>
                Pending Fees
            </Typography>
            <CustomizableTable columns={pendingFeeColumns} data={pendingFeeData} />
            <Box pt="15px" display="flex" justifyContent="flex-end">
                <Button variant="contained" size="small">
                    Export
                </Button>
            </Box>
            <Typography variant="h6" sx={{ pt: "15px" }}>
                Overdue Payments
            </Typography>
            <CustomizableTable columns={overduePaymentsColumns} data={overduePaymentsData} />
            <Box pt="15px" pb="15px" display="flex" justifyContent="flex-end" >
                <Button variant="contained" size="small">
                    Export
                </Button>
            </Box>






        </>


    )
}

export default FinancialReportsScreen