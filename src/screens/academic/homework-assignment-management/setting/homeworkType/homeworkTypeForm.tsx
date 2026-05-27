'use client';

import type { RootState } from 'src/redux/store';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import React, { useRef, useMemo } from 'react';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Stack, Button, TextField, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  useAddHomeworkTypeMutation,
  useUpdateHomeworkTypeMutation,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/Settings/HomeworkTypesApi';

import type { IHomeworkTypeFormProps } from './type';

const HomeworkTypeForm: React.FC<IHomeworkTypeFormProps> = ({
  open,
  onClose,
  editData,
  existingTypes = [],
}) => {
  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

  const existingNames = useMemo(
    () => new Set<string>(existingTypes.map((t) => t.homeworkTypeName.trim().toLowerCase())),
    [existingTypes]
  );
  const existingNamesRef = useRef<Set<string>>(new Set());
  existingNamesRef.current = existingNames;

  const [addHomeworkType, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddHomeworkTypeMutation,
  });

  const [updateHomeworkType, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateHomeworkTypeMutation,
  });

  const formik = useFormik({
    initialValues: {
      homeworkTypeName: editData?.homeworkTypeName || '',
    },
    enableReinitialize: true,
    validationSchema: Yup.object().shape({
      homeworkTypeName: Yup.string()
        .required('Name is required')
        .test('unique-homework-type', 'This homework type already exists', (value) => {
          if (!value?.trim()) return true;
          const trimmed = value.trim().toLowerCase();
          // Allow saving the same name when editing the current record
          if (editData && editData.homeworkTypeName.trim().toLowerCase() === trimmed) return true;
          return !existingNamesRef.current.has(trimmed);
        }),
    }),
    onSubmit: async (values) => {
      try {
        if (!medium?.id) {
          shikshaMitraToast.error({
            message: 'Academic medium is required',
          });
          return;
        }

        const academicMediumId = medium.id;

        if (editData) {
          await updateHomeworkType({
            homeworkTypeId: editData.id,
            homeworkTypeName: values.homeworkTypeName,
            academicMediumId,
          }).unwrap();
          shikshaMitraToast.success({
            message: `"${values.homeworkTypeName}" Homework Type updated successfully`,
          });
        } else {
          await addHomeworkType({
            data: { homeworkTypeName: values.homeworkTypeName },
            academicMediumId,
          }).unwrap();
          shikshaMitraToast.success({
            message: `"${values.homeworkTypeName}" Homework Type added successfully`,
          });
        }
        onClose(null, true);
      } catch (error) {
        console.error('Failed to save homework type', error);
      }
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
        <LoadingButton
          loading={isUpdateLoading || isAddLoading}
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
        </LoadingButton>
      </DialogActions>
      {/* </form> */}
    </BackPopUpChecked>
  );
};

export default HomeworkTypeForm;
