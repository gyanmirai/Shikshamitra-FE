"use client"

import React, { useState } from 'react'

import { Box, Card, Grid, Switch, TextField, Typography } from '@mui/material'

import CustomSelect from 'src/components/custom-select'

const ContentManagementSetting = () => {
    const [isContentModerateVisible, setIsContentModerateVisible] = useState<boolean>(false)
    return (
        <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Card sx={{ p: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={4}>
                        <Typography variant="h6" pb={2}>
                            Upload Limits
                        </Typography>
                        <TextField label="File Size Limit" size='small' sx={{ width: '100%'}} />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Typography variant="h6" pb={2}>
                            Supported File Types
                        </Typography>
                        <CustomSelect
                            options={[
                                { value: "PDF", label: "PDF" },
                                { value: "Video", label: "Video" },
                                { value: "Audio", label: "Audio" },
                            ]}
                            value=""
                            label="Course"
                            onChange={() => { }}
                            formControlProps={{ sx: { width: '100%' } }} />
                    </Grid>
                </Grid>
            </Card>
            <Card sx={{p : 2}}>
                <Typography variant="h6" pb={2}>
                    Content Moderation
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Switch checked={isContentModerateVisible} onChange={(e) => setIsContentModerateVisible(e.target.checked)} />
                    <Typography>Content Moderation</Typography>
                </Box>
                {
                    isContentModerateVisible &&
                    <TextField
                        placeholder='Text description'
                        multiline
                        rows={4}
                        sx={{ maxWidth: '250px', width: '100%' }}
                    />
                }
            </Card>
        </Box>
    )
}

export default ContentManagementSetting;
