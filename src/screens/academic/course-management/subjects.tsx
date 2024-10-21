import React, { useState } from 'react';

import { GridExpandMoreIcon } from '@mui/x-data-grid';
import {
  Box,
  Card,
  Grid,
  Button,
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
import { Scrollbar } from 'src/components/scrollbar';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import { AppWidget } from './courseManagement';

interface SubjectData {
  subject: string;
  content: string;
  progress: number;
}

interface TableRow {
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

const Subjects = () => {
  const [expandedAccordion, setExpandedAccordion] = useState<string | false>(false);
  const theme = useTheme();
  const [subjectData, setSubjectData] = useState<SubjectData[]>(listData);

  const handleAccordionToggle = (subject: string) => {
    setExpandedAccordion((prev) => (prev === subject ? false : subject));
  };

  const subjectTableData: TableRow[] = [
    {
      subjectName: 'Math',
      courseAssociation: 'math for class 1',
      gradeLevel: '10',
      assignedTeacher: 'John Doe',
    },
    {
      subjectName: 'English',
      courseAssociation: 'English for class 2',
      gradeLevel: '10',
      assignedTeacher: 'Anuj Kapadia',
    },
    {
      subjectName: 'Science',
      courseAssociation: 'Science for class 3',
      gradeLevel: '10',
      assignedTeacher: 'Avinash Dave',
    },
    {
      subjectName: 'Physics',
      courseAssociation: 'Physics for class 3',
      gradeLevel: '10',
      assignedTeacher: 'Avinash Dave',
    },
    {
      subjectName: 'SS',
      courseAssociation: 'SS for class 3',
      gradeLevel: '10',
      assignedTeacher: 'Avinash Dave',
    },
    {
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
            render: (value: any, row: any) => (
              <Button onClick={() => handleAccordionToggle(value)}>{value}</Button>
            ),
          },
          { id: 'courseAssociation', label: 'Course Association' },
          { id: 'gradeLevel', label: 'Grade Level' },
          { id: 'assignedTeacher', label: 'Assigned Teacher' },
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
      <Typography variant="h6" marginBottom={1} marginTop={2}>
        Subject Details Modal
      </Typography>
      <Scrollbar sx={{ p: 2, height: '200px', borderRadius: 5 }}>
        {subjectData.map((item: SubjectData, index: number) => (
          <Accordion
            key={index}
            expanded={expandedAccordion === item.subject}
            onChange={() => handleAccordionToggle(item.subject)}
          >
            <AccordionSummary
              expandIcon={<GridExpandMoreIcon />}
              aria-controls={`panel${index + 1}-content`}
              id={`panel${index + 1}-header`}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Typography sx={{ flexGrow: 1 }}>{item.subject}</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>{item.content}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Scrollbar>

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
