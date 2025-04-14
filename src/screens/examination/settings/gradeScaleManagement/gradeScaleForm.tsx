import React from 'react';
import { useFormik } from 'formik';

import { Add, Create } from '@mui/icons-material';
import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';

import { getInitialValues } from './initialValues';
import { validationSchema } from './validationSchema';

import type { IGradingScale, IGradeFormProps } from './type';

const GradeForm: React.FC<IGradeFormProps> = ({ onSubmit, onClose, data, isEdit }) => {
  const formik = useFormik({
    initialValues: getInitialValues(data),
    validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  const handleAddGradingScale = () => {
    const updatedGradingScale = [
      ...formik.values.gradingScale,
      { minMarks: 0, maxMarks: 0, grade: '' },
    ];
    formik.setFieldValue('gradingScale', updatedGradingScale);
  };

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '400px' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Total Marks"
                name="totalMarks"
                size="small"
                value={formik.values.totalMarks}
                onChange={formik.handleChange}
                error={formik.touched.totalMarks && Boolean(formik.errors.totalMarks)}
              />
            </Grid>

            <Grid item xs={12}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <h4>Grading Scale</h4>
                <Button
                  startIcon={<Add />}
                  variant="contained"
                  size="small"
                  onClick={handleAddGradingScale}
                >
                  Grading Scale
                </Button>
              </Box>

              {formik.values.gradingScale?.map((scale: IGradingScale, index: number) => (
                <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Min Marks"
                      name={`gradingScale.${index}.minMarks`}
                      size="small"
                      value={scale.minMarks}
                      onChange={formik.handleChange}
                      // error={
                      //   formik.touched.gradingScale?.[index]?.minMarks &&
                      //   Boolean(formik.errors.gradingScale?.[index]?.minMarks)
                      // }
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <TextField
                      fullWidth
                      label="Max Marks"
                      name={`gradingScale.${index}.maxMarks`}
                      size="small"
                      value={scale.maxMarks}
                      onChange={formik.handleChange}
                      // error={
                      //   formik.touched.gradingScale?.[index]?.maxMarks &&
                      //   Boolean(formik.errors.gradingScale?.[index]?.maxMarks)
                      // }
                    />
                  </Grid>
                  <Grid item xs={12} md={5}>
                    <CustomSelect
                      fullWidth
                      label="Grade"
                      options={[
                        { value: 'A+', label: 'A+' },
                        { value: 'A', label: 'A' },
                        { value: 'A-', label: 'A-' },
                        { value: 'B+', label: 'B+' },
                        { value: 'B', label: 'B' },
                        { value: 'B-', label: 'B-' },
                        { value: 'C+', label: 'C+' },
                        { value: 'C', label: 'C' },
                        { value: 'C-', label: 'C-' },
                        { value: 'D+', label: 'D+' },
                        { value: 'D', label: 'D' },
                        { value: 'D-', label: 'D-' },
                        { value: 'F', label: 'F' },
                      ]}
                      name={`gradingScale.${index}.grade`}
                      size="small"
                      value={scale.grade}
                      onChange={(val) => {
                        formik.setFieldValue(`gradingScale.${index}.grade`, val);
                      }}
                      // error={
                      //   formik.touched.gradingScale?.[index]?.grade &&
                      //   Boolean(formik.errors.gradingScale?.[index]?.grade)
                      // }
                    />
                  </Grid>
                  <Grid item xs={12} md={1}>
                    <Iconify
                      icon="mdi:trash"
                      onClick={() => {
                        const updatedGradingScale = [...formik.values.gradingScale]; // Copy array
                        updatedGradingScale.splice(index, 1); // Remove row
                        formik.setFieldValue('gradingScale', updatedGradingScale); // Update state
                      }}
                      sx={{ cursor: 'pointer', mt: 1, color: 'error' }}
                    />
                  </Grid>
                </Grid>
              ))}
            </Grid>
          </Grid>
        </Scrollbar>
        <DialogActions>
          <Button
            startIcon={<Create />}
            variant="contained"
            onClick={() => {
              formik.handleSubmit();
            }}
          >
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Box>
  );
};
export default GradeForm;
