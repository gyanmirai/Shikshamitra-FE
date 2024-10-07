import { Box, Switch, TextField, Typography } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';
import React from 'react';
import CustomSelect from 'src/components/custom-select';

type PeriodSetting = {
    label: string;
    unit: string;
};

type AssignedTeacher = {
    subject: string;
    optionLabel: string;
    optionList: string[];
};

const TimeScheduleManagementSetting = () => {
    const periodSettings: PeriodSetting[] = [
        { label: 'Class Duration (e.g., 45 minutes)', unit: 'Select Unit' },
        { label: 'Break Duration (e.g., 10 minutes)', unit: 'Select Unit' },
        { label: 'School Hours (e.g., 9 AM - 3 PM)', unit: 'Select Unit' },
    ];

    const assigningTeachers: AssignedTeacher[] = [
        { subject: 'Maths', optionLabel: 'List of teachers', optionList: ['Morris', 'Trump', 'Modi'] },
        { subject: 'Science', optionLabel: 'List of teachers', optionList: ['Morris', 'Trump', 'Modi'] },
    ];

    return (
        <Box>
            <Typography variant="h6">General Settings</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Switch />
                <Typography>Enable Notification for Timetable Changes</Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Switch />
                <Typography>Auto-scheduling of classes</Typography>
            </Box>

            <Typography variant="h6">Period Settings</Typography>
            {periodSettings.map((setting, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', width: '350px', py: '10px' }}>
                    <TextField
                        fullWidth
                        name="description"
                        label={setting.label}
                        size="small"
                    />
                    <Box sx={{ width: '16px' }} />
                    <CustomSelect
                        label={setting.unit}
                        options={[]}
                        value=""
                        onChange={() => { }}
                        formControlProps={{ sx: { minWidth: 120 } }}
                    />
                </Box>
            ))}
            <Box width="330px" flexDirection="column" display="flex" sx={{gap: 2, py:"20px"}}>
                <Typography variant="h6">Conflict Resolution Settings</Typography>

                <CustomSelect
                    label="How Should TimeTable Conflicts Be Handled?"
                    options={[]}
                    value=""
                    onChange={() => { }}
                    formControlProps={{ sx: { minWidth: 120 } }}
                />
                <CustomSelect
                    label="Notify Admin"
                    options={[]}
                    value=""
                    onChange={() => { }}
                    formControlProps={{ sx: { minWidth: 120 } }}
                />
            </Box>


            <Typography variant="h6">Teacher and Subject Assignments</Typography>
            {assigningTeachers.map((teacher, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', width: '350px', py: '10px' }}>
                    <TextField
                        fullWidth
                        name="description"
                        label={teacher.subject}
                        size="small"
                    />
                    <Box sx={{ width: '16px' }} />
                    <CustomSelect
                        label={teacher.optionLabel}
                        options={[]}
                        value=""
                        onChange={() => { }}
                        formControlProps={{ sx: { minWidth: 150 } }}
                    />
                </Box>
            ))}

            <Typography variant="h6">Teacher Availability</Typography>
            <Box width="330px" flexDirection="column" display="flex"sx={{ gap: 2 , py:"20px"}} >
                <CustomSelect
                    label="Available Teacher"
                    options={[]}
                    value=""
                    onChange={() => { }}
                    formControlProps={{ sx: { minWidth: 120 } }}
                />

                <DatePicker
                    label="Date"
                    format="DD-MM-YYYY"
                    slotProps={{ textField: { size: 'small' } }}
                />

                <CustomSelect
                    label="Subject"
                    options={[]}
                    value=""
                    onChange={() => { }}
                    formControlProps={{ sx: { minWidth: 120 } }}
                />
            </Box>
        </Box>
    );
};

export default TimeScheduleManagementSetting;
