'use client';

import React from 'react';
import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Editor } from 'src/components/editor';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Box, Grid, Button, TextField, Autocomplete, DialogActions } from '@mui/material';

import { getGatePassInitialValues } from '../initialValue';
import { gatePassValidationSchema } from '../validationSchema';

import type { IGateRequestFormProps } from '../gate-pass-system-interface';

const GatePassRequestForm: React.FC<IGateRequestFormProps> = ({ isEdit, data, onClose }) => {
  const formik = useFormik({
    initialValues: getGatePassInitialValues(data),
    validationSchema: gatePassValidationSchema,
    onSubmit: (values) => {},
  });

  const isDisabled = data !== null && isEdit === false;
  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={2} height="100%">
          <Scrollbar sx={{ p: 2, height: '100%' }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField
                  error={!!(formik.touched.studentName && formik.errors.studentName) || false}
                >
                  <Autocomplete
                    disabled={isDisabled}
                    loading={false}
                    noOptionsText="No Student Found"
                    fullWidth
                    options={[]}
                    getOptionLabel={(option: any) => option?.firstName || ''}
                    renderInput={(params: any) => (
                      <TextField
                        {...params}
                        size="small"
                        label="Student Name *"
                        placeholder="Student Name"
                        fullWidth
                        error={formik.touched.studentName && Boolean(formik.errors.studentName)}
                        helperText={
                          (formik.touched.studentName && formik.errors.studentName) || undefined
                        }
                      />
                    )}
                    renderOption={(prop: any, option: any) => (
                      <li {...prop} key={option.id}>
                        {option.firstName}
                      </li>
                    )}
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField
                  error={!!(formik.touched.reason && formik.errors.reason) || false}
                >
                  <CustomSelect
                    disabled={isDisabled}
                    label="Reason *"
                    options={[]}
                    value={formik.values.reason}
                    onChange={(val) => {
                      formik.setFieldValue('reason', val);
                    }}
                    formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
                    error={formik.touched.reason && Boolean(formik.errors.reason)}
                    helperText={(formik.touched.reason && formik.errors.reason) || undefined}
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <DatePicker
                  disabled={isDisabled}
                  label="Valid From *"
                  format="DD-MM-YYYY"
                  value={formik.values.validFrom ? dayjs(formik.values.validFrom) : null}
                  onChange={(value) => {
                    // value is a Dayjs object or null
                    formik.setFieldValue('validFrom', value ? value.toISOString() : null);
                  }}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      error: formik.touched.validFrom && Boolean(formik.errors.validFrom),
                      helperText:
                        formik.touched.validFrom && formik.errors.validFrom
                          ? String(formik.errors.validFrom)
                          : '',
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <DatePicker
                  disabled={isDisabled}
                  label="Valid Until *"
                  format="DD-MM-YYYY"
                  value={formik.values.validTo ? dayjs(formik.values.validTo) : null}
                  onChange={(value) => {
                    // value is a Dayjs object or null
                    formik.setFieldValue('validTo', value ? value.toISOString() : null);
                  }}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      error: formik.touched.validTo && Boolean(formik.errors.validTo),
                      helperText:
                        formik.touched.validTo && formik.errors.validTo
                          ? String(formik.errors.validTo)
                          : '',
                    },
                  }}
                />
              </Grid>

              <Grid size={12}>
                <ShakingTextField
                  error={
                    !!(formik.touched.specailInstructions && formik.errors.specailInstructions) ||
                    false
                  }
                >
                  <div style={isDisabled ? { pointerEvents: 'none', opacity: 0.6 } : {}}>
                    <Editor
                      value={formik.values.specailInstructions}
                      onChange={(value) => {
                        formik.setFieldValue('specialInstructions', value);
                      }}
                      placeholder="Reason for Visit *"
                      sx={{ width: '100%', marginTop: '10px' }}
                      error={
                        formik.touched.specailInstructions &&
                        Boolean(formik.errors.specailInstructions)
                      }
                      helperText={
                        formik.touched.specailInstructions && formik.errors.specailInstructions
                      }
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

export default GatePassRequestForm;
