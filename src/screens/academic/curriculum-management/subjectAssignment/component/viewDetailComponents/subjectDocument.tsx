import { Box, Grid } from '@mui/material';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import DocumentCard from 'src/components/preview-document/DocumentCard';
import { useGetSubjectAssignmentDocumentsQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Subject-AssignmentApi.ts/subject-assignment-api';

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
  const {
    data: _documents,
    isLoading: _isLoading,
    isFetching: _isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetSubjectAssignmentDocumentsQuery,
    params: { subjectAssignmentId: subject?.subjectAssignmentId, subjectId: subject?.id },
  });
  return (
    <Box>
      <Grid container spacing={2}>
        {documentsList.map((doc: any, index: number) => (
          <Grid size={{ xs: 12, md: 6, lg: 4 }} key={index}>
            <DocumentCard file={doc} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
export default SubjectDocument;
