'use client';

import type { Medium } from 'src/types/school';
import type { RootState } from 'src/redux/store';

import { useFormik } from 'formik';
import React, { useMemo } from 'react';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import ColorPickerCircle from 'src/components/static-color/colorPickerCircle';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Grid, Button, TextField, Typography, DialogActions } from '@mui/material';
import {
  useAddSubjectMutation,
  useGetSubjectByIdQuery,
  useUpdateSubjectMutation,
} from 'src/redux/academicAPI/CurriculumManagementApi/Setting/Core-SubjectApi';

import { getSubjectInitialValues } from './initialValues';
import { subjectValidationSchema } from './validationSchema';

import type { ISubject, ISubjectFormProps } from './type';

const SettingSubjectForm: React.FC<ISubjectFormProps> = ({ open, onClose, editData }) => {
  const { currentMedium } = useSelector((state: RootState) => state.globalState);
  const [addSubject, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddSubjectMutation,
  });
  const {
    data: subjectById,
    isLoading,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSubjectByIdQuery,
    params: { academicMediumId: (currentMedium as Medium)?.id, id: editData?.id },
    options: {
      skip: !(currentMedium as Medium)?.id || !editData?.id,
    },
  });

  const [updateSubject, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateSubjectMutation,
  });
  const initialValues = useMemo(() => getSubjectInitialValues(editData), [editData]);
  // Initialize formik form handling with validation and submission logic
  const formik = useFormik({
    // Set initial form values, populated from editData if available
    initialValues,
    // Apply validation rules defined in incidentValidationSchema
    validationSchema: subjectValidationSchema,
    // Handle form submission
    onSubmit: async (values, formikHelpers) => {
      try {
        if (editData) {
          const payload = {
            academicMediumId: (currentMedium as Medium).id,
            id: (editData as ISubject).id,
            body: {
              name: values.subjectName,
              color: values.subjectColor,
              educationMediumId: (currentMedium as Medium).id,
            },
          };
          await updateSubject(payload).unwrap();
          shikshaMitraToast.success({
            message: `"${values.subjectName}" Subject updated successfully`,
          });
        } else {
          const payload = {
            academicMediumId: (currentMedium as Medium).id,
            body: {
              name: values.subjectName,
              color: values.subjectColor,
              educationMediumId: (currentMedium as Medium).id,
            },
          };
          await addSubject(payload).unwrap();
          shikshaMitraToast.success({
            message: `"${values.subjectName}" Subject added successfully`,
          });
        }
        onClose(null, true);
      } catch (error) {
        // Error handling is managed by the API hook or global error handler if configured
        console.error('Failed to save subject', error);
      }
    },
  });

  console.log('subjectById---', subjectById);
  console.log('formik values----', formik.values);

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      {/* <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}> */}
      {/* <Box display="flex" flexDirection="column" gap={2} height="100%">
          <Scrollbar sx={{ p: 2, height: '170px' }}> */}
      <DialogScrollContent>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12 }}>
            <ShakingTextField
              error={!!(formik.touched.subjectName && formik.errors.subjectName) || false}
            >
              <TextField
                fullWidth
                label="Subject Name *"
                name="subjectName"
                size="small"
                value={formik.values.subjectName}
                // placeholder="Enter Subject Name"
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
                  formik.setFieldValue('subjectName', value);
                }}
                error={formik.touched.subjectName && Boolean(formik.errors.subjectName)}
                helperText={formik.touched.subjectName && formik.errors.subjectName}
              />
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 12 }}>
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
                Subject Color *
              </Typography>
              <ColorPickerCircle
                onSelect={(color: string) => formik.setFieldValue('subjectColor', color)}
                initialColor={formik.values.subjectColor}
              />
            </ShakingTextField>
          </Grid>
        </Grid>
      </DialogScrollContent>
      {/* </Scrollbar> */}

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
          size="small"
          variant="contained"
          loading={isUpdateLoading || isAddLoading}
          startIcon={
            <Iconify
              icon={editData ? GlobalIcons.edit : GlobalIcons.submit}
              width={editData ? 16 : 20}
              height={editData ? 16 : 20}
            />
          }
          onClick={(e: any) => {
            formik.handleSubmit(e);
          }}
          type="submit"
        >
          {editData ? 'Update' : 'Submit'}
        </LoadingButton>
      </DialogActions>
      {/* </Box> */}
      {/* // </form> */}
    </BackPopUpChecked>
  );
};

export default SettingSubjectForm;
