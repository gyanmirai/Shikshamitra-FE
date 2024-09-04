'use client';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useCallback } from 'react';

import { LoadingButton } from '@mui/lab';
import { DatePicker } from '@mui/x-date-pickers';
import { CalendarMonth } from '@mui/icons-material';
import {
  Box,
  Card,
  Button,
  Select,
  Checkbox,
  MenuItem,
  MenuList,
  InputLabel,
  CardHeader,
  Typography,
  FormControl,
  CardContent,
  ListItemText,
  DialogActions,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const EntranceExamScreen = () => {
  const dialog = useBoolean();
  const classDialog = useBoolean();
  const confirm = useBoolean(false);

  const dummyData = [
    { id: 1, date: '2023-06-15', students: ['Student1', 'Student2', 'Student3'] },
    { id: 2, date: '2023-06-22', students: ['Student4', 'Student5', 'Student6'] },
    { id: 3, date: '2023-06-29', students: ['Student7', 'Student8', 'Student9'] },
    { id: 4, date: '2023-07-06', students: ['Student10', 'Student11', 'Student12'] },
    { id: 5, date: '2023-07-13', students: ['Student13', 'Student14', 'Student15'] },
  ];

  const dummyStudentData = [
    { id: 1, firstName: 'John', lastName: 'Doe' },
    { id: 2, firstName: 'Jane', lastName: 'Smith' },
    { id: 3, firstName: 'Bob', lastName: 'Johnson' },
    { id: 4, firstName: 'Alice', lastName: 'Williams' },
    { id: 5, firstName: 'Charlie', lastName: 'Brown' },
  ];

  const actions = useCallback(
    ({ popover }: any) => (
      <MenuList>
        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" sx={{ height: '16px', width: '16px' }} />
          Delete
        </MenuItem>

        <MenuItem
          onClick={() => {
            dialog.onTrue();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" sx={{ height: '16px', width: '16px' }} />
          Edit
        </MenuItem>
      </MenuList>
    ),
    [confirm, dialog]
  );

  return (
    <Box>
      <ConfirmDialog
        open={confirm.value}
        onClose={() => {
          //   setEditData(null);
          //   confirm.onFalse();
        }}
        title="Delete"
        content="Are you sure want to delete?"
        action={
          <LoadingButton
            variant="contained"
            loading={false}
            color="error"
            onClick={async () => {
              //   await deleteOrganization(editData?.id || '');
              //   await getData(id);
              //   confirm.onFalse();
              //   setEditData(null);
              // isInitial.current = true;
            }}
          >
            Delete
          </LoadingButton>
        }
      />
      <CustomBreadcrumbs
        heading="Entrance Exam"
        links={[{ name: 'Student' }, { name: 'Student Enrollment' }, { name: 'Entrance Exam' }]}
        sx={{ px: 1, mb: 2 }}
        action={
          <Button startIcon={<CalendarMonth />} variant="contained" onClick={dialog.onTrue}>
            Schedule Exam
          </Button>
        }
      />
      <CustomDialog title="Schedule Exam" handleClose={dialog.onFalse} open={dialog.value}>
        <ExamForm />
      </CustomDialog>
      <CustomizableTable
        columns={[
          { id: 'date', label: 'Date' },
          {
            id: 'students',
            label: 'Students',
            render: (value, row) => 50,
            children(row) {
              return (
                <Box display="flex" gap={1} flexWrap="wrap">
                  {' '}
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((item) => (
                    <Card
                      elevation={4}
                      key={item}
                      sx={{ cursor: 'pointer' }}
                      onClick={classDialog.onTrue}
                    >
                      <CardHeader title={`Class ${item}`} textAlign="center" />
                      <CardContent>
                        {' '}
                        <Typography component="span" color="Highlighted" fontWeight="bold">
                          {' '}
                          (20)
                        </Typography>{' '}
                        Students
                      </CardContent>
                    </Card>
                  ))}{' '}
                </Box>
              );
            },
          },
          {
            id: 'action',
            label: 'Action',
            render: (value, row) => <ThreeDotsActions actions={actions} />,
          },
        ]}
        data={dummyData}
      />
      <CustomDialog
        title="Class 1 - Students"
        handleClose={classDialog.onFalse}
        open={classDialog.value}
        maxWidth="md"
      >
        <Box p={1}>
          <CustomizableTable
            columns={[
              { id: 'firstName', label: 'First Name' },
              { id: 'lastName', label: 'Last Name' },
              {
                id: 'action',
                label: 'Action',
                render: (value, row) => <ThreeDotsActions actions={actions} />,
              },
            ]}
            data={dummyStudentData}
          />
        </Box>
      </CustomDialog>
    </Box>
  );
};

export default EntranceExamScreen;

const ExamForm = () => {
  const students = [
    { id: 1, name: 'John Doe' },
    { id: 2, name: 'Jane Smith' },
    { id: 3, name: 'Bob Johnson' },
  ];

  const validationSchema = Yup.object({
    examDate: Yup.date().required('Exam date is required'),
    selectedStudents: Yup.array()
      .min(1, 'Select at least one student')
      .required('Students are required'),
  });

  const formik = useFormik({
    initialValues: {
      examDate: null,
      selectedStudents: [],
    },
    validationSchema,
    onSubmit: (values) => {
      console.log(values);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Scrollbar
        sx={{
          p: 3,
          bgcolor: 'background.neutral',
          //   height: 'calc(100vh - 150px)',
        }}
      >
        <DatePicker
          format="DD/MM/YYYY"
          label="Exam Date"
          name="examDate"
          value={formik.values.examDate}
          onChange={(value) => formik.setFieldValue('examDate', value)}
          slotProps={{
            textField: {
              size: 'small',
              fullWidth: true,
              error: formik.touched.examDate && Boolean(formik.errors.examDate),
              helperText: formik.touched.examDate && formik.errors.examDate,
            },
          }}
        />

        <FormControl fullWidth margin="normal">
          <InputLabel id="students-label" size="small">
            Students
          </InputLabel>
          <Select
            labelId="students-label"
            multiple
            label="Students"
            value={formik.values.selectedStudents}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            name="selectedStudents"
            error={formik.touched.selectedStudents && Boolean(formik.errors.selectedStudents)}
            size="small"
            renderValue={(selected) => selected.join(', ')}
          >
            {students.map((student) => (
              <MenuItem key={student.id} value={student.name}>
                {/* @ts-ignore */}
                <Checkbox checked={formik.values.selectedStudents.includes(student.name)} />
                <ListItemText primary={student.name} />
              </MenuItem>
            ))}
          </Select>
          {formik.touched.selectedStudents && formik.errors.selectedStudents && (
            <div style={{ color: 'red', fontSize: '0.75rem', marginTop: '3px' }}>
              {formik.errors.selectedStudents}
            </div>
          )}
        </FormControl>
      </Scrollbar>
      <DialogActions sx={{ flexShrink: 0 }}>
        <Button type="submit" variant="contained" color="primary" style={{ marginTop: '1rem' }}>
          Submit
        </Button>
      </DialogActions>
    </form>
  );
};
