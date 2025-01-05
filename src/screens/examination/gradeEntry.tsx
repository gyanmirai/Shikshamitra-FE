'use client';

import type { Division, Standards } from 'src/types/school';

import { useFormik } from 'formik';
import React, { useState, useEffect, useCallback } from 'react';

import {
  Box,
  Grid,
  Button,
  Checkbox,
  MenuList,
  MenuItem,
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetClassQuery } from 'src/redux/class/classApi';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomSelect from 'src/components/custom-select';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import type { TabComponentType } from '../hr/leave-request';

export const dummyData = [
  {
    id: '1',
    studentName: 'John Smith',
    assignments: 'Math Quiz 1',
    subject: 'Mathematics',
    grade: 'A',
    feedback: 'Excellent',
    weightedAverage: '85%',
    status: 'Assigned',
  },
  {
    id: '2',
    studentName: 'Emma Wilson',
    assignments: 'Science Project',
    subject: 'Science',
    grade: '',
    feedback: '',
    weightedAverage: '92%',
    status: 'Pending',
  },
  {
    id: '3',
    studentName: 'Michael Brown',
    assignments: 'English Essay',
    subject: 'English',
    grade: 'C',
    feedback: 'Need Improvement',
    weightedAverage: '75%',
    status: 'Assigned',
  },
  {
    id: '4',
    studentName: 'Sarah Davis',
    assignments: 'Math Homework',
    subject: 'Mathematics',
    grade: '',
    feedback: '',
    weightedAverage: '88%',
    status: 'Pending',
  },
  {
    id: '5',
    studentName: 'James Johnson',
    assignments: 'Science Quiz',
    subject: 'Science',
    grade: 'B',
    feedback: 'Good',
    weightedAverage: '87%',
    status: 'Assigned',
  },
];

const GradeEntry = (props: TabComponentType) => {
  const dialog = useBoolean();
  const { searchParams, setSearchParams } = props;

  const classes = searchParams?.classId ? searchParams?.classId : '';

  const [division, setDivision] = useState('');
  const [divisionOptions, setDivisionOptions] = useState<Division[]>([]);
  const [subject, setSubject] = useState(searchParams?.subject ? searchParams?.subject : '');
  const [assignmentType, setAssignmentType] = useState(
    searchParams?.assignmentType ? searchParams?.assignmentType : ''
  );
  const [assignmentTitle, setAssignmentTitle] = useState(
    searchParams?.assigngmentTitle ? searchParams?.assigngmentTitle : ''
  );
  const { data: classData, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetClassQuery,
  });

  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
  const [tableData, setTableData] = useState(dummyData);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const viewSubmissionDialog = useBoolean();
  const bulkGradeDialog = useBoolean();

  const handleSelectStudent = (studentId: string) => {
    setSelectedStudents((prev) => {
      if (prev.includes(studentId)) {
        return prev.filter((id) => id !== studentId);
      }
      return [...prev, studentId];
    });
  };

  const handleBulkGradeAssignment = (values: { grade: string }) => {
    setTableData((prevData) =>
      prevData.map((student) =>
        selectedStudents.includes(student.id) ? { ...student, grade: values.grade } : student
      )
    );
    bulkGradeDialog.onFalse();
    setSelectedStudents([]);
  };

  const handleSingleGradeAssignment = (values: { grade: string; feedback: string }) => {
    setTableData((prevData) =>
      prevData.map((student) =>
        student.id === selectedStudent?.id
          ? { ...student, grade: values.grade, feedback: values.feedback }
          : student
      )
    );
    handleCloseDialog();
  };

  const handleCloseDialog = () => {
    setSelectedStudent(null);
    viewSubmissionDialog.onFalse();
    dialog.onFalse();
    bulkGradeDialog.onFalse();
  };

  useEffect(() => {
    if (classData?.items?.length) {
      if (classes) {
        const selectedClass = classData.items.find((i: Standards) => i.id === classes);
        setDivisionOptions(selectedClass?.divisions || []);
        // Set first division if available
        if (selectedClass?.divisions?.length) {
          setDivision(selectedClass.divisions[0].id);
        }
      } else {
        const firstClass = classData.items[0];
        setSearchParams?.({
          classId: firstClass.id,
        });
        setDivisionOptions(firstClass?.divisions || []);
        // Set first division if available
        if (firstClass?.divisions?.length) {
          setDivision(firstClass.divisions[0].id);
        }
      }
    }
  }, [classData?.items, classes, setSearchParams]);

  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <>
        {' '}
        <MenuList>
          {row.status === 'Pending' && (
            <MenuItem
              onClick={() => {
                viewSubmissionDialog.onTrue();
                setSelectedStudent(row);
              }}
            >
              {' '}
              <Iconify icon="mdi:arrow-right-bold" sx={{ height: '16px', width: '16px' }} />
              Assign Grade
            </MenuItem>
          )}

          {row.status === 'Assigned' && (
            <MenuItem
              onClick={() => {
                //   viewSubmissionDialog.onTrue();
                //   setSelectedStudent(row);
              }}
            >
              {' '}
              <Iconify icon="mdi:pen" sx={{ height: '16px', width: '16px' }} />
              Edit Grade
            </MenuItem>
          )}

          {/* {(row.status === 'Pending' || row.status === 'Overdue') && (
                          <MenuItem onClick={() => {}}>
                            {' '}
                            <Iconify icon="mdi:bell" sx={{ height: '16px', width: '16px' }} />
                            Send Reminder
                          </MenuItem>
                        )} */}
          {/* {row.grade === 'Assign Grade' ? (
                      <MenuItem>
                        <Iconify
                          icon="mingcute:notification-fill"
                          sx={{ height: '16px', width: '16px' }}
                        />
                        Remind To Teacher
                      </MenuItem>
                    ) : (
                      <MenuItem>
                        <Iconify
                          icon="material-symbols:upload"
                          sx={{ height: '16px', width: '16px' }}
                        />
                        Upload to Student
                      </MenuItem>
                    )} */}
          {/* <MenuItem
                      onClick={() => {
                        viewResultDialog.onTrue();
                        setSelectedStudent(row);
                      }}
                    >
                      {' '}
                      <Iconify icon="mdi:eye" sx={{ height: '16px', width: '16px' }} />
                      View Result
                    </MenuItem> */}

          {/* <MenuItem
                      onClick={() => {
                        viewProfile.onTrue();
                      }}
                    >
                      {' '}
                      <Iconify icon="mdi:eye" sx={{ height: '16px', width: '16px' }} />
                      View Profile
                    </MenuItem> */}
        </MenuList>
      </>
    ),
    [viewSubmissionDialog]
  );

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Grade Entry"
        links={[
          { name: 'Examination and Assessment' },
          { name: 'Examination' },
          { name: 'Grade Entry' },
        ]}
        sx={{ px: 1, mb: 2 }}
      />
      <Box display="flex" gap={2} flexWrap="wrap" alignItems="center" mb={3}>
        <CustomSelect
          label="Class"
          options={classData?.items || []}
          labelKey="name"
          valueKey="id"
          onChange={(val) => {
            const selectedClass: Standards = classData.items.find((i: Standards) => i.id === val);
            // formik.setFieldValue('class', selectedClass?.name || '');
            setSearchParams?.({
              classId: val as string,
            });

            setDivisionOptions(selectedClass?.divisions || []);
          }}
          value={classes}
          formControlProps={{
            sx: { width: '100%', maxWidth: '200px' },
          }}
        />
        <CustomSelect
          label="Division"
          disabled={!classes}
          labelKey="name"
          valueKey="id"
          options={divisionOptions}
          value={division}
          onChange={(val) => {
            // const selectedDivision = divisionOptions.find((i: Division) => val.includes(i.id));
            // formik.setFieldValue('division', selectedDivision?.name || '');
            setDivision(val as string);
          }}
          formControlProps={{
            sx: { width: '100%', maxWidth: '200px' },
          }}
        />
        <CustomSelect
          label="Subject"
          disabled={!division}
          options={[
            { value: 'math', label: 'Mathematics' },
            { value: 'science', label: 'Science' },
            { value: 'english', label: 'English' },
          ]}
          onChange={(val) => {
            setSubject(val as string);
          }}
          value={subject}
          formControlProps={{
            sx: { width: '100%', maxWidth: '200px' },
          }}
        />
        <CustomSelect
          label="Exam Type"
          disabled={!subject}
          options={[
            { value: 'mid', label: 'Mid' },
            { value: 'practical', label: 'Practical' },
            { value: 'final', label: 'Final' },
          ]}
          onChange={(val) => {
            setAssignmentType(val as string);
          }}
          value={assignmentType}
          formControlProps={{
            sx: { width: '100%', maxWidth: '200px' },
          }}
        />
        <CustomSelect
          label="Exam Title"
          disabled={!assignmentType}
          options={[
            { value: 'Chapter 1 Quiz', label: 'Chapter 1 Quiz' },
            { value: 'Chapter 2 Quiz', label: 'Chapter 2 Quiz' },
            { value: 'Chapter 3 Quiz', label: 'Chapter 3 Quiz' },
            { value: 'Assignment 1', label: 'Assignment 1' },
            { value: 'Assignment 2', label: 'Assignment 2' },
            { value: 'Quiz 3', label: 'Quiz 3' },
            { value: 'Lab Report', label: 'Lab Report' },
          ]}
          onChange={(val) => {
            setAssignmentTitle(val as string);
          }}
          value={assignmentTitle}
          formControlProps={{
            sx: { width: '100%', maxWidth: '200px' },
          }}
        />
      </Box>

      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
        <Button
          variant="contained"
          size="small"
          startIcon={<Iconify icon="mdi:pencil" />}
          disabled={selectedStudents.length === 0}
          onClick={bulkGradeDialog.onTrue}
        >
          Bulk Grade ({selectedStudents.length} selected)
        </Button>
        <Button
          variant="contained"
          size="small"
          startIcon={<Iconify icon="material-symbols:upload" />}
          onClick={() => {}}
        >
          Publish Marks
        </Button>
      </Box>

      <CustomizableTable
        columns={[
          {
            id: 'select',
            label: 'Select',
            render: (value, row: any) => (
              <Checkbox
                checked={selectedStudents.includes(row.id)}
                onChange={() => handleSelectStudent(row.id)}
              />
            ),
          },
          { id: 'studentName', label: 'Student Name' },
          { id: 'assignments', label: 'Assignments' },
          { id: 'subject', label: 'Subject' },
          {
            id: 'grade',
            label: 'Grade',
            render: (value, row) =>
              value === '' ? (
                <Typography variant="subtitle2" color="textSecondary">
                  -
                </Typography>
              ) : (
                <Typography variant="caption" gutterBottom>
                  {value}
                </Typography>
              ),
          },
          {
            id: 'feedback',
            label: 'Feedback',
            render: (value, row) =>
              value === '' ? (
                <Typography variant="subtitle2" color="textSecondary">
                  -
                </Typography>
              ) : (
                <Typography variant="caption" gutterBottom>
                  {value}
                </Typography>
              ),
          },
          {
            id: 'status',
            label: 'Status',
            render: (value, row) => (
              <Label
                color={
                  value === 'Assigned' ? 'primary' : value === 'Pending' ? 'warning' : 'default'
                }
              >
                {value}
              </Label>
            ),
          },
          {
            id: 'actions',
            label: 'Actions',
            isSort: false,
            render(value, row) {
              return (
                <ThreeDotsActions
                  actions={(prop) => actions({ ...prop, row })}
                  placement="right-top"
                />
              );
            },
          },
        ]}
        data={tableData}
      />

      <CustomDialog
        open={viewSubmissionDialog.value}
        handleClose={handleCloseDialog}
        title="Assign Grade"
      >
        <AssignGrade data={selectedStudent} onSubmit={handleSingleGradeAssignment} />
      </CustomDialog>

      <CustomDialog
        open={bulkGradeDialog.value}
        handleClose={bulkGradeDialog.onFalse}
        title={`Assign Grade to ${selectedStudents.length} Students`}
      >
        <AssignGrade onSubmit={handleBulkGradeAssignment} />
      </CustomDialog>
    </Box>
  );
};

export default GradeEntry;

interface AssignGradeProps {
  data?: any;
  onSubmit: (values: { grade: string; feedback: string }) => void;
}

const AssignGrade: React.FC<AssignGradeProps> = ({ data, onSubmit }: AssignGradeProps) => {
  const formik = useFormik({
    initialValues: {
      grade: data?.grade || '',
      feedback: data?.feedback || '',
    },
    onSubmit(values) {
      console.log('values in component ---', values);

      onSubmit(values);
    },
  });

  return (
    <Box display="flex" flexDirection="column" gap={2} p={1}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '300px' }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <CustomSelect
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
                  { value: 'D', label: 'D' },
                  { value: 'F', label: 'F' },
                ]}
                label="Grade"
                name="grade"
                value={formik.values.grade}
                onChange={(val) => {
                  formik.setFieldValue('grade', val);
                }}
                formControlProps={{ sx: { minWidth: 180, width: '100%' } }}
                error={formik.touched.grade && Boolean(formik.errors.grade)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                placeholder="Detailed Feedback"
                multiline
                rows={3}
                fullWidth
                name="feedback"
                value={formik.values.feedback}
                onChange={formik.handleChange}
              />
            </Grid>
          </Grid>
        </Scrollbar>
        <DialogActions>
          <Button size="small" type="submit" variant="contained">
            Submit
          </Button>
        </DialogActions>
      </form>
    </Box>
  );
};
