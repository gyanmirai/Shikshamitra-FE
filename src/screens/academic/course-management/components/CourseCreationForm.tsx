import React from 'react';
import { useFormik } from 'formik';
import { Create } from '@mui/icons-material';
import { Iconify } from 'src/components/iconify';
import { UploadBox } from 'src/components/upload';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Grid, Button, TextField, Typography, DialogActions } from '@mui/material';

import type { CourseData, CourseCreationFormProps } from '../type';

const CourseCreationForm: React.FC<CourseCreationFormProps> = ({
  onSave,
  onClose,
  data,
  isEdit,
}) => {
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  const formik = useFormik<CourseData>({
    initialValues: {
      id: isEdit && data ? data.id : Date.now(),
      courseName: isEdit && data ? data.courseName : '',
      className: isEdit && data ? data.className : '',
      description: isEdit && data ? data.description : '',
      subject: isEdit && data ? data.subject : '',
      resource: isEdit && data ? data.resource : '',
      learningGoal: isEdit && data ? data.learningGoal : '',
      assignedTeacher: isEdit && data ? data.assignedTeacher : '',
      status: isEdit && data ? data.status : 'Inactive',
      material: { videos: 0, pdfs: 0 },
    },
    onSubmit: (values) => {
      onSave(values);
    },
  });

  return (
    <Box display="flex" flexDirection="column" gap={2}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '300px' }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Course Name"
                name="courseName"
                value={formik.values.courseName}
                onChange={formik.handleChange}
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <CustomSelect
                options={classData?.items || []}
                value={formik.values.className}
                onChange={(val) => formik.setFieldValue('className', val as string)}
                label="Class"
                isLoading={isLoading}
                labelKey="name"
                valueKey="name"
                formControlProps={{ sx: { minWidth: 270 } }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <CustomSelect
                label="Subject"
                options={[
                  { value: 'math', label: 'Math' },
                  { value: 'english', label: 'English' },
                  { value: 'science', label: 'Science' },
                ]}
                name="subject"
                value={formik.values.subject}
                onChange={(val) => formik.setFieldValue('subject', val as string)}
                formControlProps={{ sx: { minWidth: 275 } }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <CustomSelect
                label="Assigned Teacher(s)"
                options={[
                  { value: 'Jiya', label: 'Jiya' },
                  { value: 'Riya', label: 'Riya' },
                  { value: 'Priya', label: 'Priya' },
                ]}
                name="assignedTeacher"
                value={formik.values.assignedTeacher}
                onChange={(val) => formik.setFieldValue('assignedTeacher', val as string[])}
                formControlProps={{ sx: { minWidth: 270 } }}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Description"
                name="description"
                value={formik.values.description}
                onChange={formik.handleChange}
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <UploadBox
                onDrop={() => {}}
                placeholder={
                  <Box
                    sx={{
                      gap: 0.5,
                      display: 'flex',
                      alignItems: 'center',
                      color: 'text.disabled',
                      flexDirection: 'column',
                    }}
                  >
                    <Iconify icon="eva:cloud-upload-fill" width={40} />
                    <Typography variant="body2">Drag Your Document</Typography>
                  </Box>
                }
                sx={{ py: 2.5, width: '100%', height: 'auto', borderRadius: 1.5 }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <CustomSelect
                label="Resources"
                options={[
                  { value: 'laptop', label: 'Laptop' },
                  { value: 'projector', label: 'Projector' },
                  { value: 'textbook', label: 'Textbook' },
                ]}
                name="resource"
                value={formik.values.resource}
                onChange={(val) => formik.setFieldValue('resource', val as string)}
                formControlProps={{ sx: { minWidth: 275 } }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Learning Goals"
                name="learningGoal"
                value={formik.values.learningGoal}
                onChange={formik.handleChange}
                size="small"
              />
            </Grid>

            <Grid size={{ xs: 12 }}>
              <CustomSelect
                label="Status"
                options={[
                  { value: 'Active', label: 'Active' },
                  { value: 'Inactive', label: 'Inactive' },
                ]}
                name="status"
                value={formik.values.status}
                onChange={(val) => formik.setFieldValue('status', val as string)}
                formControlProps={{ sx: { minWidth: 275 } }}
              />
            </Grid>
          </Grid>
        </Scrollbar>

        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button startIcon={<Create />} type="submit" variant="contained">
            {isEdit ? 'Update' : 'Create'} Course
          </Button>
        </DialogActions>
      </form>
    </Box>
  );
};

export default CourseCreationForm;
