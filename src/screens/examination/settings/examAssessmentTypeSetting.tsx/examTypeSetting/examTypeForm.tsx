import type { Medium } from 'src/types/school';
import type { RootState } from 'src/redux/store';

import { useFormik } from 'formik';
import React, { useMemo } from 'react';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { alpha, useTheme } from '@mui/material/styles';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { useGetGradeScalingsQuery } from 'src/redux/academicAPI/ExaminationApi/examSetting/grade-scalling-api';
import {
  Box,
  Grid,
  Stack,
  Button,
  Switch,
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';
import {
  useGetExaminationTypesQuery,
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
  { value: 1, label: 'Inactive' },
  { value: 2, label: 'System Default' },
  { value: 3, label: 'Archived' },
];

const TOGGLE_OPTIONS = [
  {
    name: 'includedInResult',
    icon: 'solar:document-text-bold-duotone',
    label: 'Include in Final Result',
    description: 'Shown on report cards',
  },
  {
    name: 'marksEntryRequired',
    icon: 'solar:pen-new-square-bold-duotone',
    label: 'Marks Entry Required',
    description: 'Teachers must enter marks',
  },
  {
    name: 'gradeScaleRequired',
    icon: 'solar:medal-star-bold-duotone',
    label: 'Grade Scale Required',
    description: 'Applies grade scale to marks',
  },
  {
    name: 'allowPracticalOral',
    icon: 'solar:test-tube-bold-duotone',
    label: 'Practical/Oral Split',
    description: 'Allow bifurcated marks entry',
  },
] as const;

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
  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
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
}) => {
  const theme = useTheme();
  const { currentMedium } = useSelector((state: RootState) => state.globalState);

  const { data: examTypeData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetExaminationTypesQuery,
    params: { academicMediumId: (currentMedium as Medium)?.id },
    options: {
      skip: !(currentMedium as Medium)?.id,
    },
  });

  const { data: gradeScalings } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetGradeScalingsQuery,
    params: { academicMediumId: (currentMedium as Medium)?.id },
    options: {
      skip: !(currentMedium as Medium)?.id,
    },
  });

  const gradeScaleOptions = useMemo(
    () =>
      (gradeScalings?.data || []).map((gs: any) => ({
        value: gs.id,
        label: `${gs.name} (${gs.totalMarks} Marks)`,
      })),
    [gradeScalings]
  );

  const existingNames = useMemo(
    () =>
      new Set<string>((examTypeData?.items ?? []).map((t: any) => t.examType.trim().toLowerCase())),
    [examTypeData]
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
    validationSchema: examTypeValidationSchema(existingNames, data),
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
          includedInResult: values.includedInResult,
          marksEntryRequired: values.marksEntryRequired,
          gradeScaleRequired: values.gradeScaleRequired,
          allowPracticalOral: values.allowPracticalOral,
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
    p: 2.5,
    borderRadius: 2,
    border: `1px solid ${theme.palette.divider}`,
    bgcolor: alpha(theme.palette.grey[500], 0.04),
  };

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <Box display="flex" flexDirection="column" gap={2}>
        <Scrollbar sx={{ height: '480px' }}>
          <Stack spacing={2.5} sx={{ p: 2.5 }}>
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
                  <CustomSelect
                    fullWidth
                    label="Default Grade Scale"
                    options={gradeScaleOptions}
                    name="defaultGradeScaleId"
                    size="small"
                    sx={fieldSx}
                    value={formik.values.defaultGradeScaleId}
                    onChange={(val) => formik.setFieldValue('defaultGradeScaleId', val)}
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
                </Grid>
              </Grid>
            </Box>

            {/* Section 3: System Rules & Behavior */}
            <Box sx={sectionCardSx}>
              <SectionHeader
                icon="solar:shield-check-bold-duotone"
                title="System Rules & Behavior"
                caption="Toggle how this exam type behaves"
                iconBg={alpha(theme.palette.primary.main, 0.1)}
              />
              <Grid container spacing={1.5}>
                {TOGGLE_OPTIONS.map((toggle) => {
                  const checked = Boolean(formik.values[toggle.name as keyof typeof formik.values]);
                  return (
                    <Grid key={toggle.name} size={{ xs: 12, sm: 6 }}>
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        spacing={1.5}
                        onClick={() => formik.setFieldValue(toggle.name, !checked)}
                        sx={{
                          p: 1.5,
                          borderRadius: 1.5,
                          cursor: 'pointer',
                          border: `1px solid ${checked ? alpha(theme.palette.primary.main, 0.5) : theme.palette.divider}`,
                          bgcolor: checked
                            ? alpha(theme.palette.primary.main, 0.06)
                            : 'background.paper',
                          transition: theme.transitions.create([
                            'background-color',
                            'border-color',
                          ]),
                          '&:hover': {
                            borderColor: alpha(theme.palette.primary.main, 0.5),
                          },
                        }}
                      >
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1.25}
                          sx={{ minWidth: 0 }}
                        >
                          <Box
                            sx={{
                              width: 30,
                              height: 30,
                              flexShrink: 0,
                              borderRadius: 1,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              bgcolor: checked
                                ? alpha(theme.palette.primary.main, 0.14)
                                : alpha(theme.palette.grey[500], 0.12),
                              color: checked ? 'primary.main' : 'text.secondary',
                            }}
                          >
                            <Iconify icon={toggle.icon} width={16} height={16} />
                          </Box>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={600} noWrap>
                              {toggle.label}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              noWrap
                              component="div"
                            >
                              {toggle.description}
                            </Typography>
                          </Box>
                        </Stack>
                        <Switch
                          size="small"
                          checked={checked}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => formik.setFieldValue(toggle.name, e.target.checked)}
                        />
                      </Stack>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          </Stack>
        </Scrollbar>
        <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
          <Button
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
            size="small"
            onClick={(e) => onClose(e, false)}
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
                icon={data ? GlobalIcons.edit : GlobalIcons.submit}
                width={data ? 16 : 20}
                height={data ? 16 : 20}
              />
            }
            onClick={(e: any) => {
              formik.handleSubmit(e);
            }}
            type="submit"
          >
            {data ? 'Update' : 'Submit'}
          </LoadingButton>
        </DialogActions>
      </Box>
    </BackPopUpChecked>
  );
};

export default ExamTypeForm;
