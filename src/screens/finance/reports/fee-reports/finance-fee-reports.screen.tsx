import React from 'react'

import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import { Box, alpha, Button, useTheme, Typography } from '@mui/material';

import { CONFIG } from 'src/config-global';
import { PerformanceOverTime } from 'src/screens/academic/gradebook-performance-tracking/progress-report';

import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';

import { AnalyticsWidgetSummary } from 'src/sections/overview/analytics/analytics-widget-summary';
import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';

const FinanceFeeReportsScreen = () => {
    const theme = useTheme();

    const monthlyFeeCollectedData = [
        { studentName: "JeetRam", class: "01", feeType: "Tuition", amountPaid: "500", pendingAmount: "500", dueDate: "08-08-2024", status: "Collected" },
        { studentName: "JeetRam", class: "01", feeType: "Tuition", amountPaid: "500", pendingAmount: "500", dueDate: "08-08-2024", status: "Collected" },
        { studentName: "JeetRam", class: "01", feeType: "Tuition", amountPaid: "500", pendingAmount: "500", dueDate: "08-08-2024", status: "Collected" },
        { studentName: "JeetRam", class: "01", feeType: "Tuition", amountPaid: "500", pendingAmount: "500", dueDate: "08-08-2024", status: "Collected" },
        { studentName: "JeetRam", class: "01", feeType: "Tuition", amountPaid: "500", pendingAmount: "500", dueDate: "08-08-2024", status: "Collected" },


    ];

    const columns: any = [
        { id: 'studentName', label: 'Student Name' },
        { id: 'class', label: 'Class' },
        { id: 'feeType', label: 'Fee Type' },
        { id: 'amountPaid', label: 'Amount Paid' },
        { id: 'pendingAmount', label: 'Pending Amount' },
        { id: 'dueDate', label: 'Due Date' },
        { id: 'status', label: 'Status' },
    ];
    return (
        <>
            <Grid2 container spacing={3} py="14px">
                <Grid2 xs={12} md={6} lg={4}>
                    <AnalyticsWidgetSummary
                        title="Total Fees Collected"
                        percent={2.6}
                        total={714000}
                        icon={
                            <img alt="icon" src={`${CONFIG.site.basePath}/assets/icons/glass/ic-glass-bag.svg`} />
                        }
                        chart={{
                            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
                            series: [22, 8, 35, 50, 82, 84, 77, 12],
                        }}
                    />
                </Grid2>
                <Grid2 xs={12} md={6} lg={4}>
                    <AnalyticsWidgetSummary
                        title="Total Fees Pending"
                        percent={2.8}
                        total={1723315}
                        color="warning"
                        icon={
                            <img alt="icon" src={`${CONFIG.site.basePath}/assets/icons/glass/ic-glass-buy.svg`} />
                        }
                        chart={{
                            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
                            series: [40, 70, 50, 28, 70, 75, 7, 64],
                        }}
                    />
                </Grid2>
                <Grid2 xs={12} md={6} lg={4}>
                    <AnalyticsWidgetSummary
                        title="Total Fees Due"
                        percent={3.6}
                        total={234}
                        color="error"
                        icon={
                            <img
                                alt="icon"
                                src={`${CONFIG.site.basePath}/assets/icons/glass/ic-glass-message.svg`}
                            />
                        }
                        chart={{
                            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
                            series: [56, 30, 23, 54, 47, 40, 62, 73],
                        }}
                    />
                </Grid2>
            </Grid2>
            <Typography variant="h6" sx={{ pt: "15px", pb: "15px" }}>
                Generate Custom Reports
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
                    label="Fee Type"
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

            <CustomizableTable columns={columns} data={monthlyFeeCollectedData} />

            <Grid2 container spacing={3} py="14px">
                <Grid2 xs={12} md={6} >
                    <PerformanceOverTime
                        id="demo__4"
                        title="Fee collection progress over time"
                        //   subheader="(+43%) than last year"
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
                <Grid2 xs={12} md={6} >
                    <AnalyticsWebsiteVisits
                        title="Fee collections across different classes or fee types"
                        //   subheader="(+43%) than last year"
                        chart={{
                            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
                            series: [
                                { name: 'Class 2', data: [43, 33, 22, 37, 67, 68, 37, 24, 55] },
                                { name: 'Class 2', data: [51, 70, 47, 67, 40, 37, 24, 70, 24] },
                            ],
                            colors: [
                                alpha(theme.palette.primary.dark, 0.8),
                                alpha(theme.palette.warning.main, 0.8),
                            ],
                        }}
                        sx={{ height: '100%' }}
                    />
                </Grid2>
            </Grid2>
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

export default FinanceFeeReportsScreen