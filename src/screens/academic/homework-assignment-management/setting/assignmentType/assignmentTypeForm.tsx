'use client';

import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';

import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import ShakingTextField from 'src/components/shaking-text-field';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import type { IAssignmentTypeFormProps } from './type';

const AssignmentTypeForm: React.FC<IAssignmentTypeFormProps> = ({ open, onClose, editData }) => {
  const formik = useFormik({
    initialValues: {
      assignmentTypeName: editData?.assignmentTypeName || '',
    },
    validationSchema: Yup.object().shape({
      assignmentTypeName: Yup.string().required('Assignment type name is required'),
    }),
    onSubmit: (values) => {
      console.log(values);
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={2} height="100%">
          <Scrollbar sx={{ p: 2 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <ShakingTextField
                  error={
                    !!(formik.touched.assignmentTypeName && formik.errors.assignmentTypeName) ||
                    false
                  }
                >
                  <TextField
                    fullWidth
                    size="small"
                    name="assignmentTypeName"
                    label="Assignment Type Name *"
                    // placeholder="Enter Assignment Type Name"
                    value={formik.values.assignmentTypeName}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.assignmentTypeName && Boolean(formik.errors.assignmentTypeName)
                    }
                    helperText={
                      formik.touched.assignmentTypeName && formik.errors.assignmentTypeName
                    }
                  />
                </ShakingTextField>
              </Grid>
            </Grid>
          </Scrollbar>

          <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
            <Button
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              onClick={onClose}
              variant="outlined"
              size="small"
            >
              Cancel
            </Button>
            <Button
              startIcon={<Iconify icon={GlobalIcons.submit} />}
              type="submit"
              variant="contained"
              size="small"
            >
              Submit
            </Button>
          </DialogActions>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default AssignmentTypeForm;
