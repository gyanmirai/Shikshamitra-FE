import { useState } from 'react';

import { Box, Grid } from '@mui/material';

import subjectDocumentsData from 'src/json/academic/curriculum/subjectsDocuments.json';
import { documentsList } from 'src/screens/academic/curriculum-management/subject/component/viewDetailComponents/subjectDocument';

import DocumentCard from 'src/components/preview-document/DocumentCard';

// Documents panel content
const ChapterDocuments = ({ documents }: { documents: File[] | undefined }) => {
  // State to manage subject documents data initialized with mock data from JSON
  const [subjectDocuments, setSubjectDocuments] = useState(subjectDocumentsData);

  return (
    <Box p={2}>
      <Grid container spacing={2}>
        {documentsList.map((doc: any, index: number) => (
          <Grid item xs={12} md={6} lg={4} key={index}>
            <DocumentCard file={doc} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default ChapterDocuments;
