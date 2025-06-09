'use client';

import React from 'react';
import { useFormik } from 'formik';
import { MuiColorInput } from 'mui-color-input';

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
  // Initialize formik form with initial values, validation schema and submit handler
  const formik = useFormik({
    // Get initial form values from edit data or default values
    initialValues: getElectiveSubjectInitialValues(editData),
    // Apply validation rules to form fields
    validationSchema: electiveSubjectValidationSchema,
    // Handle form submission
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
                    label="Elective Group Name *"
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
                      { label: 'Mathematics', value: 'MATH' },
                      { label: 'Physics', value: 'PHY' },
                      { label: 'Chemistry', value: 'CHEM' },
                      { label: 'Biology', value: 'BIO' },
                      { label: 'Computer Science', value: 'CS' },
                      { label: 'Economics', value: 'ECO' },
                      { label: 'History', value: 'HIST' },
                      { label: 'Geography', value: 'GEO' },
                      { label: 'Literature', value: 'LIT' },
                      { label: 'Art', value: 'ART' },
                      { label: 'Music', value: 'MUS' },
                      { label: 'Physical Education', value: 'PE' },
                    ]}
                    onChange={(event, value) => {
                      const transformed = value.map((item) => ({ name: item.value }));
                      formik.setFieldValue('subjects', transformed);
                    }}
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
                      <TextField {...params} label="Select Subjects *" size="small" />
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

              <Grid item xs={12}>
                <ShakingTextField
                  error={!!(formik.touched.subjectColor && formik.errors.subjectColor) || false}
                >
                  <MuiColorInput
                    size="small"
                    format="hex"
                    placeholder="Elective Group Color *"
                    value={formik.values.subjectColor}
                    onChange={(e) => {
                      formik.setFieldValue('subjectColor', e);
                    }}
                    sx={{
                      minWidth: 180,
                      width: '100%',
                      '& .MuiInputBase-root': {
                        fontSize: '0.875rem',
                      },
                      '& .MuiInputBase-input::placeholder': {
                        fontSize: '0.875rem',
                      },
                    }}
                    error={formik.touched.subjectColor && Boolean(formik.errors.subjectColor)}
                    helperText={formik.touched.subjectColor && formik.errors.subjectColor}
                  />
                </ShakingTextField>
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
              startIcon={<Iconify icon={editData ? GlobalIcons.edit : GlobalIcons.submit} />}
              type="submit"
              variant="contained"
            >
              {editData ? 'Update' : 'Submit'}
            </Button>
          </DialogActions>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default SettingElectiveSubjectForm;
