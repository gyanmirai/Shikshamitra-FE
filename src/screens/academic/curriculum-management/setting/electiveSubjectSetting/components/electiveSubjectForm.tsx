'use client';

import React from 'react';
import { useFormik } from 'formik';
import { capitalize } from 'lodash';

import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import {
  Box,
  Chip,
  Grid,
  Button,
  Checkbox,
  TextField,
  Typography,
  FormControl,
  Autocomplete,
  DialogActions,
  FormHelperText,
} from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { TeacherListPopover } from 'src/screens/academic/homework-assignment-management/homeworkCreation/component/homeworkForm';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import ShakingTextField from 'src/components/shaking-text-field';
import ColorPickerCircle from 'src/components/static-color/colorPickerCircle';
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
          <Scrollbar sx={{ p: 2, height: '200px' }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <ShakingTextField error={!!(formik.touched.title && formik.errors.title)}>
                  <TextField
                    fullWidth
                    label="Elective Group Name *"
                    name="title"
                    size="small"
                    value={formik.values.title}
                    onChange={(e) => {
                      const value = capitalize(e.target.value);
                      formik.setFieldValue('title', value);
                    }}
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
                      { label: 'Sanskrit', value: 'Sanskrit' },
                      { label: 'Hindi', value: 'Hindi' },
                      { label: 'Physical Training', value: 'Physical Training' },
                      { label: 'Computer', value: 'Computer' },
                    ]}
                    disableCloseOnSelect
                    getOptionLabel={(option: { value: string; label: string }) => option.label}
                    value={
                      formik.values.subjects?.map((subject) => ({
                        value: subject.name,
                        label: subject.name,
                      })) || []
                    }
                    onChange={(event, newValue: Array<{ value: string; label: string }>) => {
                      formik.setFieldValue(
                        'subjects',
                        newValue.map((item) => ({ name: item.value }))
                      );
                    }}
                    isOptionEqualToValue={(option, value) => option.value === value.value}
                    renderOption={(props, option, { selected }) => (
                      <li {...props}>
                        <Checkbox
                          icon={<CheckBoxOutlineBlankIcon />}
                          checkedIcon={<CheckBoxIcon />}
                          style={{ marginRight: 8 }}
                          checked={selected}
                        />
                        {option.label}
                      </li>
                    )}
                    renderTags={(value: Array<{ value: string; label: string }>) => {
                      if (value.length === 0) return null;
                      const first = value[0].label;
                      const remainingCount = value.length - 1;
                      return [
                        <Chip
                          key={first}
                          label={first}
                          sx={{ ml: 1 }}
                          size="small"
                          variant="soft"
                        />,
                        remainingCount > 0 && (
                          <TeacherListPopover
                            key="more-count"
                            data={value.slice(1)}
                            count={remainingCount}
                          />
                        ),
                      ];
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Subjects *"
                        size="small"
                        error={!!(formik.touched.subjects && formik.errors.subjects)}
                        helperText={
                          Array.isArray(formik.errors.subjects)
                            ? formik.errors.subjects.join(', ')
                            : (formik.touched.subjects && formik.errors.subjects) || undefined
                        }
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

              <Grid item xs={12}>
                <ShakingTextField
                  error={!!(formik.touched.subjectColor && formik.errors.subjectColor) || false}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ mb: 1 }}
                    color={
                      formik.touched.subjectColor && formik.errors.subjectColor
                        ? 'error.main'
                        : 'text.primary'
                    }
                  >
                    Elective Group Color
                  </Typography>
                  <ColorPickerCircle
                    onSelect={(color: string) => formik.setFieldValue('subjectColor', color)}
                    initialColor={formik.values.subjectColor}
                  />
                </ShakingTextField>
              </Grid>
            </Grid>
          </Scrollbar>

          <DialogActions sx={{ flexShrink: 0, p: 2 }}>
            <Button
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              size="small"
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
              size="small"
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
