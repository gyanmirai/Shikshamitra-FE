"use client"
import { Box, Switch, TextField, Typography } from '@mui/material'
import { TextareaAutosize } from '@mui/base/TextareaAutosize';
import React from 'react'
import CustomSelect from 'src/components/custom-select'
import FullWidthTextarea from 'src/components/textArea/styledTextArea';

const ContentManagementSetting = () => {
    return (
        <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h4">
                Upload Limits
            </Typography>
            <TextField label="File Size Limit" sx={{ maxWidth: '250px', width: '100%' }} />
            <Typography variant="h4">
                Supported File Types
            </Typography>
            <CustomSelect
                options={[]}
                value=""
                label="Course"
                onChange={() => { }}
                formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }} />
            <Typography variant="h4">
                Content Moderation
            </Typography>
            <Box sx={{ display: 'flex' }}>
                <Switch
                    inputProps={{ 'aria-label': 'Toggle view' }}
                />
                <Typography sx={{ ml: 1, mt: 1 }}>Content Moderation</Typography>
            </Box>
            <FullWidthTextarea placeholder="Text description" />
        </Box>
    )
}

export default ContentManagementSetting