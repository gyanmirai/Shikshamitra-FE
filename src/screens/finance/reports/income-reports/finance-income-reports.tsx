import React from 'react'

import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import { Box, Button, useTheme, Typography } from '@mui/material';

import { PerformanceOverTime } from 'src/screens/academic/gradebook-performance-tracking/progress-report';

import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';

import { AnalyticsCurrentVisits } from 'src/sections/overview/analytics/analytics-current-visits';

const FinanceIncomeReports = () => {
    const theme = useTheme();

    const incomeData = [
        {
            dateOfPayment: "15-08-2024",
            sourceOfIncome: "Fees",
            description: "xyx",
            amountReceived: "400",
            pendingAmount: "200",
            dueDate: "22-08-2024",
            status: "Collected"
        },
        {
            dateOfPayment: "15-08-2024",
            sourceOfIncome: "Fees",
            description: "xyx",
            amountReceived: "400",
            pendingAmount: "200",
            dueDate: "22-08-2024",
            status: "Collected"
        },
        {
            dateOfPayment: "15-08-2024",
            sourceOfIncome: "Fees",
            description: "xyx",
            amountReceived: "400",
            pendingAmount: "200",
            dueDate: "22-08-2024",
            status: "Collected"
        }

    ];

    const columns: any = [
        { id: 'dateOfPayment', label: 'Date Of Payment' },
        { id: 'sourceOfIncome', label: 'Source Of Income' },
        { id: 'description', label: 'Description' },
        { id: 'amountReceived', label: 'Amount Receievd' },
        { id: 'dueDate', label: 'Due Date' },
        { id: 'status', label: 'Status' },
    ];
    const pendingData = [

        {
            source: "Library",
            amountDue: "200",
            dueDate: "01-08-2024",
            daysOverDue: 20
        },

        {
            source: "Sports",
            amountDue: "200",
            dueDate: "01-08-2024",
            daysOverDue: 20
        },

    ];

    const pendigDatacolumns: any = [
        { id: 'source', label: 'Source' },
        { id: 'amountDue', label: 'Amount Due' },
        { id: 'dueDate', label: 'Due Date' },
        { id: 'daysOverDue', label: 'Days Overdue' },

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

            <CustomizableTable columns={columns} data={incomeData} />

            <Grid2 container spacing={3} py="14px">
                <Grid2 xs={12} md={6} >
                    <AnalyticsCurrentVisits
                        title="Income Source Breakdown"
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
                Pending Income
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

export default FinanceIncomeReports