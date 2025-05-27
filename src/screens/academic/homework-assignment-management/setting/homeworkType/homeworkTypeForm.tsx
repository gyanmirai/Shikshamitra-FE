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

import type { IHomeworkTypeFormProps } from './type';

const HomeworkTypeForm: React.FC<IHomeworkTypeFormProps> = ({ open, onClose, editData }) => {
  const formik = useFormik({
    initialValues: {
      homeworkTypeName: editData?.homeworkTypeName || '',
    },
    validationSchema: Yup.object().shape({
      homeworkTypeName: Yup.string().required('Homework type name is required'),
    }),
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
                <ShakingTextField
                  error={
                    !!(formik.touched.homeworkTypeName && formik.errors.homeworkTypeName) || false
                  }
                >
                  <TextField
                    fullWidth
                    size="small"
                    name="homeworkTypeName"
                    label="Homework Type Name *"
                    placeholder="Enter Homework Type"
                    value={formik.values.homeworkTypeName}
                    onChange={formik.handleChange}
                    error={
                      formik.touched.homeworkTypeName && Boolean(formik.errors.homeworkTypeName)
                    }
                    helperText={formik.touched.homeworkTypeName && formik.errors.homeworkTypeName}
                  />
                </ShakingTextField>
              </Grid>
            </Grid>
          </Scrollbar>

          <DialogActions>
            <Button
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              onClick={onClose}
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

export default HomeworkTypeForm;
