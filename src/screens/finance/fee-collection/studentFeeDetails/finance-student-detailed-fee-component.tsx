'use client'

import React from 'react'

import { Box, Tab, Card, Typography } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import { CustomTabs } from 'src/components/custom-tabs';

import FinanceStudentPendingFeeTab from './finance-student-pending-fee-tab';
import FinanceStudentFeeBreakdownTab from './finance-student-fee-breakdown-tab';
import { FinanceStudentPaymentHistoryTab } from './finance-student-payment-history-tab';


const TABS = [
    {
        value: 'fee-breakdown',
        label: 'Fee Breakdown',
        component: () => <FinanceStudentFeeBreakdownTab />,
    },
    {
        value: 'payment-history',
        label: 'Payment History',
        component: () => <FinanceStudentPaymentHistoryTab />,
    },
    {
        value: 'pending-fees',
        label: 'Pending Fees',
        component: () => <FinanceStudentPendingFeeTab />,
    },



];

const FinanceStudentDetailedFeeComponent = () => {
    const tabs = useTabs('fee-breakdown');
    const CurrentComponent = TABS.find((tab) => tab.value === tabs.value)?.component;


    return (
        <Box pt='15px'>
            <Typography variant="h6" sx={{ mb: "15px" }}>
                Detailed Fee View
            </Typography>
            <Card>
                <CustomTabs
                    value={tabs.value}
                    onChange={tabs.onChange}
                    variant="fullWidth"
                    slotProps={{ tab: { px: 0 } }}
                >
                    {TABS.map((tab) => (
                        <Tab key={tab.value} value={tab.value} label={tab.label} />
                    ))}
                </CustomTabs>
            </Card>
            <Box px={1} pt={2}>
                {CurrentComponent?.()}
            </Box>
        </Box>
    )
}

export default FinanceStudentDetailedFeeComponent