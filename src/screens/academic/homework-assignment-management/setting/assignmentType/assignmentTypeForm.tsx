'use client';

import type { RootState } from 'src/redux/store';

import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import { FormSectionCard } from 'src/components/form-section-card';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  Stack,
  Button,
  Switch,
  MenuItem,
  TextField,
  DialogActions,
  FormControlLabel,
} from '@mui/material';
import {
  useAddAssignmentTypeMutation,
  useUpdateAssignmentTypeMutation,
} from 'src/redux/academicAPI/HomeworkAssignmentApi/Settings/AssignmentTypesApi';
import {
  evaluationUsesMarks,
  AssignmentTypeStatus,
  AssignmentEvaluationMethod,
  ASSIGNMENT_SUBMISSION_TYPE_OPTIONS,
  ASSIGNMENT_TYPE_EVALUATION_METHOD_OPTIONS,
} from 'src/enums/assignment';

import {
  mapAssignmentTypeFormToDto,
  getAssignmentTypeInitialValues,
  createAssignmentTypeValidationSchema,
} from './assignmentTypeFormData';

import type { IAssignmentTypeFormProps } from './type';

const STATUS_OPTIONS = [
  { value: AssignmentTypeStatus.Active, label: 'Active' },
  { value: AssignmentTypeStatus.Inactive, label: 'Inactive' },
];

const AssignmentTypeForm = ({
  onClose,
  editData,
  existingTypes = [],
}: IAssignmentTypeFormProps) => {
  const { currentMedium } = useSelector((state: RootState) => state.globalState);
  const existingNames = new Set(
    existingTypes.map((assignmentType) => assignmentType.assignmentTypeName.trim().toLowerCase())
  );

  const [addAssignmentType, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddAssignmentTypeMutation,
  });
  const [updateAssignmentType, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateAssignmentTypeMutation,
  });

  const formik = useFormik({
    initialValues: getAssignmentTypeInitialValues(editData),
    enableReinitialize: true,
    validationSchema: createAssignmentTypeValidationSchema(
      existingNames,
      editData?.assignmentTypeName
    ),
    onSubmit: async (values) => {
      if (!currentMedium?.id) {
        shikshaMitraToast.error({ message: 'Select an academic medium before saving.' });
        return;
      }

      const payload = mapAssignmentTypeFormToDto(values);

      try {
        if (editData) {
          await updateAssignmentType({
            assignmentTypeId: editData.id,
            academicMediumId: currentMedium.id,
            data: payload,
          }).unwrap();
          shikshaMitraToast.success({
            message: `"${payload.assignmentTypeName}" Assignment Type updated successfully`,
          });
        } else {
          await addAssignmentType({ academicMediumId: currentMedium.id, data: payload }).unwrap();
          shikshaMitraToast.success({
            message: `"${payload.assignmentTypeName}" Assignment Type added successfully`,
          });
        }
        onClose(null, true);
      } catch (error: unknown) {
        shikshaMitraToast.error({
          message: parseApiProblemDetail(error).detail || 'Failed to save assignment type',
        });
      }
    },
  });

  const method =
    formik.values.defaultEvaluationMethod === ''
      ? undefined
      : formik.values.defaultEvaluationMethod;
  const showDefaultMarks = evaluationUsesMarks(formik.values.evaluationRequired, method);

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <FormSectionCard
          title="Assignment Type Details"
          icon={GlobalIcons.notebook}
          descriptionTooltip="Set submission and evaluation defaults for assignments using this type."
          titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
        >
          <Stack spacing={2}>
            <ShakingTextField
              error={Boolean(formik.touched.assignmentTypeName && formik.errors.assignmentTypeName)}
            >
              <TextField
                fullWidth
                size="small"
                name="assignmentTypeName"
                label="Name"
                required
                value={formik.values.assignmentTypeName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  formik.touched.assignmentTypeName && Boolean(formik.errors.assignmentTypeName)
                }
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
              onBlur={formik.handleBlur}
              error={formik.touched.description && Boolean(formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                select
                size="small"
                name="defaultSubmissionType"
                label="Default submission type"
                value={formik.values.defaultSubmissionType}
                onChange={formik.handleChange}
                error={
                  formik.touched.defaultSubmissionType &&
                  Boolean(formik.errors.defaultSubmissionType)
                }
                helperText={
                  formik.touched.defaultSubmissionType && formik.errors.defaultSubmissionType
                }
              >
                <MenuItem value="">
                  <em>None</em>
                </MenuItem>
                {ASSIGNMENT_SUBMISSION_TYPE_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              {showDefaultMarks && (
                <TextField
                  fullWidth
                  type="number"
                  size="small"
                  name="defaultMarks"
                  label="Default marks"
                  value={formik.values.defaultMarks}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  inputProps={{ min: 1 }}
                  error={formik.touched.defaultMarks && Boolean(formik.errors.defaultMarks)}
                  helperText={formik.touched.defaultMarks && formik.errors.defaultMarks}
                />
              )}

              <TextField
                fullWidth
                type="number"
                size="small"
                name="defaultDueDays"
                label="Default due days"
                value={formik.values.defaultDueDays}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                inputProps={{ min: 1 }}
                error={formik.touched.defaultDueDays && Boolean(formik.errors.defaultDueDays)}
                helperText={formik.touched.defaultDueDays && formik.errors.defaultDueDays}
              />
            </Stack>

            <FormControlLabel
              control={
                <Switch
                  checked={formik.values.evaluationRequired}
                  onChange={(event) => {
                    const evaluationRequired = event.target.checked;
                    formik.setFieldValue('evaluationRequired', evaluationRequired);
                    formik.setFieldValue(
                      'defaultEvaluationMethod',
                      evaluationRequired ? '' : AssignmentEvaluationMethod.NoEvaluation
                    );
                    if (!evaluationRequired) formik.setFieldValue('defaultMarks', '');
                  }}
                  name="evaluationRequired"
                  color="primary"
                />
              }
              label="Evaluation required"
            />

            {formik.values.evaluationRequired && (
              <ShakingTextField
                error={Boolean(
                  formik.touched.defaultEvaluationMethod && formik.errors.defaultEvaluationMethod
                )}
              >
                <TextField
                  fullWidth
                  select
                  size="small"
                  name="defaultEvaluationMethod"
                  label="Default evaluation method"
                  required
                  value={formik.values.defaultEvaluationMethod}
                  onChange={(event) => {
                    const evaluationMethod = Number(
                      event.target.value
                    ) as AssignmentEvaluationMethod;
                    formik.setFieldValue('defaultEvaluationMethod', evaluationMethod);
                    if (
                      !evaluationUsesMarks(formik.values.evaluationRequired, evaluationMethod) &&
                      formik.values.defaultMarks !== ''
                    ) {
                      formik.setFieldValue('defaultMarks', '');
                    }
                  }}
                  error={
                    formik.touched.defaultEvaluationMethod &&
                    Boolean(formik.errors.defaultEvaluationMethod)
                  }
                  helperText={
                    formik.touched.defaultEvaluationMethod && formik.errors.defaultEvaluationMethod
                  }
                >
                  <MenuItem value="" disabled>
                    <em>Select method</em>
                  </MenuItem>
                  {ASSIGNMENT_TYPE_EVALUATION_METHOD_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </ShakingTextField>
            )}
          </Stack>
        </FormSectionCard>
      </DialogScrollContent>

      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={() => onClose(null, false)}
          variant="outlined"
          size="small"
          disabled={isAddLoading || isUpdateLoading}
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
          onClick={() => formik.handleSubmit()}
          variant="contained"
          size="small"
        >
          Submit
        </LoadingButton>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default AssignmentTypeForm;
