import { useFormik } from 'formik';
import React, { useState } from 'react';

import {
    Box,
    Grid,
    Radio,
    Button,
    TextField,
    Typography,
    RadioGroup,
    FormControl,
    Autocomplete,
    DialogActions,
    FormControlLabel,
} from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';

// Props Interface
interface TransportRouteAssignedDialogProps {
    dialogValue: boolean;
    data: any;
    onSave: (values: any) => void;
    onClose: () => void;
    isEdit: boolean;
    allData: any;
    isStaff: boolean;
    clickFromTable: boolean;
}

// Formik Values Interface
interface FormikValue {
    id: number;
    name: string;
    grade: string;
    assignedRoute: string;
    pickupPoint: string;
    dropoffPoint: string;
}

// Mock Data
const availableGrades = [
    { grade: '1', availableStudents: ['Aarav Patel'] },
    { grade: '2', availableStudents: ['Meera Shah'] },
    { grade: '3', availableStudents: ['Rohan Joshi'] },
    { grade: '9', availableStudents: ['Vikram Mehta', 'Rahul Gandhi'] },
    { grade: '10', availableStudents: ['Priya Desai', 'Anjali Verma'] },
    { grade: '11', availableStudents: ['Sanjay Kumar'] },
    { grade: '12', availableStudents: ['Neha Sharma', 'Kavita Desai'] },
];

const assignedRoutesList = [
    { value: 'R101', label: 'R101' },
    { value: 'R102', label: 'R102' },
    { value: 'R103', label: 'R103' },
    { value: 'R104', label: 'R104' },
];

const pickupPointsList = [
    { value: 'School', label: 'School' },
    { value: 'Dindoli', label: 'Dindoli' },
    { value: 'Godadara', label: 'Godadara' },
    { value: 'Mini Bazar', label: 'Mini Bazar' },
    { value: 'Ved', label: 'Ved' },
];

// Main Component
const TransportRouteAssignedDialog: React.FC<
    TransportRouteAssignedDialogProps
> = ({ dialogValue, data, onSave, onClose, isEdit, allData, isStaff, clickFromTable }) => {
    const [showExistingEntryMessage, setShowExistingEntryMessage] = useState(false);
    const [userType, setUserType] = useState<any>('student');

    // Formik Setup
    const formik = useFormik<FormikValue>({
        initialValues: {
            id: isEdit ? data.id : Math.random(),
            name: isEdit ? data.name ?? '' : '',
            grade: isEdit ? data.grade ?? '' : '',
            assignedRoute: isEdit ? data.assignedRoute ?? '' : '',
            pickupPoint: isEdit ? data.pickupPoint ?? '' : '',
            dropoffPoint: isEdit ? data.dropoffPoint ?? '' : '',
        },
        onSubmit: (values) => {
            onSave(values);
            console.log('Form Submitted', values);
        },
    });

    // Handlers
    const handleGradeChange = (e: any) => {
        formik.setFieldValue('grade', e);
        formik.setFieldValue('name', '');
    };

    const selectedGradeObj = availableGrades.find((g) => g.grade === formik.values.grade);
    const students = selectedGradeObj ? selectedGradeObj.availableStudents : [];

    return (
        <CustomDialog maxWidth="md" title="Assigned Route" open={dialogValue} handleClose={onClose}>
            {/* Error Message */}
            {showExistingEntryMessage && (
                <Box>
                    <Typography component="span" fontSize="14" color="red">
                        This Entry Already Exists
                    </Typography>
                </Box>
            )}

            {/* Scrollable Form */}
            <Scrollbar sx={{ bgcolor: 'background.neutral', p: 3, height: '550px' }}>
                {/* User Type Selector */}
                {!clickFromTable && (
                    <FormControl>
                        <RadioGroup
                            row
                            aria-labelledby="user-type-label"
                            name="userType"
                            value={userType}
                            onChange={(e) => setUserType(e.target.value)}
                        >
                            <FormControlLabel value="staff" control={<Radio />} label="Employee" />
                            <FormControlLabel value="student" control={<Radio />} label="Student" />
                        </RadioGroup>
                    </FormControl>
                )}

                {/* Main Form */}
                <form onSubmit={formik.handleSubmit}>
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        {/* Student - Grade & Division */}
                        {userType === 'student' && !isStaff && (
                            <>
                                <Grid item xs={6}>
                                    <CustomSelect
                                        disabled={isEdit}
                                        label="Standard"
                                        options={availableGrades.map((g) => ({ label: g.grade, value: g.grade }))}
                                        value={formik.values.grade}
                                        onChange={handleGradeChange}
                                        formControlProps={{ fullWidth: true }}
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <CustomSelect
                                        disabled={isEdit}
                                        label="Division"
                                        options={availableGrades.map((g) => ({ label: g.grade, value: g.grade }))}
                                        value={formik.values.grade}
                                        onChange={handleGradeChange}
                                        formControlProps={{ fullWidth: true }}
                                    />
                                </Grid>
                            </>
                        )}

                        {/* Autocomplete for Employee or GR Number */}
                        {userType === 'staff' && (
                            <Grid item xs={6}>
                                <Autocomplete
                                    loading={false}
                                    noOptionsText="No Employee Found"
                                    options={[]}
                                    renderInput={(params) => (
                                        <TextField {...params} size="small" label="Employee Number" fullWidth />
                                    )}
                                />
                            </Grid>
                        )}

                        {userType === 'student' && !isStaff && (
                            <Grid item xs={6}>
                                <Autocomplete
                                    loading={false}
                                    noOptionsText="No Student Found"
                                    options={students}
                                    renderInput={(params) => (
                                        <TextField {...params} size="small" label="GR Number" fullWidth />
                                    )}
                                />
                            </Grid>
                        )}

                        {/* Pickup/Dropoff Points */}
                        <Grid item xs={12} md={6}>
                            <TextField

                                name="Prefrable Pickup/Dropoff Point"
                                label="Prefrable Pickup/Dropoff Point"
                                value=''
                                onChange={() => { }}
                                size="small"
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <CustomSelect
                                label="Assigned Pickup/Dropoff Point"
                                options={pickupPointsList}
                                value={formik.values.pickupPoint}
                                onChange={(e) => formik.setFieldValue('pickupPoint', e)}
                                formControlProps={{ fullWidth: true }}
                            />
                        </Grid>

                        {/* Assigned Route */}
                        <Grid item xs={6}>
                            <CustomSelect
                                label="Assigned Route"
                                options={assignedRoutesList}
                                value={formik.values.assignedRoute}
                                onChange={(e) => formik.setFieldValue('assignedRoute', e)}
                                formControlProps={{ fullWidth: true }}
                            />
                        </Grid>
                        <Grid item xs={6}>
                            <CustomSelect
                                label="Select Vehicle"
                                options={assignedRoutesList}
                                value={formik.values.assignedRoute}
                                onChange={(e: any) => formik.setFieldValue('assignedRoute', e)}
                                formControlProps={{ fullWidth: true }}
                            />
                        </Grid>

                        {/* Reason */}
                        <Grid item xs={6}>
                            <CustomSelect
                                label="Select Reason"
                                options={[
                                    { name: 'Route Not in Service', key: 'route_not_in_service' },
                                    { name: 'Vehicle at Full Capacity', key: 'vehicle_full_capacity' },
                                    { name: 'Stop Not in Service', key: 'stop_not_in_service' },
                                ]}
                                labelKey="name"
                                valueKey="key"
                                value=""
                                onChange={(val) => console.log('val', val)}
                                formControlProps={{ fullWidth: true }}
                            />
                        </Grid>

                        {/* Notes */}
                        <Grid item xs={12}>
                            <TextField
                                multiline
                                rows={3}
                                name="notes"
                                label="Others"
                                value=""
                                size="small"
                                fullWidth
                            />
                        </Grid>

                        <Grid item xs={12} md={12}>
                            <TextField
                                multiline

                                rows={3} name="notified message"
                                label="Message Sent to Student"
                                value=''
                                onChange={() => { }}
                                size="small"
                                fullWidth
                            />


                        </Grid>
                    </Grid>
                </form>
            </Scrollbar>

            {/* Action Buttons */}
            <DialogActions>
                <Button type="submit" variant="contained" size="small">
                    Assigned / Declined
                </Button>
            </DialogActions>
        </CustomDialog>
    );
};

export default TransportRouteAssignedDialog;
