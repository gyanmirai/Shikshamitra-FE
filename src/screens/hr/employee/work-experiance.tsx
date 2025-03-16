import React from 'react';
import { capitalize } from 'lodash';

import { DatePicker } from '@mui/x-date-pickers';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import { Add, RemoveCircle } from '@mui/icons-material';
import { Box, Button, Divider, TextField, IconButton } from '@mui/material';

const WorkExperiences = (props: any) => {
  const { formik, disabled } = props;
  const { values, setFieldValue } = formik;

  return (
    <Box>
      <Box display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          color="primary"
          size="small"
          startIcon={<Add />}
          disabled={!!disabled}
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
        <Grid key={index} container spacing={1} flexWrap="wrap">
          <Grid xs={1.4375}>
            <TextField
              fullWidth
              size="small"
              name={`experiences.${index}.organizationName`}
              label="Organization Name"
              margin="normal"
              value={experience.organizationName}
              onChange={(event) => {
                const val = capitalize(event.target.value);
                setFieldValue(`experiences.${index}.organizationName`, val);
              }}
              disabled={!!disabled}
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
                const val = capitalize(event.target.value);
                setFieldValue(`experiences.${index}.organizationAddress`, val);
              }}
              disabled={!!disabled}
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
              disabled={!!disabled}
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
              disabled={!!disabled}
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
              disabled={!!disabled}
              onChange={(event) => {
                const val = capitalize(event.target.value);
                setFieldValue(`experiences.${index}.department`, val);
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
              disabled={!!disabled}
              onChange={(event) => {
                const val = capitalize(event.target.value);
                setFieldValue(`experiences.${index}.designation`, val);
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
              disabled={!!disabled}
              onChange={(event) => {
                const val = capitalize(event.target.value);
                setFieldValue(`experiences.${index}.responsibilities`, val);
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
              disabled={!!disabled}
              onChange={(event) => {
                const val = capitalize(event.target.value);
                setFieldValue(`experiences.${index}.references`, val);
              }}
            />
          </Grid>
          <Grid xs={0.5} display="flex" alignItems="center">
            <IconButton
              disabled={!!disabled}
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
