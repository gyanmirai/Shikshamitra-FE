import { useState } from 'react';

import { Box, Grid } from '@mui/material';

import subjectDocumentsData from 'src/json/academic/curriculum/subjectsDocuments.json';

import DocumentCard from 'src/components/preview-document/DocumentCard';

import type { ISubject } from '../type';

const documentsList = [
  {
    path: './lecture_notes.pdf',
    relativePath: './lecture_notes.pdf',
    name: 'Lecture Notes - Chapter 1',
    size: '2.5 MB',
    uploadDate: '2024-03-15',
    type: 'pdf',
    url: 'https://example.com/files/lecture_notes.pdf',
  },
  {
    path: './assignment_1.docx',
    relativePath: './assignment_1.docx',
    name: 'Assignment 1 - Introduction',
    size: '850 KB',
    uploadDate: '2024-03-14',
    type: 'doc',
    url: 'https://example.com/files/assignment_1.docx',
  },
  {
    path: './presentation.pptx',
    relativePath: './presentation.pptx',
    name: 'Course Overview Presentation',
    size: '4.2 MB',
    uploadDate: '2024-03-13',
    type: 'ppt',
    url: 'https://example.com/files/presentation.pptx',
  },
  {
    path: './grades.xlsx',
    relativePath: './grades.xlsx',
    name: 'Student Grades Tracker',
    size: '1.1 MB',
    uploadDate: '2024-03-12',
    type: 'xls',
    url: 'https://example.com/files/grades.xlsx',
  },
  {
    path: './course_image.png',
    relativePath: './course_image.png',
    name: 'Course Cover Image',
    size: '750 KB',
    uploadDate: '2024-03-11',
    type: 'image',
    url: 'https://example.com/files/course_image.png',
  },
];
// Documents panel content
const SubjectDocument = ({ subject }: { subject: ISubject | null }) => {
  // State to manage subject documents data
  const [subjectDocuments, setSubjectDocuments] = useState(subjectDocumentsData);
  return (
    // <Card sx={{ height: '100%' }}>
    //   <CardContent sx={{ p: 2 }}>
    <Box>
      <Grid container spacing={2}>
        {documentsList.map((doc: any, index: number) => (
          <Grid item xs={12} md={6} lg={4} key={index}>
            <DocumentCard file={doc} />
          </Grid>
        ))}
      </Grid>
    </Box>
    //   </CardContent>
    // </Card>
  );
};

export default SubjectDocument;
