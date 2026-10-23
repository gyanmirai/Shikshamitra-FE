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
import { FormSectionCard } from 'src/components/form-section-card';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Stack, Button, MenuItem, TextField, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  useAddHomeworkTypeMutation,
  useUpdateHomeworkTypeMutation,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/Settings/HomeworkTypesApi';

import type { IHomeworkTypeFormProps } from './type';

const SUBMISSION_TYPES = [
  { value: 0, label: 'Online Text' },
  { value: 1, label: 'File Upload' },
  { value: 2, label: 'In-Person' },
  { value: 3, label: 'No Submission Required' },
];

const STATUS_OPTIONS = [
  { value: 0, label: 'Active' },
  { value: 1, label: 'Inactive' },
];

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
      description: editData?.description || '',
      defaultSubmissionType:
        editData?.defaultSubmissionType !== undefined && editData?.defaultSubmissionType !== null
          ? editData.defaultSubmissionType
          : '',
      defaultDueDays:
        editData?.defaultDueDays !== undefined && editData?.defaultDueDays !== null
          ? editData.defaultDueDays
          : '',
      status: editData?.status !== undefined ? editData.status : 0,
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
      description: Yup.string().nullable(),
      defaultDueDays: Yup.number()
        .integer('Due days must be an integer')
        .min(0, 'Default due days cannot be negative')
        .nullable(),
      defaultSubmissionType: Yup.number().nullable(),
      status: Yup.number().required('Status is required'),
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

        const payload = {
          homeworkTypeName: values.homeworkTypeName,
          description: values.description || undefined,
          defaultSubmissionType:
            values.defaultSubmissionType !== '' ? Number(values.defaultSubmissionType) : undefined,
          defaultDueDays: values.defaultDueDays !== '' ? Number(values.defaultDueDays) : undefined,
          defaultMarks: undefined,
          evaluationRequired: false,
          defaultEvaluationMethod: null,
          status: Number(values.status),
        };

        if (editData) {
          await updateHomeworkType({
            homeworkTypeId: editData.id,
            ...payload,
            academicMediumId,
          }).unwrap();
          shikshaMitraToast.success({
            message: `"${values.homeworkTypeName}" Homework Type updated successfully`,
          });
        } else {
          await addHomeworkType({
            data: payload,
            academicMediumId,
          }).unwrap();
          shikshaMitraToast.success({
            message: `"${values.homeworkTypeName}" Homework Type added successfully`,
          });
        }
        onClose(null, true);
      } catch (error: any) {
        console.error('Failed to save homework type', error);
        shikshaMitraToast.error({
          message: error?.data?.message || 'Failed to save homework type',
        });
      }
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      {/* <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}> */}
      <DialogScrollContent>
        <FormSectionCard
          title="Homework Type Details"
          icon={GlobalIcons.notebook}
          descriptionTooltip="Set the name, submission defaults, due days, and status for this homework type."
          titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
        >
          <Stack spacing={2}>
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
                inputProps={{ maxLength: 50 }}
                error={formik.touched.homeworkTypeName && Boolean(formik.errors.homeworkTypeName)}
                helperText={formik.touched.homeworkTypeName && formik.errors.homeworkTypeName}
              />
            </ShakingTextField>

            <TextField
              fullWidth
              size="small"
              name="description"
              label="Description"
              multiline
              rows={2}
              value={formik.values.description}
              onChange={formik.handleChange}
              inputProps={{ maxLength: 250 }}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
            />

            <TextField
              fullWidth
              select
              size="small"
              name="defaultSubmissionType"
              label="Default Submission Type"
              value={formik.values.defaultSubmissionType}
              onChange={formik.handleChange}
              error={
                formik.touched.defaultSubmissionType && Boolean(formik.errors.defaultSubmissionType)
              }
              helperText={
                formik.touched.defaultSubmissionType && formik.errors.defaultSubmissionType
              }
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {SUBMISSION_TYPES.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              type="number"
              size="small"
              name="defaultDueDays"
              label="Default Due Days"
              value={formik.values.defaultDueDays}
              onChange={formik.handleChange}
              onInput={(e: any) => {
                if (e.target.value.length > 3) {
                  e.target.value = e.target.value.slice(0, 3);
                }
              }}
              inputProps={{ min: 0, max: 999 }}
              error={formik.touched.defaultDueDays && Boolean(formik.errors.defaultDueDays)}
              helperText={formik.touched.defaultDueDays && formik.errors.defaultDueDays}
            />
          </Stack>
        </FormSectionCard>
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
          Submit
        </LoadingButton>
      </DialogActions>
      {/* </form> */}
    </BackPopUpChecked>
  );
};

export default HomeworkTypeForm;
