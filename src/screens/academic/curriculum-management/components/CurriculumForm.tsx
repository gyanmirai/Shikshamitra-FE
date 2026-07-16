'use client';

import React from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import {
  AcademicDatePicker as DatePicker,
  AcademicDateTimePicker as DateTimePicker,
} from 'src/components/academic-date-picker';
import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';

import { useCurriculumForm } from '../hooks/useCurriculumForm';

import type { CurriculumFormProps } from '../types';

export const CurriculumForm: React.FC<CurriculumFormProps> = ({
  onSubmit,
  onClose,
  data,
  isEdit,
}) => {
  const { formik, classData, isLoading, setIsDraft } = useCurriculumForm({
    onSubmit,
    onClose,
    data,
    isEdit,
  });

  return (
    <Box display="flex" flexDirection="column" gap={1}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, height: '200px' }}>
          <Grid container spacing={1}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                name="curriculumName"
                label="Curriculum Name"
                value={formik.values.curriculumName}
                onChange={formik.handleChange}
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <CustomSelect
                label="Class"
                options={classData?.items || []}
                value={formik.values.className}
                isLoading={isLoading}
                labelKey="name"
                valueKey="name"
                onChange={(val) => {
                  formik.setFieldValue('className', val);
                }}
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <CustomSelect
                label="Subject"
                name="subjects"
                options={[
                  { value: 'Math', label: 'Math' },
                  { value: 'Science', label: 'Science' },
                  { value: 'English', label: 'English' },
                  { value: 'Gujarati', label: 'Gujarati' },
                ]}
                multiple
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
                value={formik.values.subjects}
                onChange={(value) => formik.setFieldValue('subjects', value)}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <DatePicker
                label="Start Date"
                name="startDate"
                value={formik.values.startDate}
                onChange={(value) => formik.setFieldValue('startDate', value)}
                format="DD-MM-YYYY"
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <DatePicker
                label="End Date"
                name="endDate"
                value={formik.values.endDate}
                onChange={(value) => formik.setFieldValue('endDate', value)}
                format="DD-MM-YYYY"
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <DateTimePicker
                label="Schedule Date"
                value={formik.values.scheduleDate}
                onChange={(value) => {
                  formik.setFieldValue('scheduleDate', value);
                }}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                  },
                }}
                disablePast
              />
            </Grid>
          </Grid>
        </Scrollbar>
        <DialogActions>
          {isEdit ? (
            <Button
              variant="contained"
              onClick={() => {
                setIsDraft(true);
                formik.handleSubmit();
              }}
            >
              Update
            </Button>
          ) : (
            <>
              <Button
                onClick={() => {
                  setIsDraft(true);
                  formik.handleSubmit();
                }}
              >
                Save Draft
              </Button>
              <Button
                type="submit"
                variant="contained"
                onClick={() => {
                  setIsDraft(false);
                  formik.handleSubmit();
                }}
              >
                Publish
              </Button>
            </>
          )}
        </DialogActions>
      </form>
    </Box>
  );
};
