import React from 'react'

import { Box, Typography } from '@mui/material'

import CustomSelect from 'src/components/custom-select'

const CurrencySettingForDifferentRegionComponent = () => (
    <>
        <Typography component="span" variant="h6">
            Currency Settings for Different Regions
        </Typography>
        <Box py="15px" display="flex" flexDirection="column" gap={3}>

            <CustomSelect
                label="Select region or country"
                options={[]}
                value=""
                onChange={() => { }}
                formControlProps={{ sx: { minWidth: 150 } }}
            />
            <CustomSelect
                label="Select Currency"
                options={[]}
                value=""
                onChange={() => { }}
                formControlProps={{ sx: { minWidth: 150 } }}
            />
        </Box>

    </>





)

export default CurrencySettingForDifferentRegionComponent