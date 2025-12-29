import type { Medium } from 'src/types/school';
import type { RootState } from 'src/redux/store';
import type { FormikErrors, FormikTouched } from 'formik';

import React from 'react';
import { useFormik } from 'formik';
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
import { Box, Grid, Button, TextField, IconButton, DialogActions } from '@mui/material';
import {
  useAddGradeScalingMutation,
  useUpdateGradeScalingMutation,
} from 'src/redux/academicAPI/ExaminationApi/examSetting/grade-scalling-api';

import { getInitialValues } from './initialValues';
import { validationSchema } from './validationSchema';

import type { IGrade, IGradingScale, IGradeFormProps } from './type';

const GradeForm: React.FC<IGradeFormProps> = ({ onSubmit, onClose, data, isEdit, disabled }) => {
  const { currentMedium } = useSelector((state: RootState) => state.globalState);
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
    onSubmit: async (values, formikHelpers) => {
      try {
        if (data) {
          const payload = {
            academicMediumId: (currentMedium as Medium).id,
            id: (data as IGrade).id,
            body: {
              name: values.name,
              totalMarks: values.totalMarks,
              gradingScale: values.gradingScale,
              educationMediumId: (currentMedium as Medium).id,
            },
          };
          await updateGradeScaling(payload).unwrap();
          shikshaMitraToast.success({
            message: `"${values.name}" Grade scale updated successfully`,
          });
          onClose(null, true);
        } else {
          const payload = {
            academicMediumId: (currentMedium as Medium).id,
            body: {
              name: values.name,
              totalMarks: values.totalMarks,
              gradingScale: values.gradingScale,
              educationMediumId: (currentMedium as Medium).id,
            },
          };
          await addGradeScaling(payload).unwrap();
          shikshaMitraToast.success({
            message: `"${values.name}" Grade scale added successfully`,
          });
          onClose(null, true);
        }
      } catch (error) {
        // Error handling is managed by the API hook or global error handler if configured
        console.error('Failed to save subject', error);
      }
    },
  });

  const handleAddGradingScale = () => {
    const updatedGradingScale = [
      ...formik.values.gradingScale,
      { minMarks: '', maxMarks: '', grade: '' },
    ];
    formik.setFieldValue('gradingScale', updatedGradingScale);
  };

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <Box display="flex" flexDirection="column" gap={2}>
        {/* <form onSubmit={formik.handleSubmit}> */}
        <Scrollbar sx={{ p: 2, height: '400px' }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12 }}>
              <ShakingTextField error={!!(formik.touched.name && formik.errors.name)}>
                <TextField
                  fullWidth
                  label="Grade Scale Title *"
                  name="name"
                  size="small"
                  disabled={disabled}
                  value={formik.values.name}
                  onChange={formik.handleChange}
                  error={formik.touched.name && Boolean(formik.errors.name)}
                  helperText={
                    formik.touched.name && typeof formik.errors.name === 'string'
                      ? formik.errors.name
                      : undefined
                  }
                />
              </ShakingTextField>
            </Grid>

            <Grid size={{ xs: 12 }}>
              <ShakingTextField error={!!(formik.touched.totalMarks && formik.errors.totalMarks)}>
                <TextField
                  fullWidth
                  label="Total Marks *"
                  name="totalMarks"
                  type="number"
                  disabled={disabled}
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
                    formik.touched.totalMarks && typeof formik.errors.totalMarks === 'string'
                      ? formik.errors.totalMarks
                      : undefined
                  }
                />
              </ShakingTextField>
            </Grid>

            <Grid size={{ xs: 12 }} mt={-3}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <h4>Grading Scale</h4>
                <Button
                  disabled={disabled}
                  startIcon={<Add />}
                  variant="contained"
                  size="small"
                  onClick={handleAddGradingScale}
                >
                  Grading Scale
                </Button>
              </Box>
            </Grid>

            <Grid size={{ xs: 12 }} mt={-3}>
              {formik.values.gradingScale?.map((scale: IGradingScale, index: number) => (
                <Grid container spacing={3} key={index} mb={2}>
                  <Grid size={{ xs: 12, md: 3.6 }}>
                    <ShakingTextField
                      error={
                        !!(
                          (formik.touched.gradingScale as FormikTouched<IGradingScale>[])?.[index]
                            ?.minMarks &&
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
                        disabled={disabled}
                        size="small"
                        value={formik.values.gradingScale[index].minMarks}
                        onChange={formik.handleChange}
                        onKeyDown={(e) => {
                          if (['e', 'E', '+', '-', '.', 'ArrowUp', 'ArrowDown'].includes(e.key))
                            e.preventDefault();
                        }}
                        onWheel={(e) => (e.target as HTMLElement).blur()}
                        error={
                          !!(
                            (formik.touched.gradingScale as FormikTouched<IGradingScale>[])?.[index]
                              ?.minMarks &&
                            (formik.errors.gradingScale as FormikErrors<IGradingScale>[])?.[index]
                              ?.minMarks
                          )
                        }
                        helperText={
                          (
                            formik.touched.gradingScale as
                              | FormikTouched<IGradingScale>[]
                              | undefined
                          )?.[index]?.minMarks &&
                          typeof (
                            formik.errors.gradingScale as FormikErrors<IGradingScale>[] | undefined
                          )?.[index]?.minMarks === 'string'
                            ? (formik.errors.gradingScale as FormikErrors<IGradingScale>[])[index]
                                ?.minMarks
                            : undefined
                        }
                      />
                    </ShakingTextField>
                  </Grid>

                  <Grid size={{ xs: 12, md: 3.6 }}>
                    <ShakingTextField
                      error={
                        !!(
                          (formik.touched.gradingScale as FormikTouched<IGradingScale>[])?.[index]
                            ?.maxMarks &&
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
                        disabled={disabled}
                        size="small"
                        value={formik.values.gradingScale[index].maxMarks}
                        onChange={formik.handleChange}
                        onKeyDown={(e) => {
                          if (['e', 'E', '+', '-', '.', 'ArrowUp', 'ArrowDown'].includes(e.key))
                            e.preventDefault();
                        }}
                        onWheel={(e) => (e.target as HTMLElement).blur()}
                        error={
                          !!(
                            (formik.touched.gradingScale as FormikTouched<IGradingScale>[])?.[index]
                              ?.maxMarks &&
                            (formik.errors.gradingScale as FormikErrors<IGradingScale>[])?.[index]
                              ?.maxMarks
                          )
                        }
                        helperText={
                          (
                            formik.touched.gradingScale as
                              | FormikTouched<IGradingScale>[]
                              | undefined
                          )?.[index]?.maxMarks &&
                          typeof (
                            formik.errors.gradingScale as FormikErrors<IGradingScale>[] | undefined
                          )?.[index]?.maxMarks === 'string'
                            ? (formik.errors.gradingScale as FormikErrors<IGradingScale>[])[index]
                                ?.maxMarks
                            : undefined
                        }
                      />
                    </ShakingTextField>
                  </Grid>

                  <Grid size={{ xs: 12, md: 3.6 }}>
                    <ShakingTextField
                      error={
                        !!(
                          (formik.touched.gradingScale as FormikTouched<IGradingScale>[])?.[index]
                            ?.grade &&
                          (formik.errors.gradingScale as FormikErrors<IGradingScale>[])?.[index]
                            ?.grade
                        )
                      }
                    >
                      <CustomSelect
                        fullWidth
                        label="Grade *"
                        options={[
                          { value: 'A+', label: 'A+' },
                          { value: 'A', label: 'A' },
                          { value: 'B+', label: 'B+' },
                          { value: 'B', label: 'B' },
                          { value: 'C+', label: 'C+' },
                          { value: 'C', label: 'C' },
                          { value: 'D+', label: 'D+' },
                          { value: 'D', label: 'D' },
                          { value: 'F', label: 'F' },
                        ]}
                        name={`gradingScale.${index}.grade`}
                        size="small"
                        disabled={disabled}
                        value={formik.values.gradingScale[index].grade}
                        onChange={(val) => formik.setFieldValue(`gradingScale.${index}.grade`, val)}
                        error={
                          !!(
                            (formik.touched.gradingScale as FormikTouched<IGradingScale>[])?.[index]
                              ?.grade &&
                            (formik.errors.gradingScale as FormikErrors<IGradingScale>[])?.[index]
                              ?.grade
                          )
                        }
                        helperText={
                          (
                            formik.touched.gradingScale as
                              | FormikTouched<IGradingScale>[]
                              | undefined
                          )?.[index]?.grade &&
                          typeof (
                            formik.errors.gradingScale as FormikErrors<IGradingScale>[] | undefined
                          )?.[index]?.grade === 'string'
                            ? (formik.errors.gradingScale as FormikErrors<IGradingScale>[])[index]
                                ?.grade
                            : undefined
                        }
                      />
                    </ShakingTextField>
                  </Grid>

                  <Grid size={{ xs: 12, md: 0.6 }}>
                    <IconButton
                      disabled={disabled}
                      onClick={() => {
                        const updatedGradingScale = [...formik.values.gradingScale];
                        updatedGradingScale.splice(index, 1);
                        formik.setFieldValue('gradingScale', updatedGradingScale);
                      }}
                      sx={{ mt: 0.5, color: 'error.main', width: '30px', height: '30px' }}
                    >
                      <Iconify icon={GlobalIcons.delete} sx={{ width: '18px', height: '18px' }} />
                    </IconButton>
                  </Grid>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Scrollbar>
        {!disabled && (
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
        {/* </form> */}
      </Box>
    </BackPopUpChecked>
  );
};
export default GradeForm;
