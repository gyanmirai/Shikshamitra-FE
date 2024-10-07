"use client"
import { Box, TextField, Switch, Typography, Checkbox, Grid, Card } from '@mui/material'
import React from 'react'
import CustomSelect from 'src/components/custom-select'

const GeneralSettings = () => {
    return (
        <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                    <CustomSelect
                        options={[
                            { value: "A", label: "A" },
                            { value: "B", label: "B" },
                            { value: "C", label: "C" },
                            { value: "D", label: "D" },
                            { value: "E", label: "E" },
                            { value: "F", label: "F" },
                        ]}
                        value=""
                        label="Course"
                        onChange={() => { }}
                        formControlProps={{ sx: { width: '100%' } }}
                    />
                </Grid>
                <Grid item xs={12} md={4}>
                    <TextField
                        label="Assignment Title"
                        size='small'
                        fullWidth
                    />
                </Grid>
            </Grid>

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Switch />
                <Typography>Attendance Policies</Typography>
            </Box>

            <Typography variant="h6">
                Permissions
            </Typography>
            <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Checkbox onChange={() => { }} inputProps={{ 'aria-label': 'controlled' }} />
                        <Typography>Admin</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', marginTop : 1 }}>
                        <Switch />
                        <Typography>Edit</Typography>
                        <Switch
                        />
                        <Typography>View</Typography>
                        <Switch />
                        <Typography>Create</Typography>
                    </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center'}}>
                        <Checkbox onChange={() => { }} inputProps={{ 'aria-label': 'controlled' }} />
                        <Typography>Teacher</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', marginTop : 1}}>
                        <Switch/>
                        <Typography>Edit</Typography>
                        <Switch />
                        <Typography>View</Typography>
                        <Switch/>
                        <Typography>Create</Typography>
                    </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Checkbox onChange={() => { }} inputProps={{ 'aria-label': 'controlled' }} />
                        <Typography>Assistant</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center',marginTop : 1 }}>
                        <Switch />
                        <Typography>Edit</Typography>
                        <Switch />
                        <Typography>View</Typography>
                        <Switch />
                        <Typography>Create</Typography>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    )
}

export default GeneralSettings