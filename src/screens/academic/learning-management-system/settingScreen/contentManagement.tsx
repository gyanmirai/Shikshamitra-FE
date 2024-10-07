"use client"
import { Box, Switch, TextField, Typography } from '@mui/material'
import React from 'react'
import CustomSelect from 'src/components/custom-select'

const ContentManagementSetting = () => {
    return (
        <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6">
                Upload Limits
            </Typography>
            <TextField label="File Size Limit" size='small' sx={{ maxWidth: '250px', width: '100%' }} />
            <Typography variant="h6">
                Supported File Types
            </Typography>
            <CustomSelect
                options={[
                    {value : "PDF", label : "PDF"},
                    {value : "Video", label : "Video"},
                    {value : "Audio", label : "Audio"},
                ]}
                value=""
                label="Course"
                onChange={() => {}}
                formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }} />
            <Typography variant="h6">
                Content Moderation
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center'}}>
                <Switch/>
                <Typography>Content Moderation</Typography>
            </Box>
            <TextField 
              placeholder='Text description'
              multiline
              rows={4}
              sx={{ maxWidth: '250px', width: '100%' }}
            />
        </Box>
    )
}

export default ContentManagementSetting