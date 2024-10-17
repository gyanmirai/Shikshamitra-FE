import React from 'react'

import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import { Box, Button, useTheme, Typography, Grid, Card } from '@mui/material';

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
     <Grid container spacing={3}>
    <Grid item lg={6} xs={12}>
        <Card sx={{ px: 2 }}>
            <Typography sx={{ pt: "15px", pb: "15px", pl: "15px" }} variant="subtitle1">
                Category-Wise Distribution
            </Typography>

            <Box display="flex" flexDirection="row" gap={1}>
                <CustomSelect
                    label="Organizer"
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
                    label="Year"
                    options={[]}
                    value=""
                    onChange={() => { }}
                    formControlProps={{ sx: { minWidth: 120 } }}
                />
            </Box>

            <Grid container spacing={3} py="14px">
                <Grid item xs={12}>
                    <AnalyticsCurrentVisits
                        title="Income Source Breakdown"
                        chart={{
                            series: [
                                { label: 'Fees', value: 3500 },
                                { label: 'Donation', value: 2500 },
                            ],
                        }}
                        sx={{ height: '100%' }}
                    />
                </Grid>
            </Grid>
        </Card>
    </Grid>

    <Grid item lg={6} xs={12}>
        <Card sx={{ px: 2 }}>
            <Typography sx={{ pt: "15px", pb: "15px", pl: "15px" }} variant="subtitle1">
                Monthly/Yearly Trend
            </Typography>

            <Box display="flex" flexDirection="row" gap={1}>
                <CustomSelect
                    label="Organizer"
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
                    label="Year"
                    options={[]}
                    value=""
                    onChange={() => { }}
                    formControlProps={{ sx: { minWidth: 120 } }}
                />
            </Box>

            <Grid container spacing={3} py="14px">
                <Grid item xs={12}>
                    <PerformanceOverTime
                        id="demo__4"
                        title="Monthly/Yearly Trend"
                        subheader="(+43%) than last year"
                        chart={{
                            categories: [
                                'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                                'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
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
                </Grid>
            </Grid>
        </Card>
    </Grid>
</Grid>



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