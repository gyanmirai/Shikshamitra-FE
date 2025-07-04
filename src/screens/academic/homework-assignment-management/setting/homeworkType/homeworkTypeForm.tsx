'use client';

import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';

import { Stack, Button, TextField, DialogActions } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from 'src/components/iconify';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import type { IHomeworkTypeFormProps } from './type';

const HomeworkTypeForm: React.FC<IHomeworkTypeFormProps> = ({ open, onClose, editData }) => {
  const formik = useFormik({
    initialValues: {
      homeworkTypeName: editData?.homeworkTypeName || '',
    },
    validationSchema: Yup.object().shape({
      homeworkTypeName: Yup.string().required('Name is required'),
    }),
    onSubmit: (values) => {
      console.log(values);
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <DialogScrollContent>
          <Stack spacing={3}>
            <ShakingTextField
              error={!!(formik.touched.homeworkTypeName && formik.errors.homeworkTypeName) || false}
            >
              <TextField
                fullWidth
                size="small"
                name="homeworkTypeName"
                label="Name *"
                value={formik.values.homeworkTypeName}
                onChange={formik.handleChange}
                error={formik.touched.homeworkTypeName && Boolean(formik.errors.homeworkTypeName)}
                helperText={formik.touched.homeworkTypeName && formik.errors.homeworkTypeName}
              />
            </ShakingTextField>
          </Stack>
        </DialogScrollContent>
        <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
          {' '}
          <Button
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
            onClick={onClose}
            variant="outlined"
            size="small"
          >
            Cancel
          </Button>
          <Button
            startIcon={
              <Iconify
                icon={editData ? GlobalIcons.edit : GlobalIcons.submit}
                width={editData ? 16 : 20}
                height={editData ? 16 : 20}
              />
            }
            type="submit"
            variant="contained"
            size="small"
          >
            {editData ? 'Update' : 'Submit'}
          </Button>
        </DialogActions>
      </form>
    </BackPopUpChecked>
  );
};

export default HomeworkTypeForm;
