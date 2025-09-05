'use client';

import React from 'react';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import { Iconify } from 'src/components/iconify/iconify';
import { Box, Grid, Button, DialogActions } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { getAssignTeacherInitialValues } from './initialTeacherAssignData';
import { teacherReassignValidationSchema } from './teacherReassignValidationSchema';

import type { ITeacherReassignProps } from './type';

const TeacherReassign: React.FC<ITeacherReassignProps> = ({ selectedTeacher, onSubmit }) => {
  // Initialize formik form with validation schema and submit handler
  const formik = useFormik({
    // Set initial form values from selected teacher data or empty array
    initialValues: getAssignTeacherInitialValues(selectedTeacher),
    // Define validation schema using Yup
    validationSchema: teacherReassignValidationSchema,
    // Handle form submission by calling parent onSubmit callback
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <Box display="flex" flexDirection="column" gap={2}>
        <form onSubmit={formik.handleSubmit}>
          <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '100px' }}>
            <Grid container spacing={2}>
              <Grid size={12}>
                <ShakingTextField
                  error={
                    !!(formik.touched.assignedTeacher && formik.errors.assignedTeacher) || false
                  }
                >
                  <CustomSelect
                    label="Assigned Teacher"
                    options={[
                      { value: 'John Doe', label: 'John Doe' },
                      { value: 'Jane Smith', label: 'Jane Smith' },
                      { value: 'Robert Johnson', label: 'Robert Johnson' },
                      { value: 'Emily Brown', label: 'Emily Brown' },
                      { value: 'Michael Wilson', label: 'Michael Wilson' },
                    ]}
                    name="assignedTeacher"
                    multiple
                    value={formik.values.assignedTeacher}
                    formControlProps={{ sx: { minWidth: 180, width: '100%' } }}
                    onChange={(val) => {
                      formik.setFieldValue('assignedTeacher', val);
                    }}
                    error={formik.touched.assignedTeacher && Boolean(formik.errors.assignedTeacher)}
                    helperText={
                      formik.touched.assignedTeacher &&
                      typeof formik.errors.assignedTeacher === 'string'
                        ? formik.errors.assignedTeacher
                        : undefined
                    }
                  />
                </ShakingTextField>
              </Grid>
            </Grid>
          </Scrollbar>
          <DialogActions>
            <Button
              startIcon={<Iconify icon={GlobalIcons.resignIcon} />}
              type="submit"
              variant="contained"
            >
              Reassign
            </Button>
          </DialogActions>
        </form>
      </Box>
    </BackPopUpChecked>
  );
};

export default TeacherReassign;
