import dayjs from 'dayjs';
import React, { useState } from 'react';

import { Box, Card, Stack, Divider, Typography, CircularProgress } from '@mui/material';

import CustomizableTable from '../customizabaleTable';

interface Subject {
  id: number;
  subjectName: string;
  progress: number;
}

const subjectsProgress: Subject[] = [
  { id: 1, subjectName: 'Mathematics', progress: 80 },
  { id: 2, subjectName: 'Science', progress: 65 },
  { id: 3, subjectName: 'English', progress: 90 },
  { id: 4, subjectName: 'History', progress: 70 },
  { id: 5, subjectName: 'Geography', progress: 60 },
  { id: 6, subjectName: 'Physics', progress: 75 },
  { id: 7, subjectName: 'Chemistry', progress: 85 },
  { id: 8, subjectName: 'Biology', progress: 55 },
  { id: 9, subjectName: 'Computer Science', progress: 95 },
  { id: 10, subjectName: 'Economics', progress: 50 },
];

const SubjectPerformance = () => {
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  return (
    <Box>
      <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
        {subjectsProgress.map((subject, index) => (
          <SubjectCard
            selectedSubject={selectedSubject}
            subjectId={subject.id}
            subjectName={subject.subjectName}
            progress={subject.progress}
          />
        ))}
      </Box>
      <Typography variant="h6" mt={4} mb={2}>
        Mathematics Progress
      </Typography>
      <CustomizableTable
        tableId="course-progress-table"
        columns={[
          { id: 'chapterName', label: 'Chapter Name', minWidth: '200px', align: 'left' },
          { id: 'teacherName', label: 'Teacher Name', minWidth: '200px', align: 'left' },
          {
            id: 'progress',
            label: 'Progress',
            align: 'left',
            minWidth: '200px',
            filterType: 'number',
            render(value, row) {
              return (
                <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                  <CircularProgress variant="determinate" value={value} />
                  <Box
                    sx={{
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                      position: 'absolute',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Typography variant="caption" component="div" sx={{ color: 'text.secondary' }}>
                      {value}%
                    </Typography>
                  </Box>
                </Box>
              );
            },
          },
          {
            id: 'timeLine',
            label: 'Timeline',
            align: 'left',
            minWidth: '200px',
            filterType: 'date',
            render: (value, row) => (
              <Typography fontSize="12px" gutterBottom>
                {dayjs(value).format('DD MMM YYYY')}
              </Typography>
            ),
          },
        ]}
        data={[
          {
            id: 1,
            chapterName: 'Introduction to React',
            teacherName: 'John Doe',
            progress: 75,
            timeLine: '2025-03-08',
          },
          {
            id: 2,
            chapterName: 'State Management with Redux',
            teacherName: 'Jane Smith',
            progress: 50,
            timeLine: '2025-03-15',
          },
          {
            id: 3,
            chapterName: 'Advanced JavaScript',
            teacherName: 'Alice Johnson',
            progress: 90,
            timeLine: '2025-03-20',
          },
          {
            id: 4,
            chapterName: 'Backend Integration with NestJS',
            teacherName: 'Robert Brown',
            progress: 30,
            timeLine: '2025-04-05',
          },
          {
            id: 5,
            chapterName: 'MongoDB and Data Persistence',
            teacherName: 'Michael Lee',
            progress: 60,
            timeLine: '2025-04-15',
          },
        ]}
      />
    </Box>
  );
};

export default SubjectPerformance;

interface SubjectCardProps {
  selectedSubject: Subject | null;
  subjectId: number;
  subjectName: string;
  progress: number;
}

const SubjectCard: React.FC<SubjectCardProps> = ({
  selectedSubject,
  subjectId,
  subjectName,
  progress,
}) => (
  <Card
    elevation={3}
    sx={{
      py: 2,
      textAlign: 'center',
      typography: 'h4',
      maxWidth: '250px',
      width: '100%',
      border:
        subjectId === selectedSubject?.id
          ? '3px solid #1a1a1a' // Darker border when selected
          : '2px solid #e0e0e0', // Initial light border
      transition: 'all 0.2s ease',
      boxShadow: subjectId === selectedSubject?.id ? '0 0 0 2px rgba(0, 0, 0, 0.1)' : 'none',
      '&:hover': {
        borderColor: '#757575', // Medium gray for hover state
      },
      cursor: 'pointer',
    }}
  >
    <Stack
      direction="row"
      divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
    >
      <Stack width={1}>
        <Box fontSize="14px" display="flex" flexDirection="column" justifyContent="center">
          <Typography variant="h6" gutterBottom>
            {subjectName}
          </Typography>
          <Box position="relative" mr={2}>
            <CircularProgress
              variant="determinate"
              value={progress}
              size={50}
              thickness={2}
              color="success"
            />
            <Box
              top={0}
              left={0}
              bottom={0}
              right={0}
              position="absolute"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              <Typography variant="caption" component="div">
                {progress}%
              </Typography>
            </Box>
          </Box>
        </Box>
      </Stack>
    </Stack>
  </Card>
);
