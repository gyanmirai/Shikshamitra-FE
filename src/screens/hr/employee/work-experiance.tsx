import React, { useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import { useBoolean } from 'src/hooks/use-boolean';
import { Add, RemoveCircle } from '@mui/icons-material';
import { EmptyContent } from 'src/components/empty-content';
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
  console.log('work experience-----', values);
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
  return (
    <Box width="100%">
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
      <Box width="100%" display="flex" justifyContent="flex-end">
        {isEditable.value && (
          <Button
            variant="contained"
            size="small"
            startIcon={<Add />}
            onClick={() => {
              setFieldValue('experiences', [
                ...values.experiences,
                {
                  mediumStageName: '',
                  country: { name: 'India', isoCode: 'IN' },
                  state: { name: '', isoCode: '' },
                  city: { name: '' },
                  startDate: null,
                  endDate: null,
                  department: '',
                  designation: '',
                },
              ]);
            }}
          >
            Experience
          </Button>
        )}
      </Box>

      <Box display="flex" flexDirection="column" gap={2} mt={2}>
        {values.experiences.length === 0 && <EmptyContent title="No work experience added yet." />}
        {values.experiences.map((experience: any, index: number) => (
          <Paper
            key={index}
            elevation={3}
            sx={{
              gap: 2,
              display: 'flex',
              alignItems: 'center',
              p: 2,
              mb: values.experiences.length - 1 === index ? 2 : 0,
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
                    name={`experiences.${index}.mediumStageName`}
                    label="Organization Name *"
                    value={experience.mediumStageName}
                    onChange={(e) => {
                      const sanitizedValue = e.target.value.replace(/[^a-zA-Z0-9-_\s]/g, '');
                      const capitalized = sanitizedValue.replace(/\b\w/g, (c) => c.toUpperCase());
                      formik.setFieldValue(`experiences.${index}.mediumStageName`, capitalized);
                    }}
                    error={
                      formik?.touched?.experiences?.[index]?.mediumStageName &&
                      formik?.errors?.experiences?.[index]?.mediumStageName
                    }
                    helperText={
                      formik?.touched?.experiences?.[index]?.mediumStageName &&
                      formik?.errors?.experiences?.[index]?.mediumStageName
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
                    label="Designation"
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
                  onChange={(e) => {
                    const onlyLetters = e.target.value.replace(/[^a-zA-Z0-9-_\s]/g, '');
                    const capitalized = onlyLetters.replace(/\b\w/g, (c) => c.toUpperCase());
                    formik.setFieldValue(`experiences.${index}.department`, capitalized);
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
                  value={experience.country}
                  onChange={(e, value) => {
                    setFieldValue(`experiences.${index}.country`, value);
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
                  value={experience.state}
                  onChange={(e, value) => {
                    setFieldValue(`experiences.${index}.state`, value);
                    setFieldValue(`experiences.${index}.city`, { name: '' });
                  }}
                  disabled={!isEditable.value || !experience.country}
                  countryValue={experience.country}
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
                  value={experience.city}
                  onChange={(e, value) => {
                    setFieldValue(`experiences.${index}.city`, value);
                  }}
                  disabled={!isEditable.value || !experience.state}
                  stateValue={experience.state}
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
              </Box>
              <Box sx={{ width: '200px' }}>
                <ShakingTextField
                  error={
                    formik?.touched?.experiences?.[index]?.startDate &&
                    formik?.errors?.experiences?.[index]?.startDate
                  }
                >
                  <DatePicker
                    label="Start Date *"
                    name={`experiences.${index}.startDate`}
                    disableFuture
                    format="DD-MM-YYYY"
                    value={experience.startDate}
                    onChange={(date) => {
                      setFieldValue(`experiences.${index}.startDate`, date);
                    }}
                    disabled={!isEditable.value}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        error:
                          !!(
                            formik?.touched?.experiences?.[index]?.startDate &&
                            formik?.errors?.experiences?.[index]?.startDate
                          ) || false,
                        helperText:
                          (formik?.touched?.experiences?.[index]?.startDate &&
                            formik?.errors?.experiences?.[index]?.startDate) ||
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
                    formik?.touched?.experiences?.[index]?.endDate &&
                    formik?.errors?.experiences?.[index]?.endDate
                  }
                >
                  <DatePicker
                    label="End Date *"
                    name={`experiences.${index}.endDate`}
                    format="DD-MM-YYYY"
                    disableFuture
                    value={experience.endDate}
                    onChange={(date) => {
                      setFieldValue(`experiences.${index}.endDate`, date);
                    }}
                    disabled={!isEditable.value}
                    slotProps={{
                      textField: {
                        size: 'small',
                        fullWidth: true,
                        error:
                          !!(
                            formik?.touched?.experiences?.[index]?.endDate &&
                            formik?.errors?.experiences?.[index]?.endDate
                          ) || false,
                        helperText:
                          (formik?.touched?.experiences?.[index]?.endDate &&
                            formik?.errors?.experiences?.[index]?.endDate) ||
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
        content={<>Are you sure you want to delete experience?</>}
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
              // handle delete action
            }}
            // startIcon={<Iconify icon={GlobalIcons.delete} />}
          >
            Yes
          </Button>
        }
      />
    </Box>
  );
};

export default WorkExperiences;
