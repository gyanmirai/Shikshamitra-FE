import React from 'react';
import { capitalize } from 'lodash';

import { DatePicker } from '@mui/x-date-pickers';
import { Add, RemoveCircle } from '@mui/icons-material';
import { Box, Paper, Button, TextField, IconButton } from '@mui/material';

import CityComponent from 'src/components/stardard-address/city-component';
import StateComponent from 'src/components/stardard-address/state-component';
import CountryComponent from 'src/components/stardard-address/country-component';

const WorkExperiences = (props: any) => {
  const { formik, disabled } = props;
  const { values, setFieldValue } = formik;

  return (
    <Box>
      <Box display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          size="small"
          startIcon={<Add />}
          disabled={!!disabled}
          onClick={() => {
            setFieldValue('experiences', [
              ...values.experiences,
              {
                organizationName: '',
                organizationAddress: '',
                organizationCountry: { name: 'India', isoCode: 'IN' },
                organizationState: { name: '', isoCode: '' },
                organizationCity: { name: '' },
                fromDate: null,
                toDate: null,
                department: '',
                designation: '',
              },
            ]);
          }}
        >
          Experience
        </Button>
      </Box>
      {values.experiences.map((experience: any, index: number) => (
        <Paper
          key={index}
          elevation={3}
          sx={{ display: 'flex', gap: 1, alignItems: 'center', position: 'relative', my: 2, p: 2 }}
        >
          <Box
            sx={{
              height: '24px',
              minWidth: '24px',
              borderRadius: '50%',
              background: (theme) => theme.palette.primary.main,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
            }}
          >
            {index + 1}
          </Box>

          <Box sx={{ display: 'flex', flexGrow: 1, flexWrap: 'wrap', gap: 3 }}>
            <Box sx={{ width: '200px' }}>
              <TextField
                fullWidth
                size="small"
                name={`experiences.${index}.organizationName`}
                label="Organization Name"
                value={experience.organizationName}
                onChange={(event) => {
                  const val = capitalize(event.target.value);
                  setFieldValue(`experiences.${index}.organizationName`, val);
                }}
                disabled={!!disabled}
              />
            </Box>
            <Box sx={{ width: '200px' }}>
              <TextField
                fullWidth
                size="small"
                name={`experiences.${index}.department`}
                label="Department"
                value={experience.department}
                disabled={!!disabled}
                onChange={(event) => {
                  const val = capitalize(event.target.value);
                  setFieldValue(`experiences.${index}.department`, val);
                }}
              />
            </Box>
            <Box sx={{ width: '200px' }}>
              <TextField
                fullWidth
                size="small"
                name={`experiences.${index}.designation`}
                label="Designation"
                value={experience.designation}
                disabled={!!disabled}
                onChange={(event) => {
                  const val = capitalize(event.target.value);
                  setFieldValue(`experiences.${index}.designation`, val);
                }}
              />
            </Box>
            <Box sx={{ width: '200px' }}>
              <CountryComponent
                value={experience.organizationCountry}
                onChange={(e, value) => {
                  setFieldValue(`experiences.${index}.organizationCountry`, value);
                }}
                disabled={!!disabled}
                textFieldProps={{
                  label: 'Country',
                }}
              />
            </Box>
            <Box sx={{ width: '200px' }}>
              <StateComponent
                value={experience.organizationState}
                onChange={(e, value) => {
                  setFieldValue(`experiences.${index}.organizationState`, value);
                  setFieldValue(`experiences.${index}.organizationCity`, { name: '' });
                }}
                disabled={!!disabled || !experience.organizationCountry}
                countryValue={experience.organizationCountry}
                textFieldProps={{
                  label: 'State',
                }}
              />
              {/* <TextField
                fullWidth
                size="small"
                name={`experiences.${index}.organizationState`}
                label="Organization State"
                value={experience.organizationState}
                onChange={(event) => {
                  const val = capitalize(event.target.value);
                  setFieldValue(`experiences.${index}.organizationState`, val);
                }}
                disabled={!!disabled}
              /> */}
            </Box>
            <Box sx={{ width: '200px' }}>
              <CityComponent
                value={experience.organizationCity}
                onChange={(e, value) => {
                  setFieldValue(`experiences.${index}.organizationCity`, value);
                }}
                disabled={!!disabled || !experience.organizationState}
                stateValue={experience.organizationState}
                textFieldProps={{
                  label: 'City',
                }}
              />
              {/* <TextField
                fullWidth
                size="small"
                name={`experiences.${index}.organizationCity`}
                label="Organization City"
                value={experience.organizationCity}
                onChange={(event) => {
                  const val = capitalize(event.target.value);
                  setFieldValue(`experiences.${index}.organizationCity`, val);
                }}
                disabled={!!disabled}
              /> */}
            </Box>
            <Box sx={{ width: '200px' }}>
              <DatePicker
                label="From Date"
                name={`experiences.${index}.fromDate`}
                format="DD/MM/YYYY"
                value={experience.fromDate}
                onChange={(date) => {
                  setFieldValue(`experiences.${index}.fromDate`, date);
                }}
                disabled={!!disabled}
                slotProps={{
                  textField: {
                    size: 'small',

                    fullWidth: true,
                  },
                }}
              />
            </Box>
            <Box sx={{ width: '200px' }}>
              <DatePicker
                label="To Date"
                name={`experiences.${index}.toDate`}
                format="DD/MM/YYYY"
                value={experience.toDate}
                onChange={(date) => {
                  setFieldValue(`experiences.${index}.toDate`, date);
                }}
                disabled={!!disabled}
                slotProps={{
                  textField: {
                    size: 'small',

                    fullWidth: true,
                  },
                }}
              />
            </Box>
          </Box>
          <Box sx={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)' }}>
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
          </Box>
        </Paper>
      ))}
    </Box>
  );
};

export default WorkExperiences;
