import * as Yup from 'yup';
import { Form, Field, Formik } from 'formik';
import {
  Box,
  Card,
  Grid,
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormHelperText,
} from '@mui/material';

const validationSchema = Yup.object().shape({
  report: Yup.string().required('Report is required'),
  department: Yup.string().required('Department is required'),
  status: Yup.string().required('Status is required'),
  designation: Yup.string().required('Designation is required'),
  employeeType: Yup.string().required('Employee Type is required'),
  employeeGroup: Yup.string().required('Employee Group is required'),
  gender: Yup.string().required('Gender is required'),
});

const initialValues = {
  department: 'all',
  status: 'all',
  designation: 'all',
  employeeType: 'all',
  employeeGroup: 'all',
  gender: 'all',
  report: '',
};

const PayrollReports = () => (
  <Formik
    initialValues={initialValues}
    validationSchema={validationSchema}
    onSubmit={(values, { setSubmitting }) => {
      setTimeout(() => {
        alert(JSON.stringify(values, null, 2));
        setSubmitting(false);
      }, 400);
    }}
  >
    {({ errors, touched, values, handleChange }) => (
      <Card>
        <Form>
          <Box sx={{ p: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Field as={FormControl} error={touched.report && errors.report} fullWidth>
                  <InputLabel size="small">List of reports</InputLabel>
                  <Select
                    name="report"
                    value={values.report}
                    onChange={handleChange}
                    label="List of reports"
                    size="small"
                  >
                    <MenuItem value="employeeContactList">Employee Contact List</MenuItem>
                    <MenuItem value="employeePanNumberList">Employee Pan Number list</MenuItem>
                    <MenuItem value="employeeJoiningLetter">Employee Joining Letter</MenuItem>
                    <MenuItem value="employeeAllDetail">Employee All Detail</MenuItem>
                    <MenuItem value="employeeList">Employee List</MenuItem>
                  </Select>
                  <FormHelperText>{touched.report && errors.report}</FormHelperText>
                </Field>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Field as={FormControl} error={touched.department && errors.department} fullWidth>
                  <InputLabel size="small">Department</InputLabel>
                  <Select
                    name="department"
                    value={values.department}
                    onChange={handleChange}
                    label="Department"
                    size="small"
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="teachers">Teachers</MenuItem>
                    <MenuItem value="activity">Activity</MenuItem>
                  </Select>
                  <FormHelperText>{touched.department && errors.department}</FormHelperText>
                </Field>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Field as={FormControl} error={touched.status && errors.status} fullWidth>
                  <InputLabel size="small">Status</InputLabel>
                  <Select
                    name="status"
                    value={values.status}
                    onChange={handleChange}
                    label="Status"
                    size="small"
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="left">Left</MenuItem>
                    <MenuItem value="suspended">Suspended</MenuItem>
                    <MenuItem value="retired">Retired</MenuItem>
                  </Select>
                  <FormHelperText>{touched.status && errors.status}</FormHelperText>
                </Field>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Field as={FormControl} error={touched.designation && errors.designation} fullWidth>
                  <InputLabel size="small">Designation</InputLabel>
                  <Select
                    name="designation"
                    value={values.designation}
                    onChange={handleChange}
                    label="Designation"
                    size="small"
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                    <MenuItem value="principal">Principal</MenuItem>
                    <MenuItem value="clerk">Clerk</MenuItem>
                    <MenuItem value="director">Director</MenuItem>
                    <MenuItem value="peon">Peon</MenuItem>
                    <MenuItem value="receptionist">Receptionist</MenuItem>
                  </Select>
                  <FormHelperText>{touched.designation && errors.designation}</FormHelperText>
                </Field>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Field
                  as={FormControl}
                  error={touched.employeeType && errors.employeeType}
                  fullWidth
                >
                  <InputLabel size="small">Employee Type</InputLabel>
                  <Select
                    name="employeeType"
                    value={values.employeeType}
                    onChange={handleChange}
                    label="Employee Type"
                    size="small"
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="consultant">Consultant / Advisor</MenuItem>
                    <MenuItem value="probationer">Probationers</MenuItem>
                    <MenuItem value="regular">Regular</MenuItem>
                  </Select>
                  <FormHelperText>{touched.employeeType && errors.employeeType}</FormHelperText>
                </Field>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Field
                  as={FormControl}
                  error={touched.employeeGroup && errors.employeeGroup}
                  fullWidth
                >
                  <InputLabel size="small">Employee Group</InputLabel>
                  <Select
                    name="employeeGroup"
                    value={values.employeeGroup}
                    onChange={handleChange}
                    label="Employee Group"
                    size="small"
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="teaching">Teaching</MenuItem>
                    <MenuItem value="non-teaching">Non Teaching</MenuItem>
                  </Select>
                  <FormHelperText>{touched.employeeGroup && errors.employeeGroup}</FormHelperText>
                </Field>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                <Field as={FormControl} error={touched.gender && errors.gender} fullWidth>
                  <InputLabel size="small">Gender</InputLabel>
                  <Select
                    name="gender"
                    value={values.gender}
                    onChange={handleChange}
                    label="Gender"
                    size="small"
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                  <FormHelperText>{touched.gender && errors.gender}</FormHelperText>
                </Field>
              </Grid>

              <Grid size={{ xs: 12 }} display="flex" justifyContent="flex-end">
                <Button type="submit" variant="contained">
                  Generate Report
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Form>
      </Card>
    )}
  </Formik>
);

export default PayrollReports;
