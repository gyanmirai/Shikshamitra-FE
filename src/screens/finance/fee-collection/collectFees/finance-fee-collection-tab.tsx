'use client';

import React from 'react';

import { Box, Button, TextField } from '@mui/material';

import CustomSelect from 'src/components/custom-select';

import FinanceCollectFeeStudentCardComponent from './component/finance-collect-fee-student-card-component';
import FinanceFeeCollectionPaymentHistoryComponent from './component/finance-fee-collection-payment-history-component';

import type { IUserCard } from './component/finance-collect-fee-student-card-component';

const dummyUser: IUserCard = {
    id: '12345',
    name: 'John Doe',
    role: 'Content Creator',
    coverUrl: 'https://example.com/cover.jpg',
    avatarUrl: 'https://example.com/avatar.jpg',
    totalPosts: 120,
    totalFollowers: 4500,
    totalFollowing: 300
};

const FinanceFeeCollectionTab = () => {
    const data = [];
    return (
        <>
            <Box py="15px" display="flex" flexDirection="row" gap={3} >

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
                    value=""
                    onChange={(e) => { console.log(e) }}
                />
            </Box>
            <Box pl="20px" pb="15px" display="flex" justifyContent="flex-end" alignItems="flex-end">
                <Button variant="contained" sx={{
                    '&:hover': {
                        backgroundColor: 'inherit',
                        boxShadow: 'none',
                    }, backgroundColor: "skyblue", color: "darkblue"
                }}>
                    Collect Fees
                </Button>
            </Box>


            <FinanceCollectFeeStudentCardComponent user={dummyUser} />
            <FinanceFeeCollectionPaymentHistoryComponent />
        </>
    )
}

export default FinanceFeeCollectionTab