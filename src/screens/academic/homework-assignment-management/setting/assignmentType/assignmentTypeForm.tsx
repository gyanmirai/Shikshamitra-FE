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

import type { IAssignmentTypeFormProps } from './type';

const AssignmentTypeForm: React.FC<IAssignmentTypeFormProps> = ({ open, onClose, editData }) => {
  const formik = useFormik({
    initialValues: {
      assignmentTypeName: editData?.assignmentTypeName || '',
    },
    validationSchema: Yup.object().shape({
      assignmentTypeName: Yup.string().required('Name is required'),
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
              error={
                !!(formik.touched.assignmentTypeName && formik.errors.assignmentTypeName) || false
              }
            >
              <TextField
                fullWidth
                size="small"
                name="assignmentTypeName"
                label="Name *"
                // placeholder="Enter Assignment Type Name"
                value={formik.values.assignmentTypeName}
                onChange={(e) => {
                  const value = e.target.value
                    // Remove everything except letters and spaces
                    .replace(/[^a-zA-Z\s]/g, '')
                    // Capitalize each word
                    .split(' ')
                    .map((word) =>
                      word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
                    )
                    .join(' ');
                  formik.setFieldValue('assignmentTypeName', value);
                }}
                error={
                  formik.touched.assignmentTypeName && Boolean(formik.errors.assignmentTypeName)
                }
                helperText={formik.touched.assignmentTypeName && formik.errors.assignmentTypeName}
              />
            </ShakingTextField>
          </Stack>
        </DialogScrollContent>

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

export default AssignmentTypeForm;
