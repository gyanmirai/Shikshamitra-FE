import { capitalize } from 'lodash';
import React, { useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import { useBoolean } from 'src/hooks/use-boolean';
import { Add, RemoveCircle } from '@mui/icons-material';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ShakingTextField from 'src/components/shaking-text-field';
import { Box, Paper, Button, TextField, IconButton } from '@mui/material';
import CityComponent from 'src/components/stardard-address/city-component';
import StateComponent from 'src/components/stardard-address/state-component';
import CountryComponent from 'src/components/stardard-address/country-component';

import { CardActions } from './employee-form-fields/InformationFields';

const WorkExperiences = (props: any) => {
  const deleteExperienceDialog = useBoolean();
  const [selectedExperience, setSelectedExperience] = useState<number | null>();
  const { formik, isMainForm } = props;
  const { values, setFieldValue } = formik;
  const isEditable = useBoolean(isMainForm);
  const handleSave = async (): Promise<void | false | undefined> => {
    const validation = await formik.validateForm();
    await formik?.submitForm?.();
    if (Object.keys(validation).length > 0) return false;

    formik.resetForm({ values: formik.values });
    return undefined;
  };
  const handleCancel = () => {
    formik.resetForm();
  };
  const selectedExperienceData =
    typeof selectedExperience === 'number' ? values.experiences[selectedExperience] : null;
  return (
    <Box>
      {!isMainForm && (
        <Box display="flex" justifyContent="flex-end" p={1}>
          <CardActions
            isLoading={formik.isSubmitting}
            isEdit={isEditable}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </Box>
      )}
      {isEditable.value && (
        <Box display="flex" justifyContent="flex-end" mb={2}>
          <Button
            variant="contained"
            size="small"
            startIcon={<Add />}
            // disabled={!isEditable.value}
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
      )}
      <Box display="flex" flexDirection="column" gap={2}>
        {values.experiences.map((experience: any, index: number) => (
          <Paper
            key={index}
            elevation={3}
            sx={{
              gap: 2,
              display: 'flex',
              alignItems: 'center',
              // position: 'relative',
              p: 2,
            }}
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
                    onChange={(e) => {
                      const { value } = e.target;
                      if (/^[A-Za-z\s]*$/.test(value)) {
                        const formattedValue = value
                          .split(' ')
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                          .join(' ');
                        setFieldValue(`experiences.${index}.organizationName`, formattedValue);
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
                    FormHelperTextProps={{
                      sx: {
                        margin: 0,
                        position: 'static', // ✅ override default absolute
                        // marginTop: '4px',
                        whiteSpace: 'normal',
                      },
                    }}
                    InputLabelProps={{ sx: { lineHeight: '1.2em' } }}
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
                    onChange={(e) => {
                      const value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                      setFieldValue(`experiences.${index}.designation`, value);
                    }}
                    error={
                      formik?.touched?.experiences?.[index]?.designation &&
                      formik?.errors?.experiences?.[index]?.designation
                    }
                    helperText={
                      formik?.touched?.experiences?.[index]?.designation &&
                      formik?.errors?.experiences?.[index]?.designation
                    }
                    FormHelperTextProps={{
                      sx: {
                        margin: 0,
                        position: 'static', // ✅ override default absolute
                        // marginTop: '4px',
                        whiteSpace: 'normal',
                      },
                    }}
                    InputLabelProps={{ sx: { lineHeight: '1.2em' } }}
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
                  FormHelperTextProps={{
                    sx: {
                      margin: 0,
                      position: 'static', // ✅ override default absolute
                      // marginTop: '4px',
                      whiteSpace: 'normal',
                    },
                  }}
                  InputLabelProps={{ sx: { lineHeight: '1.2em' } }}
                />
              </Box>

              <Box sx={{ width: '200px' }}>
                <CountryComponent
                  value={experience.organizationCountry}
                  onChange={(e, value) => {
                    setFieldValue(`experiences.${index}.organizationCountry`, value);
                  }}
                  disabled={!isEditable.value}
                  textFieldProps={{ label: 'Country' }}
                  FormHelperTextProps={{
                    sx: {
                      margin: 0,
                      position: 'static', // ✅ override default absolute
                      // marginTop: '4px',
                      whiteSpace: 'normal',
                    },
                  }}
                  InputLabelProps={{ sx: { lineHeight: '1.2em' } }}
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
                  textFieldProps={{ label: 'State' }}
                  FormHelperTextProps={{
                    sx: {
                      margin: 0,
                      position: 'static', // ✅ override default absolute
                      // marginTop: '4px',
                      whiteSpace: 'normal',
                    },
                  }}
                  InputLabelProps={{ sx: { lineHeight: '1.2em' } }}
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
                  textFieldProps={{ label: 'City' }}
                  FormHelperTextProps={{
                    sx: {
                      margin: 0,
                      position: 'static', // ✅ override default absolute
                      // marginTop: '4px',
                      whiteSpace: 'normal',
                    },
                  }}
                  InputLabelProps={{ sx: { lineHeight: '1.2em' } }}
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
                    disableFuture
                    format="DD-MM-YYYY"
                    value={experience.fromDate}
                    onChange={(date) => {
                      setFieldValue(`experiences.${index}.fromDate`, date);
                    }}
                    disabled={!isEditable.value}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        error:
                          !!(
                            formik?.touched?.experiences?.[index]?.fromDate &&
                            formik?.errors?.experiences?.[index]?.fromDate
                          ) || false,
                        helperText:
                          (formik?.touched?.experiences?.[index]?.fromDate &&
                            formik?.errors?.experiences?.[index]?.fromDate) ||
                          '',
                        FormHelperTextProps: {
                          sx: {
                            margin: 0,
                            position: 'static', // ✅ override default absolute
                            // marginTop: '4px',
                            whiteSpace: 'normal',
                          },
                        },
                        InputLabelProps: { sx: { lineHeight: '1.2em' } },
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
                    label="End Date *"
                    name={`experiences.${index}.toDate`}
                    format="DD-MM-YYYY"
                    disableFuture
                    value={experience.toDate}
                    onChange={(date) => {
                      setFieldValue(`experiences.${index}.toDate`, date);
                    }}
                    disabled={!isEditable.value}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        error:
                          !!(
                            formik?.touched?.experiences?.[index]?.toDate &&
                            formik?.errors?.experiences?.[index]?.toDate
                          ) || false,
                        helperText:
                          (formik?.touched?.experiences?.[index]?.toDate &&
                            formik?.errors?.experiences?.[index]?.toDate) ||
                          '',
                        FormHelperTextProps: {
                          sx: {
                            margin: 0,
                            position: 'static', // ✅ override default absolute
                            // marginTop: '4px',
                            whiteSpace: 'normal',
                          },
                        },
                        InputLabelProps: { sx: { lineHeight: '1.2em' } },
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
                  deleteExperienceDialog.onTrue();
                  setSelectedExperience(index);
                }}
              >
                <RemoveCircle sx={{ color: 'error.main' }} />
              </IconButton>
            </Box>
          </Paper>
        ))}
      </Box>
      <ConfirmDialog
        open={deleteExperienceDialog.value}
        onClose={() => {
          setSelectedExperience(null);
          deleteExperienceDialog.onFalse();
        }}
        title="Delete"
        content={
          <>
            Are you sure you want to delete{' '}
            <strong>
              {selectedExperienceData?.organizationName
                ? selectedExperienceData.organizationName
                : 'this organization '}
            </strong>{' '}
            experience ?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            size="small"
            onClick={() => {
              deleteExperienceDialog.onFalse();
              setFieldValue(
                'experiences',
                values.experiences.filter((_e: any, i: number) => i !== selectedExperience)
              );
              setSelectedExperience(null);
            }}
          >
            Yes
          </Button>
        }
      />
    </Box>
  );
};

export default WorkExperiences;
