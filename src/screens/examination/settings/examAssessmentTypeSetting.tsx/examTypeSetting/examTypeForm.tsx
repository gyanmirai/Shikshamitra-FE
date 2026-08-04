import type { Medium } from 'src/types/school';
import type { RootState } from 'src/redux/store';

import { useFormik } from 'formik';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import SubmitButton from 'src/components/submit-button';
import CancelButton from 'src/components/cancel-button';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { alpha, useTheme } from '@mui/material/styles';
import CustomSelect from 'src/components/custom-select';
import CustomTooltip from 'src/components/custom-tooltip';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { useGetGradeScalingsQuery } from 'src/redux/academicAPI/ExaminationApi/examSetting/grade-scalling-api';
import {
  Box,
  Grid,
  Stack,
  TextField,
  Typography,
  DialogActions,
  Autocomplete,
} from '@mui/material';
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

const SectionHeader = ({
  icon,
  title,
  caption,
  iconBg,
}: {
  icon: string;
  title: string;
  caption: string;
  iconBg: string;
}) => (
  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
    <Box
      sx={{
        width: 34,
        height: 34,
        flexShrink: 0,
        borderRadius: 1.5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: iconBg,
        color: 'primary.main',
      }}
    >
      <Iconify icon={icon} width={18} height={18} />
    </Box>
    <Box>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
        {title}
      </Typography>
      <Typography variant="caption" color="text.secondary">
        {caption}
      </Typography>
    </Box>
  </Stack>
);

const ExamTypeForm: React.FC<IExamTypeFormProps> = ({
  onClose,
  onSubmit,
  data = null,
  isEdit = false,
  existingNames,
}) => {
  const theme = useTheme();
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

  const fieldSx = {
    '& .MuiOutlinedInput-root': { borderRadius: 1.5 },
  };

  const sectionCardSx = {
    p: 2,
    borderRadius: 2,
    border: `1px solid ${theme.palette.divider}`,
    bgcolor: alpha(theme.palette.grey[500], 0.04),
  };

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <Box display="flex" flexDirection="column" gap={1}>
        <Scrollbar sx={{ height: '480px' }}>
          <Stack spacing={1} sx={{ p: 2 }}>
            {/* Section 1: Basic Information */}
            <Box sx={sectionCardSx}>
              <SectionHeader
                icon="solar:notes-bold-duotone"
                title="Basic Information"
                caption="Name, category and current status"
                iconBg={alpha(theme.palette.primary.main, 0.1)}
              />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <ShakingTextField error={!!(formik.touched.examType && formik.errors.examType)}>
                    <TextField
                      fullWidth
                      label="Exam Type *"
                      name="examType"
                      size="small"
                      sx={fieldSx}
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
                    sx={fieldSx}
                    value={formik.values.category}
                    onChange={(val) => formik.setFieldValue('category', val)}
                    error={formik.touched.category && Boolean(formik.errors.category)}
                    helperText={formik.touched.category ? (formik.errors.category as string) : ''}
                  />
                </Grid>

                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomSelect
                    fullWidth
                    label="Status *"
                    options={STATUS_OPTIONS}
                    name="status"
                    size="small"
                    sx={fieldSx}
                    value={formik.values.status}
                    onChange={(val) => formik.setFieldValue('status', val)}
                    error={formik.touched.status && Boolean(formik.errors.status)}
                    helperText={formik.touched.status ? (formik.errors.status as string) : ''}
                  />
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
                      sx={fieldSx}
                      value={formik.values.description}
                      onChange={formik.handleChange}
                      error={formik.touched.description && Boolean(formik.errors.description)}
                      helperText={formik.touched.description && formik.errors.description}
                    />
                  </ShakingTextField>
                </Grid>
              </Grid>
            </Box>

            {/* Section 2: Default Rules & Parameters */}
            <Box sx={sectionCardSx}>
              <SectionHeader
                icon="solar:ruler-cross-pen-bold-duotone"
                title="Default Rules & Parameters"
                caption="Defaults applied when this exam type is used"
                iconBg={alpha(theme.palette.primary.main, 0.1)}
              />
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, sm: 4 }}>
                  <ShakingTextField
                    error={!!(formik.touched.defaultTotalMarks && formik.errors.defaultTotalMarks)}
                  >
                    <TextField
                      fullWidth
                      label="Default Total Marks"
                      name="defaultTotalMarks"
                      type="number"
                      size="small"
                      sx={fieldSx}
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

                <Grid size={{ xs: 12, sm: 4 }}>
                  <ShakingTextField
                    error={!!(formik.touched.defaultWeightage && formik.errors.defaultWeightage)}
                  >
                    <TextField
                      fullWidth
                      label="Default Weightage (%)"
                      name="defaultWeightage"
                      type="number"
                      size="small"
                      sx={fieldSx}
                      value={formik.values.defaultWeightage}
                      onChange={formik.handleChange}
                      error={
                        formik.touched.defaultWeightage && Boolean(formik.errors.defaultWeightage)
                      }
                      helperText={formik.touched.defaultWeightage && formik.errors.defaultWeightage}
                    />
                  </ShakingTextField>
                </Grid>

                <Grid size={{ xs: 12, sm: 4 }}>
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
                          label="Default Grade Scale"
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
            </Box>
          </Stack>
        </Scrollbar>
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
