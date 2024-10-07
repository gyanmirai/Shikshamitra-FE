import { Box, Typography } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import React from 'react'
import CustomSelect from 'src/components/custom-select'

const FinanceFeeStructureOverview = () => {
    return (
        <Box>
            <Typography component="span" variant="h6" gutterBottom>Fee Structure Overview</Typography>
            <Box display="flex" gap={3} py="10px">

                <CustomSelect
                    label="Subject"
                    options={[]}
                    value=""
                    onChange={() => { }}
                    formControlProps={{ sx: { minWidth: 150 } }}
                />
                <CustomSelect
                    label="Fee Status"
                    options={[]}
                    value=""
                    onChange={() => { }}
                    formControlProps={{ sx: { minWidth: 150 } }}
                />
                <DatePicker
                    label="To Date"
                    format="DD-MM-YYYY"
                    slotProps={{ textField: { size: 'small' } }}
                />
                <DatePicker
                    label="End Date"
                    format="DD-MM-YYYY"
                    slotProps={{ textField: { size: 'small' } }}
                />
            </Box>



        </Box>
    )
}

export default FinanceFeeStructureOverview