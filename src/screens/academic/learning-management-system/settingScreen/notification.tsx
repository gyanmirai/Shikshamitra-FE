"use client"
import { Box, Switch, Typography } from '@mui/material'
import React from 'react'
import CustomSelect from 'src/components/custom-select'

const NotificationSetting = () => {
    return (
        <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h4">
                Custom Notifications
            </Typography>
            <Box sx={{ display: 'flex' }}>
                <Switch
                    inputProps={{ 'aria-label': 'Toggle view' }}
                />
                <Typography sx={{ ml: 1, mt: 1 }}>Assignment Deadlines</Typography>
            </Box>
            <Box sx={{ display: 'flex' }}>
                <Switch
                    inputProps={{ 'aria-label': 'Toggle view' }}
                />
                <Typography sx={{ ml: 1, mt: 1 }}>New Courses Published</Typography>
            </Box>
            <Box sx={{ display: 'flex' }}>
                <Switch
                    inputProps={{ 'aria-label': 'Toggle view' }}
                />
                <Typography sx={{ ml: 1, mt: 1 }}>Quiz Remiders</Typography>
            </Box>
            <Typography variant="h4">
                Frequency Settings
            </Typography>
            <CustomSelect
                options={[]}
                value=""
                label="Course"
                onChange={() => { }}
                formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }} />
        </Box>
    )
}

export default NotificationSetting