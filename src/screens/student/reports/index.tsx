'use client';

import type { RootState } from 'src/redux/store';
import type { Medium, Division, Standards, Organization } from 'src/types/school';

import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';

import { Box, Grid, Card, Select, Button, MenuItem, InputLabel, FormControl } from '@mui/material';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useLazyGetBoardByIdQuery } from 'src/redux/board/boardApi';

import CustomSelect from 'src/components/custom-select';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

// const validationSchema = Yup.object().shape({
//   report: Yup.string().required('Report is required'),
//   department: Yup.string().required('Department is required'),
//   status: Yup.string().required('Status is required'),
//   designation: Yup.string().required('Designation is required'),
//   employeeType: Yup.string().required('Employee Type is required'),
//   employeeGroup: Yup.string().required('Employee Group is required'),
//   gender: Yup.string().required('Gender is required'),
// });

const initialValues = {
  report: '',
  department: '',
  status: '',
  medium: '',
  organization: '',
  classes: '',
  division: '',
};

const StudentReportsScreen = () => {
  const [allMediums, setAllMediums] = useState<Medium[]>([]);
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [allClass, setAllClass] = useState<Standards[]>([]);
  const [allDivision, setAllDivision] = useState<Division[]>([]);
  const { currentBoard } = useSelector((state: RootState) => state.globalState);
  const [getBoard, { data: boardData }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetBoardByIdQuery,
  });

  const { errors, touched, values, handleChange, setFieldValue, handleSubmit } = useFormik({
    initialValues,
    // validationSchema,
    onSubmit: (val: any, { setSubmitting }) => {
      setTimeout(() => {
        alert(JSON.stringify(val, null, 2));
        setSubmitting(false);
      }, 400);
    },
  });

  const { medium, organization, classes, division } = values;

  useEffect(() => {
    if (currentBoard?.id) {
      if (boardData) {
        setAllMediums(boardData?.educationMediums || []);
      } else {
        getBoard(currentBoard.id);
      }
    } else {
      setAllMediums([]);
    }
  }, [boardData, currentBoard?.id, getBoard]);

  useEffect(() => {
    setAllMediums(boardData?.educationMediums || []);
  }, [boardData]);

  useEffect(() => {
    setAllOrganization(
      allMediums.find((med: any) => med?.id === medium)?.educationMediumStages || []
    );
  }, [medium, allMediums]);

  useEffect(() => {
    setAllClass(allOrganization.find((org: any) => org?.id === organization)?.standards || []);
  }, [organization, allOrganization]);
  useEffect(() => {
    setAllDivision(allClass.find((org: any) => org?.id === classes)?.divisions || []);
  }, [allClass, classes]);

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Reports"
        links={[{ name: 'Student' }, { name: 'Student Enrollment' }, { name: 'Reports' }]}
        sx={{ px: 1, mb: 2 }}
      />
      <Card>
        <form onSubmit={handleSubmit}>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl
                  // sx={{ maxWidth: 'unset', width: '100%' }}
                  error={touched.report && !!errors.report}
                  fullWidth
                >
                  <InputLabel size="small">List of reports</InputLabel>
                  <Select
                    name="report"
                    value={values.report}
                    onChange={handleChange}
                    label="List of reports"
                    size="small"
                  >
                    <MenuItem value="addressList">Address List</MenuItem>
                    <MenuItem value="birthdayReport">Birthday Report</MenuItem>
                    <MenuItem value="leftStudentList">Left Student List</MenuItem>
                    <MenuItem value="newStudentAdmissionReport">
                      New Student Admission Report
                    </MenuItem>
                    <MenuItem value="studentDetailInformationForm">
                      Student Detail Information Form
                    </MenuItem>
                    <MenuItem value="studentList">Student List</MenuItem>
                    <MenuItem value="studentListDivisionWise">Student List-Division Wise</MenuItem>
                    <MenuItem value="studentListSerialNo">Student List-Serial No</MenuItem>
                    <MenuItem value="studentListIDNoWise">Student List-ID No Wise</MenuItem>
                    <MenuItem value="studentRegister">Student Register</MenuItem>
                    <MenuItem value="studentRegisterWithAddress">
                      Student Register With Address
                    </MenuItem>
                    <MenuItem value="admissionCategorywiseList">
                      Admission Categorywise List
                    </MenuItem>
                    <MenuItem value="agewiseList">Agewise List</MenuItem>
                    <MenuItem value="ageWiseSummary">Age Wise Summary</MenuItem>
                    <MenuItem value="casteCategoryWiseSummary">
                      Caste Category wise Summary
                    </MenuItem>
                    <MenuItem value="feesCategorywiseSummary">Fees Categorywise Summary</MenuItem>
                    <MenuItem value="genderwiseList">Genderwise List</MenuItem>
                    <MenuItem value="genderwiseStudentStrengthSummary">
                      Genderwise Student Strength Summary
                    </MenuItem>
                    <MenuItem value="genderwiseSummary">Genderwise Summary</MenuItem>
                    <MenuItem value="religionwiseList">Religionwise List</MenuItem>
                    <MenuItem value="studentStrengthDivisionStatusWiseSummary">
                      Student Strength Division Status Wise Summary
                    </MenuItem>
                    <MenuItem value="studentStrengthDivisionWiseSummary">
                      Student Strength DivisionWise Summary
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <CustomSelect
                  options={allMediums}
                  label="Medium"
                  value={medium}
                  onChange={(val) => {
                    setFieldValue('medium', val);
                  }}
                  labelKey="name"
                  valueKey="id"
                  formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <CustomSelect
                  options={allOrganization}
                  label="Organization"
                  value={organization}
                  onChange={(val) => setFieldValue('organization', val)}
                  labelKey="name"
                  valueKey="id"
                  formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                  disabled={!medium}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <CustomSelect
                  options={allClass}
                  label="Class"
                  value={classes}
                  onChange={(val) => setFieldValue('classes', val)}
                  labelKey="name"
                  valueKey="id"
                  formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                  disabled={!organization}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <CustomSelect
                  options={allDivision}
                  label="Division"
                  value={division}
                  onChange={(val) => setFieldValue('division', val)}
                  labelKey="name"
                  valueKey="id"
                  formControlProps={{ sx: { maxWidth: 'unset', width: '100%' } }}
                  disabled={!classes}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <FormControl
                  sx={{ maxWidth: 'unset', width: '100%' }}
                  error={touched.status && !!errors.status}
                  fullWidth
                >
                  <InputLabel size="small">Status</InputLabel>
                  <Select
                    name="status"
                    value={values.status}
                    onChange={handleChange}
                    label="Status"
                    size="small"
                  >
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="left">Left</MenuItem>
                    <MenuItem value="suspended">Suspended</MenuItem>
                    <MenuItem value="retired">Retired</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} justifyContent="flex-end" display="flex">
                <Button type="submit" variant="contained">
                  Generate Report
                </Button>
              </Grid>
            </Grid>
          </Box>
        </form>
      </Card>
    </Box>
  );
};

export default StudentReportsScreen;
