import { Icon } from '@iconify/react';
import React, { useState } from 'react';

import { GridExpandMoreIcon } from '@mui/x-data-grid';
import {
  Box,
  Card,
  Grid,
  MenuItem,
  useTheme,
  MenuList,
  Accordion,
  TextField,
  Typography,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import { Label } from 'src/components/label';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import { AppWidget } from './courseManagement';

interface SubjectData {
  subject: string;
  content: string;
  progress: number;
}

interface TableRow {
  classId: string;
  subjectName: string;
  courseAssociation: string;
  gradeLevel: string;
  assignedTeacher: string;
}

interface AssignmentRow {
  title: string;
  dueDate: string;
  status: string;
}

const listData: SubjectData[] = [
  { subject: 'Math', content: 'Chapter wise data for math', progress: 80 },
  { subject: 'English', content: 'Chapter wise data for english', progress: 50 },
  { subject: 'Science', content: 'Chapter wise data for science', progress: 30 },
  { subject: 'Physics', content: 'Chapter wise data for physics', progress: 30 },
  { subject: 'SS', content: 'Chapter wise data for social science', progress: 30 },
  { subject: 'Chemistry', content: 'Chapter wise data for chemistry', progress: 30 },
];

interface Chapter {
  id: number;
  chapterName: string;
  content: string;
}

interface Subject {
  subjectName: string;
  courseAssociation: string;
  gradeLevel: string;
  assignedTeacher: string;
  chapters: Chapter[];
}

const subjectsWithChapters: Subject[] = [
  {
    subjectName: 'Math',
    courseAssociation: 'math for class 1',
    gradeLevel: '10',
    assignedTeacher: 'John Doe',
    chapters: [
      {
        id: 1,
        chapterName: 'Algebra Basics',
        content:
          'Introduction to algebraic expressions and equations. Topics include variables, constants, and basic operations.',
      },
      {
        id: 2,
        chapterName: 'Linear Equations',
        content:
          'Solving linear equations and inequalities. Understanding graphing and slope concepts.',
      },
      {
        id: 3,
        chapterName: 'Quadratic Equations',
        content:
          'Understanding and solving quadratic equations using factoring and quadratic formula.',
      },
    ],
  },
  {
    subjectName: 'English',
    courseAssociation: 'English for class 2',
    gradeLevel: '10',
    assignedTeacher: 'Anuj Kapadia',
    chapters: [
      {
        id: 4,
        chapterName: 'Grammar Fundamentals',
        content: 'Parts of speech, sentence structure, and punctuation rules.',
      },
      {
        id: 5,
        chapterName: 'Literature Analysis',
        content:
          'Reading comprehension, character analysis, and theme identification in various texts.',
      },
      {
        id: 6,
        chapterName: 'Writing Skills',
        content: 'Essay writing, creative writing, and formal writing techniques.',
      },
    ],
  },
  {
    subjectName: 'Science',
    courseAssociation: 'Science for class 3',
    gradeLevel: '10',
    assignedTeacher: 'Avinash Dave',
    chapters: [
      {
        id: 7,
        chapterName: 'Scientific Method',
        content: 'Steps of scientific inquiry, hypothesis formation, and experimental design.',
      },
      {
        id: 8,
        chapterName: 'Cell Biology',
        content: 'Cell structure, function, and cellular processes including mitosis and meiosis.',
      },
      {
        id: 9,
        chapterName: 'Ecosystems',
        content: 'Food chains, energy flow, and interactions between organisms in ecosystems.',
      },
    ],
  },
  {
    subjectName: 'Physics',
    courseAssociation: 'Physics for class 3',
    gradeLevel: '10',
    assignedTeacher: 'Avinash Dave',
    chapters: [
      {
        id: 10,
        chapterName: 'Mechanics',
        content: "Newton's laws of motion, force, momentum, and energy conservation.",
      },
      {
        id: 11,
        chapterName: 'Thermodynamics',
        content: 'Laws of thermodynamics, heat transfer, and thermal properties of matter.',
      },
      {
        id: 12,
        chapterName: 'Optics',
        content: 'Light propagation, reflection, refraction, and optical instruments.',
      },
    ],
  },
  {
    subjectName: 'SS',
    courseAssociation: 'SS for class 3',
    gradeLevel: '10',
    assignedTeacher: 'Avinash Dave',
    chapters: [
      {
        id: 13,
        chapterName: 'Ancient Civilizations',
        content: 'Development of early human societies, ancient cultures, and their contributions.',
      },
      {
        id: 14,
        chapterName: 'World Geography',
        content: 'Physical features, climate zones, and human geography across continents.',
      },
      {
        id: 15,
        chapterName: 'Civics',
        content: 'Structure of government, citizenship rights, and democratic processes.',
      },
    ],
  },
  {
    subjectName: 'Chemistry',
    courseAssociation: 'Chemistry for class 3',
    gradeLevel: '10',
    assignedTeacher: 'Avinash Dave',
    chapters: [
      {
        id: 16,
        chapterName: 'Atomic Structure',
        content: 'Atomic models, electron configuration, and periodic trends.',
      },
      {
        id: 17,
        chapterName: 'Chemical Bonding',
        content: 'Ionic and covalent bonds, molecular geometry, and intermolecular forces.',
      },
      {
        id: 18,
        chapterName: 'Organic Chemistry',
        content: 'Carbon compounds, functional groups, and basic organic reactions.',
      },
    ],
  },
];

const Subjects = () => {
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>(false);
  const theme = useTheme();
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [subjectData, setSubjectData] = useState<SubjectData[]>(listData);

  const handleAccordionToggle = (chapterName: string) => {
    setExpandedAccordion((prev) => (prev === chapterName ? false : chapterName));
  };

  const handleEyeClick = (subject: Subject) => {
    setSelectedSubject((prev) => (prev?.subjectName === subject.subjectName ? null : subject));
  };

  const subjectTableData: TableRow[] = [
    {
      classId: '1',
      subjectName: 'Math',
      courseAssociation: 'math for class 1',
      gradeLevel: '10',
      assignedTeacher: 'John Doe',
    },
    {
      classId: '2',
      subjectName: 'English',
      courseAssociation: 'English for class 2',
      gradeLevel: '10',
      assignedTeacher: 'Anuj Kapadia',
    },
    {
      classId: '1',
      subjectName: 'Science',
      courseAssociation: 'Science for class 3',
      gradeLevel: '10',
      assignedTeacher: 'Avinash Dave',
    },
    {
      classId: '1',
      subjectName: 'Physics',
      courseAssociation: 'Physics for class 3',
      gradeLevel: '10',
      assignedTeacher: 'Avinash Dave',
    },
    {
      classId: '1',
      subjectName: 'SS',
      courseAssociation: 'SS for class 3',
      gradeLevel: '10',
      assignedTeacher: 'Avinash Dave',
    },
    {
      classId: '1',
      subjectName: 'Chemistry',
      courseAssociation: 'Chemistry for class 3',
      gradeLevel: '10',
      assignedTeacher: 'Avinash Dave',
    },
  ];

  const assignmentData: AssignmentRow[] = [
    {
      title: 'Assignment 1',
      dueDate: '01-01-24',
      status: 'Pending',
    },
    {
      title: 'Assignment 2',
      dueDate: '01-01-24',
      status: 'Received',
    },
    {
      title: 'Assignment 3',
      dueDate: '01-01-24',
      status: 'Pending',
    },
    {
      title: 'Assignment 4',
      dueDate: '01-01-24',
      status: 'Received',
    },
  ];

  return (
    <Box>
      <Typography variant="h6" marginBottom={1}>
        Subject Overview
      </Typography>

      <CustomizableTable
        columns={[
          {
            id: 'subjectName',
            label: 'Subject Name',
          },
          { id: 'courseAssociation', label: 'Course Association' },
          { id: 'gradeLevel', label: 'Grade Level' },
          { id: 'assignedTeacher', label: 'Assigned Teacher' },
          {
            id: 'viewDetails',
            label: 'View Details',
            render: (value, row) => {
              const subject = subjectsWithChapters.find((s) => s.subjectName === row.subjectName);
              return (
                <Box sx={{ cursor: 'pointer' }} onClick={() => subject && handleEyeClick(subject)}>
                  {selectedSubject?.subjectName === row.subjectName ? (
                    <Icon icon="ion:eye-disabled" />
                  ) : (
                    <Icon icon="oi:eye" />
                  )}
                </Box>
              );
            },
          },
          {
            id: 'action',
            label: 'Action',
            isSort: false,
            render: (value, row) => (
              <ThreeDotsActions
                placement="right-top"
                actions={({ popover: pop }) => (
                  <MenuList>
                    <MenuItem onClick={() => {}} sx={{ color: 'error.main' }}>
                      Edit
                    </MenuItem>
                    <MenuItem>Add Learning Resources</MenuItem>
                    <MenuItem>Update Assessment Criteria</MenuItem>
                  </MenuList>
                )}
              />
            ),
          },
        ]}
        data={subjectTableData}
      />
      {selectedSubject && (
        <Box mt={2}>
          <Typography variant="h6" gutterBottom>
            {selectedSubject.subjectName} Details
          </Typography>
          {selectedSubject.chapters.map((chapter) => (
            <Accordion
              key={chapter.id}
              expanded={expandedAccordion === chapter.chapterName}
              onChange={() => handleAccordionToggle(chapter.chapterName)}
            >
              <AccordionSummary
                expandIcon={<GridExpandMoreIcon />}
                aria-controls={`panel${chapter.id}-content`}
                id={`panel${chapter.id}-header`}
              >
                <Typography>{chapter.chapterName}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography>{chapter.content}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      <Grid container spacing={2} marginTop={2}>
        <Grid item xs={12}>
          <Card
            sx={{
              p: 2,
              height: '100%',
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            <AppWidget
              title="Videos"
              total={38566}
              icon="solar:user-rounded-bold"
              chart={{ series: 48 }}
            />
            <AppWidget
              title="PDFs/Notes"
              total={38566}
              icon="solar:user-rounded-bold"
              chart={{
                series: 75,
                colors: [theme.palette.secondary.light, theme.palette.secondary.main],
              }}
            />
          </Card>
        </Grid>
      </Grid>

      <CustomizableTable
        columns={[
          { id: 'title', label: 'Title' },
          { id: 'dueDate', label: 'Due Date' },
          {
            id: 'status',
            label: 'Status',
            render: (value: string) => (
              <Label
                variant="soft"
                color={
                  value === 'Pending' ? 'warning' : value === 'Received' ? 'success' : 'default'
                }
              >
                {value}
              </Label>
            ),
          },
        ]}
        data={assignmentData}
      />

      <TextField
        placeholder="Teachers to leave comments/notes on subject"
        multiline
        rows={5}
        sx={{ marginTop: 2, width: '50%' }}
      />
    </Box>
  );
};

export default Subjects;
