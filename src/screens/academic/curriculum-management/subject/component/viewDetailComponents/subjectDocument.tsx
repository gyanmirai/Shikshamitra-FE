import { useState } from 'react';

import { Box, Grid } from '@mui/material';

import subjectDocumentsData from 'src/json/academic/curriculum/subjectsDocuments.json';

import DocumentCard from 'src/components/preview-document/DocumentCard';

import type { ISubjectDetail } from '../type';

export const documentsList = [
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
    path: './study_guide.pdf',
    relativePath: './study_guide.pdf',
    name: 'Complete Study Guide',
    size: '3.2 MB',
    uploadDate: '2024-03-13',
    type: 'pdf',
    url: 'https://example.com/files/study_guide.pdf',
  },
  {
    path: './course_outline.docx',
    relativePath: './course_outline.docx',
    name: 'Detailed Course Outline',
    size: '1.1 MB',
    uploadDate: '2024-03-12',
    type: 'doc',
    url: 'https://example.com/files/course_outline.docx',
  },
];
// Documents panel content
const SubjectDocument = ({ subject }: { subject: ISubjectDetail | null }) => {
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
