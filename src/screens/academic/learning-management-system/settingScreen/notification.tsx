"use client"
import { Box, Switch, Typography } from '@mui/material'
import React from 'react'
import CustomSelect from 'src/components/custom-select'

const NotificationSetting = () => {
    return (
        <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6">
                Custom Notifications
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Switch
                   
                />
                <Typography>Assignment Deadlines</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Switch
                    
                />
                <Typography>New Courses Published</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Switch
                />
                <Typography>Quiz Remiders</Typography>
            </Box>
            <Typography variant="h6">
                Frequency Settings
            </Typography>
            <CustomSelect
                options={[
                    {value : "Daily", label : "Daily"},
                    {value : "Weekly", label : "Weekly"},
                ]}
                value=""
                label="Frequency"
                onChange={() => { }}
                formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }} />
        </Box>
    )
}

export default NotificationSetting