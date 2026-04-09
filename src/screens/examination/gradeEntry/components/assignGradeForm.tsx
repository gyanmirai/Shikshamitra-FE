import * as Yup from 'yup';
import { useFormik } from 'formik';
import { motion } from 'framer-motion';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { useUpdateStudentMarksMutation } from 'src/redux/academicAPI/ExaminationApi/RecordMarksApi/recordMarksApi';

import type { IAssignGradeProps } from '../type';

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
};

const AssignGrade: React.FC<IAssignGradeProps> = ({ onClose, data }: IAssignGradeProps) => {
  const [updateStudentMarks, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateStudentMarksMutation,
    params: {
      examId: data?.examId,
      studentId: data?.id,
    },
  });
  const formik = useFormik({
    initialValues: {
      marks: typeof data?.marks === 'number' ? data.marks : '',
      totalMarks: typeof data?.totalMarks === 'number' ? data.totalMarks : '',
      feedback: data?.feedback || '',
    },
    validationSchema: Yup.object({
      marks: Yup.number()
        .required('Obtained Marks is required')
        .max(Yup.ref('totalMarks'), 'Obtained Marks cannot exceed Total Marks'),
    }),
    onSubmit(values) {
      updateStudentMarks({
        marks: values.marks,
        feedback: values.feedback,
      });
      const studentName = data?.studentName || 'Student';
      if (data?.marks) {
        onClose?.(null, true);
        shikshaMitraToast.success({
          message: `Marks updated successfully for ${studentName}`,
        });
      } else {
        onClose?.(null, true);
        shikshaMitraToast.success({
          message: `Marks assigned successfully for ${studentName}`,
        });
      }
    },
  });

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
        {/* <form onSubmit={formik.handleSubmit}> */}
        <Scrollbar sx={{ p: 2, height: '200px', backgroundColor: 'background.paper' }}>
          <motion.div variants={staggerContainer} initial="hidden" animate="show">
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <motion.div variants={staggerItem}>
                  {/* <ShakingTextField error={!!(formik.touched?.marks && formik.errors.marks) || false}> */}
                  <TextField
                    label="Total Marks *"
                    disabled
                    name="totalMarks"
                    type="number"
                    value={formik.values.totalMarks}
                    onChange={formik.handleChange}
                    error={formik.touched.totalMarks && Boolean(formik.errors.totalMarks)}
                    helperText={
                      formik.touched.totalMarks && formik.errors.totalMarks
                        ? formik.errors.totalMarks
                        : undefined
                    }
                    size="small"
                    sx={{ width: '100%' }}
                  />
                  {/* </ShakingTextField> */}
                </motion.div>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <motion.div variants={staggerItem}>
                  <ShakingTextField
                    error={!!(formik.touched?.marks && formik.errors.marks) || false}
                  >
                    <TextField
                      label="Obtained Marks *"
                      name="marks"
                      type="number"
                      value={formik.values.marks}
                      onChange={(e) => {
                        const { value } = e.target;
                        if (value === '') {
                          formik.setFieldValue('marks', '');
                          return;
                        }
                        const numericValue = parseInt(value, 10);
                        if (
                          !Number.isNaN(numericValue) &&
                          numericValue <= Number(formik.values.totalMarks)
                        ) {
                          formik.setFieldValue('marks', numericValue);
                        }
                      }}
                      error={formik.touched.marks && Boolean(formik.errors.marks)}
                      inputProps={{ min: 0, max: formik.values.totalMarks }}
                      helperText={
                        formik.touched.marks && formik.errors.marks
                          ? formik.errors.marks
                          : undefined
                      }
                      size="small"
                      sx={{ width: '100%' }}
                      onKeyDown={(e) => {
                        if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                          e.preventDefault();
                        }
                      }}
                    />
                  </ShakingTextField>
                </motion.div>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <motion.div variants={staggerItem}>
                  <ShakingTextField
                    error={!!(formik.touched?.feedback && formik.errors.feedback) || false}
                  >
                    <TextField
                      label="Feedback"
                      multiline
                      rows={3}
                      fullWidth
                      name="feedback"
                      value={formik.values.feedback}
                      onChange={formik.handleChange}
                      error={formik.touched.feedback && Boolean(formik.errors.feedback)}
                      helperText={formik.touched.feedback && formik.errors.feedback}
                    />
                  </ShakingTextField>
                </motion.div>
              </Grid>
            </Grid>
          </motion.div>
        </Scrollbar>
        <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="small"
              onClick={() => {
                onClose?.(null, false);
              }}
              variant="outlined"
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
            >
              Cancel
            </Button>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <LoadingButton
              size="small"
              variant="contained"
              loading={isUpdateLoading}
              onClick={(e: any) => formik.handleSubmit(e)}
              startIcon={
                <Iconify
                  icon={data?.marks ? GlobalIcons.edit : GlobalIcons.submit}
                  width={data ? 16 : 20}
                  height={data ? 16 : 20}
                />
              }
            >
              {data?.marks ? 'Update' : 'Submit'}
            </LoadingButton>
          </motion.div>
        </DialogActions>
        {/* </form> */}
      </BackPopUpChecked>
    </Box>
  );
};

export default AssignGrade;
