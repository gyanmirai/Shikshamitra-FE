import React from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import { Add, RemoveCircle } from '@mui/icons-material';
import { Box, Button, Divider, TextField, IconButton } from '@mui/material';

const WorkExperiences = (props: any) => {
  const { formik } = props;
  const { values, setFieldValue } = formik;

  return (
    <Box>
      <Box display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          color="primary"
          size="small"
          startIcon={<Add />}
          onClick={() => {
            setFieldValue('experiences', [
              ...values.experiences,
              {
                organizationName: '',
                organizationAddress: '',
                fromDate: null,
                toDate: null,
                department: '',
                designation: '',
                responsibilities: '',
                references: '',
              },
            ]);
          }}
        >
          Add
        </Button>
      </Box>
      {values.experiences.map((experience: any, index: number) => (
        <Grid key={index} container spacing={1}>
          <Grid xs={1.4375}>
            <TextField
              fullWidth
              size="small"
              name={`experiences.${index}.organizationName`}
              label="Organization Name"
              margin="normal"
              value={experience.organizationName}
              onChange={(event) => {
                setFieldValue(`experiences.${index}.organizationName`, event.target.value);
              }}
            />
          </Grid>
          <Grid xs={1.4375}>
            <TextField
              fullWidth
              size="small"
              name={`experiences.${index}.organizationAddress`}
              label="Organization Address"
              margin="normal"
              value={experience.organizationAddress}
              onChange={(event) => {
                setFieldValue(`experiences.${index}.organizationAddress`, event.target.value);
              }}
            />
          </Grid>
          <Grid xs={1.4375}>
            <DatePicker
              label="From Date"
              name={`experiences.${index}.fromDate`}
              value={experience.fromDate}
              onChange={(date) => {
                setFieldValue(`experiences.${index}.fromDate`, date);
              }}
              slotProps={{
                textField: {
                  size: 'small',
                  margin: 'normal',
                  fullWidth: true,
                },
              }}
            />
          </Grid>
          <Grid xs={1.4375}>
            <DatePicker
              label="To Date"
              name={`experiences.${index}.toDate`}
              value={experience.toDate}
              onChange={(date) => {
                setFieldValue(`experiences.${index}.toDate`, date);
              }}
              slotProps={{
                textField: {
                  size: 'small',
                  margin: 'normal',
                  fullWidth: true,
                },
              }}
            />
          </Grid>
          <Grid xs={1.4375}>
            <TextField
              fullWidth
              size="small"
              name={`experiences.${index}.department`}
              label="Department"
              margin="normal"
              value={experience.department}
              onChange={(event) => {
                setFieldValue(`experiences.${index}.department`, event.target.value);
              }}
            />
          </Grid>
          <Grid xs={1.4375}>
            <TextField
              fullWidth
              size="small"
              name={`experiences.${index}.designation`}
              label="Designation"
              margin="normal"
              value={experience.designation}
              onChange={(event) => {
                setFieldValue(`experiences.${index}.designation`, event.target.value);
              }}
            />
          </Grid>
          <Grid xs={1.4375}>
            <TextField
              fullWidth
              name={`experiences.${index}.responsibilities`}
              label="Responsibilities"
              size="small"
              margin="normal"
              value={experience.responsibilities}
              onChange={(event) => {
                setFieldValue(`experiences.${index}.responsibilities`, event.target.value);
              }}
            />
          </Grid>
          <Grid xs={1.4375}>
            <TextField
              fullWidth
              name={`experiences.${index}.references`}
              label="References"
              margin="normal"
              size="small"
              value={experience.references}
              onChange={(event) => {
                setFieldValue(`experiences.${index}.references`, event.target.value);
              }}
            />
          </Grid>
          <Grid xs={0.5} display="flex" alignItems="center">
            <IconButton
              onClick={() => {
                setFieldValue(
                  'experiences',
                  values.experiences.filter((_e: any, i: number) => i !== index)
                );
              }}
            >
              <RemoveCircle sx={{ color: 'error.main' }} />
            </IconButton>
          </Grid>
          {/* <Grid xs={1.2}></Grid> */}
          <Divider />
        </Grid>
      ))}
    </Box>
  );
};

export default WorkExperiences;
