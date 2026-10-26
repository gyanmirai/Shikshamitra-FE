import type { Medium } from 'src/types/school';
import type { RootState } from 'src/redux/store';

import { useFormik } from 'formik';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import SubmitButton from 'src/components/submit-button';
import CancelButton from 'src/components/cancel-button';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { FormSectionCard } from 'src/components/form-section-card';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Box, Grid, Stack, TextField, Autocomplete, DialogActions } from '@mui/material';
import { useGetGradeScalingsQuery } from 'src/redux/academicAPI/ExaminationApi/examSetting/grade-scalling-api';
import {
  useAddExaminationTypeMutation,
  useUpdateExaminationTypeMutation,
} from 'src/redux/academicAPI/ExaminationApi/examSetting/exam-type-api';

import { getExamTypeInitialValues } from '../initialValues';
import { examTypeValidationSchema } from '../validationSchema';

import type { IExamType, IExamTypeFormProps } from '../type';

const CATEGORY_OPTIONS = [
  { value: 'Main Exam', label: 'Main Exam' },
  { value: 'Internal Assessment', label: 'Internal Assessment' },
  { value: 'Practical', label: 'Practical' },
  { value: 'Oral', label: 'Oral' },
  { value: 'Other', label: 'Other' },
];

const STATUS_OPTIONS = [
  { value: 0, label: 'Active' },
  { value: 2, label: 'System Default' },
  { value: 3, label: 'Archived' },
];

const SELECTABLE_SETTING_STATUSES = new Set([0, 2, 'Active', 'SystemDefault']);

const isSelectableSetting = (item: any) =>
  item?.status == null || SELECTABLE_SETTING_STATUSES.has(item.status);

const ExamTypeForm: React.FC<IExamTypeFormProps> = ({
  onClose,
  onSubmit,
  data = null,
  isEdit = false,
  existingNames,
}) => {
  const { currentMedium } = useSelector((state: RootState) => state.globalState);

  const { data: gradeScalings } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetGradeScalingsQuery,
    params: { academicMediumId: (currentMedium as Medium)?.id, includeArchived: false },
    options: {
      skip: !(currentMedium as Medium)?.id,
    },
  });

  const gradeScaleOptions = useMemo(
    () =>
      (gradeScalings?.data || []).filter(isSelectableSetting).map((gs: any) => ({
        value: gs.id,
        label: `${gs.name} (${gs.totalMarks} Marks)`,
      })),
    [gradeScalings]
  );

  const [addExaminationType, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddExaminationTypeMutation,
  });
  const [updateExaminationType, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateExaminationTypeMutation,
  });

  // Initialize formik form handling with validation and submission logic
  const formik = useFormik({
    initialValues: getExamTypeInitialValues(data),
    validationSchema: examTypeValidationSchema(existingNames || new Set(), data),
    onSubmit: async (values) => {
      try {
        const payloadBody = {
          examType: values.examType,
          description: values.description,
          category: values.category || null,
          status: Number(values.status),
          defaultTotalMarks:
            values.defaultTotalMarks !== '' ? Number(values.defaultTotalMarks) : null,
          defaultWeightage: values.defaultWeightage !== '' ? Number(values.defaultWeightage) : null,
          defaultGradeScaleId: values.defaultGradeScaleId || null,
        };

        if (data) {
          const payload = {
            academicMediumId: (currentMedium as Medium).id,
            id: (data as IExamType).id,
            body: payloadBody,
          };
          await updateExaminationType(payload).unwrap();
          shikshaMitraToast.success({
            message: `"${values.examType}" Exam type updated successfully`,
          });
        } else {
          const payload = {
            academicMediumId: (currentMedium as Medium).id,
            body: payloadBody,
          };
          await addExaminationType(payload).unwrap();
          shikshaMitraToast.success({
            message: `"${values.examType}" Exam type added successfully`,
          });
        }
        onClose(null, true);
      } catch (error) {
        console.error('Failed to save exam type', error);
      }
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <Box display="flex" flexDirection="column" sx={{ flex: '1 1 auto', minHeight: 0 }}>
        <DialogScrollContent>
          <Stack spacing={2}>
            <FormSectionCard
              icon={GlobalIcons.notebook}
              title="Basic Information"
              descriptionTooltip="Name, category and current status"
            >
              <Grid container spacing={2}>
                <Grid size={12}>
                  <ShakingTextField error={!!(formik.touched.examType && formik.errors.examType)}>
                    <TextField
                      fullWidth
                      required
                      label="Exam type"
                      name="examType"
                      size="small"
                      value={formik.values.examType}
                      onChange={(e) => {
                        const value = e.target.value
                          .replace(/[^a-zA-Z\s]/g, '')
                          .split(' ')
                          .map((word) =>
                            word ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : ''
                          )
                          .join(' ');
                        formik.setFieldValue('examType', value);
                      }}
                      error={formik.touched.examType && Boolean(formik.errors.examType)}
                      helperText={formik.touched.examType && formik.errors.examType}
                    />
                  </ShakingTextField>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomSelect
                    fullWidth
                    label="Category"
                    options={CATEGORY_OPTIONS}
                    name="category"
                    size="small"
                    value={formik.values.category}
                    onChange={(val) => formik.setFieldValue('category', val)}
                    error={formik.touched.category && Boolean(formik.errors.category)}
                    helperText={formik.touched.category ? (formik.errors.category as string) : ''}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!(formik.touched.status && formik.errors.status)}>
                    <CustomSelect
                      fullWidth
                      required
                      label="Status"
                      options={STATUS_OPTIONS}
                      name="status"
                      size="small"
                      value={formik.values.status}
                      onChange={(val) => formik.setFieldValue('status', val)}
                      error={formik.touched.status && Boolean(formik.errors.status)}
                      helperText={formik.touched.status ? (formik.errors.status as string) : ''}
                    />
                  </ShakingTextField>
                </Grid>

                <Grid size={12}>
                  <ShakingTextField
                    error={!!(formik.touched.description && formik.errors.description)}
                  >
                    <TextField
                      fullWidth
                      label="Description"
                      name="description"
                      size="small"
                      rows={2}
                      multiline
                      value={formik.values.description}
                      onChange={formik.handleChange}
                      error={formik.touched.description && Boolean(formik.errors.description)}
                      helperText={formik.touched.description && formik.errors.description}
                    />
                  </ShakingTextField>
                </Grid>
              </Grid>
            </FormSectionCard>

            <FormSectionCard
              icon={GlobalIcons.stationaryIcon}
              title="Default Rules & Parameters"
              descriptionTooltip="Defaults applied when this exam type is used"
            >
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField
                    error={!!(formik.touched.defaultTotalMarks && formik.errors.defaultTotalMarks)}
                  >
                    <TextField
                      fullWidth
                      label="Default total marks"
                      name="defaultTotalMarks"
                      type="number"
                      size="small"
                      value={formik.values.defaultTotalMarks}
                      onChange={formik.handleChange}
                      error={
                        formik.touched.defaultTotalMarks && Boolean(formik.errors.defaultTotalMarks)
                      }
                      helperText={
                        formik.touched.defaultTotalMarks && formik.errors.defaultTotalMarks
                      }
                    />
                  </ShakingTextField>
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField
                    error={!!(formik.touched.defaultWeightage && formik.errors.defaultWeightage)}
                  >
                    <TextField
                      fullWidth
                      label="Default weightage (%)"
                      name="defaultWeightage"
                      type="number"
                      size="small"
                      value={formik.values.defaultWeightage}
                      onChange={formik.handleChange}
                      error={
                        formik.touched.defaultWeightage && Boolean(formik.errors.defaultWeightage)
                      }
                      helperText={formik.touched.defaultWeightage && formik.errors.defaultWeightage}
                    />
                  </ShakingTextField>
                </Grid>

                <Grid size={12}>
                  <CustomTooltip
                    title={
                      gradeScaleOptions.find(
                        (opt: any) => opt.value === formik.values.defaultGradeScaleId
                      )?.label
                    }
                  >
                    <Autocomplete
                      size="small"
                      fullWidth
                      options={gradeScaleOptions}
                      value={
                        gradeScaleOptions.find(
                          (opt: any) => opt.value === formik.values.defaultGradeScaleId
                        ) || null
                      }
                      getOptionLabel={(option) => option.label}
                      isOptionEqualToValue={(option, value) => option.value === value.value}
                      onChange={(_event, newValue) => {
                        formik.setFieldValue('defaultGradeScaleId', newValue ? newValue.value : '');
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label="Default grade scale"
                          error={
                            formik.touched.defaultGradeScaleId &&
                            Boolean(formik.errors.defaultGradeScaleId)
                          }
                          helperText={
                            formik.touched.defaultGradeScaleId
                              ? (formik.errors.defaultGradeScaleId as string)
                              : ''
                          }
                        />
                      )}
                    />
                  </CustomTooltip>
                </Grid>
              </Grid>
            </FormSectionCard>
          </Stack>
        </DialogScrollContent>
        <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
          <CancelButton onClick={() => onClose(undefined, false)} />
          <SubmitButton
            loading={isUpdateLoading || isAddLoading}
            buttonText={data ? 'Update' : 'Submit'}
            startIcon={
              <Iconify
                icon={data ? GlobalIcons.edit : GlobalIcons.submit}
                width={data ? 16 : 20}
                height={data ? 16 : 20}
              />
            }
            onClick={() => {
              formik.handleSubmit();
            }}
          />
        </DialogActions>
      </Box>
    </BackPopUpChecked>
  );
};

export default ExamTypeForm;
