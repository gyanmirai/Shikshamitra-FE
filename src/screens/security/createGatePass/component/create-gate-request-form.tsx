'use client';

import React from 'react';
import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Editor } from 'src/components/editor';
import { TimePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Box, Grid, Button, TextField, Autocomplete, DialogActions } from '@mui/material';

import { getEmergencyGatePassInitialValues } from '../initialValue';
import { emergencyGatePassValidationSchema } from '../validationSchema';

import type { ICreateEmergencyGatePassFormProps } from '../create-gate-pass-interface';

const CreateGatePassRequestForm: React.FC<ICreateEmergencyGatePassFormProps> = ({
  isEdit,
  data,
  onClose,
}) => {
  const formik = useFormik({
    initialValues: getEmergencyGatePassInitialValues(data),
    validationSchema: emergencyGatePassValidationSchema,
    onSubmit: (values) => {},
  });

  const isDisabled = data !== null && isEdit === false;
  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={1} height="100%">
          <Scrollbar sx={{ p: 2, height: '100%' }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField
                  error={!!(formik.touched.personName && formik.errors.personName) || false}
                >
                  <Autocomplete
                    disabled={isDisabled}
                    loading={false}
                    noOptionsText="No Person Found"
                    fullWidth
                    options={[]}
                    getOptionLabel={(option: any) => option?.firstName || ''}
                    renderInput={(params: any) => (
                      <TextField
                        {...params}
                        size="small"
                        label="Person Name *"
                        placeholder="Person Name"
                        fullWidth
                        error={formik.touched.personName && Boolean(formik.errors.personName)}
                        helperText={
                          (formik.touched.personName && formik.errors.personName) || undefined
                        }
                      />
                    )}
                    renderOption={(prop: any, option: any) => (
                      <li {...prop} key={option.id}>
                        {option.firstName}
                      </li>
                    )}
                  />
                </ShakingTextField>{' '}
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TimePicker
                  disabled={isDisabled}
                  label="Time *"
                  format="hh:mm A"
                  value={formik.values.time ? dayjs(formik.values.time) : null}
                  onChange={(val) => {
                    // val is a Dayjs object or null
                    formik.setFieldValue('time', val ? val.toISOString() : null);
                  }}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      error: formik.touched.time && Boolean(formik.errors.time),
                      helperText:
                        formik.touched.time && formik.errors.time
                          ? String(formik.errors.time)
                          : undefined,
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField
                  error={!!(formik.touched.emergencyFlag && formik.errors.emergencyFlag) || false}
                >
                  <CustomSelect
                    disabled={isDisabled}
                    label="Emergency Flag *"
                    options={[]}
                    value={formik.values.emergencyFlag}
                    onChange={(val) => {
                      formik.setFieldValue('emergencyFlag', val);
                    }}
                    formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
                    error={formik.touched.emergencyFlag && Boolean(formik.errors.emergencyFlag)}
                    helperText={
                      (formik.touched.emergencyFlag && formik.errors.emergencyFlag) || undefined
                    }
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={12}>
                <ShakingTextField
                  error={!!(formik.touched.reason && formik.errors.reason) || false}
                >
                  <div style={isDisabled ? { pointerEvents: 'none', opacity: 0.6 } : {}}>
                    <Editor
                      value={formik.values.reason}
                      onChange={(value) => {
                        formik.setFieldValue('reason', value);
                      }}
                      placeholder="Descriptive Reason *"
                      sx={{ width: '100%', marginTop: '10px' }}
                      error={formik.touched.reason && Boolean(formik.errors.reason)}
                      helperText={formik.touched.reason && formik.errors.reason}
                    />
                  </div>
                </ShakingTextField>
              </Grid>
            </Grid>
          </Scrollbar>

          {!isDisabled && (
            <DialogActions>
              <Button
                startIcon={<Iconify icon={GlobalIcons.cancel} />}
                onClick={() => {
                  onClose();
                }}
                variant="outlined"
              >
                Cancel
              </Button>
              <Button
                startIcon={<Iconify icon={GlobalIcons.submit} />}
                type="submit"
                variant="contained"
              >
                {isEdit ? 'Update' : 'Submit'}
              </Button>
            </DialogActions>
          )}

          {isDisabled && (
            <DialogActions>
              <Button
                startIcon={<Iconify icon={GlobalIcons.cancel} />}
                onClick={() => {
                  onClose();
                }}
                variant="outlined"
              >
                Reject
              </Button>
              <Button
                startIcon={<Iconify icon={GlobalIcons.submit} />}
                type="submit"
                variant="contained"
              >
                Approved
              </Button>
            </DialogActions>
          )}
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default CreateGatePassRequestForm;
