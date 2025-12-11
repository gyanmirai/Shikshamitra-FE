'use client';

import type { RootState } from 'src/redux/store';

import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import { Stack, Button, TextField, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  useAddHomeworkTypeMutation,
  useUpdateHomeworkTypeMutation,
} from 'src/redux/academics/homeworkAndAssignment/homeworkTypeApi';

import type { IHomeworkTypeFormProps } from './type';

const HomeworkTypeForm: React.FC<IHomeworkTypeFormProps> = ({ open, onClose, editData }) => {
  const { currentMedium } = useSelector((state: RootState) => state.globalState);

  const [addHomeworkType] = useAddHomeworkTypeMutation();
  const [updateHomeworkType] = useUpdateHomeworkTypeMutation();

  const formik = useFormik({
    initialValues: {
      homeworkTypeName: editData?.homeworkTypeName || '',
    },
    validationSchema: Yup.object().shape({
      homeworkTypeName: Yup.string().required('Name is required'),
    }),
    onSubmit: (values) => {
      if (editData) {
        updateHomeworkType({
          id: editData.id,
          name: values.homeworkTypeName,
          academicMediumId: currentMedium?.id,
        });
      } else {
        addHomeworkType({
          name: values.homeworkTypeName,
          academicMediumId: currentMedium?.id,
        });
      }
      shikshaMitraToast.success({
        message: `${values.homeworkTypeName} Homework Type ${editData ? 'updated' : 'added'} successfully`,
      });
      onClose(null, true);
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      {/* <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}> */}
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
                formik.setFieldValue('homeworkTypeName', value);
              }}
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
          onClick={() => {
            onClose(null, false);
          }}
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
          onClick={(e: any) => formik.handleSubmit(e)}
        >
          {editData ? 'Update' : 'Submit'}
        </Button>
      </DialogActions>
      {/* </form> */}
    </BackPopUpChecked>
  );
};

export default HomeworkTypeForm;
