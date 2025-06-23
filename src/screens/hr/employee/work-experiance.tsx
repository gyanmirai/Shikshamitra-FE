import React from 'react';
import dayjs from 'dayjs';
import { capitalize } from 'lodash';

import { DatePicker } from '@mui/x-date-pickers';
import { Add, RemoveCircle } from '@mui/icons-material';
import { Box, Paper, Button, TextField, IconButton } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import ShakingTextField from 'src/components/shaking-text-field';
import CityComponent from 'src/components/stardard-address/city-component';
import StateComponent from 'src/components/stardard-address/state-component';
import CountryComponent from 'src/components/stardard-address/country-component';

import { CardActions } from './employee-form-fields/InformationFields';

const WorkExperiences = (props: any) => {
  const { formik, isMainForm, editData } = props;
  const { values, setFieldValue } = formik;
  const isEditable = useBoolean(isMainForm);
  const handleSave = () => {
    formik.submitForm();
  };
  const handleCancel = () => {
    formik.setFieldValue(
      'experiences',
      editData
        ? editData.workExperiences.map((i: any) => ({
            ...i,
            fromDate: i?.fromDate ? dayjs(i.fromDate, 'YYYY-MM-DD') : null,
            toDate: i?.toDate ? dayjs(i.toDate, 'YYYY-MM-DD') : null,
          }))
        : []
    );
  };
  return (
    <Box>
      {!isMainForm && (
        <Box display="flex" justifyContent="flex-end" p={1}>
          <CardActions isEdit={isEditable} onSave={handleSave} onCancel={handleCancel} />
        </Box>
      )}
      <Box display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          size="small"
          startIcon={<Add />}
          disabled={!isEditable.value}
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
              <ShakingTextField
                error={
                  formik?.touched?.experiences?.[index] && formik?.errors?.experiences?.[index]
                }
              >
                <TextField
                  fullWidth
                  size="small"
                  name={`experiences.${index}.organizationName`}
                  label="Organization Name *"
                  value={experience.organizationName}
                  onChange={(event) => {
                    const val = capitalize(event.target.value);
                    if (/^[A-Za-z ]*$/.test(val)) {
                      setFieldValue(`experiences.${index}.organizationName`, val);
                    }
                  }}
                  error={
                    formik?.touched?.experiences?.[index]?.organizationName &&
                    formik?.errors?.experiences?.[index]?.organizationName
                  }
                  helperText={
                    formik?.touched?.experiences?.[index]?.organizationName &&
                    formik?.errors?.experiences?.[index]?.organizationName
                  }
                  disabled={!isEditable.value}
                />
              </ShakingTextField>
            </Box>
            <Box sx={{ width: '200px' }}>
              <ShakingTextField
                error={
                  formik?.touched?.experiences?.[index]?.designation &&
                  formik?.errors?.experiences?.[index]?.designation
                }
              >
                <TextField
                  fullWidth
                  size="small"
                  name={`experiences.${index}.designation`}
                  label="Designation *"
                  value={experience.designation}
                  disabled={!isEditable.value}
                  onChange={(event) => {
                    const val = capitalize(event.target.value);
                    if (/^[A-Za-z ]*$/.test(val)) {
                      setFieldValue(`experiences.${index}.designation`, val);
                    }
                  }}
                  error={
                    formik?.touched?.experiences?.[index]?.designation &&
                    formik?.errors?.experiences?.[index]?.designation
                  }
                  helperText={
                    formik?.touched?.experiences?.[index]?.designation &&
                    formik?.errors?.experiences?.[index]?.designation
                  }
                />
              </ShakingTextField>
            </Box>
            <Box sx={{ width: '200px' }}>
              <TextField
                fullWidth
                size="small"
                name={`experiences.${index}.department`}
                label="Department"
                value={experience.department}
                disabled={!isEditable.value}
                onChange={(event) => {
                  const val = capitalize(event.target.value);
                  if (/^[A-Za-z ]*$/.test(val)) {
                    setFieldValue(`experiences.${index}.department`, val);
                  }
                }}
              />
            </Box>

            <Box sx={{ width: '200px' }}>
              <CountryComponent
                value={experience.organizationCountry}
                onChange={(e, value) => {
                  setFieldValue(`experiences.${index}.organizationCountry`, value);
                }}
                disabled={!isEditable.value}
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
                disabled={!isEditable.value || !experience.organizationCountry}
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
                disabled={!isEditable.value}
              /> */}
            </Box>
            <Box sx={{ width: '200px' }}>
              <CityComponent
                value={experience.organizationCity}
                onChange={(e, value) => {
                  setFieldValue(`experiences.${index}.organizationCity`, value);
                }}
                disabled={!isEditable.value || !experience.organizationState}
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
                disabled={!isEditable.value}
              /> */}
            </Box>
            <Box sx={{ width: '200px' }}>
              <ShakingTextField
                error={
                  formik?.touched?.experiences?.[index]?.fromDate &&
                  formik?.errors?.experiences?.[index]?.fromDate
                }
              >
                <DatePicker
                  label="Start Date *"
                  name={`experiences.${index}.fromDate`}
                  format="DD-MM-YYYY"
                  value={experience.fromDate}
                  onChange={(date) => {
                    setFieldValue(`experiences.${index}.fromDate`, date);
                  }}
                  disabled={!isEditable.value}
                  slotProps={{
                    textField: {
                      size: 'small',
                      error:
                        formik?.touched?.experiences?.[index]?.fromDate &&
                        formik?.errors?.experiences?.[index]?.fromDate,
                      helperText:
                        formik?.touched?.experiences?.[index]?.fromDate &&
                        formik?.errors?.experiences?.[index]?.fromDate,
                      fullWidth: true,
                    },
                  }}
                />
              </ShakingTextField>
            </Box>
            <Box sx={{ width: '200px' }}>
              <ShakingTextField
                error={
                  formik?.touched?.experiences?.[index]?.toDate &&
                  formik?.errors?.experiences?.[index]?.toDate
                }
              >
                <DatePicker
                  label="End Date"
                  name={`experiences.${index}.toDate`}
                  format="DD-MM-YYYY"
                  value={experience.toDate}
                  onChange={(date) => {
                    setFieldValue(`experiences.${index}.toDate`, date);
                  }}
                  disabled={!isEditable.value}
                  slotProps={{
                    textField: {
                      size: 'small',
                      error:
                        formik?.touched?.experiences?.[index]?.toDate &&
                        formik?.errors?.experiences?.[index]?.toDate,
                      helperText:
                        formik?.touched?.experiences?.[index]?.toDate &&
                        formik?.errors?.experiences?.[index]?.toDate,
                      fullWidth: true,
                    },
                  }}
                />
              </ShakingTextField>
            </Box>
          </Box>
          <Box>
            <IconButton
              disabled={!isEditable.value}
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
