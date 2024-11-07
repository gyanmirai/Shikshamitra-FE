import React, { useState } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import {
  Box,
  Card,
  Grid,
  Button,
  TextField,
  Typography,
  CardContent,
  DialogActions,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { AppCurrentDownload2 } from 'src/screens/hr/dashboard/app-current-download';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import { Upload, UploadBox } from 'src/components/upload';

const Course = () => {
  const dialog = useBoolean();
  const [classes, setClasses] = useState<string>('');
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  return (
    <Box>
      <Box
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 2, mb: 3 }}
      >
        <Button variant="contained" color="primary">
          View Course Details
        </Button>
        <Button variant="contained" color="secondary">
          Add Content
        </Button>
        <Button variant="contained" color="warning">
          View Assignment
        </Button>
        <Button variant="contained" color="success">
          Student Performance
        </Button>
      </Box>
      <Typography variant="h6" marginBottom={1}>
        Active Courses Overview
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 5 }}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography variant="h6" gutterBottom>
                Mathematics 101
              </Typography>
              <CustomSelect
                label="class"
                options={classData?.items || []}
                value={classes}
                isLoading={isLoading}
                labelKey="name"
                valueKey="id"
                onChange={(val) => {
                  setClasses(val as string);
                }}
                formControlProps={{ sx: { minWidth: 120 } }}
              />
            </Box>
            <Box display="flex" gap={1}>
              <Scrollbar sx={{ mt: 1.5, height: '200px' }}>
                <Box
                  component="ul"
                  sx={{
                    listStyle: 'none',
                    padding: 0,
                  }}
                >
                  {[
                    'Teacher Name - Mr. Smith',
                    'Class - 10',
                    'Class - 10',
                    'Class - 10',
                    'Class - 10',
                    'Class - 10',
                    'Class - 10',
                  ].map((exam, index) => (
                    <Box component="li" key={index} sx={{ mb: 1 }}>
                      <Button variant="outlined" fullWidth sx={{ justifyContent: 'start' }}>
                        {exam}
                      </Button>
                    </Box>
                  ))}
                </Box>
              </Scrollbar>
              <AppCurrentDownload2
                title="Completion Rates"
                chart={{
                  series: [
                    { label: 'Assignments', value: 12244 },
                    { label: 'Videos', value: 53345 },
                  ],
                }}
              />
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <Typography variant="h6" gutterBottom>
                Recent Activity
              </Typography>
              <CustomSelect
                formControlProps={{ sx: { maxWidth: 150, width: '100%' } }}
                options={[]}
                value=""
                onChange={() => {}}
                label="Class"
              />
            </Box>
            <Scrollbar sx={{ mt: 1.5, height: '200px' }}>
              <Box
                component="ul"
                sx={{
                  listStyle: 'none',
                  padding: 0,
                }}
              >
                {['New Assignment Posted', 'Quiz Published'].map((exam, index) => (
                  <Box component="li" key={index} sx={{ mb: 1 }}>
                    <Button variant="outlined" fullWidth sx={{ justifyContent: 'start' }}>
                      {exam}
                    </Button>
                  </Box>
                ))}
              </Box>
            </Scrollbar>
          </CardContent>
        </Card>
      </Box>
      <Typography variant="h6" marginBottom={1}>
        Course Creation and Editing
      </Typography>
      <Button variant="contained" onClick={dialog.onTrue}>
        Create New Course
      </Button>

      <CustomDialog
        maxWidth="sm"
        open={dialog.value}
        handleClose={dialog.onFalse}
        title="Create New Course"
      >
        <CourseCreationForm />
      </CustomDialog>
    </Box>
  );
};

export default Course;

const CourseDetails = () => (
  <Box display="flex" gap={2}>
    <TextField size="small" label="Course Name" name="courseName" />
    <TextField size="small" label="Course Description" name="courseDescription" />
    <CustomSelect
      options={[]}
      label="Grade Level"
      name="gradeLevel"
      value=""
      onChange={() => {}}
      formControlProps={{ sx: { maxWidth: 250, width: '100%' } }}
    />
  </Box>
);

const AssignTeacher = () => (
  <Box>
    <CustomSelect
      options={[]}
      label="Select Teacher"
      name="teacher"
      value=""
      onChange={() => {}}
      formControlProps={{ sx: { maxWidth: 250, width: '100%' } }}
    />
  </Box>
);

const AddContent = () => (
  <Box>
    <Upload />
  </Box>
);

const SetLearningGoals = () => (
  <Box>
    <TextField
      size="small"
      label="Define learning objectives for this course"
      name="learningGoals"
      multiline
      rows={4}
      fullWidth
    />
    <Button startIcon={<Iconify icon="mdi:plus" />} variant="contained" color="primary">
      {' '}
      Add Another Goal
    </Button>
  </Box>
);

const allStep = [CourseDetails, AssignTeacher, AddContent, SetLearningGoals];

const CourseCreationForm = () => {
  const [gradeLevel, setGradeLevel] = useState('');
  const [teacher, setTeacher] = useState<any>([]);
  const [resources, setResources] = useState('');
  return (
    <Box>
      <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '300px' }}>
        <Box display="flex" flexDirection="column" gap={2}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField label="Course Name" size="small" name="courseName" fullWidth />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Grade Level"
                options={[
                  { value: 'A', label: 'A' },
                  { value: 'B', label: 'B' },
                  { value: 'C', label: 'C' },
                  { value: 'D', label: 'D' },
                  { value: 'E', label: 'E' },
                  { value: 'F', label: 'F' },
                ]}
                value={gradeLevel}
                onChange={(val) => {
                  setGradeLevel(val as string);
                }}
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <DatePicker
                label="Course End Date"
                name="endDate"
                format="DD/MM/YYYY"
                sx={{ width: '100%', minWidth: '270px' }}
                onChange={() => {}}
                slotProps={{ textField: { size: 'small' } }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Select Teacher"
                options={[
                  { value: 'Jiya', label: 'Jiya' },
                  { value: 'Riya', label: 'Riya' },
                  { value: 'Priya', label: 'Priya' },
                  { value: 'Diya', label: 'Diya' },
                ]}
                multiple
                value={teacher}
                onChange={(val) => {
                  setTeacher(val);
                }}
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Course Description"
                size="small"
                name="courseDescription"
                multiline
                fullWidth
                rows={4}
              />
            </Grid>
          </Grid>
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
                <Typography variant="body2">Uplaod File</Typography>
              </Box>
            }
            sx={{
              py: 2.5,
              width: '100%',
              height: 'auto',
              borderRadius: 1.5,
            }}
          />
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField label="Field Name" size="small" name="fieldName" fullWidth />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                label="Description"
                size="small"
                name="description"
                multiline
                fullWidth
                rows={4}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Define Learning Objectives for this course"
                size="small"
                name="learningObjectives"
                multiline
                fullWidth
                rows={4}
              />
            </Grid>
          </Grid>
        </Box>
      </Scrollbar>
      <DialogActions>
        <Button variant="contained" onClick={() => {}} color="warning">
          Save Draft
        </Button>
        <Button variant="contained" onClick={() => {}}>
          Publish
        </Button>
      </DialogActions>
    </Box>
  );
};
