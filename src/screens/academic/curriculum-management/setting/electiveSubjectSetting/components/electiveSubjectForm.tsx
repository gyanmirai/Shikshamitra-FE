'use client';

import React from 'react';
import { useFormik } from 'formik';

import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import {
  Box,
  Grid,
  Button,
  Checkbox,
  TextField,
  FormControl,
  Autocomplete,
  DialogActions,
  FormHelperText,
} from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import ShakingTextField from 'src/components/shaking-text-field';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { getElectiveSubjectInitialValues } from './initialValues';
import { electiveSubjectValidationSchema } from './validationSchema';

import type { IElectiveSubjectFormProps } from '../type';

const SettingElectiveSubjectForm: React.FC<IElectiveSubjectFormProps> = ({
  open,
  onClose,
  editData,
}: IElectiveSubjectFormProps) => {
  const formik = useFormik({
    initialValues: getElectiveSubjectInitialValues(editData),
    validationSchema: electiveSubjectValidationSchema,
    onSubmit: (values) => {
      console.log(values);
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={2} height="100%">
          <Scrollbar sx={{ p: 2, height: '100%' }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <ShakingTextField error={!!(formik.touched.title && formik.errors.title)}>
                  <TextField
                    fullWidth
                    label="Elective Title"
                    name="title"
                    size="small"
                    value={formik.values.title}
                    onChange={formik.handleChange}
                    error={formik.touched.title && Boolean(formik.errors.title)}
                    helperText={formik.touched.title && formik.errors.title}
                  />
                </ShakingTextField>
              </Grid>

              <Grid item xs={12}>
                <FormControl
                  fullWidth
                  error={formik.touched.subjects && Boolean(formik.errors.subjects)}
                >
                  <Autocomplete
                    multiple
                    id="subjects-select"
                    options={[
                      { label: 'Student 1', value: 'STU001' },
                      { label: 'Student 2', value: 'STU002' },
                      { label: 'Student 3', value: 'STU003' },
                      { label: 'Student 4', value: 'STU004' },
                      { label: 'Student 5', value: 'STU005' },
                      { label: 'Student 6', value: 'STU006' },
                      { label: 'Student 7', value: 'STU007' },
                      { label: 'Student 8', value: 'STU008' },
                      { label: 'Student 9', value: 'STU009' },
                      { label: 'Student 10', value: 'STU010' },
                    ]}
                    disableCloseOnSelect
                    getOptionLabel={(option) => option.label}
                    renderOption={(props, option, { selected }) => {
                      const { key, ...optionProps } = props;
                      return (
                        <li key={key} {...optionProps}>
                          <Checkbox
                            icon={<CheckBoxOutlineBlankIcon />}
                            checkedIcon={<CheckBoxIcon />}
                            style={{ marginRight: 8 }}
                            checked={selected}
                          />
                          {option.value}
                        </li>
                      );
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Subjects *"
                        placeholder="Select Subjects"
                        size="small"
                      />
                    )}
                  />
                  {formik.touched.subjects && formik.errors.subjects && (
                    <FormHelperText>
                      {Array.isArray(formik.errors.subjects)
                        ? formik.errors.subjects.join(', ')
                        : formik.errors.subjects}
                    </FormHelperText>
                  )}
                </FormControl>
              </Grid>
            </Grid>
          </Scrollbar>

          <DialogActions>
            <Button
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              onClick={() => {
                onClose(null, false);
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
              Submit
            </Button>
          </DialogActions>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default SettingElectiveSubjectForm;
