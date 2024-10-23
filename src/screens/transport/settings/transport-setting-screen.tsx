'use client'

import React from 'react'

import { Box, Button, FormControlLabel, Radio, RadioGroup, Switch, Typography } from '@mui/material';

import CustomSelect from 'src/components/custom-select';

const TransportSettingScreen = () => {
    const data = [];
    return (
        <>

            <Typography variant='h6'>Notification Settings</Typography>
            <Box sx={{ py: '8px', display: 'flex', flexDirection: 'row' }} gap={3}>
                <FormControlLabel control={<Switch />} label="Receive Maintenance Alerts" />
                <FormControlLabel control={<Switch />} label="Receive Delay Notifications" />
            </Box>
            <CustomSelect
                label="Select Alert Type"
                name="selectAlertType"
                options={[]}
                formControlProps={{ sx: { width: '200px' } }}
                value=""
                onChange={(value) => { }}
            />
            <Typography sx={{pt:"15px", pb:"10px"}}  variant='h6'>User Preferences</Typography>
            <Box sx={{ py: '8px', display: 'flex', flexDirection: 'row' }} gap={3}>
                <FormControlLabel control={<Switch />} label="Receive Maintenance Alerts" />
                <FormControlLabel control={<Switch />} label="Receive Delay Notifications" />
            </Box>
            <Box display='flex' flexDirection= 'row'  gap={3}>
            <CustomSelect
                label="Map View Customization"
                name="MapViewCustomization"
                options={[]}
                formControlProps={{ sx: { width: '200px' } }}
                value=""
                onChange={(value) => { }}
            />
            <CustomSelect
                label="Time Range"
                name="timeRange"
                options={[]}
                formControlProps={{ sx: { width: '200px' } }}
                value=""
                onChange={(value) => { }}
            />
            </Box>
            <Typography sx={{pt:"15px", pb:"10px"}} variant='h6'>Dashboard Layout</Typography>
            <RadioGroup
                row
                value="overviewCard"
                onChange={(e) => { }}
            >
                <FormControlLabel value="overviewCard" control={<Radio />} label="Overview Card" />
                <FormControlLabel value="averageTripDurationOverTime" control={<Radio />} label="Average Trip Duration Over Time" />
                <FormControlLabel value="vehicleUsageAcrossDifferentBuses" control={<Radio />} label="Vehicle Usage Across Different Buses" />
            </RadioGroup>
            <Box display="flex" justifyContent="flex-end" pr="20px" pt="20px">
                  <Button variant="contained" size="small">
                  Save Preferences
                  </Button>
                </Box>
        </>
    )
}

export default TransportSettingScreen