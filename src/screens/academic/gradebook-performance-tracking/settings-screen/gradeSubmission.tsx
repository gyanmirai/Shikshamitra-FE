import type { Dayjs } from 'dayjs';
import type { Division, Standards } from 'src/types/school';

import dayjs from 'dayjs';
// import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';
import { Add } from '@mui/icons-material';
import { useBoolean } from 'src/hooks/useBoolean';
import { DateTimePicker } from '@mui/x-date-pickers';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/custom-dialog';
import CustomSelect from 'src/components/custom-select';
import { useGetClassQuery } from 'src/redux/class/classApi';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizable-table';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  Box,
  Grid,
  Button,
  Typography,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';

interface TGradeDeadline {
  id: number;
  className: string;
  division: string;
  subject: string;
  assignmentType: string;
  assignmentTitle: string;
  deadline: Dayjs | null;
}

const initialAssignments: TGradeDeadline[] = [
  {
    id: 1,
    className: '1',
    division: 'A',
    subject: 'Mathematics',
    assignmentType: 'Homework',
    assignmentTitle: 'Algebra Worksheet',
    deadline: dayjs('2024-10-28'),
  },
  {
    id: 2,
    className: '11',
    division: 'A',
    subject: 'Accountancy',
    assignmentType: 'Project',
    assignmentTitle: 'Financial Statement Analysis',
    deadline: dayjs('2024-10-28'),
  },
  {
    id: 3,
    className: '12',
    division: 'C',
    subject: 'History',
    assignmentType: 'Essay',
    assignmentTitle: 'World War II Research Paper',
    deadline: dayjs('2024-10-28'),
  },
];

const GradeSubmission = () => {
  const [isEdit, setIsEdit] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<TGradeDeadline | null>(null);
  const dialog = useBoolean();
  const deleteConfirmDialog = useBoolean();
  const [assignments, setAssignments] = useState<TGradeDeadline[]>(initialAssignments);

  const handleCloseDialog = () => {
    setSelectedAssignment(null);
    setIsEdit(false);
    dialog.onFalse();
    deleteConfirmDialog.onFalse();
  };

  const handleSubmit = (values: any) => {
    const newDeadline = {
      ...values,
      id:
        isEdit && selectedAssignment
          ? selectedAssignment.id
          : Math.max(...assignments.map((a) => a.id)) + 1,
      deadline: dayjs(values.deadline),
    };

    if (isEdit && selectedAssignment) {
      // Update existing assignment
      setAssignments((prevAssignments) =>
        prevAssignments.map((a) => (a.id === selectedAssignment.id ? newDeadline : a))
      );
    } else {
      // Add new assignment
      setAssignments((prevAssignments) => [...prevAssignments, newDeadline]);
    }

    handleCloseDialog();
  };

  const handleDelete = () => {
    if (selectedAssignment) {
      setAssignments(assignments.filter((a) => a.id !== selectedAssignment.id));
      deleteConfirmDialog.onFalse();
      setSelectedAssignment(null);
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'flex-end', mb: 2 }}>
        <Button
          startIcon={<Add />}
          variant="contained"
          size="small"
          onClick={() => {
            dialog.onTrue();
          }}
        >
          Grade Deadline
        </Button>
      </Box>

      <CustomizableTable
        tableId="grade-submission-table"
        columns={[
          { id: 'className', label: 'Class' },
          { id: 'division', label: 'Division' },
          { id: 'subject', label: 'Subject' },
          { id: 'assignmentType', label: 'Assignment Type' },
          {
            id: 'assignmentTitle',
            label: 'Assignment Title',
          },
          {
            id: 'deadline',
            label: 'Deadline',
            render: (value, row) => (
              <Typography fontSize="12px" gutterBottom>
                {dayjs(value).format('DD MMM YYYY')}
              </Typography>
            ),
          },
          {
            id: 'action',
            label: 'Action',
            isSort: false,
            render(value, row) {
              return (
                <ThreeDotsActions
                  // actions={(prop) => actions({ ...props, row })}
                  placement="right-top"
                  showEditIcon
                  showDeleteIcon
                  showThreeDots={false}
                  handleEditClick={() => {
                    setSelectedAssignment(row as TGradeDeadline);
                    setIsEdit(true);
                    dialog.onTrue();
                  }}
                  handleDeleteClick={() => {
                    setSelectedAssignment(row as TGradeDeadline);
                    deleteConfirmDialog.onTrue();
                  }}
                />
              );
            },
          },
        ]}
        data={assignments}
      />
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 1 }}>
        <Button variant="contained">Save</Button>
      </Box>

      <CustomDialog
        open={dialog.value}
        handleClose={handleCloseDialog}
        title={isEdit ? 'Update Deadline' : 'Add Deadline'}
      >
        <GradeDeadlineForm
          onSubmit={handleSubmit}
          onClose={dialog.onFalse}
          data={selectedAssignment}
          isEdit={isEdit}
        />
      </CustomDialog>

      <CustomDialog
        maxWidth="sm"
        open={deleteConfirmDialog.value}
        handleClose={handleCloseDialog}
        title="Delete Grade Submission Deadline"
      >
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the deadline for &quot;
            {selectedAssignment?.assignmentTitle}&quot; in {selectedAssignment?.className}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </CustomDialog>
    </Box>
  );
};

export default GradeSubmission;

const GradeDeadlineForm: React.FC<{
  onSubmit: (values: any) => void;
  onClose: () => void;
  data: TGradeDeadline | null;
  isEdit: boolean;
}> = ({ onSubmit, onClose, data, isEdit }) => {
  const [classes, setClasses] = useState<string>('');
  const [division, setDivision] = useState<any>([]);
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  // const validationSchema = Yup.object().shape({
  //   className: Yup.string().required('Class Name is Required'),
  //   division: Yup.string().required('Division is Required'),
  //   subject: Yup.string().required('Subject is Required'),
  //   assignmentType: Yup.string().required('Assignment Type is Required'),
  //   assignmentTitle: Yup.string().required('Assignment Title is Required'),
  //   deadline: Yup.date().nullable().required('Deadline is Required'),
  // });

  const formik = useFormik({
    initialValues: {
      className: data?.className || '',
      division: data?.division || '',
      subject: data?.subject || '',
      assignmentType: data?.assignmentType || '',
      assignmentTitle: data?.assignmentTitle || '',
      deadline: data?.deadline ? dayjs(data?.deadline) : null,
    },
    // validationSchema,
    onSubmit: (values) => {
      onSubmit(values);
    },
  });

  return (
    <Box display="flex" flexDirection="column" gap={1}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '200px' }}>
          <Grid container spacing={1}>
            <Grid size={{ xs: 6 }}>
              <CustomSelect
                label="Class"
                options={classData?.items || []}
                value={classes}
                isLoading={isLoading}
                labelKey="name"
                valueKey="id"
                onChange={(val) => {
                  const selectedClass: Standards = classData.items.find(
                    (i: Standards) => i.id === val
                  );
                  formik.setFieldValue('className', selectedClass?.name || '');
                  setClasses(val as string);
                  setDivisionOptions(selectedClass?.divisions || []);
                }}
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <CustomSelect
                label="Division"
                disabled={!classes}
                labelKey="name"
                valueKey="id"
                options={divisionOptions}
                value={division}
                onChange={(val) => {
                  const selectedDivision = divisionOptions.find((i: Division) => i.id === val);
                  formik.setFieldValue('division', selectedDivision?.name || '');
                  setDivision(val);
                }}
                formControlProps={{ fullWidth: true, sx: { maxWidth: 'unset' } }}
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <CustomSelect
                label="Subject"
                disabled={!formik.values.division}
                options={[
                  { value: 'math', label: 'Mathematics' },
                  { value: 'science', label: 'Science' },
                  { value: 'english', label: 'English' },
                ]}
                onChange={(val) => {
                  formik.setFieldValue('subject', val);
                }}
                value={formik.values.subject}
                formControlProps={{ sx: { width: '100%', maxWidth: '200px' } }}
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <CustomSelect
                label="Assignment Type"
                disabled={!formik.values.subject}
                options={[
                  { value: 'Homework', label: 'Homework' },
                  { value: 'Quiz', label: 'Quiz' },
                  { value: 'Project', label: 'Project' },
                  { value: 'Essay', label: 'Essay' },
                ]}
                onChange={(val) => formik.setFieldValue('assignmentType', val)}
                value={formik.values.assignmentType}
                formControlProps={{ sx: { width: '100%', maxWidth: '200px' } }}
              />
            </Grid>

            <Grid size={{ xs: 6 }}>
              <CustomSelect
                label="Assignment Title"
                disabled={!formik.values.assignmentType}
                options={[
                  { value: 'Chapter 1 Quiz', label: 'Chapter 1 Quiz' },
                  { value: 'Chapter 2 Quiz', label: 'Chapter 2 Quiz' },
                  { value: 'Chapter 3 Quiz', label: 'Chapter 3 Quiz' },
                  { value: 'Assignment 1', label: 'Assignment 1' },
                  { value: 'Assignment 2', label: 'Assignment 2' },
                  { value: 'Quiz 3', label: 'Quiz 3' },
                  { value: 'Lab Report', label: 'Lab Report' },
                ]}
                onChange={(val) => formik.setFieldValue('assignmentTitle', val as string)}
                value={formik.values.assignmentTitle}
                formControlProps={{ sx: { width: '100%', maxWidth: '200px' } }}
              />
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              <DateTimePicker
                label="Deadline"
                value={formik.values.deadline}
                onChange={(value) => formik.setFieldValue('deadline', value)}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    error: formik.touched.deadline && Boolean(formik.errors.deadline),
                    helperText: formik.touched.deadline && formik.errors.deadline,
                  },
                }}
              />
            </Grid>
          </Grid>
        </Scrollbar>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {isEdit ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Box>
  );
};
