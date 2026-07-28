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
import { Stack, Button, TextField, DialogActions, MenuItem, FormControlLabel, Switch } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  useAddAssignmentTypeMutation,
  useUpdateAssignmentTypeMutation,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/Settings/AssignmentTypesApi';

import type { IAssignmentTypeFormProps } from './type';

const SUBMISSION_TYPES = [
  { value: 0, label: 'Online Text' },
  { value: 1, label: 'File Upload' },
  { value: 2, label: 'In-Person' },
  { value: 3, label: 'No Submission Required' },
];

const EVALUATION_METHODS = [
  { value: 0, label: 'Marks' },
  { value: 1, label: 'Grade' },
  { value: 2, label: 'Rubric' },
  { value: 3, label: 'Checklist' },
  { value: 4, label: 'Feedback Only' },
  { value: 5, label: 'No Evaluation' },
];

const STATUS_OPTIONS = [
  { value: 0, label: 'Active' },
  { value: 1, label: 'Inactive' },
];

const AssignmentTypeForm: React.FC<IAssignmentTypeFormProps> = ({
  open,
  onClose,
  editData,
  existingTypes = [],
}) => {
  const { currentMedium } = useSelector((state: RootState) => state.globalState);

  const existingNames = useMemo(
    () => new Set<string>(existingTypes.map((t) => t.assignmentTypeName.trim().toLowerCase())),
    [existingTypes]
  );
  const existingNamesRef = useRef<Set<string>>(new Set());
  existingNamesRef.current = existingNames;

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
      description: editData?.description || '',
      defaultSubmissionType: editData?.defaultSubmissionType !== undefined && editData?.defaultSubmissionType !== null ? editData.defaultSubmissionType : '',
      defaultMarks: editData?.defaultMarks !== undefined && editData?.defaultMarks !== null ? editData.defaultMarks : '',
      defaultDueDays: editData?.defaultDueDays !== undefined && editData?.defaultDueDays !== null ? editData.defaultDueDays : '',
      evaluationRequired: editData?.evaluationRequired !== undefined ? editData.evaluationRequired : true,
      defaultEvaluationMethod: editData?.defaultEvaluationMethod !== undefined && editData?.defaultEvaluationMethod !== null ? editData.defaultEvaluationMethod : '',
      status: editData?.status !== undefined ? editData.status : 0,
    },
    enableReinitialize: true,
    validationSchema: Yup.object().shape({
      assignmentTypeName: Yup.string()
        .required('Name is required')
        .test('unique-assignment-type', 'This assignment type already exists', (value) => {
          if (!value?.trim()) return true;
          const trimmed = value.trim().toLowerCase();
          // Allow saving the same name when editing the current record
          if (editData && editData.assignmentTypeName.trim().toLowerCase() === trimmed) return true;
          return !existingNamesRef.current.has(trimmed);
        }),
      description: Yup.string().max(250, 'Description cannot exceed 250 characters'),
      defaultMarks: Yup.number().min(0, 'Default marks cannot be negative').nullable(),
      defaultDueDays: Yup.number().integer('Due days must be an integer').min(0, 'Default due days cannot be negative').nullable(),
      evaluationRequired: Yup.boolean(),
      defaultSubmissionType: Yup.number().nullable(),
      defaultEvaluationMethod: Yup.number().nullable(),
      status: Yup.number().required('Status is required'),
    }),
    onSubmit: async (values) => {
      try {
        const payload = {
          assignmentTypeName: values.assignmentTypeName,
          description: values.description || undefined,
          defaultSubmissionType: values.defaultSubmissionType !== '' ? Number(values.defaultSubmissionType) : undefined,
          defaultMarks: values.defaultMarks !== '' ? Number(values.defaultMarks) : undefined,
          defaultDueDays: values.defaultDueDays !== '' ? Number(values.defaultDueDays) : undefined,
          evaluationRequired: !!values.evaluationRequired,
          defaultEvaluationMethod: values.evaluationRequired && values.defaultEvaluationMethod !== '' ? Number(values.defaultEvaluationMethod) : undefined,
          status: Number(values.status),
        };

        if (editData) {
          await updateAssignmentType({
            assignmentTypeId: editData.id,
            academicMediumId: (currentMedium as any).id,
            data: payload,
          }).unwrap();
          shikshaMitraToast.success({
            message: `"${values.assignmentTypeName}" Assignment Type updated successfully`,
          });
        } else {
          await addAssignmentType({
            academicMediumId: (currentMedium as any).id,
            data: payload,
          }).unwrap();
          shikshaMitraToast.success({
            message: `"${values.assignmentTypeName}" Assignment Type added successfully`,
          });
        }
        onClose(null, true);
      } catch (error: any) {
        console.error('Failed to save assignment type', error);
        shikshaMitraToast.error({
          message: error?.data?.message || 'Failed to save assignment type',
        });
      }
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      {/* <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}> */}
      <DialogScrollContent>
        <Stack spacing={2}>
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

          <TextField
            fullWidth
            size="small"
            name="description"
            label="Description"
            multiline
            rows={2}
            value={formik.values.description}
            onChange={formik.handleChange}
            error={formik.touched.description && Boolean(formik.errors.description)}
            helperText={formik.touched.description && formik.errors.description}
          />

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <TextField
              fullWidth
              select
              size="small"
              name="defaultSubmissionType"
              label="Default Submission Type"
              value={formik.values.defaultSubmissionType}
              onChange={formik.handleChange}
              error={formik.touched.defaultSubmissionType && Boolean(formik.errors.defaultSubmissionType)}
              helperText={formik.touched.defaultSubmissionType && formik.errors.defaultSubmissionType}
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
              select
              size="small"
              name="status"
              label="Status"
              value={formik.values.status}
              onChange={formik.handleChange}
              error={formik.touched.status && Boolean(formik.errors.status)}
              helperText={formik.touched.status && formik.errors.status}
            >
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
            <TextField
              fullWidth
              type="number"
              size="small"
              name="defaultMarks"
              label="Default Marks"
              value={formik.values.defaultMarks}
              onChange={formik.handleChange}
              error={formik.touched.defaultMarks && Boolean(formik.errors.defaultMarks)}
              helperText={formik.touched.defaultMarks && formik.errors.defaultMarks}
            />

            <TextField
              fullWidth
              type="number"
              size="small"
              name="defaultDueDays"
              label="Default Due Days"
              value={formik.values.defaultDueDays}
              onChange={formik.handleChange}
              error={formik.touched.defaultDueDays && Boolean(formik.errors.defaultDueDays)}
              helperText={formik.touched.defaultDueDays && formik.errors.defaultDueDays}
            />
          </Stack>

          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={formik.values.evaluationRequired}
                  onChange={(e) => {
                    formik.setFieldValue('evaluationRequired', e.target.checked);
                    if (!e.target.checked) {
                      formik.setFieldValue('defaultEvaluationMethod', '');
                    }
                  }}
                  name="evaluationRequired"
                  color="primary"
                />
              }
              label="Evaluation Required"
            />
          </Stack>

          {formik.values.evaluationRequired && (
            <TextField
              fullWidth
              select
              size="small"
              name="defaultEvaluationMethod"
              label="Default Evaluation Method"
              value={formik.values.defaultEvaluationMethod}
              onChange={formik.handleChange}
              error={formik.touched.defaultEvaluationMethod && Boolean(formik.errors.defaultEvaluationMethod)}
              helperText={formik.touched.defaultEvaluationMethod && formik.errors.defaultEvaluationMethod}
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {EVALUATION_METHODS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          )}
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
