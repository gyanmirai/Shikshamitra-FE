'use client';

import React, { useState } from 'react';

import { Box, Button, TextField } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import CustomSelect from 'src/components/custom-select';

import FinanceCollectFeeStudentCardComponent from './component/finance-collect-fee-student-card-component';
import FinanceFeeCollectionPaymentHistoryComponent from './component/finance-fee-collection-payment-history-component';

import type { IUserCard } from './component/finance-collect-fee-student-card-component';
import FinanceCollectFeeDialog from './component/finance-collect-fee-dialog';

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
    const dialog = useBoolean();

    const [selectedEntry, setSelectedEntry] = useState(dummyUser);
    const [isEdit, setIsEdit] = useState(false);
    const [tableData, setTableData] = useState(dummyUser);

   const closeDialog = ()=> {
    dialog.onFalse();
    }

    const handleSave =  ()=> {

    }

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
                }}  onClick={() => {
                    setSelectedEntry(dummyUser);
                    setIsEdit(true);
                    dialog.onTrue();
                }}>
                    Collect Fees
                    
                </Button>
            </Box>


            <FinanceCollectFeeStudentCardComponent user={dummyUser} />
            <FinanceFeeCollectionPaymentHistoryComponent />
            {dialog.value && selectedEntry && (
                <FinanceCollectFeeDialog
                    onSave={handleSave}
                    dialogValue={dialog.value}
                    onClose={closeDialog}
                    data={selectedEntry}
                    isEdit={false}
                    allData={tableData}
                />
            )}
            
        </>
    )
}

export default FinanceFeeCollectionTab