import { Box, Button, Checkbox, Switch, Typography } from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import React from 'react'
import CustomSelect from 'src/components/custom-select'

const Setting = () => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" gutterBottom>
                Assignment Preferences
            </Typography>
            <Box sx={{ p: 1 }}>
                <Typography variant="h6" gutterBottom>
                    Default Deadlines
                </Typography>
                <DatePicker
                    label="Select the Default Deadline"
                    format="DD/MM/YYYY"
                    sx={{ maxWidth: '300px', width: '100%' }}
                    slotProps={{ textField: { size: "small" } }}
                />
                <Typography variant="h6" marginTop={2} gutterBottom>
                    Grading Scales
                </Typography>
                <CustomSelect
                    label="Common Grading Scales"
                    options={[
                        { value: "A", label: "A" },
                        { value: "B", label: "B" },
                        { value: "C", label: "C" },
                        { value: "D", label: "D" },
                        { value: "E", label: "E" },
                        { value: "F", label: "F" },
                    ]}
                    value=""
                    onChange={() => { }}
                    formControlProps={{ fullWidth: true, sx: { maxWidth: '300px', width: '100%' } }}
                />
                <Typography variant="h6" marginTop={2} gutterBottom>
                    Reminder Schedules
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Switch />
                    <Typography>24 hours before</Typography>
                    <Switch />
                    <Typography>1 hour before</Typography>
                </Box>
            </Box>
            <Typography variant="h6" gutterBottom>
                Custom Notifications
            </Typography>
            <Box sx={{ pl: 1 }}>
                <Typography variant="h6" gutterBottom>
                    Choose Notifications
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', pt: 1 }}>
                    <Checkbox onChange={() => { }} inputProps={{ 'aria-label': 'controlled' }} />
                    <Typography>New Assignments</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', pt: 1 }}>
                    <Checkbox onChange={() => { }} inputProps={{ 'aria-label': 'controlled' }} />
                    <Typography>Grading Updates</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', pt: 1 }}>
                    <Checkbox onChange={() => { }} inputProps={{ 'aria-label': 'controlled' }} />
                    <Typography>Upcoming Deadlines</Typography>
                </Box>
                <Typography variant="h6" marginTop={2} gutterBottom>
                    Notification Frequency
                </Typography>
                <CustomSelect
                    label="Frequency Options"
                    options={[
                        { value: 'Immediately', label: 'Immediately' },
                        { value: 'Daily', label: 'Daily' },
                        { value: 'Weekly', label: 'Weekly' },
                    ]}
                    value=""
                    onChange={() => { }}
                    formControlProps={{ fullWidth: true, sx: { maxWidth: '300px', width: '100%', marginTop: 2 } }}
                />
            </Box>
            <Button
                color="secondary"
                variant="contained"
                sx={{ maxWidth: '200px', width: '100%', marginLeft: '110px', marginTop: '20px', marginBottom: '20px' }}
            >
                Save Changes
            </Button>
        </Box>
    )
}

export default Setting