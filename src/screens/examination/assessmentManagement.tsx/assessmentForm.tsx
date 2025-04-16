'use client';

import { useFormik } from 'formik';
import React, { useState } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Grid, Button, TextField, Typography, DialogActions } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';

import { getInitialValues } from './initialValues';
import { validationSchema } from './validationSchema';
import AssessmentTypeForm from '../settings/examAssessmentTypeSetting.tsx/assessmentTypeSetting/assessmentTypeForm';

import type { AddNewAssessmentProps, IAssesmentFormikValues } from './type';

const AddNewAssessment: React.FC<AddNewAssessmentProps> = ({ onSubmit, data, isEdit }) => {
  // Fetch class data using custom hook and handle loading state
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });
  const assessmentTypeDialog = useBoolean();

  // State to manage selected class
  const [classes, setClasses] = useState<string>(data?.className || '');

  // State to manage selected division
  const [division, setDivision] = useState<string>(data?.division || '');

  // State to store available division options based on selected class
  const [divisionOptions, setDivisionOptions] = useState<any[]>([]);
  const formik = useFormik<IAssesmentFormikValues>({
    initialValues: getInitialValues(data),
    validationSchema,
    onSubmit: (values) => {
      onSubmit({
        ...values,
        id: data?.id || Date.now().toString(),
        status: data?.status || 'Pending',
      });
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
      <Box display="flex" flexDirection="column" gap={2} height="100%">
        <Scrollbar sx={{ p: 2, height: '100%' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <ShakingTextField error={formik.touched.className && !!formik.errors.className}>
                <CustomSelect
                  options={classData?.items || []}
                  value={classes}
                  onChange={(val) => {
                    const selectedClass = classData?.items?.find((i: any) => i.id === val);
                    formik.setFieldValue('className', selectedClass?.name || '');
                    setClasses(val as string);
                    setDivisionOptions(selectedClass?.divisions || []);
                  }}
                  label="Class"
                  isLoading={isLoading}
                  labelKey="name"
                  valueKey="id"
                  formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
                  error={formik.touched.className && !!formik.errors.className}
                  helperText={(formik.touched.className && formik.errors.className) || ''}
                />
              </ShakingTextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <ShakingTextField error={formik.touched.division && !!formik.errors.division}>
                <CustomSelect
                  label="Division"
                  disabled={!classes}
                  labelKey="name"
                  valueKey="name"
                  options={divisionOptions}
                  value={division}
                  onChange={(val) => {
                    formik.setFieldValue('division', val);
                    setDivision(val as string);
                  }}
                  formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                  error={formik.touched.division && !!formik.errors.division}
                  helperText={(formik.touched.division && formik.errors.division) || ''}
                />
              </ShakingTextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <ShakingTextField error={formik.touched.subject && !!formik.errors.subject}>
                <CustomSelect
                  label="Subject"
                  options={[
                    { value: 'math', label: 'Mathematics' },
                    { value: 'science', label: 'Science' },
                    { value: 'history', label: 'History' },
                    { value: 'english', label: 'English' },
                  ]}
                  value={formik.values.subject}
                  onChange={(val) => formik.setFieldValue('subject', val)}
                  formControlProps={{ fullWidth: true }}
                  error={formik.touched.subject && !!formik.errors.subject}
                  helperText={(formik.touched.subject && formik.errors.subject) || ''}
                />
              </ShakingTextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <ShakingTextField
                error={formik.touched.assessmentTitle && Boolean(formik.errors.assessmentTitle)}
              >
                <TextField
                  fullWidth
                  label="Assesment Title"
                  name="assesmentTitle"
                  value={formik.values.assessmentTitle}
                  onChange={formik.handleChange}
                  error={formik.touched.assessmentTitle && Boolean(formik.errors.assessmentTitle)}
                  helperText={
                    (formik.touched.assessmentTitle && formik.errors.assessmentTitle) || ''
                  }
                  size="small"
                />
              </ShakingTextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <ShakingTextField
                error={formik.touched.assessmentType && !!formik.errors.assessmentType}
              >
                <CustomSelect
                  label="Assessment Type"
                  options={[
                    { value: 'exam', label: 'Exam' },
                    { value: 'assignment', label: 'Assignment' },
                  ]}
                  value={formik.values.assessmentType}
                  onChange={(val) => formik.setFieldValue('assessmentType', val)}
                  formControlProps={{ fullWidth: true }}
                  error={formik.touched.assessmentType && !!formik.errors.assessmentType}
                  helperText={(formik.touched.assessmentType && formik.errors.assessmentType) || ''}
                />
              </ShakingTextField>
              <Typography
                variant="body2"
                fontWeight={500}
                textAlign="right"
                color="primary.main"
                fontSize={12}
                sx={{ cursor: 'pointer' }}
                onClick={() => {
                  assessmentTypeDialog.onTrue();
                }}
              >
                Add Assessment Type
              </Typography>
              <CustomDialog
                open={assessmentTypeDialog.value}
                handleClose={assessmentTypeDialog.onFalse}
                title="Assessment Type"
              >
                <AssessmentTypeForm
                  onClose={assessmentTypeDialog.onFalse}
                  data={null}
                  isEdit={false}
                  onSubmit={() => {}}
                />
              </CustomDialog>
            </Grid>

            {formik.values.assessmentType === 'exam' && (
              <Grid item xs={12} md={6}>
                <ShakingTextField error={formik.touched.examName && !!formik.errors.examName}>
                  <CustomSelect
                    label="Exam Name"
                    options={[
                      { value: 'Mid Exam', label: 'Mid Exam' },
                      { value: 'Final', label: 'Final' },
                    ]}
                    value={formik.values.examName}
                    onChange={(val) => formik.setFieldValue('examName', val)}
                    formControlProps={{ fullWidth: true }}
                    error={formik.touched.examName && !!formik.errors.examName}
                    helperText={(formik.touched.examName && formik.errors.examName) || ''}
                  />
                </ShakingTextField>
              </Grid>
            )}

            {formik.values.assessmentType === 'assignment' && (
              <Grid item xs={12} md={6}>
                <ShakingTextField
                  error={formik.touched.assignmentName && !!formik.errors.assignmentName}
                >
                  <CustomSelect
                    label="Assignment Name"
                    options={[
                      { value: 'Ass1', label: 'Ass1' },
                      { value: 'Ass2', label: 'Ass2' },
                    ]}
                    value={formik.values.assignmentName}
                    onChange={(val) => formik.setFieldValue('assignmentName', val)}
                    formControlProps={{ fullWidth: true }}
                    error={formik.touched.assignmentName && !!formik.errors.assignmentName}
                    helperText={
                      (formik.touched.assignmentName && formik.errors.assignmentName) || ''
                    }
                  />
                </ShakingTextField>
              </Grid>
            )}

            <Grid item xs={12} md={6}>
              <ShakingTextField
                error={formik.touched.createDate && Boolean(formik.errors.createDate)}
              >
                <DatePicker
                  label="Date"
                  value={formik.values.createDate}
                  onChange={(val) => {
                    formik.setFieldValue('createDate', val);
                  }}
                  format="DD/MM/YYYY"
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      error: formik.touched.createDate && Boolean(formik.errors.createDate),
                      helperText: (formik.touched.createDate && formik.errors.createDate) || '',
                    },
                  }}
                  disablePast
                />
              </ShakingTextField>
            </Grid>

            <Grid item xs={12} md={6}>
              <ShakingTextField error={formik.touched.dueDate && Boolean(formik.errors.dueDate)}>
                <DatePicker
                  label="Due Date"
                  value={formik.values.dueDate}
                  onChange={(val) => {
                    formik.setFieldValue('dueDate', val);
                  }}
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      error: formik.touched.dueDate && Boolean(formik.errors.dueDate),
                      helperText: (formik.touched.dueDate && formik.errors.dueDate) || '',
                    },
                  }}
                  disablePast
                />
              </ShakingTextField>
            </Grid>
          </Grid>{' '}
        </Scrollbar>
        <DialogActions>
          {isEdit ? (
            <Button
              variant="contained"
              onClick={() => {
                formik.handleSubmit();
              }}
            >
              Update
            </Button>
          ) : (
            <>
              <Button
                onClick={() => {
                  formik.setFieldValue('publish', false);
                  formik.handleSubmit();
                }}
              >
                Save Draft
              </Button>
              <Button
                type="submit"
                variant="contained"
                onClick={() => {
                  formik.setFieldValue('publish', true);
                  formik.handleSubmit();
                }}
              >
                Publish
              </Button>
            </>
          )}
        </DialogActions>
      </Box>
    </form>
  );
};

export default AddNewAssessment;
