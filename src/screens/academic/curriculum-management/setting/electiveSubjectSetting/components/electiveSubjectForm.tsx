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
import { ResponsiveMultiSelect } from 'src/components/responsiveMultiSelect';
import ColorPickerCircle from 'src/components/static-color/colorPickerCircle';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Grid, Button, TextField, Typography, DialogActions } from '@mui/material';
import { useGetCoreSubjectsByMediumQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Setting/Core-SubjectApi';
import {
  useAddElectiveGroupMutation,
  useGetElectiveGroupByIdQuery,
  useUpdateElectiveGroupMutation,
} from 'src/redux/academicAPI/CurriculumManagementApi/Setting/Elective-GroupApi';

import { getElectiveSubjectInitialValues } from './initialValues';
import { electiveSubjectValidationSchema } from './validationSchema';

import type { IElectiveSubject, IElectiveSubjectFormProps } from '../type';

const SettingElectiveSubjectForm: React.FC<IElectiveSubjectFormProps> = ({
  open,
  onClose,
  editData,
}: IElectiveSubjectFormProps) => {
  const { currentMedium } = useSelector((state: RootState) => state.globalState);
  const [addElectiveGroup, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddElectiveGroupMutation,
  });
  const [updateElectiveGroup, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateElectiveGroupMutation,
  });
  const { data: subjectData, isLoading: isSubjectLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetCoreSubjectsByMediumQuery,
    params: { academicMediumId: (currentMedium as Medium)?.id },
    options: {
      skip: !(currentMedium as Medium)?.id,
    },
  });
  const {
    data: subjectById,
    isLoading,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetElectiveGroupByIdQuery,
    params: { academicMediumId: (currentMedium as Medium)?.id, id: editData?.id },
    options: {
      skip: !(currentMedium as Medium)?.id || !editData?.id,
    },
  });
  const initialValues = useMemo(() => getElectiveSubjectInitialValues(editData), [editData]);

  // Initialize formik form with initial values, validation schema and submit handler
  const formik = useFormik({
    // Get initial form values from edit data or default values
    initialValues,
    // Apply validation rules to form fields
    validationSchema: electiveSubjectValidationSchema,
    // Handle form submission
    onSubmit: async (values, formikHelpers) => {
      try {
        if (editData) {
          const payload = {
            academicMediumId: (currentMedium as Medium).id,
            id: (editData as IElectiveSubject).id,
            body: {
              name: values.name,
              color: values.color,
              subjectIds: values.subjectIds,
            },
          };
          await updateElectiveGroup(payload).unwrap();
          shikshaMitraToast.success({
            message: `"${values.name}" Elective Group updated successfully`,
          });
        } else {
          const payload = {
            academicMediumId: (currentMedium as Medium).id,
            body: {
              name: values.name,
              color: values.color,
              subjectIds: values.subjectIds,
            },
          };
          await addElectiveGroup(payload).unwrap();
          shikshaMitraToast.success({
            message: `"${values.name}" Elective Group added successfully`,
          });
        }
        onClose(null, true);
      } catch (error) {
        // Error handling is managed by the API hook or global error handler if configured
        console.error('Failed to save subject', error);
      }
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      {/* <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={2} height="100%">
          <Scrollbar sx={{ p: 2, height: '240px' }}> */}
      <DialogScrollContent>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <ShakingTextField error={!!(formik.touched.name && formik.errors.name)}>
              <TextField
                fullWidth
                label="Elective Group Name *"
                name="name"
                onChange={(e) => {
                  const value = e.target.value
                    // Remove everything except letters, numbers, spaces, dash, colon
                    .replace(/[^a-zA-Z-:0-9\s]/g, '')
                    // Capitalize each word
                    .split(' ')
                    .map((word) =>
                      word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
                    )
                    .join(' ');
                  formik.setFieldValue('name', value);
                }}
                size="small"
                value={formik.values.name}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
              />
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 12 }}>
            <ResponsiveMultiSelect
              label="Select Subjects *"
              options={subjectData || []}
              isLoading={isSubjectLoading}
              value={formik.values.subjectIds}
              getOptionLabel={(opt: any) => opt?.name}
              getOptionValue={(opt: any) => opt?.id}
              onChange={(selected: string[]) => {
                formik.setFieldValue('subjectIds', selected);
              }}
              error={!!(formik.touched.subjectIds && formik.errors.subjectIds)}
              helperText={
                Array.isArray(formik.errors.subjectIds)
                  ? formik.errors.subjectIds.join(', ')
                  : (formik.touched.subjectIds && formik.errors.subjectIds) || undefined
              }
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <ShakingTextField error={!!(formik.touched.color && formik.errors.color) || false}>
              <Typography
                variant="subtitle2"
                sx={{ mb: 1 }}
                color={formik.touched.color && formik.errors.color ? 'error.main' : 'text.primary'}
              >
                Elective Group Color *
              </Typography>
              <ColorPickerCircle
                onSelect={(color: string) => formik.setFieldValue('color', color)}
                initialColor={formik.values.color}
              />
            </ShakingTextField>
          </Grid>
        </Grid>
      </DialogScrollContent>
      {/* </Scrollbar> */}

      <DialogActions>
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
      {/* </Box>
      </form> */}
    </BackPopUpChecked>
  );
};

export default SettingElectiveSubjectForm;
