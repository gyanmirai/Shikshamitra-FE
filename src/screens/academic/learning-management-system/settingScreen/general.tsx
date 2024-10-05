"use client"
import { Box, TextField, Switch, Typography, Checkbox } from '@mui/material'
import React from 'react'
import CustomSelect from 'src/components/custom-select'

const GeneralSettings = () => {
    return (
        <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <CustomSelect
                options={[]}
                value=""
                label="Course"
                onChange={() => { }}
                formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }} />
            <TextField label="Assignment Title" sx={{ maxWidth: '250px', width: '100%' }} />
            <Box sx={{ display: 'flex' }}>
                <Switch
                    inputProps={{ 'aria-label': 'Toggle view' }}
                />
                <Typography sx={{ ml: 1, mt: 1 }}>Attedance Policies</Typography>
            </Box>
            <Typography variant="h4">
                Permissions
            </Typography>
            <Box sx={{ display: 'flex'}}>
                <Checkbox onChange={() => { }} inputProps={{ 'aria-label': 'controlled' }} />
                <Typography sx={{ ml: 1, mt: 1 }}>Admin</Typography>
            </Box>
            <Box sx={{ display: 'flex' }}>
                <Switch
                    inputProps={{ 'aria-label': 'Toggle view' }}
                />
                <Typography sx={{ mt: 1 }}>Edit</Typography>
                <Switch
                    inputProps={{ 'aria-label': 'Toggle view' }}
                />
                <Typography sx={{mt: 1 }}>View</Typography>
                <Switch
                    inputProps={{ 'aria-label': 'Toggle view' }}
                />
                <Typography sx={{mt: 1 }}>Create</Typography>
            </Box>
            <Box sx={{ display: 'flex'}}>
                <Checkbox onChange={() => { }} inputProps={{ 'aria-label': 'controlled' }} />
                <Typography sx={{mt: 1 }}>Teacher</Typography>
            </Box>
            <Box sx={{ display: 'flex' }}>
                <Switch
                    inputProps={{ 'aria-label': 'Toggle view' }}
                />
                <Typography sx={{ mt: 1 }}>Edit</Typography>
                <Switch
                    inputProps={{ 'aria-label': 'Toggle view' }}
                />
                <Typography sx={{mt: 1 }}>View</Typography>
                <Switch
                    inputProps={{ 'aria-label': 'Toggle view' }}
                />
                <Typography sx={{mt: 1 }}>Create</Typography>
            </Box>
            <Box sx={{ display: 'flex'}}>
                <Checkbox onChange={() => { }} inputProps={{ 'aria-label': 'controlled' }} />
                <Typography sx={{mt: 1 }}>Assistant</Typography>
            </Box>
            <Box sx={{ display: 'flex' }}>
                <Switch
                    inputProps={{ 'aria-label': 'Toggle view' }}
                />
                <Typography sx={{mt: 1 }}>Edit</Typography>
                <Switch
                    inputProps={{ 'aria-label': 'Toggle view' }}
                />
                <Typography sx={{mt: 1 }}>View</Typography>
                <Switch
                    inputProps={{ 'aria-label': 'Toggle view' }}
                />
                <Typography sx={{mt: 1 }}>Create</Typography>
            </Box>
        </Box>
    )
}

export default GeneralSettings