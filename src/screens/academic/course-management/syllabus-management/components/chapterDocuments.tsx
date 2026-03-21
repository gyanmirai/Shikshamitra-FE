import { Box, Grid } from '@mui/material';
import DocumentCard from 'src/components/preview-document/DocumentCard';
import { documentsList } from 'src/screens/academic/curriculum-management/subject-assignment/component/view-detail-components/subjectDocument';

import type { IChapter } from '../type';

// Documents panel content
const ChapterDocuments = ({ chapter }: { chapter: IChapter | null }) => (
  <Box p={2}>
    <Grid container spacing={2}>
      {documentsList.map((doc: any, index: number) => (
        <Grid size={{ xs: 12, md: 6, lg: 4 }} key={index}>
          <DocumentCard file={doc} />
        </Grid>
      ))}
    </Grid>
  </Box>
);

export default ChapterDocuments;
