import { useFormik } from 'formik';
import React, { useState } from 'react';

import { Box, Button, TextField, Typography, DialogActions } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';

interface TransportStudentAndStaffUpdateInfoDialogProps {
    dialogValue: boolean;
    data: any;
    onSave: (values: any) => void;
    onClose: () => void;
    isEdit: boolean;
    allData: any;
    isStaff:boolean; 
}

interface FormikValue {
    id:number;
    name: string;
    grade: string;
    assignedRoute: string;
    pickupPoint: string;
    dropoffPoint: string;
    
}

const availableGrades = [
    {
        grade: "1",
        availableStudents: ["Aarav Patel"], 
    },
    {
        grade: "2",
        availableStudents: ["Meera Shah"], 
    },
    {
        grade: "3",
        availableStudents: ["Rohan Joshi"], 
    },
    {
        grade: "9",
        availableStudents: ["Vikram Mehta", "Rahul Gandhi"], 
    },
    {
        grade: "10",
        availableStudents: ["Priya Desai", "Anjali Verma"], 
    },
    {
        grade: "11",
        availableStudents: ["Sanjay Kumar"], 
    },
    {
        grade: "12",
        availableStudents: ["Neha Sharma", "Kavita Desai"], 
    },
];

const assignedRoutesList = [
    { value: "R101", label: "R101" },
    { value: "R102", label: "R102" },
    { value: "R103", label: "R103" },
    { value: "R104", label: "R104" },
];

const pickupPointsList = [
    { value: "School", label: "School" },
    { value: "Dindoli", label: "Dindoli" },
    { value: "Godadara", label: "Godadara" },
    { value: "Mini Bazar", label: "Mini Bazar" },
    { value: "Ved", label: "Ved" },
];

const dropoffPointsList = [
    { value: "Dindoli", label: "Dindoli" },
    { value: "Godadara", label: "Godadara" },
    { value: "Mini Bazar", label: "Mini Bazar" },
    { value: "Ved", label: "Ved" },
];

const grades = availableGrades.map(g => g.grade)



const TransportStudentAndStaffUpdateInfoDialog: React.FC<TransportStudentAndStaffUpdateInfoDialogProps> = ({ dialogValue, data, onSave, onClose, isEdit, allData, isStaff }) => {
    const [showExistingEntryMessage, setShowExistingEntryMessage] = useState(false);

    const formik = useFormik<FormikValue>({
        initialValues: {
            id: isEdit ? data.id :Math.random(),
            name: isEdit ? data.name ?? '' : '',
            grade: isEdit ? data.grade ?? '' : '',
            // position: isEdit ? data.position ?? '' : '',
            assignedRoute: isEdit ? data.assignedRoute ?? '' : '',
            pickupPoint: isEdit ? data.pickupPoint ?? '' : '',
            dropoffPoint: isEdit ? data.dropoffPoint ?? '' : '',
        },
        onSubmit: (values) => {
            // const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, '').trim();

            // const existingEntryIndex = allData.findIndex((val: any) => normalize(val.name) === normalize(values.name));
            // if (!isEdit) {
            //     if (existingEntryIndex === -1) {
            //         setShowExistingEntryMessage(false);
            //         onSave(values);
            //     } else {
            //         setShowExistingEntryMessage(true);
            //     }
            // } else {
            //     onSave(values);
            // }
            onSave(values);
            console.log('Form Submitted', values);
        },
    });

    const handleGradeChange = (e: any) => {
        const selectedGrade = e;
        formik.setFieldValue('grade', selectedGrade);
        formik.setFieldValue('name', ''); 
    };
    const selectedGradeObj = availableGrades.find(g => g.grade === formik.values.grade);
    const students = selectedGradeObj ? selectedGradeObj.availableStudents : [];

    return (
        <CustomDialog
            title="Assigned Route"
            open={dialogValue}
            handleClose={onClose}
        >
            <Box px="20px">
                {showExistingEntryMessage && (
                    <Typography component="span" fontSize="14" color="red">
                        This Entry Already Exists
                    </Typography>
                )}
            </Box>
            <Scrollbar>
                <Box px="15px">
                    <form onSubmit={formik.handleSubmit}>
                        <Box pt="10px" display="flex" flexDirection="column" gap={3}>
                        <CustomSelect
                        disabled={isEdit}
                                label="Grade"
                                options={availableGrades.map(g => ({ label: g.grade, value: g.grade }))}
                                value={formik.values.grade}
                                onChange={handleGradeChange}
                                formControlProps={{ sx: { minWidth: 120 } }}
                            />
                            <CustomSelect
                              disabled={isEdit}
                                label="Name"
                                options={students.map(student => ({ label: student, value: student }))}
                                value={formik.values.name}
                                onChange={(e: any) => formik.setFieldValue('name', e)}
                                formControlProps={{ sx: { minWidth: 120 } }}
                            />
                            {/* <TextField
                                name="position"
                                label="Position"
                                value={formik.values.position}
                                onChange={formik.handleChange}
                                size="small"
                            /> */}
                            <CustomSelect
                                label="Assigned Route"
                                options={assignedRoutesList}
                                value={formik.values.assignedRoute}
                                onChange={(e: any) => formik.setFieldValue('assignedRoute', e)}
                                formControlProps={{ sx: { minWidth: 120 } }}
                            />
                            <CustomSelect
                                label="Pickup Point"
                                options={pickupPointsList}
                                value={formik.values.pickupPoint}
                                onChange={(e: any) => formik.setFieldValue('pickupPoint', e)}
                                formControlProps={{ sx: { minWidth: 120 } }}
                            />
                            <CustomSelect
                                label="Dropoff Point"
                                options={dropoffPointsList}
                                value={formik.values.dropoffPoint}
                                onChange={(e: any) => formik.setFieldValue('dropoffPoint', e)}
                                formControlProps={{ sx: { minWidth: 120 } }}
                            />
                        </Box>
                        <DialogActions>
                            <Button onClick={onClose} variant="contained" size="small">
                                Cancel
                            </Button>
                            <Button type="submit" variant="contained" size="small">
                                Save
                            </Button>
                        </DialogActions>
                    </form>
                </Box>
            </Scrollbar>
        </CustomDialog>
    );
}

export default TransportStudentAndStaffUpdateInfoDialog;
