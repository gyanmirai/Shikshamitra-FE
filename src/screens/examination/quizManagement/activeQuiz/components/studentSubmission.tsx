import type { LabelColor } from 'src/components/label';

import { useState } from 'react';

import { Box, MenuList, MenuItem, Typography } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import { QuizStatusType, QuizStatusOptions, QuizStatusTypeColors } from 'src/enums/quiz-status';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import { ViewAnswers } from './viewStudentAnswer';

const studentTableInitialData = [
  {
    id: 1,
    studentName: 'John Doe',
    subject: 'Mathematics',
    totalMarks: 100,
    passingMarks: 40,
    scoringMarks: 85,
    status: 1, // Pass
  },
  {
    id: 2,
    studentName: 'Jane Smith',
    subject: 'Science',
    totalMarks: 100,
    passingMarks: 50,
    scoringMarks: 35,
    status: 0, // Fail
  },
  {
    id: 3,
    studentName: 'Alice Johnson',
    subject: 'History',
    totalMarks: 100,
    passingMarks: 50,
    scoringMarks: '',
    status: 2, // Pending
  },
  {
    id: 4,
    studentName: 'Bob Brown',
    subject: 'Geography',
    totalMarks: 100,
    passingMarks: 50,
    scoringMarks: '',
    status: 2, // Pending
  },
  {
    id: 5,
    studentName: 'Eve Davis',
    subject: 'English',
    totalMarks: 100,
    passingMarks: 40,
    scoringMarks: 70,
    status: 1, // Pass
  },
  {
    id: 6,
    studentName: 'Chris Wilson',
    subject: 'Biology',
    totalMarks: 100,
    passingMarks: 50,
    scoringMarks: 45,
    status: 0, // Fail
  },
  {
    id: 7,
    studentName: 'Laura Adams',
    subject: 'Chemistry',
    totalMarks: 100,
    passingMarks: 40,
    scoringMarks: '',
    status: 2, // Pending
  },
];

export const StudentSubmissions = () => {
  // State to track the currently selected student for individual actions
  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  // State to store and update the table data, initialized with dummy student data
  const [tableData, setTableData] = useState<any[]>(studentTableInitialData);

  // State to track multiple selected students for bulk actions
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  // Dialog control for general purpose modal
  const dialog = useBoolean();

  // Dialog control for viewing student answers modal
  const viewAnsweresDialog = useBoolean();

  // Dialog control for bulk grading modal
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
    dialog.onFalse();
    setSelectedStudent(null);
  };

  const handleCloseDialog = () => {
    setSelectedStudent(null);
    viewAnsweresDialog.onFalse();
  };

  return (
    <Box sx={{ p: 1 }}>
      {/* <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<Iconify icon="mdi:pencil" />}
            disabled={selectedStudents.length === 0}
            onClick={bulkGradeDialog.onTrue}
          >
            Bulk Grade ({selectedStudents.length} selected)
          </Button>
        </Box> */}

      <Scrollbar sx={{ p: 2 }}>
        <CustomizableTable
          tableId="student-table"
          columns={[
            {
              id: 'studentName',
              label: 'Student Name',
              align: 'left',
            },
            {
              id: 'totalMarks',
              label: 'Total Marks',
              align: 'left',
            },
            {
              id: 'passingMarks',
              label: 'Passing Marks',
              align: 'left',
            },
            {
              id: 'scoringMarks',
              label: 'Scoring Marks',
              align: 'left',
              render: (value, row) =>
                value ? <Typography variant="caption">{value}</Typography> : '-',
            },
            {
              id: 'status',
              label: 'Status',
              filterType: 'enum',
              sticky: true,
              enumOptions: QuizStatusOptions,
              align: 'left',
              render: (value, row) => {
                const color = QuizStatusTypeColors[value as QuizStatusType] as LabelColor;
                return <Label color={color}>{QuizStatusType[value]}</Label>;
              },
            },
            {
              id: 'action',
              label: 'Action',
              align: 'left',
              minWidth: 50,
              isFilter: false,
              sticky: true,
              render(value, row) {
                return (
                  <ThreeDotsActions
                    placement="right-top"
                    actions={(pop) => (
                      <MenuList>
                        {row.status === 2 && (
                          <MenuItem
                            onClick={() => {
                              viewAnsweresDialog.onTrue();
                              setSelectedStudent(row);
                              pop.popover.onClose();
                            }}
                          >
                            {' '}
                            <Iconify icon="mdi:eye" sx={{ height: '16px', width: '16px' }} />
                            View Submission
                          </MenuItem>
                        )}

                        {(row.status === 1 || row.status === 0) && (
                          <MenuItem onClick={() => {}}>
                            {' '}
                            <Iconify icon="mdi:bell" sx={{ height: '16px', width: '16px' }} />
                            Send Reminder
                          </MenuItem>
                        )}
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
                    )}
                  />
                );
              },
            },
          ]}
          data={tableData}
        />

        <CustomDialog
          open={viewAnsweresDialog.value}
          handleClose={handleCloseDialog}
          title="Answer Review"
          maxWidth="md"
        >
          <ViewAnswers />
        </CustomDialog>

        {/* <CustomDialog
            open={bulkGradeDialog.value}
            handleClose={bulkGradeDialog.onFalse}
            title={`Assign Grade to ${selectedStudents.length} Students`}
            maxWidth="md"
          >
            <AssignGrade onSubmit={handleBulkGradeAssignment} />
          </CustomDialog> */}
      </Scrollbar>
    </Box>
  );
};
