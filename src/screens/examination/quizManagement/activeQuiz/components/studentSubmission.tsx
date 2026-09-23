import type { LabelColor } from 'src/components/label';

import { useState } from 'react';
import { Label } from 'src/components/label';
import { Box, Typography } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import CustomDialog from 'src/components/customDialog';
import CustomTooltip from 'src/components/custom-tooltip';
import CustomizableTable from 'src/components/customizabaleTable';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import { QuizStatusType, QuizStatusOptions, QuizStatusTypeColors } from 'src/enums/quiz-status';

import { ViewAnswers } from './viewStudentAnswer';

const studentTableInitialData = [
  {
    id: 1,
    GrNo: 'SM2024001',
    studentName: 'Patel Raj Mukeshbhai',
    subject: 'Mathematics',
    totalMarks: 100,
    passingMarks: 40,
    scoringMarks: 50,
    status: 0, // Pass
  },
  {
    id: 2,
    GrNo: 'SM2024002',
    studentName: 'Shah Priya Hiteshbhai',
    subject: 'Science',
    totalMarks: 100,
    passingMarks: 50,
    scoringMarks: 35,
    status: 1, // Fail
  },
  {
    id: 3,
    GrNo: 'SM2024003',
    studentName: 'Mehta Riya Rajeshbhai',
    subject: 'History',
    totalMarks: 100,
    passingMarks: 50,
    scoringMarks: '',
    status: 2, // Pending
  },
  {
    id: 4,
    GrNo: 'SM2024004',
    studentName: 'Desai Jay Prakashbhai',
    subject: 'Geography',
    totalMarks: 100,
    passingMarks: 50,
    scoringMarks: '',
    status: 2, // Pending
  },
  {
    id: 5,
    GrNo: 'SM2024005',
    studentName: 'Joshi Neel Sanjaybhai',
    subject: 'English',
    totalMarks: 100,
    passingMarks: 40,
    scoringMarks: 70,
    status: 0, // Pass
  },
  {
    id: 6,
    GrNo: 'SM2024006',
    studentName: 'Sharma Dhruv Amitbhai',
    subject: 'Biology',
    totalMarks: 100,
    passingMarks: 50,
    scoringMarks: 45,
    status: 1, // Fail
  },
  {
    id: 7,
    GrNo: 'SM2024007',
    studentName: 'Modi Krisha Nileshbhai',
    subject: 'Chemistry',
    totalMarks: 100,
    passingMarks: 40,
    scoringMarks: '',
    status: 2, // Pending
  },
];
export const StudentSubmissions = () => {
  // State to track the currently selected student for individual actions
  const [, setSelectedStudent] = useState<any | null>(null);

  // State to store and update the table data, initialized with dummy student data
  const [tableData] = useState<any[]>(studentTableInitialData);

  // Dialog control for viewing student answers modal
  const viewAnsweresDialog = useBoolean();

  // Dialog control for bulk grading modal

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
          noDataText={<>Student Submission Data Not Found</>}
          columns={[
            {
              id: 'GrNo',
              label: 'Gr No.',
              align: 'left',
              sticky: true,
            },
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
                  <AdaptiveThreeDotsActions
                    placement="right-top"
                    actions={[
                      ...(row.status === 2
                        ? [
                            {
                              id: 'view',
                              label: 'View submission',
                              icon: 'mdi:eye',
                              onClick: () => {
                                viewAnsweresDialog.onTrue();
                                setSelectedStudent(row);
                              },
                            },
                          ]
                        : []),
                      ...(row.status === 1 || row.status === 0
                        ? [
                            {
                              id: 'reminder',
                              label: 'Send reminder',
                              icon: 'mdi:bell',
                              onClick: () => undefined,
                            },
                          ]
                        : []),
                    ]}
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
          title={
            <Box display="flex" flexDirection="row" gap={1} alignItems="center">
              <Typography variant="h5">Answer Review</Typography>
              <CustomTooltip
                arrow
                placement="right"
                sx={{ textAlign: 'justify' }}
                title="Review student's submitted answers and provide feedback on their quiz performance"
              >
                <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
              </CustomTooltip>
            </Box>
          }
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
