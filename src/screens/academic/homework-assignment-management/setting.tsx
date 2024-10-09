import React from 'react'

import { DatePicker } from '@mui/x-date-pickers'
import { Box, Grid, Card, Button, Switch, Checkbox, Typography } from '@mui/material'

import CustomSelect from 'src/components/custom-select'

const Setting = () => (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Card sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                    Assignment Preferences
                </Typography>
                <Grid container spacing={2} alignItems="center" >
                    <Grid item xs={12} md={4}>
                        <Typography variant="h6" gutterBottom>
                            Default Deadlines
                        </Typography>
                        <DatePicker
                            label="Select the Default Deadline"
                            format="DD/MM/YYYY"
                            sx={{}}
                            slotProps={{ textField: { size: "small" } }}
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Typography variant="h6" gutterBottom>
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
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Typography variant="h6" gutterBottom>
                            Reminder Schedules
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Switch />
                            <Typography>24 hours before</Typography>
                            <Switch />
                            <Typography>1 hour before</Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Card>
            <Card sx={{ p: 3 }}>
                <Typography variant="h5" gutterBottom>
                    Custom Notifications
                </Typography>
                <Grid container spacing={2} alignItems="flex-start">
                    <Grid item xs={12} md={4}>
                        <Typography variant="h6" gutterBottom>
                            Choose Notifications
                        </Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Checkbox onChange={() => { }} inputProps={{ 'aria-label': 'controlled' }} />
                                <Typography>New Assignments</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Checkbox onChange={() => { }} inputProps={{ 'aria-label': 'controlled' }} />
                                <Typography>Grading Updates</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Checkbox onChange={() => { }} inputProps={{ 'aria-label': 'controlled' }} />
                                <Typography>Upcoming Deadlines</Typography>
                            </Box>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Typography variant="h6" gutterBottom>
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
                        />
                    </Grid>
                </Grid>
                <Button
                    color="secondary"
                    variant="contained"
                    sx={{ maxWidth: '200px', width: '100%', marginLeft: '80%' }}
                >
                    Save Changes
                </Button>
            </Card>
        </Box>
    )

export default Setting;
