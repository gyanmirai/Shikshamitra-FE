import { useFormik } from 'formik';
import React, { useState } from 'react';

import { Add } from '@mui/icons-material';
import {
  Grid,
  Radio,
  Button,
  TextField,
  RadioGroup,
  FormControl,
  Autocomplete,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import capitalizeWords from 'src/utils/capitalizeText';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';

import type { ITransportAddNewRequestDialogProps } from '../member-transport-interface';

const availableGrades = [
  { grade: '1', availableStudents: ['Aarav Patel'] },
  { grade: '2', availableStudents: ['Meera Shah'] },
  { grade: '3', availableStudents: ['Rohan Joshi'] },
  { grade: '9', availableStudents: ['Vikram Mehta', 'Rahul Gandhi'] },
  { grade: '10', availableStudents: ['Priya Desai', 'Anjali Verma'] },
  { grade: '11', availableStudents: ['Sanjay Kumar'] },
  { grade: '12', availableStudents: ['Neha Sharma', 'Kavita Desai'] },
];

const TransportAddNewRequestDialog: React.FC<ITransportAddNewRequestDialogProps> = ({
  dialogValue,
  onClose,
  selectedEntry,
}) => {
  const [userType, setUserType] = useState<string>('student');
  const [division, setDivision] = useState<string>('');
  const [grade, setGrade] = useState<string>('');

  const formik = useFormik({
    initialValues: {
      grade: '',
      division: '',
      grNumber: '',
      employeeNumber: '',
      pickupPoint: '',
      addressLine1: '',
      landmark: '',
    },
    onSubmit: (values) => {
      onClose();
    },
  });

  const handleGradeChange = (event: any) => {
    setGrade(event);
    formik.setFieldValue('grade', event);
  };

  const handleDivisionChange = (event: any) => {
    setDivision(event);
    formik.setFieldValue('division', event);
  };

  return (
    <CustomDialog maxWidth="sm" title="Add New Request" open={dialogValue} handleClose={onClose}>
      <Scrollbar sx={{ bgcolor: 'background.neutral', p: 3, height: '400px' }}>
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

        {/* Main Form */}
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            {/* Student - Grade & Division */}
            {userType === 'student' && (
              <>
                <Grid item xs={6}>
                  <CustomSelect
                    label="Standard"
                    options={availableGrades.map((g) => ({ label: g.grade, value: g.grade }))}
                    value={grade}
                    onChange={(e) => {
                      handleGradeChange(e);
                    }}
                    formControlProps={{ fullWidth: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <CustomSelect
                    label="Division"
                    options={availableGrades.map((g) => ({ label: g.grade, value: g.grade }))}
                    value={division}
                    onChange={handleDivisionChange}
                    formControlProps={{ fullWidth: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <Autocomplete
                    loading={false}
                    noOptionsText="No Student Found"
                    options={[]}
                    renderInput={(params) => (
                      <TextField {...params} size="small" label="GR Number" fullWidth />
                    )}
                  />
                </Grid>
              </>
            )}

            {/* Employee Number */}
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

            {/* Address Details */}
            <Grid item xs={12} md={6}>
              <TextField
                name="addressLine1"
                label="Address Line 1"
                value={formik.values.addressLine1}
                onChange={(e) => {
                  formik.setFieldValue('addressLine1', capitalizeWords(e.target.value));
                }}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="landmark"
                label="Landmark"
                value={formik.values.landmark}
                onChange={(e) => {
                  formik.setFieldValue('landmark', capitalizeWords(e.target.value));
                }}
                size="small"
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                name="pickupPoint"
                label="Preferred Pickup/Dropoff Point"
                value={formik.values.pickupPoint}
                onChange={(e) => {
                  formik.setFieldValue('pickupPoint', capitalizeWords(e.target.value));
                }}
                size="small"
                fullWidth
              />
            </Grid>
          </Grid>
        </form>
      </Scrollbar>
      <DialogActions>
        <Button startIcon={<Add />} size="small" variant="contained" type="submit">
          Add To New Request
        </Button>
      </DialogActions>
    </CustomDialog>
  );
};

export default TransportAddNewRequestDialog;
