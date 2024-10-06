"use client"
import { Box, TextField, Switch, Typography, Checkbox } from '@mui/material'
import React from 'react'
import CustomSelect from 'src/components/custom-select'

const GeneralSettings = () => {
    return (
        <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }} />
            <TextField label="Assignment Title" size='small' sx={{ maxWidth: '250px', width: '100%' }} />
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Switch/>
                <Typography>Attedance Policies</Typography>
            </Box>
            <Typography variant="h6">
                Permissions
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Checkbox onChange={() => { }} inputProps={{ 'aria-label': 'controlled' }} />
                <Typography>Admin</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Switch />
                <Typography>Edit</Typography>
                <Switch
                />
                <Typography>View</Typography>
                <Switch/>
                <Typography>Create</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Checkbox onChange={() => { }} inputProps={{ 'aria-label': 'controlled' }} />
                <Typography>Teacher</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center'  }}>
                <Switch
                    
                />
                <Typography>Edit</Typography>
                <Switch/>
                <Typography>View</Typography>
                <Switch
                    
                />
                <Typography>Create</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Checkbox onChange={() => { }} inputProps={{ 'aria-label': 'controlled' }} />
                <Typography>Assistant</Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center'  }}>
                <Switch/>
                <Typography>Edit</Typography>
                <Switch/>
                <Typography>View</Typography>
                <Switch/>
                <Typography>Create</Typography>
            </Box>
        </Box>
    )
}

export default GeneralSettings