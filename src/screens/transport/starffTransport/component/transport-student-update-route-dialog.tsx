import { useFormik } from 'formik';
import React, { useState } from 'react';

import { Box, Grid, Radio, Button, TextField, Typography, RadioGroup, FormControl, Autocomplete, DialogActions, FormControlLabel } from '@mui/material';

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
  isStaff: boolean;
  clickFromTable: boolean;
}

interface FormikValue {
  id: number;
  name: string;
  grade: string;
  assignedRoute: string;
  pickupPoint: string;
  dropoffPoint: string;
}

const availableGrades = [
  {
    grade: '1',
    availableStudents: ['Aarav Patel'],
  },
  {
    grade: '2',
    availableStudents: ['Meera Shah'],
  },
  {
    grade: '3',
    availableStudents: ['Rohan Joshi'],
  },
  {
    grade: '9',
    availableStudents: ['Vikram Mehta', 'Rahul Gandhi'],
  },
  {
    grade: '10',
    availableStudents: ['Priya Desai', 'Anjali Verma'],
  },
  {
    grade: '11',
    availableStudents: ['Sanjay Kumar'],
  },
  {
    grade: '12',
    availableStudents: ['Neha Sharma', 'Kavita Desai'],
  },
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

const dropoffPointsList = [
  { value: 'Dindoli', label: 'Dindoli' },
  { value: 'Godadara', label: 'Godadara' },
  { value: 'Mini Bazar', label: 'Mini Bazar' },
  { value: 'Ved', label: 'Ved' },
];

const grades = availableGrades.map((g) => g.grade);

const TransportStudentAndStaffUpdateInfoDialog: React.FC<
  TransportStudentAndStaffUpdateInfoDialogProps
> = ({ dialogValue, data, onSave, onClose, isEdit, allData, isStaff, clickFromTable }) => {
  const [showExistingEntryMessage, setShowExistingEntryMessage] = useState(false);

  const formik = useFormik<FormikValue>({
    initialValues: {
      id: isEdit ? data.id : Math.random(),
      name: isEdit ? (data.name ?? '') : '',
      grade: isEdit ? (data.grade ?? '') : '',
      // position: isEdit ? data.position ?? '' : '',
      assignedRoute: isEdit ? (data.assignedRoute ?? '') : '',
      pickupPoint: isEdit ? (data.pickupPoint ?? '') : '',
      dropoffPoint: isEdit ? (data.dropoffPoint ?? '') : '',
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
  const selectedGradeObj = availableGrades.find((g) => g.grade === formik.values.grade);
  const students = selectedGradeObj ? selectedGradeObj.availableStudents : [];

  const [userType, setUserType] = useState<any>('student');
  return (
    <CustomDialog maxWidth="md" title="Assigned Route" open={dialogValue} handleClose={onClose}>
      <Box>
        {showExistingEntryMessage && (
          <Typography component="span" fontSize="14" color="red">
            This Entry Already Exists
          </Typography>
        )}
      </Box>
      <Scrollbar sx={{ bgcolor: 'background.neutral', p: 3, height: "400px" }}>
        {!clickFromTable && <FormControl>
          {/* <FormLabel id="user-type-label">Select User Type</FormLabel> */}
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
        </FormControl>}

        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2} sx={{ mt: "5px" }}>

            {/* Row 1 */}
            {(userType === 'student' && isStaff === false) && <Grid item xs={6}>
              <CustomSelect
                disabled={isEdit}
                label="Standard"
                options={availableGrades.map((g) => ({ label: g.grade, value: g.grade }))}
                value={formik.values.grade}
                onChange={handleGradeChange}
                formControlProps={{ fullWidth: true }}
              />
            </Grid>}
            {(userType === 'student' && isStaff === false) && <Grid item xs={6}>
              <CustomSelect
                disabled={isEdit}
                label="Division"
                options={availableGrades.map((g) => ({ label: g.grade, value: g.grade }))}
                value={formik.values.grade}
                onChange={handleGradeChange}
                formControlProps={{ fullWidth: true }}
              />
            </Grid>}

            {/* Row 2 */}
            {(userType === 'staff' || isStaff) && <Grid item xs={6}>
              <Autocomplete
                loading={false}
                noOptionsText="No Employee Found"
                fullWidth
                options={[]}
                getOptionLabel={(option: any) => option?.firstName || ''}
                renderInput={(params: any) => (
                  <TextField
                    {...params}
                    size="small"
                    label="Employee Number"
                    placeholder="Search Employee Number"
                    fullWidth
                  />
                )}
                renderOption={(prop: any, option: any) => (
                  <li {...prop} key={option.id}>
                    {option.firstName}
                  </li>
                )}
              />
            </Grid>}
            {(userType === 'student' && isStaff === false) && <Grid item xs={6}>
              <Autocomplete
                loading={false}
                noOptionsText="No Student Found"
                fullWidth
                options={[]}
                getOptionLabel={(option: any) => option?.firstName || ''}
                renderInput={(params: any) => (
                  <TextField
                    {...params}
                    size="small"
                    label="Gr Number"
                    placeholder="Search Gr Number"
                    fullWidth
                  />
                )}
                renderOption={(prop: any, option: any) => (
                  <li {...prop} key={option.id}>
                    {option.firstName}
                  </li>
                )}
              />
            </Grid>}
            <Grid item xs={6}>
              <CustomSelect
                label="Assigned Route"
                options={assignedRoutesList}
                value={formik.values.assignedRoute}
                onChange={(e: any) => formik.setFieldValue('assignedRoute', e)}
                formControlProps={{ fullWidth: true }}
              />
            </Grid>

            {/* Row 3 */}
            <Grid item xs={12}>
              <CustomSelect
                label="Pickup/Dropoff Point"
                options={pickupPointsList}
                value={formik.values.pickupPoint}
                onChange={(e: any) => formik.setFieldValue('pickupPoint', e)}
                formControlProps={{ fullWidth: true }}
              />
            </Grid>
          </Grid>
        </form>


      </Scrollbar>
      <DialogActions>

        <Button type="submit" variant="contained" size="small">
          Save
        </Button>
      </DialogActions>
    </CustomDialog>
  );
};

export default TransportStudentAndStaffUpdateInfoDialog;
