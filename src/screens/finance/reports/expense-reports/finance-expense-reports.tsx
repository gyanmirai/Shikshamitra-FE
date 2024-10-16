import React from 'react'

import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import { Box, Button, useTheme, Typography } from '@mui/material';

import { PerformanceOverTime } from 'src/screens/academic/gradebook-performance-tracking/progress-report';

import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';

import { AnalyticsCurrentVisits } from 'src/sections/overview/analytics/analytics-current-visits';

const FinanceExpenseReports = () => {
    const theme = useTheme();

    const expenseData = [
        {
            dateOfExpense: "15-08-2024",
            expenseCategory: "Salaries",
            description: "Tuition",
            amountSpent: "500",
            pendingAmount: "500",
            paymentDueDate: "08-08-2024",
            status: "Collected"
        },
        {
            dateOfExpense: "15-08-2024",
            expenseCategory: "Salaries",
            description: "Library",
            amountSpent: "300",
            pendingAmount: "100",
            paymentDueDate: "15-08-2024",
            status: "Pending"
        },
        {
            dateOfExpense: "15-08-2024",
            expenseCategory: "Salaries",
            description: "Sports",
            amountSpent: "400",
            pendingAmount: "200",
            paymentDueDate: "22-08-2024",
            status: "Collected"
        }

    ];

    const columns: any = [
        { id: 'dateOfExpense', label: 'Date Of Expense' },
        { id: 'expenseCategory', label: 'Expense Category' },
        { id: 'description', label: 'Description' },
        { id: 'amountSpent', label: 'Amount Spent' },
        { id: 'pendingAmount', label: 'Pending Amount' },
        { id: 'paymentDueDate', label: 'Payment Due Date' },
        { id: 'status', label: 'Status' },
    ];
    const pendingData = [
        {
            expenseCategory: "Tuition",
            pendingAmount: "500",
            paymentDueDate: "08-08-2024",
            daysOverDue: 10
        },
        {
            expenseCategory: "Library",
            pendingAmount: "300",
            paymentDueDate: "15-08-2024",
            daysOverDue: 5
        },
        {
            expenseCategory: "Sports",
            pendingAmount: "200",
            paymentDueDate: "01-08-2024",
            daysOverDue: 20
        },

    ];

    const pendigDatacolumns: any = [
        { id: 'expenseCategory', label: 'Expense Category' },
        { id: 'pendingAmount', label: 'Pending Amount' },
        { id: 'paymentDueDate', label: 'Payment Due Date' },
        { id: 'daysOverDue', label: 'Days Over Due' },

    ];
    return (
        <>
            <Typography variant="h6" sx={{ pt: "15px", pb: "15px" }}>
                Generate Reports
            </Typography>
            <Box display="flex" flexDirection="row" gap={3} justifyItems="center" alignItems="center">
                <CustomSelect
                    label="Date Range"
                    options={[]}
                    value=""
                    onChange={() => { }}
                    formControlProps={{ sx: { minWidth: 120 } }}
                />
                <CustomSelect
                    label="Category Filter"
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
                    formControlProps={{ sx: { minWidth: 140 } }}
                />
            </Box>

            <CustomizableTable columns={columns} data={expenseData} />

            <Grid2 container spacing={3} py="14px">
                <Grid2 xs={12} md={6} >
                    <AnalyticsCurrentVisits
                        title="Category-Wise Distribution"
                        chart={{
                            series: [
                                { label: 'Salaries', value: 3500 },
                                { label: 'Maintenance', value: 2500 },
                                { label: 'Utilities', value: 1500 },

                            ],
                        }}
                        sx={{ height: '100%' }}
                    />
                </Grid2>
                <Grid2 xs={12} md={6} >
                    <PerformanceOverTime
                        id="demo__4"
                        title="Monthly/Yearly Trend"
                        subheader="(+43%) than last year"
                        chart={{
                            categories: [
                                'Jan',
                                'Feb',
                                'Mar',
                                'Apr',
                                'May',
                                'Jun',
                                'Jul',
                                'Aug',
                                'Sep',
                                'Oct',
                                'Nov',
                                'Dec',
                            ],
                            series: [
                                {
                                    name: '',
                                    data: [10, 41, 35, 51, 49, 62, 69, 91, 148, 35, 51, 49],
                                },
                            ],
                        }}
                        sx={{ height: '100%', boxShadow: 'none' }}
                    />
                </Grid2>

            </Grid2>
            <Typography variant="h6" sx={{ pt: "15px", pb: "15px" }}>
                Pending Payments
            </Typography>
            <CustomizableTable columns={pendigDatacolumns} data={pendingData} />

            <Box py="15px" gap={3} display="flex" justifyContent="flex-end">
                <Button variant="contained" size="small">
                    Export to PDF
                </Button>
                <Button variant="contained" size="small">
                    Export to Excel
                </Button>
            </Box>


        </>
    )
}

export default FinanceExpenseReports