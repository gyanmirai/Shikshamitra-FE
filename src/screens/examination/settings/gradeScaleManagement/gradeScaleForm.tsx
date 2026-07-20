import type { Medium } from 'src/types/school';
import type { RootState } from 'src/redux/store';
import type { FormikErrors, FormikTouched } from 'formik';

import { useFormik } from 'formik';
import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { Add } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  useAddGradeScalingMutation,
  useUpdateGradeScalingMutation,
} from 'src/redux/academicAPI/ExaminationApi/examSetting/grade-scalling-api';
import {
  Tab,
  Box,
  Tabs,
  Grid,
  Button,
  Switch,
  Divider,
  TextField,
  IconButton,
  Typography,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import { getInitialValues } from './initialValues';
import { validationSchema } from './validationSchema';

import type { IGrade, IGradingScale, IGradeFormProps } from './type';

const HELPER_TEXT_PROPS = {
  sx: { margin: 0, position: 'static' as const, whiteSpace: 'normal' as const },
};

const STATUS_OPTIONS = [
  { value: 0, label: 'Active' },
  { value: 1, label: 'Inactive' },
  { value: 2, label: 'System Default' },
  { value: 3, label: 'Archived' },
];

const RESULT_STATUS_OPTIONS = [
  { value: 0, label: 'Pass' },
  { value: 1, label: 'Fail' },
  { value: 2, label: 'Optional' },
];

// Predefined templates for grade scaling
const TEMPLATES = [
  {
    name: '100 Marks Standard (A+ to F)',
    totalMarks: 100,
    passMarks: 33,
    gradingScale: [
      {
        minMarks: 91,
        maxMarks: 100,
        grade: 'A+',
        gradePoint: 10,
        remark: 'Excellent',
        resultStatus: 0,
      },
      {
        minMarks: 81,
        maxMarks: 90,
        grade: 'A',
        gradePoint: 9,
        remark: 'Very Good',
        resultStatus: 0,
      },
      { minMarks: 71, maxMarks: 80, grade: 'B+', gradePoint: 8, remark: 'Good', resultStatus: 0 },
      {
        minMarks: 61,
        maxMarks: 70,
        grade: 'B',
        gradePoint: 7,
        remark: 'Satisfactory',
        resultStatus: 0,
      },
      { minMarks: 51, maxMarks: 60, grade: 'C+', gradePoint: 6, remark: 'Fair', resultStatus: 0 },
      { minMarks: 41, maxMarks: 50, grade: 'C', gradePoint: 5, remark: 'Average', resultStatus: 0 },
      {
        minMarks: 33,
        maxMarks: 40,
        grade: 'D',
        gradePoint: 4,
        remark: 'Needs Improvement',
        resultStatus: 0,
      },
      { minMarks: 0, maxMarks: 32, grade: 'F', gradePoint: 0, remark: 'Fail', resultStatus: 1 },
    ],
  },
  {
    name: '50 Marks Scale',
    totalMarks: 50,
    passMarks: 17,
    gradingScale: [
      {
        minMarks: 46,
        maxMarks: 50,
        grade: 'A+',
        gradePoint: 10,
        remark: 'Excellent',
        resultStatus: 0,
      },
      {
        minMarks: 41,
        maxMarks: 45,
        grade: 'A',
        gradePoint: 9,
        remark: 'Very Good',
        resultStatus: 0,
      },
      { minMarks: 36, maxMarks: 40, grade: 'B+', gradePoint: 8, remark: 'Good', resultStatus: 0 },
      {
        minMarks: 31,
        maxMarks: 35,
        grade: 'B',
        gradePoint: 7,
        remark: 'Satisfactory',
        resultStatus: 0,
      },
      { minMarks: 26, maxMarks: 30, grade: 'C+', gradePoint: 6, remark: 'Fair', resultStatus: 0 },
      { minMarks: 21, maxMarks: 25, grade: 'C', gradePoint: 5, remark: 'Average', resultStatus: 0 },
      {
        minMarks: 17,
        maxMarks: 20,
        grade: 'D',
        gradePoint: 4,
        remark: 'Needs Improvement',
        resultStatus: 0,
      },
      { minMarks: 0, maxMarks: 16, grade: 'F', gradePoint: 0, remark: 'Fail', resultStatus: 1 },
    ],
  },
  {
    name: 'Pass / Fail Scale',
    totalMarks: 100,
    passMarks: 33,
    gradingScale: [
      {
        minMarks: 33,
        maxMarks: 100,
        grade: 'Pass',
        gradePoint: 10,
        remark: 'Passed',
        resultStatus: 0,
      },
      {
        minMarks: 0,
        maxMarks: 32,
        grade: 'Fail',
        gradePoint: 0,
        remark: 'Failed',
        resultStatus: 1,
      },
    ],
  },
];

const GradeForm: React.FC<IGradeFormProps> = ({ onSubmit, onClose, data, viewOnly = false }) => {
  const { currentMedium } = useSelector((state: RootState) => state.globalState);
  const [activeTab, setActiveTab] = useState(0);
  const [simMarks, setSimMarks] = useState<string>('');

  const [addGradeScaling, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddGradeScalingMutation,
  });
  const [updateGradeScaling, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateGradeScalingMutation,
  });

  const formik = useFormik({
    initialValues: getInitialValues(data),
    validationSchema,
    onSubmit: async (values) => {
      try {
        const payloadBody = {
          name: values.name,
          totalMarks: String(values.totalMarks),
          passMarks: values.passMarks !== '' ? Number(values.passMarks) : null,
          description: values.description,
          isDefault: values.isDefault,
          status: values.status,
          gradingScale: values.gradingScale.map((range: any) => ({
            minMarks: Number(range.minMarks),
            maxMarks: Number(range.maxMarks),
            grade: range.grade,
            gradePoint: range.gradePoint !== '' ? Number(range.gradePoint) : null,
            remark: range.remark,
            resultStatus: Number(range.resultStatus),
          })),
          educationMediumId: (currentMedium as Medium).id,
        };

        if (data) {
          const payload = {
            academicMediumId: (currentMedium as Medium).id,
            id: (data as IGrade).id,
            body: payloadBody,
          };
          await updateGradeScaling(payload).unwrap();
          shikshaMitraToast.success({
            message: `Grade scale: "${values.name}" updated successfully`,
          });
          onClose(null, true);
        } else {
          const payload = {
            academicMediumId: (currentMedium as Medium).id,
            body: payloadBody,
          };
          await addGradeScaling(payload).unwrap();
          shikshaMitraToast.success({
            message: `Grade scale: "${values.name}" added successfully`,
          });
          onClose(null, true);
        }
      } catch (error) {
        console.error('Failed to save subject', error);
      }
    },
  });

  const handleAddGradingScale = () => {
    const updatedGradingScale = [
      ...formik.values.gradingScale,
      { minMarks: '', maxMarks: '', grade: '', gradePoint: '', remark: '', resultStatus: 0 },
    ];
    formik.setFieldValue('gradingScale', updatedGradingScale);
  };

  const applyTemplate = (template: (typeof TEMPLATES)[0]) => {
    formik.setFieldValue('totalMarks', template.totalMarks);
    formik.setFieldValue('passMarks', template.passMarks);
    formik.setFieldValue('gradingScale', template.gradingScale);
    shikshaMitraToast.info({ message: `Prefilled template: "${template.name}"` });
  };

  // Simulator computation logic
  const marksInput = Number(simMarks);
  const matchedRange =
    simMarks !== '' && !Number.isNaN(marksInput)
      ? formik.values.gradingScale.find(
          (r: any) =>
            r.minMarks !== '' &&
            r.maxMarks !== '' &&
            marksInput >= Number(r.minMarks) &&
            marksInput <= Number(r.maxMarks)
        )
      : null;

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <Box display="flex" flexDirection="column" gap={1}>
        <Box borderBottom={1} borderColor="divider" px={2}>
          <Tabs value={activeTab} onChange={(_e, v) => setActiveTab(v)} variant="fullWidth">
            <Tab label="Basic Details" />
            <Tab label="Grade Ranges" />
            <Tab label="Simulator Preview" />
          </Tabs>
        </Box>

        <Scrollbar sx={{ p: 2, height: '400px' }}>
          {activeTab === 0 && (
            <Grid container spacing={1.5}>
              {/* Template Section */}
              {!data && !viewOnly && (
                <Grid size={{ xs: 12 }}>
                  <Box
                    p={2}
                    border="1px dashed"
                    borderColor="primary.main"
                    borderRadius={1}
                    bgcolor="background.neutral"
                  >
                    <Typography variant="subtitle2" gutterBottom color="primary.main">
                      Quick Start Templates
                    </Typography>
                    <Box display="flex" flexWrap="wrap" gap={1}>
                      {TEMPLATES.map((t, idx) => (
                        <Button
                          key={idx}
                          size="small"
                          variant="outlined"
                          onClick={() => applyTemplate(t)}
                        >
                          {t.name}
                        </Button>
                      ))}
                    </Box>
                  </Box>
                </Grid>
              )}

              <Grid size={{ xs: 12 }}>
                <ShakingTextField error={!!(formik.touched.name && formik.errors.name)}>
                  <TextField
                    fullWidth
                    label="Grade Scale Title *"
                    name="name"
                    size="small"
                    disabled={!!data || viewOnly}
                    value={formik.values.name}
                    onChange={formik.handleChange}
                    error={formik.touched.name && Boolean(formik.errors.name)}
                    helperText={formik.touched.name ? (formik.errors.name as string) : ''}
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField error={!!(formik.touched.totalMarks && formik.errors.totalMarks)}>
                  <TextField
                    fullWidth
                    label="Total Marks *"
                    name="totalMarks"
                    type="number"
                    disabled={!!data || viewOnly}
                    onKeyDown={(e) => {
                      if (['e', 'E', '+', '-', '.', 'ArrowUp', 'ArrowDown'].includes(e.key))
                        e.preventDefault();
                    }}
                    size="small"
                    value={formik.values.totalMarks}
                    onChange={formik.handleChange}
                    onWheel={(e) => (e.target as HTMLElement).blur()}
                    error={formik.touched.totalMarks && Boolean(formik.errors.totalMarks)}
                    helperText={
                      formik.touched.totalMarks ? (formik.errors.totalMarks as string) : ''
                    }
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField error={!!(formik.touched.passMarks && formik.errors.passMarks)}>
                  <TextField
                    fullWidth
                    label="Pass Marks"
                    name="passMarks"
                    type="number"
                    disabled={viewOnly}
                    onKeyDown={(e) => {
                      if (['e', 'E', '+', '-', '.', 'ArrowUp', 'ArrowDown'].includes(e.key))
                        e.preventDefault();
                    }}
                    size="small"
                    value={formik.values.passMarks}
                    onChange={formik.handleChange}
                    onWheel={(e) => (e.target as HTMLElement).blur()}
                    error={formik.touched.passMarks && Boolean(formik.errors.passMarks)}
                    helperText={formik.touched.passMarks ? (formik.errors.passMarks as string) : ''}
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <ShakingTextField
                  error={!!(formik.touched.description && formik.errors.description)}
                >
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    label="Description"
                    name="description"
                    disabled={viewOnly}
                    size="small"
                    value={formik.values.description}
                    onChange={formik.handleChange}
                    error={formik.touched.description && Boolean(formik.errors.description)}
                    helperText={
                      formik.touched.description ? (formik.errors.description as string) : ''
                    }
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <CustomSelect
                  fullWidth
                  label="Status *"
                  options={STATUS_OPTIONS}
                  name="status"
                  size="small"
                  disabled={viewOnly}
                  value={formik.values.status}
                  onChange={(val) => formik.setFieldValue('status', val)}
                  error={formik.touched.status && Boolean(formik.errors.status)}
                  helperText={formik.touched.status ? (formik.errors.status as string) : ''}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <FormControlLabel
                  control={
                    <Switch
                      name="isDefault"
                      disabled={viewOnly}
                      checked={formik.values.isDefault}
                      onChange={(e) => formik.setFieldValue('isDefault', e.target.checked)}
                    />
                  }
                  label="Set as Default Scale"
                />
              </Grid>
            </Grid>
          )}

          {activeTab === 1 && (
            <Grid container spacing={1}>
              <Grid size={{ xs: 12 }}>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                  <Typography variant="h6">Configured Grade Ranges</Typography>
                  {!viewOnly && (
                    <Button
                      startIcon={<Add />}
                      variant="contained"
                      size="small"
                      onClick={handleAddGradingScale}
                    >
                      Add Row
                    </Button>
                  )}
                </Box>
                {typeof formik.errors.gradingScale === 'string' && (
                  <Box
                    color="error.main"
                    mb={2}
                    p={1}
                    border="1px solid"
                    borderColor="error.light"
                    borderRadius={1}
                    bgcolor="error.lighter"
                  >
                    <Typography
                      variant="caption"
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                    >
                      <Iconify icon="solar:danger-bold" width={16} />
                      {formik.errors.gradingScale}
                    </Typography>
                  </Box>
                )}
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Box sx={{ overflowX: 'auto', pb: 1 }}>
                  {formik.values.gradingScale?.map((scale: IGradingScale, index: number) => (
                    <Grid
                      container
                      spacing={1}
                      key={index}
                      mb={2.5}
                      alignItems="center"
                      sx={{
                        minWidth: { md: 1120 },
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        pb: 2,
                      }}
                    >
                      <Grid size={{ xs: 12, md: 1.7 }}>
                        <ShakingTextField
                          error={
                            !!(
                              (formik.touched.gradingScale as FormikTouched<IGradingScale>[])?.[
                                index
                              ]?.minMarks &&
                              (formik.errors.gradingScale as FormikErrors<IGradingScale>[])?.[index]
                                ?.minMarks
                            )
                          }
                        >
                          <TextField
                            fullWidth
                            label="Min Marks *"
                            type="number"
                            name={`gradingScale.${index}.minMarks`}
                            size="small"
                            disabled={viewOnly}
                            value={formik.values.gradingScale[index].minMarks}
                            onChange={formik.handleChange}
                            onKeyDown={(e) => {
                              if (['e', 'E', '+', '-', '.', 'ArrowUp', 'ArrowDown'].includes(e.key))
                                e.preventDefault();
                            }}
                            onWheel={(e) => (e.target as HTMLElement).blur()}
                            error={
                              !!(
                                (formik.touched.gradingScale as FormikTouched<IGradingScale>[])?.[
                                  index
                                ]?.minMarks &&
                                (formik.errors.gradingScale as FormikErrors<IGradingScale>[])?.[
                                  index
                                ]?.minMarks
                              )
                            }
                            helperText={
                              (formik.touched.gradingScale as FormikTouched<IGradingScale>[])?.[
                                index
                              ]?.minMarks
                                ? (formik.errors.gradingScale as FormikErrors<IGradingScale>[])?.[
                                    index
                                  ]?.minMarks
                                : undefined
                            }
                            FormHelperTextProps={HELPER_TEXT_PROPS}
                          />
                        </ShakingTextField>
                      </Grid>

                      <Grid size={{ xs: 12, md: 1.7 }}>
                        <ShakingTextField
                          error={
                            !!(
                              (formik.touched.gradingScale as FormikTouched<IGradingScale>[])?.[
                                index
                              ]?.maxMarks &&
                              (formik.errors.gradingScale as FormikErrors<IGradingScale>[])?.[index]
                                ?.maxMarks
                            )
                          }
                        >
                          <TextField
                            fullWidth
                            label="Max Marks *"
                            type="number"
                            name={`gradingScale.${index}.maxMarks`}
                            size="small"
                            disabled={viewOnly}
                            value={formik.values.gradingScale[index].maxMarks}
                            onChange={formik.handleChange}
                            onKeyDown={(e) => {
                              if (['e', 'E', '+', '-', '.', 'ArrowUp', 'ArrowDown'].includes(e.key))
                                e.preventDefault();
                            }}
                            onWheel={(e) => (e.target as HTMLElement).blur()}
                            error={
                              !!(
                                (formik.touched.gradingScale as FormikTouched<IGradingScale>[])?.[
                                  index
                                ]?.maxMarks &&
                                (formik.errors.gradingScale as FormikErrors<IGradingScale>[])?.[
                                  index
                                ]?.maxMarks
                              )
                            }
                            helperText={
                              (formik.touched.gradingScale as FormikTouched<IGradingScale>[])?.[
                                index
                              ]?.maxMarks
                                ? (formik.errors.gradingScale as FormikErrors<IGradingScale>[])?.[
                                    index
                                  ]?.maxMarks
                                : undefined
                            }
                            FormHelperTextProps={HELPER_TEXT_PROPS}
                          />
                        </ShakingTextField>
                      </Grid>

                      <Grid size={{ xs: 12, md: 1.3 }}>
                        <ShakingTextField
                          error={
                            !!(
                              (formik.touched.gradingScale as FormikTouched<IGradingScale>[])?.[
                                index
                              ]?.grade &&
                              (formik.errors.gradingScale as FormikErrors<IGradingScale>[])?.[index]
                                ?.grade
                            )
                          }
                        >
                          <TextField
                            fullWidth
                            label="Grade *"
                            name={`gradingScale.${index}.grade`}
                            size="small"
                            disabled={viewOnly}
                            value={formik.values.gradingScale[index].grade}
                            onChange={formik.handleChange}
                            error={
                              !!(
                                (formik.touched.gradingScale as FormikTouched<IGradingScale>[])?.[
                                  index
                                ]?.grade &&
                                (formik.errors.gradingScale as FormikErrors<IGradingScale>[])?.[
                                  index
                                ]?.grade
                              )
                            }
                            helperText={
                              (formik.touched.gradingScale as FormikTouched<IGradingScale>[])?.[
                                index
                              ]?.grade
                                ? (formik.errors.gradingScale as FormikErrors<IGradingScale>[])?.[
                                    index
                                  ]?.grade
                                : undefined
                            }
                            FormHelperTextProps={HELPER_TEXT_PROPS}
                          />
                        </ShakingTextField>
                      </Grid>

                      <Grid size={{ xs: 12, md: 1.4 }}>
                        <ShakingTextField
                          error={
                            !!(
                              (formik.touched.gradingScale as FormikTouched<IGradingScale>[])?.[
                                index
                              ]?.gradePoint &&
                              (formik.errors.gradingScale as FormikErrors<IGradingScale>[])?.[index]
                                ?.gradePoint
                            )
                          }
                        >
                          <TextField
                            fullWidth
                            label="Point"
                            type="number"
                            name={`gradingScale.${index}.gradePoint`}
                            size="small"
                            disabled={viewOnly}
                            value={formik.values.gradingScale[index].gradePoint}
                            onChange={formik.handleChange}
                            error={
                              !!(
                                (formik.touched.gradingScale as FormikTouched<IGradingScale>[])?.[
                                  index
                                ]?.gradePoint &&
                                (formik.errors.gradingScale as FormikErrors<IGradingScale>[])?.[
                                  index
                                ]?.gradePoint
                              )
                            }
                            helperText={
                              (formik.touched.gradingScale as FormikTouched<IGradingScale>[])?.[
                                index
                              ]?.gradePoint
                                ? (formik.errors.gradingScale as FormikErrors<IGradingScale>[])?.[
                                    index
                                  ]?.gradePoint
                                : undefined
                            }
                            FormHelperTextProps={HELPER_TEXT_PROPS}
                          />
                        </ShakingTextField>
                      </Grid>

                      <Grid size={{ xs: 12, md: 2.4 }}>
                        <ShakingTextField
                          error={
                            !!(
                              (formik.touched.gradingScale as FormikTouched<IGradingScale>[])?.[
                                index
                              ]?.remark &&
                              (formik.errors.gradingScale as FormikErrors<IGradingScale>[])?.[index]
                                ?.remark
                            )
                          }
                        >
                          <TextField
                            fullWidth
                            label="Remark"
                            name={`gradingScale.${index}.remark`}
                            size="small"
                            disabled={viewOnly}
                            value={formik.values.gradingScale[index].remark}
                            onChange={formik.handleChange}
                            error={
                              !!(
                                (formik.touched.gradingScale as FormikTouched<IGradingScale>[])?.[
                                  index
                                ]?.remark &&
                                (formik.errors.gradingScale as FormikErrors<IGradingScale>[])?.[
                                  index
                                ]?.remark
                              )
                            }
                            helperText={
                              (formik.touched.gradingScale as FormikTouched<IGradingScale>[])?.[
                                index
                              ]?.remark
                                ? (formik.errors.gradingScale as FormikErrors<IGradingScale>[])?.[
                                    index
                                  ]?.remark
                                : undefined
                            }
                            FormHelperTextProps={HELPER_TEXT_PROPS}
                          />
                        </ShakingTextField>
                      </Grid>

                      <Grid size={{ xs: 12, md: 1.8 }}>
                        <CustomSelect
                          fullWidth
                          label="Result"
                          options={RESULT_STATUS_OPTIONS}
                          name={`gradingScale.${index}.resultStatus`}
                          size="small"
                          disabled={viewOnly}
                          value={formik.values.gradingScale[index].resultStatus}
                          onChange={(val) =>
                            formik.setFieldValue(`gradingScale.${index}.resultStatus`, val)
                          }
                        />
                      </Grid>

                      {!viewOnly && (
                        <Grid size={{ xs: 12, md: 0.7 }}>
                          <IconButton
                            onClick={() => {
                              const updatedGradingScale = [...formik.values.gradingScale];
                              updatedGradingScale.splice(index, 1);
                              formik.setFieldValue('gradingScale', updatedGradingScale);
                            }}
                            sx={{ color: 'error.main', width: '30px', height: '30px' }}
                          >
                            <Iconify
                              icon={GlobalIcons.delete}
                              sx={{ width: '18px', height: '18px' }}
                            />
                          </IconButton>
                        </Grid>
                      )}
                    </Grid>
                  ))}
                </Box>
              </Grid>
            </Grid>
          )}

          {activeTab === 2 && (
            <Grid container spacing={1}>
              <Grid size={{ xs: 12 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Grade Scaling Simulator
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Verify your grade scaling by entering sample student marks to see how the system
                  calculates grades.
                </Typography>
                <TextField
                  fullWidth
                  label="Sample Obtained Marks"
                  type="number"
                  placeholder="Enter obtained marks..."
                  value={simMarks}
                  onChange={(e) => setSimMarks(e.target.value)}
                  size="small"
                  sx={{ mb: 3 }}
                />
                <Divider sx={{ mb: 3 }} />

                {matchedRange ? (
                  <Box
                    p={3}
                    bgcolor="success.lighter"
                    border="1px solid"
                    borderColor="success.light"
                    borderRadius={1}
                  >
                    <Grid container spacing={1}>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Calculated Grade
                        </Typography>
                        <Typography variant="h4" color="success.darker">
                          {matchedRange.grade}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Grade Point
                        </Typography>
                        <Typography variant="h4" color="success.darker">
                          {matchedRange.gradePoint !== '' ? matchedRange.gradePoint : '-'}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Result Status
                        </Typography>
                        <Typography variant="h5" color="success.darker" sx={{ mt: 0.5 }}>
                          {matchedRange.resultStatus === 0
                            ? 'Pass'
                            : matchedRange.resultStatus === 1
                              ? 'Fail'
                              : 'Optional'}
                        </Typography>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 3 }}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Remark
                        </Typography>
                        <Typography variant="h5" color="success.darker" sx={{ mt: 0.5 }}>
                          {matchedRange.remark || '-'}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                ) : (
                  <Box
                    p={4}
                    minHeight={180}
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent="center"
                    gap={1}
                    bgcolor="background.neutral"
                    border="1px dashed"
                    borderColor="divider"
                    borderRadius={1}
                    textAlign="center"
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 1,
                        display: 'grid',
                        placeItems: 'center',
                        bgcolor: 'background.paper',
                        color: 'text.secondary',
                        border: (theme) => `1px solid ${theme.palette.divider}`,
                      }}
                    >
                      <Iconify icon="mdi:calculator-variant-outline" width={26} />
                    </Box>
                    <Typography variant="subtitle2" color="text.primary">
                      Simulator result will appear here
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {simMarks === ''
                        ? 'Enter sample marks above to test the calculator.'
                        : `No grade range defined for ${simMarks} marks.`}
                    </Typography>
                  </Box>
                )}
              </Grid>
            </Grid>
          )}
        </Scrollbar>
        {!viewOnly && (
          <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
            <Button
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              onClick={() => {
                onClose(null, false);
              }}
              size="small"
              variant="outlined"
            >
              Cancel
            </Button>
            <LoadingButton
              size="small"
              variant="contained"
              type="submit"
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
            >
              {data ? 'Update' : 'Submit'}
            </LoadingButton>
          </DialogActions>
        )}
      </Box>
    </BackPopUpChecked>
  );
};
export default GradeForm;
