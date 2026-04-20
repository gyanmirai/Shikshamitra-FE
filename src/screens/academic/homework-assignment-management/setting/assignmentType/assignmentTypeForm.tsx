'use client';

import type { RootState } from 'src/redux/store';

import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Stack, Button, TextField, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  useAddAssignmentTypeMutation,
  useUpdateAssignmentTypeMutation,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/Settings/AssignmentTypesApi';

import type { IAssignmentTypeFormProps } from './type';

const AssignmentTypeForm: React.FC<IAssignmentTypeFormProps> = ({ open, onClose, editData }) => {
  const { currentMedium } = useSelector((state: RootState) => state.globalState);
  const [addAssignmentType, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddAssignmentTypeMutation,
  });

  const [updateAssignmentType, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateAssignmentTypeMutation,
  });

  const formik = useFormik({
    initialValues: {
      assignmentTypeName: editData?.assignmentTypeName || '',
    },
    enableReinitialize: true,
    validationSchema: Yup.object().shape({
      assignmentTypeName: Yup.string().required('Name is required'),
    }),
    onSubmit: async (values) => {
      try {
        if (editData) {
          await updateAssignmentType({
            assignmentTypeId: editData.id,
            academicMediumId: (currentMedium as any).id,
            data: { assignmentTypeName: values.assignmentTypeName },
          }).unwrap();
          shikshaMitraToast.success({
            message: `"${values.assignmentTypeName}" Assignment Type updated successfully`,
          });
        } else {
          await addAssignmentType({
            academicMediumId: (currentMedium as any).id,
            data: { assignmentTypeName: values.assignmentTypeName },
          }).unwrap();
          shikshaMitraToast.success({
            message: `"${values.assignmentTypeName}" Assignment Type added successfully`,
          });
        }
        onClose(null, true);
      } catch (error) {
        console.error('Failed to save assignment type', error);
      }
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      {/* <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}> */}
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
              error={formik.touched.assignmentTypeName && Boolean(formik.errors.assignmentTypeName)}
              helperText={formik.touched.assignmentTypeName && formik.errors.assignmentTypeName}
            />
          </ShakingTextField>
        </Stack>
      </DialogScrollContent>

      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
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
        <LoadingButton
          loading={isAddLoading || isUpdateLoading}
          startIcon={
            <Iconify
              icon={editData ? GlobalIcons.edit : GlobalIcons.submit}
              width={editData ? 16 : 20}
              height={editData ? 16 : 20}
            />
          }
          onClick={(e: any) => formik.handleSubmit(e)}
          type="submit"
          variant="contained"
          size="small"
        >
          {editData ? 'Update' : 'Submit'}
        </LoadingButton>
      </DialogActions>
      {/* </form> */}
    </BackPopUpChecked>
  );
};

export default AssignmentTypeForm;
